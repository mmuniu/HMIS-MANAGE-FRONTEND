import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCookie } from '#app'
import { useTenancyApi } from '~/composables/useTenancyApi'
import type { TenantContext } from '~/types/tenancy'

/**
 * Holds the tenant scope of the current session, resolved from the backend
 * `GET /v1/platform/tenant-context` endpoint (the signed token claims).
 *
 * Note on facility switching: the backend only issues tenant-scoped tokens via
 * `POST /v1/platform/auth/tokens`, which requires the password. There is no
 * "set active facility" endpoint, so switching the active facility re-issues a
 * token and therefore needs the password re-confirmed (handled in the UI).
 */
export const useTenantStore = defineStore('tenant', () => {
  const { fetchTenantContext } = useTenancyApi()

  const context = ref<TenantContext | null>(null)
  const loading = ref(false)
  const lastError = ref('')

  // Remember the email used at login so the facility switcher can pre-fill it.
  const lastEmail = useCookie<string | null>('hmis_last_email', { sameSite: 'lax', path: '/' })

  const organizationId = computed(() => context.value?.organization_id ?? null)
  const activeFacilityId = computed(() => context.value?.active_facility_id ?? null)
  const allowedFacilityIds = computed(() => context.value?.allowed_facility_ids ?? [])
  const requestId = computed(() => context.value?.request_id ?? null)
  const hasContext = computed(() => !!context.value)

  /** Resolve and cache the tenant context for the current token. */
  async function loadContext(): Promise<TenantContext | null> {
    loading.value = true
    lastError.value = ''
    try {
      context.value = await fetchTenantContext()
      return context.value
    } catch (err: any) {
      lastError.value = err?.response?.data?.code || 'TENANT_CONTEXT_FAILED'
      context.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  function clear() {
    context.value = null
    lastError.value = ''
  }

  return {
    context,
    loading,
    lastError,
    lastEmail,
    organizationId,
    activeFacilityId,
    allowedFacilityIds,
    requestId,
    hasContext,
    loadContext,
    clear,
  }
})
