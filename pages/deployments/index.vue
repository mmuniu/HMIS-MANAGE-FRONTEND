<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDeploymentsStore } from '@/stores/deployments'
import { useHospitalsStore } from '@/stores/hospitals'
import { DEPLOYMENT_STATUS_COLOR } from '@/types/deployment'

const router = useRouter()
const store = useDeploymentsStore()
const hospitalsStore = useHospitalsStore()

const page = ref(1)
const perPage = ref(25)

const headers = [
  { title: 'Hospital', key: 'hospital', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Current stage', key: 'current_stage_title', sortable: false },
  { title: 'Progress', key: 'progress', sortable: false },
  { title: 'Created', key: 'created_at', sortable: false },
]

function load() {
  store.fetchList(page.value, perPage.value)
}

function onTableUpdate(opts: { page: number; itemsPerPage: number }) {
  page.value = opts.page
  perPage.value = opts.itemsPerPage
  load()
}

function openDeployment(id: string) {
  router.push(`/deployments/${id}`)
}

function fmt(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'
}

// ── New deployment dialog ─────────────────────────────────────────────────
const newDialog = ref(false)
const target = ref<'existing' | 'prospective'>('existing')
const form = reactive({ organization_id: '', prospective_name: '' })

const hospitalOptions = computed(() =>
  hospitalsStore.items.map((h) => ({ title: h.display_name || h.name, value: h.id })),
)

function openNewDeployment() {
  target.value = 'existing'
  form.organization_id = ''
  form.prospective_name = ''
  if (!hospitalsStore.items.length) hospitalsStore.fetchList(1, 100)
  newDialog.value = true
}

async function saveNewDeployment() {
  const payload =
    target.value === 'existing'
      ? { organization_id: form.organization_id }
      : { prospective_name: form.prospective_name }

  const res = await store.create(payload)
  if (res.success) {
    newDialog.value = false
    router.push(`/deployments/${res.data.id}`)
  }
}

const canSave = computed(() =>
  target.value === 'existing' ? !!form.organization_id : !!form.prospective_name.trim(),
)

onMounted(load)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">Deployments</h2>
        <p class="textSecondary">Implementation lifecycle for every hospital — from authorization to handover.</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openNewDeployment">New Deployment</v-btn>
    </div>

    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" :text="store.error" />

    <v-card rounded="lg" elevation="10">
      <v-data-table-server
        :headers="headers"
        :items="store.items"
        :items-length="store.meta?.total ?? 0"
        :loading="store.loading"
        :items-per-page="perPage"
        :page="page"
        :items-per-page-options="[10, 25, 50, 100]"
        hover
        @update:options="onTableUpdate"
        @click:row="(_e: any, { item }: any) => openDeployment(item.id)"
      >
        <template #item.hospital="{ item }">
          <div class="py-2">
            <div class="font-weight-semibold">{{ item.organization_name || item.prospective_name }}</div>
            <v-chip v-if="!item.organization_id" size="x-small" variant="tonal" color="warning" label class="mt-1">
              Not yet provisioned
            </v-chip>
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="DEPLOYMENT_STATUS_COLOR[item.status]" size="small" variant="tonal" label>
            {{ item.status.replace('_', ' ') }}
          </v-chip>
        </template>

        <template #item.current_stage_title="{ item }">
          <span class="text-body-2">Stage {{ item.current_stage }}: {{ item.current_stage_title }}</span>
        </template>

        <template #item.progress="{ item }">
          <div class="d-flex align-center ga-2" style="min-width: 140px">
            <v-progress-linear :model-value="(item.current_stage / item.total_stages) * 100" height="8" rounded color="primary" style="max-width: 100px" />
            <span class="text-caption textSecondary">{{ item.current_stage }}/{{ item.total_stages }}</span>
          </div>
        </template>

        <template #item.created_at="{ item }">{{ fmt(item.created_at) }}</template>

        <template #no-data>
          <div class="pa-8 text-center textSecondary">No deployments yet.</div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- New deployment dialog -->
    <v-dialog v-model="newDialog" max-width="480">
      <v-card rounded="lg">
        <v-card-title class="text-h6">New deployment</v-card-title>
        <v-card-text>
          <v-btn-toggle v-model="target" color="primary" variant="outlined" density="comfortable" class="mb-4" mandatory>
            <v-btn value="existing">Existing hospital</v-btn>
            <v-btn value="prospective">Prospective client</v-btn>
          </v-btn-toggle>

          <v-select
            v-if="target === 'existing'"
            v-model="form.organization_id" :items="hospitalOptions" :loading="hospitalsStore.loading"
            label="Hospital" variant="outlined" density="comfortable" hide-details
          />
          <v-text-field
            v-else
            v-model="form.prospective_name" label="Prospective client name" variant="outlined" density="comfortable" hide-details
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="store.creating" @click="newDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="store.creating" :disabled="!canSave" @click="saveNewDeployment">
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
