<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDeploymentsStore } from '@/stores/deployments'
import ChecklistDialog from '@/components/deployments/ChecklistDialog.vue'
import DocumentsDialog from '@/components/deployments/DocumentsDialog.vue'
import AssignmentsDialog from '@/components/deployments/AssignmentsDialog.vue'
import WorkPlanDialog from '@/components/deployments/WorkPlanDialog.vue'
import MigrationDialog from '@/components/deployments/MigrationDialog.vue'
import TrainingDialog from '@/components/deployments/TrainingDialog.vue'
import UatDialog from '@/components/deployments/UatDialog.vue'
import GoLiveDialog from '@/components/deployments/GoLiveDialog.vue'
import HypercareDialog from '@/components/deployments/HypercareDialog.vue'
import StabilizationDialog from '@/components/deployments/StabilizationDialog.vue'
import SignoffDialog from '@/components/deployments/SignoffDialog.vue'
import HandoverDialog from '@/components/deployments/HandoverDialog.vue'
import ReviewDialog from '@/components/deployments/ReviewDialog.vue'
import CheckInsDialog from '@/components/deployments/CheckInsDialog.vue'
import {
  ASSIGNMENT_ROLE_LABEL,
  ASSIGNMENT_STATUS_COLOR,
  CONFIGURATION_STATUS_COLOR,
  DEPLOYMENT_STATUS_COLOR,
  GO_LIVE_READINESS_COLOR,
  GO_LIVE_READINESS_LABEL,
  HANDOVER_STAGE_STATUS_COLOR,
  INFORMATION_STATUS_COLOR,
  MIGRATION_STATUS_COLOR,
  MIGRATION_STATUS_LABEL,
  PERIOD_STAGE_STATUS_COLOR,
  PROVISIONING_STATUS_COLOR,
  PROVISIONING_STATUS_LABEL,
  READINESS_STATUS_COLOR,
  READINESS_STATUS_LABEL,
  REVIEW_STAGE_STATUS_COLOR,
  SIGNOFF_STAGE_STATUS_COLOR,
  STAGE_ASSIGNMENT_NUMBER,
  STAGE_CONFIGURATION_NUMBER,
  STAGE_GO_LIVE_NUMBER,
  STAGE_HANDOVER_NUMBER,
  STAGE_HYPERCARE_NUMBER,
  STAGE_INFORMATION_NUMBER,
  STAGE_MIGRATION_NUMBER,
  STAGE_PROVISIONING_NUMBER,
  STAGE_READINESS_NUMBER,
  STAGE_REVIEW_NUMBER,
  STAGE_SIGNOFF_NUMBER,
  STAGE_STABILIZATION_NUMBER,
  STAGE_STATUS_COLOR,
  STAGE_TRAINING_NUMBER,
  STAGE_UAT_NUMBER,
  STAGE_WORK_ORDER_NUMBER,
  TRAINING_STATUS_COLOR,
  UAT_STATUS_COLOR,
  WORK_ORDER_STATUS_COLOR,
  WORK_ORDER_STATUS_LABEL,
} from '@/types/deployment'

const route = useRoute()
const store = useDeploymentsStore()

const id = computed(() => String(route.params.id))
const d = computed(() => store.current)

function fmt(iso: string | null) {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

function completeStage(stageNumber: number) {
  store.completeStage(id.value, stageNumber)
}

// Explains, in Stage 6's "Mark complete" tooltip, exactly what core-service
// provisioning is still missing — so the hard gate isn't a dead end.
const provisioningGapMessage = computed(() => {
  const ps = d.value?.provisioning_status
  if (!ps || !ps.has_organization) return 'The hospital has not been registered yet.'
  const missing: string[] = []
  if (!ps.core_org_provisioned) missing.push('organization')
  if (ps.has_facility && !ps.core_facility_provisioned) missing.push('facility')
  if (!ps.core_admin_provisioned) missing.push('admin')
  return missing.length
    ? `Still waiting on core-service provisioning for: ${missing.join(', ')}.`
    : 'Provisioning is not yet complete.'
})

// Generalizes the hard-gate tooltip pattern (built for Stage 6 in Phase 2)
// across every gated stage from Phase 3.
function isStageBlocked(stageNumber: number): boolean {
  if (!d.value) return false
  switch (stageNumber) {
    case STAGE_READINESS_NUMBER: return d.value.readiness_status.status !== 'READY'
    case STAGE_INFORMATION_NUMBER: return d.value.information_status.status !== 'COMPLETE'
    case STAGE_ASSIGNMENT_NUMBER: return d.value.assignment_status.status !== 'COMPLETE'
    case STAGE_WORK_ORDER_NUMBER: return d.value.work_order_status.status !== 'APPROVED'
    case STAGE_PROVISIONING_NUMBER: return d.value.provisioning_status?.status !== 'CORE_COMPLETE'
    case STAGE_MIGRATION_NUMBER: return !['NOT_REQUIRED', 'SIGNED_OFF'].includes(d.value.migration_status.status)
    case STAGE_CONFIGURATION_NUMBER: return d.value.configuration_status.status !== 'COMPLETE'
    case STAGE_TRAINING_NUMBER: return d.value.training_status.status !== 'COMPLETE'
    case STAGE_UAT_NUMBER: return d.value.uat_status.status !== 'COMPLETE'
    case STAGE_GO_LIVE_NUMBER: return d.value.go_live_status.status !== 'READY_FOR_GO_LIVE'
    case STAGE_HYPERCARE_NUMBER: return d.value.hypercare_status.status !== 'COMPLETE'
    case STAGE_STABILIZATION_NUMBER: return d.value.stabilization_status.status !== 'COMPLETE'
    case STAGE_SIGNOFF_NUMBER: return d.value.signoff_status.status !== 'COMPLETE'
    case STAGE_HANDOVER_NUMBER: return d.value.handover_status.status !== 'COMPLETE'
    case STAGE_REVIEW_NUMBER: return d.value.review_status.status !== 'COMPLETE'
    default: return false
  }
}

function stageGapMessage(stageNumber: number): string {
  if (!d.value) return ''
  switch (stageNumber) {
    case STAGE_READINESS_NUMBER: {
      const r = d.value.readiness_status
      return `${r.resolved_items}/${r.total_items} checks resolved${r.failed_items ? `, ${r.failed_items} failed` : ''}.`
    }
    case STAGE_INFORMATION_NUMBER: {
      const i = d.value.information_status
      return `Checklist ${i.checklist_resolved}/${i.checklist_total} resolved, documents ${i.documents_resolved}/${i.documents_total} resolved.`
    }
    case STAGE_ASSIGNMENT_NUMBER: {
      const a = d.value.assignment_status
      return a.missing_required_roles.length
        ? `Still missing: ${a.missing_required_roles.map((r) => ASSIGNMENT_ROLE_LABEL[r]).join(', ')}.`
        : ''
    }
    case STAGE_WORK_ORDER_NUMBER: return WORK_ORDER_STATUS_LABEL[d.value.work_order_status.status]
    case STAGE_PROVISIONING_NUMBER: return provisioningGapMessage.value
    case STAGE_MIGRATION_NUMBER: return `Migration status: ${MIGRATION_STATUS_LABEL[d.value.migration_status.status]}.`
    case STAGE_CONFIGURATION_NUMBER: {
      const c = d.value.configuration_status
      return `${c.resolved_items}/${c.total_items} configuration items resolved.`
    }
    case STAGE_TRAINING_NUMBER: {
      const t = d.value.training_status
      return t.scheduled_sessions > 0
        ? `${t.scheduled_sessions} session(s) still scheduled.`
        : `${t.completed_sessions} completed session(s) — at least one required.`
    }
    case STAGE_UAT_NUMBER: {
      const u = d.value.uat_status
      if (u.open_defects > 0) return `${u.open_defects} open defect(s) must be resolved.`
      if (u.cases_resolved < u.cases_total) return `${u.cases_resolved}/${u.cases_total} test cases resolved.`
      return u.approval_status === 'REJECTED' ? 'UAT approval was rejected — request again.' : 'UAT approval is still pending.'
    }
    case STAGE_GO_LIVE_NUMBER: {
      const g = d.value.go_live_status
      if (g.checklist_resolved < g.checklist_total) return `${g.checklist_resolved}/${g.checklist_total} go-live checklist items resolved.`
      if (!g.has_actual_go_live_date) return 'The actual go-live date has not been recorded yet.'
      return g.approval_status === 'REJECTED' ? 'Go-live approval was rejected — request again.' : 'Go-live approval is still pending.'
    }
    case STAGE_HYPERCARE_NUMBER: {
      const h = d.value.hypercare_status
      if (!h.period_elapsed) return `${h.remaining_days ?? '—'} day(s) remaining in the hypercare window.`
      return `${h.open_incidents} open incident(s) must be resolved.`
    }
    case STAGE_STABILIZATION_NUMBER: {
      const s = d.value.stabilization_status
      if (!s.period_elapsed) return `${s.remaining_days ?? '—'} day(s) remaining in the stabilization window.`
      return `${s.open_incidents} open incident(s) must be resolved.`
    }
    case STAGE_SIGNOFF_NUMBER: {
      const so = d.value.signoff_status
      if (so.open_critical_incidents > 0) return `${so.open_critical_incidents} open critical incident(s) must be resolved.`
      if (so.documents_status !== 'COMPLETE') return 'Not all documents are resolved yet.'
      if (!so.has_signoff_record) return 'The sign-off record has not been saved yet.'
      return so.approval_status === 'REJECTED' ? 'Sign-off approval was rejected — request again.' : 'Sign-off approval is still pending.'
    }
    case STAGE_HANDOVER_NUMBER: {
      const h = d.value.handover_status
      const pending: string[] = []
      if (h.support_review_status !== 'APPROVED') pending.push('support review')
      if (h.customer_service_review_status !== 'APPROVED') pending.push('customer service review')
      if (h.acceptance_status !== 'APPROVED') pending.push('handover acceptance')
      return `Still pending: ${pending.join(', ')}.`
    }
    case STAGE_REVIEW_NUMBER: {
      const rv = d.value.review_status
      const missing: string[] = []
      if (!rv.has_technical_review) missing.push('technical')
      if (!rv.has_operational_review) missing.push('operational')
      if (!rv.has_customer_review) missing.push('customer')
      if (!rv.has_internal_review) missing.push('internal')
      return `Still missing: ${missing.join(', ')}.`
    }
    default: return ''
  }
}

// Which Phase 3 dialog is open, if any — stage 3 has two (checklist +
// documents), the rest have exactly one.
const activeDialog = ref<'readiness' | 'information' | 'documents' | 'assignments' | 'workplan' | 'migration' | 'configuration' | 'training' | 'uat' | 'golive' | 'hypercare' | 'stabilization' | 'signoff' | 'handover' | 'review' | 'checkins' | null>(null)

// `[id].vue` is reused (not remounted) when navigating between two
// deployments directly — watch the param rather than relying on onMounted
// alone, same reasoning as the hospital detail page.
watch(id, (newId) => store.fetchOne(newId), { immediate: true })
</script>

<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" to="/deployments">
      Back to deployments
    </v-btn>

    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" :text="store.error" />
    <v-progress-linear v-if="store.loading" indeterminate color="primary" class="mb-4" />

    <template v-if="d">
      <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
        <div>
          <h2 class="text-h4 font-weight-semibold">{{ d.organization_name || d.prospective_name }}</h2>
          <p class="textSecondary mb-0">
            <v-chip v-if="!d.organization_id" size="small" variant="tonal" color="warning" label class="mr-2">
              Not yet provisioned
            </v-chip>
            Stage {{ d.current_stage }} of {{ d.total_stages }} — {{ d.current_stage_title }}
          </p>
        </div>
        <v-chip :color="DEPLOYMENT_STATUS_COLOR[d.status]" variant="flat" label>{{ d.status.replace('_', ' ') }}</v-chip>
      </div>

      <!-- Command-center dashboard (doc Section 11) -->
      <v-card rounded="lg" elevation="10" class="mb-6">
        <v-card-text>
          <div class="d-flex flex-wrap align-center justify-space-between mb-2 ga-3">
            <div style="flex: 1 1 240px">
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-body-2 textSecondary">Progress</span>
                <span class="text-body-2 font-weight-medium">{{ d.dashboard.progress_percentage }}%</span>
              </div>
              <v-progress-linear :model-value="d.dashboard.progress_percentage" color="primary" height="8" rounded />
            </div>
            <v-chip size="small" variant="tonal" :color="d.dashboard.current_blockers > 0 ? 'warning' : 'success'" label>
              {{ d.dashboard.current_blockers }} blocker(s)
            </v-chip>
            <v-chip size="small" variant="tonal" :color="d.dashboard.critical_issues > 0 ? 'error' : 'success'" label>
              {{ d.dashboard.critical_issues }} critical issue(s)
            </v-chip>
            <v-chip v-if="d.dashboard.target_go_live_date" size="small" variant="tonal" label>
              Target go-live: {{ d.dashboard.target_go_live_date }}
            </v-chip>
            <v-chip size="small" variant="tonal" label>Hypercare: {{ d.dashboard.hypercare_summary }}</v-chip>
            <v-chip size="small" variant="tonal" label>Stabilization: {{ d.dashboard.stabilization_summary }}</v-chip>
          </div>
          <div v-if="d.dashboard.next_actions.length" class="mt-2">
            <span class="text-body-2 textSecondary">Next actions:</span>
            <ul class="mb-0">
              <li v-for="(action, i) in d.dashboard.next_actions" :key="i" class="text-body-2">{{ action }}</li>
            </ul>
          </div>
        </v-card-text>
      </v-card>

      <v-row>
        <!-- Stage checklist -->
        <v-col cols="12" md="7">
          <v-card rounded="lg" elevation="10">
            <v-card-item>
              <v-card-title><v-icon icon="mdi-format-list-checks" class="mr-2" />Stages</v-card-title>
            </v-card-item>
            <v-card-text class="pa-0">
              <v-list density="comfortable" lines="two">
                <v-list-item v-for="s in d.stages" :key="s.stage_number">
                  <template #prepend>
                    <v-icon
                      :icon="s.status === 'COMPLETED' ? 'mdi-check-circle' : s.status === 'IN_PROGRESS' ? 'mdi-progress-clock' : 'mdi-circle-outline'"
                      :color="STAGE_STATUS_COLOR[s.status]"
                      class="mr-3"
                    />
                  </template>
                  <v-list-item-title>Stage {{ s.stage_number }}: {{ s.title }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ s.status.replace('_', ' ') }}
                    <template v-if="s.completed_at"> — completed {{ fmt(s.completed_at) }}</template>
                    <v-chip
                      v-if="s.stage_number === STAGE_READINESS_NUMBER"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="READINESS_STATUS_COLOR[d.readiness_status.status]"
                    >
                      {{ READINESS_STATUS_LABEL[d.readiness_status.status] }}
                    </v-chip>
                    <v-chip
                      v-if="s.stage_number === STAGE_INFORMATION_NUMBER"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="INFORMATION_STATUS_COLOR[d.information_status.status]"
                    >
                      {{ d.information_status.status.replace('_', ' ') }}
                    </v-chip>
                    <v-chip
                      v-if="s.stage_number === STAGE_ASSIGNMENT_NUMBER"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="ASSIGNMENT_STATUS_COLOR[d.assignment_status.status]"
                    >
                      {{ d.assignment_status.status.replace('_', ' ') }}
                    </v-chip>
                    <v-chip
                      v-if="s.stage_number === STAGE_WORK_ORDER_NUMBER"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="WORK_ORDER_STATUS_COLOR[d.work_order_status.status]"
                    >
                      {{ WORK_ORDER_STATUS_LABEL[d.work_order_status.status] }}
                    </v-chip>
                    <v-chip
                      v-if="s.stage_number === STAGE_PROVISIONING_NUMBER && d.provisioning_status"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="PROVISIONING_STATUS_COLOR[d.provisioning_status.status]"
                    >
                      {{ PROVISIONING_STATUS_LABEL[d.provisioning_status.status] }}
                    </v-chip>
                    <v-chip
                      v-if="s.stage_number === STAGE_MIGRATION_NUMBER"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="MIGRATION_STATUS_COLOR[d.migration_status.status]"
                    >
                      {{ MIGRATION_STATUS_LABEL[d.migration_status.status] }}
                    </v-chip>
                    <v-chip
                      v-if="s.stage_number === STAGE_CONFIGURATION_NUMBER"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="CONFIGURATION_STATUS_COLOR[d.configuration_status.status]"
                    >
                      {{ d.configuration_status.status.replace('_', ' ') }}
                    </v-chip>
                    <v-chip
                      v-if="s.stage_number === STAGE_TRAINING_NUMBER"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="TRAINING_STATUS_COLOR[d.training_status.status]"
                    >
                      {{ d.training_status.status.replace('_', ' ') }}
                    </v-chip>
                    <span v-if="s.stage_number === STAGE_CONFIGURATION_NUMBER" class="text-caption textSecondary ml-2">
                      {{ d.user_setup_status.total_assignments }} user role assignment(s){{ d.user_setup_status.has_hospital_admin ? '' : ' — no hospital admin yet' }}
                    </span>
                    <v-chip
                      v-if="s.stage_number === STAGE_UAT_NUMBER"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="UAT_STATUS_COLOR[d.uat_status.status]"
                    >
                      {{ d.uat_status.status.replace('_', ' ') }}
                    </v-chip>
                    <v-chip
                      v-if="s.stage_number === STAGE_GO_LIVE_NUMBER"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="GO_LIVE_READINESS_COLOR[d.go_live_status.status]"
                    >
                      {{ GO_LIVE_READINESS_LABEL[d.go_live_status.status] }}
                    </v-chip>
                    <v-chip
                      v-if="s.stage_number === STAGE_HYPERCARE_NUMBER"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="PERIOD_STAGE_STATUS_COLOR[d.hypercare_status.status]"
                    >
                      Day {{ d.hypercare_status.current_day ?? '—' }} / {{ d.hypercare_status.total_days ?? '—' }}
                    </v-chip>
                    <v-chip
                      v-if="s.stage_number === STAGE_STABILIZATION_NUMBER"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="PERIOD_STAGE_STATUS_COLOR[d.stabilization_status.status]"
                    >
                      Day {{ d.stabilization_status.current_day ?? '—' }} / {{ d.stabilization_status.total_days ?? '—' }}
                    </v-chip>
                    <v-chip
                      v-if="s.stage_number === STAGE_SIGNOFF_NUMBER"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="SIGNOFF_STAGE_STATUS_COLOR[d.signoff_status.status]"
                    >
                      {{ d.signoff_status.status.replace('_', ' ') }}
                    </v-chip>
                    <v-chip
                      v-if="s.stage_number === STAGE_HANDOVER_NUMBER"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="HANDOVER_STAGE_STATUS_COLOR[d.handover_status.status]"
                    >
                      {{ d.handover_status.status.replace('_', ' ') }}
                    </v-chip>
                    <v-chip
                      v-if="s.stage_number === STAGE_REVIEW_NUMBER"
                      size="x-small" variant="tonal" label class="ml-2"
                      :color="REVIEW_STAGE_STATUS_COLOR[d.review_status.status]"
                    >
                      {{ d.review_status.status.replace('_', ' ') }}
                    </v-chip>
                  </v-list-item-subtitle>
                  <template #append>
                    <div class="d-flex align-center ga-2">
                      <v-btn
                        v-if="s.stage_number === STAGE_READINESS_NUMBER"
                        size="small" variant="tonal" @click="activeDialog = 'readiness'"
                      >
                        Manage
                      </v-btn>
                      <template v-if="s.stage_number === STAGE_INFORMATION_NUMBER">
                        <v-btn size="small" variant="tonal" @click="activeDialog = 'information'">Checklist</v-btn>
                        <v-btn size="small" variant="tonal" @click="activeDialog = 'documents'">Documents</v-btn>
                      </template>
                      <v-btn
                        v-if="s.stage_number === STAGE_ASSIGNMENT_NUMBER"
                        size="small" variant="tonal" @click="activeDialog = 'assignments'"
                      >
                        Manage
                      </v-btn>
                      <v-btn
                        v-if="s.stage_number === STAGE_WORK_ORDER_NUMBER"
                        size="small" variant="tonal" @click="activeDialog = 'workplan'"
                      >
                        Manage
                      </v-btn>
                      <v-btn
                        v-if="s.stage_number === STAGE_MIGRATION_NUMBER"
                        size="small" variant="tonal" @click="activeDialog = 'migration'"
                      >
                        Manage
                      </v-btn>
                      <v-btn
                        v-if="s.stage_number === STAGE_CONFIGURATION_NUMBER"
                        size="small" variant="tonal" @click="activeDialog = 'configuration'"
                      >
                        Manage
                      </v-btn>
                      <v-btn
                        v-if="s.stage_number === STAGE_TRAINING_NUMBER"
                        size="small" variant="tonal" @click="activeDialog = 'training'"
                      >
                        Manage
                      </v-btn>
                      <v-btn
                        v-if="s.stage_number === STAGE_UAT_NUMBER"
                        size="small" variant="tonal" @click="activeDialog = 'uat'"
                      >
                        Manage
                      </v-btn>
                      <v-btn
                        v-if="s.stage_number === STAGE_GO_LIVE_NUMBER"
                        size="small" variant="tonal" @click="activeDialog = 'golive'"
                      >
                        Manage
                      </v-btn>
                      <v-btn
                        v-if="s.stage_number === STAGE_HYPERCARE_NUMBER"
                        size="small" variant="tonal" @click="activeDialog = 'hypercare'"
                      >
                        Manage
                      </v-btn>
                      <v-btn
                        v-if="s.stage_number === STAGE_STABILIZATION_NUMBER"
                        size="small" variant="tonal" @click="activeDialog = 'stabilization'"
                      >
                        Manage
                      </v-btn>
                      <v-btn
                        v-if="s.stage_number === STAGE_SIGNOFF_NUMBER"
                        size="small" variant="tonal" @click="activeDialog = 'signoff'"
                      >
                        Manage
                      </v-btn>
                      <v-btn
                        v-if="s.stage_number === STAGE_HANDOVER_NUMBER"
                        size="small" variant="tonal" @click="activeDialog = 'handover'"
                      >
                        Manage
                      </v-btn>
                      <v-btn
                        v-if="s.stage_number === STAGE_REVIEW_NUMBER"
                        size="small" variant="tonal" @click="activeDialog = 'review'"
                      >
                        Manage
                      </v-btn>

                      <template v-if="s.stage_number === STAGE_PROVISIONING_NUMBER">
                        <v-btn
                          v-if="!d.organization_id"
                          size="small" color="primary" variant="tonal"
                          :to="`/hospitals/new?deployment_id=${d.id}`"
                        >
                          Register hospital
                        </v-btn>
                        <template v-else>
                          <v-btn size="small" variant="text" :to="`/hospitals/${d.organization_id}`">
                            View hospital
                          </v-btn>
                          <v-btn
                            icon="mdi-refresh" size="small" variant="text" density="comfortable"
                            :loading="store.loading"
                            @click="store.fetchOne(id)"
                          />
                        </template>
                      </template>

                      <template v-if="s.status === 'IN_PROGRESS'">
                        <v-tooltip
                          v-if="isStageBlocked(s.stage_number)"
                          location="top" :text="stageGapMessage(s.stage_number)"
                        >
                          <template #activator="{ props }">
                            <span v-bind="props">
                              <v-btn size="small" color="primary" variant="tonal" disabled>Mark complete</v-btn>
                            </span>
                          </template>
                        </v-tooltip>
                        <v-btn
                          v-else
                          size="small" color="primary" variant="tonal"
                          :loading="store.completingStage === s.stage_number"
                          @click="completeStage(s.stage_number)"
                        >
                          Mark complete
                        </v-btn>
                      </template>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Timeline -->
        <v-col cols="12" md="5">
          <v-card v-if="d.check_ins.length" rounded="lg" elevation="10" class="mb-6">
            <v-card-item>
              <v-card-title><v-icon icon="mdi-calendar-check-outline" class="mr-2" />Customer Check-ins</v-card-title>
            </v-card-item>
            <v-card-text class="d-flex align-center justify-space-between">
              <div>
                <span v-if="d.check_in_status.next_due_date">
                  Next due {{ d.check_in_status.next_due_date }}
                  <v-chip v-if="d.check_in_status.is_overdue" size="x-small" variant="tonal" color="error" label class="ml-2">Overdue</v-chip>
                </span>
                <span v-else class="textSecondary">No pending check-in.</span>
              </div>
              <v-btn size="small" variant="tonal" @click="activeDialog = 'checkins'">Manage</v-btn>
            </v-card-text>
          </v-card>

          <v-card rounded="lg" elevation="10">
            <v-card-item>
              <v-card-title><v-icon icon="mdi-clock-outline" class="mr-2" />Timeline</v-card-title>
            </v-card-item>
            <v-card-text>
              <v-timeline v-if="d.events.length" density="compact" side="end" truncate-line="both">
                <v-timeline-item v-for="e in d.events" :key="e.id" size="small" dot-color="primary">
                  <p class="text-body-2 font-weight-medium mb-0">{{ e.description }}</p>
                  <p class="text-caption textSecondary mb-0">{{ fmt(e.created_at) }}</p>
                </v-timeline-item>
              </v-timeline>
              <p v-else class="text-body-2 textSecondary mb-0">No activity recorded yet.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <ChecklistDialog
        :show="activeDialog === 'readiness'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id" :stage-number="STAGE_READINESS_NUMBER" title="Facility Readiness Checklist"
      />
      <ChecklistDialog
        :show="activeDialog === 'information'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id" :stage-number="STAGE_INFORMATION_NUMBER" title="Client Kickoff Information Checklist"
      />
      <DocumentsDialog
        :show="activeDialog === 'documents'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id"
      />
      <AssignmentsDialog
        :show="activeDialog === 'assignments'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id"
      />
      <WorkPlanDialog
        :show="activeDialog === 'workplan'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id"
      />
      <MigrationDialog
        :show="activeDialog === 'migration'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id"
      />
      <ChecklistDialog
        :show="activeDialog === 'configuration'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id" :stage-number="STAGE_CONFIGURATION_NUMBER" title="System & Module Configuration"
      />
      <TrainingDialog
        :show="activeDialog === 'training'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id"
      />
      <UatDialog
        :show="activeDialog === 'uat'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id"
      />
      <GoLiveDialog
        :show="activeDialog === 'golive'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id"
      />
      <HypercareDialog
        :show="activeDialog === 'hypercare'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id"
      />
      <StabilizationDialog
        :show="activeDialog === 'stabilization'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id"
      />
      <SignoffDialog
        :show="activeDialog === 'signoff'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id"
      />
      <HandoverDialog
        :show="activeDialog === 'handover'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id"
      />
      <ReviewDialog
        :show="activeDialog === 'review'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id"
      />
      <CheckInsDialog
        :show="activeDialog === 'checkins'" @update:show="(v) => !v && (activeDialog = null)"
        :deployment-id="d.id"
      />
    </template>
  </div>
</template>
