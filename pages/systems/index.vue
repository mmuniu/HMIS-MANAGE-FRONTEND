<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSystemsApi, type PlatformSystem } from '@/composables/useSystemsApi'
import { useAuthStore } from '@/stores/auth'
import { useNuxtApp } from '#app'

const api = useSystemsApi()
const auth = useAuthStore()
const { $showToast } = useNuxtApp()

const items = ref<PlatformSystem[]>([])
const loading = ref(false)

// Create dialog
const dialog = ref(false)
const saving = ref(false)
const form = ref<{ name: string }>({ name: '' })
const formError = ref('')

async function load() {
  loading.value = true
  try {
    items.value = await api.list()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to load systems.')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  form.value = { name: '' }
  formError.value = ''
  dialog.value = true
}

async function save() {
  formError.value = ''
  if (!form.value.name.trim()) {
    formError.value = 'Give the system a name.'
    return
  }
  saving.value = true
  try {
    const created = await api.create({ name: form.value.name.trim() })
    items.value.push(created)
    dialog.value = false
    $showToast(`System "${created.name}" created.`)
  } catch (e: any) {
    formError.value = e?.response?.data?.message || 'Could not create the system.'
  } finally {
    saving.value = false
  }
}

async function switchTo(sys: PlatformSystem) {
  if (auth.systemId === sys.id) return
  await auth.switchSystem(sys.id)
}

const headers = [
  { title: 'System', key: 'name', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Members', key: 'members', sortable: false },
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
]

onMounted(load)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">Systems</h2>
        <p class="textSecondary mb-0">
          Each system is a separate workspace with its own data. Register a new one to start fresh.
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">New System</v-btn>
    </div>

    <v-card rounded="lg" elevation="10">
      <v-data-table :headers="headers" :items="items" :loading="loading" density="comfortable">
        <template #item.name="{ item }">
          <div class="d-flex align-center ga-2">
            <span class="font-weight-medium">{{ item.name }}</span>
            <v-chip v-if="item.is_default" size="x-small" color="secondary" variant="tonal" label>Default</v-chip>
            <v-chip v-if="auth.systemId === item.id" size="x-small" color="success" variant="tonal" label>Active</v-chip>
          </div>
          <span class="text-caption textSecondary">{{ item.slug }}</span>
        </template>
        <template #item.status="{ item }">
          <v-chip size="small" :color="item.status === 'active' ? 'success' : 'grey'" variant="tonal" label>
            {{ item.status }}
          </v-chip>
        </template>
        <template #item.members="{ item }">{{ item.members }}</template>
        <template #item.actions="{ item }">
          <v-btn
            v-if="auth.systemId !== item.id"
            size="small" variant="tonal" color="primary"
            :loading="auth.isSwitchingSystem"
            prepend-icon="mdi-swap-horizontal"
            @click="switchTo(item)"
          >Switch to</v-btn>
          <v-chip v-else size="small" color="success" variant="text" prepend-icon="mdi-check">Current</v-chip>
        </template>
        <template #no-data>
          <div class="pa-10 text-center">
            <v-avatar color="primary" variant="tonal" size="64" class="mb-3">
              <v-icon icon="mdi-layers-triple-outline" size="34" />
            </v-avatar>
            <h3 class="text-h6 mb-1">No systems yet</h3>
            <p class="textSecondary">Register your first system to get started.</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create dialog -->
    <v-dialog v-model="dialog" max-width="480">
      <v-card rounded="lg">
        <v-card-title class="text-h6 pt-5 px-5">Register a New System</v-card-title>
        <v-card-text class="px-5">
          <p class="textSecondary text-body-2 mb-4">
            A new system starts completely empty — its own test cases, reports and data,
            separate from every other system.
          </p>
          <v-text-field
            v-model="form.name"
            label="System name"
            placeholder="e.g. OKR, Clinic B, Pilot"
            variant="outlined"
            autofocus
            :error-messages="formError"
            @keyup.enter="save"
          />
        </v-card-text>
        <v-card-actions class="px-5 pb-5">
          <v-spacer />
          <v-btn variant="text" :disabled="saving" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="save">Create System</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.ga-2 { gap: 8px; }
.ga-3 { gap: 12px; }
</style>
