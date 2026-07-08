<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsApi } from '@/composables/useReportsApi'
import { STATUS_LABELS, STATUS_COLORS, type ReportSummary, type ReportStatus } from '@/types/report'

const router = useRouter()
const api = useReportsApi()

const items = ref<ReportSummary[]>([])
const loading = ref(false)
const error = ref('')

const headers = [
  { title: 'Ref', key: 'reference', sortable: false },
  { title: 'Type', key: 'type', sortable: false },
  { title: 'Title', key: 'title', sortable: false },
  { title: 'Module', key: 'module', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Submitted', key: 'created_at', sortable: false },
  { title: 'Updated', key: 'updated_at', sortable: false },
]

function fmt(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.listMine()
    items.value = res.data
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to load your reports.'
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">My Feedback</h2>
        <p class="textSecondary">Bugs and feature requests you've submitted.</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" to="/feedback/new">New Report</v-btn>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />

    <v-card rounded="lg" elevation="10">
      <v-data-table :headers="headers" :items="items" :loading="loading" density="comfortable" hover
        @click:row="(_e: any, { item }: any) => router.push(`/feedback/${item.ticket_id}`)">
        <template #item.reference="{ item }">
          <span class="font-weight-medium">{{ item.reference || '—' }}</span>
        </template>
        <template #item.type="{ item }">
          <v-chip :color="item.type === 'bug' ? 'error' : 'primary'" size="small" variant="tonal" label>
            <v-icon start :icon="item.type === 'bug' ? 'mdi-bug' : 'mdi-lightbulb-on'" size="14" />
            {{ item.type === 'bug' ? 'Bug' : 'Feature' }}
          </v-chip>
        </template>
        <template #item.title="{ item }"><span class="font-weight-medium">{{ item.title }}</span></template>
        <template #item.status="{ item }">
          <v-chip :color="STATUS_COLORS[item.status as ReportStatus]" size="small" variant="flat" label>
            {{ STATUS_LABELS[item.status as ReportStatus] }}
          </v-chip>
        </template>
        <template #item.created_at="{ item }">{{ fmt(item.created_at) }}</template>
        <template #item.updated_at="{ item }">{{ fmt(item.updated_at) }}</template>
        <template #no-data>
          <div class="pa-10 text-center">
            <v-avatar color="primary" variant="tonal" size="64" class="mb-3"><v-icon icon="mdi-message-text-outline" size="34" /></v-avatar>
            <h3 class="text-h6 mb-1">No reports yet</h3>
            <p class="textSecondary mb-4">When you report a bug or suggest a feature, it'll show up here.</p>
            <v-btn color="primary" prepend-icon="mdi-plus" to="/feedback/new">Send your first report</v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style scoped>
.ga-3 { gap: 12px; }
.font-mono { font-family: monospace; }
</style>
