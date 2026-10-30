import type { ShaClaimListResponse, ShaClaimQuery, ShaOverview } from '~/types/shaClaim'

/**
 * The SHA Claims monitor's two reads. Both are system-admin only and proxy
 * patient-evaluation-service, which owns the claims; manage only attaches the
 * facility and hospital names.
 */
export function useShaClaimsApi() {
  const { $axios } = useNuxtApp()

  async function overview(): Promise<ShaOverview> {
    const { data } = await $axios.get('/v1/platform/sha-claims/overview')
    return data.data
  }

  async function claims(query: ShaClaimQuery = {}): Promise<ShaClaimListResponse> {
    const params: Record<string, string | number | boolean> = {}
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') params[key] = value as string | number | boolean
    }
    const { data } = await $axios.get<ShaClaimListResponse>('/v1/platform/sha-claims/claims', { params })
    return data
  }

  return { overview, claims }
}
