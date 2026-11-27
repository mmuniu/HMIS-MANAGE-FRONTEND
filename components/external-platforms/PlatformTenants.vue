<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useHospitalsApi } from '@/composables/useHospitalsApi'
import { useExternalPlatformsApi, type PlatformTenant, type TenantStatus } from '@/composables/useExternalPlatformsApi'
import type { Hospital } from '@/types/hospital'

// The platform's own tenants, each mapped to a hospital here (that
// hospital's core-service organization). A token acts for a tenant only while
// it is active and mapped; the platform names it per request in X-Tenant-Id.

const props = defineProps<{ platformId: string; platformName: string }>()
const emit = defineEmits<{ (e: 'loaded', tenants: PlatformTenant[]): void }>()

const api = useExternalPlatformsApi()
const hospitalsApi = useHospitalsApi()
const { $showToast } = useNuxtApp()

const STATUSES: { value: TenantStatus; title: string; color: string; hint: string }[] = [
  { value: 'active', title: 'Active', color: 'success', hint: 'Requests are accepted for this tenant' },
  { value: 'pending', title: 'Pending', color: 'warning', hint: 'Waiting for approval; requests are refused' },
  { value: 'suspended', title: 'Suspended', color: 'error', hint: 'Requests are refused' },
]
const statusOf = (s: TenantStatus) => STATUSES.find(x => x.value === s) ?? STATUSES[1]

const loading = ref(true)
const loadError = ref('')
const tenants = ref<PlatformTenant[]>([])

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    tenants.value = await api.tenants(props.platformId)
    emit('loaded', tenants.value)
  } catch (e: any) {
    loadError.value = e?.response?.data?.message || 'Failed to load the tenants.'
  } finally {
    loading.value = false
  }
}

const activeCount = computed(() => tenants.value.filter(t => t.status === 'active' && t.hospital).length)

// ── Hospital search (only hospitals provisioned in core-service can be mapped)
interface HospitalOption { id: string; title: string; disabled: boolean }
const hospitalSearch = ref('')
const hospitalOptions = ref<HospitalOption[]>([])
const searchingHospitals = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined

function toOption(h: Hospital): HospitalOption {
  const name = h.display_name || h.name
  return h.core_org_id
    ? { id: h.id, title: name, disabled: false }
    : { id: h.id, title: `${name} (not provisioned in core yet)`, disabled: true }
}

async function searchHospitals(search: string) {
  searchingHospitals.value = true
  try {
    const { data } = await hospitalsApi.list({ search: search || undefined, per_page: 20 })
    const found = data.map(toOption)
    // Keep the chosen hospital in the list so its name still shows.
    const chosen = hospitalOptions.value.find(o => o.id === form.value.hospital_id)
    hospitalOptions.value = chosen && !found.some(o => o.id === chosen.id) ? [chosen, ...found] : found
  } catch {
    // The field still works with what is listed.
  } finally {
    searchingHospitals.value = false
  }
}

watch(hospitalSearch, (q) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => searchHospitals(q ?? ''), 300)
})

// ── Add / edit ──────────────────────────────────────────────────────────────
const dialog = ref(false)
const editing = ref<PlatformTenant | null>(null)
const saving = ref(false)
const errors = ref<Record<string, string[]>>({})
const form = ref({ tenant_id: '', name: '', hospital_id: null as string | null, status: 'active' as TenantStatus })

function openTenant(t: PlatformTenant | null = null) {
  editing.value = t
  form.value = t
    ? { tenant_id: t.tenant_id, name: t.name ?? '', hospital_id: t.hospital?.id ?? null, status: t.status }
    : { tenant_id: '', name: '', hospital_id: null, status: 'active' }
  hospitalOptions.value = t?.hospital ? [{ id: t.hospital.id, title: t.hospital.name, disabled: false }] : []
  errors.value = {}
  dialog.value = true
  searchHospitals('')
}

const tenantIdValid = computed(() => /^[A-Za-z0-9._:-]{1,100}$/.test(form.value.tenant_id.trim()))
const needsHospital = computed(() => form.value.status === 'active' && !form.value.hospital_id)

async function save() {
  const tenantId = form.value.tenant_id.trim()
  saving.value = true
  errors.value = {}
  try {
    await api.saveTenant(props.platformId, tenantId, {
      name: form.value.name.trim() || null,
      hospital_id: form.value.hospital_id,
      status: form.value.status,
    })
    dialog.value = false
    $showToast(editing.value ? 'Tenant saved.' : 'Tenant added.')
    await load()
  } catch (e: any) {
    errors.value = e?.response?.data?.errors ?? {}
    $showToast(e?.response?.data?.message || 'Failed to save the tenant.')
  } finally {
    saving.value = false
  }
}

const removing = ref<string | null>(null)
async function remove(t: PlatformTenant) {
  if (!confirm(`Remove tenant ${t.tenant_id}${t.name ? ` (${t.name})` : ''}? ${props.platformName} can no longer make requests for it.`)) return
  removing.value = t.tenant_id
  try {
    await api.removeTenant(props.platformId, t.tenant_id)
    $showToast('Tenant removed.')
    await load()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to remove the tenant.')
  } finally {
    removing.value = null
  }
}

onMounted(load)
defineExpose({ load })
</script>

<template>
  <v-card rounded="lg" elevation="10">
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-1 ga-2">
        <h3 class="text-h6 font-weight-semibold">Tenants</h3>
        <v-btn color="primary" variant="flat" size="small" prepend-icon="mdi-plus" :disabled="!!loadError" @click="openTenant()">
          Add tenant
        </v-btn>
      </div>
      <p class="text-body-2 textSecondary mb-4">
        {{ platformName }}'s own tenants and the hospital each one is registered as here. Requests are accepted only for active
        tenants with a hospital.
        <template v-if="tenants.length">{{ activeCount }} of {{ tenants.length }} active.</template>
      </p>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />
      <v-alert v-else-if="loadError" type="error" variant="tonal">{{ loadError }}</v-alert>
      <v-alert v-else-if="!tenants.length" type="info" variant="tonal">
        No tenants yet. Add each of {{ platformName }}'s tenants by its own id, and choose the hospital it is here.
      </v-alert>

      <v-table v-else density="comfortable">
        <thead>
          <tr>
            <th>Their tenant id</th>
            <th>Name</th>
            <th>Hospital here</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in tenants" :key="t.tenant_id">
            <td><code>{{ t.tenant_id }}</code></td>
            <td>{{ t.name || '—' }}</td>
            <td>
              <NuxtLink v-if="t.hospital" :to="`/hospitals/${t.hospital.id}`">{{ t.hospital.name }}</NuxtLink>
              <span v-else-if="t.organization_id" class="textSecondary">Organization {{ t.organization_id }} (not in this console)</span>
              <span v-else class="textSecondary">Not mapped</span>
            </td>
            <td>
              <v-chip :color="statusOf(t.status).color" size="x-small" variant="tonal" label :title="statusOf(t.status).hint">
                {{ statusOf(t.status).title }}
              </v-chip>
            </td>
            <td class="text-right text-no-wrap">
              <v-btn icon="mdi-pencil" size="small" variant="text" :aria-label="`Edit tenant ${t.tenant_id}`" @click="openTenant(t)" />
              <v-btn icon="mdi-delete" size="small" variant="text" color="error" :aria-label="`Remove tenant ${t.tenant_id}`"
                :loading="removing === t.tenant_id" @click="remove(t)" />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>

    <!-- Add / edit tenant -->
    <v-dialog v-model="dialog" max-width="560" scrollable>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center pa-4 pb-2">
          {{ editing ? 'Edit tenant' : 'Add tenant' }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" aria-label="Close" @click="dialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-text-field v-model="form.tenant_id" :label="`${platformName}'s id for this tenant`" placeholder="e.g. T-1042"
            :readonly="!!editing" :autofocus="!editing" variant="outlined" density="comfortable"
            :hint="editing ? 'The id cannot change; remove the tenant and add it again instead.' : 'Letters, digits and . _ : - only. The platform sends it in X-Tenant-Id.'"
            persistent-hint class="mb-3"
            :error-messages="form.tenant_id && !tenantIdValid ? 'Letters, digits and . _ : - only, up to 100.' : undefined" />
          <v-text-field v-model="form.name" label="Name" placeholder="e.g. Likoni Clinic" variant="outlined" density="comfortable"
            :error-messages="errors.name" />
          <v-autocomplete
            v-model="form.hospital_id" v-model:search="hospitalSearch"
            :items="hospitalOptions" item-value="id" item-title="title" item-props
            :loading="searchingHospitals" no-filter clearable
            label="Hospital here" placeholder="Search hospitals" variant="outlined" density="comfortable"
            hint="Only hospitals provisioned in core-service can be chosen." persistent-hint class="mb-3"
            :error-messages="errors.hospital_id || errors.organization_id" />
          <p class="text-subtitle-2 font-weight-medium mb-2">Status</p>
          <v-btn-toggle v-model="form.status" mandatory color="primary" variant="outlined" density="comfortable" divided class="mb-2">
            <v-btn v-for="s in STATUSES" :key="s.value" :value="s.value" :title="s.hint">{{ s.title }}</v-btn>
          </v-btn-toggle>
          <p class="text-caption textSecondary mb-0">{{ statusOf(form.status).hint }}.</p>
          <v-alert v-if="needsHospital" type="warning" variant="tonal" density="compact" class="mt-3">
            An active tenant needs the hospital it is registered as.
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 ga-2">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" :disabled="!tenantIdValid || needsHospital" @click="save">
            {{ editing ? 'Save tenant' : 'Add tenant' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>
