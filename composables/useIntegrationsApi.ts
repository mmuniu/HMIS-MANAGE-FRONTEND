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
// One defined field as a hospital sees it: set by the master connection
// (value never shown), by this hospital, or still missing.
export interface TenantField {
  key: string; label: string; type: string
  source: 'master' | 'hospital' | 'missing'
  value: string | null // the hospital's own non-secret value
  is_set: boolean
}
// An integration this hospital has added.
export interface TenantIntegration {
  id: string; name: string; category: string; description: string | null
  fields: TenantField[]
  // Extra KEY=value pairs the hospital added beyond the defined fields (.env style).
  variables: Record<string, string>
  missing: string[] // keys of fields nobody has filled yet
  tenant: { status: string; connected_at: string | null }
}
// An integration the hospital can still add.
export interface AvailableIntegration {
  id: string; name: string; category: string; description: string | null
  fields: TenantField[]
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

  // The hospital's own integrations, plus the ones it can still add.
  async function tenantList(orgId: string): Promise<{ data: TenantIntegration[]; available: AvailableIntegration[] }> {
    const { data } = await $axios.get(`/v1/platform/hospitals/${orgId}/integrations`)
    return { data: data.data, available: data.available ?? [] }
  }

  // Add an integration to the hospital, or update its values: fields the
  // master leaves empty plus extra variables. The whole set is sent each
  // time; a blank secret keeps the stored one.
  async function tenantConnect(orgId: string, integrationId: string, config: Record<string, string> = {}) {
    const { data } = await $axios.post(`/v1/platform/hospitals/${orgId}/integrations/${integrationId}`, { config })
    return data.data
  }

  async function tenantDisconnect(orgId: string, integrationId: string) {
    await $axios.delete(`/v1/platform/hospitals/${orgId}/integrations/${integrationId}`)
  }

  return { list, create, update, configure, destroy, tenantList, tenantConnect, tenantDisconnect }
}
