import { useNuxtApp } from '#app'

export interface TesterVerdicts {
  pass: number
  fail: number
  untested: number
  executed: number
  total: number
}

export interface TesterActivityRow {
  id: number
  name: string
  username: string
  email: string
  role: 'tester' | 'qa'
  can_author: boolean
  verdicts: TesterVerdicts
  pass_rate: number
  authored: { suites: number; cases: number }
  last_active_at: string | null
}

export interface RecentVerdict {
  id: number
  user: string | null
  role: string | null
  verdict: 'pass' | 'fail'
  case_id: string | null
  case_title: string | null
  suite: string | null
  suite_slug: string | null
  note: string | null
  at: string | null
}

export interface TesterActivity {
  totals: { testers: number; qa: number; pass: number; fail: number; executed: number }
  testers: TesterActivityRow[]
  recent: RecentVerdict[]
}

/**
 * Developer-only: track testers' journey (verdicts, authored tests, activity).
 *   GET /v1/platform/staff/tester-activity
 */
export function useTesterActivityApi() {
  const { $axios } = useNuxtApp()

  async function fetch(): Promise<TesterActivity> {
    const { data } = await $axios.get('/v1/platform/staff/tester-activity')
    return data.data
  }

  return { fetch }
}
