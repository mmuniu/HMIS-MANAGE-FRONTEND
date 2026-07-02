<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsApi } from '@/composables/useReportsApi'
import {
  MODULES, SEVERITIES, STATUS_LABELS, STATUS_COLORS,
  type ReportSummary, type ReportStatus,
} from '@/types/report'

const router = useRouter()
const api = useReportsApi()

const items = ref<ReportSummary[]>([])
const loading = ref(false)
const error = ref('')

const filters = reactive({
  search: '', status: null as string | null, type: null as string | null,
  module: null as string | null, severity: null as string | null,
  date_from: '', date_to: '',
})

const statusItems = (Object.keys(STATUS_LABELS) as ReportStatus[]).map((v) => ({ title: STATUS_LABELS[v], value: v }))

const headers = [
  { title: 'Ticket', key: 'ticket_id', sortable: false },
  { title: 'Type', key: 'type', sortable: false },
  { title: 'Title', key: 'title', sortable: false },
  { title: 'Module', key: 'module', sortable: false },
  { title: 'Severity', key: 'severity', sortable: false },
  { title: 'Reporter', key: 'reporter', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Submitted', key: 'created_at', sortable: false },
]

function fmt(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const params: Record<string, any> = {}
    for (const [k, v] of Object.entries(filters)) if (v) params[k] = v
    const res = await api.adminList(params)
    items.value = res.data
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to load reports.'
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  Object.assign(filters, { search: '', status: null, type: null, module: null, severity: null, date_from: '', date_to: '' })
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h4 font-weight-semibold">Feedback Administration</h2>
      <p class="textSecondary">All bug reports and feature requests across the platform.</p>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />

    <!-- Filters -->
    <v-card rounded="lg" elevation="10" class="mb-4">
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field v-model="filters.search" label="Search title, description or ticket"
              prepend-inner-icon="mdi-magnify" variant="outlined" density="comfortable" hide-details clearable
              @keyup.enter="load" />
          </v-col>
          <v-col cols="6" md="2">
            <v-select v-model="filters.status" :items="statusItems" label="Status" variant="outlined" density="comfortable" hide-details clearable />
          </v-col>
          <v-col cols="6" md="2">
            <v-select v-model="filters.type" :items="[{title:'Bug',value:'bug'},{title:'Feature',value:'feature'}]" label="Type" variant="outlined" density="comfortable" hide-details clearable />
          </v-col>
          <v-col cols="6" md="2">
            <v-select v-model="filters.module" :items="MODULES" label="Module" variant="outlined" density="comfortable" hide-details clearable />
          </v-col>
          <v-col cols="6" md="2">
            <v-select v-model="filters.severity" :items="SEVERITIES" label="Severity" variant="outlined" density="comfortable" hide-details clearable class="text-capitalize" />
          </v-col>
          <v-col cols="6" md="3">
            <v-text-field v-model="filters.date_from" type="date" label="From" variant="outlined" density="comfortable" hide-details />
          </v-col>
          <v-col cols="6" md="3">
            <v-text-field v-model="filters.date_to" type="date" label="To" variant="outlined" density="comfortable" hide-details />
          </v-col>
          <v-col cols="12" md="6" class="d-flex align-center ga-2">
            <v-btn color="primary" prepend-icon="mdi-filter" @click="load">Apply</v-btn>
            <v-btn variant="text" @click="clearFilters">Clear</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Table -->
    <v-card rounded="lg" elevation="10">
      <v-data-table :headers="headers" :items="items" :loading="loading" density="comfortable" hover
        @click:row="(_e: any, { item }: any) => router.push(`/feedback-admin/${item.ticket_id}`)">
        <template #item.ticket_id="{ item }"><span class="font-mono text-caption">{{ item.ticket_id.slice(0, 8) }}</span></template>
        <template #item.type="{ item }">
          <v-chip :color="item.type === 'bug' ? 'error' : 'primary'" size="small" variant="tonal" label>
            {{ item.type === 'bug' ? 'Bug' : 'Feature' }}
          </v-chip>
        </template>
        <template #item.title="{ item }"><span class="font-weight-medium">{{ item.title }}</span></template>
        <template #item.severity="{ item }">
          <span v-if="item.severity" class="text-capitalize">{{ item.severity }}</span>
          <span v-else class="textSecondary">—</span>
        </template>
        <template #item.status="{ item }">
          <v-chip :color="STATUS_COLORS[item.status as ReportStatus]" size="small" variant="flat" label>
            {{ STATUS_LABELS[item.status as ReportStatus] }}
          </v-chip>
        </template>
        <template #item.created_at="{ item }">{{ fmt(item.created_at) }}</template>
        <template #no-data><div class="pa-8 text-center textSecondary">No reports match your filters.</div></template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style scoped>
.ga-2 { gap: 8px; }
.font-mono { font-family: monospace; }
</style>
