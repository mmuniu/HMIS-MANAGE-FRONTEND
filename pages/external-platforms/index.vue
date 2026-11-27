<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import { useExternalPlatformsApi, type ExternalPlatformSummary } from '@/composables/useExternalPlatformsApi'
import { useHospitalsApi } from '@/composables/useHospitalsApi'
import type { V3Target } from '@/types/hospital'

// Every platform this console is integrated to, on its own — none of these
// belong to a hospital (hospital integrations live on /integrations).
// Each one is integrated to one system (v3 stack): the System filter is the
// same one as on /hospitals.
// Clicking one opens its page: configuration + the processes it covers.

const api = useExternalPlatformsApi()
const hospitalsApi = useHospitalsApi()
const route = useRoute()
const router = useRouter()
const { $showToast } = useNuxtApp()

const CATEGORIES = ['payments', 'government', 'insurance', 'messaging', 'analytics', 'accounting', 'other']
const CATEGORY_COLORS: Record<string, string> = {
  payments: 'success', government: 'primary', insurance: 'info', messaging: 'warning',
  analytics: 'secondary', accounting: 'success', other: 'grey',
}

const loading = ref(false)
const platforms = ref<ExternalPlatformSummary[]>([])
const search = ref('')

// System (v3 stack) filter. '' = every system. Kept in the URL (?system=) so
// it survives opening a platform and coming back, and so "Add Platform" adds
// to the system already selected.
const systems = ref<V3Target[]>([])
const system = ref(typeof route.query.system === 'string' ? route.query.system : '')
const systemItems = computed(() => [
  { key: '', label: 'All systems' },
  ...systems.value.map(t => ({ key: t.key, label: t.label })),
])
// Only worth a filter and a chip once there is more than one system.
const multiSystem = computed(() => systems.value.length > 1)
const isDefaultSystem = (key: string) => systems.value.find(t => t.key === key)?.default ?? false
const defaultSystem = computed(() => systems.value.find(t => t.default)?.key ?? systems.value[0]?.key ?? '')
const systemLabel = computed(() => systems.value.find(t => t.key === system.value)?.label ?? system.value)

watch(system, (s) => {
  if ((route.query.system ?? '') !== s) router.replace({ query: { ...route.query, system: s || undefined } })
})

async function loadSystems() {
  try {
    systems.value = await hospitalsApi.getV3Targets()
    // A system that isn't configured (stale link) falls back to all systems.
    if (system.value && !systems.value.some(t => t.key === system.value)) system.value = ''
  } catch {
    // Not fatal: without the list there is just no filter.
    systems.value = []
  }
}

const inSystem = computed(() =>
  system.value ? platforms.value.filter(p => p.v3_target === system.value) : platforms.value,
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return inSystem.value
  return inSystem.value.filter(p =>
    [p.name, p.id, p.category, p.description ?? ''].some(v => v.toLowerCase().includes(q)),
  )
})

async function load() {
  loading.value = true
  try { platforms.value = await api.list() }
  catch (e: any) { $showToast(e?.response?.data?.message || 'Failed to load the platforms.') }
  finally { loading.value = false }
}

function open(p: ExternalPlatformSummary) {
  router.push(`/external-platforms/${p.id}`)
}

// Search is for a long list; while typing, keep it even if the list shrinks.
const showSearch = computed(() => platforms.value.length > 6 || !!search.value)

function setupLabel(p: ExternalPlatformSummary) {
  if (!p.fields_count) return 'No configuration yet'
  if (p.is_configured) return 'Configured'
  return `${p.missing_count} field${p.missing_count === 1 ? '' : 's'} to fill`
}

// ── Add a platform ──────────────────────────────────────────────────────────
const dialog = ref(false)
const saving = ref(false)
const errors = ref<Record<string, string[]>>({})
const form = ref({ name: '', id: '', category: 'other', description: '', is_active: true, v3_target: '' })

function openNew() {
  // Starts on the system being looked at, else the default one.
  form.value = { name: '', id: '', category: 'other', description: '', is_active: true, v3_target: system.value || defaultSystem.value }
  errors.value = {}
  dialog.value = true
}

async function save() {
  saving.value = true
  errors.value = {}
  try {
    const created = await api.create({
      name: form.value.name.trim(),
      // Left blank, the ID is made from the name.
      ...(form.value.id.trim() ? { id: form.value.id.trim() } : {}),
      category: form.value.category,
      description: form.value.description.trim() || null,
      is_active: form.value.is_active,
      ...(form.value.v3_target ? { v3_target: form.value.v3_target } : {}),
    })
    dialog.value = false
    $showToast(created.integration_service && !created.integration_service.synced
      ? `${created.name} added, but not pushed to the integration service (${created.integration_service.error}). Save its details again to retry.`
      : `${created.name} added. Set up its configuration and processes.`)
    router.push(`/external-platforms/${created.id}`)
  } catch (e: any) {
    errors.value = e?.response?.data?.errors ?? {}
    $showToast(e?.response?.data?.message || 'Failed to add the platform.')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  load()
  loadSystems()
})
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">External Platforms</h2>
        <p class="textSecondary mb-0">
          The other platforms we are integrated to. These stand on their own — they are not tied to any hospital.
          <template v-if="multiSystem">Each one is integrated to one system. </template>
          Open a platform to set up its configuration and the processes its integration covers.
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openNew">Add Platform</v-btn>
    </div>

    <div v-if="showSearch || multiSystem" class="d-flex flex-wrap ga-3 mb-4">
      <v-text-field
        v-if="showSearch"
        v-model="search"
        placeholder="Search platforms"
        prepend-inner-icon="mdi-magnify"
        variant="outlined" density="compact" hide-details clearable
        style="max-width: 420px; min-width: 220px"
      />
      <v-select
        v-if="multiSystem"
        v-model="system"
        :items="systemItems"
        item-title="label"
        item-value="key"
        aria-label="System"
        prepend-inner-icon="mdi-layers-triple-outline"
        variant="outlined" density="compact" hide-details
        style="max-width: 240px; min-width: 180px"
      />
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-row>
      <v-col v-for="p in filtered" :key="p.id" cols="12" md="6" lg="4">
        <v-card
          rounded="lg" elevation="10" class="h-100 platform-card" :opacity="p.is_active ? 1 : 0.6"
          role="link" tabindex="0" :aria-label="`Open ${p.name}`"
          @click="open(p)" @keydown.enter="open(p)"
        >
          <v-card-text class="d-flex flex-column h-100">
            <div class="d-flex align-center justify-space-between mb-2 ga-2">
              <div class="d-flex flex-wrap ga-1">
                <v-chip :color="CATEGORY_COLORS[p.category] || 'grey'" size="small" variant="tonal" label class="text-capitalize">
                  {{ p.category }}
                </v-chip>
                <v-chip v-if="multiSystem" size="small" :color="isDefaultSystem(p.v3_target) ? undefined : 'secondary'" variant="tonal" label
                  prepend-icon="mdi-layers-triple-outline" :title="`Integrated to the ${p.v3_target_label} system`">
                  {{ p.v3_target_label }}
                </v-chip>
              </div>
              <div class="d-flex ga-1">
                <v-chip v-if="!p.is_active" color="error" size="x-small" variant="tonal" label>Inactive</v-chip>
                <v-chip :color="p.is_configured ? 'success' : 'warning'" size="x-small" variant="flat" label>
                  {{ setupLabel(p) }}
                </v-chip>
              </div>
            </div>
            <h3 class="text-subtitle-1 font-weight-semibold mb-1">{{ p.name }}</h3>
            <p class="text-body-2 textSecondary mb-3 platform-description">{{ p.description || '—' }}</p>
            <v-spacer />
            <div class="d-flex align-center justify-space-between ga-2">
              <p class="text-caption textSecondary mb-0">
                <template v-if="p.processes_count">
                  {{ p.processes_count }} process{{ p.processes_count === 1 ? '' : 'es' }}
                  · {{ p.enabled_processes_count }} on
                </template>
                <template v-else>No processes yet</template>
              </p>
              <v-icon icon="mdi-chevron-right" size="20" class="textSecondary" />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col v-if="!loading && !platforms.length" cols="12">
        <v-alert type="info" variant="tonal">
          No platforms yet. Click "Add Platform" to add the first one.
        </v-alert>
      </v-col>
      <v-col v-else-if="!loading && !filtered.length" cols="12">
        <v-alert type="info" variant="tonal">
          <template v-if="search.trim()">No platform matches "{{ search }}"<template v-if="system"> on {{ systemLabel }}</template>.</template>
          <template v-else>No platforms are integrated to {{ systemLabel }} yet. Click "Add Platform" to add one.</template>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Add platform -->
    <v-dialog v-model="dialog" max-width="560" scrollable>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center pa-4 pb-2">
          Add Platform
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" aria-label="Close" @click="dialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <v-row dense>
            <v-col cols="12" md="7">
              <v-text-field v-model="form.name" label="Name" placeholder="e.g. FieldMatch" autofocus
                variant="outlined" density="comfortable" :error-messages="errors.name" />
            </v-col>
            <v-col cols="12" md="5">
              <v-select v-model="form.category" :items="CATEGORIES" label="Category"
                variant="outlined" density="comfortable" class="text-capitalize" :error-messages="errors.category" />
            </v-col>
            <v-col v-if="multiSystem" cols="12">
              <v-select v-model="form.v3_target" :items="systems" item-title="label" item-value="key" label="System"
                prepend-inner-icon="mdi-layers-triple-outline"
                hint="The system this platform is integrated to. It cannot be changed later." persistent-hint
                variant="outlined" density="comfortable" class="mb-2" :error-messages="errors.v3_target" />
            </v-col>
            <v-col cols="12">
              <v-text-field v-model="form.id" label="ID (optional)" placeholder="fieldmatch"
                hint="Lowercase letters, digits and underscores. Left blank, it is made from the name. It cannot be changed later."
                persistent-hint variant="outlined" density="comfortable" :error-messages="errors.id" />
            </v-col>
            <v-col cols="12" class="mt-2">
              <v-textarea v-model="form.description" label="Description" placeholder="What this platform is and why we integrate to it"
                variant="outlined" density="comfortable" rows="2" auto-grow :error-messages="errors.description" />
            </v-col>
            <v-col cols="12">
              <v-switch v-model="form.is_active" label="Active" color="success" hide-details density="compact" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-4 ga-2">
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" :disabled="!form.name.trim()" @click="save">
            Add platform
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.platform-card {
  cursor: pointer;
  transition: transform 0.15s ease;
}
.platform-card:hover,
.platform-card:focus-visible {
  transform: translateY(-2px);
}
.platform-description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
