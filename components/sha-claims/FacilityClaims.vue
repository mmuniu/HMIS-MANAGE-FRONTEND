<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useShaClaimsApi } from '@/composables/useShaClaimsApi'
import { formatAmount, formatDateTime } from '@/utils/format'
import type { ShaClaimRow, ShaFacilitySummary, ShaStage } from '~/types/shaClaim'

/**
 * One facility's claims, loaded only once its panel is opened. Each panel
 * paginates on its own so the page's first paint stays a single request no
 * matter how many hospitals are live.
 */
const props = defineProps<{
  facility: ShaFacilitySummary
  status: string
  stage: ShaStage | ''
}>()

const api = useShaClaimsApi()
const { $showToast } = useNuxtApp()

const items = ref<ShaClaimRow[]>([])
const total = ref(0)
const page = ref(1)
const perPage = ref(25)
const loading = ref(false)

const headers = [
  { title: 'Claim reference', key: 'provider_claim_no', sortable: false },
  { title: 'SHA claim id', key: 'sha_claim_id', sortable: false },
  { title: 'Member no.', key: 'member_number', sortable: false },
  { title: 'Submitted', key: 'submitted_at', sortable: false },
  { title: 'Claimed', key: 'claim_amount', sortable: false, align: 'end' as const },
  { title: 'Approved', key: 'approved_amount', sortable: false, align: 'end' as const },
  { title: 'Paid', key: 'paid_amount', sortable: false, align: 'end' as const },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Last synced', key: 'last_synced_at', sortable: false },
]

async function load() {
  loading.value = true
  try {
    const res = await api.claims({
      facility_id: props.facility.facility_id,
      // A facility-less block is a hospital's org-wide claims, asked for by
      // organization rather than by facility.
      organization_id: props.facility.facility_id === null ? props.facility.organization_id : undefined,
      unassigned: props.facility.facility_id === null ? true : undefined,
      status: props.status,
      stage: props.stage,
      page: page.value,
      per_page: perPage.value,
    })
    items.value = res.data
    total.value = res.meta.total
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to load claims for this facility.')
  } finally {
    loading.value = false
  }
}

// A filter picked up at the top of the page restarts this table at page 1 —
// otherwise a narrower result set can leave you stranded past its last page.
watch(
  () => [props.status, props.stage],
  () => {
    page.value = 1
    load()
  },
)

// No onMounted(load) — v-data-table-server fires update:options on mount.
</script>

<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    :items-length="total"
    :items-per-page-options="[25, 50, 100]"
    :headers="headers"
    :items="items"
    :loading="loading"
    density="comfortable"
    @update:options="load"
  >
    <template #item.provider_claim_no="{ item }">
      <span class="font-weight-medium">{{ item.provider_claim_no || '—' }}</span>
      <div v-if="item.inpatient" class="text-caption textSecondary">Inpatient</div>
    </template>

    <template #item.sha_claim_id="{ item }">{{ item.sha_claim_id || '—' }}</template>
    <template #item.member_number="{ item }">{{ item.member_number || '—' }}</template>
    <template #item.submitted_at="{ item }">{{ formatDateTime(item.submitted_at) }}</template>
    <template #item.claim_amount="{ item }">{{ formatAmount(item.claim_amount) }}</template>
    <template #item.approved_amount="{ item }">{{ formatAmount(item.approved_amount) }}</template>
    <template #item.paid_amount="{ item }">{{ formatAmount(item.paid_amount) }}</template>

    <template #item.status="{ item }">
      <v-chip size="small" variant="tonal" :color="item.status_colour">{{ item.status_label }}</v-chip>
      <div v-if="item.payer_state" class="text-caption textSecondary">{{ item.payer_state }}</div>
      <div v-if="item.times_sent_back" class="text-caption text-warning">
        sent back {{ item.times_sent_back }}×
      </div>
    </template>

    <template #item.last_synced_at="{ item }">
      {{ formatDateTime(item.last_synced_at, 'Never') }}
      <v-tooltip v-if="item.last_sync_error" :text="item.last_sync_error">
        <template #activator="{ props: tip }">
          <v-icon v-bind="tip" icon="mdi-alert-circle-outline" color="error" size="16" class="ms-1" />
        </template>
      </v-tooltip>
    </template>

    <template #no-data>
      <div class="pa-6 text-center textSecondary">No claims match the current filter.</div>
    </template>
  </v-data-table-server>
</template>
