<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useDeploymentsStore } from '@/stores/deployments'
import { MIGRATION_STATUSES, MIGRATION_STATUS_LABEL } from '@/types/deployment'
import type { MigrationStatus } from '@/types/deployment'

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

const requiresMigration = computed(() => !!store.current?.work_plan?.requires_migration)
const migration = computed(() => store.current?.migration || null)

const STATUS_OPTIONS = MIGRATION_STATUSES.map((status) => ({ title: MIGRATION_STATUS_LABEL[status], value: status }))

const form = reactive<{ status: MigrationStatus; records_assessed: number | null; records_migrated: number | null; records_failed: number | null; notes: string }>({
  status: 'ASSESSMENT',
  records_assessed: null,
  records_migrated: null,
  records_failed: null,
  notes: '',
})

watch(migration, (m) => {
  form.status = (m?.status as MigrationStatus) || 'ASSESSMENT'
  form.records_assessed = m?.records_assessed ?? null
  form.records_migrated = m?.records_migrated ?? null
  form.records_failed = m?.records_failed ?? null
  form.notes = m?.notes || ''
}, { immediate: true })

const saving = ref(false)

async function save() {
  saving.value = true
  await store.upsertMigration(props.deploymentId, {
    status: form.status,
    records_assessed: form.records_assessed ?? undefined,
    records_migrated: form.records_migrated ?? undefined,
    records_failed: form.records_failed ?? undefined,
    notes: form.notes || undefined,
  })
  saving.value = false
}
</script>

<template>
  <v-dialog v-model="localShow" max-width="600px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Data Migration
        <v-btn icon="mdi-close" variant="text" size="small" @click="localShow = false" />
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 70vh">
        <div v-if="!requiresMigration">
          <p class="text-body-2 textSecondary">
            This deployment's work plan (Stage 5) doesn't require data migration — nothing to
            track here. Set "Requires data migration" on the work plan if that changes.
          </p>
        </div>
        <div v-else>
          <v-select
            v-model="form.status"
            :items="STATUS_OPTIONS"
            label="Migration status" density="compact" variant="outlined" class="mb-2"
          />
          <div class="d-flex flex-wrap ga-2 mb-2">
            <v-text-field v-model.number="form.records_assessed" type="number" label="Records assessed" density="compact" variant="outlined" style="max-width: 180px" />
            <v-text-field v-model.number="form.records_migrated" type="number" label="Records migrated" density="compact" variant="outlined" style="max-width: 180px" />
            <v-text-field v-model.number="form.records_failed" type="number" label="Records failed" density="compact" variant="outlined" style="max-width: 180px" />
          </div>
          <v-textarea v-model="form.notes" label="Notes" density="compact" variant="outlined" rows="2" class="mb-2" />
          <v-btn color="primary" variant="tonal" :loading="saving" @click="save">Save migration status</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
