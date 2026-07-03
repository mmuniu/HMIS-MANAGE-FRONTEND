<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTestCasesStore, type TestCase, type Verdict } from '@/stores/testCases'
import { useTestCasesApi } from '@/composables/useTestCasesApi'
import { useAuthStore } from '@/stores/auth'
import { useNuxtApp } from '#app'
import TestCaseForm from '@/components/hmis/TestCaseForm.vue'

const route = useRoute()
const router = useRouter()
const store = useTestCasesStore()
const auth = useAuthStore()
const api = useTestCasesApi()
const { $showToast } = useNuxtApp()
const slug = computed(() => String(route.params.slug))

// Edit dialog state.
const editDialog = ref(false)
const editing = ref<(TestCase & { module_name?: string; module_code?: string }) | null>(null)
const savingEdit = ref(false)

function openEdit(c: TestCase, moduleName: string, moduleCode: string) {
  editing.value = { ...c, module_name: moduleName, module_code: moduleCode }
  editDialog.value = true
}

async function onEditSubmit(payload: Record<string, any>) {
  if (!editing.value) return
  savingEdit.value = true
  try {
    await api.updateCase(editing.value.id, payload)
    $showToast('Test case updated.')
    editDialog.value = false
    await store.loadSuite(slug.value)
  } catch (err: any) {
    $showToast(err?.response?.data?.message || 'Update failed.')
  } finally {
    savingEdit.value = false
  }
}

async function onDelete(c: TestCase) {
  if (!confirm(`Delete ${c.case_id}? This removes the case and all its results.`)) return
  try {
    await api.deleteCase(c.id)
    $showToast('Test case deleted.')
    await store.loadSuite(slug.value)
  } catch (err: any) {
    $showToast(err?.response?.data?.message || 'Delete failed.')
  }
}

const search = ref('')
const moduleFilter = ref<string | null>(null)
const verdictFilter = ref<Verdict | 'all'>('all')

onMounted(() => store.loadSuite(slug.value))
watch(slug, (s) => store.loadSuite(s))

const suite = computed(() => store.current)

const moduleOptions = computed(() =>
  (suite.value?.modules ?? []).map((m) => ({ title: `${m.name} (${m.code})`, value: m.code })),
)

const visibleModules = computed(() => {
  if (!suite.value) return []
  const q = search.value.trim().toLowerCase()
  return suite.value.modules
    .filter((m) => !moduleFilter.value || m.code === moduleFilter.value)
    .map((m) => ({
      ...m,
      cases: m.cases.filter((c) => {
        if (q && !`${c.case_id} ${c.title}`.toLowerCase().includes(q)) return false
        if (verdictFilter.value !== 'all' && c.verdict !== verdictFilter.value) return false
        return true
      }),
    }))
    .filter((m) => m.cases.length > 0)
})

const statusColor = (s: string) => (s === 'PASS' ? 'success' : s === 'FAIL' ? 'error' : 'warning')
const verdictColor = (v: Verdict) => (v === 'pass' ? 'success' : v === 'fail' ? 'error' : 'default')

function mark(c: TestCase, v: Verdict) {
  store.setVerdict(c, c.verdict === v ? 'untested' : v)
}

// Open the feedback form pre-filled and auto-linked to this failed case.
// The test_case_id travels as a query param; the form sends it as the hidden link.
function logBug(c: TestCase, moduleName: string) {
  router.push({
    path: '/feedback/new',
    query: {
      test_case_id: c.id,
      case_id: c.case_id,
      title: `[${c.case_id}] ${c.title}`,
      description:
        `Test case ${c.case_id} — "${c.title}" failed.\n\n` +
        `Steps:\n${(c.steps || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n` +
        `Expected:\n${c.expected || '-'}\n\n` +
        `What actually happened:\n${c.note || '(describe here)'}`,
    },
  })
}

// System-admin: approve or reject a pending test case.
async function approve(c: TestCase) {
  try {
    await api.approveCase(c.id)
    c.approval_status = 'approved'
    $showToast(`Approved ${c.case_id}.`)
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to approve.')
  }
}
async function reject(c: TestCase) {
  try {
    await api.rejectCase(c.id)
    c.approval_status = 'rejected'
    $showToast(`Rejected ${c.case_id}.`)
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to reject.')
  }
}
</script>

<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-3" to="/test-cases">All roles</v-btn>

    <v-progress-linear v-if="store.loading" indeterminate color="primary" class="mb-4" />
    <v-alert v-if="store.lastError" type="error" variant="tonal" rounded="lg" :text="store.lastError" />

    <template v-if="suite">
      <div class="d-flex flex-wrap align-center justify-space-between mb-4 gap-3">
        <div>
          <h2 class="text-h4 font-weight-semibold mb-0">{{ suite.role }}</h2>
          <p class="textSecondary mb-0">{{ suite.total }} test cases across {{ suite.modules.length }} modules</p>
        </div>
        <div class="d-flex align-center gap-2">
          <v-chip color="success" variant="tonal">{{ suite.stats.pass }} passed</v-chip>
          <v-chip color="error" variant="tonal">{{ suite.stats.fail }} failed</v-chip>
          <v-chip variant="tonal">{{ suite.stats.untested }} untested</v-chip>
          <v-btn v-if="auth.canAuthorTests" color="primary" size="small" prepend-icon="mdi-plus" to="/test-cases/new" class="ml-2">New Case</v-btn>
        </div>
      </div>

      <!-- Filters -->
      <v-card rounded="lg" elevation="10" class="mb-4">
        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="5">
              <v-text-field v-model="search" label="Search by ID or title" prepend-inner-icon="mdi-magnify"
                variant="outlined" density="comfortable" hide-details clearable />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="moduleFilter" :items="moduleOptions" label="Module"
                variant="outlined" density="comfortable" hide-details clearable />
            </v-col>
            <v-col cols="12" md="3">
              <v-select v-model="verdictFilter" :items="[
                  { title: 'All', value: 'all' },
                  { title: 'Passed', value: 'pass' },
                  { title: 'Failed', value: 'fail' },
                  { title: 'Untested', value: 'untested' },
                ]" label="Result" variant="outlined" density="comfortable" hide-details />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Modules -->
      <div v-for="m in visibleModules" :key="m.code" class="mb-6">
        <div class="d-flex align-center mb-2">
          <h3 class="text-h6 font-weight-medium mb-0">{{ m.name }}</h3>
          <v-chip size="x-small" variant="tonal" class="ml-2">{{ m.code }}</v-chip>
          <span class="textSecondary text-caption ml-2">{{ m.cases.length }} cases</span>
        </div>

        <v-expansion-panels variant="accordion" multiple>
          <v-expansion-panel v-for="c in m.cases" :key="c.id" rounded="lg" elevation="2">
            <v-expansion-panel-title>
              <div class="d-flex align-center flex-grow-1 gap-2">
                <v-icon
                  :icon="c.verdict === 'pass' ? 'mdi-check-circle' : c.verdict === 'fail' ? 'mdi-close-circle' : 'mdi-circle-outline'"
                  :color="verdictColor(c.verdict) === 'default' ? undefined : verdictColor(c.verdict)" />
                <span class="font-weight-medium">{{ c.case_id }}</span>
                <span class="textSecondary">— {{ c.title }}</span>
                <v-spacer />
                <v-chip
                  v-if="c.approval_status && c.approval_status !== 'approved'"
                  :color="c.approval_status === 'rejected' ? 'error' : 'warning'"
                  size="x-small" variant="flat" label class="mr-2"
                >
                  {{ c.approval_status === 'rejected' ? 'Rejected' : 'Pending approval' }}
                </v-chip>
                <v-chip :color="statusColor(c.documented_status)" size="x-small" variant="tonal" label class="mr-2">
                  doc: {{ c.documented_status }}
                </v-chip>
              </div>
            </v-expansion-panel-title>

            <v-expansion-panel-text>
              <div v-if="c.preconditions.length" class="mb-3">
                <p class="text-overline textSecondary mb-1">Preconditions</p>
                <ul class="pl-5"><li v-for="(p, i) in c.preconditions" :key="i" class="text-body-2">{{ p }}</li></ul>
              </div>
              <div v-if="c.steps.length" class="mb-3">
                <p class="text-overline textSecondary mb-1">Test Steps</p>
                <ol class="pl-5"><li v-for="(s, i) in c.steps" :key="i" class="text-body-2 mb-1">{{ s }}</li></ol>
              </div>
              <div v-if="c.expected" class="mb-4">
                <p class="text-overline textSecondary mb-1">Expected Result</p>
                <p class="text-body-2 mb-0">{{ c.expected }}</p>
              </div>

              <v-divider class="mb-3" />

              <!-- System-admin approval controls -->
              <div v-if="auth.isSystemAdmin && c.approval_status !== 'approved'"
                class="d-flex flex-wrap align-center gap-2 mb-3 pa-2 rounded-lg" style="background: rgba(var(--v-theme-warning), 0.08)">
                <v-icon icon="mdi-shield-check" color="warning" size="small" />
                <span class="text-body-2 font-weight-medium mr-2">Approval:</span>
                <v-btn color="success" size="small" prepend-icon="mdi-check-bold" @click="approve(c)">Approve</v-btn>
                <v-btn color="error" variant="tonal" size="small" prepend-icon="mdi-close-thick" @click="reject(c)">Reject</v-btn>
                <span class="text-caption textSecondary ml-2">Only approved cases are shown to testers.</span>
              </div>

              <div class="d-flex flex-wrap align-center gap-2">
                <span class="text-body-2 font-weight-medium mr-2">Your result:</span>
                <v-btn :variant="c.verdict === 'pass' ? 'flat' : 'tonal'" color="success" size="small"
                  prepend-icon="mdi-check" @click="mark(c, 'pass')">Pass</v-btn>
                <v-btn :variant="c.verdict === 'fail' ? 'flat' : 'tonal'" color="error" size="small"
                  prepend-icon="mdi-close" @click="mark(c, 'fail')">Fail</v-btn>
                <!-- Log a bug from a FAILED case; the link is set automatically. -->
                <v-btn v-if="c.verdict === 'fail'" variant="tonal" color="warning" size="small"
                  prepend-icon="mdi-bug" @click="logBug(c, m.name)">Log a bug</v-btn>
                <v-spacer />
                <v-btn v-if="auth.canAuthorTests" variant="text" size="small" prepend-icon="mdi-pencil" @click="openEdit(c, m.name, m.code)">Edit</v-btn>
                <v-btn v-if="auth.canAuthorTests" variant="text" size="small" color="error" prepend-icon="mdi-delete" @click="onDelete(c)">Delete</v-btn>
              </div>

              <v-textarea :model-value="c.note ?? ''" @change="(e: any) => store.setNote(c, e.target.value)"
                label="Notes (what you observed)" variant="outlined" density="comfortable" rows="2"
                auto-grow hide-details class="mt-3" />

              <!-- Bugs raised from this case -->
              <div v-if="c.bugs && c.bugs.length" class="mt-3">
                <p class="text-overline textSecondary mb-1"><v-icon icon="mdi-bug" size="14" class="mr-1" />Linked bugs</p>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip v-for="b in c.bugs" :key="b.ticket_id" size="small" variant="tonal" color="warning" label
                    :to="`/feedback/${b.ticket_id}`">
                    {{ b.ticket_id.slice(0, 8) }} · {{ b.status }}
                  </v-chip>
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <v-alert v-if="!visibleModules.length && !store.loading" type="info" variant="tonal" rounded="lg">
        No test cases match your filters.
      </v-alert>
    </template>

    <!-- Edit dialog -->
    <v-dialog v-model="editDialog" max-width="760" scrollable>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center">
          Edit {{ editing?.case_id }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="editDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <TestCaseForm
            v-if="editing"
            :suites="[]"
            editing
            :loading="savingEdit"
            :initial="{
              suite_role: suite?.role,
              case_id: editing.case_id,
              module_name: editing.module_name,
              module_code: editing.module_code,
              title: editing.title,
              documented_status: editing.documented_status,
              preconditions: editing.preconditions,
              steps: editing.steps,
              expected: editing.expected,
            }"
            @submit="onEditSubmit"
            @cancel="editDialog = false"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
