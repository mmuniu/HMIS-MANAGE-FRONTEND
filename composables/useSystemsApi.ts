import { useNuxtApp } from '#app'

// Each system is a separate product with its own core-service. Mirrors
// SystemController::present() on the backend. The app secret is write-only:
// the API only says whether one is set and its last 4 characters.
export interface CoreServiceConnection {
  url: string | null
  app_id: string | null
  secret_set: boolean
  secret_hint: string | null
  timeout: number | null
  configured: boolean
  // The Default system with no connection of its own uses CORE_SERVICE_* from .env.
  uses_env: boolean
  last_check: { at: string; ok: boolean; error: string | null } | null
}

export interface PlatformSystem {
  id: string
  name: string
  slug: string
  is_default: boolean
  status: string
  members: number
  created_at: string | null
  core_service: CoreServiceConnection
}

export interface CoreServiceInput {
  core_service_url?: string | null
  core_service_app_id?: string | null
  // Omit (or send blank) to keep the stored secret.
  core_service_app_secret?: string | null
  core_service_timeout?: number | null
  clear_core_service?: boolean
}

export interface TestConnectionResult {
  ok: boolean
  error: string | null
  probe: 'ping' | 'organizations' | null
  organizations: number | null
}

/**
 * System administration API (system_admin only): register/configure the data
 * partitions ("systems") and their core-service connections. See also auth
 * store switchSystem() for switching.
 */
export function useSystemsApi() {
  const { $axios } = useNuxtApp()

  async function list(): Promise<PlatformSystem[]> {
    const { data } = await $axios.get('/v1/platform/systems')
    return data.data
  }

  async function create(input: { name: string; status?: string } & CoreServiceInput): Promise<PlatformSystem> {
    const { data } = await $axios.post('/v1/platform/systems', input)
    return data.data
  }

  async function update(id: string, input: { name?: string; status?: string } & CoreServiceInput): Promise<PlatformSystem> {
    const { data } = await $axios.patch(`/v1/platform/systems/${id}`, input)
    return data.data
  }

  async function testConnection(id: string): Promise<{ system: PlatformSystem; result: TestConnectionResult }> {
    const { data } = await $axios.post(`/v1/platform/systems/${id}/test-connection`)
    return { system: data.data, result: data.result }
  }

  return { list, create, update, testConnection }
}
