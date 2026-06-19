import { useNuxtApp } from '#app'
import type {
  IssueTokenRequest,
  IssueTokenResponse,
  TenantContext,
  TenantContextResponse,
} from '~/types/tenancy'

/**
 * Thin wrapper around the two real backend endpoints.
 * The injected $axios instance already sets baseURL (=> /api) and the
 * Bearer token from the `auth_token` cookie (see plugins/axios.ts).
 */
export function useTenancyApi() {
  const { $axios } = useNuxtApp()

  async function issueToken(payload: IssueTokenRequest): Promise<IssueTokenResponse['data']> {
    const { data } = await $axios.post<IssueTokenResponse>('/v1/platform/auth/tokens', payload)
    return data.data
  }

  async function fetchTenantContext(): Promise<TenantContext> {
    const { data } = await $axios.get<TenantContextResponse>('/v1/platform/tenant-context')
    return data.data.tenant_context
  }

  return { issueToken, fetchTenantContext }
}
