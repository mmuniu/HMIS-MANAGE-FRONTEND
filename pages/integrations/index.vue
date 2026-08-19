<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { useIntegrationsApi, type Integration, type TenantIntegration, type RequiredField } from '@/composables/useIntegrationsApi'

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
  finally { loading.value = false }
}

// ── Hospital admin: connect / disconnect ──────────────────────────────────────
const tenantItems = ref<TenantIntegration[]>([])
const connectDialog = ref(false)
const selected = ref<TenantIntegration | null>(null)
const configForm = ref<Record<string, string>>({})
const connecting = ref(false)
const disconnecting = ref<string | null>(null)

const STATUS_COLOR: Record<string, string> = { active: 'success', pending: 'warning', error: 'error' }

function openConnect(i: TenantIntegration) {
  selected.value = i
  configForm.value = {}
  for (const f of i.required_fields) {
    configForm.value[f.key] = i.tenant?.config?.[f.key] ?? ''
  }
  connectDialog.value = true
}

async function saveConnect() {
  if (!selected.value || !orgId.value) return
  connecting.value = true
  try {
    await api.tenantConnect(orgId.value, selected.value.id, configForm.value)
    $showToast(`${selected.value.name} connected.`)
    connectDialog.value = false
    await loadTenant()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to connect.')
  } finally {
    connecting.value = false
  }
}

async function disconnect(i: TenantIntegration) {
  if (!confirm(`Disconnect ${i.name}?`) || !orgId.value) return
  disconnecting.value = i.id
  try {
    await api.tenantDisconnect(orgId.value, i.id)
    $showToast(`${i.name} disconnected.`)
    await loadTenant()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to disconnect.')
  } finally {
    disconnecting.value = null
  }
}

async function loadTenant() {
  if (!orgId.value) return
  loading.value = true
  try {
    tenantItems.value = await api.tenantList(orgId.value)
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to load integrations.')
    if (isCrossTenant.value) router.push('/integrations')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (isCrossTenant.value) {
    loadTenant()
  } else if (auth.isSystemAdmin) {
    loadCatalog()
  } else {
    if (!tenant.organizationId) await tenant.loadContext()
    loadTenant()
  }
})
</script>

<template>
  <div>
    <!-- ── System admin view ───────────────────────────────────────────── -->
    <template v-if="auth.isSystemAdmin && !isCrossTenant">
      <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
        <div>
          <h2 class="text-h4 font-weight-semibold">Integrations</h2>
          <p class="textSecondary mb-0">Manage the integration types available to all hospitals.</p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openNew">Add Integration</v-btn>
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
                <v-chip v-if="!i.is_active" color="error" size="x-small" variant="tonal" label>Inactive</v-chip>
              </div>
              <h3 class="text-subtitle-1 font-weight-semibold mb-1">{{ i.name }}</h3>
              <p class="text-body-2 textSecondary mb-3">{{ i.description || '—' }}</p>
              <div v-if="i.required_fields.length" class="mb-3">
                <p class="text-caption textSecondary mb-1">Required fields:</p>
                <div class="d-flex flex-wrap ga-1">
                  <v-chip v-for="f in i.required_fields" :key="f.key" size="x-small" variant="outlined" label>
                    {{ f.label }}<v-icon v-if="f.type === 'secret'" end icon="mdi-eye-off" size="10" />
                  </v-chip>
                </div>
              </div>
              <div class="d-flex ga-2">
                <v-btn size="small" variant="tonal" prepend-icon="mdi-pencil" @click="openEdit(i)">Edit</v-btn>
                <v-btn size="small" variant="tonal" color="error" prepend-icon="mdi-delete"
                  :loading="deleting === i.id" @click="removeCatalog(i.id)">Delete</v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col v-if="!loading && !catalog.length" cols="12">
          <v-alert type="info" variant="tonal">No integrations yet. Click "Add Integration" to create one.</v-alert>
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
    </template>

    <!-- ── Hospital-scoped view (hospital admin, or platform staff managing a specific hospital) ── -->
    <template v-else>
      <v-btn v-if="isCrossTenant" variant="text" prepend-icon="mdi-arrow-left" class="mb-4"
        :to="`/hospitals/${scopedHospitalId}`">
        Back to hospital
      </v-btn>

      <div class="mb-6">
        <h2 class="text-h4 font-weight-semibold">
          {{ isCrossTenant ? `Integrations — ${scopedHospitalName || scopedHospitalId}` : 'Integrations' }}
        </h2>
        <p class="textSecondary mb-0">
          {{ isCrossTenant
            ? 'Connect this hospital to external systems and services.'
            : 'Connect your hospital to external systems and services.' }}
        </p>
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
                <v-chip v-if="i.tenant" :color="STATUS_COLOR[i.tenant.status]" size="x-small" variant="flat" label class="text-capitalize">
                  {{ i.tenant.status }}
                </v-chip>
                <v-chip v-else size="x-small" variant="tonal" color="grey" label>Not connected</v-chip>
              </div>
              <h3 class="text-subtitle-1 font-weight-semibold mb-1">{{ i.name }}</h3>
              <p class="text-body-2 textSecondary mb-3">{{ i.description || '—' }}</p>
              <p v-if="i.tenant?.connected_at" class="text-caption textSecondary mb-3">
                Connected: {{ new Date(i.tenant.connected_at).toLocaleDateString() }}
              </p>
              <div class="d-flex ga-2">
                <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-link" @click="openConnect(i)">
                  {{ i.tenant ? 'Update' : 'Connect' }}
                </v-btn>
                <v-btn v-if="i.tenant" size="small" color="error" variant="tonal" prepend-icon="mdi-link-off"
                  :loading="disconnecting === i.id" @click="disconnect(i)">
                  Disconnect
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col v-if="!loading && !tenantItems.length" cols="12">
          <v-alert type="info" variant="tonal">No integrations available yet. Contact your platform admin.</v-alert>
        </v-col>
      </v-row>

      <!-- Connect / Update dialog -->
      <v-dialog v-model="connectDialog" max-width="500">
        <v-card rounded="lg">
          <v-card-title class="d-flex align-center pa-4 pb-2">
            {{ selected?.tenant ? 'Update' : 'Connect' }} {{ selected?.name }}
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" @click="connectDialog = false" />
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4">
            <p class="text-body-2 textSecondary mb-4">{{ selected?.description }}</p>
            <v-text-field
              v-for="f in selected?.required_fields" :key="f.key"
              v-model="configForm[f.key]"
              :label="f.label"
              :type="f.type === 'secret' ? 'password' : 'text'"
              :prepend-inner-icon="f.type === 'secret' ? 'mdi-eye-off' : f.type === 'url' ? 'mdi-link' : 'mdi-key'"
              variant="outlined" density="comfortable" hide-details class="mb-3"
            />
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4 ga-2">
            <v-spacer />
            <v-btn variant="text" @click="connectDialog = false">Cancel</v-btn>
            <v-btn color="primary" variant="flat" :loading="connecting" @click="saveConnect">
              {{ selected?.tenant ? 'Save changes' : 'Connect' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>
