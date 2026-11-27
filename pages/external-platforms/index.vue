<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import { useExternalPlatformsApi, type ExternalPlatformSummary } from '@/composables/useExternalPlatformsApi'

// Every platform this console is integrated to, on its own — none of these
// belong to a hospital (hospital integrations live on /integrations).
// Clicking one opens its page: configuration + the processes it covers.

const api = useExternalPlatformsApi()
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

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return platforms.value
  return platforms.value.filter(p =>
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

function setupLabel(p: ExternalPlatformSummary) {
  if (!p.fields_count) return 'No configuration yet'
  if (p.is_configured) return 'Configured'
  return `${p.missing_count} field${p.missing_count === 1 ? '' : 's'} to fill`
}

// ── Add a platform ──────────────────────────────────────────────────────────
const dialog = ref(false)
const saving = ref(false)
const errors = ref<Record<string, string[]>>({})
const form = ref({ name: '', id: '', category: 'other', description: '', is_active: true })

function openNew() {
  form.value = { name: '', id: '', category: 'other', description: '', is_active: true }
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
    })
    dialog.value = false
    $showToast(`${created.name} added. Set up its configuration and processes.`)
    router.push(`/external-platforms/${created.id}`)
  } catch (e: any) {
    errors.value = e?.response?.data?.errors ?? {}
    $showToast(e?.response?.data?.message || 'Failed to add the platform.')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">External Platforms</h2>
        <p class="textSecondary mb-0">
          The other platforms we are integrated to. These stand on their own — they are not tied to any hospital.
          Open a platform to set up its configuration and the processes its integration covers.
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openNew">Add Platform</v-btn>
    </div>

    <v-text-field
      v-if="platforms.length > 6"
      v-model="search"
      placeholder="Search platforms"
      prepend-inner-icon="mdi-magnify"
      variant="outlined" density="comfortable" hide-details clearable
      class="mb-4" style="max-width: 360px"
    />

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
              <v-chip :color="CATEGORY_COLORS[p.category] || 'grey'" size="small" variant="tonal" label class="text-capitalize">
                {{ p.category }}
              </v-chip>
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
        <v-alert type="info" variant="tonal">No platform matches "{{ search }}".</v-alert>
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
