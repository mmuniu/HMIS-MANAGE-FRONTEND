<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useRootAdminApi, type IssueStats } from '@/composables/useRootAdminApi'
import { fmtDate } from './format'

const api = useRootAdminApi()
const theme = useTheme()

const data = ref<IssueStats | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const today = new Date()
const iso = (d: Date) => d.toISOString().slice(0, 10)
const from = ref(iso(new Date(today.getTime() - 29 * 864e5)))
const to = ref(iso(today))
const type = ref<string | null>(null)
const severity = ref<string | null>(null)
const showTable = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    data.value = await api.issueStats({
      from: from.value, to: to.value, type: type.value || undefined, severity: severity.value || undefined,
    })
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Could not load issue statistics.'
  } finally {
    loading.value = false
  }
}

// Validated pair (dataviz validator, light on #fff and dark on #1a2537):
// "found" = brand primary, "sorted" = burnt orange. Not status colors.
const SERIES = computed(() => theme.global.current.value.dark
  ? { found: '#7A73FF', sorted: '#DB7330' }
  : { found: '#635BFF', sorted: '#C2560C' })

const series = computed(() => [
  { name: 'Found', data: (data.value?.daily ?? []).map((d) => d.found) },
  { name: 'Sorted', data: (data.value?.daily ?? []).map((d) => d.sorted) },
])

const chartOptions = computed(() => {
  const dark = theme.global.current.value.dark
  const muted = dark ? '#8a94a6' : '#6b7280'
  return {
    chart: { type: 'line', toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit', background: 'transparent' },
    theme: { mode: dark ? 'dark' : 'light' },
    colors: [SERIES.value.found, SERIES.value.sorted],
    stroke: { width: 2, curve: 'straight' },
    markers: { size: 0, hover: { size: 5 } },
    dataLabels: { enabled: false },
    legend: { show: true, position: 'top', horizontalAlign: 'left', labels: { colors: muted } },
    // Side padding keeps the first and last date labels from being clipped.
    grid: { borderColor: dark ? '#2a3547' : '#eef0f4', strokeDashArray: 0, xaxis: { lines: { show: false } }, padding: { left: 24, right: 24 } },
    xaxis: {
      categories: (data.value?.daily ?? []).map((d) => d.date),
      labels: { rotate: 0, hideOverlappingLabels: true, style: { colors: muted }, formatter: (v: string) => (v ? fmtDate(v) : v) },
      axisBorder: { show: false }, axisTicks: { show: false },
      tooltip: { enabled: false },
      crosshairs: { show: true },
    },
    yaxis: { min: 0, forceNiceScale: true, labels: { style: { colors: muted }, formatter: (v: number) => Math.round(v).toString() } },
    tooltip: { shared: true, intersect: false, theme: dark ? 'dark' : 'light' },
  }
})

const tiles = computed(() => {
  const t = data.value?.totals
  if (!t) return []
  return [
    { label: 'Found in period', value: t.found, dot: SERIES.value.found },
    { label: 'Sorted in period', value: t.sorted_in_period, dot: SERIES.value.sorted },
    { label: 'Pending now', value: t.pending },
    { label: 'Being worked now', value: t.being_worked },
    { label: 'Sorted (all time)', value: t.sorted },
    { label: 'Duplicates in period', value: t.duplicates },
  ]
})

const tts = computed(() => data.value?.time_to_sort_hours)
function hours(h: number | null | undefined) {
  if (h == null) return '—'
  return h < 48 ? `${h} h` : `${Math.round(h / 24)} days`
}

function asRows(map: Record<string, number> | undefined) {
  return Object.entries(map ?? {}).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name: name.replace('_', ' '), count }))
}

const openHeaders = [
  { title: 'Ref', key: 'reference', sortable: false },
  { title: 'Title', key: 'title', sortable: false },
  { title: 'Severity', key: 'severity', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Assignee', key: 'assignee', sortable: false },
  { title: 'Raised', key: 'created_at', sortable: false },
]

const otherSources = computed(() => {
  const o = data.value?.other_sources
  if (!o) return []
  return [
    { label: 'Client feedback', ...o.feedback },
    { label: 'Deployment issues', ...o.deployment_issues },
    { label: 'Deployment incidents', ...o.deployment_incidents },
    { label: 'UAT defects', ...o.uat_defects },
  ]
})

onMounted(load)
</script>

<template>
  <div>
    <!-- Filters: one row above the charts -->
    <v-card rounded="lg" elevation="10" class="mb-4">
      <v-card-text class="d-flex flex-wrap ga-3 align-center">
        <v-text-field v-model="from" type="date" label="From" variant="outlined" density="comfortable" hide-details style="max-width:180px" @change="load" />
        <v-text-field v-model="to" type="date" label="To" variant="outlined" density="comfortable" hide-details style="max-width:180px" @change="load" />
        <v-select v-model="type" :items="['bug', 'feature', 'observation']" label="Type" variant="outlined" density="comfortable"
          hide-details clearable style="max-width:170px; min-width:140px" class="text-capitalize" @update:model-value="load" />
        <v-select v-model="severity" :items="['critical', 'high', 'medium', 'low']" label="Severity" variant="outlined" density="comfortable"
          hide-details clearable style="max-width:170px; min-width:140px" @update:model-value="load" />
        <v-progress-circular v-if="loading" indeterminate size="22" width="2" color="primary" />
      </v-card-text>
    </v-card>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />

    <template v-if="data">
      <v-row>
        <v-col v-for="t in tiles" :key="t.label" cols="6" md="4" lg="2">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-text>
              <div class="text-h5 font-weight-semibold">{{ t.value }}</div>
              <div class="text-body-2 textSecondary d-flex align-center">
                <span v-if="t.dot" class="series-dot mr-2" :style="{ background: t.dot }" />{{ t.label }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-1">
        <v-col cols="12" lg="8">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item>
              <v-card-title>Found vs sorted per day</v-card-title>
              <template #append>
                <v-btn variant="text" size="small" :prepend-icon="showTable ? 'mdi-chart-line' : 'mdi-table'" @click="showTable = !showTable">
                  {{ showTable ? 'Chart' : 'Table' }}
                </v-btn>
              </template>
            </v-card-item>
            <v-card-text>
              <v-table v-if="showTable" density="compact" fixed-header height="300">
                <thead><tr><th>Date</th><th class="text-end">Found</th><th class="text-end">Sorted</th></tr></thead>
                <tbody>
                  <tr v-for="d in data.daily" :key="d.date"><td>{{ fmtDate(d.date) }}</td><td class="text-end">{{ d.found }}</td><td class="text-end">{{ d.sorted }}</td></tr>
                </tbody>
              </v-table>
              <ClientOnly v-else>
                <apexchart type="line" height="300" :options="chartOptions" :series="series" />
              </ClientOnly>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item><v-card-title>Time to sort</v-card-title></v-card-item>
            <v-card-text>
              <div class="d-flex ga-6 mb-2">
                <div><div class="text-h4 font-weight-semibold">{{ hours(tts?.median) }}</div><div class="text-body-2 textSecondary">Median</div></div>
                <div><div class="text-h4 font-weight-semibold">{{ hours(tts?.p90) }}</div><div class="text-body-2 textSecondary">90% sorted within</div></div>
              </div>
              <p class="text-caption textSecondary mb-4">From being raised to first resolved, delivered or closed · {{ tts?.count ?? 0 }} reports in the period.</p>

              <div class="text-subtitle-2 mb-2">Other sources (found in period · open now)</div>
              <div v-for="s in otherSources" :key="s.label" class="d-flex justify-space-between text-body-2 py-1">
                <span>{{ s.label }}</span><span>{{ s.found }} · {{ s.open }}</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-1">
        <v-col v-for="b in [{ title: 'By module', rows: asRows(data.by_module) }, { title: 'By severity', rows: asRows(data.by_severity) }, { title: 'By type', rows: asRows(data.by_type) }]"
          :key="b.title" cols="12" md="4">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item><v-card-title class="text-subtitle-1">{{ b.title }}</v-card-title></v-card-item>
            <v-card-text>
              <div v-for="r in b.rows" :key="r.name" class="d-flex justify-space-between text-body-2 py-1 text-capitalize">
                <span>{{ r.name }}</span><span class="font-weight-medium">{{ r.count }}</span>
              </div>
              <p v-if="!b.rows.length" class="textSecondary mb-0">No reports in this period.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card rounded="lg" elevation="10" class="mt-4">
        <v-card-item><v-card-title>Critical issues still open</v-card-title></v-card-item>
        <v-data-table :headers="openHeaders" :items="data.critical_open" density="compact" hide-default-footer :items-per-page="-1">
          <template #item.created_at="{ item }">{{ fmtDate(item.created_at) }}</template>
          <template #item.status="{ item }"><span class="text-capitalize">{{ item.status.replace('_', ' ') }}</span></template>
          <template #item.assignee="{ item }">{{ item.assignee || 'Unassigned' }}</template>
          <template #no-data><div class="pa-4 text-center textSecondary">No critical issues open.</div></template>
        </v-data-table>
      </v-card>

      <v-row class="mt-1">
        <v-col cols="12" lg="7">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item><v-card-title>Oldest open issues</v-card-title></v-card-item>
            <v-data-table :headers="openHeaders" :items="data.oldest_open" density="compact" hide-default-footer :items-per-page="-1">
              <template #item.created_at="{ item }">{{ fmtDate(item.created_at) }}</template>
              <template #item.status="{ item }"><span class="text-capitalize">{{ item.status.replace('_', ' ') }}</span></template>
              <template #item.assignee="{ item }">{{ item.assignee || 'Unassigned' }}</template>
              <template #no-data><div class="pa-4 text-center textSecondary">Nothing open.</div></template>
            </v-data-table>
          </v-card>
        </v-col>
        <v-col cols="12" lg="5">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item><v-card-title>Workload by assignee</v-card-title></v-card-item>
            <v-table density="compact">
              <thead><tr><th>Assignee</th><th class="text-end">Open</th><th class="text-end">Sorted in period</th></tr></thead>
              <tbody>
                <tr v-for="w in data.workload" :key="w.user_id"><td>{{ w.name || '—' }}</td><td class="text-end">{{ w.open }}</td><td class="text-end">{{ w.sorted_in_period }}</td></tr>
                <tr v-if="!data.workload.length"><td colspan="3" class="text-center textSecondary pa-4">No assigned issues.</td></tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<style scoped>
.series-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; flex: none; }
</style>
