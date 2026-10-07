import { useNuxtApp } from '#app'

export interface RequiredField { key: string; label: string; type: string }
// One integration type plus its single master connection (set on /integrations).
export interface Integration {
  id: string; name: string; category: string; description: string | null
  required_fields: RequiredField[]; is_active: boolean
  is_configured: boolean
  configured_at?: string | null
  linked_hospitals?: number
  // System admins only: the master's non-secret values, and which secrets are
  // stored (secret values themselves are never sent to the browser).
  config?: Record<string, string>
  secrets_set?: string[]
}
// A hospital's link to the master connection — no values of its own.
export interface TenantIntegration extends Integration {
  tenant: { status: string; connected_at: string | null } | null
}
// Result of pushing a changed master to integration-service for every linked hospital.
export interface MasterSyncSummary {
  attempted: number
  synced: number
  failed: { organization_id: string; error: string | null }[]
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

  // Set the master connection's values. A blank secret keeps the stored one.
  async function configure(id: string, config: Record<string, string>): Promise<{ data: Integration; integration_service: MasterSyncSummary | null }> {
    const { data } = await $axios.patch(`/v1/platform/integrations/${id}`, { config })
    return data
  }

  async function destroy(id: string) {
    await $axios.delete(`/v1/platform/integrations/${id}`)
  }

  async function tenantList(orgId: string): Promise<TenantIntegration[]> {
    const { data } = await $axios.get(`/v1/platform/hospitals/${orgId}/integrations`)
    return data.data
  }

  // Link a hospital to the integration's master connection (no values of its own).
  async function tenantConnect(orgId: string, integrationId: string) {
    const { data } = await $axios.post(`/v1/platform/hospitals/${orgId}/integrations/${integrationId}`)
    return data.data
  }

  async function tenantDisconnect(orgId: string, integrationId: string) {
    await $axios.delete(`/v1/platform/hospitals/${orgId}/integrations/${integrationId}`)
  }

  return { list, create, update, configure, destroy, tenantList, tenantConnect, tenantDisconnect }
}
