<script setup lang="ts">
import { reactive, ref, computed } from 'vue'

interface SuiteOption { title: string; value: string }

const props = defineProps<{
  // Existing suites to choose from (slug + role label).
  suites: { slug: string; role: string }[]
  // When editing, the case is locked to its suite.
  editing?: boolean
  initial?: Record<string, any>
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', payload: Record<string, any>): void
  (e: 'cancel'): void
}>()

const suiteOptions = computed<SuiteOption[]>(() =>
  props.suites.map((s) => ({ title: s.role, value: s.slug })),
)

const form = reactive({
  // suite: either an existing slug or a freshly typed role name.
  suite: props.initial?.suite_slug ?? '',
  case_id: props.initial?.case_id ?? '',
  module_name: props.initial?.module_name ?? '',
  module_code: props.initial?.module_code ?? '',
  title: props.initial?.title ?? '',
  documented_status: props.initial?.documented_status ?? 'PENDING',
  preconditions: [...(props.initial?.preconditions ?? [''])] as string[],
  steps: [...(props.initial?.steps ?? [''])] as string[],
  expected: props.initial?.expected ?? '',
})

const errors = ref<string[]>([])

const addLine = (arr: string[]) => arr.push('')
const removeLine = (arr: string[], i: number) => arr.splice(i, 1)

function buildPayload() {
  const isExistingSlug = props.suites.some((s) => s.slug === form.suite)
  const payload: Record<string, any> = {
    case_id: form.case_id.trim(),
    module_name: form.module_name.trim(),
    module_code: form.module_code.trim() || null,
    title: form.title.trim(),
    documented_status: form.documented_status,
    preconditions: form.preconditions.map((s) => s.trim()).filter(Boolean),
    steps: form.steps.map((s) => s.trim()).filter(Boolean),
    expected: form.expected.trim() || null,
  }
  if (!props.editing) {
    // New case: pick existing suite by slug, or send a new role name.
    if (isExistingSlug) payload.suite_slug = form.suite
    else payload.suite_role = (form.suite || '').trim()
  }
  return payload
}

function validate(): boolean {
  errors.value = []
  if (!props.editing && !String(form.suite).trim()) errors.value.push('Choose or type a suite/role.')
  if (!form.case_id.trim()) errors.value.push('Case ID is required (e.g. TC-A-AUTH-01).')
  if (!form.module_name.trim()) errors.value.push('Module name is required.')
  if (!form.title.trim()) errors.value.push('Title is required.')
  if (!form.steps.some((s) => s.trim())) errors.value.push('Add at least one test step.')
  return errors.value.length === 0
}

function onSubmit() {
  if (!validate()) return
  emit('submit', buildPayload())
}
</script>

<template>
  <v-form @submit.prevent="onSubmit">
    <v-alert v-if="errors.length" type="error" variant="tonal" rounded="lg" class="mb-4">
      <ul class="pl-4 mb-0"><li v-for="(e, i) in errors" :key="i">{{ e }}</li></ul>
    </v-alert>

    <v-row dense>
      <v-col cols="12" md="6">
        <v-combobox
          v-if="!editing"
          v-model="form.suite"
          :items="suiteOptions"
          item-title="title"
          item-value="value"
          :return-object="false"
          label="Suite / Role (pick existing or type a new one)"
          variant="outlined"
          density="comfortable"
          hide-details
        />
        <v-text-field
          v-else
          :model-value="initial?.suite_role || 'This suite'"
          label="Suite / Role"
          variant="outlined"
          density="comfortable"
          hide-details
          disabled
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field v-model="form.case_id" label="Case ID" placeholder="TC-A-AUTH-01"
          variant="outlined" density="comfortable" hide-details />
      </v-col>
      <v-col cols="12" md="3">
        <v-select v-model="form.documented_status" :items="['PASS', 'FAIL', 'PENDING']"
          label="Documented status" variant="outlined" density="comfortable" hide-details />
      </v-col>

      <v-col cols="12" md="8">
        <v-text-field v-model="form.module_name" label="Module name" placeholder="Authentication"
          variant="outlined" density="comfortable" hide-details />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field v-model="form.module_code" label="Module code" placeholder="AUTH"
          variant="outlined" density="comfortable" hide-details />
      </v-col>

      <v-col cols="12">
        <v-text-field v-model="form.title" label="Title" placeholder="Successful login and correct sidebar"
          variant="outlined" density="comfortable" hide-details />
      </v-col>
    </v-row>

    <!-- Preconditions -->
    <p class="text-overline textSecondary mt-5 mb-1">Preconditions</p>
    <div v-for="(p, i) in form.preconditions" :key="`pre-${i}`" class="d-flex align-center gap-2 mb-2">
      <v-text-field v-model="form.preconditions[i]" :placeholder="`Precondition ${i + 1}`"
        variant="outlined" density="compact" hide-details />
      <v-btn icon="mdi-close" size="small" variant="text" @click="removeLine(form.preconditions, i)" />
    </div>
    <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-plus" @click="addLine(form.preconditions)">
      Add precondition
    </v-btn>

    <!-- Steps -->
    <p class="text-overline textSecondary mt-5 mb-1">Test Steps</p>
    <div v-for="(s, i) in form.steps" :key="`step-${i}`" class="d-flex align-center gap-2 mb-2">
      <span class="textSecondary" style="min-width: 20px">{{ i + 1 }}.</span>
      <v-text-field v-model="form.steps[i]" :placeholder="`Step ${i + 1}`"
        variant="outlined" density="compact" hide-details />
      <v-btn icon="mdi-close" size="small" variant="text" @click="removeLine(form.steps, i)" />
    </div>
    <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-plus" @click="addLine(form.steps)">
      Add step
    </v-btn>

    <!-- Expected -->
    <p class="text-overline textSecondary mt-5 mb-1">Expected Result</p>
    <v-textarea v-model="form.expected" placeholder="The correct system behaviour..."
      variant="outlined" density="comfortable" rows="3" auto-grow hide-details />

    <div class="d-flex gap-2 mt-6">
      <v-btn color="primary" type="submit" :loading="loading" prepend-icon="mdi-content-save">
        {{ editing ? 'Save changes' : 'Create test case' }}
      </v-btn>
      <v-btn variant="text" @click="emit('cancel')">Cancel</v-btn>
    </div>
  </v-form>
</template>

<style scoped>
.gap-2 { gap: 8px; }
</style>
