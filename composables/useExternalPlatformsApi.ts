import { useNuxtApp } from '#app'

// The other platforms this console is integrated to, on their own — nothing
// here belongs to a hospital (those are useIntegrationsApi's). System admin only.

export type FieldType = 'string' | 'secret' | 'url' | 'number'
export interface ConfigField { key: string; label: string; type: FieldType }

export type ProcessDirection = 'outbound' | 'inbound' | 'both'
// One process the integration is meant to cover.
export interface PlatformProcess {
  id: number
  name: string
  description: string | null
  direction: ProcessDirection
  // The gateway operation it switches on (e.g. "patients.register"), if any.
  operation: string | null
  is_enabled: boolean
}

// A gateway operation a process can stand for (integration-service's catalogue).
export interface GatewayOperation { operation: string; description: string }

// A platform as the list page shows it.
export interface ExternalPlatformSummary {
  id: string
  // The system (v3 stack) it is integrated to — chosen when it is added.
  v3_target: string
  v3_target_label: string
  name: string
  category: string
  description: string | null
  is_active: boolean
  // Every defined field has a value.
  is_configured: boolean
  fields_count: number
  missing_count: number
  configured_at: string | null
  processes_count: number
  enabled_processes_count: number
}

// A platform on its own page: its configuration and its processes.
export interface ExternalPlatform extends ExternalPlatformSummary {
  config_fields: ConfigField[]
  // Non-secret values only; secret values never reach the browser.
  config: Record<string, string>
  secrets_set: string[]
  missing: string[]
  processes: PlatformProcess[]
  created_at: string | null
  updated_at: string | null
}

// Whether a change reached integration-service, which holds the platform's
// way in (credentials, tokens, tenants) and logs its requests.
export interface SyncResult { synced: boolean; error: string | null }

// A platform as a save returns it, with the push to integration-service.
export type SavedPlatform = ExternalPlatform & { integration_service?: SyncResult | null }

// Client credentials the platform swaps for short-lived access tokens.
// The secret is never listed; only its last characters.
export interface PlatformClient {
  client_id: string
  name: string | null
  secret_hint: string
  is_active: boolean
  active_tokens: number
  last_used_at: string | null
  revoked_at: string | null
  created_at: string | null
}

// Credentials just issued: the only time the secret is shown.
export interface IssuedClient extends PlatformClient {
  client_secret: string
  token_url: string
  token_ttl_minutes: number
}

export type TenantStatus = 'pending' | 'active' | 'suspended'

// One of the platform's own tenants, mapped to a hospital here.
export interface PlatformTenant {
  tenant_id: string
  name: string | null
  organization_id: number | null
  facility_id: number | null
  status: TenantStatus
  // Requests can act for it: active, with its system user set up in core.
  ready: boolean
  system_user_error: string | null
  updated_at: string | null
  hospital: { id: string; name: string } | null
  facility: { id: string; name: string } | null
}

export interface TenantPayload {
  name: string | null
  hospital_id: string | null
  // One of the hospital's facilities; null = its only facility.
  facility_id: string | null
  status: TenantStatus
}

// One request the platform made (no bodies are kept).
export interface PlatformRequest {
  id: number
  at: string | null
  tenant_id: string | null
  organization_id: number | null
  method: string
  path: string
  operation: string | null
  status: number
  duration_ms: number
  correlation_id: string | null
  error: string | null
  hospital: { id: string; name: string } | null
}

export interface RequestFilters {
  from?: string | null
  to?: string | null
  tenant?: string | null
  operation?: string | null
  outcome?: 'ok' | 'error' | null
  page?: number
  per_page?: number
}

export interface RequestsPage {
  data: PlatformRequest[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    summary: { total: number; errors: number; avg_duration_ms: number | null }
  }
}

export interface PlatformDetailsPayload {
  id?: string
  // Only when adding: the system it is integrated to (left out = the default one).
  v3_target?: string
  name: string
  category: string
  description: string | null
  is_active: boolean
}

export interface ProcessPayload {
  name?: string
  description?: string | null
  direction?: ProcessDirection
  operation?: string | null
  is_enabled?: boolean
}

export function useExternalPlatformsApi() {
  const { $axios } = useNuxtApp()
  const base = '/v1/platform/external-platforms'

  async function list(): Promise<ExternalPlatformSummary[]> {
    const { data } = await $axios.get(base)
    return data.data
  }

  async function get(id: string): Promise<ExternalPlatform> {
    const { data } = await $axios.get(`${base}/${id}`)
    return data.data
  }

  // Adding a platform, or changing its name or on/off switch, pushes it to
  // integration-service: integration_service says whether that worked.
  async function create(payload: PlatformDetailsPayload): Promise<SavedPlatform> {
    const { data } = await $axios.post(base, payload)
    return { ...data.data, integration_service: data.integration_service ?? null }
  }

  async function updateDetails(id: string, payload: Partial<PlatformDetailsPayload>): Promise<SavedPlatform> {
    const { data } = await $axios.patch(`${base}/${id}`, payload)
    return { ...data.data, integration_service: data.integration_service ?? null }
  }

  // The gateway operations a process can switch on, in one system's
  // integration-service (the platform's).
  async function operations(system?: string): Promise<GatewayOperation[]> {
    const { data } = await $axios.get(`${base}/operations`, { params: system ? { system } : {} })
    return data.data
  }

  // Push the platform to integration-service again.
  async function sync(id: string): Promise<SyncResult> {
    const { data } = await $axios.post(`${base}/${id}/sync`)
    return data.integration_service
  }

  async function clients(id: string): Promise<PlatformClient[]> {
    const { data } = await $axios.get(`${base}/${id}/clients`)
    return data.data
  }

  async function issueClient(id: string, name: string | null): Promise<IssuedClient> {
    const { data } = await $axios.post(`${base}/${id}/clients`, { name })
    return data.data
  }

  async function revokeClient(id: string, clientId: string): Promise<PlatformClient> {
    const { data } = await $axios.delete(`${base}/${id}/clients/${encodeURIComponent(clientId)}`)
    return data.data
  }

  async function tenants(id: string): Promise<PlatformTenant[]> {
    const { data } = await $axios.get(`${base}/${id}/tenants`)
    return data.data
  }

  async function saveTenant(id: string, tenantId: string, payload: TenantPayload): Promise<PlatformTenant> {
    const { data } = await $axios.put(`${base}/${id}/tenants/${encodeURIComponent(tenantId)}`, payload)
    return data.data
  }

  async function removeTenant(id: string, tenantId: string) {
    await $axios.delete(`${base}/${id}/tenants/${encodeURIComponent(tenantId)}`)
  }

  async function requests(id: string, filters: RequestFilters = {}): Promise<RequestsPage> {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== ''))
    const { data } = await $axios.get(`${base}/${id}/requests`, { params })
    return data
  }

  // Replace the list of fields the configuration is made of. A removed
  // field's value is dropped with it.
  async function saveFields(id: string, config_fields: ConfigField[]): Promise<ExternalPlatform> {
    const { data } = await $axios.patch(`${base}/${id}`, { config_fields })
    return data.data
  }

  // Save the fields' values. A blank secret keeps the stored one.
  async function saveConfig(id: string, config: Record<string, string>): Promise<ExternalPlatform> {
    const { data } = await $axios.patch(`${base}/${id}`, { config })
    return data.data
  }

  async function destroy(id: string) {
    await $axios.delete(`${base}/${id}`)
  }

  // Each process call returns the platform as it now stands.
  async function addProcess(id: string, payload: ProcessPayload): Promise<ExternalPlatform> {
    const { data } = await $axios.post(`${base}/${id}/processes`, payload)
    return data.data
  }

  async function updateProcess(id: string, processId: number, payload: ProcessPayload): Promise<ExternalPlatform> {
    const { data } = await $axios.patch(`${base}/${id}/processes/${processId}`, payload)
    return data.data
  }

  async function removeProcess(id: string, processId: number): Promise<ExternalPlatform> {
    const { data } = await $axios.delete(`${base}/${id}/processes/${processId}`)
    return data.data
  }

  return {
    list, get, create, updateDetails, saveFields, saveConfig, destroy, addProcess, updateProcess, removeProcess,
    operations, sync, clients, issueClient, revokeClient, tenants, saveTenant, removeTenant, requests,
  }
}
