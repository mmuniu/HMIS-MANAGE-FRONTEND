import { useNuxtApp } from '#app'
import type { TenantBrandingResponse } from '~/types/tenantBranding'

/**
 * Resolves a hospital's public branding (name) from the Host the app was
 * loaded on.
 * Backend: GET /v1/platform/tenant-branding?host=...
 */
export function useTenantBrandingApi() {
  const { $axios } = useNuxtApp()

  async function resolve(host: string): Promise<TenantBrandingResponse> {
    const { data } = await $axios.get<TenantBrandingResponse>('/v1/platform/tenant-branding', {
      params: { host },
    })
    return data
  }

  return { resolve }
}
