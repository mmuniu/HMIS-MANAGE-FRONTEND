<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useDeploymentsStore } from '@/stores/deployments'
import { APPROVAL_STATUS_COLOR } from '@/types/deployment'

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

const plan = computed(() => store.current?.work_plan || null)
// Most recent by id — a rejected approval can be followed by a fresh
// PENDING re-request, and that newer row is the one that should drive the UI.
const workOrderApproval = computed(() => {
  const matches = store.current?.approvals.filter((a) => a.approval_type === 'work_order') || []
  return matches.length ? matches.reduce((latest, a) => (a.id > latest.id ? a : latest)) : null
})

const form = reactive({
  scope: '',
  facilities_included: '' as string, // comma-separated in the UI, array on the wire
  modules_included: '' as string,
  requires_migration: false,
  integration_requirements: '',
  training_plan: '',
  target_start_date: '',
  target_go_live_date: '',
  hypercare_period_days: null as number | null,
  stabilization_period_days: null as number | null,
})

watch(plan, (p) => {
  form.scope = p?.scope || ''
  form.facilities_included = (p?.facilities_included || []).join(', ')
  form.modules_included = (p?.modules_included || []).join(', ')
  form.requires_migration = p?.requires_migration || false
  form.integration_requirements = p?.integration_requirements || ''
  form.training_plan = p?.training_plan || ''
  form.target_start_date = p?.target_start_date || ''
  form.target_go_live_date = p?.target_go_live_date || ''
  form.hypercare_period_days = p?.hypercare_period_days ?? null
  form.stabilization_period_days = p?.stabilization_period_days ?? null
}, { immediate: true })

const saving = ref(false)

function splitList(value: string): string[] | undefined {
  const items = value.split(',').map((v) => v.trim()).filter(Boolean)
  return items.length ? items : undefined
}

async function savePlan() {
  saving.value = true
  await store.upsertWorkPlan(props.deploymentId, {
    scope: form.scope || undefined,
    facilities_included: splitList(form.facilities_included),
    modules_included: splitList(form.modules_included),
    requires_migration: form.requires_migration,
    integration_requirements: form.integration_requirements || undefined,
    training_plan: form.training_plan || undefined,
    target_start_date: form.target_start_date || undefined,
    target_go_live_date: form.target_go_live_date || undefined,
    hypercare_period_days: form.hypercare_period_days ?? undefined,
    stabilization_period_days: form.stabilization_period_days ?? undefined,
  })
  saving.value = false
}

const requesting = ref(false)

async function requestApproval() {
  requesting.value = true
  await store.requestApproval(props.deploymentId, { approval_type: 'work_order', stage_number: 5 })
  requesting.value = false
}

const deciding = ref(false)
const rejectReason = ref('')
const showRejectField = ref(false)

async function approve() {
  if (!workOrderApproval.value) return
  deciding.value = true
  await store.decideApproval(props.deploymentId, workOrderApproval.value.id, { decision: 'approved' })
  deciding.value = false
}

async function reject() {
  if (!workOrderApproval.value || !rejectReason.value.trim()) return
  deciding.value = true
  const res = await store.decideApproval(props.deploymentId, workOrderApproval.value.id, {
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
  <v-dialog v-model="localShow" max-width="720px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Work Plan & Work Order Approval
        <v-btn icon="mdi-close" variant="text" size="small" @click="localShow = false" />
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 70vh">
        <v-textarea v-model="form.scope" label="Scope" density="compact" variant="outlined" rows="2" class="mb-2" />
        <v-text-field v-model="form.facilities_included" label="Facilities included (comma-separated)" density="compact" variant="outlined" class="mb-2" />
        <v-text-field v-model="form.modules_included" label="Modules included (comma-separated)" density="compact" variant="outlined" class="mb-2" />
        <v-switch v-model="form.requires_migration" label="Requires data migration" density="compact" color="primary" class="mb-2" />
        <v-textarea v-model="form.integration_requirements" label="Integration requirements" density="compact" variant="outlined" rows="2" class="mb-2" />
        <v-textarea v-model="form.training_plan" label="Training plan" density="compact" variant="outlined" rows="2" class="mb-2" />
        <div class="d-flex flex-wrap ga-2 mb-2">
          <v-text-field v-model="form.target_start_date" type="date" label="Target start date" density="compact" variant="outlined" style="max-width: 200px" />
          <v-text-field v-model="form.target_go_live_date" type="date" label="Target go-live date" density="compact" variant="outlined" style="max-width: 200px" />
          <v-text-field v-model.number="form.hypercare_period_days" type="number" label="Hypercare (days)" density="compact" variant="outlined" style="max-width: 160px" />
          <v-text-field v-model.number="form.stabilization_period_days" type="number" label="Stabilization (days)" density="compact" variant="outlined" style="max-width: 160px" />
        </div>

        <v-btn color="primary" variant="tonal" :loading="saving" class="mb-4" @click="savePlan">
          Save work plan
        </v-btn>

        <v-divider class="mb-4" />

        <h4 class="text-subtitle-1 font-weight-medium mb-2">Work order approval</h4>

        <div v-if="!plan">
          <p class="text-body-2 textSecondary">Save a work plan before requesting approval.</p>
        </div>
        <div v-else-if="!workOrderApproval">
          <v-btn color="primary" variant="tonal" :loading="requesting" @click="requestApproval">
            Request approval
          </v-btn>
        </div>
        <div v-else>
          <v-chip size="small" variant="tonal" label class="mb-2" :color="APPROVAL_STATUS_COLOR[workOrderApproval.status]">
            {{ workOrderApproval.status }}
          </v-chip>
          <p v-if="workOrderApproval.rejection_reason" class="text-body-2 mb-2">
            Rejection reason: {{ workOrderApproval.rejection_reason }}
          </p>

          <div v-if="workOrderApproval.status === 'PENDING'" class="d-flex flex-wrap ga-2 align-center">
            <v-btn color="success" variant="tonal" :loading="deciding" @click="approve">Approve</v-btn>
            <v-btn color="error" variant="tonal" :disabled="deciding" @click="showRejectField = !showRejectField">Reject</v-btn>
          </div>
          <div v-if="showRejectField" class="d-flex ga-2 align-center mt-2">
            <v-text-field v-model="rejectReason" label="Rejection reason" density="compact" variant="outlined" hide-details style="max-width: 320px" />
            <v-btn color="error" variant="tonal" :loading="deciding" :disabled="!rejectReason.trim()" @click="reject">Confirm reject</v-btn>
          </div>

          <div v-if="workOrderApproval.status === 'REJECTED'" class="mt-2">
            <v-btn color="primary" variant="tonal" :loading="requesting" @click="requestApproval">
              Request approval again
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
