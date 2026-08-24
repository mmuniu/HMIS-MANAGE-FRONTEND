<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHospitalsStore } from '@/stores/hospitals'
import type { UpdateHospitalPayload } from '@/types/hospital'

const route = useRoute()
const router = useRouter()
const store = useHospitalsStore()

const id = computed(() => String(route.params.id))
const h = computed(() => store.current)

const TIERS = ['BASIC', 'PREMIUM', 'ENTERPRISE']
const BILLING = ['ACTIVE', 'PAST_DUE', 'SUSPENDED']
const STATUSES = ['PROVISIONING', 'ACTIVE', 'MAINTENANCE', 'ARCHIVED']

const form = reactive<UpdateHospitalPayload>({
  name: '',
  legal_name: '',
  display_name: '',
  timezone: 'UTC',
  locale: 'en_US',
  address: { line1: '', city: '', country: '' },
  subdomain: '',
  custom_domain: '',
  subscription_tier: 'BASIC',
  billing_status: 'ACTIVE',
  payment_gateway_customer_id: '',
  max_user_slots: 10,
  max_patient_records: 1000,
  status: 'PROVISIONING',
  is_sandbox: false,
})

// Fills the form once the hospital loads (fetchOne resolves after this page
// mounts) — a plain assign, not a deep watch, since the user's edits should
// never be clobbered by a later re-fetch of the same record.
watch(
  h,
  (hospital) => {
    if (!hospital) return
    form.name = hospital.name
    form.legal_name = hospital.legal_name ?? ''
    form.display_name = hospital.display_name ?? ''
    form.timezone = hospital.timezone
    form.locale = hospital.locale
    form.address = { line1: hospital.address?.line1 ?? '', city: hospital.address?.city ?? '', country: hospital.address?.country ?? '' }
    form.subdomain = hospital.subdomain ?? ''
    form.custom_domain = hospital.custom_domain ?? ''
    form.subscription_tier = hospital.subscription_tier
    form.billing_status = hospital.billing_status
    form.payment_gateway_customer_id = hospital.payment_gateway_customer_id ?? ''
    form.max_user_slots = hospital.max_user_slots
    form.max_patient_records = hospital.max_patient_records
    form.status = hospital.status
    form.is_sandbox = hospital.is_sandbox
  },
  { immediate: true },
)

if (!h.value || h.value.id !== id.value) store.fetchOne(id.value)

const fieldError = (key: string) => store.fieldErrors[key]?.[0]

function cleaned<T extends Record<string, any>>(obj: T): Partial<T> {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v !== '' && v !== null && v !== undefined) out[k] = v
  }
  return out as Partial<T>
}

async function submit() {
  const payload: UpdateHospitalPayload = {
    ...cleaned(form),
    name: form.name,
    address: cleaned(form.address || {}) as any,
  }
  const res = await store.update(id.value, payload)
  if (res.success) router.push(`/hospitals/${id.value}`)
}
</script>

<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" :to="`/hospitals/${id}`">
      Back to hospital
    </v-btn>

    <div class="mb-6">
      <h2 class="text-h4 font-weight-semibold">Edit Hospital</h2>
      <p class="textSecondary">{{ h?.display_name || h?.name }}</p>
    </div>

    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4">
      <p class="font-weight-medium mb-0">{{ store.error }}</p>
    </v-alert>

    <v-progress-linear v-if="store.loading" indeterminate color="primary" class="mb-4" />

    <v-card v-if="h" rounded="lg" elevation="10">
      <div class="pa-6">
        <h3 class="text-h6 mb-4"><v-icon icon="mdi-map-marker" class="mr-2" />Identity & Localization</h3>
        <v-text-field v-model="form.name" label="Hospital name *" variant="outlined" density="comfortable"
          :error-messages="fieldError('name')" class="mb-3" hide-details="auto" />
        <div class="d-flex ga-3 mb-3 flex-wrap">
          <v-text-field v-model="form.legal_name" label="Legal name" variant="outlined" density="comfortable" hide-details="auto" style="min-width:240px" />
          <v-text-field v-model="form.display_name" label="Display name" variant="outlined" density="comfortable" hide-details="auto" style="min-width:240px" />
        </div>
        <div class="d-flex ga-3 mb-3">
          <v-text-field v-model="form.timezone" label="Timezone" variant="outlined" density="comfortable" hide-details="auto" />
          <v-text-field v-model="form.locale" label="Locale" variant="outlined" density="comfortable" hide-details="auto" />
        </div>
        <v-text-field v-model="form.address!.line1" label="Address line" variant="outlined" density="comfortable" class="mb-3" hide-details="auto" />
        <div class="d-flex ga-3 mb-6">
          <v-text-field v-model="form.address!.city" label="City" variant="outlined" density="comfortable" hide-details="auto" />
          <v-text-field v-model="form.address!.country" label="Country" variant="outlined" density="comfortable" hide-details="auto" />
        </div>

        <v-divider class="mb-6" />

        <h3 class="text-h6 mb-4"><v-icon icon="mdi-shield-lock" class="mr-2" />Tenant, Billing & System</h3>
        <div class="d-flex ga-3 mb-3 flex-wrap">
          <v-text-field v-model="form.subdomain" label="Subdomain" placeholder="e.g. st-marys" variant="outlined" density="comfortable"
            suffix=".afya.ai" :error-messages="fieldError('subdomain')" hide-details="auto" style="min-width:240px" />
          <v-text-field v-model="form.custom_domain" label="Custom domain" placeholder="portal.hospital.org" variant="outlined" density="comfortable" hide-details="auto" style="min-width:240px" />
        </div>
        <div class="d-flex ga-3 mb-3 flex-wrap">
          <v-select v-model="form.subscription_tier" :items="TIERS" label="Subscription tier" variant="outlined" density="comfortable" hide-details="auto" style="min-width:200px" />
          <v-select v-model="form.billing_status" :items="BILLING" label="Billing status" variant="outlined" density="comfortable" hide-details="auto" style="min-width:200px" />
          <v-select v-model="form.status" :items="STATUSES" label="Status" variant="outlined" density="comfortable" hide-details="auto" style="min-width:200px" />
        </div>
        <v-text-field v-model="form.payment_gateway_customer_id" label="Payment gateway customer ID" variant="outlined" density="comfortable" class="mb-3" hide-details="auto" />
        <div class="d-flex ga-3 mb-3">
          <v-text-field v-model.number="form.max_user_slots" type="number" label="Max user slots" variant="outlined" density="comfortable"
            :error-messages="fieldError('max_user_slots')" hide-details="auto" />
          <v-text-field v-model.number="form.max_patient_records" type="number" label="Max patient records" variant="outlined" density="comfortable"
            :error-messages="fieldError('max_patient_records')" hide-details="auto" />
        </div>
        <v-switch v-model="form.is_sandbox" color="warning" label="Sandbox / training environment" hide-details inset />
      </div>

      <v-divider />
      <div class="d-flex justify-end ga-3 pa-4">
        <v-btn variant="text" :to="`/hospitals/${id}`" :disabled="store.saving">Cancel</v-btn>
        <v-btn color="primary" prepend-icon="mdi-check" :loading="store.saving" @click="submit">Save changes</v-btn>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.ga-3 { gap: 12px; }
</style>
