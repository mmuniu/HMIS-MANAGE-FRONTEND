<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTestCasesStore } from '@/stores/testCases'
import { useTestCasesApi } from '@/composables/useTestCasesApi'
import { useNuxtApp } from '#app'
import TestCaseForm from '@/components/hmis/TestCaseForm.vue'

const store = useTestCasesStore()
const api = useTestCasesApi()
const router = useRouter()
const { $showToast } = useNuxtApp()

const saving = ref(false)

onMounted(() => store.loadSuites())

async function onSubmit(payload: Record<string, any>) {
  saving.value = true
  try {
    const res = await api.createCase(payload)
    $showToast(res.message || 'Test case created.')
    router.push(`/test-cases/${res.data.suite_slug}`)
  } catch (err: any) {
    $showToast(err?.response?.data?.message || 'Failed to create test case.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-3" to="/test-cases">All test cases</v-btn>
    <h2 class="text-h4 font-weight-semibold mb-1">New Test Case</h2>
    <p class="textSecondary mb-6">Fill in the fields. Pick an existing suite or type a new role to start one.</p>

    <v-card rounded="lg" elevation="10">
      <v-card-text>
        <TestCaseForm
          :suites="store.suites"
          :loading="saving"
          @submit="onSubmit"
          @cancel="router.push('/test-cases')"
        />
      </v-card-text>
    </v-card>
  </div>
</template>
