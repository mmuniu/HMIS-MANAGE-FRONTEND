<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTenantStore } from '@/stores/tenant'
import { useAuthStore } from '@/stores/auth'

const tenant = useTenantStore()
const auth = useAuthStore()

onMounted(() => {
  // Only hospital admins have a tenant context to load.
  if (auth.isHospitalAdmin && !tenant.hasContext) tenant.loadContext()
})

const roleLabel = computed(() => {
  if (auth.isSystemAdmin) return 'System Admin'
  if (auth.isDeveloper) return 'Developer'
  if (auth.isTester) return 'Tester'
  if (auth.isQa) return 'QA'
  return 'Hospital Admin'
})

const roleColor = computed(() => {
  if (auth.isSystemAdmin) return 'error'
  if (auth.isDeveloper) return 'primary'
  if (auth.isTester || auth.isQa) return 'warning'
  return 'success'
})

const roleIcon = computed(() => {
  if (auth.isSystemAdmin) return 'mdi-shield-crown'
  if (auth.isDeveloper) return 'mdi-code-braces'
  if (auth.isTester || auth.isQa) return 'mdi-clipboard-check-outline'
  return 'mdi-hospital-building'
})

const greetingName = computed(() => auth.user?.name || auth.user?.email || 'there')

// Quick-action cards per account type — only links to things that exist / are planned.
const actions = computed(() => {
  if (auth.isSystemAdmin || auth.isDeveloper) {
    return [
      { title: 'Hospitals', subtitle: 'Every tenant on the platform', icon: 'mdi-hospital-building', to: '/hospitals', color: 'primary' },
      { title: 'Test Cases', subtitle: 'Oversee QA test runs', icon: 'mdi-clipboard-check-outline', to: '/test-cases', color: 'warning' },
      { title: 'Tester Activity', subtitle: 'Track testers & QA', icon: 'mdi-chart-box-outline', to: '/tester-activity', color: 'info' },
      { title: 'Feedback Admin', subtitle: 'Triage bug reports', icon: 'mdi-message-alert-outline', to: '/feedback-admin', color: 'error' },
    ]
  }
  if (auth.isTester) {
    return [
      { title: 'Test Cases', subtitle: 'Create and run test cases', icon: 'mdi-clipboard-check-outline', to: '/test-cases', color: 'warning' },
    ]
  }
  if (auth.isQa) {
    return [
      { title: 'Test Cases', subtitle: 'Run existing tests, mark pass / fail', icon: 'mdi-clipboard-check-outline', to: '/test-cases', color: 'warning' },
    ]
  }
  // hospital admin
  return [
    { title: 'My Hospital', subtitle: 'Manage your facility', icon: 'mdi-hospital-building', to: '/hospitals', color: 'success' },
  ]
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex flex-wrap align-center justify-space-between mb-6 gap-3">
      <div class="d-flex align-center gap-3">
        <v-avatar :color="roleColor" variant="tonal" size="52">
          <v-icon :icon="roleIcon" size="28" />
        </v-avatar>
        <div>
          <h2 class="text-h4 font-weight-semibold mb-0">Welcome back, {{ greetingName }}</h2>
          <div class="d-flex align-center gap-2 mt-1">
            <v-chip :color="roleColor" size="small" variant="tonal" label>{{ roleLabel }}</v-chip>
            <span class="textSecondary text-body-2">{{ auth.user?.email }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <v-row class="mb-2">
      <v-col v-for="a in actions" :key="a.to" cols="12" sm="6" md="4">
        <v-card rounded="lg" elevation="10" class="h-100 action-card" :to="a.to" hover>
          <v-card-text class="d-flex align-center">
            <v-avatar :color="a.color" variant="tonal" size="48" class="mr-4">
              <v-icon :icon="a.icon" />
            </v-avatar>
            <div class="flex-grow-1">
              <p class="text-subtitle-1 font-weight-medium mb-0">{{ a.title }}</p>
              <p class="text-caption textSecondary mb-0">{{ a.subtitle }}</p>
            </div>
            <v-icon icon="mdi-chevron-right" color="medium-emphasis" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Platform user note -->
    <v-alert
      v-if="auth.isPlatformUser"
      type="info"
      variant="tonal"
      rounded="lg"
      class="mt-4"
      :title="auth.isDeveloper ? 'Developer access' : 'Tester access'"
      :text="auth.isDeveloper
        ? 'You have cross-tenant visibility across every hospital on the platform.'
        : 'You can review and update test cases. Test cases will appear here once published.'"
    />

    <!-- Hospital-admin tenant context -->
    <template v-if="auth.isHospitalAdmin">
      <v-alert
        v-if="tenant.lastError"
        type="warning"
        variant="tonal"
        class="mt-4"
        title="Could not load tenant context"
        :text="`Backend returned: ${tenant.lastError}. Your session may have expired.`"
      />

      <v-row class="mt-2">
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item>
              <v-card-title>Your Organization</v-card-title>
            </v-card-item>
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon icon="mdi-domain" class="mr-2" color="primary" />
                <span class="text-h6">{{ tenant.context?.organization_name || tenant.organizationId || '—' }}</span>
              </div>
              <p class="text-body-2 textSecondary">The hospital your account is scoped to.</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item>
              <v-card-title>Facilities</v-card-title>
              <v-card-subtitle>Locations you can access this session.</v-card-subtitle>
            </v-card-item>
            <v-card-text>
              <v-progress-linear v-if="tenant.loading" indeterminate color="primary" class="mb-3" />
              <v-list v-if="(tenant.context?.facilities?.length ?? 0) > 0" density="comfortable" lines="one">
                <v-list-item
                  v-for="f in tenant.context?.facilities"
                  :key="f.id"
                  :title="f.name"
                  :active="f.id === tenant.activeFacilityId"
                >
                  <template #prepend>
                    <v-icon
                      :icon="f.id === tenant.activeFacilityId ? 'mdi-check-circle' : 'mdi-hospital-building-outline'"
                      :color="f.id === tenant.activeFacilityId ? 'success' : undefined"
                    />
                  </template>
                  <template #append>
                    <v-chip v-if="f.id === tenant.activeFacilityId" color="success" size="small" variant="tonal">
                      Active
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
              <p v-else-if="!tenant.loading" class="textSecondary">No facilities found.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<style scoped>
.action-card { transition: transform 0.15s ease; }
.action-card:hover { transform: translateY(-2px); }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
</style>
