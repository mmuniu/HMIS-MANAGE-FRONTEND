import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp } from '#app'

export const useRolesStore = defineStore('roles', () => {
  const { $axios, $showToast } = useNuxtApp()
  const roles = ref<any[]>([])
  const permissions = ref<{ id: number; name: string }[]>([])
  const apiError = ref('')

const fetchRoles = async () => {
  try {
    const { data } = await $axios.get('/roles')
    // Ensure we have the global permissions first
    if (!permissions.value.length) await fetchPermissions()

    roles.value = data.data.map((r: any) => ({
      ...r,
      permissions: (r.permissions || []).map((permName: string) => {
        const p = permissions.value.find(p => p.name === permName)
        return p ? { id: p.id, name: p.name } : { id: 0, name: permName } // fallback if not found
      })
    }))
  } catch (err: any) {
    apiError.value = err.response?.data?.message || 'Failed to fetch roles'
    $showToast(apiError.value)
  }
}


  const fetchPermissions = async () => {
    try {
      const { data } = await $axios.get('/permissions')
      // Only keep id and name for UI
      permissions.value = data.data.map((p: any) => ({ id: p.id, name: p.name }))
    } catch (err: any) {
      apiError.value = err.response?.data?.message || 'Failed to fetch permissions'
      $showToast(apiError.value)
    }
  }

  const createRole = async (payload: { name: string; permissions?: number[] }) => {
    try {
      const { data } = await $axios.post('/roles', payload)
      roles.value.push({ ...data, permissions: payload.permissions?.map(id => {
        const p = permissions.value.find(p => p.id === id)
        return p ? { id: p.id, name: p.name } : null
      }).filter(Boolean) || [] })
      $showToast('Role created successfully!')
      return data
    } catch (err: any) {
      apiError.value = err.response?.data?.message || 'Failed to create role.'
      $showToast(apiError.value)
      throw err
    }
  }

  const updateRole = async (id: number, payload: any) => {
    try {
      const { data } = await $axios.put(`/roles/${id}`, payload)
      const index = roles.value.findIndex(r => r.id === id)
      if (index !== -1) roles.value[index] = { ...data, permissions: roles.value[index].permissions }
      $showToast('Role updated successfully!')
    } catch (err: any) {
      apiError.value = err.response?.data?.message || 'Failed to update role'
      $showToast(apiError.value)
    }
  }

  const deleteRole = async (id: number) => {
    try {
      await $axios.delete(`/roles/${id}`)
      roles.value = roles.value.filter(r => r.id !== id)
      $showToast('Role deleted successfully!')
    } catch (err: any) {
      apiError.value = err.response?.data?.message || 'Failed to delete role'
      $showToast(apiError.value)
    }
  }

  const assignPermissionsToRole = async (roleId: number, permissionIds: number[]) => {
    try {
      await $axios.post(`/roles/${roleId}/permissions/assign`, { permissions: permissionIds })
      await fetchRoles()
      $showToast('Permissions assigned to role!')
    } catch (err: any) {
      apiError.value = err.response?.data?.message || 'Failed to assign permissions'
      $showToast(apiError.value)
    }
  }

  const unassignPermissionsFromRole = async (roleId: number, permissionIds: number[]) => {
    try {
      await $axios.post(`/roles/${roleId}/permissions/unassign`, { permissions: permissionIds })
      await fetchRoles()
      $showToast('Permissions removed from role!')
    } catch (err: any) {
      apiError.value = err.response?.data?.message || 'Failed to remove permissions'
      $showToast(apiError.value)
    }
  }

  return {
    roles,
    permissions,
    apiError,
    fetchRoles,
    fetchPermissions,
    createRole,
    updateRole,
    deleteRole,
    assignPermissionsToRole,
    unassignPermissionsFromRole
  }
})
