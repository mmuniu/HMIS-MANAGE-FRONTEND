<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useDeploymentsStore } from '@/stores/deployments'
import type { DeploymentCheckInEntry } from '@/types/deployment'

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

const checkIns = computed(() => store.current?.check_ins || [])
const status = computed(() => store.current?.check_in_status || null)

const notes = reactive<Record<number, string>>({})
const completing = ref<number | null>(null)

async function complete(checkIn: DeploymentCheckInEntry) {
  completing.value = checkIn.id
  await store.completeCheckIn(props.deploymentId, checkIn.id, { notes: notes[checkIn.id] || undefined })
  completing.value = null
}
</script>

<template>
  <v-dialog v-model="localShow" max-width="640px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Customer Check-ins
        <v-btn icon="mdi-close" variant="text" size="small" @click="localShow = false" />
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 70vh">
        <p v-if="status" class="text-body-2 mb-4">
          <span v-if="status.next_due_date">
            Next check-in due {{ status.next_due_date }}
            <v-chip v-if="status.is_overdue" size="x-small" variant="tonal" color="error" label class="ml-2">Overdue</v-chip>
          </span>
          <span v-else>No pending check-in.</span>
          — {{ status.total_completed }} completed so far.
        </p>

        <div v-for="checkIn in checkIns" :key="checkIn.id" class="d-flex flex-wrap align-center ga-3 mb-3">
          <div style="min-width: 160px">
            <div class="font-weight-medium">Due {{ checkIn.due_date }}</div>
            <div class="text-caption textSecondary">
              {{ checkIn.completed_at ? `Completed ${checkIn.completed_at}` : 'Pending' }}
            </div>
          </div>
          <v-chip size="small" variant="tonal" :color="checkIn.completed_at ? 'success' : 'warning'" label>
            {{ checkIn.completed_at ? 'Completed' : 'Pending' }}
          </v-chip>
          <template v-if="!checkIn.completed_at">
            <v-text-field
              v-model="notes[checkIn.id]"
              label="Notes" density="compact" variant="outlined" hide-details style="max-width: 240px"
            />
            <v-btn color="primary" variant="tonal" :loading="completing === checkIn.id" @click="complete(checkIn)">
              Mark complete
            </v-btn>
          </template>
          <p v-else-if="checkIn.notes" class="text-body-2 mb-0">{{ checkIn.notes }}</p>
        </div>
        <p v-if="!checkIns.length" class="text-body-2 textSecondary">No check-ins yet — the first one is created automatically once Stage 15 (Handover) completes.</p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
