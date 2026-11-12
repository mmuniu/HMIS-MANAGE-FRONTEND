<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useRootAdminApi, type AuditEvent } from '@/composables/useRootAdminApi'
import { describeAction, fmtDateTime, roleTitle } from './format'

const api = useRootAdminApi()
const { $showToast } = useNuxtApp()

const items = ref<AuditEvent[]>([])
const total = ref(0)
const loading = ref(false)
const exporting = ref(false)
const error = ref<string | null>(null)

const page = ref(1)
const perPage = ref(50)
const action = ref<string | null>(null)
const from = ref('')
const to = ref('')

const actionFilters = [
  { value: 'admin.', title: 'Admin changes' },
  { value: 'auth.login', title: 'Admin sign-ins' },
  { value: 'http.', title: 'Other admin writes' },
]

const headers = [
  { title: 'Time', key: 'created_at', sortable: false },
  { title: 'Admin', key: 'actor', sortable: false },
  { title: 'Action', key: 'action', sortable: false },
  { title: 'Target', key: 'target', sortable: false },
  { title: 'Reason', key: 'reason', sortable: false },
  { title: '', key: 'data-table-expand', sortable: false },
]

function filters() {
  return { action: action.value || undefined, from: from.value || undefined, to: to.value || undefined }
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await api.audit({ page: page.value, per_page: perPage.value, ...filters() })
    items.value = res.data
    total.value = res.meta.total
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Could not load the audit log.'
  } finally {
    loading.value = false
  }
}

function onTableUpdate(opts: { page: number; itemsPerPage: number }) {
  page.value = opts.page
  perPage.value = opts.itemsPerPage
  load()
}

function refilter() {
  page.value = 1
  load()
}

async function exportCsv() {
  exporting.value = true
  try {
    await api.exportAudit(filters())
  } catch {
    $showToast('Could not export the audit log.')
  } finally {
    exporting.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />

    <v-card rounded="lg" elevation="10" class="mb-4">
      <v-card-text class="d-flex flex-wrap ga-3 align-center">
        <v-select v-model="action" :items="actionFilters" label="What" variant="outlined" density="comfortable"
          hide-details clearable style="max-width:220px; min-width:180px" @update:model-value="refilter" />
        <v-text-field v-model="from" type="date" label="From" variant="outlined" density="comfortable" hide-details style="max-width:180px" @change="refilter" />
        <v-text-field v-model="to" type="date" label="To" variant="outlined" density="comfortable" hide-details style="max-width:180px" @change="refilter" />
        <v-spacer />
        <v-btn variant="tonal" color="primary" prepend-icon="mdi-download" :loading="exporting" @click="exportCsv">Export CSV</v-btn>
      </v-card-text>
    </v-card>

    <v-card rounded="lg" elevation="10">
      <v-data-table-server :headers="headers" :items="items" :items-length="total" :loading="loading"
        :items-per-page="perPage" :page="page" :items-per-page-options="[25, 50, 100]" item-value="id" show-expand
        @update:options="onTableUpdate">
        <template #item.created_at="{ item }"><span class="text-no-wrap">{{ fmtDateTime(item.created_at) }}</span></template>
        <template #item.actor="{ item }">
          <div v-if="item.actor">
            <div>{{ item.actor.name }}</div>
            <div class="text-caption textSecondary">{{ roleTitle(item.actor_role) }}</div>
          </div>
          <span v-else class="textSecondary">System</span>
        </template>
        <template #item.action="{ item }">{{ describeAction(item.action) }}</template>
        <template #item.target="{ item }">
          <span v-if="item.target_type">{{ item.target_type }} #{{ item.target_id }}</span>
          <span v-else-if="item.metadata?.route" class="text-caption">{{ item.metadata.route }}</span>
          <span v-else class="textSecondary">—</span>
        </template>
        <template #item.reason="{ item }">{{ item.reason || '—' }}</template>

        <template #expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length" class="py-3">
              <div class="text-caption textSecondary mb-1">Action code: {{ item.action }} · IP: {{ item.ip || '—' }}</div>
              <pre v-if="item.metadata" class="text-caption audit-meta">{{ JSON.stringify(item.metadata, null, 2) }}</pre>
            </td>
          </tr>
        </template>

        <template #no-data><div class="pa-8 text-center textSecondary">No audit events match these filters.</div></template>
      </v-data-table-server>
    </v-card>
  </div>
</template>

<style scoped>
.audit-meta { white-space: pre-wrap; word-break: break-word; margin: 0; }
</style>
