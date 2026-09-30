<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useNuxtApp } from '#app'
import { useApiCredentialsApi, type ApiCredential, type IssuedApiCredential } from '@/composables/useApiCredentialsApi'

// API credentials that let an external system (FieldMatch) call this
// hospital's integration endpoints — see erp-platform-3.0
// docs/FIELDMATCH_INTEGRATION.md. The secret is shown once, right after it is
// created or rotated, and is never retrievable again.
const props = defineProps<{ hospitalId: string; hospitalName: string }>()

const api = useApiCredentialsApi()
const { $showToast } = useNuxtApp()

const PERMISSION_LABELS: Record<string, string> = {
  read_products: 'Read products & stores',
  write_product_prices: 'Update prices / create products',
}

const credentials = ref<ApiCredential[]>([])
const issuable = ref<string[]>([])
const loading = ref(false)
const loadError = ref('')

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await api.list(props.hospitalId)
    credentials.value = res.data
    issuable.value = res.issuable_permissions
  } catch (err: any) {
    loadError.value = err?.response?.data?.message || 'Failed to load API credentials.'
  } finally {
    loading.value = false
  }
}

onMounted(load)

// ── Create ──────────────────────────────────────────────────────────────
const createDialog = ref(false)
const creating = ref(false)
const createForm = reactive({ name: '', permissions: [] as string[] })
const createErrors = ref<Record<string, string[]>>({})

function openCreate() {
  createForm.name = `FieldMatch — ${props.hospitalName}`
  createForm.permissions = [...issuable.value]
  createErrors.value = {}
  createDialog.value = true
}

async function submitCreate() {
  creating.value = true
  createErrors.value = {}
  try {
    const issued = await api.create(props.hospitalId, { name: createForm.name.trim(), permissions: createForm.permissions })
    createDialog.value = false
    showIssued(issued)
    await load()
  } catch (err: any) {
    if (err?.response?.status === 422) createErrors.value = err.response.data?.errors || {}
    $showToast?.error?.(err?.response?.data?.message || 'Failed to create the credential.')
  } finally {
    creating.value = false
  }
}

// ── Rotate / deactivate ─────────────────────────────────────────────────
const confirmRotate = ref<ApiCredential | null>(null)
const busyAppId = ref<string | null>(null)

async function doRotate() {
  const cred = confirmRotate.value
  if (!cred) return
  busyAppId.value = cred.app_id
  try {
    const issued = await api.rotate(props.hospitalId, cred.app_id)
    confirmRotate.value = null
    showIssued(issued)
  } catch (err: any) {
    $showToast?.error?.(err?.response?.data?.message || 'Failed to rotate the secret.')
  } finally {
    busyAppId.value = null
  }
}

async function toggleActive(cred: ApiCredential) {
  busyAppId.value = cred.app_id
  try {
    const updated = await api.setActive(props.hospitalId, cred.app_id, !cred.is_active)
    Object.assign(cred, updated)
  } catch (err: any) {
    $showToast?.error?.(err?.response?.data?.message || 'Failed to update the credential.')
  } finally {
    busyAppId.value = null
  }
}

// ── One-time secret display ─────────────────────────────────────────────
const issued = ref<IssuedApiCredential | null>(null)
const showSecret = ref(false)
const copied = ref<'app_id' | 'app_secret' | 'organization_id' | null>(null)

function showIssued(cred: IssuedApiCredential) {
  issued.value = cred
  showSecret.value = false
}

async function copy(field: 'app_id' | 'app_secret' | 'organization_id') {
  if (!issued.value) return
  await navigator.clipboard.writeText(String(issued.value[field]))
  copied.value = field
  setTimeout(() => (copied.value = null), 1500)
}

function closeIssued() {
  // Dropped from memory on close — there is no way to show it again.
  issued.value = null
  showSecret.value = false
}

function formatDate(d: string | null) {
  return d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
}
</script>

<template>
  <v-card rounded="lg" elevation="10" class="mt-6">
    <v-card-text class="pa-5">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
        <div>
          <p class="text-subtitle-1 font-weight-semibold mb-1">API credentials</p>
          <p class="text-body-2 textSecondary mb-0">
            App ID and secret an external system (e.g. FieldMatch) uses to read this hospital's product catalogue and update its prices.
          </p>
        </div>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-key-plus" :disabled="loading || !!loadError" @click="openCreate">
          Create credential
        </v-btn>
      </div>

      <v-alert v-if="loadError" type="warning" variant="tonal" density="compact">{{ loadError }}</v-alert>

      <v-progress-linear v-else-if="loading" indeterminate color="primary" />

      <p v-else-if="!credentials.length" class="text-body-2 textSecondary mb-0">No API credentials for this hospital yet.</p>

      <v-table v-else density="comfortable">
        <thead>
          <tr>
            <th>Name</th>
            <th>App ID</th>
            <th>Access</th>
            <th>Last used</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in credentials" :key="c.app_id">
            <td>{{ c.name }}</td>
            <td class="font-mono text-caption">{{ c.app_id }}</td>
            <td>
              <v-chip v-for="p in c.permissions" :key="p" size="x-small" variant="tonal" class="mr-1 mb-1">
                {{ PERMISSION_LABELS[p] || p }}
              </v-chip>
            </td>
            <td class="text-caption">{{ formatDate(c.last_used_at) }}</td>
            <td>
              <v-chip size="small" variant="flat" :color="c.is_active ? 'success' : 'grey'">
                {{ c.is_active ? 'Active' : 'Inactive' }}
              </v-chip>
            </td>
            <td class="text-right">
              <v-btn size="small" variant="text" prepend-icon="mdi-refresh" :disabled="busyAppId === c.app_id" @click="confirmRotate = c">
                Rotate secret
              </v-btn>
              <v-btn size="small" variant="text" :color="c.is_active ? 'error' : 'success'" :loading="busyAppId === c.app_id" @click="toggleActive(c)">
                {{ c.is_active ? 'Deactivate' : 'Activate' }}
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>

  <!-- Create -->
  <v-dialog v-model="createDialog" max-width="520">
    <v-card rounded="lg">
      <v-card-title class="text-h6">Create API credential</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="createForm.name" label="Name" variant="outlined" density="comfortable" class="mb-3"
          hint="Must be unique across the platform." persistent-hint
          :error-messages="createErrors.name || []" />
        <p class="text-body-2 font-weight-medium mb-1">Access</p>
        <v-checkbox
          v-for="p in issuable" :key="p" v-model="createForm.permissions" :value="p"
          :label="PERMISSION_LABELS[p] || p" density="compact" hide-details />
        <p v-if="createErrors.permissions" class="text-caption text-error mt-1 mb-0">{{ createErrors.permissions[0] }}</p>
        <p class="text-caption textSecondary mt-3 mb-0">
          Scoped to <strong>{{ hospitalName }}</strong> only. The secret is shown once after creating.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="creating" @click="createDialog = false">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :loading="creating"
          :disabled="!createForm.name.trim() || !createForm.permissions.length" @click="submitCreate">
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Rotate confirmation -->
  <v-dialog :model-value="!!confirmRotate" max-width="440" @update:model-value="(v: boolean) => !v && (confirmRotate = null)">
    <v-card rounded="lg">
      <v-card-title class="text-h6">Rotate secret?</v-card-title>
      <v-card-text>
        A new secret is issued for <strong>{{ confirmRotate?.name }}</strong> and the current one
        <strong>stops working immediately</strong>. The external system will fail until it is given the new secret.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="!!busyAppId" @click="confirmRotate = null">Cancel</v-btn>
        <v-btn color="warning" variant="flat" :loading="!!busyAppId" @click="doRotate">Rotate</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- One-time secret -->
  <v-dialog :model-value="!!issued" max-width="600" persistent>
    <v-card v-if="issued" rounded="lg">
      <v-card-title class="text-h6">Copy the credential now</v-card-title>
      <v-card-text>
        <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
          The secret will not be shown again. Store it securely — anyone holding it can read and change this hospital's product prices.
        </v-alert>

        <div class="d-flex align-center ga-2 mb-2">
          <span class="text-body-2" style="min-width: 120px">Organization ID:</span>
          <span class="font-mono font-weight-medium">{{ issued.organization_id }}</span>
          <v-btn icon="mdi-content-copy" size="x-small" variant="text" @click="copy('organization_id')" />
          <v-chip v-if="copied === 'organization_id'" size="x-small" color="success" variant="flat">Copied</v-chip>
        </div>
        <div class="d-flex align-center ga-2 mb-2">
          <span class="text-body-2" style="min-width: 120px">App ID:</span>
          <span class="font-mono font-weight-medium text-break">{{ issued.app_id }}</span>
          <v-btn icon="mdi-content-copy" size="x-small" variant="text" @click="copy('app_id')" />
          <v-chip v-if="copied === 'app_id'" size="x-small" color="success" variant="flat">Copied</v-chip>
        </div>
        <div class="d-flex align-center ga-2">
          <span class="text-body-2" style="min-width: 120px">App secret:</span>
          <span class="font-mono font-weight-medium text-break">{{ showSecret ? issued.app_secret : '••••••••••••••••' }}</span>
          <v-btn :icon="showSecret ? 'mdi-eye-off' : 'mdi-eye'" size="x-small" variant="text" @click="showSecret = !showSecret" />
          <v-btn icon="mdi-content-copy" size="x-small" variant="text" @click="copy('app_secret')" />
          <v-chip v-if="copied === 'app_secret'" size="x-small" color="success" variant="flat">Copied</v-chip>
        </div>

        <p class="text-caption textSecondary mt-4 mb-0">
          Give these to the external system along with the base URL. Every request is signed with the secret
          (X-App-Id / X-Timestamp / X-Signature) — see docs/FIELDMATCH_INTEGRATION.md.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" variant="flat" @click="closeIssued">I've stored it</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
