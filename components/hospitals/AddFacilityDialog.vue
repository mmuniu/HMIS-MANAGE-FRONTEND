<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useHospitalsStore } from '@/stores/hospitals'
import { useHospitalsApi } from '@/composables/useHospitalsApi'
import { useSettingsApi } from '@/composables/useSettingsApi'
import type { FacilityRegistryResult, HospitalFacilityPayload } from '@/types/hospital'

// "Add facility" on the hospital detail page. Same fields and the same SHA
// integration rule as the register-hospital wizard's First Facility step:
// SHA on → DHA registry lookup, and the fields it fills are read-only;
// SHA off → no lookup, every field typed by hand.
const props = defineProps<{ orgId: string }>()
const open = defineModel<boolean>({ required: true })

const store = useHospitalsStore()
const hospitalsApi = useHospitalsApi()
const settingsApi = useSettingsApi()
const { $showToast } = useNuxtApp()

const shaEnabled = ref(true)

const emptyForm = (): HospitalFacilityPayload => ({
  name: '',
  facility_code: '',
  keph_level: '',
  total_beds: undefined,
  normal_beds: undefined,
  icu_beds: undefined,
  hdu_beds: undefined,
  dialysis_beds: undefined,
  number_of_cots: undefined,
  facility_administrator_name: '',
  facility_administrator_email: '',
  facility_administrator_phone: '',
  facility_administrator_identifier: '',
})
const form = reactive<HospitalFacilityPayload>(emptyForm())

const dhaIdentifier = ref('')
const dhaSearching = ref(false)
const dhaStatus = ref('')
const dhaStatusType = ref<'success' | 'error' | 'info' | 'warning'>('info')

const BED_FIELDS = [
  { key: 'total_beds', label: 'Total beds' },
  { key: 'normal_beds', label: 'Normal beds' },
  { key: 'icu_beds', label: 'ICU beds' },
  { key: 'hdu_beds', label: 'HDU beds' },
  { key: 'dialysis_beds', label: 'Dialysis beds' },
  { key: 'number_of_cots', label: 'Number of cots' },
] as const

// Reset on every open, and re-read the setting so a change made on the
// Settings page applies without reloading this page.
watch(open, (isOpen) => {
  if (!isOpen) return
  Object.assign(form, emptyForm())
  dhaIdentifier.value = ''
  dhaStatus.value = ''
  store.fieldErrors = {}
  store.error = ''
  settingsApi
    .get()
    .then((s) => (shaEnabled.value = s.sha_integration_enabled))
    .catch(() => {})
})

function applyFacility(f: FacilityRegistryResult) {
  if (f.officialName) form.name = f.officialName
  if (f.frCode) form.facility_code = f.frCode
  if (f.kephLevel) form.keph_level = f.kephLevel

  const beds = f.bedOccupancy || {}
  form.total_beds = beds.totalBeds
  form.normal_beds = beds.normalBeds
  form.icu_beds = beds.icuBeds
  form.hdu_beds = beds.hduBeds
  form.dialysis_beds = beds.dialysisBeds
  form.number_of_cots = beds.numberOfCots

  if (f.facilityAdministratorName) form.facility_administrator_name = f.facilityAdministratorName
  if (f.facilityAdministratorEmail) form.facility_administrator_email = f.facilityAdministratorEmail
  if (f.facilityAdministratorPhone) form.facility_administrator_phone = f.facilityAdministratorPhone
  if (f.facilityAdministratorIdentifier) form.facility_administrator_identifier = f.facilityAdministratorIdentifier

  const active = (f.SHAOperationStatus?.operationalStatus || '').toUpperCase() === 'ACTIVE'
  dhaStatus.value = active
    ? 'Facility found — fields below have been filled in.'
    : 'Facility found, but its SHA status is not ACTIVE — you can still add it.'
  dhaStatusType.value = active ? 'success' : 'warning'
}

async function searchFacility() {
  const identifier = dhaIdentifier.value.trim()
  if (!identifier) {
    dhaStatus.value = 'Enter a facility identifier first.'
    dhaStatusType.value = 'error'
    return
  }

  dhaSearching.value = true
  dhaStatus.value = 'Searching…'
  dhaStatusType.value = 'info'
  try {
    const result = await hospitalsApi.searchFacility(identifier)
    const found = Array.isArray(result.data) ? result.data[0] : result.data
    if (!result.ok || !found) {
      dhaStatus.value = result.error || 'Facility not found.'
      dhaStatusType.value = 'error'
      return
    }
    applyFacility(found)
  } catch {
    dhaStatus.value = 'Facility search failed.'
    dhaStatusType.value = 'error'
  } finally {
    dhaSearching.value = false
  }
}

const fieldError = (key: string) => store.fieldErrors[key]?.[0]

async function save() {
  // Drop blanks so optional fields go up as absent, not as '' (which the
  // backend's integer/email rules would reject).
  const payload = Object.fromEntries(
    Object.entries(form).filter(([, v]) => v !== '' && v !== undefined && v !== null),
  ) as unknown as HospitalFacilityPayload

  const res = await store.addFacility(props.orgId, payload)
  if (!res.success) return

  open.value = false
  $showToast(
    res.data.core_provisioned
      ? `Facility "${res.data.data.name}" added.`
      : `Facility "${res.data.data.name}" added, but not yet in core-service: ${res.data.core_provisioning_error}`,
  )
}
</script>

<template>
  <v-dialog v-model="open" max-width="720" scrollable>
    <v-card rounded="lg">
      <v-card-title class="text-h6 pt-5 px-5">
        <v-icon icon="mdi-hospital-building" class="mr-2" />Add Facility
      </v-card-title>

      <v-card-text class="px-5">
        <v-alert v-if="store.error" type="error" variant="tonal" density="compact" class="mb-4" :text="store.error" />

        <template v-if="shaEnabled">
          <div class="d-flex ga-2 mb-1">
            <v-text-field
              v-model="dhaIdentifier" :disabled="dhaSearching" label="Find Facility (DHA Registry)"
              placeholder="Facility ID / fr-code, e.g. FID-47-105963-0" variant="outlined" density="comfortable" hide-details="auto"
              @keydown.enter.prevent="searchFacility"
            />
            <v-btn color="primary" variant="tonal" :loading="dhaSearching" @click="searchFacility">
              <v-icon icon="mdi-magnify" />
            </v-btn>
          </div>
          <p v-if="dhaStatus" class="text-caption mt-1 mb-3"
            :class="{ 'text-success': dhaStatusType === 'success', 'text-error': dhaStatusType === 'error', 'text-warning': dhaStatusType === 'warning', 'textSecondary': dhaStatusType === 'info' }">
            {{ dhaStatus }}
          </p>
        </template>
        <p v-else class="text-caption textSecondary mb-3">
          SHA integration is turned off in Settings — enter the facility details below by hand.
        </p>

        <v-text-field v-model="form.name" :readonly="shaEnabled" label="Facility name" placeholder="e.g. Westlands Branch"
          variant="outlined" density="comfortable" class="mb-3" hide-details="auto" :error-messages="fieldError('name')" />
        <div class="d-flex ga-3 mb-3 flex-wrap">
          <v-text-field v-model="form.facility_code" label="Master facility code" variant="outlined" density="comfortable"
            hide-details="auto" style="min-width:220px" :error-messages="fieldError('facility_code')" />
          <v-text-field v-model="form.keph_level" :readonly="shaEnabled" label="KEPH level" placeholder="e.g. Level 4"
            variant="outlined" density="comfortable" hide-details="auto" style="min-width:220px" :error-messages="fieldError('keph_level')" />
        </div>

        <h4 class="text-subtitle-1 font-weight-medium mt-2 mb-2">Bed Occupancy</h4>
        <v-row dense class="mb-2">
          <v-col v-for="bf in BED_FIELDS" :key="bf.key" cols="6" sm="4">
            <v-text-field v-model.number="form[bf.key]" :readonly="shaEnabled" type="number" min="0" :label="bf.label"
              variant="outlined" density="comfortable" hide-details="auto" :error-messages="fieldError(bf.key)" />
          </v-col>
        </v-row>

        <h4 class="text-subtitle-1 font-weight-medium mt-2 mb-2">Facility Administrator</h4>
        <div class="d-flex ga-3 mb-3 flex-wrap">
          <v-text-field v-model="form.facility_administrator_name" :readonly="shaEnabled" label="Administrator name"
            variant="outlined" density="comfortable" hide-details="auto" style="min-width:220px" />
          <v-text-field v-model="form.facility_administrator_email" :readonly="shaEnabled" label="Administrator email" type="email"
            variant="outlined" density="comfortable" hide-details="auto" style="min-width:220px"
            :error-messages="fieldError('facility_administrator_email')" />
        </div>
        <div class="d-flex ga-3 flex-wrap">
          <v-text-field v-model="form.facility_administrator_phone" :readonly="shaEnabled" label="Administrator phone"
            variant="outlined" density="comfortable" hide-details="auto" style="min-width:220px" />
          <v-text-field v-model="form.facility_administrator_identifier" :readonly="shaEnabled" label="Administrator identifier"
            variant="outlined" density="comfortable" hide-details="auto" style="min-width:220px" />
        </div>
      </v-card-text>

      <v-card-actions class="px-5 pb-5">
        <v-spacer />
        <v-btn variant="text" :disabled="store.addingFacility" @click="open = false">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :loading="store.addingFacility" :disabled="!form.name?.trim()" @click="save">
          Add Facility
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.ga-2 { gap: 8px; }
.ga-3 { gap: 12px; }
</style>
