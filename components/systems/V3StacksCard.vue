<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useV3TargetsApi, type V3Stack, type V3StackInput, type V3ServiceKey } from '@/composables/useV3TargetsApi'
import SystemReleasesDialog from '@/components/systems/SystemReleasesDialog.vue'

// The v3 stacks hospitals are provisioned into (a hospital picks one in the
// Register Hospital wizard) and each stack's service connections. Values set
// here override the server's .env field by field.

const api = useV3TargetsApi()
const { $showToast } = useNuxtApp()

const stacks = ref<V3Stack[]>([])
const loading = ref(false)
const testing = ref<string | null>(null)

const SERVICES: { key: V3ServiceKey; title: string; required: boolean; help: string }[] = [
  { key: 'core', title: 'Core service', required: true, help: 'Organizations, facilities, users. Required.' },
  { key: 'evaluation', title: 'Evaluation service', required: false, help: 'Procedure catalogue for Seed Facility. Optional.' },
  { key: 'inventory', title: 'Inventory service', required: false, help: 'Product catalogue for Seed Facility. Optional.' },
]

async function load() {
  loading.value = true
  try {
    stacks.value = await api.list()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to load v3 stacks.')
  } finally {
    loading.value = false
  }
}

// ── Releases (regular, beta, ...) of one stack ────────────────────────────
const releasesFor = ref<V3Stack | null>(null)
const releasesOpen = ref(false)
function openReleases(stack: V3Stack) {
  releasesFor.value = stack
  releasesOpen.value = true
}

function replace(updated: V3Stack) {
  const i = stacks.value.findIndex((s) => s.key === updated.key)
  if (i === -1) stacks.value.push(updated)
  else stacks.value[i] = updated
}

// ── Dialog: add a stack, or edit one's connections ─────────────────────────
type ServiceForm = { url: string; appId: string; secret: string; timeout: string | number }
const emptyService = (): ServiceForm => ({ url: '', appId: '', secret: '', timeout: '' })

const dialog = ref(false)
const editing = ref<V3Stack | null>(null)
const tab = ref<V3ServiceKey>('core')
const saving = ref(false)
const formError = ref('')
const form = ref({
  key: '',
  label: '',
  services: { core: emptyService(), evaluation: emptyService(), inventory: emptyService() } as Record<V3ServiceKey, ServiceForm>,
})

function openAdd() {
  editing.value = null
  form.value = { key: '', label: '', services: { core: emptyService(), evaluation: emptyService(), inventory: emptyService() } }
  tab.value = 'core'
  formError.value = ''
  dialog.value = true
}

function openEdit(stack: V3Stack) {
  editing.value = stack
  const svc = (k: V3ServiceKey): ServiceForm => ({
    url: stack.services[k].url ?? '',
    appId: stack.services[k].app_id ?? '',
    secret: '',
    timeout: stack.services[k].timeout ?? '',
  })
  form.value = { key: stack.key, label: stack.label, services: { core: svc('core'), evaluation: svc('evaluation'), inventory: svc('inventory') } }
  tab.value = 'core'
  formError.value = ''
  dialog.value = true
}

function secretPlaceholder(k: V3ServiceKey) {
  const s = editing.value?.services[k]
  if (!s?.secret_set) return ''
  return `Set${s.source === 'env' ? ' in .env' : ''} (ends in …${s.secret_hint}). Leave blank to keep it.`
}

function payload(): V3StackInput {
  const input: V3StackInput = { label: form.value.label.trim() || null }
  if (!editing.value) input.key = form.value.key.trim()

  for (const { key } of SERVICES) {
    const f = form.value.services[key]
    const before = editing.value?.services[key]
    // Only send what changed, so values still coming from .env stay there.
    if (f.url.trim() !== (before?.url ?? '')) input[`${key}_url`] = f.url.trim() || null
    if (f.appId.trim() !== (before?.app_id ?? '')) input[`${key}_app_id`] = f.appId.trim() || null
    if (String(f.timeout) !== String(before?.timeout ?? '')) input[`${key}_timeout`] = f.timeout === '' ? null : Number(f.timeout)
    if (f.secret.trim()) input[`${key}_app_secret`] = f.secret.trim()
  }
  return input
}

async function save(thenTest = false) {
  formError.value = ''
  if (!editing.value && !/^[a-z][a-z0-9_]*$/.test(form.value.key.trim())) {
    formError.value = 'Key: lowercase letters, numbers and underscores, starting with a letter (e.g. okr, clinic_b).'
    return
  }

  saving.value = true
  let saved: V3Stack
  try {
    saved = editing.value ? await api.update(editing.value.key, payload()) : await api.create(payload())
  } catch (e: any) {
    const errors = e?.response?.data?.errors
    formError.value = errors ? Object.values(errors).flat().join(' ') : (e?.response?.data?.message || 'Could not save.')
    return
  } finally {
    saving.value = false
  }

  replace(saved)
  dialog.value = false
  $showToast(editing.value ? 'Connections saved.' : `"${saved.label}" added.`)
  if (thenTest && saved.services.core.configured) await test(saved)
}

async function resetToEnv(stack: V3Stack, service?: V3ServiceKey) {
  saving.value = true
  try {
    if (service) {
      replace(await api.update(stack.key, { [`clear_${service}`]: true }))
      $showToast(`${SERVICES.find((s) => s.key === service)?.title} reset.`)
    } else {
      const res = await api.remove(stack.key)
      if (res) replace(res)
      else stacks.value = stacks.value.filter((s) => s.key !== stack.key)
      $showToast(res ? 'Back to the server’s .env values.' : `"${stack.label}" removed.`)
    }
    dialog.value = false
  } catch (e: any) {
    formError.value = e?.response?.data?.message || 'Could not reset.'
  } finally {
    saving.value = false
  }
}

async function test(stack: V3Stack) {
  testing.value = stack.key
  try {
    const { stack: updated, result } = await api.testConnection(stack.key)
    replace(updated)
    $showToast(result.ok
      ? (result.probe === 'organizations' ? `Connected · ${result.organizations ?? 0} organizations.` : 'Connected to core-service.')
      : `Connection failed: ${result.error}`)
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Could not test the connection.')
  } finally {
    testing.value = null
  }
}

function coreState(stack: V3Stack) {
  if (!stack.services.core.configured) return { label: 'Not set', color: 'warning', icon: 'mdi-link-variant-off' }
  if (!stack.last_check) return { label: 'Not tested', color: 'grey', icon: 'mdi-help-circle-outline' }
  return stack.last_check.ok
    ? { label: 'Connected', color: 'success', icon: 'mdi-check-circle-outline' }
    : { label: 'Failed', color: 'error', icon: 'mdi-alert-circle-outline' }
}

const SOURCE_LABEL: Record<string, string> = { database: 'Set here', env: '.env', 'database+env': 'Set here + .env' }

const canRemove = computed(() => !!editing.value?.has_overrides || (!!editing.value && !editing.value.in_env))

const headers = [
  { title: 'Stack', key: 'label', sortable: false },
  { title: 'Core service', key: 'core', sortable: false },
  { title: 'Evaluation · Inventory', key: 'optional', sortable: false },
  { title: 'Hospitals', key: 'hospitals', sortable: false },
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
]

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

onMounted(load)
</script>

<template>
  <v-card rounded="lg" elevation="10" class="mt-6">
    <v-card-item>
      <v-card-title>v3 stacks &amp; connections</v-card-title>
      <v-card-subtitle class="text-wrap">
        The v3 HMIS stacks hospitals can be provisioned into, picked per hospital when it's registered.
        Values set here override the server's .env.
      </v-card-subtitle>
      <template #append>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="openAdd">Add stack</v-btn>
      </template>
    </v-card-item>

    <v-data-table :headers="headers" :items="stacks" :loading="loading" density="comfortable" hide-default-footer :items-per-page="-1">
      <template #item.label="{ item }">
        <div class="d-flex align-center ga-2">
          <span class="font-weight-medium">{{ item.label }}</span>
          <v-chip v-if="item.default" size="x-small" color="secondary" variant="tonal" label>Default</v-chip>
          <v-chip v-if="!item.available" size="x-small" color="warning" variant="tonal" label>Hidden from wizard</v-chip>
        </div>
        <span class="text-caption textSecondary">{{ item.key }}</span>
      </template>

      <template #item.core="{ item }">
        <div class="py-2">
          <v-chip size="small" :color="coreState(item).color" variant="tonal" label :prepend-icon="coreState(item).icon">
            {{ coreState(item).label }}
          </v-chip>
          <div v-if="item.services.core.url" class="text-caption textSecondary mt-1 text-truncate" style="max-width:280px">
            {{ item.services.core.url }}<template v-if="item.services.core.source"> · {{ SOURCE_LABEL[item.services.core.source] }}</template>
          </div>
          <div v-if="item.last_check && !item.last_check.ok" class="text-caption text-error mt-1 check-error">{{ item.last_check.error }}</div>
          <div v-else-if="item.last_check" class="text-caption textSecondary">Checked {{ fmt(item.last_check.at) }}</div>
        </div>
      </template>

      <template #item.optional="{ item }">
        <div class="d-flex ga-1 flex-wrap">
          <v-chip v-for="s in (['evaluation', 'inventory'] as const)" :key="s" size="x-small" label variant="tonal"
            :color="item.services[s].configured ? 'success' : 'grey'"
            :prepend-icon="item.services[s].configured ? 'mdi-check' : 'mdi-minus'">
            {{ s === 'evaluation' ? 'Evaluation' : 'Inventory' }}
          </v-chip>
        </div>
      </template>

      <template #item.hospitals="{ item }">{{ item.hospitals }}</template>

      <template #item.actions="{ item }">
        <div class="d-flex justify-end ga-2">
          <v-btn size="small" variant="text" prepend-icon="mdi-connection" @click="openEdit(item)">Connections</v-btn>
          <v-btn size="small" variant="text" prepend-icon="mdi-source-branch" @click="openReleases(item)">Releases</v-btn>
          <v-btn size="small" variant="text" prepend-icon="mdi-lan-check" :disabled="!item.services.core.configured"
            :loading="testing === item.key" @click="test(item)">Test</v-btn>
        </div>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="600">
      <v-card rounded="lg">
        <v-card-title class="text-h6 pt-5 px-5">
          {{ editing ? `Connections · ${editing.label}` : 'Add a v3 stack' }}
        </v-card-title>
        <v-card-text class="px-5">
          <p class="textSecondary text-body-2 mb-4">
            For each service, a service admin registers hmis-manage there (for core-service:
            <code>POST /api/v1/apps/register</code>) and gives you the app ID and secret.
            Secrets are stored encrypted and never shown again.
          </p>

          <div class="d-flex ga-3 flex-wrap">
            <v-text-field v-if="!editing" v-model="form.key" label="Key" placeholder="e.g. okr" hint="Stored on each hospital; can't be changed later."
              persistent-hint variant="outlined" density="comfortable" style="min-width:160px; max-width:200px" />
            <v-text-field v-model="form.label" label="Name" placeholder="e.g. OKR" variant="outlined" density="comfortable" style="min-width:220px" />
          </div>

          <v-tabs v-model="tab" color="primary" density="compact" class="mt-2 mb-4">
            <v-tab v-for="s in SERVICES" :key="s.key" :value="s.key">{{ s.title }}</v-tab>
          </v-tabs>

          <template v-for="s in SERVICES" :key="s.key">
            <div v-if="tab === s.key">
              <p class="text-caption textSecondary mb-3">
                {{ s.help }}
                <template v-if="editing?.services[s.key].source"> Currently: {{ SOURCE_LABEL[editing.services[s.key].source!] }}.</template>
              </p>
              <v-text-field v-model="form.services[s.key].url" label="URL" placeholder="https://…" variant="outlined"
                density="comfortable" prepend-inner-icon="mdi-web" />
              <v-text-field v-model="form.services[s.key].appId" label="App ID" variant="outlined" density="comfortable"
                prepend-inner-icon="mdi-identifier" />
              <v-text-field v-model="form.services[s.key].secret" label="App secret" type="password"
                :placeholder="secretPlaceholder(s.key)" persistent-placeholder autocomplete="new-password"
                variant="outlined" density="comfortable" prepend-inner-icon="mdi-key-outline" />
              <v-text-field v-model="form.services[s.key].timeout" label="Timeout (seconds, optional)" type="number"
                min="5" max="600" placeholder="120" variant="outlined" density="comfortable" prepend-inner-icon="mdi-timer-outline" />
              <v-btn v-if="editing && ['database', 'database+env'].includes(editing.services[s.key].source ?? '') && editing.in_env"
                size="small" variant="text" color="warning" :disabled="saving" @click="resetToEnv(editing, s.key)">
                Use .env values for this service
              </v-btn>
            </div>
          </template>

          <v-alert v-if="formError" type="error" variant="tonal" density="compact" class="mt-3" :text="formError" />
        </v-card-text>
        <v-card-actions class="px-5 pb-5 flex-wrap ga-2">
          <v-btn v-if="canRemove && editing" color="error" variant="text" :disabled="saving" @click="resetToEnv(editing)">
            {{ editing.in_env ? 'Reset all to .env' : 'Remove stack' }}
          </v-btn>
          <v-spacer />
          <v-btn variant="text" :disabled="saving" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="tonal" :loading="saving" @click="save(false)">{{ editing ? 'Save' : 'Add' }}</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="save(true)">{{ editing ? 'Save & test' : 'Add & test' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <SystemReleasesDialog v-model="releasesOpen" :stack="releasesFor" />
  </v-card>
</template>

<style scoped>
.check-error { max-width: 300px; white-space: normal; overflow-wrap: anywhere; }
</style>
