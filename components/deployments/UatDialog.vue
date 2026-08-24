<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useDeploymentsStore } from '@/stores/deployments'
import {
  APPROVAL_STATUS_COLOR,
  DEFECT_SEVERITIES,
  DEFECT_SEVERITY_COLOR,
  DEFECT_STATUS_COLOR,
  UAT_CASE_STATUSES,
  UAT_CASE_STATUS_COLOR,
} from '@/types/deployment'
import type { DefectSeverity, DeploymentUatCaseEntry, DeploymentUatDefectEntry, UatCaseStatus } from '@/types/deployment'

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

const cases = computed(() => store.current?.uat_cases || [])
const defects = computed(() => store.current?.uat_defects || [])

// ---- Test cases ----

const newCase = reactive({ title: '', expected_result: '' })
const addingCase = ref(false)

async function addCase() {
  if (!newCase.title.trim()) return
  addingCase.value = true
  const res = await store.addUatCase(props.deploymentId, { title: newCase.title, expected_result: newCase.expected_result || undefined })
  if (res.success) {
    newCase.title = ''
    newCase.expected_result = ''
  }
  addingCase.value = false
}

const CASE_STATUS_OPTIONS = UAT_CASE_STATUSES.map((status) => ({ title: status.replace('_', ' '), value: status }))

const busyCaseId = ref<number | null>(null)

async function setCaseStatus(uatCase: DeploymentUatCaseEntry, status: UatCaseStatus) {
  busyCaseId.value = uatCase.id
  await store.updateUatCase(props.deploymentId, uatCase.id, { status })
  busyCaseId.value = null
}

async function removeCase(uatCase: DeploymentUatCaseEntry) {
  busyCaseId.value = uatCase.id
  await store.deleteUatCase(props.deploymentId, uatCase.id)
  busyCaseId.value = null
}

// ---- Defects ----

const newDefect = reactive<{ title: string; severity: DefectSeverity; uat_case_id: number | null }>({
  title: '',
  severity: 'MEDIUM',
  uat_case_id: null,
})
const addingDefect = ref(false)

const CASE_OPTIONS = computed(() => [
  { title: '(not linked to a case)', value: null },
  ...cases.value.map((c) => ({ title: c.title, value: c.id })),
])

async function addDefect() {
  if (!newDefect.title.trim()) return
  addingDefect.value = true
  const res = await store.addUatDefect(props.deploymentId, {
    title: newDefect.title,
    severity: newDefect.severity,
    uat_case_id: newDefect.uat_case_id ?? undefined,
  })
  if (res.success) {
    newDefect.title = ''
    newDefect.severity = 'MEDIUM'
    newDefect.uat_case_id = null
  }
  addingDefect.value = false
}

const busyDefectId = ref<number | null>(null)

async function resolveDefect(defect: DeploymentUatDefectEntry) {
  busyDefectId.value = defect.id
  await store.updateUatDefect(props.deploymentId, defect.id, { status: 'RESOLVED' })
  busyDefectId.value = null
}

async function reopenDefect(defect: DeploymentUatDefectEntry) {
  busyDefectId.value = defect.id
  await store.updateUatDefect(props.deploymentId, defect.id, { status: 'OPEN' })
  busyDefectId.value = null
}

// ---- UAT approval — same request/approve/reject shape as WorkPlanDialog's
// work-order approval, just parameterized to approval_type: 'uat'. ----

const uatApproval = computed(() => {
  const matches = store.current?.approvals.filter((a) => a.approval_type === 'uat') || []
  return matches.length ? matches.reduce((latest, a) => (a.id > latest.id ? a : latest)) : null
})

const requesting = ref(false)

async function requestUatApproval() {
  requesting.value = true
  await store.requestApproval(props.deploymentId, { approval_type: 'uat', stage_number: 10 })
  requesting.value = false
}

const deciding = ref(false)
const rejectReason = ref('')
const showRejectField = ref(false)

async function approve() {
  if (!uatApproval.value) return
  deciding.value = true
  await store.decideApproval(props.deploymentId, uatApproval.value.id, { decision: 'approved' })
  deciding.value = false
}

async function reject() {
  if (!uatApproval.value || !rejectReason.value.trim()) return
  deciding.value = true
  const res = await store.decideApproval(props.deploymentId, uatApproval.value.id, {
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
        User Acceptance Testing
        <v-btn icon="mdi-close" variant="text" size="small" @click="localShow = false" />
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 70vh">
        <h4 class="text-subtitle-1 font-weight-medium mb-2">Test cases</h4>
        <div class="d-flex flex-wrap ga-2 align-center mb-3">
          <v-text-field v-model="newCase.title" label="Case title" density="compact" variant="outlined" hide-details style="max-width: 240px" />
          <v-text-field v-model="newCase.expected_result" label="Expected result (optional)" density="compact" variant="outlined" hide-details style="max-width: 260px" />
          <v-btn color="primary" variant="tonal" :loading="addingCase" :disabled="!newCase.title.trim()" @click="addCase">
            Add case
          </v-btn>
        </div>
        <div v-for="c in cases" :key="c.id" class="d-flex flex-wrap align-center ga-3 mb-2">
          <div style="min-width: 200px; flex: 1 1 200px">{{ c.title }}</div>
          <v-chip size="small" variant="tonal" label :color="UAT_CASE_STATUS_COLOR[c.status]">{{ c.status.replace('_', ' ') }}</v-chip>
          <v-select
            :model-value="null"
            :items="CASE_STATUS_OPTIONS"
            label="Set status" density="compact" variant="outlined" hide-details style="max-width: 170px"
            @update:model-value="(v) => v && setCaseStatus(c, v)"
          />
          <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" :loading="busyCaseId === c.id" @click="removeCase(c)" />
        </div>
        <p v-if="!cases.length" class="text-body-2 textSecondary mb-2">No test cases logged yet.</p>

        <v-divider class="my-4" />

        <h4 class="text-subtitle-1 font-weight-medium mb-2">Defects</h4>
        <div class="d-flex flex-wrap ga-2 align-center mb-3">
          <v-text-field v-model="newDefect.title" label="Defect title" density="compact" variant="outlined" hide-details style="max-width: 220px" />
          <v-select v-model="newDefect.severity" :items="DEFECT_SEVERITIES" label="Severity" density="compact" variant="outlined" hide-details style="max-width: 140px" />
          <v-select v-model="newDefect.uat_case_id" :items="CASE_OPTIONS" label="Linked case" density="compact" variant="outlined" hide-details style="max-width: 220px" />
          <v-btn color="primary" variant="tonal" :loading="addingDefect" :disabled="!newDefect.title.trim()" @click="addDefect">
            Log defect
          </v-btn>
        </div>
        <div v-for="def in defects" :key="def.id" class="d-flex flex-wrap align-center ga-3 mb-2">
          <div style="min-width: 200px; flex: 1 1 200px">{{ def.title }}</div>
          <v-chip size="small" variant="tonal" label :color="DEFECT_SEVERITY_COLOR[def.severity]">{{ def.severity }}</v-chip>
          <v-chip size="small" variant="tonal" label :color="DEFECT_STATUS_COLOR[def.status]">{{ def.status }}</v-chip>
          <v-btn
            v-if="def.status === 'OPEN'"
            size="small" variant="tonal" color="success" :loading="busyDefectId === def.id"
            @click="resolveDefect(def)"
          >
            Resolve
          </v-btn>
          <v-btn
            v-else
            size="small" variant="text" :loading="busyDefectId === def.id"
            @click="reopenDefect(def)"
          >
            Reopen
          </v-btn>
        </div>
        <p v-if="!defects.length" class="text-body-2 textSecondary mb-2">No defects logged.</p>

        <v-divider class="my-4" />

        <h4 class="text-subtitle-1 font-weight-medium mb-2">UAT approval</h4>
        <div v-if="!uatApproval">
          <v-btn color="primary" variant="tonal" :loading="requesting" @click="requestUatApproval">
            Request approval
          </v-btn>
        </div>
        <div v-else>
          <v-chip size="small" variant="tonal" label class="mb-2" :color="APPROVAL_STATUS_COLOR[uatApproval.status]">
            {{ uatApproval.status }}
          </v-chip>
          <p v-if="uatApproval.rejection_reason" class="text-body-2 mb-2">
            Rejection reason: {{ uatApproval.rejection_reason }}
          </p>

          <div v-if="uatApproval.status === 'PENDING'" class="d-flex flex-wrap ga-2 align-center">
            <v-btn color="success" variant="tonal" :loading="deciding" @click="approve">Approve</v-btn>
            <v-btn color="error" variant="tonal" :disabled="deciding" @click="showRejectField = !showRejectField">Reject</v-btn>
          </div>
          <div v-if="showRejectField" class="d-flex ga-2 align-center mt-2">
            <v-text-field v-model="rejectReason" label="Rejection reason" density="compact" variant="outlined" hide-details style="max-width: 320px" />
            <v-btn color="error" variant="tonal" :loading="deciding" :disabled="!rejectReason.trim()" @click="reject">Confirm reject</v-btn>
          </div>

          <div v-if="uatApproval.status === 'REJECTED'" class="mt-2">
            <v-btn color="primary" variant="tonal" :loading="requesting" @click="requestUatApproval">
              Request approval again
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
