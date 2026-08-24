<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useDeploymentsStore } from '@/stores/deployments'
import { APPROVAL_STATUS_COLOR, STAGE_HANDOVER_NUMBER } from '@/types/deployment'
import type { DeploymentApprovalEntry } from '@/types/deployment'

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

const pkg = computed(() => store.current?.handover_package || null)

// ---- Three back-to-back review/acceptance steps — same request/approve/
// reject shape used throughout this lifecycle, driven by a small table
// instead of three copies of the same block. ----
const REVIEW_STEPS = [
  { type: 'support_review', label: 'Support review' },
  { type: 'customer_service_review', label: 'Customer service review' },
  { type: 'handover_acceptance', label: 'Handover acceptance' },
] as const

function latestApproval(type: string): DeploymentApprovalEntry | null {
  const matches = store.current?.approvals.filter((a) => a.approval_type === type) || []
  return matches.length ? matches.reduce((latest, a) => (a.id > latest.id ? a : latest)) : null
}

const requesting = reactive<Record<string, boolean>>({})
const deciding = reactive<Record<string, boolean>>({})
const rejectReason = reactive<Record<string, string>>({})
const showRejectField = reactive<Record<string, boolean>>({})

async function requestStep(type: string) {
  requesting[type] = true
  await store.requestApproval(props.deploymentId, { approval_type: type, stage_number: STAGE_HANDOVER_NUMBER })
  requesting[type] = false
}

async function approveStep(type: string) {
  const approval = latestApproval(type)
  if (!approval) return
  deciding[type] = true
  await store.decideApproval(props.deploymentId, approval.id, { decision: 'approved' })
  deciding[type] = false
}

async function rejectStep(type: string) {
  const approval = latestApproval(type)
  if (!approval || !rejectReason[type]?.trim()) return
  deciding[type] = true
  const res = await store.decideApproval(props.deploymentId, approval.id, {
    decision: 'rejected',
    rejection_reason: rejectReason[type],
  })
  if (res.success) {
    rejectReason[type] = ''
    showRejectField[type] = false
  }
  deciding[type] = false
}
</script>

<template>
  <v-dialog v-model="localShow" max-width="720px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Handover
        <v-btn icon="mdi-close" variant="text" size="small" @click="localShow = false" />
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 70vh">
        <h4 class="text-subtitle-1 font-weight-medium mb-2">Handover package</h4>
        <div v-if="pkg" class="mb-4">
          <table class="text-body-2">
            <tbody>
              <tr><td class="pr-4 textSecondary">Organization</td><td>{{ pkg.organization_name || '—' }}</td></tr>
              <tr><td class="pr-4 textSecondary">Facility</td><td>{{ pkg.facility_name || '—' }}</td></tr>
              <tr><td class="pr-4 textSecondary">Modules</td><td>{{ pkg.modules_included?.join(', ') || '—' }}</td></tr>
              <tr><td class="pr-4 textSecondary">Users</td><td>{{ pkg.user_summary.total_assignments }} assignment(s){{ pkg.user_summary.has_hospital_admin ? '' : ' — no hospital admin' }}</td></tr>
              <tr><td class="pr-4 textSecondary">Migration</td><td>{{ pkg.migration_status }}</td></tr>
              <tr><td class="pr-4 textSecondary">Incidents</td><td>{{ pkg.resolved_incidents }} resolved, {{ pkg.open_incidents }} open</td></tr>
              <tr><td class="pr-4 textSecondary">Documents</td><td>{{ pkg.documents_resolved }} / {{ pkg.documents_total }} resolved</td></tr>
              <tr><td class="pr-4 textSecondary">Support period</td><td>Hypercare {{ pkg.hypercare_period_days ?? '—' }}d, stabilization {{ pkg.stabilization_period_days ?? '—' }}d</td></tr>
              <tr><td class="pr-4 textSecondary">Go-live date</td><td>{{ pkg.actual_go_live_date || '—' }}</td></tr>
            </tbody>
          </table>
        </div>

        <v-divider class="mb-4" />

        <div v-for="step in REVIEW_STEPS" :key="step.type" class="mb-4">
          <h4 class="text-subtitle-1 font-weight-medium mb-2">{{ step.label }}</h4>
          <div v-if="!latestApproval(step.type)">
            <v-btn color="primary" variant="tonal" :loading="requesting[step.type]" @click="requestStep(step.type)">
              Request
            </v-btn>
          </div>
          <div v-else>
            <v-chip size="small" variant="tonal" label class="mb-2" :color="APPROVAL_STATUS_COLOR[latestApproval(step.type)?.status]">
              {{ latestApproval(step.type)?.status }}
            </v-chip>
            <p v-if="latestApproval(step.type)?.rejection_reason" class="text-body-2 mb-2">
              Rejection reason: {{ latestApproval(step.type)?.rejection_reason }}
            </p>

            <div v-if="latestApproval(step.type)?.status === 'PENDING'" class="d-flex flex-wrap ga-2 align-center">
              <v-btn color="success" variant="tonal" :loading="deciding[step.type]" @click="approveStep(step.type)">Approve</v-btn>
              <v-btn color="error" variant="tonal" :disabled="deciding[step.type]" @click="showRejectField[step.type] = !showRejectField[step.type]">Reject</v-btn>
            </div>
            <div v-if="showRejectField[step.type]" class="d-flex ga-2 align-center mt-2">
              <v-text-field v-model="rejectReason[step.type]" label="Rejection reason" density="compact" variant="outlined" hide-details style="max-width: 320px" />
              <v-btn color="error" variant="tonal" :loading="deciding[step.type]" :disabled="!rejectReason[step.type]?.trim()" @click="rejectStep(step.type)">Confirm reject</v-btn>
            </div>

            <div v-if="latestApproval(step.type)?.status === 'REJECTED'" class="mt-2">
              <v-btn color="primary" variant="tonal" :loading="requesting[step.type]" @click="requestStep(step.type)">
                Request again
              </v-btn>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
