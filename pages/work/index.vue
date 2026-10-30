<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsApi } from '@/composables/useReportsApi'
import { useAuthStore } from '@/stores/auth'
import { SEVERITIES, STATUS_LABELS, STATUS_FLOW, type ReportSummary, type ReportStatus, type Severity } from '~/types/report'

const api = useReportsApi()
const router = useRouter()
const auth = useAuthStore()

const items = ref<ReportSummary[]>([])
const loading = ref(false)
const scope = ref<'all' | 'mine'>('mine')

// Assignee options (only used in the system-admin "all" view).
const assignees = ref<{ id: number; name: string }[]>([])

const filters = reactive({
  assigned_to: null as number | null,
  type: null as string | null,
  severity: null as Severity | null,
  // 'unresolved' isn't a real status — it's the "haven't finished this yet"
  // view (everything before resolved) the Assigned Bugs list otherwise has
  // no way to ask for directly.
  status: null as ReportStatus | 'unresolved' | null,
  sort: 'newest' as 'newest' | 'oldest',
  date_from: '' as string,
  date_to: '' as string,
})

// Statuses that count as "not yet dealt with" for the Unresolved quick
// filter — everything up to and including in_progress. resolved/delivered
// mean the work is done even if the ticket hasn't been formally closed yet,
// so they're deliberately excluded from "what haven't I tackled".
const UNRESOLVED_STATUSES: ReportStatus[] = ['new', 'under_review', 'assigned', 'in_progress']

// Severity options for the filter, ordered most-urgent first so "critical" is
// the first thing reachable in the dropdown.
const SEVERITY_OPTIONS = [...SEVERITIES].reverse().map((s) => ({
  title: s.charAt(0).toUpperCase() + s.slice(1),
  value: s,
}))

// Status options: the synthetic "Unresolved" view first (the common case),
// then every real status in lifecycle order. /work already excludes closed
// by default, so "Closed" isn't offered here — there's nothing to filter to.
const STATUS_OPTIONS = [
  { title: 'Unresolved (not resolved/delivered)', value: 'unresolved' as const },
  ...STATUS_FLOW.filter((s) => s !== 'closed').map((s) => ({ title: STATUS_LABELS[s], value: s })),
]

function clearRange() {
  filters.date_from = ''
  filters.date_to = ''
  load()
}

function fmtDate(v: string | null) {
  if (!v) return '—'
  return new Date(v).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtTime(v: string | null) {
  if (!v) return ''
  return new Date(v).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

const STATUS_COLORS: Record<string, string> = {
  new: 'info', under_review: 'secondary', assigned: 'primary',
  in_progress: 'warning', resolved: 'success', delivered: 'success', closed: 'grey',
}

async function load() {
  loading.value = true
  try {
    const params: Record<string, any> = { sort: filters.sort }
    if (filters.type) params.type = filters.type
    if (filters.severity) params.severity = filters.severity
    if (filters.status) params.status = filters.status
    if (filters.assigned_to) params.assigned_to = filters.assigned_to
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    const res = await api.work(params)
    items.value = res.data
    scope.value = res.meta?.scope ?? 'mine'
    // Load the assignee list once, only for the admin "all" view.
    if (scope.value === 'all' && !assignees.value.length) {
      assignees.value = await api.adminAssignableDevs()
    }
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  filters.assigned_to = null
  filters.type = null
  filters.severity = null
  filters.status = null
  filters.sort = 'newest'
  filters.date_from = ''
  filters.date_to = ''
  load()
}

function openReport(ticketId: string) {
  // Pass where we came from so the detail page's Back returns here.
  router.push(`/feedback-admin/${ticketId}?from=${encodeURIComponent('/work')}`)
}

function label(s: string) {
  return s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const headers = [
  { title: 'Ref', key: 'reference', sortable: false },
  { title: 'Title', key: 'title', sortable: false },
  { title: 'Type', key: 'type', sortable: false },
  { title: 'Severity', key: 'severity', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Assignee', key: 'assignee', sortable: false },
  { title: 'Raised', key: 'created_at', sortable: false },
]

onMounted(load)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">Assigned Bugs</h2>
        <p class="textSecondary mb-0">
          {{ scope === 'all'
            ? 'Every bug and feature assigned across the team.'
            : 'Bugs and features assigned to you to work on.' }}
        </p>
      </div>
      <v-chip v-if="items.length" :color="scope === 'all' ? 'primary' : 'secondary'" variant="tonal" label>
        {{ items.length }} active
      </v-chip>
    </div>

    <!-- Filters -->
    <v-card rounded="lg" elevation="10" class="mb-4">
      <v-card-text>
        <div class="d-flex flex-wrap align-center ga-3">
          <v-select
            v-model="filters.sort"
            :items="[{ title: 'Newest first', value: 'newest' }, { title: 'Oldest first', value: 'oldest' }]"
            label="Order by date"
            variant="outlined" density="compact" hide-details
            style="max-width: 200px"
            @update:model-value="load"
          />
          <v-select
            v-model="filters.type"
            :items="[{ title: 'Bug', value: 'bug' }, { title: 'Feature', value: 'feature' }]"
            label="Type" clearable
            variant="outlined" density="compact" hide-details
            style="max-width: 180px"
            @update:model-value="load"
          />
          <v-select
            v-model="filters.severity"
            :items="SEVERITY_OPTIONS"
            label="Severity" clearable
            variant="outlined" density="compact" hide-details
            style="max-width: 180px"
            @update:model-value="load"
          />
          <v-select
            v-model="filters.status"
            :items="STATUS_OPTIONS"
            label="Status" clearable
            variant="outlined" density="compact" hide-details
            style="max-width: 240px"
            @update:model-value="load"
          />
          <v-select
            v-if="scope === 'all'"
            v-model="filters.assigned_to"
            :items="assignees" item-title="name" item-value="id"
            label="Assignee" clearable
            variant="outlined" density="compact" hide-details
            style="max-width: 220px"
            @update:model-value="load"
          />
          <v-btn variant="text" prepend-icon="mdi-close" @click="clearFilters">Clear</v-btn>
        </div>

        <v-divider class="my-3" />

        <div class="d-flex flex-wrap align-center ga-3">
          <!-- Dates only apply when Filter is clicked, so a half-typed range
               (from set, to still empty) never fires a query on its own. -->
          <v-text-field
            v-model="filters.date_from" type="date" label="Raised from"
            variant="outlined" density="compact" hide-details clearable
            style="max-width: 190px" @keyup.enter="load"
          />
          <v-text-field
            v-model="filters.date_to" type="date" label="Raised to"
            variant="outlined" density="compact" hide-details clearable
            style="max-width: 190px" @keyup.enter="load"
          />
          <v-btn color="primary" prepend-icon="mdi-filter-variant" :loading="loading" @click="load">
            Filter
          </v-btn>
          <v-btn v-if="filters.date_from || filters.date_to" variant="text"
            prepend-icon="mdi-calendar-remove" @click="clearRange">Clear dates</v-btn>
        </div>
      </v-card-text>
    </v-card>

    <v-card rounded="lg" elevation="10">
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        density="comfortable"
        hover
        @click:row="(_e: any, { item }: any) => openReport(item.ticket_id)"
      >
        <template #item.reference="{ item }">
          <span class="font-weight-medium">{{ item.reference }}</span>
        </template>
        <template #item.type="{ item }">
          <v-chip size="small" :color="item.type === 'bug' ? 'error' : 'info'" variant="tonal" label>
            {{ item.type === 'bug' ? 'Bug' : 'Feature' }}
          </v-chip>
        </template>
        <template #item.severity="{ item }">
          <span v-if="item.severity" class="text-capitalize">{{ item.severity }}</span>
          <span v-else class="textSecondary">—</span>
        </template>
        <template #item.status="{ item }">
          <v-chip size="small" :color="STATUS_COLORS[item.status] || 'grey'" variant="tonal" label>
            {{ label(item.status) }}
          </v-chip>
        </template>
        <template #item.assignee="{ item }">
          {{ item.assignee || '—' }}
        </template>
        <template #item.created_at="{ item }">
          <div style="min-width: 110px">
            <div>{{ fmtDate(item.created_at) }}</div>
            <div class="text-caption textSecondary">{{ fmtTime(item.created_at) }}</div>
          </div>
        </template>
        <template #no-data>
          <div class="pa-10 text-center">
            <v-avatar color="error" variant="tonal" size="64" class="mb-3">
              <v-icon icon="mdi-bug-outline" size="34" />
            </v-avatar>
            <h3 class="text-h6 mb-1">Nothing assigned yet</h3>
            <p class="textSecondary mb-0">
              {{ scope === 'all'
                ? 'No bugs or features are currently assigned to anyone.'
                : 'Bugs and features assigned to you will show up here.' }}
            </p>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style scoped>
.ga-3 { gap: 12px; }
</style>
