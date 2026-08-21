// Mirrors TenantBrandingController::resolve() on the backend.

export interface TenantBranding {
  id: string
  name: string
}

export interface TenantBrandingResponse {
  data: TenantBranding | null
}
