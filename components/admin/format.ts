// Shared formatting for the Admin console tabs.

export function fmtDateTime(iso: string | null): string {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

export function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'
}

const ACTION_LABELS: Record<string, string> = {
  'auth.login': 'signed in',
  'admin.role_changed': 'changed an admin’s role',
  'admin.suspended': 'suspended an admin',
  'admin.reactivated': 'reactivated an admin',
  'admin.sessions_revoked': 'signed an admin out everywhere',
  'http.post': 'created or ran something',
  'http.put': 'updated something',
  'http.patch': 'updated something',
  'http.delete': 'deleted something',
}

export function describeAction(action: string): string {
  return ACTION_LABELS[action] ?? action
}

// Role names as shown in the console. A root admin reads as "System Admin",
// the same as everywhere else in the app.
export const ROLE_OPTIONS = [
  { value: 'system_admin', title: 'System Admin' },
  { value: 'developer', title: 'Developer' },
  { value: 'tester', title: 'Tester' },
  { value: 'qa', title: 'QA' },
  { value: 'provisioning_admin', title: 'Provisioning Admin' },
  { value: 'deployment_viewer', title: 'Deployment Viewer' },
]

export function roleTitle(role: string | null): string {
  if (role === null) return 'Hospital Admin'
  if (role === 'root_admin') return 'System Admin'
  return ROLE_OPTIONS.find((r) => r.value === role)?.title ?? role
}
