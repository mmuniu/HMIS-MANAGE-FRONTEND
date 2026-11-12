<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRootAdminApi, type RootOverview } from '@/composables/useRootAdminApi'
import { describeAction, fmtDateTime } from './format'

const api = useRootAdminApi()
const data = ref<RootOverview | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    data.value = await api.overview()
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Could not load the overview.'
  } finally {
    loading.value = false
  }
}

const tiles = computed(() => {
  const c = data.value?.cards
  if (!c) return []
  return [
    { label: 'Critical issues open', value: c.critical_open, icon: 'mdi-alert-octagon-outline', color: c.critical_open ? 'error' : 'success' },
    { label: 'Pending', value: c.pending, icon: 'mdi-clock-outline', color: 'warning' },
    { label: 'Being worked on', value: c.being_worked, icon: 'mdi-progress-wrench', color: 'info' },
    { label: 'Found this week', value: c.found_this_week, icon: 'mdi-bug-outline', color: 'primary' },
    { label: 'Sorted this week', value: c.closed_this_week, icon: 'mdi-check-circle-outline', color: 'success' },
    { label: 'Admins active today', value: `${c.admins_active_today} / ${c.admins_total}`, icon: 'mdi-account-check-outline', color: 'primary' },
    { label: 'Suspended admins', value: c.admins_suspended, icon: 'mdi-account-cancel-outline', color: 'grey' },
    { label: 'Hospitals live', value: c.hospitals_live, icon: 'mdi-hospital-building', color: 'success' },
    { label: 'Hospitals provisioning', value: c.hospitals_provisioning, icon: 'mdi-cog-sync-outline', color: 'warning' },
  ]
})

onMounted(load)
</script>

<template>
  <div>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />

    <v-row>
      <v-col v-for="t in tiles" :key="t.label" cols="12" sm="6" md="4" lg="4">
        <v-card rounded="lg" elevation="10" class="h-100">
          <v-card-text class="d-flex align-center">
            <v-avatar :color="t.color" variant="tonal" size="44" class="mr-4">
              <v-icon :icon="t.icon" />
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-semibold">{{ t.value }}</div>
              <div class="text-body-2 textSecondary">{{ t.label }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col v-if="loading && !data" cols="12"><v-progress-linear indeterminate color="primary" /></v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="10" class="h-100">
          <v-card-item><v-card-title>Needs attention</v-card-title></v-card-item>
          <v-card-text>
            <v-list v-if="data?.attention.length" density="compact" class="pa-0">
              <v-list-item v-for="(a, i) in data.attention" :key="i" class="px-0">
                <template #prepend>
                  <v-icon :icon="a.kind === 'critical_report' ? 'mdi-alert-octagon-outline' : 'mdi-cog-sync-outline'"
                    :color="a.kind === 'critical_report' ? 'error' : 'warning'" class="mr-3" />
                </template>
                <v-list-item-title class="text-wrap">{{ a.message }}</v-list-item-title>
                <v-list-item-subtitle v-if="a.ref">{{ a.ref }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-else class="textSecondary mb-0">Nothing needs attention right now.</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card rounded="lg" elevation="10" class="h-100">
          <v-card-item><v-card-title>Recent admin activity</v-card-title></v-card-item>
          <v-card-text>
            <v-list v-if="data?.recent_activity.length" density="compact" class="pa-0">
              <v-list-item v-for="e in data.recent_activity" :key="e.id" class="px-0">
                <v-list-item-title class="text-wrap">
                  <strong>{{ e.actor || 'System' }}</strong> · {{ describeAction(e.action) }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ fmtDateTime(e.created_at) }}<template v-if="e.reason"> · {{ e.reason }}</template>
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-else class="textSecondary mb-0">No admin activity recorded yet.</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
