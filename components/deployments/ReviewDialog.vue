<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useDeploymentsStore } from '@/stores/deployments'

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

const form = reactive({
  technical_review: '',
  operational_review: '',
  customer_review: '',
  internal_review: '',
})

watch(() => store.current?.review, (r) => {
  form.technical_review = r?.technical_review || ''
  form.operational_review = r?.operational_review || ''
  form.customer_review = r?.customer_review || ''
  form.internal_review = r?.internal_review || ''
}, { immediate: true })

const saving = ref(false)

async function save() {
  saving.value = true
  await store.upsertReview(props.deploymentId, {
    technical_review: form.technical_review || undefined,
    operational_review: form.operational_review || undefined,
    customer_review: form.customer_review || undefined,
    internal_review: form.internal_review || undefined,
  })
  saving.value = false
}
</script>

<template>
  <v-dialog v-model="localShow" max-width="680px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Post-Handover Review
        <v-btn icon="mdi-close" variant="text" size="small" @click="localShow = false" />
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 70vh">
        <v-textarea
          v-model="form.technical_review"
          label="Technical review (system stability, infrastructure, integration, recurring incidents, performance)"
          density="compact" variant="outlined" rows="3" class="mb-2"
        />
        <v-textarea
          v-model="form.operational_review"
          label="Operational review (training effectiveness, user adoption, workflow issues, gaps)"
          density="compact" variant="outlined" rows="3" class="mb-2"
        />
        <v-textarea
          v-model="form.customer_review"
          label="Customer review (satisfaction, outstanding requirements, expansion opportunities)"
          density="compact" variant="outlined" rows="3" class="mb-2"
        />
        <v-textarea
          v-model="form.internal_review"
          label="Internal review (what went well/failed, causes of delay, what should change)"
          density="compact" variant="outlined" rows="3" class="mb-2"
        />
        <v-btn color="primary" variant="tonal" :loading="saving" @click="save">
          Save review
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
