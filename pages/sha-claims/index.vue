<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useNuxtApp } from '#app'
import FacilityClaims from '@/components/sha-claims/FacilityClaims.vue'
import { useShaClaimsApi } from '@/composables/useShaClaimsApi'
import { formatDateTime, formatKes } from '@/utils/format'
import type { ShaOverview, ShaStage, ShaStatusMeta } from '~/types/shaClaim'

/**
 * SHA Claims monitor — every hospital's submitted SHA claims in one place.
 *
 * Read-only. The claims live in patient-evaluation-service; their status is
 * refreshed by DHA's claim-status callback and by `sha:sync-claims` every 15
 * minutes, so "Last synced" on each row is the real freshness, not this page.
 */
const api = useShaClaimsApi()
const { $showToast } = useNuxtApp()

const overview = ref<ShaOverview | null>(null)
const loading = ref(false)
const error = ref('')

// One filter, shared by every facility block below. The overview numbers are
// deliberately NOT filtered — the platform picture must not shrink as you
// drill into it.
const status = ref('')
const stage = ref<ShaStage | ''>('')

const STAGE_TITLES: Record<ShaStage, string> = {
  action_required: 'Needs action',
  in_progress: 'With SHA',
  adjudicated: 'Adjudicated',
  closed: 'Closed',
}

const STAGE_COLOURS: Record<ShaStage, string> = {
  action_required: 'warning',
  in_progress: 'info',
  adjudicated: 'success',
  closed: 'secondary',
}

const STAGE_ICONS: Record<ShaStage, string> = {
  action_required: 'mdi-alert-outline',
  in_progress: 'mdi-progress-clock',
  adjudicated: 'mdi-gavel',
  closed: 'mdi-archive-outline',
}

const STAGE_ORDER: ShaStage[] = ['action_required', 'in_progress', 'adjudicated', 'closed']

const summary = computed(() => overview.value?.summary ?? null)
const amounts = computed(() => summary.value?.amounts ?? null)

/** The 14 statuses, grouped under the stage each belongs to. */
const statusesByStage = computed<Record<ShaStage, ShaStatusMeta[]>>(() => {
  const grouped: Record<ShaStage, ShaStatusMeta[]> = {
    action_required: [], in_progress: [], adjudicated: [], closed: [],
  }
  for (const s of overview.value?.statuses ?? []) grouped[s.stage]?.push(s)
  return grouped
})

/** Facilities with at least one claim, the stuck ones first. */
const facilities = computed(() => {
  const rows = [...(overview.value?.by_facility ?? [])].filter((f) => f.total > 0)
  return rows.sort((a, b) => b.action_required - a.action_required || b.total - a.total)
})

const filterLabel = computed(() => {
  if (status.value) {
    return overview.value?.statuses.find((s) => s.value === status.value)?.title ?? status.value
  }
  if (stage.value) return STAGE_TITLES[stage.value]
  return ''
})

function countFor(code: string): number {
  return summary.value?.by_status?.[code] ?? 0
}

/** Clicking a stage tile or a status chip toggles that filter. */
function toggleStage(next: ShaStage) {
  status.value = ''
  stage.value = stage.value === next ? '' : next
}

function toggleStatus(next: string) {
  stage.value = ''
  status.value = status.value === next ? '' : next
}

function clearFilter() {
  status.value = ''
  stage.value = ''
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    overview.value = await api.overview()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to load SHA claims.'
    $showToast(error.value)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-6">
      <div>
        <h2 class="text-h4 font-weight-semibold">SHA Claims</h2>
        <p class="textSecondary mb-0">
          Every claim submitted to SHA across the platform, and where each one stands.
        </p>
      </div>
      <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="load">Refresh</v-btn>
    </div>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <template v-if="summary">
      <!-- 1. The funnel: where the platform's claims are sitting right now. -->
      <v-row class="mb-2">
        <v-col cols="6" sm="4" md="2">
          <v-card rounded="lg" elevation="10" class="pa-4 d-flex align-center ga-3">
            <v-avatar color="primary" variant="tonal" size="44">
              <v-icon icon="mdi-file-document-multiple-outline" />
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold">{{ summary.total }}</div>
              <div class="text-caption textSecondary">Submitted claims</div>
            </div>
          </v-card>
        </v-col>

        <v-col v-for="s in STAGE_ORDER" :key="s" cols="6" sm="4" md="2">
          <v-card
            rounded="lg" elevation="10" link
            class="pa-4 d-flex align-center ga-3"
            :class="{ 'border-md': stage === s }"
            @click="toggleStage(s)"
          >
            <v-avatar :color="STAGE_COLOURS[s]" variant="tonal" size="44">
              <v-icon :icon="STAGE_ICONS[s]" />
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold">{{ summary[s] }}</div>
              <div class="text-caption textSecondary">{{ STAGE_TITLES[s] }}</div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="6" sm="4" md="2">
          <v-card rounded="lg" elevation="10" class="pa-4 d-flex align-center ga-3">
            <v-avatar color="error" variant="tonal" size="44"><v-icon icon="mdi-clock-alert-outline" /></v-avatar>
            <div>
              <div class="text-h5 font-weight-bold">{{ summary.overdue }}</div>
              <div class="text-caption textSecondary">Overdue</div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- 2. The money behind those claims. -->
      <v-card v-if="amounts" rounded="lg" elevation="10" class="mb-4">
        <v-card-text class="d-flex flex-wrap ga-8">
          <div>
            <p class="text-overline textSecondary mb-0">Claimed</p>
            <p class="text-h6 font-weight-semibold mb-0">{{ formatKes(amounts.claimed) }}</p>
          </div>
          <div>
            <p class="text-overline textSecondary mb-0">Approved</p>
            <p class="text-h6 font-weight-semibold text-success mb-0">{{ formatKes(amounts.approved) }}</p>
          </div>
          <div>
            <p class="text-overline textSecondary mb-0">Rejected</p>
            <p class="text-h6 font-weight-semibold text-error mb-0">{{ formatKes(amounts.rejected) }}</p>
          </div>
          <div>
            <p class="text-overline textSecondary mb-0">Paid</p>
            <p class="text-h6 font-weight-semibold mb-0">{{ formatKes(amounts.paid) }}</p>
          </div>
          <div>
            <p class="text-overline textSecondary mb-0">Outstanding</p>
            <p class="text-h6 font-weight-semibold text-warning mb-0">{{ formatKes(amounts.outstanding) }}</p>
          </div>
          <div>
            <p class="text-overline textSecondary mb-0">Awaiting payment</p>
            <p class="text-h6 font-weight-semibold mb-0">{{ amounts.awaiting_payment }}</p>
          </div>
        </v-card-text>
      </v-card>

      <!-- 3. Every status SHA can put a claim in, grouped by stage. -->
      <v-card rounded="lg" elevation="10" class="mb-6">
        <v-card-item>
          <v-card-title class="text-h6">Status breakdown</v-card-title>
          <v-card-subtitle>
            Click a status to filter the facilities below. These counts always show the whole platform.
          </v-card-subtitle>
        </v-card-item>
        <v-card-text>
          <v-row>
            <v-col v-for="s in STAGE_ORDER" :key="s" cols="12" sm="6" md="3">
              <p class="text-overline textSecondary mb-2">{{ STAGE_TITLES[s] }}</p>
              <div class="d-flex flex-column ga-2 align-start">
                <v-chip
                  v-for="meta in statusesByStage[s]" :key="meta.value"
                  :color="meta.colour"
                  :variant="status === meta.value ? 'flat' : 'tonal'"
                  size="small" link
                  @click="toggleStatus(meta.value)"
                >
                  {{ meta.title }}
                  <span class="font-weight-bold ms-2">{{ countFor(meta.value) }}</span>
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Facilities -->
      <div class="d-flex flex-wrap align-center ga-3 mb-3">
        <h3 class="text-h6 font-weight-semibold mb-0">
          Facilities <span class="textSecondary">({{ facilities.length }})</span>
        </h3>
        <v-chip v-if="filterLabel" closable color="primary" variant="tonal" size="small" @click:close="clearFilter">
          Filtered: {{ filterLabel }}
        </v-chip>
      </div>

      <v-alert
        v-if="!facilities.length" type="info" variant="tonal"
        text="No facility in this system has submitted a SHA claim yet."
      />

      <v-expansion-panels v-else variant="accordion" class="mb-8">
        <v-expansion-panel v-for="f in facilities" :key="`${f.organization_id}:${f.facility_id ?? ''}`">
          <v-expansion-panel-title>
            <div class="d-flex flex-wrap align-center ga-3 w-100 pe-3">
              <div class="flex-grow-1">
                <div class="font-weight-semibold">{{ f.facility_name || 'Facility not recorded' }}</div>
                <div class="text-caption textSecondary">
                  {{ f.hospital_name || 'Unknown hospital' }} ·
                  last synced {{ formatDateTime(f.last_synced_at, 'never') }}
                </div>
              </div>
              <div class="d-flex flex-wrap align-center ga-2">
                <v-chip v-if="f.action_required" size="x-small" color="warning" variant="flat">
                  {{ f.action_required }} need action
                </v-chip>
                <v-chip v-if="f.overdue" size="x-small" color="error" variant="flat">
                  {{ f.overdue }} overdue
                </v-chip>
                <v-chip size="x-small" color="info" variant="tonal">{{ f.in_progress }} with SHA</v-chip>
                <v-chip size="x-small" color="success" variant="tonal">{{ f.adjudicated }} adjudicated</v-chip>
                <v-chip size="x-small" variant="tonal">{{ f.total }} total</v-chip>
              </div>
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <div class="d-flex flex-wrap ga-6 mb-4">
              <div>
                <p class="text-overline textSecondary mb-0">Claimed</p>
                <p class="font-weight-semibold mb-0">{{ formatKes(f.amounts.claimed) }}</p>
              </div>
              <div>
                <p class="text-overline textSecondary mb-0">Approved</p>
                <p class="font-weight-semibold mb-0">{{ formatKes(f.amounts.approved) }}</p>
              </div>
              <div>
                <p class="text-overline textSecondary mb-0">Paid</p>
                <p class="font-weight-semibold mb-0">{{ formatKes(f.amounts.paid) }}</p>
              </div>
              <div>
                <p class="text-overline textSecondary mb-0">Outstanding</p>
                <p class="font-weight-semibold mb-0">{{ formatKes(f.amounts.outstanding) }}</p>
              </div>
            </div>

            <FacilityClaims :facility="f" :status="status" :stage="stage" />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </template>
  </div>
</template>
