<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import { useHospitalsApi } from '@/composables/useHospitalsApi'
import { useAuthStore } from '@/stores/auth'
import { useHospitalsStore } from '@/stores/hospitals'
import type { TerminalFacility, TerminalHospitalDetail } from '@/types/hospital'

// A terminal hospital: a tenant on one v3 stack's core-service that has no
// hospital in hmis-manage. Everything here comes from that stack's
// core-service and is read-only, except each facility's release, which is
// changed there directly. "Register in HMIS Manage" adopts it as a normal
// hospital through the register wizard (existing organization pre-picked).

const route = useRoute()
const router = useRouter()
const api = useHospitalsApi()
const auth = useAuthStore()
const store = useHospitalsStore()
const { $showToast } = useNuxtApp()

const target = computed(() => String(route.params.target))
const coreOrgId = computed(() => String(route.params.id))

const t = ref<TerminalHospitalDetail | null>(null)
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    t.value = await api.showTerminal(target.value, coreOrgId.value)
  } catch (e: any) {
    t.value = null
    error.value = e?.response?.data?.message || 'Could not load this hospital.'
  } finally {
    loading.value = false
  }
}

const o = computed(() => t.value?.organization)
const address = computed(() =>
  [o.value?.address, o.value?.city, o.value?.state, o.value?.postal_code, o.value?.country].filter(Boolean).join(', '),
)

function registerHere() {
  if (!t.value) return
  router.push({
    path: '/hospitals/new',
    query: { target: t.value.v3_target, core_org_id: t.value.core_org_id, name: o.value?.name ?? '' },
  })
}

async function copyId(text: string | number) {
  try {
    await navigator.clipboard.writeText(String(text))
    $showToast('Copied.')
  } catch {
    $showToast('Could not copy.')
  }
}

function fmt(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

const statusColor = (s?: string | null) => (s === 'active' ? 'success' : s ? 'grey' : undefined)

// Each facility's release switch. The releases are the ones defined for this
// system on the Systems page; the change is made in core-service, confirmed
// by typing the facility's code there.
if (auth.isPlatformUser && !store.releases.length) store.fetchReleases()

const releaseLabel = (key?: string | null) =>
  store.releases.find((r) => r.key === (key || 'regular') && r.v3_target === t.value?.v3_target)?.label ?? (key || 'regular')

// A core-service that reports no release for its facilities predates
// releases, and can't change one either.
const canSwitchRelease = (f: TerminalFacility) => auth.isPlatformUser && f.release_mode !== undefined

// Only a facility on the system's default release (regular) can be moved,
// and only to a release marked selectable on the Systems page.
const defaultRelease = computed(() =>
  store.releases.find((r) => r.default && r.v3_target === t.value?.v3_target)?.key ?? 'regular')
const releaseLocked = (f: TerminalFacility) => (f.release_mode || 'regular') !== defaultRelease.value
const lockedHint = (f: TerminalFacility) =>
  `On the ${releaseLabel(f.release_mode)} release. Only a facility on the default release (${releaseLabel(defaultRelease.value)}) can be moved.`

// The releases a facility can be moved to, plus its current one (so the
// switch can still show it).
function releaseItemsFor(f: TerminalFacility) {
  const current = f.release_mode || 'regular'
  const items = store.releases
    .filter((r) => r.v3_target === t.value?.v3_target && (r.key === current || (r.active && r.selectable !== false && !r.default)))
    .map((r) => ({ key: r.key, label: r.active ? r.label : `${r.label} (retired)` }))
  if (!items.some((r) => r.key === current)) items.push({ key: current, label: current })
  return items
}

const releaseDialog = ref(false)
const releaseTarget = ref<{ facility: TerminalFacility; mode: string } | null>(null)
const releaseCode = ref('')
const releaseCodeError = ref('')
const releaseError = ref('')
const savingRelease = ref(false)
// Re-keys the selects so one snaps back to the current release on cancel.
const releaseSelectKey = ref(0)

function changeRelease(f: TerminalFacility, mode: string) {
  if (!mode || mode === (f.release_mode || 'regular') || releaseLocked(f)) return
  releaseTarget.value = { facility: f, mode }
  releaseCode.value = ''
  releaseCodeError.value = ''
  releaseError.value = ''
  releaseDialog.value = true
}

function closeReleaseDialog() {
  if (savingRelease.value) return
  releaseDialog.value = false
  releaseSelectKey.value++
}

async function confirmRelease() {
  const chosen = releaseTarget.value
  if (!chosen || savingRelease.value) return
  const { facility: f, mode } = chosen
  const code = releaseCode.value.trim()
  if (!code) {
    releaseCodeError.value = 'Enter the facility code to confirm the change.'
    return
  }

  savingRelease.value = true
  releaseCodeError.value = ''
  releaseError.value = ''
  try {
    const res = await api.setTerminalFacilityRelease(target.value, coreOrgId.value, f.id, mode, code)
    f.release_mode = res.data.release_mode
    releaseDialog.value = false
    $showToast(`"${f.name}" is now on the ${releaseLabel(mode)} release.`)
  } catch (e: any) {
    const errors = e?.response?.data?.errors ?? {}
    releaseCodeError.value = errors.facility_code?.[0] ?? ''
    releaseError.value = releaseCodeError.value
      ? ''
      : errors.release_mode?.[0] || e?.response?.data?.message || 'The release was not changed.'
  } finally {
    savingRelease.value = false
    releaseSelectKey.value++
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="ma-0" to="/hospitals?tab=terminal">
        Back to terminal hospitals
      </v-btn>
      <div class="d-flex ga-2">
        <v-btn v-if="t?.registered_hospital" color="primary" variant="tonal" prepend-icon="mdi-open-in-app"
          :to="`/hospitals/${t.registered_hospital.id}`">
          Open hospital
        </v-btn>
        <v-btn v-else-if="t && auth.isPlatformUser" color="primary" variant="flat" prepend-icon="mdi-plus"
          @click="registerHere">
          Register in HMIS Manage
        </v-btn>
        <v-btn variant="text" icon="mdi-refresh" :loading="loading" @click="load" />
      </div>
    </div>

    <v-progress-linear v-if="loading && !t" indeterminate color="primary" class="mb-4" />
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error">
      <template #append>
        <v-btn variant="text" size="small" @click="load">Retry</v-btn>
      </template>
    </v-alert>

    <template v-if="t && o">
      <!-- Header -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
        <div>
          <h2 class="text-h4 font-weight-semibold">{{ o.name }}</h2>
          <p class="textSecondary mb-0">Terminal hospital — set up on {{ t.v3_target_label }}, not registered in HMIS Manage.</p>
        </div>
        <div class="d-flex ga-2">
          <v-chip v-if="o.status" :color="statusColor(o.status)" variant="flat" label>{{ o.status }}</v-chip>
          <v-chip color="warning" variant="tonal" label>TERMINAL</v-chip>
        </div>
      </div>

      <v-alert v-if="t.registered_hospital" type="info" variant="tonal" class="mb-4">
        This organization is now linked to <strong>{{ t.registered_hospital.name }}</strong> in HMIS Manage.
      </v-alert>
      <v-alert v-if="!t.details_available" type="info" variant="tonal" class="mb-4"
        :text="`${t.v3_target_label}'s core-service doesn't share facilities, users or admins yet. Update it to see them here.`" />

      <!-- Ids -->
      <v-card variant="tonal" color="primary" rounded="lg" class="mb-6">
        <v-card-text class="d-flex flex-wrap align-center ga-6">
          <div>
            <p class="text-caption textSecondary mb-0">System</p>
            <p class="text-body-1 font-weight-medium mb-0">{{ t.v3_target_label }}</p>
          </div>
          <div>
            <p class="text-caption textSecondary mb-0">Organization ID</p>
            <p class="text-body-1 font-weight-medium font-mono mb-0">
              {{ t.core_org_id }}
              <v-btn icon="mdi-content-copy" size="x-small" variant="text" @click="copyId(t.core_org_id)" />
            </p>
          </div>
          <div v-for="f in t.facilities ?? []" :key="f.id">
            <p class="text-caption textSecondary mb-0">Facility ID — {{ f.name }}</p>
            <p class="text-body-1 font-weight-medium font-mono mb-0">
              {{ f.id }}
              <v-btn icon="mdi-content-copy" size="x-small" variant="text" @click="copyId(f.id)" />
            </p>
          </div>
        </v-card-text>
      </v-card>

      <v-row>
        <!-- Organization -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item>
              <v-card-title><v-icon icon="mdi-domain" class="mr-2" />Organization</v-card-title>
            </v-card-item>
            <v-card-text>
              <v-list density="compact" lines="two">
                <v-list-item title="Name" :subtitle="o.name" />
                <v-list-item title="Code" :subtitle="o.code || '—'" />
                <v-list-item v-if="t.details_available" title="Type" :subtitle="o.type || '—'" />
                <v-list-item v-if="t.details_available" title="Registration number" :subtitle="o.registration_number || '—'" />
                <v-list-item v-if="t.details_available" title="Tax number" :subtitle="o.tax_number || '—'" />
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Contact -->
        <v-col v-if="t.details_available" cols="12" md="6">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item>
              <v-card-title><v-icon icon="mdi-map-marker" class="mr-2" />Contact & Location</v-card-title>
            </v-card-item>
            <v-card-text>
              <v-list density="compact" lines="two">
                <v-list-item title="Phone" :subtitle="o.phone || '—'" />
                <v-list-item title="Email" :subtitle="o.email || '—'" />
                <v-list-item title="Website" :subtitle="o.website || '—'" />
                <v-list-item title="Address" :subtitle="address || '—'" />
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Users & metadata -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item>
              <v-card-title><v-icon icon="mdi-cog" class="mr-2" />System & Metadata</v-card-title>
            </v-card-item>
            <v-card-text>
              <v-list density="compact" lines="two">
                <v-list-item title="Status">
                  <template #subtitle>
                    <v-chip v-if="o.status" :color="statusColor(o.status)" size="small" variant="flat" label>{{ o.status }}</v-chip>
                    <span v-else>—</span>
                  </template>
                </v-list-item>
                <v-list-item v-if="t.users" title="Users" :subtitle="`${t.users.total} (${t.users.active} active)`" />
                <v-list-item v-if="t.details_available" title="Created" :subtitle="fmt(o.created_at)" />
                <v-list-item v-if="t.details_available" title="Updated" :subtitle="fmt(o.updated_at)" />
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <template v-if="t.details_available">
        <!-- Facilities -->
        <v-card rounded="lg" elevation="10" class="mt-6">
          <v-card-item>
            <v-card-title><v-icon icon="mdi-hospital-building" class="mr-2" />Facilities</v-card-title>
          </v-card-item>
          <v-table density="comfortable">
            <thead>
              <tr><th>Facility</th><th>Facility ID</th><th>Facility code</th><th>FID (MFL code)</th><th>Release</th><th>Status</th><th>Created</th></tr>
            </thead>
            <tbody>
              <tr v-for="f in t.facilities ?? []" :key="f.id">
                <td class="font-weight-medium">{{ f.name }}</td>
                <td class="font-mono">{{ f.id }}</td>
                <td class="font-mono">{{ f.code || '—' }}</td>
                <td>{{ f.mfl_code || '—' }}</td>
                <td>
                  <v-select
                    v-if="canSwitchRelease(f)" :key="`${f.id}-${releaseSelectKey}`"
                    :model-value="f.release_mode || 'regular'" :items="releaseItemsFor(f)" item-title="label" item-value="key"
                    :aria-label="`Release of ${f.name}`" prepend-inner-icon="mdi-source-branch" variant="outlined" density="compact"
                    :hide-details="!releaseLocked(f)" :hint="lockedHint(f)" persistent-hint
                    :disabled="savingRelease || releaseLocked(f)" class="my-2" style="min-width: 170px; max-width: 260px"
                    @update:model-value="changeRelease(f, $event)"
                  />
                  <span v-else>{{ f.release_mode ? releaseLabel(f.release_mode) : '—' }}</span>
                </td>
                <td>
                  <v-chip v-if="f.status" :color="statusColor(f.status)" size="small" variant="tonal" label>{{ f.status }}</v-chip>
                  <span v-else>—</span>
                </td>
                <td>{{ fmt(f.created_at) }}</td>
              </tr>
              <tr v-if="!t.facilities?.length">
                <td colspan="7" class="text-center textSecondary pa-6">No facilities on core-service.</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>

        <!-- Admins -->
        <v-card rounded="lg" elevation="10" class="mt-6">
          <v-card-item>
            <v-card-title><v-icon icon="mdi-account-key" class="mr-2" />Admins</v-card-title>
            <v-card-subtitle>The owner and superadmin/admin accounts on core-service.</v-card-subtitle>
          </v-card-item>
          <v-table density="comfortable">
            <thead>
              <tr><th>Name</th><th>Username</th><th>Email</th><th>Roles</th><th>Status</th><th>Last login</th></tr>
            </thead>
            <tbody>
              <tr v-for="a in t.admins ?? []" :key="a.id">
                <td class="font-weight-medium">
                  {{ a.name }}
                  <v-chip v-if="a.is_owner" size="x-small" color="primary" variant="tonal" label class="ml-1">Owner</v-chip>
                </td>
                <td>{{ a.username || '—' }}</td>
                <td>{{ a.email || '—' }}</td>
                <td>{{ a.roles.length ? a.roles.join(', ') : '—' }}</td>
                <td>
                  <v-chip :color="a.active ? 'success' : 'grey'" size="small" variant="tonal" label>
                    {{ a.active ? 'active' : 'inactive' }}
                  </v-chip>
                </td>
                <td>{{ fmt(a.last_login) }}</td>
              </tr>
              <tr v-if="!t.admins?.length">
                <td colspan="6" class="text-center textSecondary pa-6">No admin accounts found.</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </template>
    </template>

    <!-- Move a facility to another release: confirmed with its facility code -->
    <v-dialog :model-value="releaseDialog" max-width="480" :persistent="savingRelease" @update:model-value="closeReleaseDialog">
      <v-card v-if="releaseTarget" rounded="lg">
        <v-card-title class="text-h6">Move to the {{ releaseLabel(releaseTarget.mode) }} release?</v-card-title>
        <v-card-text>
          <p class="mb-3">
            Move <strong>"{{ releaseTarget.facility.name }}"</strong> to the
            <strong>{{ releaseLabel(releaseTarget.mode) }}</strong> release? Its users get that build the next
            time they sign in.
          </p>
          <v-alert type="warning" variant="tonal" density="compact" class="mb-4" text="Please note that this is irreversible: once moved, the facility can't be moved to another release from here." />
          <v-text-field
            v-model="releaseCode" label="Facility code" autofocus
            hint="Type this facility's Facility code or its Core facility code to confirm." persistent-hint
            :error-messages="releaseCodeError" :disabled="savingRelease"
            prepend-inner-icon="mdi-shield-key-outline" variant="outlined" density="comfortable"
            autocomplete="off" @keyup.enter="confirmRelease"
          />
          <v-alert v-if="releaseError" type="error" variant="tonal" density="compact" class="mt-3" :text="releaseError" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="savingRelease" @click="closeReleaseDialog">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="savingRelease" :disabled="!releaseCode.trim()" @click="confirmRelease">
            Move facility
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.ga-2 { gap: 8px; }
.ga-3 { gap: 12px; }
.ga-6 { gap: 24px; }
.font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
</style>
