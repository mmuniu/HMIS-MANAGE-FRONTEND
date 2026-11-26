import { useNuxtApp } from '#app'

// v3 stacks hospitals are provisioned into, and each stack's service
// connections. Mirrors V3TargetController::present() on the backend.
// Secrets are write-only: the API only says whether one is set and its
// last 4 characters.

export type V3ServiceKey = 'core' | 'evaluation' | 'inventory'

export interface V3ServiceConnection {
  url: string | null
  app_id: string | null
  secret_set: boolean
  secret_hint: string | null
  timeout: number | null
  configured: boolean
  // Where the values come from: set on this page, .env, or both (page wins).
  source: 'database' | 'env' | 'database+env' | null
}

export interface V3Stack {
  key: string
  label: string
  default: boolean
  in_env: boolean
  has_overrides: boolean
  available: boolean
  hospitals: number
  services: Record<V3ServiceKey, V3ServiceConnection>
  last_check: { at: string; ok: boolean; error: string | null } | null
}

// Field names the API takes, e.g. core_url, evaluation_app_secret, clear_inventory.
export type V3StackInput = { key?: string; label?: string | null } & Partial<Record<
  `${V3ServiceKey}_${'url' | 'app_id' | 'app_secret'}`, string | null
>> & Partial<Record<`${V3ServiceKey}_timeout`, number | null>> & Partial<Record<`clear_${V3ServiceKey}`, boolean>>

export interface V3TestResult {
  ok: boolean
  error: string | null
  probe: 'ping' | 'organizations' | null
  organizations: number | null
}

// One release of a stack (regular, beta, ...) — V3Release::present().
export interface V3ReleaseRow {
  id: number
  v3_target: string
  key: string
  label: string
  app_url: string | null
  cookie_domain: string | null
  notes: string | null
  active: boolean
  // "regular": can't be removed or retired.
  protected: boolean
  // Whether facilities can be moved to it from a hospital's page. Unlike a
  // retired release it stays in use; it just isn't offered there.
  selectable: boolean
  // The system's default release (regular): facilities start on it, and
  // only a facility on it can be moved.
  default: boolean
  // Facilities registered here that are on it (only shown by the Systems page).
  facilities?: number
  v3_target_label?: string
}

// Whether the system's core-service holds the release app URLs saved here
// (it gives them out at sign-in, and the HMIS frontend redirects to them).
// synced | pending (not sent yet) | failed (sending didn't work) |
// unavailable (core-service unreachable or too old).
export interface ReleaseCoreSync {
  state: 'synced' | 'pending' | 'failed' | 'unavailable'
  message: string | null
}

export type V3ReleaseInput = Partial<Pick<V3ReleaseRow, 'key' | 'label' | 'app_url' | 'cookie_domain' | 'notes' | 'active' | 'selectable'>>

export function useV3TargetsApi() {
  const { $axios } = useNuxtApp()

  async function list(): Promise<V3Stack[]> {
    const { data } = await $axios.get('/v1/platform/v3-targets')
    return data.data
  }

  async function create(input: V3StackInput): Promise<V3Stack> {
    const { data } = await $axios.post('/v1/platform/v3-targets', input)
    return data.data
  }

  async function update(key: string, input: V3StackInput): Promise<V3Stack> {
    const { data } = await $axios.patch(`/v1/platform/v3-targets/${key}`, input)
    return data.data
  }

  /** Drops this page's values: back to .env, or removes a stack added here. */
  async function remove(key: string): Promise<V3Stack | null> {
    const { data } = await $axios.delete(`/v1/platform/v3-targets/${key}`)
    return data.data
  }

  async function testConnection(key: string): Promise<{ stack: V3Stack; result: V3TestResult }> {
    const { data } = await $axios.post(`/v1/platform/v3-targets/${key}/test-connection`)
    return { stack: data.data, result: data.result }
  }

  async function listReleases(key: string): Promise<V3ReleaseRow[]> {
    const { data } = await $axios.get(`/v1/platform/v3-targets/${key}/releases`)
    return data.data
  }

  // The releases plus whether core-service has their app URLs.
  async function getReleases(key: string): Promise<{ data: V3ReleaseRow[]; core_sync: ReleaseCoreSync | null }> {
    const { data } = await $axios.get(`/v1/platform/v3-targets/${key}/releases`)
    return { data: data.data, core_sync: data.core_sync ?? null }
  }

  // Send the saved app URLs to the system's core-service again.
  async function syncReleases(key: string): Promise<ReleaseCoreSync> {
    const { data } = await $axios.post(`/v1/platform/v3-targets/${key}/releases/sync`)
    return data.core_sync
  }

  async function createRelease(key: string, input: V3ReleaseInput): Promise<V3ReleaseRow> {
    const { data } = await $axios.post(`/v1/platform/v3-targets/${key}/releases`, input)
    return data.data
  }

  async function updateRelease(key: string, release: string, input: V3ReleaseInput): Promise<V3ReleaseRow> {
    const { data } = await $axios.patch(`/v1/platform/v3-targets/${key}/releases/${release}`, input)
    return data.data
  }

  async function removeRelease(key: string, release: string): Promise<void> {
    await $axios.delete(`/v1/platform/v3-targets/${key}/releases/${release}`)
  }

  return { list, create, update, remove, testConnection, listReleases, getReleases, syncReleases, createRelease, updateRelease, removeRelease }
}
