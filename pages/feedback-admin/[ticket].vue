<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useReportsApi } from '@/composables/useReportsApi'
import { useNuxtApp } from '#app'
import {
  STATUS_LABELS, STATUS_COLORS, SEVERITY_COLORS,
  type ReportDetail, type ReportStatus, type Severity,
} from '@/types/report'

const route = useRoute()
const api = useReportsApi()
const { $showToast } = useNuxtApp()

const ticket = computed(() => String(route.params.ticket))
const report = ref<ReportDetail | null>(null)
const loading = ref(false)
const error = ref('')

// "assigned" and "under_review" are set automatically (assigning a dev sets
// "assigned"), never chosen by hand — so they're excluded from the dropdown.
const AUTO_STATUSES: ReportStatus[] = ['assigned', 'under_review']
const statusItems = (Object.keys(STATUS_LABELS) as ReportStatus[])
  .filter((v) => !AUTO_STATUSES.includes(v))
  .map((v) => ({ title: STATUS_LABELS[v], value: v }))
const newStatus = ref<ReportStatus>('new')
const savingStatus = ref(false)

const reply = ref('')
const internal = ref(false)
const sending = ref(false)

// Assign-to-developer.
const devs = ref<{ id: number; name: string }[]>([])
const assignee = ref<number | null>(null)
const assigning = ref(false)

function fmt(iso: string | null) {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    report.value = await api.adminGet(ticket.value)
    newStatus.value = report.value.status
    if (!devs.value.length) devs.value = await api.adminAssignableDevs()
    // Pre-select the current assignee by matching name (detail exposes name).
    assignee.value = devs.value.find((d) => d.name === report.value?.assignee)?.id ?? null
  } catch (e: any) {
    error.value = e?.response?.status === 404 ? 'Report not found.' : (e?.response?.data?.message || 'Failed to load.')
  } finally {
    loading.value = false
  }
}

async function saveAssignee() {
  assigning.value = true
  try {
    await api.adminAssign(ticket.value, assignee.value)
    $showToast(assignee.value ? 'Assigned to developer.' : 'Unassigned.')
    await load()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to assign.')
  } finally {
    assigning.value = false
  }
}

async function changeStatus() {
  if (!report.value || newStatus.value === report.value.status) return
  savingStatus.value = true
  try {
    await api.adminSetStatus(ticket.value, newStatus.value)
    $showToast('Status updated.')
    await load()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to update status.')
  } finally {
    savingStatus.value = false
  }
}

async function send() {
  if (!reply.value.trim() || sending.value) return
  sending.value = true
  try {
    const c = await api.adminComment(ticket.value, reply.value.trim(), internal.value)
    report.value?.comments.push(c)
    reply.value = ''
    $showToast(internal.value ? 'Internal note added.' : 'Reply sent to user.')
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to send.')
  } finally {
    sending.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto" style="max-width: 960px">
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" to="/feedback-admin">Back to all reports</v-btn>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-row v-if="report">
      <!-- Left: detail + conversation -->
      <v-col cols="12" md="8">
        <v-card rounded="xl" elevation="10" class="mb-4">
          <v-card-text class="pa-6">
            <div class="d-flex flex-wrap align-center ga-2 mb-2">
              <v-chip :color="report.type === 'bug' ? 'error' : 'primary'" size="small" variant="tonal" label>
                {{ report.type === 'bug' ? 'Bug' : 'Feature' }}
              </v-chip>
              <v-chip v-if="report.severity" :color="SEVERITY_COLORS[report.severity as Severity]" size="small" variant="tonal" label class="text-capitalize">{{ report.severity }}</v-chip>
              <v-spacer />
              <span class="text-caption textSecondary font-mono">{{ report.ticket_id.slice(0, 8) }}</span>
            </div>
            <h2 class="text-h5 font-weight-semibold mb-1">{{ report.title }}</h2>
            <p class="text-caption textSecondary mb-4">
              {{ report.module }} · by {{ report.reporter }} · {{ fmt(report.created_at) }}
            </p>
            <v-alert
              v-if="report.test_case" type="info" variant="tonal" density="compact" class="mb-3"
              icon="mdi-link-variant"
            >
              Raised from failed test case <strong>{{ report.test_case.case_id }}</strong> — {{ report.test_case.title }}
              <v-btn
                v-if="report.test_case.suite_slug" variant="text" size="small" color="primary" class="ml-1"
                :to="`/test-cases/${report.test_case.suite_slug}`"
              >View test</v-btn>
            </v-alert>

            <p class="text-body-1" style="white-space: pre-wrap">{{ report.description }}</p>
            <div v-if="report.browser || report.os || report.page_url" class="mt-4 text-caption textSecondary">
              <v-divider class="mb-2" />
              <span v-if="report.browser">Browser: {{ report.browser }} · </span>
              <span v-if="report.os">OS: {{ report.os }} · </span>
              <span v-if="report.page_url">URL: {{ report.page_url }}</span>
            </div>
          </v-card-text>
        </v-card>

        <v-card v-if="report.attachments.length" rounded="xl" elevation="10" class="mb-4">
          <v-card-item><v-card-title class="text-subtitle-1">Attachments</v-card-title></v-card-item>
          <v-card-text>
            <div class="d-flex flex-wrap ga-3">
              <a v-for="a in report.attachments" :key="a.id" :href="a.url" target="_blank" rel="noopener" class="att">
                <img v-if="a.kind === 'image'" :src="a.url" class="att-media" alt="" />
                <div v-else class="att-media d-flex align-center justify-center bg-grey-darken-3"><v-icon icon="mdi-play-circle" size="36" color="white" /></div>
                <v-btn size="x-small" variant="text" prepend-icon="mdi-download" :href="a.url" target="_blank">Download</v-btn>
              </a>
            </div>
          </v-card-text>
        </v-card>

        <!-- Conversation + reply/note -->
        <v-card rounded="xl" elevation="10">
          <v-card-item><v-card-title class="text-subtitle-1">Conversation</v-card-title></v-card-item>
          <v-card-text>
            <div v-for="c in report.comments" :key="c.id" class="d-flex ga-3 mb-4">
              <v-avatar :color="c.is_internal ? 'warning' : 'primary'" variant="tonal" size="36">
                <v-icon :icon="c.is_internal ? 'mdi-lock' : 'mdi-account'" />
              </v-avatar>
              <div>
                <div class="text-subtitle-2">
                  {{ c.author }}
                  <v-chip v-if="c.is_internal" color="warning" size="x-small" variant="tonal" label class="ml-1">Internal note</v-chip>
                  <span class="text-caption textSecondary font-weight-regular"> · {{ fmt(c.created_at) }}</span>
                </div>
                <p class="text-body-2 mb-0" style="white-space: pre-wrap">{{ c.body }}</p>
              </div>
            </div>

            <v-divider class="mb-3" />
            <v-textarea v-model="reply" :label="internal ? 'Internal note (not visible to user)' : 'Reply to user'"
              variant="outlined" rows="2" auto-grow hide-details density="comfortable" class="mb-2" />
            <div class="d-flex align-center">
              <v-switch v-model="internal" color="warning" label="Internal note" hide-details density="compact" />
              <v-spacer />
              <v-btn :color="internal ? 'warning' : 'primary'" :loading="sending" :disabled="!reply.trim()"
                :prepend-icon="internal ? 'mdi-lock' : 'mdi-send'" @click="send">
                {{ internal ? 'Add note' : 'Send reply' }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right: management -->
      <v-col cols="12" md="4">
        <v-card rounded="xl" elevation="10" class="mb-4">
          <v-card-item><v-card-title class="text-subtitle-1">Manage</v-card-title></v-card-item>
          <v-card-text>
            <p class="text-overline textSecondary mb-1">Status</p>
            <v-select v-model="newStatus" :items="statusItems" variant="outlined" density="comfortable" hide-details class="mb-2" />
            <v-btn block color="primary" :loading="savingStatus" :disabled="newStatus === report.status" @click="changeStatus">
              Update status
            </v-btn>

            <v-divider class="my-4" />

            <p class="text-overline textSecondary mb-1">Assign to developer</p>
            <v-select
              v-model="assignee" :items="devs" item-title="name" item-value="id"
              placeholder="Unassigned" variant="outlined" density="comfortable" hide-details clearable class="mb-2"
            />
            <v-btn block variant="tonal" color="primary" :loading="assigning" prepend-icon="mdi-account-arrow-right" @click="saveAssignee">
              {{ assignee ? 'Assign developer' : 'Unassign' }}
            </v-btn>

            <v-divider class="my-4" />
            <div class="d-flex align-center justify-space-between">
              <span class="text-body-2">Current</span>
              <v-chip :color="STATUS_COLORS[report.status as ReportStatus]" size="small" variant="flat" label>{{ STATUS_LABELS[report.status as ReportStatus] }}</v-chip>
            </div>
            <div class="d-flex align-center justify-space-between mt-2">
              <span class="text-body-2">Assignee</span>
              <span class="text-body-2 textSecondary">{{ report.assignee || 'Unassigned' }}</span>
            </div>
          </v-card-text>
        </v-card>

        <v-card rounded="xl" elevation="10">
          <v-card-item><v-card-title class="text-subtitle-1">Status history</v-card-title></v-card-item>
          <v-card-text>
            <v-timeline side="end" density="compact" truncate-line="both">
              <v-timeline-item v-for="(h, i) in report.status_history" :key="i"
                :dot-color="STATUS_COLORS[h.to_status as ReportStatus] || 'grey'" size="x-small">
                <div class="text-body-2"><strong>{{ STATUS_LABELS[h.to_status as ReportStatus] || h.to_status }}</strong></div>
                <div class="text-caption textSecondary">{{ h.changed_by || 'system' }} · {{ fmt(h.at) }}</div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.ga-2 { gap: 8px; }
.ga-3 { gap: 12px; }
.font-mono { font-family: monospace; }
.att { text-decoration: none; color: inherit; text-align: center; }
.att-media { width: 140px; height: 100px; object-fit: cover; border-radius: 8px; display: block; }
</style>
