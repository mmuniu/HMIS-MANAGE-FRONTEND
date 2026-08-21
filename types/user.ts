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
  // Company-staff account type (system_admin/developer/tester/qa), or null
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

export const PLATFORM_ROLE_COLOR: Record<string, string> = {
  system_admin: 'secondary',
  developer: 'primary',
  tester: 'info',
  qa: 'info',
}
