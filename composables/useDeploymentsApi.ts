import { useNuxtApp } from '#app'
import type {
  CompleteCheckInPayload,
  CreateDeploymentAssignmentPayload,
  CreateDeploymentDocumentPayload,
  CreateDeploymentPayload,
  CreateIncidentPayload,
  CreateTrainingSessionPayload,
  CreateUatCasePayload,
  CreateUatDefectPayload,
  DecideApprovalPayload,
  DeploymentDetail,
  DeploymentListResponse,
  DeploymentShowResponse,
  RequestApprovalPayload,
  ReviewDeploymentDocumentPayload,
  UpdateChecklistItemPayload,
  UpdateIncidentPayload,
  UpdatePeriodPayload,
  UpdateTrainingSessionPayload,
  UpdateUatCasePayload,
  UpdateUatDefectPayload,
  UpsertGoLivePayload,
  UpsertMigrationPayload,
  UpsertReviewPayload,
  UpsertSignoffPayload,
  UpsertWorkPlanPayload,
} from '~/types/deployment'

/**
 * Deployment lifecycle — see HOSPITAL_PROVISIONING_FLOW.md.
 * Backend (Phase 1):
 *   GET  /v1/platform/deployments
 *   POST /v1/platform/deployments
 *   GET  /v1/platform/deployments/{id}
 *   POST /v1/platform/deployments/{id}/stages/{stageNumber}/complete
 * Backend (Phase 3 — stages 2-5):
 *   PATCH  /v1/platform/deployments/{id}/checklist-items/{itemId}
 *   POST   /v1/platform/deployments/{id}/documents
 *   POST   /v1/platform/deployments/{id}/documents/{documentId}/upload
 *   PATCH  /v1/platform/deployments/{id}/documents/{documentId}
 *   DELETE /v1/platform/deployments/{id}/documents/{documentId}
 *   POST   /v1/platform/deployments/{id}/assignments
 *   DELETE /v1/platform/deployments/{id}/assignments/{assignmentId}
 *   PUT    /v1/platform/deployments/{id}/work-plan
 *   POST   /v1/platform/deployments/{id}/approvals
 *   POST   /v1/platform/deployments/{id}/approvals/{approvalId}/decide
 * Backend (Phase 4 — stages 7-9):
 *   PUT    /v1/platform/deployments/{id}/migration
 *   POST   /v1/platform/deployments/{id}/training-sessions
 *   PATCH  /v1/platform/deployments/{id}/training-sessions/{sessionId}
 *   DELETE /v1/platform/deployments/{id}/training-sessions/{sessionId}
 * Backend (Phase 6 — stages 11-13):
 *   PUT    /v1/platform/deployments/{id}/go-live
 *   PATCH  /v1/platform/deployments/{id}/hypercare
 *   PATCH  /v1/platform/deployments/{id}/stabilization
 *   POST   /v1/platform/deployments/{id}/incidents
 *   PATCH  /v1/platform/deployments/{id}/incidents/{incidentId}
 *   DELETE /v1/platform/deployments/{id}/incidents/{incidentId}
 * Backend (Phase 7 — stages 14-16):
 *   PUT    /v1/platform/deployments/{id}/signoff
 *   PUT    /v1/platform/deployments/{id}/review
 * Backend (Phase 8 — automation):
 *   PATCH  /v1/platform/deployments/{id}/check-ins/{checkInId}/complete
 * Every mutation returns the full DeploymentDetail, same contract as
 * completeStage() — the store always just replaces `current` with it.
 */
export function useDeploymentsApi() {
  const { $axios } = useNuxtApp()

  async function list(params: { page?: number; per_page?: number; organization_id?: string } = {}): Promise<DeploymentListResponse> {
    const { data } = await $axios.get<DeploymentListResponse>('/v1/platform/deployments', { params })
    return data
  }

  async function create(payload: CreateDeploymentPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.post<DeploymentShowResponse>('/v1/platform/deployments', payload)
    return data.data
  }

  async function show(id: string): Promise<DeploymentDetail> {
    const { data } = await $axios.get<DeploymentShowResponse>(`/v1/platform/deployments/${id}`)
    return data.data
  }

  async function completeStage(id: string, stageNumber: number): Promise<DeploymentDetail> {
    const { data } = await $axios.post<DeploymentShowResponse>(`/v1/platform/deployments/${id}/stages/${stageNumber}/complete`)
    return data.data
  }

  async function updateChecklistItem(id: string, itemId: number, payload: UpdateChecklistItemPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.patch<DeploymentShowResponse>(`/v1/platform/deployments/${id}/checklist-items/${itemId}`, payload)
    return data.data
  }

  async function addDocument(id: string, payload: CreateDeploymentDocumentPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.post<DeploymentShowResponse>(`/v1/platform/deployments/${id}/documents`, payload)
    return data.data
  }

  async function uploadDocument(id: string, documentId: number, file: File): Promise<DeploymentDetail> {
    const form = new FormData()
    form.append('file', file)
    const { data } = await $axios.post<DeploymentShowResponse>(`/v1/platform/deployments/${id}/documents/${documentId}/upload`, form)
    return data.data
  }

  async function reviewDocument(id: string, documentId: number, payload: ReviewDeploymentDocumentPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.patch<DeploymentShowResponse>(`/v1/platform/deployments/${id}/documents/${documentId}`, payload)
    return data.data
  }

  async function deleteDocument(id: string, documentId: number): Promise<DeploymentDetail> {
    const { data } = await $axios.delete<DeploymentShowResponse>(`/v1/platform/deployments/${id}/documents/${documentId}`)
    return data.data
  }

  async function addAssignment(id: string, payload: CreateDeploymentAssignmentPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.post<DeploymentShowResponse>(`/v1/platform/deployments/${id}/assignments`, payload)
    return data.data
  }

  async function deleteAssignment(id: string, assignmentId: number): Promise<DeploymentDetail> {
    const { data } = await $axios.delete<DeploymentShowResponse>(`/v1/platform/deployments/${id}/assignments/${assignmentId}`)
    return data.data
  }

  async function inviteAssignment(id: string, assignmentId: number): Promise<DeploymentDetail> {
    const { data } = await $axios.post<DeploymentShowResponse>(`/v1/platform/deployments/${id}/assignments/${assignmentId}/invite`)
    return data.data
  }

  async function upsertWorkPlan(id: string, payload: UpsertWorkPlanPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.put<DeploymentShowResponse>(`/v1/platform/deployments/${id}/work-plan`, payload)
    return data.data
  }

  async function requestApproval(id: string, payload: RequestApprovalPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.post<DeploymentShowResponse>(`/v1/platform/deployments/${id}/approvals`, payload)
    return data.data
  }

  async function decideApproval(id: string, approvalId: number, payload: DecideApprovalPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.post<DeploymentShowResponse>(`/v1/platform/deployments/${id}/approvals/${approvalId}/decide`, payload)
    return data.data
  }

  async function upsertMigration(id: string, payload: UpsertMigrationPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.put<DeploymentShowResponse>(`/v1/platform/deployments/${id}/migration`, payload)
    return data.data
  }

  async function addTrainingSession(id: string, payload: CreateTrainingSessionPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.post<DeploymentShowResponse>(`/v1/platform/deployments/${id}/training-sessions`, payload)
    return data.data
  }

  async function updateTrainingSession(id: string, sessionId: number, payload: UpdateTrainingSessionPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.patch<DeploymentShowResponse>(`/v1/platform/deployments/${id}/training-sessions/${sessionId}`, payload)
    return data.data
  }

  async function deleteTrainingSession(id: string, sessionId: number): Promise<DeploymentDetail> {
    const { data } = await $axios.delete<DeploymentShowResponse>(`/v1/platform/deployments/${id}/training-sessions/${sessionId}`)
    return data.data
  }

  async function addUatCase(id: string, payload: CreateUatCasePayload): Promise<DeploymentDetail> {
    const { data } = await $axios.post<DeploymentShowResponse>(`/v1/platform/deployments/${id}/uat-cases`, payload)
    return data.data
  }

  async function updateUatCase(id: string, caseId: number, payload: UpdateUatCasePayload): Promise<DeploymentDetail> {
    const { data } = await $axios.patch<DeploymentShowResponse>(`/v1/platform/deployments/${id}/uat-cases/${caseId}`, payload)
    return data.data
  }

  async function deleteUatCase(id: string, caseId: number): Promise<DeploymentDetail> {
    const { data } = await $axios.delete<DeploymentShowResponse>(`/v1/platform/deployments/${id}/uat-cases/${caseId}`)
    return data.data
  }

  async function addUatDefect(id: string, payload: CreateUatDefectPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.post<DeploymentShowResponse>(`/v1/platform/deployments/${id}/uat-defects`, payload)
    return data.data
  }

  async function updateUatDefect(id: string, defectId: number, payload: UpdateUatDefectPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.patch<DeploymentShowResponse>(`/v1/platform/deployments/${id}/uat-defects/${defectId}`, payload)
    return data.data
  }

  async function deleteUatDefect(id: string, defectId: number): Promise<DeploymentDetail> {
    const { data } = await $axios.delete<DeploymentShowResponse>(`/v1/platform/deployments/${id}/uat-defects/${defectId}`)
    return data.data
  }

  async function upsertGoLive(id: string, payload: UpsertGoLivePayload): Promise<DeploymentDetail> {
    const { data } = await $axios.put<DeploymentShowResponse>(`/v1/platform/deployments/${id}/go-live`, payload)
    return data.data
  }

  async function updateHypercare(id: string, payload: UpdatePeriodPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.patch<DeploymentShowResponse>(`/v1/platform/deployments/${id}/hypercare`, payload)
    return data.data
  }

  async function updateStabilization(id: string, payload: UpdatePeriodPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.patch<DeploymentShowResponse>(`/v1/platform/deployments/${id}/stabilization`, payload)
    return data.data
  }

  async function addIncident(id: string, payload: CreateIncidentPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.post<DeploymentShowResponse>(`/v1/platform/deployments/${id}/incidents`, payload)
    return data.data
  }

  async function updateIncident(id: string, incidentId: number, payload: UpdateIncidentPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.patch<DeploymentShowResponse>(`/v1/platform/deployments/${id}/incidents/${incidentId}`, payload)
    return data.data
  }

  async function deleteIncident(id: string, incidentId: number): Promise<DeploymentDetail> {
    const { data } = await $axios.delete<DeploymentShowResponse>(`/v1/platform/deployments/${id}/incidents/${incidentId}`)
    return data.data
  }

  async function upsertSignoff(id: string, payload: UpsertSignoffPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.put<DeploymentShowResponse>(`/v1/platform/deployments/${id}/signoff`, payload)
    return data.data
  }

  async function upsertReview(id: string, payload: UpsertReviewPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.put<DeploymentShowResponse>(`/v1/platform/deployments/${id}/review`, payload)
    return data.data
  }

  async function completeCheckIn(id: string, checkInId: number, payload: CompleteCheckInPayload): Promise<DeploymentDetail> {
    const { data } = await $axios.patch<DeploymentShowResponse>(`/v1/platform/deployments/${id}/check-ins/${checkInId}/complete`, payload)
    return data.data
  }

  return {
    list, create, show, completeStage,
    updateChecklistItem,
    addDocument, uploadDocument, reviewDocument, deleteDocument,
    addAssignment, deleteAssignment, inviteAssignment,
    upsertWorkPlan,
    requestApproval, decideApproval,
    upsertMigration,
    addTrainingSession, updateTrainingSession, deleteTrainingSession,
    addUatCase, updateUatCase, deleteUatCase,
    addUatDefect, updateUatDefect, deleteUatDefect,
    upsertGoLive, updateHypercare, updateStabilization,
    addIncident, updateIncident, deleteIncident,
    upsertSignoff, upsertReview,
    completeCheckIn,
  }
}
