import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useHospitalsApi } from '~/composables/useHospitalsApi'
<<<<<<< HEAD
import type { CreateHospitalPayload, CreateHospitalResponse, Hospital, HospitalDetail, PaginationMeta, ProvisionAdminResponse, RetryProvisioningResponse, UpdateAdminPayload } from '~/types/hospital'
=======
import type { CreateHospitalPayload, CreateHospitalResponse, Hospital, HospitalDetail, PaginationMeta, ProvisionAdminResponse, RetryProvisioningResponse, UpdateHospitalPayload } from '~/types/hospital'
>>>>>>> 06794bf351253daff330e38517d398a2f77570ca

export const useHospitalsStore = defineStore('hospitals', () => {
  const api = useHospitalsApi()

  const items = ref<Hospital[]>([])
  const meta = ref<PaginationMeta | null>(null)
  const current = ref<HospitalDetail | null>(null)
  const loading = ref(false)
  const error = ref('')
  const saving = ref(false)
  const retrying = ref(false)
  const deleting = ref(false)
  // Full response from the most recent create() call, kept around so the
  // caller can render provisioning outcome instead of only reading it once.
  const lastCreateResult = ref<CreateHospitalResponse | null>(null)
  // Same idea for the most recent retryProvisioning() call.
  const lastRetryResult = ref<RetryProvisioningResponse | null>(null)
  // id of the admin currently being provisioned, if any (drives a per-row spinner).
  const provisioningAdminId = ref<number | null>(null)
  // Most recent provisionAdmin() result — carries the one-time temp password.
  const lastAdminProvisionResult = ref<ProvisionAdminResponse | null>(null)
  // id of the admin currently being edited/saved, if any (drives the dialog's save spinner).
  const updatingAdminId = ref<number | null>(null)
  // Field-level validation errors from the backend (422), keyed by field name.
  const fieldErrors = ref<Record<string, string[]>>({})

  async function fetchList(page = 1, perPage = 25) {
    loading.value = true
    error.value = ''
    try {
      const res = await api.list({ page, per_page: perPage })
      items.value = res.data
      meta.value = res.meta
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Failed to load hospitals.'
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id: string) {
    loading.value = true
    error.value = ''
    current.value = null
    try {
      current.value = await api.show(id)
    } catch (err: any) {
      error.value =
        err?.response?.status === 404
          ? 'Hospital not found.'
          : err?.response?.data?.message || 'Failed to load hospital.'
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CreateHospitalPayload) {
    saving.value = true
    error.value = ''
    fieldErrors.value = {}
    try {
      const res = await api.create(payload)
      lastCreateResult.value = res
      return { success: true as const, data: res }
    } catch (err: any) {
      if (err?.response?.status === 422) {
        fieldErrors.value = err.response.data?.errors || {}
        error.value = err.response.data?.message || 'Please fix the highlighted fields.'
      } else {
        error.value = err?.response?.data?.message || 'Failed to create hospital.'
      }
      return { success: false as const }
    } finally {
      saving.value = false
    }
  }

  async function update(id: string, payload: UpdateHospitalPayload) {
    saving.value = true
    error.value = ''
    fieldErrors.value = {}
    try {
      const res = await api.update(id, payload)
      if (current.value?.id === id) Object.assign(current.value, res.data)
      const inList = items.value.find((h) => h.id === id)
      if (inList) Object.assign(inList, res.data)
      return { success: true as const, data: res }
    } catch (err: any) {
      if (err?.response?.status === 422) {
        fieldErrors.value = err.response.data?.errors || {}
        error.value = err.response.data?.message || 'Please fix the highlighted fields.'
      } else {
        error.value = err?.response?.data?.message || 'Failed to update hospital.'
      }
      return { success: false as const }
    } finally {
      saving.value = false
    }
  }

  async function retryProvisioning(id: string) {
    retrying.value = true
    error.value = ''
    try {
      const res = await api.retryProvisioning(id)
      lastRetryResult.value = res
      if (current.value && current.value.id === id) current.value.core_org_id = res.data.core_org_id
      return { success: true as const, data: res }
    } catch (err: any) {
      error.value =
        err?.response?.status === 409
          ? err.response.data?.message || 'Already provisioned.'
          : err?.response?.data?.message || 'Failed to retry provisioning.'
      return { success: false as const }
    } finally {
      retrying.value = false
    }
  }

  async function provisionAdmin(orgId: string, userId: number) {
    provisioningAdminId.value = userId
    error.value = ''
    try {
      const res = await api.provisionAdmin(orgId, userId)
      lastAdminProvisionResult.value = res
      if (current.value) {
        const admin = current.value.admins.find((a) => a.id === userId)
        if (admin) admin.core_user_id = res.data.core_user_id
      }
      return { success: true as const, data: res }
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Failed to provision admin.'
      return { success: false as const }
    } finally {
      provisioningAdminId.value = null
    }
  }

  async function updateAdmin(orgId: string, userId: number, payload: UpdateAdminPayload) {
    updatingAdminId.value = userId
    error.value = ''
    try {
      const res = await api.updateAdmin(orgId, userId, payload)
      if (current.value) {
        const index = current.value.admins.findIndex((a) => a.id === userId)
        if (index !== -1) current.value.admins[index] = res.data
      }
      return { success: true as const, notified: res.notified }
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Failed to update admin.'
      return { success: false as const, notified: false }
    } finally {
      updatingAdminId.value = null
    }
  }

  async function remove(id: string) {
    deleting.value = true
    error.value = ''
    try {
      await api.destroy(id)
      items.value = items.value.filter((h) => h.id !== id)
      if (current.value?.id === id) current.value = null
      return { success: true as const }
    } catch (err: any) {
      error.value =
        err?.response?.status === 403
          ? err.response.data?.message || 'You do not have permission to delete this hospital.'
          : err?.response?.data?.message || 'Failed to delete hospital.'
      return { success: false as const }
    } finally {
      deleting.value = false
    }
  }

  return {
    items, meta, current, loading, error, saving, retrying, deleting, fieldErrors,
    provisioningAdminId, lastAdminProvisionResult, updatingAdminId,
    lastCreateResult, lastRetryResult,
<<<<<<< HEAD
    fetchList, fetchOne, create, retryProvisioning, provisionAdmin, updateAdmin, remove,
=======
    fetchList, fetchOne, create, update, retryProvisioning, provisionAdmin, remove,
>>>>>>> 06794bf351253daff330e38517d398a2f77570ca
  }
})
