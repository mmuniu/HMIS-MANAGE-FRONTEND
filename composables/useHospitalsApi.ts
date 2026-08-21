import { useNuxtApp } from '#app'
import type {
  CreateAdminPayload,
  CreateAdminResponse,
  CreateHospitalPayload,
  CreateHospitalResponse,
  FacilityRegistrySearchResponse,
  HospitalDetail,
  HospitalListResponse,
  HospitalShowResponse,
  ProvisionAdminResponse,
  RetryProvisioningResponse,
  UpdateAdminPayload,
  UpdateAdminResponse,
  UpdateHospitalPayload,
  UpdateHospitalResponse,
} from '~/types/hospital'

/**
 * Read access to platform hospitals (organizations / tenants).
 * Backend:
 *   GET    /v1/platform/hospitals       (paginated)
 *   GET    /v1/platform/hospitals/{id}
 *   PUT    /v1/platform/hospitals/{id}  (edit details, platform staff only)
 *   DELETE /v1/platform/hospitals/{id}  (soft-delete, system admin only)
 *   GET    /v1/platform/hospitals/facility-search (DHA SHA HIE lookup)
 *   POST   /v1/platform/hospitals/{id}/provision (retry core-service sync)
 */
export function useHospitalsApi() {
  const { $axios } = useNuxtApp()

  async function list(params: { page?: number; per_page?: number } = {}): Promise<HospitalListResponse> {
    const { data } = await $axios.get<HospitalListResponse>('/v1/platform/hospitals', { params })
    return data
  }

  async function show(id: string): Promise<HospitalDetail> {
    const { data } = await $axios.get<HospitalShowResponse>(`/v1/platform/hospitals/${id}`)
    return data.data
  }

  async function destroy(id: string): Promise<void> {
    await $axios.delete(`/v1/platform/hospitals/${id}`)
  }

  async function update(id: string, payload: UpdateHospitalPayload): Promise<UpdateHospitalResponse> {
    const { data } = await $axios.put<UpdateHospitalResponse>(`/v1/platform/hospitals/${id}`, payload)
    return data
  }

  async function create(payload: CreateHospitalPayload): Promise<CreateHospitalResponse> {
    const { data } = await $axios.post<CreateHospitalResponse>('/v1/platform/hospitals', payload)
    return data
  }

  async function retryProvisioning(id: string): Promise<RetryProvisioningResponse> {
    const { data } = await $axios.post<RetryProvisioningResponse>(`/v1/platform/hospitals/${id}/provision`)
    return data
  }

  async function addAdmin(id: string, payload: CreateAdminPayload): Promise<CreateAdminResponse> {
    const { data } = await $axios.post<CreateAdminResponse>(`/v1/platform/hospitals/${id}/admins`, payload)
    return data
  }

  async function provisionAdmin(id: string, userId: number): Promise<ProvisionAdminResponse> {
    const { data } = await $axios.post<ProvisionAdminResponse>(`/v1/platform/hospitals/${id}/admins/${userId}/provision`)
    return data
  }

  async function updateAdmin(id: string, userId: number, payload: UpdateAdminPayload): Promise<UpdateAdminResponse> {
    const { data } = await $axios.patch<UpdateAdminResponse>(`/v1/platform/hospitals/${id}/admins/${userId}`, payload)
    return data
  }

  // Backend always answers with the {ok, status, data, error} envelope, even
  // for "not configured" / auth failures — those come back as non-2xx, so
  // pull the envelope out of the error response instead of throwing.
  async function searchFacility(identifier: string, identifierType?: string): Promise<FacilityRegistrySearchResponse> {
    try {
      const { data } = await $axios.get<FacilityRegistrySearchResponse>('/v1/platform/hospitals/facility-search', {
        params: { identifier, 'identifier-type': identifierType },
      })
      return data
    } catch (err: any) {
      if (err?.response?.data) return err.response.data
      throw err
    }
  }

  return { list, show, create, update, destroy, retryProvisioning, provisionAdmin, updateAdmin, addAdmin, searchFacility }
}
