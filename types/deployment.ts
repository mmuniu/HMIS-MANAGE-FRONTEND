// Mirrors DeploymentController::present()/presentDetail() on the backend.
// Phase 1 of the deployment lifecycle — see HOSPITAL_PROVISIONING_FLOW.md.

export type DeploymentStatus = 'DRAFT' | 'IN_PROGRESS'
export type DeploymentStageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED'
export type ProvisioningStatus = 'NOT_STARTED' | 'CORE_COMPLETE' | 'PARTIALLY_PROVISIONED' | 'PROVISIONING_FAILED'

// Mirrors Deployment::STAGE_PROVISIONING on the backend — Stage 6 is the
// one stage the registration wizard fulfills, so it gets special treatment
// in the deployment detail page instead of a generic "Mark complete" button.
export const STAGE_PROVISIONING_NUMBER = 6

// Phase 3 — see HOSPITAL_PROVISIONING_FLOW.md. These four stages each get
// their own "Manage" dialog instead of a bare "Mark complete" button.
export const STAGE_READINESS_NUMBER = 2
export const STAGE_INFORMATION_NUMBER = 3
export const STAGE_ASSIGNMENT_NUMBER = 4
export const STAGE_WORK_ORDER_NUMBER = 5

// Phase 4 — see HOSPITAL_PROVISIONING_FLOW.md.
export const STAGE_MIGRATION_NUMBER = 7
export const STAGE_CONFIGURATION_NUMBER = 8
export const STAGE_TRAINING_NUMBER = 9

// Phase 5 — see HOSPITAL_PROVISIONING_FLOW.md.
export const STAGE_UAT_NUMBER = 10

// Phase 6 — see HOSPITAL_PROVISIONING_FLOW.md.
export const STAGE_GO_LIVE_NUMBER = 11
export const STAGE_HYPERCARE_NUMBER = 12
export const STAGE_STABILIZATION_NUMBER = 13

// Phase 7 — see HOSPITAL_PROVISIONING_FLOW.md.
export const STAGE_SIGNOFF_NUMBER = 14
export const STAGE_HANDOVER_NUMBER = 15
export const STAGE_REVIEW_NUMBER = 16

// The 16 stages from the plan doc's Section 4, in order — mirrors
// Deployment::STAGES on the backend so the checklist can label stages
// without waiting on a round-trip.
export const STAGE_DEFINITIONS: { number: number; key: string; title: string }[] = [
  { number: 1, key: 'contract_authorization', title: 'Contract Confirmation & Deployment Authorization' },
  { number: 2, key: 'facility_readiness', title: 'Facility Readiness Assessment' },
  { number: 3, key: 'client_kickoff', title: 'Client Kickoff & Information/Document Collection' },
  { number: 4, key: 'team_assignment', title: 'Deployment Team & Technical Support Assignment' },
  { number: 5, key: 'work_order_approval', title: 'Work Plan & Work Order Approval' },
  { number: 6, key: 'provisioning', title: 'Organization Provisioning, Environment Setup & Configuration' },
  { number: 7, key: 'data_migration', title: 'Data Migration Assessment & Migration' },
  { number: 8, key: 'system_configuration', title: 'System Setup, User Setup & Role Configuration' },
  { number: 9, key: 'training', title: 'Training & Support' },
  { number: 10, key: 'uat', title: 'User Acceptance Testing (UAT)' },
  { number: 11, key: 'go_live', title: 'Go-Live' },
  { number: 12, key: 'hypercare', title: 'Hypercare / Handholding' },
  { number: 13, key: 'stabilization', title: 'Stabilization & Active Customer Monitoring' },
  { number: 14, key: 'completion_signoff', title: 'Completion Sign-off' },
  { number: 15, key: 'handover', title: 'Handover to Support & Customer Service' },
  { number: 16, key: 'post_handover_review', title: 'Post-Handover Review' },
]

export interface Deployment {
  id: string
  organization_id: string | null
  organization_name: string | null
  prospective_name: string | null
  status: DeploymentStatus
  current_stage: number
  current_stage_title: string | null
  total_stages: number
  created_at: string | null
}

export interface DeploymentStageEntry {
  stage_number: number
  stage_key: string
  title: string
  status: DeploymentStageStatus
  started_at: string | null
  completed_at: string | null
}

export interface DeploymentEventEntry {
  id: number
  event_type: string
  description: string
  created_at: string | null
}

export interface ProvisioningStatusDetail {
  status: ProvisioningStatus
  has_organization: boolean
  has_facility: boolean
  core_org_provisioned: boolean
  core_facility_provisioned: boolean
  core_admin_provisioned: boolean
}

// ---- Phase 3 — see HOSPITAL_PROVISIONING_FLOW.md ----

export type ChecklistItemStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'NOT_APPLICABLE' | 'BLOCKED'

export interface DeploymentChecklistItemEntry {
  id: number
  stage_number: number
  category: string
  item_key: string
  label: string
  status: ChecklistItemStatus
  notes: string | null
  checked_at: string | null
}

export type IssueStatus = 'OPEN' | 'RESOLVED'

export interface DeploymentIssueEntry {
  id: number
  stage_number: number
  checklist_item_id: number | null
  title: string
  description: string | null
  blocking: boolean
  status: IssueStatus
  created_at: string | null
  resolved_at: string | null
}

export type DocumentStatus = 'REQUIRED' | 'UPLOADED' | 'UNDER_REVIEW' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'NOT_APPLICABLE'

export interface DeploymentDocumentEntry {
  id: number
  title: string
  category: string | null
  status: DocumentStatus
  original_name: string | null
  url: string | null
  notes: string | null
  uploaded_at: string | null
  reviewed_at: string | null
}

export type AssignmentRole =
  | 'deployment_lead'
  | 'technical_lead'
  | 'implementation_team'
  | 'support_team'
  | 'training_personnel'
  | 'escalation_contact'
  | 'customer_primary_contact'

export const ASSIGNMENT_ROLES: AssignmentRole[] = [
  'deployment_lead',
  'technical_lead',
  'implementation_team',
  'support_team',
  'training_personnel',
  'escalation_contact',
  'customer_primary_contact',
]

export const REQUIRED_ASSIGNMENT_ROLES: AssignmentRole[] = ['deployment_lead', 'technical_lead', 'customer_primary_contact']

export const ASSIGNMENT_ROLE_LABEL: Record<AssignmentRole, string> = {
  deployment_lead: 'Deployment lead',
  technical_lead: 'Technical lead',
  implementation_team: 'Implementation team',
  support_team: 'Support team',
  training_personnel: 'Training personnel',
  escalation_contact: 'Escalation contact',
  customer_primary_contact: 'Customer-side primary contact',
}

export interface DeploymentAssignmentEntry {
  id: number
  role_key: AssignmentRole
  assignee_user_id: number | null
  assignee_name: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  assigned_at: string | null
}

export interface DeploymentWorkPlanDetail {
  scope: string | null
  facilities_included: string[] | null
  modules_included: string[] | null
  requires_migration: boolean
  integration_requirements: string | null
  training_plan: string | null
  target_start_date: string | null
  target_go_live_date: string | null
  hypercare_period_days: number | null
  stabilization_period_days: number | null
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface DeploymentApprovalEntry {
  id: number
  stage_number: number
  approval_type: string
  status: ApprovalStatus
  requested_at: string | null
  approved_at: string | null
  rejection_reason: string | null
}

export type ReadinessStatus = 'READY' | 'PARTIALLY_READY' | 'NOT_READY'

export interface ReadinessStatusDetail {
  status: ReadinessStatus
  total_items: number
  resolved_items: number
  failed_items: number
  open_issues: number
}

export type InformationStatus = 'COMPLETE' | 'INCOMPLETE'

export interface InformationStatusDetail {
  status: InformationStatus
  checklist_total: number
  checklist_resolved: number
  documents_total: number
  documents_resolved: number
  open_issues: number
}

export type AssignmentStatus = 'COMPLETE' | 'INCOMPLETE'

export interface AssignmentStatusDetail {
  status: AssignmentStatus
  filled_roles: AssignmentRole[]
  missing_required_roles: AssignmentRole[]
}

export type WorkOrderStatus = 'NO_WORK_PLAN' | 'PENDING_APPROVAL_REQUEST' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'

export interface WorkOrderStatusDetail {
  status: WorkOrderStatus
  has_work_plan: boolean
  approval_status: ApprovalStatus | null
}

// ---- Phase 4 — see HOSPITAL_PROVISIONING_FLOW.md ----

export type MigrationStatus = 'NOT_REQUIRED' | 'ASSESSMENT' | 'MAPPING' | 'CLEANING' | 'MIGRATING' | 'VALIDATION' | 'SIGNED_OFF' | 'FAILED'

// The settable statuses — NOT_REQUIRED is computed from the work plan's
// requires_migration flag, never written directly (mirrors the backend's
// DeploymentMigration::STATUSES, which also excludes it).
export const MIGRATION_STATUSES: MigrationStatus[] = ['ASSESSMENT', 'MAPPING', 'CLEANING', 'MIGRATING', 'VALIDATION', 'SIGNED_OFF', 'FAILED']

export interface MigrationStatusDetail {
  status: MigrationStatus
  requires_migration: boolean
  records_assessed: number | null
  records_migrated: number | null
  records_failed: number | null
  notes: string | null
}

export interface DeploymentMigrationDetail {
  status: MigrationStatus
  records_assessed: number | null
  records_migrated: number | null
  records_failed: number | null
  notes: string | null
}

export type ConfigurationStatus = 'COMPLETE' | 'INCOMPLETE'

export interface ConfigurationStatusDetail {
  status: ConfigurationStatus
  total_items: number
  resolved_items: number
  failed_items: number
}

export interface UserSetupStatusDetail {
  total_assignments: number
  has_hospital_admin: boolean
}

export type TrainingSessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'

export interface DeploymentTrainingSessionEntry {
  id: number
  title: string
  session_date: string | null
  trainer_name: string | null
  department: string | null
  user_group: string | null
  attendee_count: number | null
  materials_url: string | null
  notes: string | null
  status: TrainingSessionStatus
}

export type TrainingStatus = 'COMPLETE' | 'INCOMPLETE'

export interface TrainingStatusDetail {
  status: TrainingStatus
  total_sessions: number
  completed_sessions: number
  scheduled_sessions: number
}

// ---- Phase 5 — see HOSPITAL_PROVISIONING_FLOW.md ----

export type UatCaseStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'BLOCKED' | 'RETEST_REQUIRED' | 'NOT_APPLICABLE'

export const UAT_CASE_STATUSES: UatCaseStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'BLOCKED', 'RETEST_REQUIRED', 'NOT_APPLICABLE']

export interface DeploymentUatCaseEntry {
  id: number
  title: string
  description: string | null
  expected_result: string | null
  status: UatCaseStatus
  notes: string | null
  executed_at: string | null
}

export type DefectSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export const DEFECT_SEVERITIES: DefectSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

export type DefectStatus = 'OPEN' | 'RESOLVED'

export interface DeploymentUatDefectEntry {
  id: number
  uat_case_id: number | null
  title: string
  description: string | null
  severity: DefectSeverity
  status: DefectStatus
  resolved_at: string | null
}

export type UatStatus = 'COMPLETE' | 'INCOMPLETE'

export interface UatStatusDetail {
  status: UatStatus
  cases_total: number
  cases_resolved: number
  open_defects: number
  open_critical_defects: number
  approval_status: ApprovalStatus | null
}

// ---- Phase 6 — see HOSPITAL_PROVISIONING_FLOW.md ----

export type GoLiveRecordStatus = 'PLANNED' | 'LIVE' | 'ROLLED_BACK'
export const GO_LIVE_STATUSES: GoLiveRecordStatus[] = ['PLANNED', 'LIVE', 'ROLLED_BACK']

export interface DeploymentGoLiveDetail {
  planned_go_live_date: string | null
  actual_go_live_date: string | null
  go_live_window: string | null
  go_live_owner_id: number | null
  go_live_owner_name: string | null
  status: GoLiveRecordStatus
  rollback_notes: string | null
  notes: string | null
}

// The stage's own pass/fail state — distinct from GoLiveRecordStatus (the
// deployment_go_live row's PLANNED/LIVE/ROLLED_BACK lifecycle).
export type GoLiveReadiness = 'READY_FOR_GO_LIVE' | 'NOT_READY_FOR_GO_LIVE'

export interface GoLiveStatusDetail {
  status: GoLiveReadiness
  checklist_total: number
  checklist_resolved: number
  approval_status: ApprovalStatus | null
  has_actual_go_live_date: boolean
  has_support_contacts: boolean
}

export type PeriodRecordStatus = 'ACTIVE' | 'COMPLETED'

export interface DeploymentHypercareDetail {
  start_date: string | null
  end_date: string | null
  status: PeriodRecordStatus
  notes: string | null
}

export interface DeploymentStabilizationDetail {
  start_date: string | null
  end_date: string | null
  status: PeriodRecordStatus
  notes: string | null
}

// Shared shape for both Stage 12 (hypercare) and Stage 13 (stabilization).
export type PeriodStageStatus = 'COMPLETE' | 'INCOMPLETE'

export interface PeriodStatusDetail {
  status: PeriodStageStatus
  current_day: number | null
  total_days: number | null
  remaining_days: number | null
  period_elapsed: boolean
  open_incidents: number
}

export type IncidentCategory =
  | 'INCIDENT'
  | 'SUPPORT_REQUEST'
  | 'CONFIGURATION_FIX'
  | 'USER_ISSUE'
  | 'TRAINING_GAP'
  | 'INTEGRATION_ISSUE'
  | 'RECURRING_PROBLEM'
  | 'CUSTOMER_FEEDBACK'
  | 'OTHER'

export const INCIDENT_CATEGORIES: IncidentCategory[] = [
  'INCIDENT', 'SUPPORT_REQUEST', 'CONFIGURATION_FIX', 'USER_ISSUE',
  'TRAINING_GAP', 'INTEGRATION_ISSUE', 'RECURRING_PROBLEM', 'CUSTOMER_FEEDBACK', 'OTHER',
]

export const INCIDENT_CATEGORY_LABEL: Record<IncidentCategory, string> = {
  INCIDENT: 'Incident',
  SUPPORT_REQUEST: 'Support request',
  CONFIGURATION_FIX: 'Configuration fix',
  USER_ISSUE: 'User issue',
  TRAINING_GAP: 'Training gap',
  INTEGRATION_ISSUE: 'Integration issue',
  RECURRING_PROBLEM: 'Recurring problem',
  CUSTOMER_FEEDBACK: 'Customer feedback',
  OTHER: 'Other',
}

export type IncidentStatus = 'OPEN' | 'RESOLVED'

export interface DeploymentIncidentEntry {
  id: number
  stage_number: number
  category: IncidentCategory
  critical: boolean
  title: string
  description: string | null
  status: IncidentStatus
  resolved_at: string | null
  resolution_notes: string | null
}

// ---- Phase 7 — see HOSPITAL_PROVISIONING_FLOW.md ----

export interface DeploymentSignoffDetail {
  comments: string | null
  outstanding_items: string | null
  evidence_notes: string | null
}

export type SignoffStageStatus = 'COMPLETE' | 'INCOMPLETE'

export interface SignoffStatusDetail {
  status: SignoffStageStatus
  go_live_completed: boolean
  hypercare_completed: boolean
  stabilization_completed: boolean
  open_critical_incidents: number
  documents_status: 'COMPLETE' | 'INCOMPLETE'
  approval_status: ApprovalStatus | null
  has_signoff_record: boolean
}

// Read-only aggregation for display — every field already lives elsewhere.
export interface HandoverPackage {
  organization_name: string | null
  organization_id: string | null
  facility_name: string | null
  modules_included: string[] | null
  user_summary: UserSetupStatusDetail
  migration_status: MigrationStatus
  open_incidents: number
  resolved_incidents: number
  documents_total: number
  documents_resolved: number
  hypercare_period_days: number | null
  stabilization_period_days: number | null
  actual_go_live_date: string | null
}

export type HandoverStageStatus = 'COMPLETE' | 'INCOMPLETE'

export interface HandoverStatusDetail {
  status: HandoverStageStatus
  support_review_status: ApprovalStatus | null
  customer_service_review_status: ApprovalStatus | null
  acceptance_status: ApprovalStatus | null
}

export interface DeploymentReviewDetail {
  technical_review: string | null
  operational_review: string | null
  customer_review: string | null
  internal_review: string | null
  reviewed_at: string | null
}

export type ReviewStageStatus = 'COMPLETE' | 'INCOMPLETE'

export interface ReviewStatusDetail {
  status: ReviewStageStatus
  has_technical_review: boolean
  has_operational_review: boolean
  has_customer_review: boolean
  has_internal_review: boolean
}

// ---- Phase 8 — see HOSPITAL_PROVISIONING_FLOW.md ----

export interface DashboardDetail {
  progress_percentage: number
  current_blockers: number
  critical_issues: number
  next_actions: string[]
  target_go_live_date: string | null
  hypercare_summary: string
  stabilization_summary: string
}

export interface DeploymentCheckInEntry {
  id: number
  due_date: string | null
  completed_at: string | null
  notes: string | null
}

export interface CheckInStatusDetail {
  next_due_date: string | null
  is_overdue: boolean
  total_completed: number
}

export interface DeploymentDetail extends Deployment {
  provisioning_status: ProvisioningStatusDetail | null
  readiness_status: ReadinessStatusDetail
  information_status: InformationStatusDetail
  assignment_status: AssignmentStatusDetail
  work_order_status: WorkOrderStatusDetail
  migration_status: MigrationStatusDetail
  configuration_status: ConfigurationStatusDetail
  user_setup_status: UserSetupStatusDetail
  training_status: TrainingStatusDetail
  uat_status: UatStatusDetail
  go_live_status: GoLiveStatusDetail
  hypercare_status: PeriodStatusDetail
  stabilization_status: PeriodStatusDetail
  signoff_status: SignoffStatusDetail
  handover_package: HandoverPackage
  handover_status: HandoverStatusDetail
  review_status: ReviewStatusDetail
  stages: DeploymentStageEntry[]
  checklist_items: DeploymentChecklistItemEntry[]
  issues: DeploymentIssueEntry[]
  documents: DeploymentDocumentEntry[]
  assignments: DeploymentAssignmentEntry[]
  work_plan: DeploymentWorkPlanDetail | null
  approvals: DeploymentApprovalEntry[]
  migration: DeploymentMigrationDetail | null
  training_sessions: DeploymentTrainingSessionEntry[]
  uat_cases: DeploymentUatCaseEntry[]
  uat_defects: DeploymentUatDefectEntry[]
  go_live: DeploymentGoLiveDetail | null
  hypercare: DeploymentHypercareDetail | null
  stabilization: DeploymentStabilizationDetail | null
  incidents: DeploymentIncidentEntry[]
  signoff: DeploymentSignoffDetail | null
  review: DeploymentReviewDetail | null
  dashboard: DashboardDetail
  check_in_status: CheckInStatusDetail
  check_ins: DeploymentCheckInEntry[]
  events: DeploymentEventEntry[]
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface DeploymentListResponse {
  data: Deployment[]
  meta: PaginationMeta
}

export interface DeploymentShowResponse {
  data: DeploymentDetail
}

export interface CreateDeploymentPayload {
  organization_id?: string
  prospective_name?: string
}

export interface UpdateChecklistItemPayload {
  status: ChecklistItemStatus
  notes?: string
}

export interface CreateDeploymentDocumentPayload {
  title: string
  category?: string
}

export interface ReviewDeploymentDocumentPayload {
  status: DocumentStatus
  notes?: string
}

export interface CreateDeploymentAssignmentPayload {
  role_key: AssignmentRole
  assignee_user_id?: number
  contact_name?: string
  contact_email?: string
  contact_phone?: string
}

export interface UpsertWorkPlanPayload {
  scope?: string
  facilities_included?: string[]
  modules_included?: string[]
  requires_migration?: boolean
  integration_requirements?: string
  training_plan?: string
  target_start_date?: string
  target_go_live_date?: string
  hypercare_period_days?: number
  stabilization_period_days?: number
}

export interface RequestApprovalPayload {
  approval_type: string
  stage_number: number
}

export interface DecideApprovalPayload {
  decision: 'approved' | 'rejected'
  rejection_reason?: string
  notes?: string
}

export interface UpsertMigrationPayload {
  status: MigrationStatus
  records_assessed?: number
  records_migrated?: number
  records_failed?: number
  notes?: string
}

export interface CreateTrainingSessionPayload {
  title: string
  session_date?: string
  trainer_name?: string
  department?: string
  user_group?: string
  attendee_count?: number
  materials_url?: string
  notes?: string
}

export interface CreateUatCasePayload {
  title: string
  description?: string
  expected_result?: string
}

export interface UpdateUatCasePayload {
  title?: string
  description?: string
  expected_result?: string
  notes?: string
  status?: UatCaseStatus
}

export interface CreateUatDefectPayload {
  title: string
  description?: string
  severity: DefectSeverity
  uat_case_id?: number
}

export interface UpdateUatDefectPayload {
  title?: string
  description?: string
  severity?: DefectSeverity
  status?: DefectStatus
}

export interface UpsertGoLivePayload {
  planned_go_live_date?: string
  actual_go_live_date?: string
  go_live_window?: string
  go_live_owner_id?: number
  status?: GoLiveRecordStatus
  rollback_notes?: string
  notes?: string
}

export interface UpdatePeriodPayload {
  end_date?: string
  notes?: string
}

export interface CreateIncidentPayload {
  stage_number: number
  category: IncidentCategory
  critical?: boolean
  title: string
  description?: string
}

export interface UpdateIncidentPayload {
  title?: string
  description?: string
  category?: IncidentCategory
  critical?: boolean
  status?: IncidentStatus
  resolution_notes?: string
}

export interface UpsertSignoffPayload {
  comments?: string
  outstanding_items?: string
  evidence_notes?: string
}

export interface UpsertReviewPayload {
  technical_review?: string
  operational_review?: string
  customer_review?: string
  internal_review?: string
}

export interface CompleteCheckInPayload {
  notes?: string
}

export interface UpdateTrainingSessionPayload {
  title?: string
  session_date?: string
  trainer_name?: string
  department?: string
  user_group?: string
  attendee_count?: number
  materials_url?: string
  notes?: string
  status?: TrainingSessionStatus
}

export const DEPLOYMENT_STATUS_COLOR: Record<DeploymentStatus, string> = {
  DRAFT: 'grey',
  IN_PROGRESS: 'primary',
}

export const STAGE_STATUS_COLOR: Record<DeploymentStageStatus, string> = {
  PENDING: 'grey',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  BLOCKED: 'error',
}

export const PROVISIONING_STATUS_COLOR: Record<ProvisioningStatus, string> = {
  NOT_STARTED: 'grey',
  CORE_COMPLETE: 'success',
  PARTIALLY_PROVISIONED: 'warning',
  PROVISIONING_FAILED: 'error',
}

export const PROVISIONING_STATUS_LABEL: Record<ProvisioningStatus, string> = {
  NOT_STARTED: 'Not started',
  CORE_COMPLETE: 'Fully provisioned',
  PARTIALLY_PROVISIONED: 'Partially provisioned',
  PROVISIONING_FAILED: 'Provisioning failed',
}

export const CHECKLIST_ITEM_STATUS_COLOR: Record<ChecklistItemStatus, string> = {
  PENDING: 'grey',
  IN_PROGRESS: 'primary',
  PASSED: 'success',
  FAILED: 'error',
  NOT_APPLICABLE: 'grey',
  BLOCKED: 'error',
}

export const DOCUMENT_STATUS_COLOR: Record<DocumentStatus, string> = {
  REQUIRED: 'grey',
  UPLOADED: 'primary',
  UNDER_REVIEW: 'warning',
  VERIFIED: 'success',
  APPROVED: 'success',
  REJECTED: 'error',
  NOT_APPLICABLE: 'grey',
}

export const APPROVAL_STATUS_COLOR: Record<ApprovalStatus, string> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
}

export const READINESS_STATUS_COLOR: Record<ReadinessStatus, string> = {
  READY: 'success',
  PARTIALLY_READY: 'warning',
  NOT_READY: 'error',
}

export const READINESS_STATUS_LABEL: Record<ReadinessStatus, string> = {
  READY: 'Ready',
  PARTIALLY_READY: 'Partially ready',
  NOT_READY: 'Not ready',
}

export const INFORMATION_STATUS_COLOR: Record<InformationStatus, string> = {
  COMPLETE: 'success',
  INCOMPLETE: 'warning',
}

export const ASSIGNMENT_STATUS_COLOR: Record<AssignmentStatus, string> = {
  COMPLETE: 'success',
  INCOMPLETE: 'warning',
}

export const WORK_ORDER_STATUS_COLOR: Record<WorkOrderStatus, string> = {
  NO_WORK_PLAN: 'grey',
  PENDING_APPROVAL_REQUEST: 'grey',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
}

export const WORK_ORDER_STATUS_LABEL: Record<WorkOrderStatus, string> = {
  NO_WORK_PLAN: 'No work plan yet',
  PENDING_APPROVAL_REQUEST: 'Work plan drafted',
  PENDING_APPROVAL: 'Awaiting approval',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

export const MIGRATION_STATUS_COLOR: Record<MigrationStatus, string> = {
  NOT_REQUIRED: 'grey',
  ASSESSMENT: 'primary',
  MAPPING: 'primary',
  CLEANING: 'primary',
  MIGRATING: 'primary',
  VALIDATION: 'warning',
  SIGNED_OFF: 'success',
  FAILED: 'error',
}

export const MIGRATION_STATUS_LABEL: Record<MigrationStatus, string> = {
  NOT_REQUIRED: 'Not required',
  ASSESSMENT: 'Assessment',
  MAPPING: 'Data mapping',
  CLEANING: 'Data cleaning',
  MIGRATING: 'Migrating',
  VALIDATION: 'Validation',
  SIGNED_OFF: 'Signed off',
  FAILED: 'Failed',
}

export const CONFIGURATION_STATUS_COLOR: Record<ConfigurationStatus, string> = {
  COMPLETE: 'success',
  INCOMPLETE: 'warning',
}

export const TRAINING_STATUS_COLOR: Record<TrainingStatus, string> = {
  COMPLETE: 'success',
  INCOMPLETE: 'warning',
}

export const TRAINING_SESSION_STATUS_COLOR: Record<TrainingSessionStatus, string> = {
  SCHEDULED: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'grey',
}

export const UAT_CASE_STATUS_COLOR: Record<UatCaseStatus, string> = {
  NOT_STARTED: 'grey',
  IN_PROGRESS: 'primary',
  PASSED: 'success',
  FAILED: 'error',
  BLOCKED: 'error',
  RETEST_REQUIRED: 'warning',
  NOT_APPLICABLE: 'grey',
}

export const DEFECT_SEVERITY_COLOR: Record<DefectSeverity, string> = {
  CRITICAL: 'error',
  HIGH: 'error',
  MEDIUM: 'warning',
  LOW: 'grey',
}

export const DEFECT_STATUS_COLOR: Record<DefectStatus, string> = {
  OPEN: 'warning',
  RESOLVED: 'success',
}

export const UAT_STATUS_COLOR: Record<UatStatus, string> = {
  COMPLETE: 'success',
  INCOMPLETE: 'warning',
}

export const GO_LIVE_READINESS_COLOR: Record<GoLiveReadiness, string> = {
  READY_FOR_GO_LIVE: 'success',
  NOT_READY_FOR_GO_LIVE: 'warning',
}

export const GO_LIVE_READINESS_LABEL: Record<GoLiveReadiness, string> = {
  READY_FOR_GO_LIVE: 'Ready for go-live',
  NOT_READY_FOR_GO_LIVE: 'Not ready',
}

export const GO_LIVE_RECORD_STATUS_COLOR: Record<GoLiveRecordStatus, string> = {
  PLANNED: 'grey',
  LIVE: 'success',
  ROLLED_BACK: 'error',
}

export const PERIOD_STAGE_STATUS_COLOR: Record<PeriodStageStatus, string> = {
  COMPLETE: 'success',
  INCOMPLETE: 'warning',
}

export const INCIDENT_STATUS_COLOR: Record<IncidentStatus, string> = {
  OPEN: 'warning',
  RESOLVED: 'success',
}

export const SIGNOFF_STAGE_STATUS_COLOR: Record<SignoffStageStatus, string> = {
  COMPLETE: 'success',
  INCOMPLETE: 'warning',
}

export const HANDOVER_STAGE_STATUS_COLOR: Record<HandoverStageStatus, string> = {
  COMPLETE: 'success',
  INCOMPLETE: 'warning',
}

export const REVIEW_STAGE_STATUS_COLOR: Record<ReviewStageStatus, string> = {
  COMPLETE: 'success',
  INCOMPLETE: 'warning',
}
