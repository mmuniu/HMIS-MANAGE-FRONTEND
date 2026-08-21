import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUsersApi } from '~/composables/useUsersApi'
import type { PlatformUser, UserListMeta } from '~/types/user'

export const useUsersStore = defineStore('users', () => {
  const api = useUsersApi()

  const items = ref<PlatformUser[]>([])
  const meta = ref<UserListMeta | null>(null)
  const loading = ref(false)
  const error = ref('')
  const deleting = ref<number | null>(null)

  async function fetchList(params: { page?: number; per_page?: number; search?: string } = {}) {
    loading.value = true
    error.value = ''
    try {
      const res = await api.list(params)
      items.value = res.data
      meta.value = res.meta
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Failed to load users.'
    } finally {
      loading.value = false
    }
  }

  async function remove(id: number) {
    deleting.value = id
    error.value = ''
    try {
      await api.destroy(id)
      items.value = items.value.filter((u) => u.id !== id)
      return { success: true as const }
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Failed to delete user.'
      return { success: false as const }
    } finally {
      deleting.value = null
    }
  }

  return { items, meta, loading, error, deleting, fetchList, remove }
})
