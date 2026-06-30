<template>
  <v-menu :close-on-content-click="false" v-model="open">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="tonal"
        color="primary"
        size="small"
        rounded="pill"
        class="text-none"
        prepend-icon="mdi-hospital-building"
      >
        {{ activeFacilityName }}
        <v-icon end icon="mdi-chevron-down" />
      </v-btn>
    </template>

    <v-sheet rounded="lg" elevation="10" width="300" class="pa-2">
      <p class="text-overline px-3 pt-2 textSecondary">Organization</p>
      <p class="px-3 pb-2 text-subtitle-2">{{ tenant.context?.organization_name || tenant.organizationId || '—' }}</p>
      <v-divider class="mb-2" />
      <p class="text-overline px-3 textSecondary">Switch facility</p>
      <v-list density="compact" nav>
        <v-list-item
          v-for="f in facilities"
          :key="f.id"
          :active="f.id === tenant.activeFacilityId"
          :title="f.name"
          :disabled="auth.isSwitchingFacility"
          @click="onSwitch(f.id)"
        >
          <template #prepend>
            <v-icon
              v-if="switchingId !== f.id"
              :icon="f.id === tenant.activeFacilityId ? 'mdi-check-circle' : 'mdi-circle-outline'"
              :color="f.id === tenant.activeFacilityId ? 'primary' : undefined"
              size="small"
            />
            <v-progress-circular
              v-else
              indeterminate
              color="primary"
              size="16"
              width="2"
            />
          </template>
        </v-list-item>
        <v-list-item v-if="!facilities.length" title="No facilities" disabled />
      </v-list>
    </v-sheet>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'

const auth = useAuthStore()
const tenant = useTenantStore()

const open = ref(false)
const switchingId = ref<string | null>(null)

// Prefer the named facility list from the enriched context; fall back to ids.
const facilities = computed(() => {
  const named = tenant.context?.facilities
  if (named && named.length) return named
  return tenant.allowedFacilityIds.map((id) => ({ id, name: id }))
})

const activeFacilityName = computed(() => {
  const id = tenant.activeFacilityId
  if (!id) return 'No facility'
  return facilities.value.find((f) => f.id === id)?.name ?? id
})

// Switch in-session — no logout, no password. Backend re-issues the token.
async function onSwitch(facilityId: string) {
  if (facilityId === tenant.activeFacilityId || auth.isSwitchingFacility) return
  switchingId.value = facilityId
  const result = await auth.switchFacility(facilityId)
  switchingId.value = null
  if (result.success) open.value = false
}
</script>
