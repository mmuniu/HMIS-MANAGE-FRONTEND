import type { AxiosInstance } from 'axios'
import 'nuxt/app'

declare module '#app' {
  interface NuxtApp {
    $axios: AxiosInstance
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance
  }
}
