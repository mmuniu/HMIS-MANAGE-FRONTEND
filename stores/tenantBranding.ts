import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTenantBrandingApi } from '~/composables/useTenantBrandingApi'
import type { TenantBranding } from '~/types/tenantBranding'

export const useTenantBrandingStore = defineStore('tenantBranding', () => {
  const api = useTenantBrandingApi()

  const branding = ref<TenantBranding | null>(null)
  const resolved = ref(false)

  // Resolves once per app load — the login page is the only place that
  // reads this today, and the hostname doesn't change mid-session.
  async function resolveFromHost() {
    if (resolved.value) return
    try {
      const res = await api.resolve(window.location.hostname)
      branding.value = res.data
    } catch {
      // Unknown host, or the endpoint is unreachable — fall back to generic
      // platform branding rather than blocking the login page.
      branding.value = null
    } finally {
      resolved.value = true
    }
  }

  return { branding, resolved, resolveFromHost }
})
