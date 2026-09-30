import { useNuxtApp } from '#app'

// A hospital's API credentials for external integrations (FieldMatch).
// Held in core-service; hmis-manage proxies them at
// /v1/platform/hospitals/{id}/api-credentials. app_secret is only ever present
// on the create and rotate responses.
export interface ApiCredential {
  name: string
  app_id: string
  organization_id: number
  permissions: string[]
  is_active: boolean
  last_used_at: string | null
  created_at: string | null
}

export interface IssuedApiCredential extends ApiCredential {
  app_secret: string
}

export function useApiCredentialsApi() {
  const { $axios } = useNuxtApp()
  const base = (hospitalId: string) => `/v1/platform/hospitals/${hospitalId}/api-credentials`

  async function list(hospitalId: string): Promise<{ data: ApiCredential[]; issuable_permissions: string[] }> {
    const { data } = await $axios.get(base(hospitalId))
    return data
  }

  async function create(hospitalId: string, payload: { name: string; permissions: string[] }): Promise<IssuedApiCredential> {
    const { data } = await $axios.post(base(hospitalId), payload)
    return data.data
  }

  async function rotate(hospitalId: string, appId: string): Promise<IssuedApiCredential> {
    const { data } = await $axios.post(`${base(hospitalId)}/${encodeURIComponent(appId)}/rotate`)
    return data.data
  }

  async function setActive(hospitalId: string, appId: string, isActive: boolean): Promise<ApiCredential> {
    const { data } = await $axios.patch(`${base(hospitalId)}/${encodeURIComponent(appId)}`, { is_active: isActive })
    return data.data
  }

  return { list, create, rotate, setActive }
}
