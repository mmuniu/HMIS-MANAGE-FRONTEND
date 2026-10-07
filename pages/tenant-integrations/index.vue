<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'
import { useAuthStore } from '@/stores/auth'
import { useHospitalsApi } from '@/composables/useHospitalsApi'
import {
  useTenantIntegrationsApi,
  type CatalogIntegration,
  type TenantEnvironment,
  type TenantIntegrationV3,
} from '@/composables/useTenantIntegrationsApi'

// A tenant's integrations in the V3 integration-service, with the
// environment variables each environment (production / sandbox / test …)
// needs. Everything is read from and saved to integration-service through
// hmis-manage; tenants are identified by their core-service organization id,
// so hospitals set up directly on the core platform ("terminal") work too.

const auth = useAuthStore()
const route = useRoute()
const hospitalsApi = useHospitalsApi()
const api = useTenantIntegrationsApi()
const { $showToast } = useNuxtApp()

const ENVIRONMENTS = [
  { value: 'production', title: 'Production' },
  { value: 'sandbox', title: 'Sandbox' },
  { value: 'test', title: 'Test' },
]

// ── The current tenant ───────────────────────────────────────────────────────
// This page only ever shows ONE tenant: the hospital it was opened from
// (?coreOrgId=… from its "Manage integrations" button), or — for a hospital
// admin — their own hospital. There is deliberately no way to switch tenants
// here; the backend enforces the same scoping.
const ownTenant = ref<{ coreOrgId: string | null; name: string } | null>(null)
const resolvingTenant = ref(false)

const coreOrgId = computed(() =>
  auth.isPlatformUser ? ((route.query.coreOrgId as string) || null) : (ownTenant.value?.coreOrgId ?? null),
)
const tenantName = computed(() =>
  auth.isPlatformUser ? ((route.query.name as string) || null) : (ownTenant.value?.name ?? null),
)

// A hospital admin's hospitals list holds just their own hospital.
async function resolveOwnTenant() {
  if (auth.isPlatformUser) return
  resolvingTenant.value = true
  try {
    const own = (await hospitalsApi.list({ per_page: 1 })).data[0]
    ownTenant.value = own
      ? { coreOrgId: own.core_org_id ? String(own.core_org_id) : null, name: own.display_name || own.name }
      : null
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to load your hospital.')
  } finally {
    resolvingTenant.value = false
  }
}

// ── The tenant's integrations ────────────────────────────────────────────────
const integrations = ref<TenantIntegrationV3[]>([])
const catalog = ref<CatalogIntegration[]>([])
const loading = ref(false)
const loadError = ref('')

// Editable copy of every environment, keyed "code:env". Drafts (added here,
// not saved yet) live only in this map until their first save.
interface VariableRow { key: string; value: string; secret: boolean; is_set: boolean }
interface EnvForm {
  code: string; env: string; name: string
  base_url: string; is_active: boolean; editable: boolean; draft: boolean
  rows: VariableRow[]
}
const forms = reactive<Record<string, EnvForm>>({})
const activeTab = reactive<Record<string, string>>({})
const saving = ref<string | null>(null)
const removing = ref<string | null>(null)

const formKey = (code: string, env: string) => `${code}:${env}`

function formFrom(code: string, e: TenantEnvironment): EnvForm {
  return {
    code, env: e.code, name: e.name,
    base_url: e.base_url ?? '', is_active: e.is_active, editable: e.editable, draft: false,
    rows: e.variables.map(v => ({ key: v.key, value: v.value ?? '', secret: v.secret, is_set: v.is_set })),
  }
}

function envsOf(code: string): EnvForm[] {
  return Object.values(forms).filter(f => f.code === code)
}

async function load() {
  integrations.value = []
  Object.keys(forms).forEach(k => delete forms[k])
  loadError.value = ''
  if (!coreOrgId.value) return

  loading.value = true
  try {
    const res = await api.list(coreOrgId.value)
    integrations.value = res.data
    catalog.value = res.catalog
    for (const i of res.data) {
      for (const e of i.environments) forms[formKey(i.code, e.code)] = formFrom(i.code, e)
      activeTab[i.code] = i.environments[0]?.code ?? ''
    }
  } catch (e: any) {
    loadError.value = e?.response?.data?.message || 'Failed to load this tenant\'s integrations.'
  } finally {
    loading.value = false
  }
}

// Variable rows a catalog type suggests: its fields as UPPER_SNAKE keys.
function suggestedRows(code: string): VariableRow[] {
  const type = catalog.value.find(c => c.id === code)
  return (type?.required_fields ?? []).map(f => ({
    key: f.key.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
    value: '',
    secret: f.type === 'secret',
    is_set: false,
  }))
}

function addDraftEnvironment(code: string, env: string) {
  const key = formKey(code, env)
  if (!forms[key]) {
    const title = ENVIRONMENTS.find(e => e.value === env)?.title ?? env
    forms[key] = { code, env, name: title, base_url: '', is_active: true, editable: true, draft: true, rows: suggestedRows(code) }
  }
  activeTab[code] = env
}

// ── Add integration / add environment dialogs ────────────────────────────────
const addDialog = ref(false)
const addForm = ref<{ code: string | null; env: string }>({ code: null, env: 'production' })
const addable = computed(() => catalog.value.filter(c => !integrations.value.some(i => i.code === c.id)))

function openAdd() {
  addForm.value = { code: addable.value[0]?.id ?? null, env: 'production' }
  addDialog.value = true
}

function confirmAdd() {
  const type = catalog.value.find(c => c.id === addForm.value.code)
  if (!type) return
  integrations.value.push({ code: type.id, name: type.name, provider: type.id, status: 'draft', is_active: true, environments: [] })
  addDraftEnvironment(type.id, addForm.value.env)
  addDialog.value = false
}

const envDialog = ref(false)
const envTarget = ref<TenantIntegrationV3 | null>(null)
const envChoice = ref('sandbox')
const customEnv = ref('')

function openAddEnv(i: TenantIntegrationV3) {
  envTarget.value = i
  envChoice.value = ENVIRONMENTS.find(e => !forms[formKey(i.code, e.value)])?.value ?? 'custom'
  customEnv.value = ''
  envDialog.value = true
}

function confirmAddEnv() {
  if (!envTarget.value) return
  const env = envChoice.value === 'custom'
    ? customEnv.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    : envChoice.value
  if (!env) return
  addDraftEnvironment(envTarget.value.code, env)
  envDialog.value = false
}

// ── Save / remove an environment ─────────────────────────────────────────────
function addRow(f: EnvForm) { f.rows.push({ key: '', value: '', secret: false, is_set: false }) }
function removeRow(f: EnvForm, idx: number) { f.rows.splice(idx, 1) }

async function saveEnv(i: TenantIntegrationV3, f: EnvForm) {
  if (!coreOrgId.value) return
  const variables: Record<string, string> = {}
  const secretKeys: string[] = []
  for (const r of f.rows) {
    const key = r.key.trim()
    if (!key) continue
    variables[key] = r.value
    if (r.secret) secretKeys.push(key)
  }

  const key = formKey(f.code, f.env)
  saving.value = key
  try {
    const saved = await api.saveEnvironment(coreOrgId.value, f.code, f.env, {
      name: i.name,
      provider: i.provider,
      environment_name: f.name,
      base_url: f.base_url,
      is_active: f.is_active,
      variables,
      secret_keys: secretKeys,
    })
    forms[key] = formFrom(f.code, saved)
    if (i.status === 'draft') i.status = 'active'
    $showToast(`${i.name} — ${f.name} saved to the integration service.`)
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to save.')
  } finally {
    saving.value = null
  }
}

async function removeEnv(i: TenantIntegrationV3, f: EnvForm) {
  const key = formKey(f.code, f.env)
  if (!f.draft) {
    if (!confirm(`Remove the ${f.name} environment of ${i.name}? Its variables are deleted too.`) || !coreOrgId.value) return
    removing.value = key
    try {
      await api.removeEnvironment(coreOrgId.value, f.code, f.env)
      $showToast(`${f.name} removed.`)
    } catch (e: any) {
      $showToast(e?.response?.data?.message || 'Failed to remove.')
      return
    } finally {
      removing.value = null
    }
  }
  delete forms[key]
  activeTab[i.code] = envsOf(i.code)[0]?.env ?? ''
  // A draft integration with no environments left goes away entirely.
  if (i.status === 'draft' && !envsOf(i.code).length) {
    integrations.value = integrations.value.filter(x => x.code !== i.code)
  }
}

onMounted(async () => {
  await resolveOwnTenant()
  load()
})
watch(coreOrgId, load)
</script>

<template>
  <div>
    <v-btn v-if="auth.isPlatformUser && route.query.hospitalId" variant="text" prepend-icon="mdi-arrow-left" class="mb-4"
      :to="`/hospitals/${route.query.hospitalId}`">
      Back to hospital
    </v-btn>

    <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">
          Integrations<template v-if="tenantName"> — {{ tenantName }}</template>
        </h2>
        <p class="textSecondary mb-0">
          This tenant's integrations and the environment variables for each environment — saved in the V3 integration service.
          <template v-if="coreOrgId"> Core-service organization {{ coreOrgId }}.</template>
        </p>
      </div>
      <v-btn v-if="coreOrgId" color="primary" prepend-icon="mdi-plus" :disabled="!addable.length || loading" @click="openAdd">
        Add integration
      </v-btn>
    </div>

    <v-progress-linear v-if="resolvingTenant" indeterminate color="primary" class="mb-4" />

    <v-alert v-if="!coreOrgId && !resolvingTenant" type="info" variant="tonal">
      <template v-if="auth.isPlatformUser && route.query.hospitalId">
        This hospital isn't provisioned in core-service yet, so it has no integrations in the integration service.
      </template>
      <template v-else-if="auth.isPlatformUser">
        Open a hospital and click <strong>Manage integrations</strong> to manage its integrations.
      </template>
      <template v-else-if="ownTenant">
        Your hospital isn't provisioned in core-service yet, so it has no integrations in the integration service.
      </template>
      <template v-else>No hospital found for your account.</template>
    </v-alert>

    <template v-else>
      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />
      <v-alert v-if="loadError" type="error" variant="tonal" class="mb-4" :text="loadError">
        <template #append><v-btn variant="text" size="small" @click="load">Retry</v-btn></template>
      </v-alert>

      <v-alert v-if="!loading && !loadError && !integrations.length" type="info" variant="tonal">
        This tenant has no integrations in the integration service yet. Click "Add integration" to add one.
      </v-alert>

      <v-card v-for="i in integrations" :key="i.code" rounded="lg" elevation="10" class="mb-6">
        <v-card-item>
          <v-card-title class="d-flex align-center ga-2">
            <v-icon icon="mdi-puzzle-outline" />{{ i.name }}
            <v-chip v-if="i.status === 'draft'" size="x-small" color="warning" variant="tonal" label>Not saved</v-chip>
            <v-chip v-else-if="!i.is_active" size="x-small" color="grey" variant="tonal" label>Inactive</v-chip>
          </v-card-title>
          <v-card-subtitle>{{ i.code }}</v-card-subtitle>
          <template #append>
            <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" @click="openAddEnv(i)">Environment</v-btn>
          </template>
        </v-card-item>

        <v-tabs v-model="activeTab[i.code]" color="primary" class="px-2">
          <v-tab v-for="f in envsOf(i.code)" :key="f.env" :value="f.env">
            {{ f.name }}
            <v-icon v-if="f.draft" icon="mdi-circle-small" color="warning" end />
          </v-tab>
        </v-tabs>
        <v-divider />

        <v-card-text>
          <p v-if="!envsOf(i.code).length" class="textSecondary mb-0">No environments yet — add one.</p>

          <template v-for="f in envsOf(i.code)" :key="f.env">
            <div v-if="activeTab[i.code] === f.env">
              <!-- Written elsewhere (e.g. hmis-manage's own connection mirror): read-only, values hidden. -->
              <template v-if="!f.editable">
                <v-alert type="info" variant="tonal" density="compact" class="mb-3">
                  This environment is maintained by the platform's integration connection, so it is read-only here and
                  its values are hidden. Add a Production / Sandbox / Test environment to manage variables on this page.
                </v-alert>
                <div class="d-flex flex-wrap ga-1">
                  <v-chip v-for="r in f.rows" :key="r.key" size="small" variant="outlined" label prepend-icon="mdi-lock">{{ r.key }}</v-chip>
                </div>
              </template>

              <template v-else>
                <v-row dense class="mb-2">
                  <v-col cols="12" md="9">
                    <v-text-field v-model="f.base_url" label="Base URL" placeholder="https://api.example.com"
                      prepend-inner-icon="mdi-link" variant="outlined" density="comfortable" hide-details />
                  </v-col>
                  <v-col cols="12" md="3" class="d-flex align-center">
                    <v-switch v-model="f.is_active" color="success" label="Active" hide-details inset density="compact" />
                  </v-col>
                </v-row>

                <div class="d-flex align-center justify-space-between mt-4 mb-2">
                  <p class="text-subtitle-2 font-weight-medium mb-0">Environment variables</p>
                  <v-btn size="small" variant="tonal" prepend-icon="mdi-plus" @click="addRow(f)">Add variable</v-btn>
                </div>
                <p v-if="!f.rows.length" class="text-caption textSecondary">No variables yet.</p>
                <v-row v-for="(r, idx) in f.rows" :key="idx" dense class="align-center">
                  <v-col cols="12" sm="4">
                    <v-text-field v-model="r.key" label="Key" placeholder="CLIENT_ID" variant="outlined" density="compact" hide-details />
                  </v-col>
                  <v-col cols="9" sm="5">
                    <v-text-field
                      v-model="r.value" label="Value"
                      :type="r.secret ? 'password' : 'text'"
                      :placeholder="r.secret && r.is_set ? '•••••••• saved — leave blank to keep' : undefined"
                      :persistent-placeholder="r.secret && r.is_set"
                      variant="outlined" density="compact" hide-details
                    />
                  </v-col>
                  <v-col cols="2" sm="2">
                    <v-checkbox v-model="r.secret" label="Secret" density="compact" hide-details />
                  </v-col>
                  <v-col cols="1" class="d-flex justify-center">
                    <v-btn icon="mdi-close" size="x-small" variant="text" color="error" @click="removeRow(f, idx)" />
                  </v-col>
                </v-row>

                <div class="d-flex flex-wrap ga-2 mt-4">
                  <v-btn color="primary" variant="flat" prepend-icon="mdi-content-save"
                    :loading="saving === `${f.code}:${f.env}`" @click="saveEnv(i, f)">
                    Save {{ f.name }}
                  </v-btn>
                  <v-btn color="error" variant="tonal" prepend-icon="mdi-delete"
                    :loading="removing === `${f.code}:${f.env}`" @click="removeEnv(i, f)">
                    {{ f.draft ? 'Discard' : 'Remove environment' }}
                  </v-btn>
                </div>
              </template>
            </div>
          </template>
        </v-card-text>
      </v-card>
    </template>

    <!-- Add integration -->
    <v-dialog v-model="addDialog" max-width="480">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">Add integration</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-select v-model="addForm.code" :items="addable" item-title="name" item-value="id" label="Integration"
            variant="outlined" density="comfortable" hide-details class="mb-3" />
          <v-select v-model="addForm.env" :items="ENVIRONMENTS" label="First environment"
            variant="outlined" density="comfortable" hide-details />
          <p class="text-caption textSecondary mt-3 mb-0">
            Its fields are suggested as variables. Nothing is saved until you fill them in and click Save.
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 ga-2">
          <v-spacer />
          <v-btn variant="text" @click="addDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :disabled="!addForm.code" @click="confirmAdd">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add environment -->
    <v-dialog v-model="envDialog" max-width="420">
      <v-card rounded="lg">
        <v-card-title class="pa-4 pb-2">Add environment — {{ envTarget?.name }}</v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-select v-model="envChoice" :items="[...ENVIRONMENTS, { value: 'custom', title: 'Other…' }]" label="Environment"
            variant="outlined" density="comfortable" hide-details />
          <v-text-field v-if="envChoice === 'custom'" v-model="customEnv" label="Environment name" placeholder="staging"
            variant="outlined" density="comfortable" hide-details class="mt-3" />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 ga-2">
          <v-spacer />
          <v-btn variant="text" @click="envDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :disabled="envChoice === 'custom' && !customEnv.trim()" @click="confirmAddEnv">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.ga-1 { gap: 4px; }
.ga-2 { gap: 8px; }
.ga-3 { gap: 12px; }
.ga-4 { gap: 16px; }
</style>
