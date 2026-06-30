// Types mirroring the HMIS backend tenant-management API.
// Backend surface (Laravel + Sanctum):
//   POST /v1/platform/auth/tokens   -> issue a tenant-scoped Bearer token
//   GET  /v1/platform/tenant-context -> read the tenant claims of the current token

export interface IssueTokenRequest {
  email: string
  password: string
  organization_id: string
  active_facility_id: string
  token_name?: string
}

export interface IssueTokenResponse {
  data: {
    token_type: 'Bearer'
    access_token: string
    organization_id: string
    active_facility_id: string
  }
}

export interface TenantFacilityRef {
  id: string
  name: string
}

export interface TenantContext {
  organization_id: string
  organization_name?: string
  allowed_facility_ids: string[]
  active_facility_id: string
  request_id: string
  // Human-readable names for the facilities in this session (id -> name).
  facilities?: TenantFacilityRef[]
}

export interface TenantContextResponse {
  data: {
    tenant_context: TenantContext
  }
}

// Error `code` values returned by the backend (see TenantTokenController / TenantContext middleware).
export type TenancyErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'TENANT_SCOPE_DENIED'
  | 'UNAUTHENTICATED'
  | 'TOKEN_CONTEXT_MISSING'
  | 'INVALID_TENANT_CLAIMS'
  | 'FACILITY_CLAIM_MISMATCH'
  | 'TENANT_HEADER_MISMATCH'
  | 'FACILITY_HEADER_MISMATCH'

export interface TenancyApiError {
  message: string
  code: TenancyErrorCode | string
}

// Friendly, user-facing messages keyed by backend error code.
export const TENANCY_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'The email or password you entered is incorrect.',
  TENANT_SCOPE_DENIED: 'You are not assigned to this organization or facility.',
  UNAUTHENTICATED: 'Your session has expired. Please sign in again.',
  TOKEN_CONTEXT_MISSING: 'Your session token is missing tenant context. Please sign in again.',
  INVALID_TENANT_CLAIMS: 'Your session token is missing required tenant claims.',
  FACILITY_CLAIM_MISMATCH: 'The selected facility is not allowed for your account.',
  TENANT_HEADER_MISMATCH: 'Tenant context mismatch detected. Please sign in again.',
  FACILITY_HEADER_MISMATCH: 'Facility context mismatch detected. Please sign in again.',
}

export function tenancyErrorMessage(code?: string, fallback = 'Something went wrong.'): string {
  if (code && TENANCY_ERROR_MESSAGES[code]) return TENANCY_ERROR_MESSAGES[code]
  return fallback
}
