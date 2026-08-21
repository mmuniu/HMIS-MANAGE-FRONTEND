import { useNuxtApp } from '#app'
import type { UserListResponse } from '~/types/user'

/**
 * Cross-tenant user directory, system admin only.
 * Backend:
 *   GET    /v1/platform/admin/users        (paginated, ?search=)
 *   DELETE /v1/platform/admin/users/{id}
 */
export function useUsersApi() {
  const { $axios } = useNuxtApp()

  async function list(params: { page?: number; per_page?: number; search?: string } = {}): Promise<UserListResponse> {
    const { data } = await $axios.get<UserListResponse>('/v1/platform/admin/users', { params })
    return data
  }

  async function destroy(id: number): Promise<void> {
    await $axios.delete(`/v1/platform/admin/users/${id}`)
  }

  return { list, destroy }
}
