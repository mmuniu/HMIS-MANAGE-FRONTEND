<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useDeploymentsStore } from '@/stores/deployments'
import { TRAINING_SESSION_STATUS_COLOR } from '@/types/deployment'
import type { DeploymentTrainingSessionEntry, TrainingSessionStatus } from '@/types/deployment'

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

const sessions = computed(() => store.current?.training_sessions || [])

const newSession = reactive({
  title: '',
  session_date: '',
  trainer_name: '',
  department: '',
  attendee_count: null as number | null,
})
const adding = ref(false)

async function addSession() {
  if (!newSession.title.trim()) return
  adding.value = true
  const res = await store.addTrainingSession(props.deploymentId, {
    title: newSession.title,
    session_date: newSession.session_date || undefined,
    trainer_name: newSession.trainer_name || undefined,
    department: newSession.department || undefined,
    attendee_count: newSession.attendee_count ?? undefined,
  })
  if (res.success) {
    newSession.title = ''
    newSession.session_date = ''
    newSession.trainer_name = ''
    newSession.department = ''
    newSession.attendee_count = null
  }
  adding.value = false
}

const STATUS_OPTIONS: { title: string; value: TrainingSessionStatus }[] = [
  { title: 'Scheduled', value: 'SCHEDULED' },
  { title: 'Completed', value: 'COMPLETED' },
  { title: 'Cancelled', value: 'CANCELLED' },
]

const busyId = ref<number | null>(null)

async function setStatus(session: DeploymentTrainingSessionEntry, status: TrainingSessionStatus) {
  busyId.value = session.id
  await store.updateTrainingSession(props.deploymentId, session.id, { status })
  busyId.value = null
}

async function removeSession(session: DeploymentTrainingSessionEntry) {
  busyId.value = session.id
  await store.deleteTrainingSession(props.deploymentId, session.id)
  busyId.value = null
}
</script>

<template>
  <v-dialog v-model="localShow" max-width="720px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Training & Support
        <v-btn icon="mdi-close" variant="text" size="small" @click="localShow = false" />
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 70vh">
        <div class="d-flex flex-wrap ga-2 align-center mb-4">
          <v-text-field v-model="newSession.title" label="Session title" density="compact" variant="outlined" hide-details style="max-width: 220px" />
          <v-text-field v-model="newSession.session_date" type="date" label="Date" density="compact" variant="outlined" hide-details style="max-width: 160px" />
          <v-text-field v-model="newSession.trainer_name" label="Trainer" density="compact" variant="outlined" hide-details style="max-width: 160px" />
          <v-text-field v-model="newSession.department" label="Department" density="compact" variant="outlined" hide-details style="max-width: 160px" />
          <v-text-field v-model.number="newSession.attendee_count" type="number" label="Attendees" density="compact" variant="outlined" hide-details style="max-width: 120px" />
          <v-btn color="primary" variant="tonal" :loading="adding" :disabled="!newSession.title.trim()" @click="addSession">
            Add session
          </v-btn>
        </div>

        <v-divider class="mb-4" />

        <div v-for="session in sessions" :key="session.id" class="d-flex flex-wrap align-center ga-3 mb-3">
          <div style="min-width: 200px; flex: 1 1 200px">
            <div class="font-weight-medium">{{ session.title }}</div>
            <div class="text-caption textSecondary">
              <span v-if="session.session_date">{{ session.session_date }} — </span>
              <span v-if="session.trainer_name">{{ session.trainer_name }}</span>
              <span v-if="session.department"> · {{ session.department }}</span>
              <span v-if="session.attendee_count != null"> · {{ session.attendee_count }} attendees</span>
            </div>
          </div>
          <v-chip size="small" variant="tonal" label :color="TRAINING_SESSION_STATUS_COLOR[session.status]">
            {{ session.status }}
          </v-chip>
          <v-select
            :model-value="null"
            :items="STATUS_OPTIONS"
            label="Set status" density="compact" variant="outlined" hide-details style="max-width: 160px"
            @update:model-value="(v) => v && setStatus(session, v)"
          />
          <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" :loading="busyId === session.id" @click="removeSession(session)" />
        </div>
        <p v-if="!sessions.length" class="text-body-2 textSecondary">No training sessions logged yet.</p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
