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
  is_enabled: boolean
}

// A platform as the list page shows it.
export interface ExternalPlatformSummary {
  id: string
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

export interface PlatformDetailsPayload {
  id?: string
  name: string
  category: string
  description: string | null
  is_active: boolean
}

export interface ProcessPayload {
  name?: string
  description?: string | null
  direction?: ProcessDirection
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

  async function create(payload: PlatformDetailsPayload): Promise<ExternalPlatform> {
    const { data } = await $axios.post(base, payload)
    return data.data
  }

  async function updateDetails(id: string, payload: Partial<PlatformDetailsPayload>): Promise<ExternalPlatform> {
    const { data } = await $axios.patch(`${base}/${id}`, payload)
    return data.data
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

  return { list, get, create, updateDetails, saveFields, saveConfig, destroy, addProcess, updateProcess, removeProcess }
}
