import { useNuxtApp } from '#app'

export interface PlatformSettings {
  // On: the register-hospital form fills facility details from the SHA HIE /
  // DHA registry lookup and locks them. Off: no lookup, fields typed by hand.
  sha_integration_enabled: boolean
}

/**
 * Global platform settings. Backend:
 *   GET   /v1/settings  (any platform user)
 *   PATCH /v1/settings  (system admin only)
 * i.e. api/v1/settings — not under /v1/platform like most other endpoints.
 */
export function useSettingsApi() {
  const { $axios } = useNuxtApp()

  async function get(): Promise<PlatformSettings> {
    const { data } = await $axios.get('/v1/settings')
    return data.data
  }

  async function update(input: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const { data } = await $axios.patch('/v1/settings', input)
    return data.data
  }

  return { get, update }
}
