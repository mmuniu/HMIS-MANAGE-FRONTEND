export type ReportType = 'bug' | 'feature'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type ReportStatus =
  | 'new' | 'under_review' | 'assigned' | 'in_progress' | 'resolved' | 'delivered' | 'closed'

export const MODULES = [
  'Dashboard', 'Patients', 'Appointments', 'Billing', 'Pharmacy',
  'Laboratory', 'Radiology', 'Admissions', 'Reports', 'Settings', 'Other',
]

export const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical']

export const STATUS_LABELS: Record<ReportStatus, string> = {
  new: 'Raised',
  under_review: 'Under Review',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  delivered: 'Delivered',
  closed: 'Closed',
}

export const STATUS_COLORS: Record<ReportStatus, string> = {
  new: 'info',
  under_review: 'primary',
  assigned: 'secondary',
  in_progress: 'warning',
  resolved: 'success',
  delivered: 'teal',
  closed: 'grey',
}

// Lifecycle order for a progress stepper (raised -> assigned -> ... -> delivered).
export const STATUS_FLOW: ReportStatus[] = [
  'new', 'under_review', 'assigned', 'in_progress', 'resolved', 'delivered', 'closed',
]

export const SEVERITY_COLORS: Record<Severity, string> = {
  low: 'grey',
  medium: 'info',
  high: 'warning',
  critical: 'error',
}

export interface ReportAttachment {
  id: number
  kind: 'image' | 'video'
  original_name: string
  mime_type: string
  size: number
  url: string
}

export interface ReportComment {
  id: number
  author: string | null
  body: string
  is_internal: boolean
  created_at: string | null
}

export interface StatusHistoryEntry {
  from_status: string | null
  to_status: string
  changed_by: string | null
  at: string | null
}

export interface ReportSummary {
  id: number
  ticket_id: string
  type: ReportType
  title: string
  module: string
  severity: Severity | null
  status: ReportStatus
  reporter: string | null
  assignee: string | null
  created_at: string | null
  updated_at: string | null
}

export interface LinkedTestCase {
  id: number
  case_id: string
  title: string
  suite_slug: string | null
}

export interface ReportDetail extends ReportSummary {
  description: string
  browser: string | null
  os: string | null
  page_url: string | null
  duplicate_of: number | null
  test_case: LinkedTestCase | null
  closed_at: string | null
  attachments: ReportAttachment[]
  comments: ReportComment[]
  status_history: StatusHistoryEntry[]
}

export interface CreateReportInput {
  type: ReportType
  title: string
  description: string
  severity?: Severity | null
  module: string
  browser?: string
  os?: string
  page_url?: string
  test_case_id?: number | null // auto-set when logging from a failed test case
  files: File[]
}
