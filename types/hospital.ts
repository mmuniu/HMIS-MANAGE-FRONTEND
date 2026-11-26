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
  // Which v3 system this hospital was provisioned into (key + display label).
  v3_target: string
  v3_target_label: string
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
  // Release key (regular, beta, ...); regular when none was chosen.
  release_mode?: string
  // The facility's code in core-service, read live on the hospital page;
  // typed to confirm a release change.
  core_code?: string | null
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

// core-service's account for an admin found there under an email/username
// hmis-manage tried to create — surfaced when provisioning (or a password
// reset that tries to provision) fails as "already exists".
export interface ExistingCoreAccount {
  id: string
  email: string
  username: string
  name: string | null
  organization_id: number | null
  active: boolean
  facilities: { id: number; name: string; code: string | null }[]
}

export interface LinkAdminResponse {
  data: { id: number; username: string; email: string; core_user_id: string }
}

export interface UpdateAdminPayload {
  name?: string
  username?: string
  email?: string
  // Optional password reset. If this admin has no core_user_id yet, the
  // backend creates their core-service account with this password and the
  // notification email tells them to use it there — otherwise it can only
  // change their local hmis-manage password (no core-service update
  // endpoint exists), and the email says so explicitly.
  password?: string
}

export interface CreateAdminPayload {
  name: string
  username: string
  email: string
  password: string
}

// Response of POST /v1/platform/hospitals/{id}/admins.
export interface CreateAdminResponse {
  data: HospitalAdminUser
}

// Response of POST /v1/platform/hospitals/{id}/facilities. Saved locally
// even when core-service provisioning fails — the error says why.
export interface CreateFacilityResponse {
  data: HospitalFacility
  core_provisioned: boolean
  core_provisioning_error: string | null
}

// Response of PATCH /v1/platform/hospitals/{id}/admins/{userId}.
// `notified` reports whether the "your details changed" email actually went
// out — it can be false if nothing in the payload differed from before.
export interface UpdateAdminResponse {
  data: HospitalAdminUser
  notified: boolean
  // Echoed back only when the edit included a password reset — never
  // persisted anywhere, shown once in a copy-once credentials panel.
  password: string | null
  // True only when `password` actually reached core-service. Even then it's
  // a ONE-TIME key there — core-service forces a password reset on first
  // login with it — so the UI must say that, not imply it's an ongoing login.
  password_usable_for_core_service: boolean
  // Present only when this admin had no core-service account yet AND the
  // attempt to create one above failed as a duplicate — see ProvisionAdmin's
  // matching failure shape (thrown as an axios error, not a 2xx body, since
  // this only happens on the same 502 provisionAdmin() itself returns).
  existing_core_account?: ExistingCoreAccount | null
}

// GET /v1/platform/hospitals/{id} returns everything gathered during
// provisioning, not just the bare organization fields list() gives back.
export interface HospitalDetail extends Hospital {
  facilities: HospitalFacility[]
  admins: HospitalAdminUser[]
}

// A core-service tenant with no hospital in hmis-manage — set up directly on
// the core platform (GET /v1/platform/hospitals/terminal).
export interface TerminalHospital {
  id: number | string
  name: string
  code: string | null
  status: string | null
  // The v3 stack this tenant lives on (core ids are only unique per stack).
  v3_target: string
  v3_target_label: string
  // Release modes of its facilities (beta/regular). Absent when that stack's
  // core-service predates release modes.
  release_modes?: ReleaseMode[]
}

// A release key: 'regular', 'beta' or any release a system admin added on
// the Systems page.
export type ReleaseMode = string

// One release of one system (GET /hospitals/releases).
export interface SystemRelease {
  id: number
  v3_target: string
  v3_target_label: string
  key: string
  label: string
  app_url: string | null
  cookie_domain: string | null
  notes: string | null
  active: boolean
  protected: boolean
  // Whether facilities can be moved to it from a hospital's page.
  selectable?: boolean
  // The system's default release (regular): only facilities on it can be moved.
  default?: boolean
}

// A terminal hospital's facility, as core-service has it. code is its code
// there (typed to confirm a release change); release_mode and code are
// absent on a core-service that predates releases.
export interface TerminalFacility {
  id: number
  name: string
  code?: string | null
  mfl_code: string | null
  status: string | null
  release_mode?: string | null
  created_at?: string | null
}

// GET /hospitals/terminal/{target}/{coreOrgId} — one terminal hospital as
// core-service describes it. facilities/users/admins are null when that
// stack's core-service predates the detail endpoint (details_available false).
export interface TerminalHospitalDetail {
  core_org_id: string
  v3_target: string
  v3_target_label: string
  details_available: boolean
  organization: {
    id: number | string
    name: string
    code?: string | null
    type?: string | null
    status?: string | null
    registration_number?: string | null
    tax_number?: string | null
    phone?: string | null
    email?: string | null
    website?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
    country?: string | null
    postal_code?: string | null
    created_at?: string | null
    updated_at?: string | null
  }
  facilities: TerminalFacility[] | null
  users: { total: number; active: number } | null
  admins: {
    id: number; name: string; username: string | null; email: string | null
    active: boolean; is_owner: boolean; roles: string[]; last_login: string | null
  }[] | null
  // Set when a hospital here is linked to this organization after all.
  registered_hospital: { id: string; name: string } | null
}

export interface TerminalHospitalListResponse {
  data: TerminalHospital[]
  // Stacks whose core-service couldn't be reached — their tenants are missing.
  meta: { total: number; unavailable: { v3_target: string; v3_target_label: string }[] }
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface HospitalListResponse {
  data: Hospital[]
  // unavailable: with ?release=, stacks that couldn't be asked about their
  // facilities' release, so their hospitals are left out.
  meta: PaginationMeta & { unavailable?: { v3_target: string; v3_target_label: string }[] }
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
  // One of the system's active releases; omitted = regular.
  release_mode?: string
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
  // set when the wizard was launched from a deployment's Stage 6
  deployment_id?: string
  // Step 1's "Use existing organization" toggle — a core_organizations.id
  // from GET /hospitals/core-organizations. hmis-manage still creates its
  // own local Organization row from `name` above either way; this only
  // tells core-service provisioning to attach the new facility/admin to an
  // organization that already exists there instead of minting a new one.
  existing_core_org_id?: number
  // Sent after the user saw the similar-name suggestions and chose to continue.
  confirm_similar?: boolean
  // Key of the v3 system to provision into (GET /hospitals/v3-targets).
  // Omitted = the default (production) system.
  v3_target?: string
  // optional first facility + admin
  facility?: HospitalFacilityPayload
  admin?: { name: string; username: string; email: string; password: string }
}

// One row from GET /hospitals/v3-targets — a v3 system a hospital can be
// provisioned into. `default` is the production system.
export interface V3Target {
  key: string
  label: string
  default: boolean
}

// One row from GET /hospitals/core-organizations — plain id/name/code/status,
// not the full core-service Organization record (see
// ServiceOrganizationController::index() in core-service for why).
export interface CoreOrganization {
  id: number
  name: string
  code: string
  status: string
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
  // Whether the admin account exists in the v3 system (null = no admin was
  // created). false = they can't log in there yet.
  admin_core_provisioned: boolean | null
  core_provisioning_error: string | null
}

// POST /v1/platform/hospitals/{id}/link-core: connect a hospital to an
// organization + facility that already exist in the v3 system.
export interface LinkCorePayload {
  core_org_id: number
  core_facility_id: number
  confirm_name_mismatch?: boolean
}
export interface LinkCoreResponse {
  data: Hospital
  facility: HospitalFacility
  // updated | unchanged | skipped_has_code | skipped_code_in_use | skipped_name_mismatch | no_fid_here | error
  fid_status: string
  fid_error: string | null
}

// Response of POST /v1/platform/hospitals/{id}/provision (retry).
export interface RetryProvisioningResponse {
  data: Hospital
  facility: { id: string; name: string; core_facility_id: string | null } | null
  core_provisioned: boolean
  core_provisioning_error: string | null
}

// Response of POST /v1/platform/hospitals/{id}/seed-reference-data — the
// seeders now run on the queue (a full run takes well over any reasonable
// HTTP timeout), so this only confirms the run was queued; poll
// GET .../seed-reference-data/{runId} (seedingStatus) for the outcome.
export interface SeedReferenceDataResponse {
  message: string
  seeding_run_id: number
  status: SeedingRunStatus
}

export type SeedingRunStatus = 'pending' | 'running' | 'success' | 'failed'

export interface SeedingStatusResponse {
  seeding_run_id: number
  status: SeedingRunStatus
  results: Record<string, { success: boolean; ms?: number; error?: string }> | null
  error: string | null
  started_at: string | null
  finished_at: string | null
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

/** A hospital/organization whose name resembles the one being registered. */
export interface SimilarOrganization {
  id: number | string | null
  name: string
  code?: string | null
  status?: string | null
  /** Where it was found: this app, or core-service. */
  source?: 'hmis-manage' | 'core-service'
  match: 'likely_same' | 'similar'
  similarity: number
}

// ── Move a hospital to another v3 stack (HospitalStackMoveController) ────────
export interface StackMovePreview {
  from: { key: string; label: string }
  to: { key: string; label: string }
  blockers: string[]
  old_core_org_id: string | null
  facilities: { id: string; name: string }[]
  admins: { id: number; name: string; email: string; shared: boolean }[]
  target_has: { evaluation: boolean; inventory: boolean }
  not_moved: string[]
}

export interface StackMoveInput {
  target: string
  reason: string
  confirm_name: string
  existing_core_org_id?: string | null
  deactivate_old_admins?: boolean
  seed?: boolean
}

export interface StackMoveRecord {
  id: number
  from: { key: string; label: string }
  to: { key: string; label: string }
  from_core_org_id: string | null
  to_core_org_id: string | null
  status: 'completed' | 'failed'
  error: string | null
  reason: string
  moved_by: string | null
  created_at: string
}

export interface StackMoveResult {
  data: { v3_target: string; v3_target_label: string; core_org_id: string }
  move: StackMoveRecord
  facilities: { id: string; name: string; core_facility_id: string | null; error: string | null }[]
  // password is returned this once (and emailed); never stored.
  admins: {
    id: number; name: string; email: string; core_user_id?: string; password?: string
    old_deactivated?: boolean; skipped?: string; error?: string
  }[]
  seeding_run_id: number | null
  not_moved: string[]
}
