<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  useExternalPlatformsApi,
  type PlatformRequest, type PlatformTenant, type RequestFilters, type RequestsPage,
} from '@/composables/useExternalPlatformsApi'

// Every request the platform sent through us, newest first — from
// integration-service's log, which keeps no request or response bodies.

const props = defineProps<{ platformId: string; platformName: string }>()

const api = useExternalPlatformsApi()

// For the tenant filter and names; the log works without them.
const tenants = ref<PlatformTenant[]>([])
onMounted(async () => {
  try { tenants.value = await api.tenants(props.platformId) } catch { /* filter by typing is enough */ }
})

const today = () => new Date().toISOString().slice(0, 10)
const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)

const filters = ref<{ from: string; to: string; tenant: string | null; operation: string; outcome: 'ok' | 'error' | null }>({
  from: daysAgo(6), to: today(), tenant: null, operation: '', outcome: null,
})
const page = ref(1)
const perPage = ref(25)

const loading = ref(false)
const loadError = ref('')
const result = ref<RequestsPage | null>(null)

const headers = [
  { title: 'When', key: 'at', sortable: false },
  { title: 'Tenant', key: 'tenant_id', sortable: false },
  { title: 'Operation', key: 'operation', sortable: false },
  { title: 'Request', key: 'path', sortable: false },
  { title: 'Status', key: 'status', sortable: false, align: 'end' as const },
  { title: 'Time', key: 'duration_ms', sortable: false, align: 'end' as const },
  { title: 'Correlation id', key: 'correlation_id', sortable: false },
]

async function load() {
  loading.value = true
  loadError.value = ''
  const f: RequestFilters = {
    from: filters.value.from || null,
    to: filters.value.to || null,
    tenant: filters.value.tenant,
    operation: filters.value.operation.trim() || null,
    outcome: filters.value.outcome,
    page: page.value,
    per_page: perPage.value,
  }
  try {
    result.value = await api.requests(props.platformId, f)
  } catch (e: any) {
    loadError.value = e?.response?.data?.message || 'Failed to load the requests.'
  } finally {
    loading.value = false
  }
}

function onTableUpdate(o: { page: number; itemsPerPage: number }) {
  page.value = o.page
  perPage.value = o.itemsPerPage
  load()
}

// A filter change starts again from page 1.
let timer: ReturnType<typeof setTimeout> | undefined
watch(filters, () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    page.value = 1
    load()
  }, 300)
}, { deep: true })

const summary = computed(() => result.value?.meta.summary ?? { total: 0, errors: 0, avg_duration_ms: null })
const errorRate = computed(() => (summary.value.total ? Math.round((summary.value.errors / summary.value.total) * 1000) / 10 : 0))

const tenantItems = computed(() => tenants.value.map(t => ({
  value: t.tenant_id,
  title: t.name ? `${t.tenant_id} · ${t.name}` : t.tenant_id,
})))

const OUTCOMES = [
  { value: null, title: 'All' },
  { value: 'ok', title: 'Succeeded' },
  { value: 'error', title: 'Failed' },
]

const statusColor = (s: number) => (s >= 500 ? 'error' : s >= 400 ? 'warning' : 'success')
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString() : '—')
const tenantName = (r: PlatformRequest) => tenants.value.find(t => t.tenant_id === r.tenant_id)?.name ?? null

defineExpose({ load })
</script>

<template>
  <v-card rounded="lg" elevation="10">
    <v-card-text>
      <div class="d-flex align-center justify-space-between mb-1 ga-2">
        <h3 class="text-h6 font-weight-semibold">Requests</h3>
        <v-btn variant="tonal" size="small" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn>
      </div>
      <p class="text-body-2 textSecondary mb-4">
        Every request {{ platformName }} sent through us, newest first. Bodies are never kept: they can carry patient data.
      </p>

      <!-- Filters -->
      <v-row dense class="mb-2">
        <v-col cols="6" md="2">
          <v-text-field v-model="filters.from" type="date" label="From" variant="outlined" density="compact" hide-details />
        </v-col>
        <v-col cols="6" md="2">
          <v-text-field v-model="filters.to" type="date" label="To" variant="outlined" density="compact" hide-details />
        </v-col>
        <v-col cols="12" md="3">
          <v-autocomplete v-model="filters.tenant" :items="tenantItems" label="Tenant" clearable
            variant="outlined" density="compact" hide-details />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field v-model="filters.operation" label="Operation" placeholder="e.g. token" clearable
            variant="outlined" density="compact" hide-details />
        </v-col>
        <v-col cols="6" md="2">
          <v-select v-model="filters.outcome" :items="OUTCOMES" label="Outcome" variant="outlined" density="compact" hide-details />
        </v-col>
      </v-row>

      <!-- Summary of the filtered range -->
      <v-row dense class="mb-3">
        <v-col cols="6" md="3">
          <v-sheet rounded="lg" border class="pa-3">
            <p class="text-caption textSecondary mb-1">Requests</p>
            <p class="text-h5 font-weight-semibold mb-0">{{ summary.total.toLocaleString() }}</p>
          </v-sheet>
        </v-col>
        <v-col cols="6" md="3">
          <v-sheet rounded="lg" border class="pa-3">
            <p class="text-caption textSecondary mb-1">Failed</p>
            <p class="text-h5 font-weight-semibold mb-0" :class="{ 'text-error': summary.errors > 0 }">
              {{ summary.errors.toLocaleString() }}
            </p>
          </v-sheet>
        </v-col>
        <v-col cols="6" md="3">
          <v-sheet rounded="lg" border class="pa-3">
            <p class="text-caption textSecondary mb-1">Failure rate</p>
            <p class="text-h5 font-weight-semibold mb-0">{{ errorRate }}%</p>
          </v-sheet>
        </v-col>
        <v-col cols="6" md="3">
          <v-sheet rounded="lg" border class="pa-3">
            <p class="text-caption textSecondary mb-1">Average time</p>
            <p class="text-h5 font-weight-semibold mb-0">
              {{ summary.avg_duration_ms === null ? '—' : `${summary.avg_duration_ms} ms` }}
            </p>
          </v-sheet>
        </v-col>
      </v-row>

      <v-alert v-if="loadError" type="error" variant="tonal" class="mb-3">{{ loadError }}</v-alert>

      <v-data-table-server
        :headers="headers"
        :items="result?.data ?? []"
        :items-length="result?.meta.total ?? 0"
        :loading="loading"
        :page="page"
        :items-per-page="perPage"
        :items-per-page-options="[25, 50, 100, 200]"
        density="comfortable"
        no-data-text="No requests in this range."
        @update:options="onTableUpdate"
      >
        <template #item.at="{ item }">
          <span class="text-no-wrap">{{ when(item.at) }}</span>
        </template>
        <template #item.tenant_id="{ item }">
          <template v-if="item.tenant_id">
            <code>{{ item.tenant_id }}</code>
            <div v-if="item.hospital || tenantName(item)" class="text-caption textSecondary">
              {{ item.hospital?.name ?? tenantName(item) }}
            </div>
          </template>
          <span v-else class="textSecondary">—</span>
        </template>
        <template #item.operation="{ item }">
          {{ item.operation || '—' }}
        </template>
        <template #item.path="{ item }">
          <code class="text-no-wrap">{{ item.method }} {{ item.path }}</code>
          <div v-if="item.error" class="text-caption text-error">{{ item.error }}</div>
        </template>
        <template #item.status="{ item }">
          <v-chip :color="statusColor(item.status)" size="x-small" variant="tonal" label>{{ item.status }}</v-chip>
        </template>
        <template #item.duration_ms="{ item }">
          <span class="text-no-wrap">{{ item.duration_ms }} ms</span>
        </template>
        <template #item.correlation_id="{ item }">
          <code v-if="item.correlation_id" class="text-caption">{{ item.correlation_id }}</code>
          <span v-else class="textSecondary">—</span>
        </template>
      </v-data-table-server>
    </v-card-text>
  </v-card>
</template>
