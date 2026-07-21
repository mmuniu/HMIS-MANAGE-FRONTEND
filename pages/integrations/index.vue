<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useIntegrationsApi } from '@/composables/useIntegrationsApi'

const api = useIntegrationsApi()
const { $showToast } = useNuxtApp()

export interface RequiredField { key: string; label: string; type: 'string' | 'secret' | 'url' | 'number' }
export interface Integration {
  id: string; name: string; category: string; description: string | null
  required_fields: RequiredField[]; is_active: boolean
}

const items = ref<Integration[]>([])
const loading = ref(false)

const CATEGORY_COLORS: Record<string, string> = {
  accounting: 'success', erp: 'primary', crm: 'info', hr: 'warning', other: 'grey',
}

// Dialog state
const dialog = ref(false)
const editing = ref<Integration | null>(null)
const saving = ref(false)
const deleting = ref<string | null>(null)

const form = ref({
  id: '', name: '', category: 'accounting', description: '', is_active: true,
  required_fields: [] as RequiredField[],
})

const FIELD_TYPES = ['string', 'secret', 'url', 'number']
const CATEGORIES = ['accounting', 'erp', 'crm', 'hr', 'other']

function openNew() {
  editing.value = null
  form.value = { id: '', name: '', category: 'accounting', description: '', is_active: true, required_fields: [] }
  dialog.value = true
}

function openEdit(i: Integration) {
  editing.value = i
  form.value = {
    id: i.id, name: i.name, category: i.category,
    description: i.description || '', is_active: i.is_active,
    required_fields: i.required_fields.map(f => ({ ...f })),
  }
  dialog.value = true
}

function addField() {
  form.value.required_fields.push({ key: '', label: '', type: 'string' })
}
function removeField(idx: number) {
  form.value.required_fields.splice(idx, 1)
}

async function save() {
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
    await load()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to save.')
  } finally {
    saving.value = false
  }
}

async function remove(id: string) {
  if (!confirm('Delete this integration? Any tenant configs will also be removed.')) return
  deleting.value = id
  try {
    await api.destroy(id)
    $showToast('Integration deleted.')
    await load()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to delete.')
  } finally {
    deleting.value = null
  }
}

async function load() {
  loading.value = true
  try { items.value = await api.list() }
  finally { loading.value = false }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">Integrations</h2>
        <p class="textSecondary">Manage available integrations that tenants can connect to.</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openNew">Add Integration</v-btn>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-row>
      <v-col v-for="i in items" :key="i.id" cols="12" md="6" lg="4">
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
                  {{ f.label }}
                  <v-icon v-if="f.type === 'secret'" end icon="mdi-eye-off" size="10" />
                </v-chip>
              </div>
            </div>
            <div class="d-flex ga-2">
              <v-btn size="small" variant="tonal" prepend-icon="mdi-pencil" @click="openEdit(i)">Edit</v-btn>
              <v-btn size="small" variant="tonal" color="error" prepend-icon="mdi-delete"
                :loading="deleting === i.id" @click="remove(i.id)">Delete</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="!loading && !items.length" cols="12">
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
                variant="outlined" density="comfortable" hide-details :disabled="!!editing"
                hint="Lowercase letters, numbers and underscores only" />
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
          <v-btn color="primary" variant="flat" :loading="saving" @click="save">
            {{ editing ? 'Save changes' : 'Add integration' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.ga-1 { gap: 4px; }
.ga-2 { gap: 8px; }
.ga-3 { gap: 12px; }
</style>
