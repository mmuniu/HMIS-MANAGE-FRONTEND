import { useNuxtApp } from '#app'
import type { CreateReportInput, ReportDetail, ReportSummary } from '~/types/report'

/**
 * Bug Reports & Feature Requests API.
 *   User:  /v1/platform/reports
 *   Admin: /v1/platform/admin/reports
 */
export function useReportsApi() {
  const { $axios } = useNuxtApp()

  // ---- User ----
  async function listMine(page = 1) {
    const { data } = await $axios.get('/v1/platform/reports', { params: { page } })
    return data as { data: ReportSummary[]; meta: any }
  }

  async function get(ticket: string): Promise<ReportDetail> {
    const { data } = await $axios.get(`/v1/platform/reports/${ticket}`)
    return data.data
  }

  async function create(input: CreateReportInput, onProgress?: (pct: number) => void): Promise<ReportDetail> {
    const form = new FormData()
    form.append('type', input.type)
    form.append('title', input.title)
    form.append('description', input.description)
    form.append('module', input.module)
    if (input.severity) form.append('severity', input.severity)
    if (input.browser) form.append('browser', input.browser)
    if (input.os) form.append('os', input.os)
    if (input.page_url) form.append('page_url', input.page_url)
    if (input.test_case_id) form.append('test_case_id', String(input.test_case_id))
    input.files.forEach((f) => form.append('attachments[]', f))

    const { data } = await $axios.post('/v1/platform/reports', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
      },
    })
    return data.data
  }

  async function comment(ticket: string, body: string) {
    const { data } = await $axios.post(`/v1/platform/reports/${ticket}/comments`, { body })
    return data.data
  }

  // ---- Admin ----
  async function adminList(params: Record<string, any>) {
    const { data } = await $axios.get('/v1/platform/admin/reports', { params })
    return data as { data: ReportSummary[]; meta: any }
  }

  async function adminGet(ticket: string): Promise<ReportDetail> {
    const { data } = await $axios.get(`/v1/platform/admin/reports/${ticket}`)
    return data.data
  }

  async function adminSetStatus(ticket: string, status: string) {
    const { data } = await $axios.patch(`/v1/platform/admin/reports/${ticket}/status`, { status })
    return data.data
  }

  async function adminAssignableDevs(): Promise<{ id: number; name: string }[]> {
    const { data } = await $axios.get('/v1/platform/admin/report-assignees')
    return data.data
  }

  async function adminAssign(ticket: string, assignedTo: number | null) {
    const { data } = await $axios.patch(`/v1/platform/admin/reports/${ticket}/assign`, { assigned_to: assignedTo })
    return data.data
  }

  async function adminComment(ticket: string, body: string, isInternal: boolean) {
    const { data } = await $axios.post(`/v1/platform/admin/reports/${ticket}/comments`, {
      body, is_internal: isInternal,
    })
    return data.data
  }

  async function adminDelete(ticket: string) {
    await $axios.delete(`/v1/platform/admin/reports/${ticket}`)
  }

  // ---- Work queue (Bugs & Features): dev sees own, system_admin sees all ----
  async function work(params: Record<string, any> = {}) {
    const { data } = await $axios.get('/v1/platform/work', { params })
    return data as { data: ReportSummary[]; meta: any & { scope: 'all' | 'mine' } }
  }

  return {
    listMine, get, create, comment,
    adminList, adminGet, adminSetStatus, adminComment,
    adminAssignableDevs, adminAssign, adminDelete, work,
  }
}
