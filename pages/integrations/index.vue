<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { useIntegrationsApi, type Integration, type TenantIntegration, type AvailableIntegration, type RequiredField } from '@/composables/useIntegrationsApi'

const auth = useAuthStore()
const tenant = useTenantStore()
const api = useIntegrationsApi()
const route = useRoute()
const router = useRouter()
const { $showToast } = useNuxtApp()

const loading = ref(false)

// Platform staff arriving from a hospital's detail page manage THAT hospital's
// integrations rather than the catalog — scoped by ?hospitalId= in the URL.
const scopedHospitalId = computed(() => (route.query.hospitalId as string) || null)
const scopedHospitalName = computed(() => (route.query.hospitalName as string) || null)
const isCrossTenant = computed(() => !!scopedHospitalId.value)
const orgId = computed(() => scopedHospitalId.value || tenant.organizationId)

// Plain /integrations lists every master integration for platform staff;
// only system admins can set them up, edit or delete them.
const showMasters = computed(() => !isCrossTenant.value && auth.isPlatformUser)
const canManageMasters = computed(() => auth.isSystemAdmin)

// ── System admin: catalog management ─────────────────────────────────────────
const catalog = ref<Integration[]>([])
const dialog = ref(false)
const editing = ref<Integration | null>(null)
const saving = ref(false)
const deleting = ref<string | null>(null)

const CATEGORIES = ['accounting', 'erp', 'crm', 'hr', 'other']
const FIELD_TYPES = ['string', 'secret', 'url', 'number']
const CATEGORY_COLORS: Record<string, string> = {
  accounting: 'success', erp: 'primary', crm: 'info', hr: 'warning', other: 'grey',
}

const form = ref({
  id: '', name: '', category: 'accounting', description: '', is_active: true,
  required_fields: [] as RequiredField[],
})

function openNew() {
  editing.value = null
  form.value = { id: '', name: '', category: 'accounting', description: '', is_active: true, required_fields: [] }
  dialog.value = true
}

function openEdit(i: Integration) {
  editing.value = i
  form.value = { id: i.id, name: i.name, category: i.category, description: i.description || '', is_active: i.is_active, required_fields: i.required_fields.map(f => ({ ...f })) }
  dialog.value = true
}

function addField() { form.value.required_fields.push({ key: '', label: '', type: 'string' }) }
function removeField(idx: number) { form.value.required_fields.splice(idx, 1) }

async function saveCatalog() {
  saving.value = true
  try {
    if (editing.value) {
      await api.update(editing.value.id, form.value)
      $showToast('Integration updated.')
    } else {
      await api.create(form.value)
      $showToast('Integration added.')
    }
    dialog.value = false
    await loadCatalog()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to save.')
  } finally {
    saving.value = false
  }
}

async function removeCatalog(id: string) {
  if (!confirm('Delete this integration? All tenant connections will also be removed.')) return
  deleting.value = id
  try {
    await api.destroy(id)
    $showToast('Deleted.')
    await loadCatalog()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to delete.')
  } finally {
    deleting.value = null
  }
}

async function loadCatalog() {
  loading.value = true
  try { catalog.value = await api.list() }
  catch (e: any) { $showToast(e?.response?.data?.message || 'Failed to load integrations.') }
  finally { loading.value = false }
}

// ── System admin: each integration's master connection ───────────────────────
// One per integration, with no hospital attached; hospitals are linked to it
// afterwards from /integrations?hospitalId=…
const masterDialog = ref(false)
const masterTarget = ref<Integration | null>(null)
const masterForm = ref<Record<string, string>>({})
const savingMaster = ref(false)

function openMaster(i: Integration) {
  masterTarget.value = i
  masterForm.value = {}
  for (const f of i.required_fields) {
    // Secrets are never sent to the browser — left blank keeps the stored one.
    masterForm.value[f.key] = f.type === 'secret' ? '' : (i.config?.[f.key] ?? '')
  }
  masterDialog.value = true
}

function secretIsSet(f: RequiredField) {
  return f.type === 'secret' && !!masterTarget.value?.secrets_set?.includes(f.key)
}

async function saveMaster() {
  if (!masterTarget.value) return
  savingMaster.value = true
  try {
    const res = await api.configure(masterTarget.value.id, masterForm.value)
    const sync = res.integration_service
    $showToast(
      sync && sync.failed.length
        ? `Connection saved. Updated in the integration service for ${sync.synced} of ${sync.attempted} linked hospitals.`
        : sync && sync.attempted
          ? `Connection saved and updated for ${sync.attempted} linked hospital(s).`
          : 'Connection saved.',
    )
    masterDialog.value = false
    await loadCatalog()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to save the connection.')
  } finally {
    savingMaster.value = false
  }
}

// ── Hospital: its own integrations + its values for them ────────────────────
// Only the integrations this hospital has added are listed; "Add integration"
// picks from the rest. Each one uses the master connection's values, and the
// hospital fills whatever the master leaves empty, plus any extra .env-style
// variables of its own.
const tenantItems = ref<TenantIntegration[]>([])
const available = ref<AvailableIntegration[]>([])
const disconnecting = ref<string | null>(null)

const valuesDialog = ref(false)
const valuesIsNew = ref(false)
const valuesTargetId = ref<string | null>(null)
const fieldValues = ref<Record<string, string>>({})
const variables = ref<{ key: string; value: string }[]>([])
const savingValues = ref(false)

// The integration the dialog is editing — an added one, or one being added.
const valuesTarget = computed<TenantIntegration | AvailableIntegration | null>(() =>
  tenantItems.value.find(i => i.id === valuesTargetId.value)
  ?? available.value.find(i => i.id === valuesTargetId.value)
  ?? null,
)

function openAdd() {
  valuesIsNew.value = true
  valuesTargetId.value = null
  fieldValues.value = {}
  variables.value = []
  valuesDialog.value = true
}

function openValues(i: TenantIntegration) {
  valuesIsNew.value = false
  valuesTargetId.value = i.id
  fieldValues.value = Object.fromEntries(
    i.fields.filter(f => f.source !== 'master').map(f => [f.key, f.value ?? '']),
  )
  variables.value = Object.entries(i.variables).map(([key, value]) => ({ key, value: String(value) }))
  valuesDialog.value = true
}

// Picking a different integration while adding resets the form for its fields.
function pickToAdd(id: string | null) {
  valuesTargetId.value = id
  const picked = available.value.find(i => i.id === id)
  fieldValues.value = Object.fromEntries((picked?.fields ?? []).filter(f => f.source !== 'master').map(f => [f.key, '']))
  variables.value = []
}

function addVariable() { variables.value.push({ key: '', value: '' }) }
function removeVariable(idx: number) { variables.value.splice(idx, 1) }

async function saveValues() {
  const target = valuesTarget.value
  if (!target || !orgId.value) return

  const config: Record<string, string> = { ...fieldValues.value }
  for (const v of variables.value) {
    const key = v.key.trim()
    if (key) config[key] = v.value
  }

  savingValues.value = true
  try {
    const res = await api.tenantConnect(orgId.value, target.id, config)
    // Saved here either way; also say when the copy to the v3
    // integration-service didn't go through, and why.
    const sync = res?.integration_service
    const verb = valuesIsNew.value ? 'added' : 'saved'
    $showToast(
      sync && !sync.synced
        ? `${target.name} ${verb}, but not copied to the integration service: ${sync.error}`
        : `${target.name} ${verb}.`,
    )
    valuesDialog.value = false
    await loadTenant()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to save.')
  } finally {
    savingValues.value = false
  }
}

async function disconnect(i: TenantIntegration) {
  if (!confirm(`Remove ${i.name} from this hospital?`) || !orgId.value) return
  disconnecting.value = i.id
  try {
    await api.tenantDisconnect(orgId.value, i.id)
    $showToast(`${i.name} removed.`)
    await loadTenant()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to remove.')
  } finally {
    disconnecting.value = null
  }
}

async function loadTenant() {
  if (!orgId.value) return
  loading.value = true
  try {
    const res = await api.tenantList(orgId.value)
    tenantItems.value = res.data
    available.value = res.available
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to load integrations.')
    if (isCrossTenant.value) router.push('/integrations')
  } finally {
    loading.value = false
  }
}

async function load() {
  if (isCrossTenant.value) {
    loadTenant()
  } else if (showMasters.value) {
    loadCatalog()
  } else {
    if (!tenant.organizationId) await tenant.loadContext()
    loadTenant()
  }
}

onMounted(load)

// /integrations and /integrations?hospitalId=… are the same page, so going
// from a hospital's integrations back to the master list (or to another
// hospital) reuses this component — reload for the new URL.
watch(() => route.query.hospitalId, load)
</script>

<template>
  <div>
    <!-- ── Master integrations (platform staff; managed by system admins) ── -->
    <template v-if="showMasters">
      <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
        <div>
          <h2 class="text-h4 font-weight-semibold">Integrations</h2>
          <p class="textSecondary mb-0">
            Every master integration on the platform. Each master connection is set up once here — hospitals are then
            linked to it from their own page.
          </p>
        </div>
        <v-btn v-if="canManageMasters" color="primary" prepend-icon="mdi-plus" @click="openNew">Add Integration</v-btn>
      </div>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

      <v-row>
        <v-col v-for="i in catalog" :key="i.id" cols="12" md="6" lg="4">
          <v-card rounded="lg" elevation="10" :opacity="i.is_active ? 1 : 0.6">
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-2">
                <v-chip :color="CATEGORY_COLORS[i.category] || 'grey'" size="small" variant="tonal" label class="text-capitalize">
                  {{ i.category }}
                </v-chip>
                <div class="d-flex ga-1">
                  <v-chip v-if="!i.is_active" color="error" size="x-small" variant="tonal" label>Inactive</v-chip>
                  <v-chip :color="i.is_configured ? 'success' : 'warning'" size="x-small" variant="flat" label>
                    {{ i.is_configured ? 'Connected' : 'Not set up' }}
                  </v-chip>
                </div>
              </div>
              <h3 class="text-subtitle-1 font-weight-semibold mb-1">{{ i.name }}</h3>
              <p class="text-body-2 textSecondary mb-2">{{ i.description || '—' }}</p>
              <p class="text-caption textSecondary mb-3">
                Linked to {{ i.linked_hospitals ?? 0 }} hospital{{ (i.linked_hospitals ?? 0) === 1 ? '' : 's' }}
                <template v-if="i.configured_at"> · set up {{ new Date(i.configured_at).toLocaleDateString() }}</template>
              </p>
              <div v-if="i.required_fields.length" class="mb-3">
                <p class="text-caption textSecondary mb-1">Required fields:</p>
                <div class="d-flex flex-wrap ga-1">
                  <v-chip v-for="f in i.required_fields" :key="f.key" size="x-small" variant="outlined" label>
                    {{ f.label }}<v-icon v-if="f.type === 'secret'" end icon="mdi-eye-off" size="10" />
                  </v-chip>
                </div>
              </div>
              <div v-if="canManageMasters" class="d-flex flex-wrap ga-2">
                <v-btn size="small" color="primary" variant="flat" prepend-icon="mdi-link" @click="openMaster(i)">
                  {{ i.is_configured ? 'Update connection' : 'Set up connection' }}
                </v-btn>
                <v-btn size="small" variant="tonal" prepend-icon="mdi-pencil" @click="openEdit(i)">Edit</v-btn>
                <v-btn size="small" variant="tonal" color="error" prepend-icon="mdi-delete"
                  :loading="deleting === i.id" @click="removeCatalog(i.id)">Delete</v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col v-if="!loading && !catalog.length" cols="12">
          <v-alert type="info" variant="tonal">
            No integrations yet.<template v-if="canManageMasters"> Click "Add Integration" to create one.</template>
          </v-alert>
        </v-col>
      </v-row>

      <!-- Add / Edit dialog -->
      <v-dialog v-model="dialog" max-width="620" scrollable>
        <v-card rounded="lg">
          <v-card-title class="d-flex align-center pa-4 pb-2">
            {{ editing ? 'Edit Integration' : 'Add Integration' }}
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.id" label="ID (slug)" placeholder="e.g. quickbooks"
                  variant="outlined" density="comfortable" hide-details :disabled="!!editing" />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="form.name" label="Name" placeholder="e.g. QuickBooks Online"
                  variant="outlined" density="comfortable" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-select v-model="form.category" :items="CATEGORIES" label="Category"
                  variant="outlined" density="comfortable" hide-details class="text-capitalize" />
              </v-col>
              <v-col cols="12" md="6" class="d-flex align-center">
                <v-switch v-model="form.is_active" label="Active" color="success" hide-details density="compact" />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="form.description" label="Description" variant="outlined"
                  density="comfortable" hide-details rows="2" auto-grow />
              </v-col>
            </v-row>
            <v-divider class="my-4" />
            <div class="d-flex align-center justify-space-between mb-2">
              <p class="text-subtitle-2 font-weight-medium mb-0">Required fields</p>
              <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" @click="addField">Add field</v-btn>
            </div>
            <v-row v-for="(f, idx) in form.required_fields" :key="idx" dense class="align-center">
              <v-col cols="4">
                <v-text-field v-model="f.key" label="Key" placeholder="client_id"
                  variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model="f.label" label="Label" placeholder="Client ID"
                  variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="3">
                <v-select v-model="f.type" :items="FIELD_TYPES" label="Type"
                  variant="outlined" density="compact" hide-details />
              </v-col>
              <v-col cols="1" class="d-flex justify-center">
                <v-btn icon="mdi-close" size="x-small" variant="text" color="error" @click="removeField(idx)" />
              </v-col>
            </v-row>
            <p v-if="!form.required_fields.length" class="text-caption textSecondary mt-2">
              No fields yet. Click "Add field" to define what config tenants need to provide.
            </p>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4 ga-2">
            <v-spacer />
            <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
            <v-btn color="primary" variant="flat" :loading="saving" @click="saveCatalog">
              {{ editing ? 'Save changes' : 'Add integration' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Master connection dialog -->
      <v-dialog v-model="masterDialog" max-width="500">
        <v-card rounded="lg">
          <v-card-title class="d-flex align-center pa-4 pb-2">
            {{ masterTarget?.is_configured ? 'Update' : 'Set up' }} {{ masterTarget?.name }} connection
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="masterDialog = false" />
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4">
            <p class="text-body-2 textSecondary mb-4">
              The one connection every linked hospital uses. Leave a field blank for each hospital to fill in its own.
              <template v-if="masterTarget?.linked_hospitals">
                Saving changes updates it for all {{ masterTarget.linked_hospitals }} linked hospital(s).
              </template>
            </p>
            <v-text-field
              v-for="f in masterTarget?.required_fields" :key="f.key"
              v-model="masterForm[f.key]"
              :label="f.label"
              :type="f.type === 'secret' ? 'password' : 'text'"
              :prepend-inner-icon="f.type === 'secret' ? 'mdi-eye-off' : f.type === 'url' ? 'mdi-link' : 'mdi-key'"
              :placeholder="secretIsSet(f) ? '•••••••• saved — leave blank to keep' : undefined"
              :persistent-placeholder="secretIsSet(f)"
              variant="outlined" density="comfortable" hide-details class="mb-3"
            />
            <p v-if="!masterTarget?.required_fields.length" class="text-caption textSecondary">
              This integration has no fields defined yet — add them with "Edit" first.
            </p>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4 ga-2">
            <v-spacer />
            <v-btn variant="text" @click="masterDialog = false">Cancel</v-btn>
            <v-btn color="primary" variant="flat" :loading="savingMaster" :disabled="!masterTarget?.required_fields.length" @click="saveMaster">
              Save connection
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>

    <!-- ── Hospital-scoped view (hospital admin, or platform staff managing a specific hospital) ── -->
    <template v-else>
      <v-btn v-if="isCrossTenant" variant="text" prepend-icon="mdi-arrow-left" class="mb-4"
        :to="`/hospitals/${scopedHospitalId}`">
        Back to hospital
      </v-btn>

      <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
        <div>
          <h2 class="text-h4 font-weight-semibold">
            {{ isCrossTenant ? `Integrations — ${scopedHospitalName || scopedHospitalId}` : 'Integrations' }}
          </h2>
          <p class="textSecondary mb-0">
            {{ isCrossTenant ? 'This hospital\'s' : 'Your hospital\'s' }} integrations. Each uses the platform's master
            connection; fill in whatever it leaves empty, and add any variables of your own.
          </p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" :disabled="!available.length" @click="openAdd">Add integration</v-btn>
      </div>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

      <v-row>
        <v-col v-for="i in tenantItems" :key="i.id" cols="12" md="6" lg="4">
          <v-card rounded="lg" elevation="10">
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-2">
                <v-chip :color="CATEGORY_COLORS[i.category] || 'grey'" size="small" variant="tonal" label class="text-capitalize">
                  {{ i.category }}
                </v-chip>
                <v-chip :color="i.missing.length ? 'warning' : 'success'" size="x-small" variant="flat" label>
                  {{ i.missing.length ? `${i.missing.length} field${i.missing.length === 1 ? '' : 's'} to fill` : 'Ready' }}
                </v-chip>
              </div>
              <h3 class="text-subtitle-1 font-weight-semibold mb-1">{{ i.name }}</h3>
              <p class="text-body-2 textSecondary mb-3">{{ i.description || '—' }}</p>
              <div v-if="i.fields.length || Object.keys(i.variables).length" class="d-flex flex-wrap ga-1 mb-3">
                <v-chip v-for="f in i.fields" :key="f.key" size="x-small" label
                  :variant="f.source === 'missing' ? 'outlined' : 'tonal'"
                  :color="f.source === 'missing' ? 'warning' : f.source === 'master' ? 'primary' : 'success'"
                  :title="f.source === 'master' ? 'Set by the master connection' : f.source === 'hospital' ? 'Set for this hospital' : 'Not filled yet'">
                  {{ f.label }}
                </v-chip>
                <v-chip v-for="(_, key) in i.variables" :key="key" size="x-small" label variant="tonal" color="secondary">
                  {{ key }}
                </v-chip>
              </div>
              <p v-if="i.tenant.connected_at" class="text-caption textSecondary mb-3">
                Added {{ new Date(i.tenant.connected_at).toLocaleDateString() }}
              </p>
              <div class="d-flex ga-2">
                <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-tune-variant" @click="openValues(i)">
                  {{ i.missing.length ? 'Fill in values' : 'Edit values' }}
                </v-btn>
                <v-btn size="small" color="error" variant="tonal" prepend-icon="mdi-link-off"
                  :loading="disconnecting === i.id" @click="disconnect(i)">
                  Remove
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col v-if="!loading && !tenantItems.length" cols="12">
          <v-alert type="info" variant="tonal">
            No integrations added to this hospital yet.
            <template v-if="available.length">Click "Add integration" to add one.</template>
            <template v-else>None are available — they are set up on the Integrations page by a system admin.</template>
          </v-alert>
        </v-col>
      </v-row>

      <!-- Add integration / edit this hospital's values -->
      <v-dialog v-model="valuesDialog" max-width="560" scrollable>
        <v-card rounded="lg">
          <v-card-title class="d-flex align-center pa-4 pb-2">
            {{ valuesIsNew ? 'Add integration' : `${valuesTarget?.name} — values` }}
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="valuesDialog = false" />
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4">
            <v-select
              v-if="valuesIsNew"
              :model-value="valuesTargetId"
              :items="available"
              item-title="name"
              item-value="id"
              label="Integration"
              variant="outlined" density="comfortable" hide-details class="mb-4"
              @update:model-value="pickToAdd"
            />

            <template v-if="valuesTarget">
              <p v-if="valuesTarget.description" class="text-body-2 textSecondary mb-4">{{ valuesTarget.description }}</p>

              <template v-for="f in valuesTarget.fields" :key="f.key">
                <v-text-field
                  v-if="f.source === 'master'"
                  :model-value="'Set by the master connection'"
                  :label="f.label"
                  prepend-inner-icon="mdi-lock"
                  variant="outlined" density="comfortable" hide-details class="mb-3" disabled
                />
                <v-text-field
                  v-else
                  v-model="fieldValues[f.key]"
                  :label="f.label"
                  :type="f.type === 'secret' ? 'password' : 'text'"
                  :prepend-inner-icon="f.type === 'secret' ? 'mdi-eye-off' : f.type === 'url' ? 'mdi-link' : 'mdi-key'"
                  :placeholder="f.type === 'secret' && f.is_set ? '•••••••• saved — leave blank to keep' : undefined"
                  :persistent-placeholder="f.type === 'secret' && f.is_set"
                  variant="outlined" density="comfortable" hide-details class="mb-3"
                />
              </template>

              <div class="d-flex align-center justify-space-between mt-2 mb-2">
                <p class="text-subtitle-2 font-weight-medium mb-0">Variables</p>
                <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" @click="addVariable">Add variable</v-btn>
              </div>
              <p v-if="!variables.length" class="text-caption textSecondary mb-0">
                Extra KEY=value settings for this hospital only, like lines in a .env file.
              </p>
              <v-row v-for="(v, idx) in variables" :key="idx" dense class="align-center">
                <v-col cols="5">
                  <v-text-field v-model="v.key" label="Key" placeholder="REALM_ID" variant="outlined" density="compact" hide-details />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="v.value" label="Value" variant="outlined" density="compact" hide-details />
                </v-col>
                <v-col cols="1" class="d-flex justify-center">
                  <v-btn icon="mdi-close" size="x-small" variant="text" color="error" @click="removeVariable(idx)" />
                </v-col>
              </v-row>
            </template>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4 ga-2">
            <v-spacer />
            <v-btn variant="text" @click="valuesDialog = false">Cancel</v-btn>
            <v-btn color="primary" variant="flat" :loading="savingValues" :disabled="!valuesTarget" @click="saveValues">
              {{ valuesIsNew ? 'Add integration' : 'Save values' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>
