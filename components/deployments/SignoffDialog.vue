<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useDeploymentsStore } from '@/stores/deployments'
import { APPROVAL_STATUS_COLOR, STAGE_SIGNOFF_NUMBER } from '@/types/deployment'

interface Props {
  show: boolean
  deploymentId: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:show'])

const store = useDeploymentsStore()

const localShow = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const status = computed(() => store.current?.signoff_status || null)

const dashboard = computed(() => {
  const s = status.value
  if (!s) return []
  return [
    { label: 'Go-live', done: s.go_live_completed },
    { label: 'Hypercare', done: s.hypercare_completed },
    { label: 'Stabilization', done: s.stabilization_completed },
    { label: 'Documents resolved', done: s.documents_status === 'COMPLETE' },
    { label: 'Zero open critical incidents', done: s.open_critical_incidents === 0 },
  ]
})

const form = reactive({
  comments: '',
  outstanding_items: '',
  evidence_notes: '',
})

watch(() => store.current?.signoff, (s) => {
  form.comments = s?.comments || ''
  form.outstanding_items = s?.outstanding_items || ''
  form.evidence_notes = s?.evidence_notes || ''
}, { immediate: true })

const saving = ref(false)

async function saveSignoff() {
  saving.value = true
  await store.upsertSignoff(props.deploymentId, {
    comments: form.comments || undefined,
    outstanding_items: form.outstanding_items || undefined,
    evidence_notes: form.evidence_notes || undefined,
  })
  saving.value = false
}

// ---- Completion sign-off approval — same request/approve/reject shape
// used throughout this lifecycle, parameterized to 'completion_signoff'. ----
const signoffApproval = computed(() => {
  const matches = store.current?.approvals.filter((a) => a.approval_type === 'completion_signoff') || []
  return matches.length ? matches.reduce((latest, a) => (a.id > latest.id ? a : latest)) : null
})

const requesting = ref(false)

async function requestSignoffApproval() {
  requesting.value = true
  await store.requestApproval(props.deploymentId, { approval_type: 'completion_signoff', stage_number: STAGE_SIGNOFF_NUMBER })
  requesting.value = false
}

const deciding = ref(false)
const rejectReason = ref('')
const showRejectField = ref(false)

async function approve() {
  if (!signoffApproval.value) return
  deciding.value = true
  await store.decideApproval(props.deploymentId, signoffApproval.value.id, { decision: 'approved' })
  deciding.value = false
}

async function reject() {
  if (!signoffApproval.value || !rejectReason.value.trim()) return
  deciding.value = true
  const res = await store.decideApproval(props.deploymentId, signoffApproval.value.id, {
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
  <v-dialog v-model="localShow" max-width="680px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Completion Sign-off
        <v-btn icon="mdi-close" variant="text" size="small" @click="localShow = false" />
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 70vh">
        <h4 class="text-subtitle-1 font-weight-medium mb-2">Conditions</h4>
        <div class="d-flex flex-wrap ga-2 mb-4">
          <v-chip v-for="row in dashboard" :key="row.label" size="small" variant="tonal" label :color="row.done ? 'success' : 'warning'">
            <v-icon :icon="row.done ? 'mdi-check' : 'mdi-close'" size="14" class="mr-1" />
            {{ row.label }}
          </v-chip>
        </div>

        <v-divider class="mb-4" />

        <h4 class="text-subtitle-1 font-weight-medium mb-2">Sign-off record</h4>
        <v-textarea v-model="form.comments" label="Comments" density="compact" variant="outlined" rows="2" class="mb-2" />
        <v-textarea v-model="form.outstanding_items" label="Outstanding non-critical items" density="compact" variant="outlined" rows="2" class="mb-2" />
        <v-textarea v-model="form.evidence_notes" label="Evidence/attachments (references or links)" density="compact" variant="outlined" rows="2" class="mb-2" />
        <v-btn color="primary" variant="tonal" :loading="saving" class="mb-4" @click="saveSignoff">
          Save sign-off record
        </v-btn>

        <v-divider class="mb-4" />

        <h4 class="text-subtitle-1 font-weight-medium mb-2">Customer acceptance</h4>
        <div v-if="!signoffApproval">
          <v-btn color="primary" variant="tonal" :loading="requesting" @click="requestSignoffApproval">
            Request approval
          </v-btn>
        </div>
        <div v-else>
          <v-chip size="small" variant="tonal" label class="mb-2" :color="APPROVAL_STATUS_COLOR[signoffApproval.status]">
            {{ signoffApproval.status }}
          </v-chip>
          <p v-if="signoffApproval.rejection_reason" class="text-body-2 mb-2">
            Rejection reason: {{ signoffApproval.rejection_reason }}
          </p>

          <div v-if="signoffApproval.status === 'PENDING'" class="d-flex flex-wrap ga-2 align-center">
            <v-btn color="success" variant="tonal" :loading="deciding" @click="approve">Approve</v-btn>
            <v-btn color="error" variant="tonal" :disabled="deciding" @click="showRejectField = !showRejectField">Reject</v-btn>
          </div>
          <div v-if="showRejectField" class="d-flex ga-2 align-center mt-2">
            <v-text-field v-model="rejectReason" label="Rejection reason" density="compact" variant="outlined" hide-details style="max-width: 320px" />
            <v-btn color="error" variant="tonal" :loading="deciding" :disabled="!rejectReason.trim()" @click="reject">Confirm reject</v-btn>
          </div>

          <div v-if="signoffApproval.status === 'REJECTED'" class="mt-2">
            <v-btn color="primary" variant="tonal" :loading="requesting" @click="requestSignoffApproval">
              Request approval again
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
