import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp, useCookie } from '#app'
import { useTenantStore } from '~/stores/tenant'
import { tenancyErrorMessage } from '~/types/tenancy'

export interface LoginFacility {
  id: string
  name: string
  organization_id: string
  organization_name: string
}

export interface AuthUser {
  id: number
  name: string
  email: string
  platform_role: string | null
  roles: string[]
  permissions: string[]
}

/**
 * Two-step authentication against the HMIS backend:
 *   Step 1: POST /login {email, password, step:1}  -> facilities to choose from
 *   Step 2: POST /login {email, password, step:2, facility_id} -> token + session
 *
 * Backend has /logout (revokes token) and /user (current user).
 */
export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const { $axios, $showToast } = useNuxtApp()

  const cookieOpts = { sameSite: 'lax' as const, path: '/', httpOnly: false }

  const token = useCookie<string | null>('auth_token', cookieOpts)
  const user = ref<AuthUser | null>(null)
  const apiError = ref('')

  // Step-1 -> Step-2 transient state.
  const step = ref<'idle' | 'facility'>('idle')
  const facilities = ref<LoginFacility[]>([])
  const organization = ref<{ id: string | null; name: string; logo: string | null } | null>(null)
  const pendingCredentials = ref<{ username: string; password: string } | null>(null)
  const isSelectingFacility = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const roles = computed(() => user.value?.roles ?? [])

  // Platform account type (system_admin/developer/tester/qa) or null for tenant users.
  const platformRole = computed(() => user.value?.platform_role ?? null)
  // System admin = top-level superuser with access to everything.
  const isSystemAdmin = computed(() => platformRole.value === 'system_admin')
  const isDeveloper = computed(() => platformRole.value === 'developer')
  const isTester = computed(() => platformRole.value === 'tester')
  // QA = run-only tester: works with existing tests but cannot author them.
  const isQa = computed(() => platformRole.value === 'qa')
  const isPlatformUser = computed(
    () => isSystemAdmin.value || isDeveloper.value || isTester.value || isQa.value,
  )
  // Hospital admin: driven by the real tenant role_key returned in user.roles.
  const isHospitalAdmin = computed(
    () => !isPlatformUser.value && roles.value.includes('hospital_admin'),
  )
  // Anyone with cross-tenant "sees everything" access.
  const isSuperAccess = computed(() => isSystemAdmin.value || isDeveloper.value)
  // Who may create/edit/delete/upload test cases (QA excluded; system admin allowed).
  const canAuthorTests = computed(() => isSystemAdmin.value || isDeveloper.value || isTester.value)

  const applyToken = (t: string | null) => {
    if (t) $axios.defaults.headers.common['Authorization'] = `Bearer ${t}`
    else delete $axios.defaults.headers.common['Authorization']
  }
  applyToken(token.value)
  watch(token, (val) => applyToken(val), { immediate: true })

  const resetLoginState = () => {
    step.value = 'idle'
    facilities.value = []
    organization.value = null
    pendingCredentials.value = null
    isSelectingFacility.value = false
  }

  // ── Step 1: credentials -> facility list ──────────────────────────────
  const login = async (values: { username: string; password: string }) => {
    apiError.value = ''
    try {
      const { data } = await $axios.post('/v1/platform/login', {
        username: values.username,
        password: values.password,
        step: 1,
      })

      // Platform users (developer/tester) sign in directly — the backend skips
      // facility selection and returns a token immediately.
      if (data.access_token) {
        token.value = data.access_token
        applyToken(data.access_token)
        user.value = data.user
        resetLoginState()
        $showToast('Signed in successfully!')
        await router.push('/dashboard')
        return { success: true, platformRole: data.platform_role ?? null }
      }

      if (data.step === 2) {
        step.value = 'facility'
        facilities.value = data.facilities || []
        organization.value = data.organization || null
        pendingCredentials.value = values
        return { requiresFacilitySelection: true }
      }

      // (Backend returns either a token or step 2; this branch is a safety net.)
      return { success: true }
    } catch (err: any) {
      apiError.value = tenancyErrorMessage(
        err?.response?.data?.code,
        err?.response?.data?.message || 'Login failed.',
      )
      $showToast(apiError.value)
      return { error: apiError.value }
    }
  }

  // ── Step 2: choose facility -> issue token ────────────────────────────
  const selectFacilityAndLogin = async (facilityId: string) => {
    apiError.value = ''
    if (!pendingCredentials.value) {
      apiError.value = 'Session expired. Please login again.'
      $showToast(apiError.value)
      resetLoginState()
      return { error: apiError.value }
    }

    isSelectingFacility.value = true
    try {
      const { data } = await $axios.post('/v1/platform/login', {
        username: pendingCredentials.value.username,
        password: pendingCredentials.value.password,
        step: 2,
        facility_id: facilityId,
      })

      token.value = data.access_token
      applyToken(data.access_token)
      user.value = data.user

      // Hydrate the tenant store for the rest of the app.
      const tenant = useTenantStore()
      tenant.lastEmail = data.user?.email ?? pendingCredentials.value.username
      await tenant.loadContext()

      resetLoginState()
      $showToast('Signed in successfully!')
      await router.push('/dashboard')
      return { success: true }
    } catch (err: any) {
      isSelectingFacility.value = false
      apiError.value = tenancyErrorMessage(
        err?.response?.data?.code,
        err?.response?.data?.message || 'Facility selection failed.',
      )
      $showToast(apiError.value)
      return { error: apiError.value }
    }
  }

  const cancelFacilitySelection = () => resetLoginState()

  // ── In-session facility switch (no password) ──────────────────────────
  const isSwitchingFacility = ref(false)
  const switchFacility = async (facilityId: string) => {
    apiError.value = ''
    isSwitchingFacility.value = true
    try {
      const { data } = await $axios.post('/v1/platform/switch-facility', {
        facility_id: facilityId,
      })

      token.value = data.access_token
      applyToken(data.access_token)

      // Refresh the tenant context so names/active facility reflect the switch.
      await useTenantStore().loadContext()

      $showToast(`Switched to ${data.facility?.name ?? 'facility'}.`)
      return { success: true }
    } catch (err: any) {
      apiError.value = tenancyErrorMessage(
        err?.response?.data?.code,
        err?.response?.data?.message || 'Could not switch facility.',
      )
      $showToast(apiError.value)
      return { error: apiError.value }
    } finally {
      isSwitchingFacility.value = false
    }
  }

  const logout = async () => {
    try {
      await $axios.post('/v1/platform/logout')
    } catch {
      // proceed regardless — token may already be invalid
    } finally {
      token.value = null
      applyToken(null)
      user.value = null
      resetLoginState()
      useTenantStore().clear()
      $showToast('Logged out.')
      await router.push('/auth/login')
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const { data } = await $axios.get('/v1/platform/user')
      user.value = data.data
      return user.value
    } catch {
      return null
    }
  }

  const hasRole = (r: string) => roles.value.includes(r)

  return {
    token,
    user,
    apiError,
    step,
    facilities,
    organization,
    isSelectingFacility,
    isSwitchingFacility,
    isAuthenticated,
    roles,
    platformRole,
    isSystemAdmin,
    isDeveloper,
    isTester,
    isQa,
    isPlatformUser,
    isHospitalAdmin,
    isSuperAccess,
    canAuthorTests,
    login,
    selectFacilityAndLogin,
    cancelFacilitySelection,
    switchFacility,
    logout,
    fetchCurrentUser,
    hasRole,
  }
})
