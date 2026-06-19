import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp, useCookie } from '#app'
import { useTenancyApi } from '~/composables/useTenancyApi'
import { useTenantStore } from '~/stores/tenant'
import { tenancyErrorMessage } from '~/types/tenancy'

/**
 * Auth against the HMIS tenant-management backend.
 *
 * Unlike a classic email/password login, the backend issues a token that is
 * SCOPED to one organization + one active facility, so those are required at
 * sign-in time. The token is a Sanctum Bearer token carried in the
 * `auth_token` cookie (read by plugins/axios.ts).
 *
 * The backend has no register / logout / refresh endpoints, so:
 *  - there is no register()
 *  - logout() is client-side only (clears the cookie; the token is not revoked server-side)
 */
export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const { $axios, $showToast } = useNuxtApp()
  const { issueToken } = useTenancyApi()

  const token = useCookie<string | null>('auth_token', { sameSite: 'lax', path: '/', httpOnly: false })
  const apiError = ref('')
  const submitting = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  const applyToken = (t: string | null) => {
    if (t) $axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
    else delete $axios.defaults.headers.common['Authorization']
  }

  applyToken(token.value)
  watch(token, (val) => applyToken(val), { immediate: true })

  /**
   * Sign in to a specific organization + facility scope.
   */
  const login = async (values: {
    email: string
    password: string
    organization_id: string
    active_facility_id: string
    token_name?: string
  }) => {
    apiError.value = ''
    submitting.value = true
    try {
      const data = await issueToken({
        email: values.email,
        password: values.password,
        organization_id: values.organization_id,
        active_facility_id: values.active_facility_id,
        token_name: values.token_name || 'hmis-web',
      })

      token.value = data.access_token
      applyToken(data.access_token)

      const tenant = useTenantStore()
      tenant.lastEmail = values.email
      await tenant.loadContext()

      $showToast('Signed in successfully!')
      await router.push('/dashboard')
      return true
    } catch (err: any) {
      const code = err?.response?.data?.code
      apiError.value = tenancyErrorMessage(
        code,
        err?.response?.data?.message || 'Sign in failed. Please try again.',
      )
      $showToast(apiError.value)
      return false
    } finally {
      submitting.value = false
    }
  }

  /**
   * Re-issue a token for the same organization but a different active facility.
   * Requires the password again because the backend has no "set active facility" endpoint.
   */
  const switchFacility = async (facilityId: string, password: string) => {
    const tenant = useTenantStore()
    if (!tenant.organizationId) return false
    apiError.value = ''
    submitting.value = true
    try {
      const data = await issueToken({
        email: (tenant.lastEmail as string) || '',
        password,
        organization_id: tenant.organizationId,
        active_facility_id: facilityId,
        token_name: 'hmis-web',
      })
      token.value = data.access_token
      applyToken(data.access_token)
      await tenant.loadContext()
      $showToast(`Switched to facility ${facilityId}.`)
      return true
    } catch (err: any) {
      const code = err?.response?.data?.code
      apiError.value = tenancyErrorMessage(code, 'Could not switch facility.')
      $showToast(apiError.value)
      return false
    } finally {
      submitting.value = false
    }
  }

  const logout = async () => {
    token.value = null
    applyToken(null)
    useTenantStore().clear()
    $showToast('Logged out.')
    await router.push('/auth/login')
  }

  return {
    token,
    apiError,
    submitting,
    isAuthenticated,
    login,
    switchFacility,
    logout,
  }
})
