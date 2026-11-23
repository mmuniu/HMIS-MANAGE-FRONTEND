<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSystemsApi, type PlatformSystem, type CoreServiceInput } from '@/composables/useSystemsApi'
import { useAuthStore } from '@/stores/auth'
import { useNuxtApp } from '#app'

const api = useSystemsApi()
const auth = useAuthStore()
const { $showToast } = useNuxtApp()

const items = ref<PlatformSystem[]>([])
const loading = ref(false)
const testing = ref<string | null>(null)

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

function replace(updated: PlatformSystem) {
  const i = items.value.findIndex((s) => s.id === updated.id)
  if (i === -1) items.value.push(updated)
  else items.value[i] = { ...updated, members: items.value[i].members }
}

// ── One dialog: register a system, or edit a system's core-service connection ──
const dialog = ref(false)
const editing = ref<PlatformSystem | null>(null)
const saving = ref(false)
const formError = ref('')
const showSecret = ref(false)
const form = ref({ name: '', url: '', appId: '', secret: '', timeout: '' as string | number })

const dialogTitle = computed(() => (editing.value ? `Core-service connection · ${editing.value.name}` : 'Register a New System'))
const secretPlaceholder = computed(() => {
  const c = editing.value?.core_service
  return c?.secret_set ? `Set (ends in …${c.secret_hint}). Leave blank to keep it.` : ''
})

function openCreate() {
  editing.value = null
  form.value = { name: '', url: '', appId: '', secret: '', timeout: '' }
  formError.value = ''
  showSecret.value = false
  dialog.value = true
}

function openConnection(sys: PlatformSystem) {
  editing.value = sys
  form.value = {
    name: sys.name,
    url: sys.core_service.url ?? '',
    appId: sys.core_service.app_id ?? '',
    secret: '',
    timeout: sys.core_service.timeout ?? '',
  }
  formError.value = ''
  showSecret.value = false
  dialog.value = true
}

function connectionInput(): CoreServiceInput {
  const input: CoreServiceInput = {
    core_service_url: form.value.url.trim() || null,
    core_service_app_id: form.value.appId.trim() || null,
    core_service_timeout: form.value.timeout === '' ? null : Number(form.value.timeout),
  }
  if (form.value.secret.trim()) input.core_service_app_secret = form.value.secret.trim()
  return input
}

async function save(thenTest = false) {
  formError.value = ''
  if (!editing.value && !form.value.name.trim()) {
    formError.value = 'Give the system a name.'
    return
  }
  // A connection is all-or-nothing: URL, app ID and a secret (new or already stored).
  const anySet = form.value.url.trim() || form.value.appId.trim() || form.value.secret.trim()
  const secretKnown = form.value.secret.trim() || editing.value?.core_service.secret_set
  if (anySet && !(form.value.url.trim() && form.value.appId.trim() && secretKnown)) {
    formError.value = 'Fill in the URL, app ID and app secret together, or leave all three empty.'
    return
  }

  saving.value = true
  let saved: PlatformSystem
  try {
    saved = editing.value
      ? await api.update(editing.value.id, connectionInput())
      : await api.create({ name: form.value.name.trim(), ...connectionInput() })
  } catch (e: any) {
    const errors = e?.response?.data?.errors
    formError.value = errors ? Object.values(errors).flat().join(' ') : (e?.response?.data?.message || 'Could not save.')
    return
  } finally {
    saving.value = false
  }

  replace(saved)
  dialog.value = false
  $showToast(editing.value ? 'Connection saved.' : `System "${saved.name}" created.`)
  // The test runs from the table row (its Test button spins), not the dialog.
  if (thenTest && (saved.core_service.configured || saved.core_service.uses_env)) await test(saved)
}

async function removeConnection() {
  if (!editing.value) return
  saving.value = true
  try {
    replace(await api.update(editing.value.id, { clear_core_service: true }))
    dialog.value = false
    $showToast('Connection removed.')
  } catch (e: any) {
    formError.value = e?.response?.data?.message || 'Could not remove the connection.'
  } finally {
    saving.value = false
  }
}

async function test(sys: PlatformSystem) {
  testing.value = sys.id
  try {
    const { system, result } = await api.testConnection(sys.id)
    replace(system)
    if (result.ok) {
      $showToast(result.probe === 'organizations'
        ? `Connected · ${result.organizations ?? 0} organizations in core-service.`
        : 'Connected to core-service.')
    } else {
      $showToast(`Connection failed: ${result.error}`)
    }
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Could not test the connection.')
  } finally {
    testing.value = null
  }
}

// Connected / Failed / Not tested / Not set / Uses .env
function connectionState(sys: PlatformSystem) {
  const c = sys.core_service
  if (!c.configured) {
    return c.uses_env
      ? { label: 'Uses server default', color: 'info', icon: 'mdi-server-outline' }
      : { label: 'Not set', color: 'warning', icon: 'mdi-link-variant-off' }
  }
  if (!c.last_check) return { label: 'Not tested', color: 'grey', icon: 'mdi-help-circle-outline' }
  return c.last_check.ok
    ? { label: 'Connected', color: 'success', icon: 'mdi-check-circle-outline' }
    : { label: 'Failed', color: 'error', icon: 'mdi-alert-circle-outline' }
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

async function switchTo(sys: PlatformSystem) {
  if (auth.systemId === sys.id) return
  await auth.switchSystem(sys.id)
}

const headers = [
  { title: 'System', key: 'name', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Core-service', key: 'core_service', sortable: false },
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
          Each system is a separate product with its own data and its own core-service.
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
        <template #item.core_service="{ item }">
          <div class="py-2">
            <v-chip size="small" :color="connectionState(item).color" variant="tonal" label :prepend-icon="connectionState(item).icon">
              {{ connectionState(item).label }}
            </v-chip>
            <div v-if="item.core_service.url" class="text-caption textSecondary mt-1 text-truncate" style="max-width:280px">
              {{ item.core_service.url }}
            </div>
            <div v-if="item.core_service.last_check && !item.core_service.last_check.ok" class="text-caption text-error mt-1 text-wrap check-error">
              {{ item.core_service.last_check.error }}
            </div>
            <div v-else-if="item.core_service.last_check" class="text-caption textSecondary">
              Checked {{ fmt(item.core_service.last_check.at) }}
            </div>
          </div>
        </template>
        <template #item.members="{ item }">{{ item.members }}</template>
        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-2">
            <v-btn size="small" variant="text" prepend-icon="mdi-connection" @click="openConnection(item)">Connection</v-btn>
            <v-btn
              size="small" variant="text" prepend-icon="mdi-lan-check"
              :disabled="!item.core_service.configured && !item.core_service.uses_env"
              :loading="testing === item.id"
              @click="test(item)"
            >Test</v-btn>
            <v-btn
              v-if="auth.systemId !== item.id"
              size="small" variant="tonal" color="primary"
              :loading="auth.isSwitchingSystem"
              prepend-icon="mdi-swap-horizontal"
              @click="switchTo(item)"
            >Switch to</v-btn>
            <v-chip v-else size="small" color="success" variant="text" prepend-icon="mdi-check">Current</v-chip>
          </div>
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

    <!-- Register / connection dialog -->
    <v-dialog v-model="dialog" max-width="560">
      <v-card rounded="lg">
        <v-card-title class="text-h6 pt-5 px-5">{{ dialogTitle }}</v-card-title>
        <v-card-text class="px-5">
          <template v-if="!editing">
            <p class="textSecondary text-body-2 mb-4">
              A new system starts completely empty: its own hospitals, test cases, reports and data,
              separate from every other system.
            </p>
            <v-text-field
              v-model="form.name"
              label="System name"
              placeholder="e.g. OKR, Clinic B, Pilot"
              variant="outlined"
              autofocus
            />
          </template>

          <div class="text-subtitle-2 mb-1">Core-service connection</div>
          <p class="textSecondary text-body-2 mb-4">
            Where this system's hospitals are provisioned. A core-service admin registers hmis-manage there
            (<code>POST /api/v1/apps/register</code>) and gives you the app ID and secret.
            <template v-if="editing?.is_default"> Leave empty to keep using the server's default core-service.</template>
            <template v-else> Hospitals can't be provisioned in this system until it is set.</template>
          </p>

          <v-text-field v-model="form.url" label="Core-service URL" placeholder="https://core.example.com"
            variant="outlined" density="comfortable" prepend-inner-icon="mdi-web" />
          <v-text-field v-model="form.appId" label="App ID" variant="outlined" density="comfortable"
            prepend-inner-icon="mdi-identifier" />
          <v-text-field v-model="form.secret" label="App secret" :type="showSecret ? 'text' : 'password'"
            :placeholder="secretPlaceholder" persistent-placeholder autocomplete="new-password"
            variant="outlined" density="comfortable" prepend-inner-icon="mdi-key-outline"
            :append-inner-icon="showSecret ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            hint="Stored encrypted and never shown again." persistent-hint class="mb-2"
            @click:append-inner="showSecret = !showSecret" />
          <v-text-field v-model="form.timeout" label="Timeout (seconds, optional)" type="number" min="5" max="600"
            placeholder="120" variant="outlined" density="comfortable" prepend-inner-icon="mdi-timer-outline" />

          <v-alert v-if="formError" type="error" variant="tonal" density="compact" :text="formError" />
        </v-card-text>
        <v-card-actions class="px-5 pb-5 flex-wrap ga-2">
          <v-btn v-if="editing?.core_service.configured" color="error" variant="text" :disabled="saving" @click="removeConnection">
            Remove connection
          </v-btn>
          <v-spacer />
          <v-btn variant="text" :disabled="saving" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="tonal" :loading="saving" @click="save(false)">
            {{ editing ? 'Save' : 'Create System' }}
          </v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="save(true)">
            {{ editing ? 'Save & test' : 'Create & test' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.ga-2 { gap: 8px; }
.ga-3 { gap: 12px; }
.check-error { max-width: 300px; white-space: normal; overflow-wrap: anywhere; }
</style>
