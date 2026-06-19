import axios from 'axios'
import { useCookie, watch, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('auth_token')

  const instance = axios.create({
    baseURL: config.public.BASE_URL,
    timeout: 10000,
    withCredentials: false,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
  })

  if (token.value) instance.defaults.headers.common['Authorization'] = `Bearer ${token.value}`

  instance.interceptors.request.use((req) => {
    const t = token.value
    if (t) {
      req.headers = req.headers || {}
      req.headers['Authorization'] = `Bearer ${t}`
      instance.defaults.headers.common['Authorization'] = `Bearer ${t}`
    } else {
      delete req.headers?.['Authorization']
      delete instance.defaults.headers.common['Authorization']
    }
    console.log('[axios] token:', token.value, '-> request Authorization:', req.headers?.Authorization)
    return req
  })

  instance.interceptors.response.use(res => res, (error) => {
    console.error('[axios] response error', { status: error?.response?.status, url: error?.config?.url, headersSent: error?.config?.headers, resp: error?.response?.data })
    return Promise.reject(error)
  })

  watch(token, (val) => {
    if (val) instance.defaults.headers.common['Authorization'] = `Bearer ${val}`
    else delete instance.defaults.headers.common['Authorization']
  }, { immediate: true })

  return { provide: { axios: instance } }
})
