import { useNuxtApp } from '#app'

// Mirrors App\Http\Controllers\Api\V1\Root\* on the backend. Root admin only.

export interface Paginated<T> {
  data: T[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

export interface RootOverview {
  cards: {
    critical_open: number
    pending: number
    being_worked: number
    found_this_week: number
    closed_this_week: number
    admins_active_today: number
    admins_total: number
    admins_suspended: number
    hospitals_live: number
    hospitals_provisioning: number
  }
  attention: { kind: 'critical_report' | 'stuck_provisioning'; message: string; ref: string | null }[]
  recent_activity: {
    id: string
    created_at: string
    actor: string | null
    action: string
    target_type: string | null
    target_id: string | null
    reason: string | null
  }[]
}

export interface RootAdminAccount {
  id: number
  name: string
  username: string | null
  email: string
  platform_role: string | null
  hospital_admin_of: { organization_id: string; organization_name: string | null }[]
  suspended: boolean
  suspended_at: string | null
  last_login_at: string | null
  created_at: string | null
}

export interface OpenReport {
  reference: string | null
  ticket_id: string
  title: string
  type: string
  severity: string | null
  module: string
  status: string
  assignee: string | null
  created_at: string
}

export interface IssueStats {
  period: { from: string; to: string }
  totals: {
    found: number
    sorted_in_period: number
    pending: number
    being_worked: number
    sorted: number
    duplicates: number
  }
  by_status: Record<string, number>
  by_type: Record<string, number>
  by_severity: Record<string, number>
  by_module: Record<string, number>
  daily: { date: string; found: number; sorted: number }[]
  time_to_sort_hours: { count: number; median: number | null; p90: number | null }
  critical_open: OpenReport[]
  oldest_open: OpenReport[]
  workload: { user_id: number; name: string | null; open: number; sorted_in_period: number }[]
  other_sources: Record<'feedback' | 'deployment_issues' | 'deployment_incidents' | 'uat_defects', { found: number; open: number }>
}

export interface AuditEvent {
  id: string
  created_at: string
  actor: { id: number; name: string; username: string | null } | null
  actor_role: string | null
  action: string
  target_type: string | null
  target_id: string | null
  organization_id: string | null
  reason: string | null
  metadata: Record<string, unknown> | null
  ip: string | null
}

export function useRootAdminApi() {
  const { $axios } = useNuxtApp()

  async function overview(): Promise<RootOverview> {
    const { data } = await $axios.get('/v1/root/overview')
    return data.data
  }

  async function admins(params: { page?: number; per_page?: number; search?: string; role?: string; status?: string }): Promise<Paginated<RootAdminAccount>> {
    const { data } = await $axios.get('/v1/root/admins', { params })
    return data
  }

  async function updateAdmin(id: number, input: { platform_role?: string; suspended?: boolean; reason: string }): Promise<RootAdminAccount> {
    const { data } = await $axios.patch(`/v1/root/admins/${id}`, input)
    return data.data
  }

  async function revokeSessions(id: number, reason: string): Promise<number> {
    const { data } = await $axios.post(`/v1/root/admins/${id}/revoke-sessions`, { reason })
    return data.data.revoked
  }

  async function issueStats(params: { from?: string; to?: string; type?: string; severity?: string; module?: string }): Promise<IssueStats> {
    const { data } = await $axios.get('/v1/root/stats/issues', { params })
    return data.data
  }

  async function audit(params: { page?: number; per_page?: number; action?: string; actor_user_id?: number; from?: string; to?: string }): Promise<Paginated<AuditEvent>> {
    const { data } = await $axios.get('/v1/root/audit', { params })
    return data
  }

  /** Downloads the filtered audit log as CSV (needs the auth header, so via axios). */
  async function exportAudit(params: { action?: string; from?: string; to?: string }): Promise<void> {
    const { data } = await $axios.get('/v1/root/audit/export', { params, responseType: 'blob' })
    const url = URL.createObjectURL(data as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { overview, admins, updateAdmin, revokeSessions, issueStats, audit, exportAudit }
}
