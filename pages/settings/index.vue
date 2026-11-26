<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsApi, type PlatformSettings } from '@/composables/useSettingsApi'
import { useNuxtApp } from '#app'

const api = useSettingsApi()
const { $showToast } = useNuxtApp()

const settings = ref<PlatformSettings | null>(null)
const loading = ref(false)
const saving = ref(false)

async function load() {
  loading.value = true
  try {
    settings.value = await api.get()
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Failed to load settings.')
  } finally {
    loading.value = false
  }
}

async function toggleSha(value: boolean | null) {
  if (!settings.value) return
  const previous = settings.value.sha_integration_enabled
  settings.value.sha_integration_enabled = !!value
  saving.value = true
  try {
    settings.value = await api.update({ sha_integration_enabled: !!value })
    $showToast(`SHA integration turned ${value ? 'on' : 'off'}.`)
  } catch (e: any) {
    settings.value.sha_integration_enabled = previous
    $showToast(e?.response?.data?.message || 'Could not update the setting.')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h4 font-weight-semibold">Settings</h2>
      <p class="textSecondary mb-0">Platform-wide settings. Changes apply to every user immediately.</p>
    </div>

    <v-card rounded="lg" elevation="10" :loading="loading">
      <v-card-item>
        <v-card-title class="text-h6">Integrations</v-card-title>
      </v-card-item>
      <v-divider />
      <v-card-text>
        <div class="d-flex align-start justify-space-between ga-4">
          <div>
            <div class="font-weight-semibold mb-1">SHA integration</div>
            <p class="textSecondary text-body-2 mb-0">
              When on, Register Hospital looks facilities up in the SHA / DHA registry and its facility
              details are filled from the registry and locked. When off, the lookup is hidden and those
              fields are typed in by hand.
            </p>
          </div>
          <v-switch
            :model-value="settings?.sha_integration_enabled ?? false"
            :disabled="!settings"
            :loading="saving"
            color="primary"
            hide-details
            inset
            @update:model-value="toggleSha"
          />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.ga-4 { gap: 16px; }
</style>
