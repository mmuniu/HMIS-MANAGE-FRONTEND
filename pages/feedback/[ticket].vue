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
const reply = ref('')
const sending = ref(false)

function fmt(iso: string | null) {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    report.value = await api.get(ticket.value)
  } catch (e: any) {
    error.value = e?.response?.status === 404 ? 'Report not found.' : (e?.response?.data?.message || 'Failed to load report.')
  } finally {
    loading.value = false
  }
}

async function sendReply() {
  if (!reply.value.trim() || sending.value) return
  sending.value = true
  try {
    const c = await api.comment(ticket.value, reply.value.trim())
    report.value?.comments.push(c)
    reply.value = ''
    $showToast('Reply added.')
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to send reply.')
  } finally {
    sending.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto" style="max-width: 900px">
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" to="/feedback">Back to my feedback</v-btn>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <template v-if="report">
      <!-- Header -->
      <v-card rounded="xl" elevation="10" class="mb-4">
        <v-card-text class="pa-6">
          <div class="d-flex flex-wrap align-center ga-2 mb-2">
            <v-chip :color="report.type === 'bug' ? 'error' : 'primary'" size="small" variant="tonal" label>
              <v-icon start :icon="report.type === 'bug' ? 'mdi-bug' : 'mdi-lightbulb-on'" size="14" />
              {{ report.type === 'bug' ? 'Bug' : 'Feature' }}
            </v-chip>
            <v-chip v-if="report.severity" :color="SEVERITY_COLORS[report.severity as Severity]" size="small" variant="tonal" label class="text-capitalize">
              {{ report.severity }}
            </v-chip>
            <v-chip :color="STATUS_COLORS[report.status as ReportStatus]" size="small" variant="flat" label>
              {{ STATUS_LABELS[report.status as ReportStatus] }}
            </v-chip>
            <v-spacer />
            <span class="text-caption textSecondary font-mono">{{ report.ticket_id.slice(0, 8) }}</span>
          </div>
          <h2 class="text-h5 font-weight-semibold mb-1">{{ report.title }}</h2>
          <p class="text-caption textSecondary mb-3">
            {{ report.module }} · submitted {{ fmt(report.created_at) }}
            <template v-if="report.assignee"> · assigned to {{ report.assignee }}</template>
          </p>

          <!-- Status banner so the reporter always knows where it stands -->
          <v-alert
            v-if="report.status === 'delivered'" type="success" variant="tonal" density="compact" class="mb-4"
            text="Good news — a fix for this has been delivered."
          />
          <v-alert
            v-else-if="report.status === 'assigned' || report.status === 'in_progress'"
            type="info" variant="tonal" density="compact" class="mb-4"
            :text="report.assignee
              ? `${report.assignee} is working on this.`
              : 'This has been picked up and is being worked on.'"
          />

          <v-alert
            v-if="report.test_case" type="info" variant="tonal" density="compact" class="mb-4"
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
            <span v-if="report.page_url" class="text-truncate">URL: {{ report.page_url }}</span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Attachments -->
      <v-card v-if="report.attachments.length" rounded="xl" elevation="10" class="mb-4">
        <v-card-item><v-card-title class="text-subtitle-1">Attachments</v-card-title></v-card-item>
        <v-card-text>
          <div class="d-flex flex-wrap ga-3">
            <a v-for="a in report.attachments" :key="a.id" :href="a.url" target="_blank" rel="noopener" class="att rounded-lg">
              <img v-if="a.kind === 'image'" :src="a.url" class="att-media" alt="" />
              <div v-else class="att-media d-flex align-center justify-center bg-grey-darken-3">
                <v-icon icon="mdi-play-circle" size="36" color="white" />
              </div>
              <span class="text-caption d-block text-truncate" style="max-width: 140px">{{ a.original_name }}</span>
            </a>
          </div>
        </v-card-text>
      </v-card>

      <!-- Conversation -->
      <v-card rounded="xl" elevation="10" class="mb-4">
        <v-card-item><v-card-title class="text-subtitle-1">Conversation</v-card-title></v-card-item>
        <v-card-text>
          <div v-if="report.comments.length">
            <div v-for="c in report.comments" :key="c.id" class="d-flex ga-3 mb-4">
              <v-avatar color="primary" variant="tonal" size="36"><v-icon icon="mdi-account" /></v-avatar>
              <div>
                <div class="text-subtitle-2">{{ c.author }} <span class="text-caption textSecondary font-weight-regular">· {{ fmt(c.created_at) }}</span></div>
                <p class="text-body-2 mb-0" style="white-space: pre-wrap">{{ c.body }}</p>
              </div>
            </div>
          </div>
          <p v-else class="textSecondary mb-4">No responses yet. Our team will reply here.</p>

          <v-divider class="mb-3" />
          <v-textarea v-model="reply" label="Add a reply" variant="outlined" rows="2" auto-grow hide-details density="comfortable" class="mb-2" />
          <div class="d-flex justify-end">
            <v-btn color="primary" :loading="sending" :disabled="!reply.trim()" prepend-icon="mdi-send" @click="sendReply">Reply</v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Status history -->
      <v-card rounded="xl" elevation="10">
        <v-card-item><v-card-title class="text-subtitle-1">Status history</v-card-title></v-card-item>
        <v-card-text>
          <v-timeline side="end" density="compact" truncate-line="both">
            <v-timeline-item v-for="(h, i) in report.status_history" :key="i"
              :dot-color="STATUS_COLORS[h.to_status as ReportStatus] || 'grey'" size="small">
              <div class="d-flex justify-space-between ga-4">
                <span>
                  <strong>{{ STATUS_LABELS[h.to_status as ReportStatus] || h.to_status }}</strong>
                  <span v-if="h.changed_by" class="textSecondary text-caption"> · by {{ h.changed_by }}</span>
                </span>
                <span class="text-caption textSecondary">{{ fmt(h.at) }}</span>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<style scoped>
.ga-2 { gap: 8px; }
.ga-3 { gap: 12px; }
.ga-4 { gap: 16px; }
.font-mono { font-family: monospace; }
.att-media { width: 140px; height: 100px; object-fit: cover; border-radius: 8px; display: block; }
.att { text-decoration: none; color: inherit; }
</style>
