import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTestCasesApi } from '@/composables/useTestCasesApi'

export type Verdict = 'pass' | 'fail' | 'untested'

export interface Stats { pass: number; fail: number; untested: number; total: number }

export interface SuiteSummary {
  slug: string
  role: string
  total: number
  modules: number
  stats: Stats
}

export interface LinkedBug {
  ticket_id: string
  title: string
  status: string
}

export interface TestCase {
  id: number
  case_id: string
  title: string
  documented_status: string
  approval_status?: 'pending' | 'approved' | 'rejected'
  preconditions: string[]
  steps: string[]
  expected: string
  verdict: Verdict
  note: string | null
  bugs?: LinkedBug[]
}
export interface TestModule { name: string; code: string; cases: TestCase[] }
export interface SuiteDetail {
  slug: string
  role: string
  total: number
  modules: TestModule[]
  stats: Stats
}

export const useTestCasesStore = defineStore('testCases', () => {
  const api = useTestCasesApi()

  const suites = ref<SuiteSummary[]>([])
  const current = ref<SuiteDetail | null>(null)
  const loading = ref(false)
  const uploading = ref(false)
  const lastError = ref('')

  async function loadSuites() {
    loading.value = true
    lastError.value = ''
    try {
      suites.value = await api.listSuites()
    } catch (err: any) {
      lastError.value = err?.response?.data?.message || 'Failed to load test suites.'
    } finally {
      loading.value = false
    }
  }

  async function loadSuite(slug: string) {
    loading.value = true
    lastError.value = ''
    current.value = null
    try {
      current.value = await api.getSuite(slug)
    } catch (err: any) {
      lastError.value = err?.response?.data?.message || 'Failed to load test suite.'
    } finally {
      loading.value = false
    }
  }

  async function upload(file: File) {
    uploading.value = true
    lastError.value = ''
    try {
      const res = await api.uploadSuite(file)
      await loadSuites()
      return { success: true, message: res.message }
    } catch (err: any) {
      lastError.value = err?.response?.data?.message || 'Upload failed.'
      return { error: lastError.value }
    } finally {
      uploading.value = false
    }
  }

  // Record a verdict and optimistically update the loaded suite + its stats.
  async function setVerdict(c: TestCase, verdict: Verdict, note?: string) {
    const prev = c.verdict
    const result = await api.recordResult(c.id, verdict, note ?? c.note ?? undefined)
    c.verdict = result.verdict
    c.note = result.note
    recomputeStats(prev, c.verdict)
    return result
  }

  async function setNote(c: TestCase, note: string) {
    c.note = note
    // Persist note against the current verdict (defaults to untested).
    await api.recordResult(c.id, c.verdict, note)
  }

  function recomputeStats(prev: Verdict, next: Verdict) {
    if (!current.value || prev === next) return
    const s = current.value.stats
    if (prev === 'pass') s.pass--
    else if (prev === 'fail') s.fail--
    else s.untested--
    if (next === 'pass') s.pass++
    else if (next === 'fail') s.fail++
    else s.untested++
  }

  return {
    suites,
    current,
    loading,
    uploading,
    lastError,
    loadSuites,
    loadSuite,
    upload,
    setVerdict,
    setNote,
  }
})
