<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTenantStore } from '@/stores/tenant'
import { useAuthStore } from '@/stores/auth'
import FacilitySwitcher from '@/components/hmis/FacilitySwitcher.vue'

const tenant = useTenantStore()
const auth = useAuthStore()

onMounted(() => {
  if (!tenant.hasContext) tenant.loadContext()
})

const maskedToken = computed(() => {
  const t = auth.token
  if (!t) return '—'
  return `${t.slice(0, 6)}…${t.slice(-4)}`
})
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6 gap-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">Tenant Dashboard</h2>
        <p class="textSecondary">Live tenant context for your current session.</p>
      </div>
      <div class="d-flex align-center gap-2">
        <FacilitySwitcher />
        <v-btn color="error" variant="tonal" prepend-icon="mdi-logout" @click="auth.logout">
          Logout
        </v-btn>
      </div>
    </div>

    <v-alert
      v-if="tenant.lastError"
      type="warning"
      variant="tonal"
      class="mb-6"
      title="Could not load tenant context"
      :text="`Backend returned: ${tenant.lastError}. Your session may have expired.`"
    />

    <v-row>
      <!-- Organization -->
      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="10" class="h-100">
          <v-card-text>
            <div class="d-flex align-center mb-3">
              <v-avatar color="primary" variant="tonal" class="mr-3">
                <v-icon icon="mdi-domain" />
              </v-avatar>
              <div>
                <p class="text-overline textSecondary">Organization</p>
                <h4 class="text-h6">{{ tenant.organizationId || '—' }}</h4>
              </div>
            </div>
            <p class="text-body-2 textSecondary">
              The tenant boundary your token is scoped to.
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Active Facility -->
      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="10" class="h-100">
          <v-card-text>
            <div class="d-flex align-center mb-3">
              <v-avatar color="success" variant="tonal" class="mr-3">
                <v-icon icon="mdi-hospital-building" />
              </v-avatar>
              <div>
                <p class="text-overline textSecondary">Active Facility</p>
                <h4 class="text-h6">{{ tenant.activeFacilityId || '—' }}</h4>
              </div>
            </div>
            <FacilitySwitcher />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Session -->
      <v-col cols="12" md="4">
        <v-card rounded="lg" elevation="10" class="h-100">
          <v-card-text>
            <div class="d-flex align-center mb-3">
              <v-avatar color="info" variant="tonal" class="mr-3">
                <v-icon icon="mdi-shield-key" />
              </v-avatar>
              <div>
                <p class="text-overline textSecondary">Session</p>
                <h4 class="text-h6">{{ maskedToken }}</h4>
              </div>
            </div>
            <p class="text-body-2 textSecondary">
              Request ID: <code>{{ tenant.requestId || '—' }}</code>
            </p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Allowed facilities -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="10">
          <v-card-item>
            <v-card-title>Allowed Facilities</v-card-title>
            <v-card-subtitle>Facilities your account may access in this organization.</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-progress-linear v-if="tenant.loading" indeterminate color="primary" class="mb-3" />
            <v-list v-if="tenant.allowedFacilityIds.length" density="comfortable" lines="one">
              <v-list-item
                v-for="fid in tenant.allowedFacilityIds"
                :key="fid"
                :title="fid"
                :active="fid === tenant.activeFacilityId"
              >
                <template #prepend>
                  <v-icon
                    :icon="fid === tenant.activeFacilityId ? 'mdi-check-circle' : 'mdi-hospital-building-outline'"
                    :color="fid === tenant.activeFacilityId ? 'success' : undefined"
                  />
                </template>
                <template #append>
                  <v-chip v-if="fid === tenant.activeFacilityId" color="success" size="small" variant="tonal">
                    Active
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <p v-else-if="!tenant.loading" class="textSecondary">No facilities found in token claims.</p>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Raw context -->
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="10">
          <v-card-item>
            <v-card-title>Raw Tenant Context</v-card-title>
            <v-card-subtitle>Decoded from <code>GET /v1/platform/tenant-context</code></v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <v-btn
              size="small"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-refresh"
              :loading="tenant.loading"
              class="mb-3"
              @click="tenant.loadContext"
            >
              Refresh
            </v-btn>
            <pre class="context-json pa-3 rounded-lg">{{ JSON.stringify(tenant.context, null, 2) }}</pre>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.context-json {
  background: rgba(0, 0, 0, 0.04);
  font-size: 13px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
