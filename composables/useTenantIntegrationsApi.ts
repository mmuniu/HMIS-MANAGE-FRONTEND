import { useNuxtApp } from '#app'
import type { RequiredField } from '@/composables/useIntegrationsApi'

// One KEY=value variable of an environment. Secret values are never sent
// back — only whether one is stored (`is_set`).
export interface EnvVariable {
  key: string
  value: string | null
  secret: boolean
  is_set: boolean
}

export interface TenantEnvironment {
  code: string // production | sandbox | test | …
  name: string
  base_url: string
  is_active: boolean
  // false for environments written elsewhere (e.g. hmis-manage's own
  // connection mirror) — shown read-only, every value hidden.
  editable: boolean
  updated_at: string | null
  variables: EnvVariable[]
}

// A tenant's integration as stored in the V3 integration-service.
export interface TenantIntegrationV3 {
  code: string
  name: string
  provider: string
  status: string
  is_active: boolean
  environments: TenantEnvironment[]
}

// A platform integration type that can be added to a tenant.
export interface CatalogIntegration {
  id: string
  name: string
  category: string
  description: string | null
  required_fields: RequiredField[]
}

export interface SaveEnvironmentPayload {
  name: string
  provider?: string
  environment_name?: string
  base_url?: string
  is_active?: boolean
  // The environment's full set — keys left out are removed; a blank secret keeps its stored value.
  variables: Record<string, string>
  secret_keys: string[]
}

/**
 * Tenant integrations in the V3 integration-service, through hmis-manage
 * (which checks access and signs the calls). Keyed by the tenant's
 * core-service organization id.
 *   GET    /v1/platform/tenant-integrations/{coreOrgId}
 *   PUT    /v1/platform/tenant-integrations/{coreOrgId}/{code}/environments/{env}
 *   DELETE /v1/platform/tenant-integrations/{coreOrgId}/{code}/environments/{env}
 */
export function useTenantIntegrationsApi() {
  const { $axios } = useNuxtApp()

  async function list(coreOrgId: string): Promise<{ data: TenantIntegrationV3[]; catalog: CatalogIntegration[] }> {
    const { data } = await $axios.get(`/v1/platform/tenant-integrations/${encodeURIComponent(coreOrgId)}`)
    return { data: data.data ?? [], catalog: data.catalog ?? [] }
  }

  async function saveEnvironment(coreOrgId: string, code: string, env: string, payload: SaveEnvironmentPayload): Promise<TenantEnvironment> {
    const { data } = await $axios.put(
      `/v1/platform/tenant-integrations/${encodeURIComponent(coreOrgId)}/${encodeURIComponent(code)}/environments/${encodeURIComponent(env)}`,
      payload,
    )
    return data.data
  }

  async function removeEnvironment(coreOrgId: string, code: string, env: string): Promise<void> {
    await $axios.delete(
      `/v1/platform/tenant-integrations/${encodeURIComponent(coreOrgId)}/${encodeURIComponent(code)}/environments/${encodeURIComponent(env)}`,
    )
  }

  return { list, saveEnvironment, removeEnvironment }
}
