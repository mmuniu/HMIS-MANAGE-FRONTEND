<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useHospitalsStore } from '@/stores/hospitals'
import { useAuthStore } from '@/stores/auth'
import { STATUS_COLOR, TIER_COLOR, BILLING_COLOR } from '@/types/hospital'

const router = useRouter()
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
const tab = ref<'registered' | 'terminal'>('registered')
watch(tab, (t) => {
  if (t === 'terminal' && !store.terminalItems.length && !store.loadingTerminal) store.fetchTerminal()
})

const terminalRows = computed(() => {
  const q = term.value.toLowerCase()
  if (!q) return store.terminalItems
  return store.terminalItems.filter(
    (t) => [t.name, t.code].some((v) => v?.toLowerCase().includes(q)) || String(t.id).startsWith(q),
  )
})

const terminalHeaders = [
  { title: 'Hospital', key: 'name', sortable: true },
  { title: 'Code', key: 'code', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
]

const headers = [
  { title: 'Hospital', key: 'name', sortable: false },
  { title: 'Subdomain', key: 'subdomain', sortable: false },
  { title: 'Tier', key: 'subscription_tier', sortable: false },
  { title: 'Billing', key: 'billing_status', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Users', key: 'max_user_slots', sortable: false, align: 'end' as const },
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
]

async function load() {
  await store.fetchList(page.value, perPage.value, search.value)
}

function onTableUpdate(opts: { page: number; itemsPerPage: number }) {
  page.value = opts.page
  perPage.value = opts.itemsPerPage
  load()
}

function openHospital(id: string) {
  router.push(`/hospitals/${id}`)
}

onMounted(load)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">{{ heading }}</h2>
        <p class="textSecondary">{{ subtitle }}</p>
      </div>
      <v-btn v-if="isPlatform" color="primary" prepend-icon="mdi-plus" to="/hospitals/new">
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
      <div v-if="isPlatform" class="pa-4 pb-0">
        <v-text-field
          v-model="searchInput"
          prepend-inner-icon="mdi-magnify"
          :placeholder="tab === 'terminal' ? 'Search by name, code or core ID' : 'Search by name, subdomain, domain or ID'"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          style="max-width: 420px"
        />
      </div>
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
            {{ term ? `No hospitals match "${term}".` : 'No hospitals yet.' }}
          </div>
        </template>
      </v-data-table-server>

      <template v-if="isPlatform && tab === 'terminal'">
        <p class="text-caption textSecondary px-4 pt-3 mb-0">
          Tenants on the core platform that have no hospital in this management platform.
        </p>
        <v-alert v-if="store.terminalError" type="error" variant="tonal" class="ma-4" :text="store.terminalError">
          <template #append>
            <v-btn variant="text" size="small" @click="store.fetchTerminal()">Retry</v-btn>
          </template>
        </v-alert>
        <v-data-table
          :headers="terminalHeaders"
          :items="terminalRows"
          :loading="store.loadingTerminal"
          :items-per-page="25"
          :items-per-page-options="[10, 25, 50, 100]"
        >
          <template #item.name="{ item }">
            <div class="py-2">
              <div class="font-weight-semibold">{{ item.name }}</div>
              <div class="text-caption textSecondary">Core ID {{ item.id }}</div>
            </div>
          </template>
          <template #item.code="{ item }">
            <span v-if="item.code">{{ item.code }}</span>
            <span v-else class="textSecondary">—</span>
          </template>
          <template #item.status="{ item }">
            <v-chip v-if="item.status" :color="item.status === 'active' ? 'success' : 'grey'" size="small" variant="tonal" label>
              {{ item.status }}
            </v-chip>
            <span v-else class="textSecondary">—</span>
          </template>
          <template #no-data>
            <div class="pa-8 text-center textSecondary">
              {{ term ? `No terminal hospitals match "${term}".` : 'Every core-platform tenant is registered here.' }}
            </div>
          </template>
        </v-data-table>
      </template>
    </v-card>
  </div>
</template>
