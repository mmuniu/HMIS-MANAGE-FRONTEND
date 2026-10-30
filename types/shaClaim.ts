import type { PaginationMeta } from './hospital'

/** The four stages ShaClaim::STATUSES groups its 14 statuses into. */
export type ShaStage = 'action_required' | 'in_progress' | 'adjudicated' | 'closed'

/** One entry of the status dictionary patient-evaluation-service sends down. */
export interface ShaStatusMeta {
  value: string
  title: string
  /** A Vuetify colour name — the backend owns it so both UIs agree. */
  colour: string
  stage: ShaStage
}

export interface ShaAmounts {
  claimed: number
  approved: number
  rejected: number
  paid: number
  outstanding: number
  awaiting_payment: number
}

export interface ShaSummary {
  total: number
  action_required: number
  sent_back: number
  in_progress: number
  adjudicated: number
  closed: number
  overdue: number
  by_status: Record<string, number>
  amounts: ShaAmounts
}

/** One facility's block on the page. Names are attached by manage. */
export interface ShaFacilitySummary {
  facility_id: number | null
  organization_id: number | null
  facility_name: string | null
  hospital_name: string | null
  manage_facility_id: string | null
  manage_organization_id: string | null
  total: number
  by_status: Record<string, number>
  action_required: number
  in_progress: number
  adjudicated: number
  closed: number
  overdue: number
  amounts: ShaAmounts
  last_synced_at: string | null
  last_submitted_at: string | null
}

export interface ShaOverview {
  summary: ShaSummary
  statuses: ShaStatusMeta[]
  by_facility: ShaFacilitySummary[]
}

export interface ShaClaimRow {
  id: number
  visit_id: number
  facility_id: number | null
  organization_id: number | null
  facility_name: string | null
  hospital_name: string | null
  provider_claim_no: string | null
  sha_claim_id: string | null
  tracking_number: string | null
  member_number: string | null
  package_code: string | null
  intervention_code: string | null
  service_type: string | null
  inpatient: boolean
  claim_amount: string | null
  net_amount: string | null
  approved_amount: string | null
  rejected_amount: string | null
  paid_amount: string | null
  status: string
  status_label: string
  status_colour: string
  stage: ShaStage
  provider_state: string | null
  payer_state: string | null
  times_sent_back: number
  resubmissions: number
  first_submitted_at: string | null
  submitted_at: string | null
  status_changed_at: string | null
  last_synced_at: string | null
  last_sync_error: string | null
}

export interface ShaClaimListResponse {
  data: ShaClaimRow[]
  meta: PaginationMeta & { from: number | null; to: number | null }
}

export interface ShaClaimQuery {
  facility_id?: number | null
  organization_id?: number | null
  unassigned?: boolean
  status?: string
  stage?: ShaStage | ''
  q?: string
  page?: number
  per_page?: number
}
