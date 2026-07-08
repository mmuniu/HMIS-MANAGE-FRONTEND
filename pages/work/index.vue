<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportsApi } from '@/composables/useReportsApi'
import { useAuthStore } from '@/stores/auth'
import type { ReportSummary } from '~/types/report'

const api = useReportsApi()
const router = useRouter()
const auth = useAuthStore()

const items = ref<ReportSummary[]>([])
const loading = ref(false)
const scope = ref<'all' | 'mine'>('mine')

const STATUS_COLORS: Record<string, string> = {
  new: 'info', under_review: 'secondary', assigned: 'primary',
  in_progress: 'warning', resolved: 'success', delivered: 'success', closed: 'grey',
}

async function load() {
  loading.value = true
  try {
    const res = await api.work()
    items.value = res.data
    scope.value = res.meta?.scope ?? 'mine'
  } finally {
    loading.value = false
  }
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
]

onMounted(load)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">Bugs &amp; Features</h2>
        <p class="textSecondary mb-0">
          {{ scope === 'all'
            ? 'All bugs and features assigned across the team.'
            : 'Bugs and features assigned to you to work on.' }}
        </p>
      </div>
      <v-chip v-if="items.length" :color="scope === 'all' ? 'primary' : 'secondary'" variant="tonal" label>
        {{ items.length }} active
      </v-chip>
    </div>

    <v-card rounded="lg" elevation="10">
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        density="comfortable"
        hover
        @click:row="(_e: any, { item }: any) => router.push(`/feedback-admin/${item.ticket_id}`)"
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
