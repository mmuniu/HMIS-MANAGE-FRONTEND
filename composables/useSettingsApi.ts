import { useNuxtApp } from '#app'

export interface PlatformSettings {
  // On: the register-hospital form fills facility details from the SHA HIE /
  // DHA registry lookup and locks them. Off: no lookup, fields typed by hand.
  sha_integration_enabled: boolean
}

/**
 * Global platform settings. Backend:
 *   GET   /v1/platform/settings  (any platform user)
 *   PATCH /v1/platform/settings  (system admin only)
 */
export function useSettingsApi() {
  const { $axios } = useNuxtApp()

  async function get(): Promise<PlatformSettings> {
    const { data } = await $axios.get('/v1/platform/settings')
    return data.data
  }

  async function update(input: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const { data } = await $axios.patch('/v1/platform/settings', input)
    return data.data
  }

  return { get, update }
}
