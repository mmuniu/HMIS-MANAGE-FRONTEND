<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHospitalsStore } from '@/stores/hospitals'
import { useAuthStore } from '@/stores/auth'
import { useIntegrationsApi, type TenantIntegration, type RequiredField } from '@/composables/useIntegrationsApi'
import { useNuxtApp } from '#app'

const route = useRoute()
const store = useHospitalsStore()
const auth = useAuthStore()
const intApi = useIntegrationsApi()
const { $showToast } = useNuxtApp()

const id = computed(() => String(route.params.id))
const h = computed(() => store.current)

const integrations = ref<TenantIntegration[]>([])
const loading = ref(false)
const connectDialog = ref(false)
const selected = ref<TenantIntegration | null>(null)
const configForm = ref<Record<string, string>>({})
const connecting = ref(false)
const disconnecting = ref<string | null>(null)

const STATUS_COLOR: Record<string, string> = { active: 'success', pending: 'warning', error: 'error' }
const CATEGORY_COLORS: Record<string, string> = {
  accounting: 'success', erp: 'primary', crm: 'info', hr: 'warning', other: 'grey',
}

const connected = computed(() => integrations.value.filter(i => i.tenant))
const available = computed(() => integrations.value.filter(i => !i.tenant))

function openConnect(i: TenantIntegration) {
  selected.value = i
  configForm.value = {}
  for (const f of i.required_fields) {
    configForm.value[f.key] = i.tenant?.config?.[f.key] ?? ''
  }
  connectDialog.value = true
}

async function saveConnect() {
  if (!selected.value) return
  connecting.value = true
  try {
    await intApi.tenantConnect(id.value, selected.value.id, configForm.value)
    $showToast(`${selected.value.name} connected.`)
    connectDialog.value = false
    await load()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to connect.')
  } finally {
    connecting.value = false
  }
}

async function disconnect(i: TenantIntegration) {
  if (!confirm(`Disconnect ${i.name}? The config will be removed.`)) return
  disconnecting.value = i.id
  try {
    await intApi.tenantDisconnect(id.value, i.id)
    $showToast(`${i.name} disconnected.`)
    await load()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to disconnect.')
  } finally {
    disconnecting.value = null
  }
}

async function load() {
  loading.value = true
  try { integrations.value = await intApi.tenantList(id.value) }
  finally { loading.value = false }
}

onMounted(() => {
  store.fetchOne(id.value)
  load()
})
</script>

<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" :to="`/hospitals/${id}`">
      Back to hospital
    </v-btn>

    <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">
          Integrations
          <span v-if="h" class="text-h5 font-weight-regular textSecondary ml-2">— {{ h.display_name || h.name }}</span>
        </h2>
        <p class="textSecondary mb-0">Connect this hospital to external systems and services.</p>
      </div>
      <v-btn v-if="auth.isSystemAdmin" color="primary" prepend-icon="mdi-plus" to="/integrations">
        Add integration type
      </v-btn>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <!-- Connected -->
    <template v-if="connected.length">
      <h3 class="text-subtitle-1 font-weight-semibold mb-3">
        <v-icon icon="mdi-check-circle" color="success" class="mr-1" size="18" />
        Connected ({{ connected.length }})
      </h3>
      <v-row class="mb-6">
        <v-col v-for="i in connected" :key="i.id" cols="12" md="6" lg="4">
          <v-card rounded="lg" elevation="10" border="success sm">
            <v-card-text>
              <div class="d-flex align-center justify-space-between mb-2">
                <div>
                  <v-chip :color="CATEGORY_COLORS[i.category] || 'grey'" size="x-small" variant="tonal" label class="text-capitalize mr-2">
                    {{ i.category }}
                  </v-chip>
                  <v-chip :color="STATUS_COLOR[i.tenant!.status]" size="x-small" variant="flat" label class="text-capitalize">
                    {{ i.tenant!.status }}
                  </v-chip>
                </div>
              </div>
              <h3 class="text-subtitle-1 font-weight-semibold mb-1">{{ i.name }}</h3>
              <p class="text-body-2 textSecondary mb-2">{{ i.description || '—' }}</p>
              <p v-if="i.tenant?.connected_at" class="text-caption textSecondary mb-3">
                Connected: {{ new Date(i.tenant.connected_at).toLocaleDateString() }}
              </p>
              <div class="d-flex ga-2">
                <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-cog" @click="openConnect(i)">
                  Update config
                </v-btn>
                <v-btn size="small" color="error" variant="tonal" prepend-icon="mdi-link-off"
                  :loading="disconnecting === i.id" @click="disconnect(i)">
                  Disconnect
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Available -->
    <template v-if="available.length">
      <h3 class="text-subtitle-1 font-weight-semibold mb-3">
        <v-icon icon="mdi-power-plug-outline" class="mr-1" size="18" />
        Available integrations
        <span class="text-body-2 font-weight-regular textSecondary ml-1">({{ available.length }})</span>
      </h3>
      <v-row>
        <v-col v-for="i in available" :key="i.id" cols="12" md="6" lg="4">
          <v-card rounded="lg" elevation="10">
            <v-card-text>
              <v-chip :color="CATEGORY_COLORS[i.category] || 'grey'" size="x-small" variant="tonal" label class="text-capitalize mb-2">
                {{ i.category }}
              </v-chip>
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
              <v-btn size="small" color="primary" variant="flat" prepend-icon="mdi-link" @click="openConnect(i)">
                Connect
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <v-alert v-if="!loading && !integrations.length" type="info" variant="tonal">
      No integration types available yet.
      <template v-if="auth.isSystemAdmin">
        Go to <v-btn variant="text" size="small" to="/integrations" class="px-1">Integrations</v-btn> to add some.
      </template>
      <template v-else>Ask your platform admin to add integrations first.</template>
    </v-alert>

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
  </div>
</template>
