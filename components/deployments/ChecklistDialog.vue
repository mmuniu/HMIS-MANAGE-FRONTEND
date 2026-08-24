<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useDeploymentsStore } from '@/stores/deployments'
import { CHECKLIST_ITEM_STATUS_COLOR } from '@/types/deployment'
import type { ChecklistItemStatus, DeploymentChecklistItemEntry } from '@/types/deployment'

interface Props {
  show: boolean
  deploymentId: string
  stageNumber: number
  title: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:show'])

const store = useDeploymentsStore()

const localShow = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const STATUS_OPTIONS: { title: string; value: ChecklistItemStatus }[] = [
  { title: 'Pending', value: 'PENDING' },
  { title: 'In progress', value: 'IN_PROGRESS' },
  { title: 'Passed', value: 'PASSED' },
  { title: 'Failed', value: 'FAILED' },
  { title: 'Not applicable', value: 'NOT_APPLICABLE' },
  { title: 'Blocked', value: 'BLOCKED' },
]

// One local {status, notes} draft per item — lets a row's notes be edited
// without saving on every keystroke; status changes save immediately.
const drafts = reactive<Record<number, { status: ChecklistItemStatus; notes: string }>>({})
const savingId = ref<number | null>(null)

function syncDrafts(items: DeploymentChecklistItemEntry[]) {
  for (const item of items) {
    if (!drafts[item.id]) {
      drafts[item.id] = { status: item.status, notes: item.notes || '' }
    }
  }
}

const items = computed(() => {
  const all = store.current?.checklist_items.filter((i) => i.stage_number === props.stageNumber) || []
  syncDrafts(all)
  return all
})

const grouped = computed(() => {
  const groups: Record<string, DeploymentChecklistItemEntry[]> = {}
  for (const item of items.value) {
    ;(groups[item.category] ||= []).push(item)
  }
  return groups
})

function categoryLabel(category: string) {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

async function save(item: DeploymentChecklistItemEntry) {
  savingId.value = item.id
  await store.updateChecklistItem(props.deploymentId, item.id, {
    status: drafts[item.id].status,
    notes: drafts[item.id].notes,
  })
  savingId.value = null
}

function onStatusChange(item: DeploymentChecklistItemEntry) {
  save(item)
}
</script>


<template>
  <v-dialog v-model="localShow" max-width="720px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        {{ title }}
        <v-btn icon="mdi-close" variant="text" size="small" @click="localShow = false" />
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 70vh">
        <div v-for="(groupItems, category) in grouped" :key="category" class="mb-6">
          <h4 class="text-subtitle-1 font-weight-medium mb-2">{{ categoryLabel(category) }}</h4>
          <div v-for="item in groupItems" :key="item.id" class="d-flex flex-wrap align-center ga-3 mb-3">
            <div style="min-width: 220px; flex: 1 1 220px">
              <span>{{ item.label }}</span>
              <v-chip size="x-small" variant="tonal" label class="ml-2" :color="CHECKLIST_ITEM_STATUS_COLOR[item.status]">
                {{ item.status.replace('_', ' ') }}
              </v-chip>
            </div>
            <v-select
              v-model="drafts[item.id].status"
              :items="STATUS_OPTIONS"
              density="compact" variant="outlined" hide-details style="max-width: 180px"
              @update:model-value="onStatusChange(item)"
            />
            <v-text-field
              v-model="drafts[item.id].notes"
              label="Notes" density="compact" variant="outlined" hide-details style="max-width: 220px"
              @blur="save(item)"
            />
            <v-progress-circular v-if="savingId === item.id" indeterminate size="20" width="2" color="primary" />
          </div>
        </div>
        <p v-if="!items.length" class="text-body-2 textSecondary">No checklist items for this stage.</p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
