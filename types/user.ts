// Mirrors UserController::present() on the backend.

export interface PlatformUserTenantRole {
  organization_id: string
  organization_name: string | null
  role_key: string
}

export interface PlatformUser {
  id: number
  name: string
  username: string | null
  email: string
  // Company-staff account type (system_admin/developer/tester/qa/
  // provisioning_admin), or null
  // for a hospital tenant user (whose access comes from tenant_roles below).
  platform_role: string | null
  core_user_id: string | null
  tenant_roles: PlatformUserTenantRole[]
  created_at: string | null
}

export interface UserListMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface UserListResponse {
  data: PlatformUser[]
  meta: UserListMeta
}

// A root admin is shown exactly like a system admin everywhere.
export function displayPlatformRole(role: string | null): string | null {
  return role === 'root_admin' ? 'system_admin' : role
}

export const PLATFORM_ROLE_COLOR: Record<string, string> = {
  root_admin: 'secondary',
  system_admin: 'secondary',
  developer: 'primary',
  tester: 'info',
  qa: 'info',
  provisioning_admin: 'success',
}
