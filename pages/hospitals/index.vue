<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHospitalsStore } from '@/stores/hospitals'
import { useAuthStore } from '@/stores/auth'
import { STATUS_COLOR, TIER_COLOR, BILLING_COLOR } from '@/types/hospital'
import type { ReleaseMode } from '@/types/hospital'

const router = useRouter()
const route = useRoute()
const store = useHospitalsStore()
const auth = useAuthStore()

// Platform staff manage every tenant; hospital admins only see their own.
const isPlatform = computed(() => auth.isPlatformUser)
const heading = computed(() => (isPlatform.value ? 'Hospitals' : 'My Hospital'))
const subtitle = computed(() =>
  isPlatform.value ? 'Platform tenants registered on HMIS.' : 'The hospital your account manages.',
)

const page = ref(1)
const perPage = ref(25)

// `searchInput` tracks the field as the user types and filters the rows
// already loaded instantly. `search` follows it after a short pause and is
// handed to the table — changing it makes v-data-table-server reset to page 1
// and emit update:options, which fetches matches from all records server-side.
const searchInput = ref('')
const search = ref('')
const term = computed(() => (searchInput.value ?? '').trim())
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(term, (value) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => (search.value = value), 150)
})
onBeforeUnmount(() => clearTimeout(searchTimer))

// Same rules as the backend: text fields match anywhere, the ID only from its start.
const rows = computed(() => {
  const q = term.value.toLowerCase()
  if (!q) return store.items
  return store.items.filter(
    (h) =>
      [h.name, h.legal_name, h.display_name, h.subdomain, h.custom_domain].some((v) => v?.toLowerCase().includes(q)) ||
      h.id.toLowerCase().startsWith(q),
  )
})
// Until the server answers for the current term, count only the rows shown.
const rowsLength = computed(() => (term.value === search.value ? store.meta?.total ?? 0 : rows.value.length))

// "Terminal hospitals": tenants on the core platform with no hospital here
// (never registered through hmis-manage). Platform staff only; the whole list
// comes back in one call, so it is filtered in the browser. Loaded the first
// time the tab is opened.
// The tab is kept in the URL (?tab=terminal) so coming back from a terminal
// hospital's page lands on the same tab.
const tab = ref<'registered' | 'terminal'>(route.query.tab === 'terminal' ? 'terminal' : 'registered')
watch(tab, (t) => {
  if (t === 'terminal' && !store.terminalItems.length && !store.loadingTerminal) store.fetchTerminal()
  if ((route.query.tab ?? 'registered') !== t) {
    router.replace({ query: { ...route.query, tab: t === 'terminal' ? 'terminal' : undefined } })
  }
}, { immediate: true })

function openTerminal(item: { v3_target: string; id: string | number }) {
  router.push(`/hospitals/terminal/${encodeURIComponent(item.v3_target)}/${encodeURIComponent(String(item.id))}`)
}

// System (v3 stack) filter, shared by both tabs. '' = every system. The
// registered list is filtered server-side; the terminal list in the browser.
// Kept in the URL (?system=) so it survives going to a hospital and back, and
// so "New Hospital" can create the hospital in the system already selected.
const system = ref(typeof route.query.system === 'string' ? route.query.system : '')
const systemItems = computed(() => [
  { key: '', label: 'All systems' },
  ...store.v3Targets.map((t) => ({ key: t.key, label: t.label })),
])
// Only worth a column/filter once there is more than one system.
const multiSystem = computed(() => store.v3Targets.length > 1)
const isDefaultSystem = (key: string) => store.v3Targets.find((t) => t.key === key)?.default ?? false
watch(system, (s) => {
  page.value = 1
  load()
  if ((route.query.system ?? '') !== s) router.replace({ query: { ...route.query, system: s || undefined } })
})
// A system that isn't configured (stale link) falls back to all systems.
watch(() => store.v3Targets, (targets) => {
  if (system.value && targets.length && !targets.some((t) => t.key === system.value)) system.value = ''
})
// Release filter: hospitals with at least one facility on a release (regular,
// beta, or any release added on the Systems page; set per facility on
// core-service). The registered list is filtered server-side (it asks each
// system's core-service); the terminal list in the browser, from each row's
// release_modes. Kept in the URL (?release=).
const release = ref<'' | ReleaseMode>(typeof route.query.release === 'string' ? route.query.release : '')
// The selected system's releases, or every system's (one entry per key).
const releaseItems = computed(() => {
  const seen = new Map<string, string>()
  for (const r of store.releases) {
    if (system.value && r.v3_target !== system.value) continue
    if (!seen.has(r.key)) seen.set(r.key, r.active ? r.label : `${r.label} (retired)`)
  }
  return [{ key: '', label: 'All releases' }, ...[...seen].map(([key, label]) => ({ key, label }))]
})
// Name of a release key for chips (the key itself when it isn't defined here).
const releaseLabel = (key: string) => store.releases.find((r) => r.key === key)?.label ?? key
watch(release, (r) => {
  page.value = 1
  load()
  if ((route.query.release ?? '') !== r) router.replace({ query: { ...route.query, release: r || undefined } })
})
// Terminal systems whose core-service doesn't report release modes yet - they
// can't be filtered, so their tenants drop out while a release is picked.
const terminalNoRelease = computed(() =>
  release.value
    ? [...new Set(store.terminalItems.filter((t) => !Array.isArray(t.release_modes)).map((t) => t.v3_target_label))]
    : [],
)

const newHospitalLink = computed(() => (system.value ? { path: '/hospitals/new', query: { target: system.value } } : '/hospitals/new'))

const terminalRows = computed(() => {
  const q = term.value.toLowerCase()
  let items = system.value ? store.terminalItems.filter((t) => t.v3_target === system.value) : store.terminalItems
  if (release.value) items = items.filter((t) => t.release_modes?.includes(release.value as ReleaseMode))
  if (!q) return items
  return items.filter(
    (t) => [t.name, t.code].some((v) => v?.toLowerCase().includes(q)) || String(t.id).startsWith(q),
  )
})

const terminalHeaders = computed(() => [
  { title: 'Hospital', key: 'name', sortable: true },
  ...(multiSystem.value ? [{ title: 'System', key: 'v3_target_label', sortable: true }] : []),
  { title: 'Code', key: 'code', sortable: true },
  { title: 'Release', key: 'release_modes', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
])

const headers = computed(() => [
  { title: 'Hospital', key: 'name', sortable: false },
  ...(multiSystem.value ? [{ title: 'System', key: 'v3_target_label', sortable: false }] : []),
  { title: 'Subdomain', key: 'subdomain', sortable: false },
  { title: 'Tier', key: 'subscription_tier', sortable: false },
  { title: 'Billing', key: 'billing_status', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Users', key: 'max_user_slots', sortable: false, align: 'end' as const },
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
])

async function load() {
  await store.fetchList(page.value, perPage.value, search.value, system.value, release.value)
}

function onTableUpdate(opts: { page: number; itemsPerPage: number }) {
  page.value = opts.page
  perPage.value = opts.itemsPerPage
  load()
}

function openHospital(id: string) {
  router.push(`/hospitals/${id}`)
}

onMounted(() => {
  load()
  if (isPlatform.value) {
    store.fetchV3Targets()
    store.fetchReleases()
  }
})
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">{{ heading }}</h2>
        <p class="textSecondary">{{ subtitle }}</p>
      </div>
      <v-btn v-if="isPlatform" color="primary" prepend-icon="mdi-plus" :to="newHospitalLink">
        New Hospital
      </v-btn>
    </div>

    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" :text="store.error" />

    <v-card rounded="lg" elevation="10">
      <v-tabs v-if="isPlatform" v-model="tab" color="primary" class="px-2">
        <v-tab value="registered">Registered</v-tab>
        <v-tab value="terminal">
          Terminal Hospitals
          <v-chip v-if="store.terminalItems.length" size="x-small" class="ml-2" label>{{ store.terminalItems.length }}</v-chip>
        </v-tab>
      </v-tabs>
      <v-divider v-if="isPlatform" />
      <div v-if="isPlatform" class="d-flex flex-wrap ga-3 pa-4 pb-0">
        <v-text-field
          v-model="searchInput"
          prepend-inner-icon="mdi-magnify"
          :placeholder="tab === 'terminal' ? 'Search by name, code or core ID' : 'Search by name, subdomain, domain or ID'"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="max-width: 420px; min-width: 220px"
        />
        <v-select
          v-if="multiSystem"
          v-model="system"
          :items="systemItems"
          item-title="label"
          item-value="key"
          prepend-inner-icon="mdi-layers-triple-outline"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 240px; min-width: 180px"
        />
        <v-select
          v-model="release"
          :items="releaseItems"
          item-title="label"
          item-value="key"
          prepend-inner-icon="mdi-flask-outline"
          variant="outlined"
          density="compact"
          hide-details
          style="max-width: 200px; min-width: 160px"
        />
      </div>
      <v-alert v-if="tab === 'registered' && release && store.listUnavailable.length" type="warning" variant="tonal"
        density="compact" class="mx-4 mt-4"
        :text="`Couldn't check facility releases on ${store.listUnavailable.join(', ')} (unreachable, or its core-service needs updating), so its hospitals aren't listed.`" />
      <v-data-table-server
        v-show="tab === 'registered'"
        :headers="headers"
        :search="search"
        :items="rows"
        :items-length="rowsLength"
        :loading="store.loading"
        :items-per-page="perPage"
        :page="page"
        :items-per-page-options="[10, 25, 50, 100]"
        hover
        @update:options="onTableUpdate"
        @click:row="(_e: any, { item }: any) => openHospital(item.id)"
      >
        <template #item.name="{ item }">
          <div class="py-2">
            <div class="font-weight-semibold">{{ item.name }}</div>
            <div class="text-caption textSecondary">{{ item.id }}</div>
          </div>
        </template>

        <template #item.v3_target_label="{ item }">
          <v-chip size="small" :color="isDefaultSystem(item.v3_target) ? undefined : 'secondary'" variant="tonal" label>
            {{ item.v3_target_label }}
          </v-chip>
        </template>

        <template #item.subdomain="{ item }">
          <span v-if="item.subdomain">{{ item.subdomain }}</span>
          <span v-else class="textSecondary">—</span>
        </template>

        <template #item.subscription_tier="{ item }">
          <v-chip :color="TIER_COLOR[item.subscription_tier]" size="small" variant="tonal" label>
            {{ item.subscription_tier }}
          </v-chip>
        </template>

        <template #item.billing_status="{ item }">
          <v-chip :color="BILLING_COLOR[item.billing_status]" size="small" variant="tonal" label>
            {{ item.billing_status }}
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="STATUS_COLOR[item.status]" size="small" variant="flat" label>
            {{ item.status }}
          </v-chip>
          <v-chip v-if="item.is_sandbox" color="warning" size="x-small" variant="tonal" class="ml-1" label>
            SANDBOX
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn icon="mdi-chevron-right" variant="text" size="small" @click.stop="openHospital(item.id)" />
        </template>

        <template #no-data>
          <div class="pa-8 text-center textSecondary">
            {{ term ? `No hospitals match "${term}".` : system || release ? 'No hospitals match these filters.' : 'No hospitals yet.' }}
          </div>
        </template>
      </v-data-table-server>

      <template v-if="isPlatform && tab === 'terminal'">
        <p class="text-caption textSecondary px-4 pt-3 mb-0">
          Tenants on the core platform of every system that have no hospital in this management platform.
        </p>
        <v-alert v-if="store.terminalError" type="error" variant="tonal" class="ma-4" :text="store.terminalError">
          <template #append>
            <v-btn variant="text" size="small" @click="store.fetchTerminal()">Retry</v-btn>
          </template>
        </v-alert>
        <v-alert v-if="!store.terminalError && terminalNoRelease.length" type="warning" variant="tonal" density="compact" class="ma-4"
          :text="`${terminalNoRelease.join(', ')}'s core-service doesn't report facility releases yet, so its tenants aren't listed while a release is selected.`" />
        <v-alert v-if="!store.terminalError && store.terminalUnavailable.length" type="warning" variant="tonal" density="compact" class="ma-4"
          :text="`Couldn't reach ${store.terminalUnavailable.join(', ')}, so its tenants aren't listed. Check it with Test on the Systems page.`">
          <template #append>
            <v-btn variant="text" size="small" @click="store.fetchTerminal()">Retry</v-btn>
          </template>
        </v-alert>
        <v-data-table
          :headers="terminalHeaders"
          :items="terminalRows"
          :loading="store.loadingTerminal"
          hover
          @click:row="(_e: any, { item }: any) => openTerminal(item)"
          :items-per-page="25"
          :items-per-page-options="[10, 25, 50, 100]"
        >
          <template #item.name="{ item }">
            <div class="py-2">
              <div class="font-weight-semibold">{{ item.name }}</div>
              <div class="text-caption textSecondary">Core ID {{ item.id }}</div>
            </div>
          </template>
          <template #item.v3_target_label="{ item }">
            <v-chip size="small" :color="isDefaultSystem(item.v3_target) ? undefined : 'secondary'" variant="tonal" label>
              {{ item.v3_target_label }}
            </v-chip>
          </template>
          <template #item.code="{ item }">
            <span v-if="item.code">{{ item.code }}</span>
            <span v-else class="textSecondary">—</span>
          </template>
          <template #item.release_modes="{ item }">
            <template v-if="item.release_modes?.length">
              <v-chip v-for="m in item.release_modes" :key="m" :color="m === 'regular' ? undefined : 'warning'" size="small"
                variant="tonal" label class="mr-1">{{ releaseLabel(m) }}</v-chip>
            </template>
            <span v-else class="textSecondary">—</span>
          </template>
          <template #item.status="{ item }">
            <v-chip v-if="item.status" :color="item.status === 'active' ? 'success' : 'grey'" size="small" variant="tonal" label>
              {{ item.status }}
            </v-chip>
            <span v-else class="textSecondary">—</span>
          </template>
          <template #item.actions="{ item }">
            <v-btn icon="mdi-chevron-right" variant="text" size="small" @click.stop="openTerminal(item)" />
          </template>
          <template #no-data>
            <div class="pa-8 text-center textSecondary">
              {{ term ? `No terminal hospitals match "${term}".` : system || release ? 'No terminal hospitals match these filters.' : 'Every core-platform tenant is registered here.' }}
            </div>
          </template>
        </v-data-table>
      </template>
    </v-card>
  </div>
</template>
