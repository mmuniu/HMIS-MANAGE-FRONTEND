import { useNuxtApp } from '#app'

// A hospital's FieldMatch sign-in (username + password). Held in core-service;
// hmis-manage proxies it at /v1/platform/hospitals/{id}/api-credentials.
// Signing in to FieldMatch with it yields a bearer token for this hospital's
// API — no app secret is ever exposed. login_password is only present on the
// create and reset-password responses.
export interface ApiCredential {
  name: string
  app_id: string
  organization_id: number
  permissions: string[]
  login_username: string | null
  is_active: boolean
  last_used_at: string | null
  created_at: string | null
}

export interface IssuedApiCredential extends ApiCredential {
  login_password: string
}

export function useApiCredentialsApi() {
  const { $axios } = useNuxtApp()
  const base = (hospitalId: string) => `/v1/platform/hospitals/${hospitalId}/api-credentials`

  async function list(hospitalId: string): Promise<{ data: ApiCredential[]; issuable_permissions: string[] }> {
    const { data } = await $axios.get(base(hospitalId))
    return data
  }

  async function create(hospitalId: string, payload: { name: string; permissions: string[]; login_username?: string }): Promise<IssuedApiCredential> {
    const { data } = await $axios.post(base(hospitalId), payload)
    return data.data
  }

  async function resetPassword(hospitalId: string, appId: string): Promise<IssuedApiCredential> {
    const { data } = await $axios.post(`${base(hospitalId)}/${encodeURIComponent(appId)}/reset-password`)
    return data.data
  }

  async function setActive(hospitalId: string, appId: string, isActive: boolean): Promise<ApiCredential> {
    const { data } = await $axios.patch(`${base(hospitalId)}/${encodeURIComponent(appId)}`, { is_active: isActive })
    return data.data
  }

  return { list, create, resetPassword, setActive }
}
