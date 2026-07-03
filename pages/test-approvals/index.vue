<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTestCasesApi } from '@/composables/useTestCasesApi'
import { useNuxtApp } from '#app'

interface PendingCase {
  id: number
  case_id: string
  title: string
  module_name: string
  module_code: string | null
  suite_slug: string | null
  suite_role: string | null
  created_at: string | null
}

const api = useTestCasesApi()
const router = useRouter()
const { $showToast } = useNuxtApp()

const items = ref<PendingCase[]>([])
const loading = ref(false)
const acting = ref<number | null>(null)

async function load() {
  loading.value = true
  try {
    items.value = await api.pendingCases()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to load pending cases.')
  } finally {
    loading.value = false
  }
}

async function decide(c: PendingCase, action: 'approve' | 'reject') {
  acting.value = c.id
  try {
    if (action === 'approve') await api.approveCase(c.id)
    else await api.rejectCase(c.id)
    items.value = items.value.filter((x) => x.id !== c.id)
    $showToast(`${action === 'approve' ? 'Approved' : 'Rejected'} ${c.case_id}.`)
  } catch (e: any) {
    $showToast(e?.response?.data?.message || `Failed to ${action}.`)
  } finally {
    acting.value = null
  }
}

function fmt(iso: string | null) {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

const headers = [
  { title: 'Case ID', key: 'case_id', sortable: false },
  { title: 'Title', key: 'title', sortable: false },
  { title: 'Module', key: 'module_name', sortable: false },
  { title: 'Suite', key: 'suite_role', sortable: false },
  { title: 'Submitted', key: 'created_at', sortable: false },
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
]

onMounted(load)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">Test Case Approvals</h2>
        <p class="textSecondary">Review and approve new test cases before they go live to testers.</p>
      </div>
      <v-chip v-if="items.length" color="warning" variant="tonal" label>{{ items.length }} awaiting</v-chip>
    </div>

    <v-card rounded="lg" elevation="10">
      <v-data-table :headers="headers" :items="items" :loading="loading" density="comfortable">
        <template #item.case_id="{ item }"><span class="font-weight-medium">{{ item.case_id }}</span></template>
        <template #item.module_name="{ item }">
          {{ item.module_name }}<span v-if="item.module_code" class="textSecondary text-caption"> ({{ item.module_code }})</span>
        </template>
        <template #item.suite_role="{ item }">
          <a v-if="item.suite_slug" class="text-primary text-decoration-none" href="#"
            @click.prevent="router.push(`/test-cases/${item.suite_slug}`)">{{ item.suite_role }}</a>
          <span v-else>—</span>
        </template>
        <template #item.created_at="{ item }">{{ fmt(item.created_at) }}</template>
        <template #item.actions="{ item }">
          <v-btn color="success" size="small" variant="flat" prepend-icon="mdi-check-bold"
            :loading="acting === item.id" class="mr-2" @click="decide(item, 'approve')">Approve</v-btn>
          <v-btn color="error" size="small" variant="tonal" prepend-icon="mdi-close-thick"
            :loading="acting === item.id" @click="decide(item, 'reject')">Reject</v-btn>
        </template>
        <template #no-data>
          <div class="pa-10 text-center">
            <v-avatar color="success" variant="tonal" size="64" class="mb-3"><v-icon icon="mdi-check-all" size="34" /></v-avatar>
            <h3 class="text-h6 mb-1">All caught up</h3>
            <p class="textSecondary">No test cases are waiting for approval.</p>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style scoped>
.ga-3 { gap: 12px; }
</style>
