<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useDeploymentsStore } from '@/stores/deployments'
import { useUsersApi } from '@/composables/useUsersApi'
import {
  APPROVAL_STATUS_COLOR,
  CHECKLIST_ITEM_STATUS_COLOR,
  CONFIGURATION_STATUS_COLOR,
  INFORMATION_STATUS_COLOR,
  MIGRATION_STATUS_COLOR,
  MIGRATION_STATUS_LABEL,
  PROVISIONING_STATUS_COLOR,
  PROVISIONING_STATUS_LABEL,
  READINESS_STATUS_COLOR,
  READINESS_STATUS_LABEL,
  STAGE_GO_LIVE_NUMBER,
  TRAINING_STATUS_COLOR,
  UAT_STATUS_COLOR,
} from '@/types/deployment'
import type { ChecklistItemStatus } from '@/types/deployment'
import type { PlatformUser } from '@/types/user'

interface Props {
  show: boolean
  deploymentId: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:show'])

const store = useDeploymentsStore()
const usersApi = useUsersApi()

const localShow = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const d = computed(() => store.current)

// ---- Readiness dashboard — read-only re-display of statuses already
// computed by earlier stages, so a human approver can see everything in
// one place before deciding. Not a second gate: the sequential gate
// already required all of these before Stage 11 was reachable. ----
const dashboard = computed(() => {
  if (!d.value) return []
  return [
    { label: 'Facility readiness', status: d.value.readiness_status.status, color: READINESS_STATUS_COLOR[d.value.readiness_status.status], text: READINESS_STATUS_LABEL[d.value.readiness_status.status] },
    { label: 'Client kickoff', status: d.value.information_status.status, color: INFORMATION_STATUS_COLOR[d.value.information_status.status], text: d.value.information_status.status },
    { label: 'Provisioning', status: d.value.provisioning_status?.status || 'NOT_STARTED', color: d.value.provisioning_status ? PROVISIONING_STATUS_COLOR[d.value.provisioning_status.status] : 'grey', text: d.value.provisioning_status ? PROVISIONING_STATUS_LABEL[d.value.provisioning_status.status] : 'Not started' },
    { label: 'Migration', status: d.value.migration_status.status, color: MIGRATION_STATUS_COLOR[d.value.migration_status.status], text: MIGRATION_STATUS_LABEL[d.value.migration_status.status] },
    { label: 'System configuration', status: d.value.configuration_status.status, color: CONFIGURATION_STATUS_COLOR[d.value.configuration_status.status], text: d.value.configuration_status.status },
    { label: 'Training', status: d.value.training_status.status, color: TRAINING_STATUS_COLOR[d.value.training_status.status], text: d.value.training_status.status },
    { label: 'UAT', status: d.value.uat_status.status, color: UAT_STATUS_COLOR[d.value.uat_status.status], text: d.value.uat_status.status },
    { label: 'Support contacts', status: d.value.go_live_status.has_support_contacts ? 'COMPLETE' : 'INCOMPLETE', color: d.value.go_live_status.has_support_contacts ? 'success' : 'warning', text: d.value.go_live_status.has_support_contacts ? 'Assigned' : 'Not assigned' },
  ]
})

// ---- The 4 go-live-specific checklist items this stage actually owns ----
const items = computed(() => d.value?.checklist_items.filter((i) => i.stage_number === STAGE_GO_LIVE_NUMBER) || [])
const savingItemId = ref<number | null>(null)

async function setItemStatus(itemId: number, status: ChecklistItemStatus) {
  savingItemId.value = itemId
  await store.updateChecklistItem(props.deploymentId, itemId, { status })
  savingItemId.value = null
}

// ---- Go-live timing ----
const form = reactive({
  planned_go_live_date: '',
  actual_go_live_date: '',
  go_live_window: '',
  go_live_owner_id: null as number | null,
  notes: '',
})

watch(() => d.value?.go_live, (g) => {
  form.planned_go_live_date = g?.planned_go_live_date || ''
  form.actual_go_live_date = g?.actual_go_live_date || ''
  form.go_live_window = g?.go_live_window || ''
  form.go_live_owner_id = g?.go_live_owner_id ?? null
  form.notes = g?.notes || ''
}, { immediate: true })

const ownerSearch = ref('')
const ownerOptions = ref<PlatformUser[]>([])
const searchingOwners = ref(false)

watch(ownerSearch, async (query) => {
  searchingOwners.value = true
  try {
    const res = await usersApi.list({ search: query || undefined, per_page: 10 })
    ownerOptions.value = res.data
  } finally {
    searchingOwners.value = false
  }
})

const saving = ref(false)

async function saveTiming() {
  saving.value = true
  await store.upsertGoLive(props.deploymentId, {
    planned_go_live_date: form.planned_go_live_date || undefined,
    actual_go_live_date: form.actual_go_live_date || undefined,
    go_live_window: form.go_live_window || undefined,
    go_live_owner_id: form.go_live_owner_id ?? undefined,
    notes: form.notes || undefined,
  })
  saving.value = false
}

// ---- Go-live approval — same request/approve/reject shape as
// WorkPlanDialog's/UatDialog's approval sections, parameterized to
// approval_type: 'go_live'. ----
const goLiveApproval = computed(() => {
  const matches = store.current?.approvals.filter((a) => a.approval_type === 'go_live') || []
  return matches.length ? matches.reduce((latest, a) => (a.id > latest.id ? a : latest)) : null
})

const requesting = ref(false)

async function requestGoLiveApproval() {
  requesting.value = true
  await store.requestApproval(props.deploymentId, { approval_type: 'go_live', stage_number: STAGE_GO_LIVE_NUMBER })
  requesting.value = false
}

const deciding = ref(false)
const rejectReason = ref('')
const showRejectField = ref(false)

async function approve() {
  if (!goLiveApproval.value) return
  deciding.value = true
  await store.decideApproval(props.deploymentId, goLiveApproval.value.id, { decision: 'approved' })
  deciding.value = false
}

async function reject() {
  if (!goLiveApproval.value || !rejectReason.value.trim()) return
  deciding.value = true
  const res = await store.decideApproval(props.deploymentId, goLiveApproval.value.id, {
    decision: 'rejected',
    rejection_reason: rejectReason.value,
  })
  if (res.success) {
    rejectReason.value = ''
    showRejectField.value = false
  }
  deciding.value = false
}
</script>

<template>
  <v-dialog v-model="localShow" max-width="760px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Go-Live
        <v-btn icon="mdi-close" variant="text" size="small" @click="localShow = false" />
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 70vh">
        <h4 class="text-subtitle-1 font-weight-medium mb-2">Readiness dashboard</h4>
        <div class="d-flex flex-wrap ga-2 mb-4">
          <v-chip v-for="row in dashboard" :key="row.label" size="small" variant="tonal" label :color="row.color">
            {{ row.label }}: {{ row.text }}
          </v-chip>
        </div>

        <v-divider class="mb-4" />

        <h4 class="text-subtitle-1 font-weight-medium mb-2">Go-live checklist</h4>
        <div v-for="item in items" :key="item.id" class="d-flex flex-wrap align-center ga-3 mb-2">
          <div style="min-width: 200px; flex: 1 1 200px">{{ item.label }}</div>
          <v-chip size="x-small" variant="tonal" label :color="CHECKLIST_ITEM_STATUS_COLOR[item.status]">{{ item.status.replace('_', ' ') }}</v-chip>
          <v-select
            :model-value="null"
            :items="['PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'NOT_APPLICABLE', 'BLOCKED']"
            label="Set status" density="compact" variant="outlined" hide-details style="max-width: 170px"
            @update:model-value="(v) => v && setItemStatus(item.id, v)"
          />
          <v-progress-circular v-if="savingItemId === item.id" indeterminate size="20" width="2" color="primary" />
        </div>

        <v-divider class="my-4" />

        <h4 class="text-subtitle-1 font-weight-medium mb-2">Go-live timing</h4>
        <div class="d-flex flex-wrap ga-2 mb-2">
          <v-text-field v-model="form.planned_go_live_date" type="date" label="Planned date" density="compact" variant="outlined" style="max-width: 190px" />
          <v-text-field v-model="form.actual_go_live_date" type="date" label="Actual date" density="compact" variant="outlined" style="max-width: 190px" />
          <v-text-field v-model="form.go_live_window" label="Window (e.g. 22:00-02:00)" density="compact" variant="outlined" style="max-width: 220px" />
        </div>
        <v-autocomplete
          v-model="form.go_live_owner_id"
          v-model:search="ownerSearch"
          :items="ownerOptions"
          :loading="searchingOwners"
          item-title="name" item-value="id"
          label="Go-live owner (search users)" density="compact" variant="outlined" class="mb-2"
          no-filter clearable
        />
        <v-textarea v-model="form.notes" label="Notes" density="compact" variant="outlined" rows="2" class="mb-2" />
        <v-btn color="primary" variant="tonal" :loading="saving" class="mb-4" @click="saveTiming">
          Save go-live timing
        </v-btn>

        <v-divider class="mb-4" />

        <h4 class="text-subtitle-1 font-weight-medium mb-2">Go-live approval</h4>
        <div v-if="!goLiveApproval">
          <v-btn color="primary" variant="tonal" :loading="requesting" @click="requestGoLiveApproval">
            Request approval
          </v-btn>
        </div>
        <div v-else>
          <v-chip size="small" variant="tonal" label class="mb-2" :color="APPROVAL_STATUS_COLOR[goLiveApproval.status]">
            {{ goLiveApproval.status }}
          </v-chip>
          <p v-if="goLiveApproval.rejection_reason" class="text-body-2 mb-2">
            Rejection reason: {{ goLiveApproval.rejection_reason }}
          </p>

          <div v-if="goLiveApproval.status === 'PENDING'" class="d-flex flex-wrap ga-2 align-center">
            <v-btn color="success" variant="tonal" :loading="deciding" @click="approve">Approve</v-btn>
            <v-btn color="error" variant="tonal" :disabled="deciding" @click="showRejectField = !showRejectField">Reject</v-btn>
          </div>
          <div v-if="showRejectField" class="d-flex ga-2 align-center mt-2">
            <v-text-field v-model="rejectReason" label="Rejection reason" density="compact" variant="outlined" hide-details style="max-width: 320px" />
            <v-btn color="error" variant="tonal" :loading="deciding" :disabled="!rejectReason.trim()" @click="reject">Confirm reject</v-btn>
          </div>

          <div v-if="goLiveApproval.status === 'REJECTED'" class="mt-2">
            <v-btn color="primary" variant="tonal" :loading="requesting" @click="requestGoLiveApproval">
              Request approval again
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
