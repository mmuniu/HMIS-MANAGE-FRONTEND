<script setup lang="ts">
// Shortcuts to the platform-wide controls that already exist elsewhere.
const controls = [
  { title: 'Users', subtitle: 'Every account on the platform', icon: 'mdi-account-group-outline', to: '/users' },
  { title: 'Hospitals', subtitle: 'Register, edit and provision hospitals', icon: 'mdi-hospital-building', to: '/hospitals' },
  { title: 'Deployments', subtitle: 'Each hospital’s implementation lifecycle', icon: 'mdi-clipboard-check-outline', to: '/deployments' },
  { title: 'Integrations', subtitle: 'Master connections and hospital links', icon: 'mdi-connection', to: '/integrations' },
  { title: 'Systems', subtitle: 'Data partitions', icon: 'mdi-layers-outline', to: '/systems' },
  { title: 'Settings', subtitle: 'Platform-wide switches (e.g. SHA integration)', icon: 'mdi-cog-outline', to: '/settings' },
  { title: 'Feedback Admin', subtitle: 'Triage reports and assign them', icon: 'mdi-inbox-arrow-down-outline', to: '/feedback-admin' },
  { title: 'Tester Activity', subtitle: 'What testers are creating and running', icon: 'mdi-chart-box-outline', to: '/tester-activity' },
]
</script>

<template>
  <v-row>
    <v-col v-for="c in controls" :key="c.to" cols="12" sm="6" md="4">
      <v-card rounded="lg" elevation="10" class="h-100" :to="c.to" hover>
        <v-card-text class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" size="44" class="mr-4"><v-icon :icon="c.icon" /></v-avatar>
          <div class="flex-grow-1">
            <p class="text-subtitle-1 font-weight-medium mb-0">{{ c.title }}</p>
            <p class="text-caption textSecondary mb-0">{{ c.subtitle }}</p>
          </div>
          <v-icon icon="mdi-chevron-right" color="medium-emphasis" />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
