<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import {
  useExternalPlatformsApi,
  type ExternalPlatform, type ConfigField, type FieldType, type PlatformProcess, type ProcessDirection, type SyncResult,
  type GatewayOperation,
} from '@/composables/useExternalPlatformsApi'
import PlatformCredentials from '@/components/external-platforms/PlatformCredentials.vue'
import PlatformTenants from '@/components/external-platforms/PlatformTenants.vue'
import PlatformRequests from '@/components/external-platforms/PlatformRequests.vue'

// One external platform: its configuration (the fields it needs and their
// values) and the processes its integration is meant to cover — and its way
// in, held by integration-service: credentials, tenants and the requests it
// made (the dashboard).

const api = useExternalPlatformsApi()
const route = useRoute()
const router = useRouter()
const { $showToast } = useNuxtApp()

const platformId = computed(() => String(route.params.id))

const CATEGORIES = ['payments', 'government', 'insurance', 'messaging', 'analytics', 'accounting', 'other']
const CATEGORY_COLORS: Record<string, string> = {
  payments: 'success', government: 'primary', insurance: 'info', messaging: 'warning',
  analytics: 'secondary', accounting: 'success', other: 'grey',
}
const FIELD_TYPES: { value: FieldType; title: string }[] = [
  { value: 'string', title: 'Text' },
  { value: 'secret', title: 'Secret' },
  { value: 'url', title: 'URL' },
  { value: 'number', title: 'Number' },
]
const DIRECTIONS: { value: ProcessDirection; title: string; icon: string; hint: string }[] = [
  { value: 'outbound', title: 'We send', icon: 'mdi-arrow-top-right', hint: 'We send to the platform' },
  { value: 'inbound', title: 'We receive', icon: 'mdi-arrow-bottom-left', hint: 'The platform sends to us' },
  { value: 'both', title: 'Both ways', icon: 'mdi-swap-horizontal', hint: 'Goes both ways' },
]
const directionOf = (d: ProcessDirection) => DIRECTIONS.find(x => x.value === d) ?? DIRECTIONS[0]

// ── Tabs (kept in ?tab= so a tab can be linked to) ──────────────────────────
const TABS = [
  { value: 'setup', title: 'Setup', icon: 'mdi-cog-outline' },
  { value: 'credentials', title: 'Credentials', icon: 'mdi-key-variant' },
  { value: 'tenants', title: 'Tenants', icon: 'mdi-domain' },
  { value: 'requests', title: 'Requests', icon: 'mdi-chart-timeline-variant' },
]
const tab = ref(TABS.some(t => t.value === route.query.tab) ? String(route.query.tab) : 'setup')
watch(tab, (value) => {
  router.replace({ query: { ...route.query, tab: value === 'setup' ? undefined : value } })
})

// ── The push to integration-service ─────────────────────────────────────────
// A failed push leaves the platform's way in out of date there (its name, or
// whether it is switched on); shown until a push succeeds.
const syncFailure = ref<string | null>(null)
const syncing = ref(false)

function noteSync(result: SyncResult | null | undefined) {
  if (!result) return
  syncFailure.value = result.synced ? null : (result.error || 'Unknown error.')
}

async function pushAgain() {
  syncing.value = true
  try {
    noteSync(await api.sync(platformId.value))
    $showToast(syncFailure.value ? 'Still could not reach the integration service.' : 'Pushed to the integration service.')
  } catch (e: any) {
    noteSync(e?.response?.data?.integration_service ?? { synced: false, error: e?.response?.data?.message || 'Request failed.' })
    $showToast('Still could not reach the integration service.')
  } finally {
    syncing.value = false
  }
}

const loading = ref(true)
const platform = ref<ExternalPlatform | null>(null)

// Every write returns the platform as it now stands. The configuration form
// is only refilled when the configuration itself was loaded or saved, so
// switching a process on or off doesn't wipe values being typed.
function apply(p: ExternalPlatform, refillValues = false) {
  platform.value = p
  if (refillValues) resetValues()
}

async function load() {
  loading.value = true
  try {
    apply(await api.get(platformId.value), true)
  } catch (e: any) {
    $showToast(e?.response?.status === 404 ? 'That platform no longer exists.' : (e?.response?.data?.message || 'Failed to load the platform.'))
    router.push('/external-platforms')
  } finally {
    loading.value = false
  }
}

const setupLabel = computed(() => {
  const p = platform.value
  if (!p) return ''
  if (!p.fields_count) return 'No configuration yet'
  if (p.is_configured) return 'Configured'
  return `${p.missing_count} field${p.missing_count === 1 ? '' : 's'} to fill`
})

// ── Details ─────────────────────────────────────────────────────────────────
const detailsDialog = ref(false)
const savingDetails = ref(false)
const detailsErrors = ref<Record<string, string[]>>({})
const details = ref({ name: '', category: 'other', description: '', is_active: true })

function openDetails() {
  const p = platform.value
  if (!p) return
  details.value = { name: p.name, category: p.category, description: p.description ?? '', is_active: p.is_active }
  detailsErrors.value = {}
  detailsDialog.value = true
}

async function saveDetails() {
  savingDetails.value = true
  detailsErrors.value = {}
  try {
    const saved = await api.updateDetails(platformId.value, {
      name: details.value.name.trim(),
      category: details.value.category,
      description: details.value.description.trim() || null,
      is_active: details.value.is_active,
    })
    apply(saved)
    noteSync(saved.integration_service)
    detailsDialog.value = false
    $showToast(syncFailure.value ? 'Details saved here, but not pushed to the integration service.' : 'Details saved.')
  } catch (e: any) {
    detailsErrors.value = e?.response?.data?.errors ?? {}
    $showToast(e?.response?.data?.message || 'Failed to save the details.')
  } finally {
    savingDetails.value = false
  }
}

const deleting = ref(false)
async function removePlatform() {
  const p = platform.value
  if (!p) return
  if (!confirm(`Delete ${p.name}? Its configuration and processes are removed with it, and its credentials stop working at once. This cannot be undone.`)) return
  deleting.value = true
  try {
    await api.destroy(p.id)
    $showToast(`${p.name} deleted.`)
    router.push('/external-platforms')
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to delete the platform.')
  } finally {
    deleting.value = false
  }
}

// ── Configuration: the values ───────────────────────────────────────────────
const values = ref<Record<string, string>>({})
const savingValues = ref(false)

function resetValues() {
  const p = platform.value
  if (!p) return
  // Secrets are never sent to the browser — left blank keeps the stored one.
  values.value = Object.fromEntries(
    p.config_fields.map(f => [f.key, f.type === 'secret' ? '' : String(p.config?.[f.key] ?? '')]),
  )
}

const secretIsSet = (f: ConfigField) => f.type === 'secret' && !!platform.value?.secrets_set.includes(f.key)
const isMissing = (f: ConfigField) => !!platform.value?.missing.includes(f.key)

const valuesChanged = computed(() => {
  const p = platform.value
  if (!p) return false
  return p.config_fields.some(f =>
    f.type === 'secret'
      ? (values.value[f.key] ?? '') !== ''
      : (values.value[f.key] ?? '') !== String(p.config?.[f.key] ?? ''),
  )
})

async function saveValues() {
  savingValues.value = true
  try {
    apply(await api.saveConfig(platformId.value, values.value), true)
    $showToast('Configuration saved.')
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to save the configuration.')
  } finally {
    savingValues.value = false
  }
}

// ── Configuration: which fields it is made of ───────────────────────────────
const fieldsDialog = ref(false)
const savingFields = ref(false)
const fieldsError = ref('')
const fieldRows = ref<ConfigField[]>([])

function openFields() {
  fieldRows.value = (platform.value?.config_fields ?? []).map(f => ({ ...f }))
  if (!fieldRows.value.length) addFieldRow()
  fieldsError.value = ''
  fieldsDialog.value = true
}

function addFieldRow() { fieldRows.value.push({ key: '', label: '', type: 'string' }) }
function removeFieldRow(idx: number) { fieldRows.value.splice(idx, 1) }

// Fields whose saved value would be dropped by this change.
const droppedFields = computed(() => {
  const p = platform.value
  if (!p) return []
  const kept = new Set(fieldRows.value.map(f => f.key.trim()))
  const hasValue = new Set([...Object.keys(p.config ?? {}), ...p.secrets_set])
  return p.config_fields.filter(f => !kept.has(f.key) && hasValue.has(f.key))
})

async function saveFields() {
  const rows = fieldRows.value
    .map(f => ({ key: f.key.trim(), label: f.label.trim(), type: f.type }))
    .filter(f => f.key || f.label)

  if (rows.some(f => !/^[A-Za-z_][A-Za-z0-9_]*$/.test(f.key))) {
    fieldsError.value = 'Every field needs a key made of letters, digits and underscores, e.g. api_key.'
    return
  }
  if (new Set(rows.map(f => f.key)).size !== rows.length) {
    fieldsError.value = 'Each field key can only be used once.'
    return
  }

  savingFields.value = true
  fieldsError.value = ''
  try {
    apply(await api.saveFields(platformId.value, rows), true)
    fieldsDialog.value = false
    $showToast('Configuration fields saved.')
  } catch (e: any) {
    fieldsError.value = e?.response?.data?.message || 'Failed to save the fields.'
  } finally {
    savingFields.value = false
  }
}

// ── Processes ───────────────────────────────────────────────────────────────
const processDialog = ref(false)
const editingProcess = ref<PlatformProcess | null>(null)
const savingProcess = ref(false)
const processErrors = ref<Record<string, string[]>>({})
const processForm = ref({ name: '', description: '', direction: 'outbound' as ProcessDirection, operation: null as string | null, is_enabled: true })
const togglingProcess = ref<number | null>(null)
const removingProcess = ref<number | null>(null)

// The gateway operations a process can switch on (from integration-service),
// loaded the first time the form opens.
const operations = ref<GatewayOperation[]>([])
const operationsError = ref('')
const loadingOperations = ref(false)
async function loadOperations() {
  if (operations.value.length || loadingOperations.value) return
  loadingOperations.value = true
  operationsError.value = ''
  try {
    operations.value = await api.operations(platform.value?.v3_target)
  } catch (e: any) {
    operationsError.value = e?.response?.data?.message || 'Could not load the operations.'
  } finally {
    loadingOperations.value = false
  }
}
const operationItems = computed(() => operations.value.map(o => ({ value: o.operation, title: o.operation, subtitle: o.description })))
const operationDescription = (code: string | null) => operations.value.find(o => o.operation === code)?.description ?? ''

function openProcess(p: PlatformProcess | null = null) {
  editingProcess.value = p
  processForm.value = p
    ? { name: p.name, description: p.description ?? '', direction: p.direction, operation: p.operation, is_enabled: p.is_enabled }
    : { name: '', description: '', direction: 'outbound', operation: null, is_enabled: true }
  processErrors.value = {}
  processDialog.value = true
  loadOperations()
}

// A gateway operation is something the platform sends us.
watch(() => processForm.value.operation, (op) => {
  if (op && processForm.value.direction === 'outbound') processForm.value.direction = 'inbound'
})

async function saveProcess() {
  const payload = {
    name: processForm.value.name.trim(),
    description: processForm.value.description.trim() || null,
    direction: processForm.value.direction,
    operation: processForm.value.operation || null,
    is_enabled: processForm.value.is_enabled,
  }
  savingProcess.value = true
  processErrors.value = {}
  try {
    apply(editingProcess.value
      ? await api.updateProcess(platformId.value, editingProcess.value.id, payload)
      : await api.addProcess(platformId.value, payload))
    processDialog.value = false
    $showToast(editingProcess.value ? 'Process saved.' : 'Process added.')
  } catch (e: any) {
    processErrors.value = e?.response?.data?.errors ?? {}
    $showToast(e?.response?.data?.message || 'Failed to save the process.')
  } finally {
    savingProcess.value = false
  }
}

async function toggleProcess(p: PlatformProcess, on: boolean | null) {
  togglingProcess.value = p.id
  try {
    apply(await api.updateProcess(platformId.value, p.id, { is_enabled: !!on }))
    $showToast(`${p.name} switched ${on ? 'on' : 'off'}.`)
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to update the process.')
  } finally {
    togglingProcess.value = null
  }
}

async function removeProcess(p: PlatformProcess) {
  if (!confirm(`Remove the process "${p.name}"?`)) return
  removingProcess.value = p.id
  try {
    apply(await api.removeProcess(platformId.value, p.id))
    $showToast('Process removed.')
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to remove the process.')
  } finally {
    removingProcess.value = null
  }
}

onMounted(load)
</script>

<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" to="/external-platforms">
      All platforms
    </v-btn>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <template v-if="platform">
      <!-- Header -->
      <div class="d-flex flex-wrap align-start justify-space-between mb-6 ga-3">
        <div style="min-width: 0">
          <div class="d-flex flex-wrap align-center ga-2 mb-1">
            <h2 class="text-h4 font-weight-semibold">{{ platform.name }}</h2>
            <v-chip :color="CATEGORY_COLORS[platform.category] || 'grey'" size="small" variant="tonal" label class="text-capitalize">
              {{ platform.category }}
            </v-chip>
            <v-chip size="small" variant="tonal" label prepend-icon="mdi-layers-triple-outline"
              :title="`Integrated to the ${platform.v3_target_label} system`">
              {{ platform.v3_target_label }}
            </v-chip>
            <v-chip :color="platform.is_active ? 'success' : 'error'" size="small" variant="tonal" label>
              {{ platform.is_active ? 'Active' : 'Inactive' }}
            </v-chip>
          </div>
          <p class="textSecondary mb-1">{{ platform.description || 'No description.' }}</p>
          <p class="text-caption textSecondary mb-0">ID: <code>{{ platform.id }}</code></p>
        </div>
        <div class="d-flex ga-2">
          <v-btn variant="tonal" prepend-icon="mdi-pencil" @click="openDetails">Edit details</v-btn>
          <v-btn variant="tonal" color="error" prepend-icon="mdi-delete" :loading="deleting" @click="removePlatform">Delete</v-btn>
        </div>
      </div>

      <v-alert v-if="syncFailure" type="warning" variant="tonal" class="mb-4">
        <div class="d-flex flex-wrap align-center ga-3">
          <span class="flex-grow-1">
            Saved here, but the integration service did not get the change ({{ syncFailure }}). Until it does, the platform's
            name or on/off switch there is out of date.
          </span>
          <v-btn variant="flat" color="warning" size="small" :loading="syncing" @click="pushAgain">Push again</v-btn>
        </div>
      </v-alert>

      <v-tabs v-model="tab" color="primary" class="mb-4">
        <v-tab v-for="t in TABS" :key="t.value" :value="t.value" :prepend-icon="t.icon">{{ t.title }}</v-tab>
      </v-tabs>

      <v-window v-model="tab">
      <v-window-item value="setup">
      <v-row>
        <!-- Configuration -->
        <v-col cols="12" lg="5">
          <v-card rounded="lg" elevation="10">
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-1 ga-2">
                <h3 class="text-h6 font-weight-semibold">Configuration</h3>
                <v-chip :color="platform.is_configured ? 'success' : 'warning'" size="small" variant="flat" label>
                  {{ setupLabel }}
                </v-chip>
              </div>
              <p class="text-body-2 textSecondary mb-4">
                What we need to connect to {{ platform.name }}. Secrets are stored encrypted and are never shown again.
              </p>

              <template v-if="platform.config_fields.length">
                <v-text-field
                  v-for="f in platform.config_fields" :key="f.key"
                  v-model="values[f.key]"
                  :label="f.label"
                  :type="f.type === 'secret' ? 'password' : f.type === 'number' ? 'number' : 'text'"
                  :autocomplete="f.type === 'secret' ? 'new-password' : 'off'"
                  :prepend-inner-icon="f.type === 'secret' ? 'mdi-eye-off' : f.type === 'url' ? 'mdi-link' : f.type === 'number' ? 'mdi-numeric' : 'mdi-key'"
                  :placeholder="secretIsSet(f) ? '•••••••• saved — leave blank to keep' : undefined"
                  :persistent-placeholder="secretIsSet(f)"
                  :hint="isMissing(f) ? 'Not filled yet' : undefined"
                  :persistent-hint="isMissing(f)"
                  variant="outlined" density="comfortable" class="mb-1"
                />
                <p v-if="platform.configured_at" class="text-caption textSecondary mb-3">
                  Last changed {{ new Date(platform.configured_at).toLocaleString() }}
                </p>
                <div class="d-flex flex-wrap ga-2">
                  <v-btn color="primary" variant="flat" :loading="savingValues" :disabled="!valuesChanged" @click="saveValues">
                    Save configuration
                  </v-btn>
                  <v-btn variant="text" :disabled="!valuesChanged || savingValues" @click="resetValues">Reset</v-btn>
                  <v-spacer />
                  <v-btn variant="tonal" prepend-icon="mdi-format-list-bulleted" @click="openFields">Edit fields</v-btn>
                </div>
              </template>

              <template v-else>
                <v-alert type="info" variant="tonal" class="mb-3">
                  No configuration fields yet. Say what this platform needs — a base URL, an API key, a client secret —
                  then fill them in here.
                </v-alert>
                <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="openFields">Add fields</v-btn>
              </template>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Processes -->
        <v-col cols="12" lg="7">
          <v-card rounded="lg" elevation="10">
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-1 ga-2">
                <h3 class="text-h6 font-weight-semibold">Processes</h3>
                <v-btn color="primary" variant="flat" size="small" prepend-icon="mdi-plus" @click="openProcess()">Add process</v-btn>
              </div>
              <p class="text-body-2 textSecondary mb-4">
                What this integration is meant to cover.
                <template v-if="platform.processes_count">
                  {{ platform.enabled_processes_count }} of {{ platform.processes_count }} switched on.
                </template>
              </p>

              <v-alert v-if="!platform.processes.length" type="info" variant="tonal">
                No processes yet. Add each thing this integration does, e.g. "Send claims" or "Receive payment confirmations".
              </v-alert>

              <v-list v-else lines="two" class="pa-0">
                <template v-for="(p, idx) in platform.processes" :key="p.id">
                  <v-divider v-if="idx" />
                  <v-list-item class="px-0" :class="{ 'process-off': !p.is_enabled }">
                    <v-list-item-title class="d-flex flex-wrap align-center ga-2 font-weight-medium">
                      {{ p.name }}
                      <v-chip size="x-small" variant="tonal" label :prepend-icon="directionOf(p.direction).icon" :title="directionOf(p.direction).hint">
                        {{ directionOf(p.direction).title }}
                      </v-chip>
                      <v-chip v-if="p.operation" size="x-small" variant="tonal" color="primary" label prepend-icon="mdi-api"
                        title="The gateway operation this process switches on">
                        {{ p.operation }}
                      </v-chip>
                    </v-list-item-title>
                    <v-list-item-subtitle class="process-description">{{ p.description || 'No description.' }}</v-list-item-subtitle>
                    <template #append>
                      <div class="d-flex align-center ga-1">
                        <v-switch
                          :model-value="p.is_enabled" color="success" hide-details density="compact" class="mr-1"
                          :loading="togglingProcess === p.id" :disabled="togglingProcess === p.id"
                          :aria-label="`${p.name} is ${p.is_enabled ? 'on' : 'off'}`"
                          @update:model-value="toggleProcess(p, $event)"
                        />
                        <v-btn icon="mdi-pencil" size="small" variant="text" :aria-label="`Edit ${p.name}`" @click="openProcess(p)" />
                        <v-btn icon="mdi-delete" size="small" variant="text" color="error" :aria-label="`Remove ${p.name}`"
                          :loading="removingProcess === p.id" @click="removeProcess(p)" />
                      </div>
                    </template>
                  </v-list-item>
                </template>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      </v-window-item>

      <!-- The platform's way in, held by integration-service -->
      <v-window-item value="credentials">
        <PlatformCredentials :platform-id="platform.id" :platform-name="platform.name" :platform-active="platform.is_active" />
      </v-window-item>

      <v-window-item value="tenants">
        <PlatformTenants :platform-id="platform.id" :platform-name="platform.name"
          :system="platform.v3_target" :system-label="platform.v3_target_label" />
      </v-window-item>

      <v-window-item value="requests">
        <PlatformRequests :platform-id="platform.id" :platform-name="platform.name" />
      </v-window-item>
      </v-window>
    </template>

    <!-- Edit details -->
    <v-dialog v-model="detailsDialog" max-width="560" scrollable>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center pa-4 pb-2">
          Edit details
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" aria-label="Close" @click="detailsDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" md="7">
              <v-text-field v-model="details.name" label="Name" variant="outlined" density="comfortable" :error-messages="detailsErrors.name" />
            </v-col>
            <v-col cols="12" md="5">
              <v-select v-model="details.category" :items="CATEGORIES" label="Category"
                variant="outlined" density="comfortable" class="text-capitalize" :error-messages="detailsErrors.category" />
            </v-col>
            <v-col cols="12">
              <v-textarea v-model="details.description" label="Description" variant="outlined" density="comfortable"
                rows="2" auto-grow :error-messages="detailsErrors.description" />
            </v-col>
            <v-col cols="12">
              <v-switch v-model="details.is_active" label="Active" color="success" hide-details density="compact" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 ga-2">
          <v-spacer />
          <v-btn variant="text" @click="detailsDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="savingDetails" :disabled="!details.name.trim()" @click="saveDetails">Save details</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit configuration fields -->
    <v-dialog v-model="fieldsDialog" max-width="680" scrollable>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center pa-4 pb-2">
          Configuration fields
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" aria-label="Close" @click="fieldsDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <p class="text-body-2 textSecondary mb-4">
            The settings {{ platform?.name }} needs. Mark keys, tokens and passwords as "Secret" so they are hidden once saved.
          </p>
          <v-row v-for="(f, idx) in fieldRows" :key="idx" dense class="align-center">
            <v-col cols="12" sm="4">
              <v-text-field v-model="f.key" label="Key" placeholder="api_key" variant="outlined" density="compact" hide-details />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field v-model="f.label" label="Label" placeholder="API Key" variant="outlined" density="compact" hide-details />
            </v-col>
            <v-col cols="10" sm="3">
              <v-select v-model="f.type" :items="FIELD_TYPES" label="Type" variant="outlined" density="compact" hide-details />
            </v-col>
            <v-col cols="2" sm="1" class="d-flex justify-center">
              <v-btn icon="mdi-close" size="x-small" variant="text" color="error" aria-label="Remove field" @click="removeFieldRow(idx)" />
            </v-col>
          </v-row>
          <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" class="mt-3" @click="addFieldRow">Add field</v-btn>

          <v-alert v-if="droppedFields.length" type="warning" variant="tonal" density="compact" class="mt-4">
            Saving removes the stored value of: {{ droppedFields.map(f => f.label).join(', ') }}.
          </v-alert>
          <v-alert v-if="fieldsError" type="error" variant="tonal" density="compact" class="mt-4">{{ fieldsError }}</v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 ga-2">
          <v-spacer />
          <v-btn variant="text" @click="fieldsDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="savingFields" @click="saveFields">Save fields</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add / edit process -->
    <v-dialog v-model="processDialog" max-width="560" scrollable>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center pa-4 pb-2">
          {{ editingProcess ? 'Edit process' : 'Add process' }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" aria-label="Close" @click="processDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-text-field v-model="processForm.name" label="Name" placeholder="e.g. Send claims" autofocus
            variant="outlined" density="comfortable" :error-messages="processErrors.name" />
          <v-textarea v-model="processForm.description" label="Description" placeholder="What happens, when, and what data moves"
            variant="outlined" density="comfortable" rows="3" auto-grow :error-messages="processErrors.description" />
          <p class="text-subtitle-2 font-weight-medium mb-2">Direction</p>
          <v-btn-toggle v-model="processForm.direction" mandatory color="primary" variant="outlined" density="comfortable" divided class="mb-4">
            <v-btn v-for="d in DIRECTIONS" :key="d.value" :value="d.value" :prepend-icon="d.icon" :title="d.hint">{{ d.title }}</v-btn>
          </v-btn-toggle>
          <v-select
            v-model="processForm.operation" :items="operationItems" item-props clearable
            :loading="loadingOperations" label="Gateway operation (optional)" variant="outlined" density="comfortable"
            :hint="processForm.operation ? operationDescription(processForm.operation) : `Choose one to let ${platform?.name} send this request through us while the process is on.`"
            persistent-hint class="mb-2" :error-messages="processErrors.operation || (operationsError ? [operationsError] : undefined)" />
          <v-switch v-model="processForm.is_enabled" label="Switched on" color="success" hide-details density="compact" />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 ga-2">
          <v-spacer />
          <v-btn variant="text" @click="processDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="savingProcess" :disabled="!processForm.name.trim()" @click="saveProcess">
            {{ editingProcess ? 'Save process' : 'Add process' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.process-off :deep(.v-list-item-title),
.process-off :deep(.v-list-item-subtitle) {
  opacity: 0.6;
}
.process-description {
  white-space: normal;
  -webkit-line-clamp: unset;
}
</style>
