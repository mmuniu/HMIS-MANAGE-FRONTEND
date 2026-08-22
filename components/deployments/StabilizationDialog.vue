<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useDeploymentsStore } from '@/stores/deployments'
import {
  INCIDENT_CATEGORIES,
  INCIDENT_CATEGORY_LABEL,
  INCIDENT_STATUS_COLOR,
  STAGE_STABILIZATION_NUMBER,
} from '@/types/deployment'
import type { DeploymentIncidentEntry, IncidentCategory } from '@/types/deployment'

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

const stabilization = computed(() => store.current?.stabilization || null)
const status = computed(() => store.current?.stabilization_status || null)
const incidents = computed(() => store.current?.incidents.filter((i) => i.stage_number === STAGE_STABILIZATION_NUMBER) || [])

const notes = ref('')
const savingNotes = ref(false)

async function saveNotes() {
  savingNotes.value = true
  await store.updateStabilization(props.deploymentId, { notes: notes.value })
  savingNotes.value = false
}

const newIncident = reactive<{ title: string; category: IncidentCategory; critical: boolean }>({
  title: '',
  category: 'INCIDENT',
  critical: false,
})
const adding = ref(false)

async function addIncident() {
  if (!newIncident.title.trim()) return
  adding.value = true
  const res = await store.addIncident(props.deploymentId, {
    stage_number: STAGE_STABILIZATION_NUMBER,
    category: newIncident.category,
    critical: newIncident.critical,
    title: newIncident.title,
  })
  if (res.success) {
    newIncident.title = ''
    newIncident.category = 'INCIDENT'
    newIncident.critical = false
  }
  adding.value = false
}

function categoryLabel(category: string): string {
  return INCIDENT_CATEGORY_LABEL[category as IncidentCategory]
}

const busyId = ref<number | null>(null)

async function resolveIncident(incident: DeploymentIncidentEntry) {
  busyId.value = incident.id
  await store.updateIncident(props.deploymentId, incident.id, { status: 'RESOLVED' })
  busyId.value = null
}

async function reopenIncident(incident: DeploymentIncidentEntry) {
  busyId.value = incident.id
  await store.updateIncident(props.deploymentId, incident.id, { status: 'OPEN' })
  busyId.value = null
}
</script>

<template>
  <v-dialog v-model="localShow" max-width="720px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Stabilization
        <v-btn icon="mdi-close" variant="text" size="small" @click="localShow = false" />
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 70vh">
        <div v-if="stabilization" class="mb-4">
          <p class="text-h6 mb-1">Day {{ status?.current_day ?? '—' }} / {{ status?.total_days ?? '—' }}</p>
          <p class="text-body-2 textSecondary mb-0">
            {{ stabilization.start_date }} → {{ stabilization.end_date }}
            <span v-if="status?.period_elapsed"> — period elapsed</span>
            <span v-else> — {{ status?.remaining_days }} day(s) remaining</span>
          </p>
        </div>
        <p v-else class="text-body-2 textSecondary mb-4">
          Stabilization hasn't started yet — it begins automatically once Stage 12 (Hypercare) is complete.
        </p>

        <v-divider class="mb-4" />

        <h4 class="text-subtitle-1 font-weight-medium mb-2">Incidents</h4>
        <div class="d-flex flex-wrap ga-2 align-center mb-3">
          <v-text-field v-model="newIncident.title" label="Title" density="compact" variant="outlined" hide-details style="max-width: 240px" />
          <v-select v-model="newIncident.category" :items="INCIDENT_CATEGORIES" label="Category" density="compact" variant="outlined" hide-details style="max-width: 200px">
            <template #selection="{ item }">{{ categoryLabel(item.raw) }}</template>
            <template #item="{ item, props: itemProps }">
              <v-list-item v-bind="itemProps" :title="categoryLabel(item.raw)" />
            </template>
          </v-select>
          <v-checkbox v-model="newIncident.critical" label="Critical" density="compact" hide-details />
          <v-btn color="primary" variant="tonal" :loading="adding" :disabled="!newIncident.title.trim()" @click="addIncident">
            Log incident
          </v-btn>
        </div>
        <div v-for="incident in incidents" :key="incident.id" class="d-flex flex-wrap align-center ga-3 mb-2">
          <div style="min-width: 200px; flex: 1 1 200px">{{ incident.title }}</div>
          <v-chip size="small" variant="tonal" label>{{ INCIDENT_CATEGORY_LABEL[incident.category] }}</v-chip>
          <v-chip v-if="incident.critical" size="small" variant="tonal" color="error" label>Critical</v-chip>
          <v-chip size="small" variant="tonal" label :color="INCIDENT_STATUS_COLOR[incident.status]">{{ incident.status }}</v-chip>
          <v-btn
            v-if="incident.status === 'OPEN'"
            size="small" variant="tonal" color="success" :loading="busyId === incident.id"
            @click="resolveIncident(incident)"
          >
            Resolve
          </v-btn>
          <v-btn v-else size="small" variant="text" :loading="busyId === incident.id" @click="reopenIncident(incident)">
            Reopen
          </v-btn>
        </div>
        <p v-if="!incidents.length" class="text-body-2 textSecondary mb-2">No incidents logged.</p>

        <v-divider class="my-4" />

        <v-textarea v-model="notes" label="Notes" density="compact" variant="outlined" rows="2" class="mb-2" />
        <v-btn color="primary" variant="tonal" :loading="savingNotes" :disabled="!stabilization" @click="saveNotes">
          Save notes
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
