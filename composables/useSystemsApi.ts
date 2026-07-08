import { useNuxtApp } from '#app'

export interface PlatformSystem {
  id: string
  name: string
  slug: string
  is_default: boolean
  status: string
  members: number
  created_at: string | null
}

/**
 * System administration API (system_admin only): register/configure the data
 * partitions ("systems"). See also auth store switchSystem() for switching.
 */
export function useSystemsApi() {
  const { $axios } = useNuxtApp()

  async function list(): Promise<PlatformSystem[]> {
    const { data } = await $axios.get('/v1/platform/systems')
    return data.data
  }

  async function create(input: { name: string; status?: string }): Promise<PlatformSystem> {
    const { data } = await $axios.post('/v1/platform/systems', input)
    return data.data
  }

  async function update(id: string, input: { name?: string; status?: string }): Promise<PlatformSystem> {
    const { data } = await $axios.patch(`/v1/platform/systems/${id}`, input)
    return data.data
  }

  return { list, create, update }
}
