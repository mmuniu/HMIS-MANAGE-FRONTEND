<template>
  <div>
    <v-menu :close-on-content-click="false" v-model="menuOpen">
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
          {{ tenant.activeFacilityId || 'No facility' }}
          <v-icon end icon="mdi-chevron-down" />
        </v-btn>
      </template>

      <v-sheet rounded="lg" elevation="10" width="280" class="pa-2">
        <p class="text-overline px-3 pt-2 textSecondary">Organization</p>
        <p class="px-3 pb-2 text-subtitle-2">{{ tenant.organizationId || '—' }}</p>
        <v-divider class="mb-2" />
        <p class="text-overline px-3 textSecondary">Switch facility</p>
        <v-list density="compact" nav>
          <v-list-item
            v-for="fid in tenant.allowedFacilityIds"
            :key="fid"
            :active="fid === tenant.activeFacilityId"
            :title="fid"
            @click="onSelect(fid)"
          >
            <template #prepend>
              <v-icon
                :icon="fid === tenant.activeFacilityId ? 'mdi-check-circle' : 'mdi-circle-outline'"
                :color="fid === tenant.activeFacilityId ? 'primary' : undefined"
                size="small"
              />
            </template>
          </v-list-item>
          <v-list-item v-if="!tenant.allowedFacilityIds.length" title="No facilities" disabled />
        </v-list>
      </v-sheet>
    </v-menu>

    <!-- Re-issuing a token (the only way to change active facility) needs the password. -->
    <v-dialog v-model="confirmOpen" max-width="420" persistent>
      <v-card rounded="lg">
        <v-card-title class="text-h6">Switch facility</v-card-title>
        <v-card-text>
          <p class="mb-4 text-body-2 textSecondary">
            Confirm your password to switch the active facility to
            <strong>{{ pendingFacility }}</strong>. A new scoped token will be issued.
          </p>
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            density="comfortable"
            hide-details="auto"
            autofocus
            @keyup.enter="confirmSwitch"
          />
          <v-alert v-if="auth.apiError" type="error" variant="tonal" density="compact" class="mt-3">
            {{ auth.apiError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancel">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="auth.submitting" @click="confirmSwitch">
            Switch
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'

const auth = useAuthStore()
const tenant = useTenantStore()

const menuOpen = ref(false)
const confirmOpen = ref(false)
const pendingFacility = ref('')
const password = ref('')

function onSelect(facilityId: string) {
  if (facilityId === tenant.activeFacilityId) {
    menuOpen.value = false
    return
  }
  pendingFacility.value = facilityId
  password.value = ''
  auth.apiError = ''
  menuOpen.value = false
  confirmOpen.value = true
}

async function confirmSwitch() {
  if (!password.value) return
  const ok = await auth.switchFacility(pendingFacility.value, password.value)
  if (ok) {
    confirmOpen.value = false
    password.value = ''
  }
}

function cancel() {
  confirmOpen.value = false
  password.value = ''
  auth.apiError = ''
}
</script>
