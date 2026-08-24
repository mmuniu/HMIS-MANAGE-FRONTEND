import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useDeploymentsApi } from '~/composables/useDeploymentsApi'
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
  Deployment,
  DeploymentDetail,
  PaginationMeta,
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

export const useDeploymentsStore = defineStore('deployments', () => {
  const api = useDeploymentsApi()

  const items = ref<Deployment[]>([])
  const meta = ref<PaginationMeta | null>(null)
  const current = ref<DeploymentDetail | null>(null)
  const loading = ref(false)
  const error = ref('')
  const creating = ref(false)
  // stage number currently being completed, if any (drives a per-row spinner).
  const completingStage = ref<number | null>(null)
  // true while any Phase 3 dialog action (checklist/document/assignment/
  // work-plan/approval) is in flight — drives a single shared spinner
  // inside whichever dialog is open.
  const mutating = ref(false)

  async function fetchList(page = 1, perPage = 25) {
    loading.value = true
    error.value = ''
    try {
      const res = await api.list({ page, per_page: perPage })
      items.value = res.data
      meta.value = res.meta
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Failed to load deployments.'
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
          ? 'Deployment not found.'
          : err?.response?.data?.message || 'Failed to load deployment.'
    } finally {
      loading.value = false
    }
  }

  async function create(payload: CreateDeploymentPayload) {
    creating.value = true
    error.value = ''
    try {
      const res = await api.create(payload)
      return { success: true as const, data: res }
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Failed to create deployment.'
      return { success: false as const }
    } finally {
      creating.value = false
    }
  }

  /**
   * One-off lookup for the hospital detail page's "View/Start deployment"
   * button — deliberately doesn't touch `items`/`meta`, so it can't stomp on
   * the deployments list page's own pagination state.
   */
  async function findForOrganization(organizationId: string): Promise<Deployment | null> {
    try {
      const res = await api.list({ organization_id: organizationId, per_page: 1 })
      return res.data[0] ?? null
    } catch {
      return null
    }
  }

  async function completeStage(id: string, stageNumber: number) {
    completingStage.value = stageNumber
    error.value = ''
    try {
      const res = await api.completeStage(id, stageNumber)
      if (current.value?.id === id) current.value = res
      return { success: true as const, data: res }
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Failed to complete stage.'
      return { success: false as const }
    } finally {
      completingStage.value = null
    }
  }

  /**
   * Shared shape for every Phase 3 dialog action: run the api call, replace
   * `current` with the fresh detail on success, surface the error message
   * otherwise — same success/data contract as completeStage() above.
   */
  async function mutate(fn: () => Promise<DeploymentDetail>) {
    mutating.value = true
    error.value = ''
    try {
      const res = await fn()
      current.value = res
      return { success: true as const, data: res }
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'That action failed.'
      return { success: false as const }
    } finally {
      mutating.value = false
    }
  }

  function updateChecklistItem(deploymentId: string, itemId: number, payload: UpdateChecklistItemPayload) {
    return mutate(() => api.updateChecklistItem(deploymentId, itemId, payload))
  }

  function addDocument(deploymentId: string, payload: CreateDeploymentDocumentPayload) {
    return mutate(() => api.addDocument(deploymentId, payload))
  }

  function uploadDocument(deploymentId: string, documentId: number, file: File) {
    return mutate(() => api.uploadDocument(deploymentId, documentId, file))
  }

  function reviewDocument(deploymentId: string, documentId: number, payload: ReviewDeploymentDocumentPayload) {
    return mutate(() => api.reviewDocument(deploymentId, documentId, payload))
  }

  function deleteDocument(deploymentId: string, documentId: number) {
    return mutate(() => api.deleteDocument(deploymentId, documentId))
  }

  function addAssignment(deploymentId: string, payload: CreateDeploymentAssignmentPayload) {
    return mutate(() => api.addAssignment(deploymentId, payload))
  }

  function deleteAssignment(deploymentId: string, assignmentId: number) {
    return mutate(() => api.deleteAssignment(deploymentId, assignmentId))
  }

  function upsertWorkPlan(deploymentId: string, payload: UpsertWorkPlanPayload) {
    return mutate(() => api.upsertWorkPlan(deploymentId, payload))
  }

  function requestApproval(deploymentId: string, payload: RequestApprovalPayload) {
    return mutate(() => api.requestApproval(deploymentId, payload))
  }

  function decideApproval(deploymentId: string, approvalId: number, payload: DecideApprovalPayload) {
    return mutate(() => api.decideApproval(deploymentId, approvalId, payload))
  }

  function upsertMigration(deploymentId: string, payload: UpsertMigrationPayload) {
    return mutate(() => api.upsertMigration(deploymentId, payload))
  }

  function addTrainingSession(deploymentId: string, payload: CreateTrainingSessionPayload) {
    return mutate(() => api.addTrainingSession(deploymentId, payload))
  }

  function updateTrainingSession(deploymentId: string, sessionId: number, payload: UpdateTrainingSessionPayload) {
    return mutate(() => api.updateTrainingSession(deploymentId, sessionId, payload))
  }

  function deleteTrainingSession(deploymentId: string, sessionId: number) {
    return mutate(() => api.deleteTrainingSession(deploymentId, sessionId))
  }

  function addUatCase(deploymentId: string, payload: CreateUatCasePayload) {
    return mutate(() => api.addUatCase(deploymentId, payload))
  }

  function updateUatCase(deploymentId: string, caseId: number, payload: UpdateUatCasePayload) {
    return mutate(() => api.updateUatCase(deploymentId, caseId, payload))
  }

  function deleteUatCase(deploymentId: string, caseId: number) {
    return mutate(() => api.deleteUatCase(deploymentId, caseId))
  }

  function addUatDefect(deploymentId: string, payload: CreateUatDefectPayload) {
    return mutate(() => api.addUatDefect(deploymentId, payload))
  }

  function updateUatDefect(deploymentId: string, defectId: number, payload: UpdateUatDefectPayload) {
    return mutate(() => api.updateUatDefect(deploymentId, defectId, payload))
  }

  function deleteUatDefect(deploymentId: string, defectId: number) {
    return mutate(() => api.deleteUatDefect(deploymentId, defectId))
  }

  function upsertGoLive(deploymentId: string, payload: UpsertGoLivePayload) {
    return mutate(() => api.upsertGoLive(deploymentId, payload))
  }

  function updateHypercare(deploymentId: string, payload: UpdatePeriodPayload) {
    return mutate(() => api.updateHypercare(deploymentId, payload))
  }

  function updateStabilization(deploymentId: string, payload: UpdatePeriodPayload) {
    return mutate(() => api.updateStabilization(deploymentId, payload))
  }

  function addIncident(deploymentId: string, payload: CreateIncidentPayload) {
    return mutate(() => api.addIncident(deploymentId, payload))
  }

  function updateIncident(deploymentId: string, incidentId: number, payload: UpdateIncidentPayload) {
    return mutate(() => api.updateIncident(deploymentId, incidentId, payload))
  }

  function deleteIncident(deploymentId: string, incidentId: number) {
    return mutate(() => api.deleteIncident(deploymentId, incidentId))
  }

  function upsertSignoff(deploymentId: string, payload: UpsertSignoffPayload) {
    return mutate(() => api.upsertSignoff(deploymentId, payload))
  }

  function upsertReview(deploymentId: string, payload: UpsertReviewPayload) {
    return mutate(() => api.upsertReview(deploymentId, payload))
  }

  function completeCheckIn(deploymentId: string, checkInId: number, payload: CompleteCheckInPayload) {
    return mutate(() => api.completeCheckIn(deploymentId, checkInId, payload))
  }

  return {
    items, meta, current, loading, error, creating, completingStage, mutating,
    fetchList, fetchOne, create, completeStage, findForOrganization,
    updateChecklistItem,
    addDocument, uploadDocument, reviewDocument, deleteDocument,
    addAssignment, deleteAssignment,
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
})
