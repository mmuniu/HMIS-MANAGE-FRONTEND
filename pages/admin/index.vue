<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OverviewTab from '@/components/admin/OverviewTab.vue'
import AdminsTab from '@/components/admin/AdminsTab.vue'
import IssuesTab from '@/components/admin/IssuesTab.vue'
import AuditTab from '@/components/admin/AuditTab.vue'
import ControlsTab from '@/components/admin/ControlsTab.vue'

// The root admin's console. Reachable only by a root admin — the route guard
// (middleware/auth.global.ts) and the API (`platform:root_admin`) both enforce it.

const route = useRoute()
const router = useRouter()

const TABS = [
  { value: 'overview', title: 'Overview', icon: 'mdi-view-dashboard-outline' },
  { value: 'admins', title: 'Admins', icon: 'mdi-account-key-outline' },
  { value: 'issues', title: 'Issues', icon: 'mdi-bug-outline' },
  { value: 'audit', title: 'Audit log', icon: 'mdi-history' },
  { value: 'controls', title: 'Platform controls', icon: 'mdi-tune-variant' },
]

// The active tab lives in the URL (?tab=) so it survives reloads and can be linked.
const tab = computed({
  get: () => (TABS.some((t) => t.value === route.query.tab) ? (route.query.tab as string) : 'overview'),
  set: (value: string) => router.replace({ query: { ...route.query, tab: value } }),
})
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-h4 font-weight-semibold">Admin</h2>
      <p class="textSecondary mb-0">Admins, issues and everything admins have done across the platform.</p>
    </div>

    <v-tabs v-model="tab" color="primary" class="mb-6" show-arrows>
      <v-tab v-for="t in TABS" :key="t.value" :value="t.value" :prepend-icon="t.icon">{{ t.title }}</v-tab>
    </v-tabs>

    <!-- v-if (not v-show): each tab loads its data when first opened. -->
    <OverviewTab v-if="tab === 'overview'" />
    <AdminsTab v-else-if="tab === 'admins'" />
    <IssuesTab v-else-if="tab === 'issues'" />
    <AuditTab v-else-if="tab === 'audit'" />
    <ControlsTab v-else-if="tab === 'controls'" />
  </div>
</template>
