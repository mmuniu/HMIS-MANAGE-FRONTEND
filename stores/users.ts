import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '~/types/components/auth/auth'

export const useUsersStore = defineStore('users', () => {
    const { $axios, $showToast } = useNuxtApp()
    const users = ref<User[]>([])
    const selectedUser = ref<User | null>(null)
    const apiError = ref('')
    const meta = ref<any>({})

    const userCount = computed(() => users.value.length)

    const fetchUsers = async (params: Record<string, any> = {}) => {
        try {
            const { data } = await $axios.get('/users', { params })
            users.value = data.data || []
            meta.value = data.meta || {}
        } catch (err: any) {
            apiError.value = err.response?.data?.message || 'Failed to fetch users.'
            $showToast(apiError.value)
        }
    }

    const fetchUser = async (id: number | string) => {
        try {
            const { data } = await $axios.get(`/users/${id}`)
            selectedUser.value = data
        } catch (err: any) {
            apiError.value = err.response?.data?.message || 'Failed to fetch user.'
            $showToast(apiError.value)
        }
    }

    const createUser = async (payload: any) => {
        try {
            const { data } = await $axios.post('/users', payload)
            users.value.push(data)
            $showToast('User created successfully!')
        } catch (err: any) {
            apiError.value = err.response?.data?.message || 'Failed to create user.'
            $showToast(apiError.value)
        }
    }

    const updateUser = async (id: number | string, payload: any) => {
        try {
            const { data } = await $axios.put(`/users/${id}`, payload)
            const index = users.value.findIndex(u => u.id === id)
            if (index !== -1) users.value[index] = data
            if (selectedUser.value?.id === id) selectedUser.value = data
            $showToast('User updated successfully!')
        } catch (err: any) {
            apiError.value = err.response?.data?.message || 'Failed to update user.'
            $showToast(apiError.value)
        }
    }

    const deleteUser = async (id: number | string) => {
        try {
            await $axios.delete(`/users/${id}`)
            users.value = users.value.filter(u => u.id !== id)
            if (selectedUser.value?.id === id) selectedUser.value = null
            $showToast('User deleted successfully!')
        } catch (err: any) {
            apiError.value = err.response?.data?.message || 'Failed to delete user.'
            $showToast(apiError.value)
        }
    }

    const assignRolesToUser = async (userId: number, roleIds: number[]) => {
        try {
            await $axios.post(`/users/${userId}/roles/assign`, { roles: roleIds })
            $showToast('Roles assigned successfully!')
            await fetchUser(userId)
        } catch (err: any) {
            apiError.value = err.response?.data?.message || 'Failed to assign roles.'
            $showToast(apiError.value)
        }
    }

    const unassignRolesFromUser = async (userId: number, roleIds: number[]) => {
        try {
            await $axios.post(`/users/${userId}/roles/unassign`, { roles: roleIds })
            $showToast('Roles removed successfully!')
            await fetchUser(userId)
        } catch (err: any) {
            apiError.value = err.response?.data?.message || 'Failed to unassign roles.'
            $showToast(apiError.value)
        }
    }

    const assignPermissionsToUser = async (userId: number, permissionIds: number[]) => {
        try {
            await $axios.post(`/users/${userId}/permissions/assign`, { permissions: permissionIds })
            $showToast('Permissions assigned successfully!')
            await fetchUser(userId)
        } catch (err: any) {
            apiError.value = err.response?.data?.message || 'Failed to assign permissions.'
            $showToast(apiError.value)
        }
    }

    const unassignPermissionsFromUser = async (userId: number, permissionIds: number[]) => {
        try {
            await $axios.post(`/users/${userId}/permissions/unassign`, { permissions: permissionIds })
            $showToast('Permissions removed successfully!')
            await fetchUser(userId)
        } catch (err: any) {
            apiError.value = err.response?.data?.message || 'Failed to unassign permissions.'
            $showToast(apiError.value)
        }
    }

    return {
        users,
        selectedUser,
        apiError,
        meta,
        userCount,
        fetchUsers,
        fetchUser,
        createUser,
        updateUser,
        deleteUser,
        assignRolesToUser,
        unassignRolesFromUser,
        assignPermissionsToUser,
        unassignPermissionsFromUser
    }
})
