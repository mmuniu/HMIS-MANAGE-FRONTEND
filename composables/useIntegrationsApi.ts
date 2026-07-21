import { useNuxtApp } from '#app'

export interface RequiredField { key: string; label: string; type: string }
export interface Integration {
  id: string; name: string; category: string; description: string | null
  required_fields: RequiredField[]; is_active: boolean
}
export interface TenantIntegration extends Integration {
  tenant: { status: string; config: Record<string, string>; connected_at: string | null } | null
}

export function useIntegrationsApi() {
  const { $axios } = useNuxtApp()

  async function list(): Promise<Integration[]> {
    const { data } = await $axios.get('/v1/platform/integrations')
    return data.data
  }

  async function create(payload: Partial<Integration>) {
    const { data } = await $axios.post('/v1/platform/integrations', payload)
    return data.data
  }

  async function update(id: string, payload: Partial<Integration>) {
    const { data } = await $axios.patch(`/v1/platform/integrations/${id}`, payload)
    return data.data
  }

  async function destroy(id: string) {
    await $axios.delete(`/v1/platform/integrations/${id}`)
  }

  async function tenantList(orgId: string): Promise<TenantIntegration[]> {
    const { data } = await $axios.get(`/v1/platform/hospitals/${orgId}/integrations`)
    return data.data
  }

  async function tenantConnect(orgId: string, integrationId: string, config: Record<string, string>) {
    const { data } = await $axios.post(`/v1/platform/hospitals/${orgId}/integrations/${integrationId}`, { config })
    return data.data
  }

  async function tenantDisconnect(orgId: string, integrationId: string) {
    await $axios.delete(`/v1/platform/hospitals/${orgId}/integrations/${integrationId}`)
  }

  return { list, create, update, destroy, tenantList, tenantConnect, tenantDisconnect }
}
