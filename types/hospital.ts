// Mirrors HospitalController::present() on the backend.

export type HospitalStatus = 'PROVISIONING' | 'ACTIVE' | 'MAINTENANCE' | 'ARCHIVED'
export type SubscriptionTier = 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
export type BillingStatus = 'ACTIVE' | 'PAST_DUE' | 'SUSPENDED'

export interface HospitalAddress {
  line1?: string
  city?: string
  country?: string
  [key: string]: unknown
}

export interface Hospital {
  id: string
  tenant_id: string
  subdomain: string | null
  custom_domain: string | null
  name: string
  legal_name: string | null
  display_name: string | null
  timezone: string
  locale: string
  address: HospitalAddress | null
  subscription_tier: SubscriptionTier
  billing_status: BillingStatus
  max_user_slots: number
  max_patient_records: number
  status: HospitalStatus
  is_sandbox: boolean
  core_org_id: string | null
  created_at: string | null
  updated_at: string | null
}

// A facility as gathered during provisioning (bed capacity, facility
// administrator contact) — only present on the show() detail response.
export interface HospitalFacility {
  id: string
  name: string
  status: string
  core_facility_id: string | null
  facility_code: string | null
  keph_level: string | null
  total_beds: number | null
  normal_beds: number | null
  icu_beds: number | null
  hdu_beds: number | null
  dialysis_beds: number | null
  number_of_cots: number | null
  facility_administrator_name: string | null
  facility_administrator_email: string | null
  facility_administrator_phone: string | null
  facility_administrator_identifier: string | null
}

// A hospital-admin account assigned to the organization — only present on
// the show() detail response.
export interface HospitalAdminUser {
  id: number
  name: string
  username: string
  email: string
  // null = never provisioned in core-service — the detail page offers a
  // one-off "provision this admin" action in that case.
  core_user_id: string | null
}

// Response of POST /v1/platform/hospitals/{id}/admins/{userId}/provision.
// `password` is a freshly generated temporary password — shown once, the
// same "won't be shown again" contract as the registration wizard.
export interface ProvisionAdminResponse {
  data: { id: number; username: string; email: string; core_user_id: string }
  password: string
}

export interface UpdateAdminPayload {
  name?: string
  username?: string
  email?: string
}

// Response of PATCH /v1/platform/hospitals/{id}/admins/{userId}.
// `notified` reports whether the "your details changed" email actually went
// out — it can be false if nothing in the payload differed from before.
export interface UpdateAdminResponse {
  data: HospitalAdminUser
  notified: boolean
}

// GET /v1/platform/hospitals/{id} returns everything gathered during
// provisioning, not just the bare organization fields list() gives back.
export interface HospitalDetail extends Hospital {
  facilities: HospitalFacility[]
  admins: HospitalAdminUser[]
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface HospitalListResponse {
  data: Hospital[]
  meta: PaginationMeta
}

export interface HospitalShowResponse {
  data: HospitalDetail
}

// First facility, matching the extra registry fields on the `facilities` table
// (mirrors collabmed2.0's settings/clinics facility form, minus the live
// DHA/SHA registry search — these are plain editable inputs here).
export interface HospitalFacilityPayload {
  name: string
  facility_code?: string
  keph_level?: string
  total_beds?: number
  normal_beds?: number
  icu_beds?: number
  hdu_beds?: number
  dialysis_beds?: number
  number_of_cots?: number
  facility_administrator_name?: string
  facility_administrator_email?: string
  facility_administrator_phone?: string
  facility_administrator_identifier?: string
}

// Raw shape returned by the DHA SHA HIE facility registry
// (GET /v1/platform/hospitals/facility-search), confirmed against a real
// DHA UAT response — field names mirror collabmed2.0's applyFacility().
export interface FacilityRegistryResult {
  officialName?: string
  frCode?: string
  kephLevel?: string
  address?: {
    town?: string
    postalAddress?: string
    physicalLocation?: string
    latitude?: number | string
    longitude?: number | string
  }
  facilityPhoneNumber?: string
  facilityEmail?: string
  regulatoryOperationalStatus?: { operationalStatus?: string }
  SHAOperationStatus?: {
    operationalStatus?: string
    operationalStatusReason?: string
    suspensionReason?: string
    reinstatementRecommendations?: string
    earliestReinstatementDate?: string
  }
  bedOccupancy?: {
    totalBeds?: number
    normalBeds?: number
    icuBeds?: number
    hduBeds?: number
    dialysisBeds?: number
    numberOfCots?: number
  }
  facilityAdministratorName?: string
  facilityAdministratorEmail?: string
  facilityAdministratorPhone?: string
  facilityAdministratorIdentifier?: string
}

// Envelope shape every ShaHieClient call returns, passed straight through
// by HospitalController::searchFacility().
export interface FacilityRegistrySearchResponse {
  ok: boolean
  status: number | null
  data: FacilityRegistryResult | FacilityRegistryResult[] | null
  error: string | null
}

// Payload for POST /v1/platform/hospitals (matches StoreHospitalRequest).
export interface CreateHospitalPayload {
  // identity & localization
  name: string
  legal_name?: string
  display_name?: string
  timezone?: string
  locale?: string
  address?: HospitalAddress
  // isolation
  subdomain?: string
  custom_domain?: string
  // billing & tiering
  subscription_tier?: SubscriptionTier
  billing_status?: BillingStatus
  payment_gateway_customer_id?: string
  max_user_slots?: number
  max_patient_records?: number
  // system
  status?: HospitalStatus
  is_sandbox?: boolean
  // optional first facility + admin
  facility?: HospitalFacilityPayload
  admin?: { name: string; username: string; email: string; password: string }
}

// Payload for PUT /v1/platform/hospitals/{id} (matches UpdateHospitalRequest).
// Organization-level fields only — editing facilities/admin accounts is a
// separate concern, not part of this form.
export interface UpdateHospitalPayload {
  name?: string
  legal_name?: string
  display_name?: string
  timezone?: string
  locale?: string
  address?: HospitalAddress
  subdomain?: string
  custom_domain?: string
  subscription_tier?: SubscriptionTier
  billing_status?: BillingStatus
  payment_gateway_customer_id?: string
  max_user_slots?: number
  max_patient_records?: number
  status?: HospitalStatus
  is_sandbox?: boolean
}

export interface UpdateHospitalResponse {
  data: Hospital
}

export interface CreateHospitalResponse {
  data: Hospital
  facility: { id: string; name: string; core_facility_id: string | null } | null
  admin: { id: number; username: string; email: string } | null
  core_provisioned: boolean
  core_provisioning_error: string | null
}

// Response of POST /v1/platform/hospitals/{id}/provision (retry).
export interface RetryProvisioningResponse {
  data: Hospital
  facility: { id: string; name: string; core_facility_id: string | null } | null
  core_provisioned: boolean
  core_provisioning_error: string | null
}

// Vuetify chip colors per enum value (used in list + detail views).
export const STATUS_COLOR: Record<HospitalStatus, string> = {
  PROVISIONING: 'info',
  ACTIVE: 'success',
  MAINTENANCE: 'warning',
  ARCHIVED: 'grey',
}

export const TIER_COLOR: Record<SubscriptionTier, string> = {
  BASIC: 'grey',
  PREMIUM: 'primary',
  ENTERPRISE: 'secondary',
}

export const BILLING_COLOR: Record<BillingStatus, string> = {
  ACTIVE: 'success',
  PAST_DUE: 'warning',
  SUSPENDED: 'error',
}
