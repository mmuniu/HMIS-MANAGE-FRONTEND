<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useAuthStore } from '@/stores/auth'
import { useRootAdminApi, type RootAdminAccount } from '@/composables/useRootAdminApi'
import { ROLE_OPTIONS, roleTitle, fmtDateTime } from './format'

const api = useRootAdminApi()
const auth = useAuthStore()
const { $showToast } = useNuxtApp()

const items = ref<RootAdminAccount[]>([])
const total = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

const page = ref(1)
const perPage = ref(25)
const search = ref('')
const role = ref<string | null>(null)
const status = ref<string | null>(null)

const roleFilters = [...ROLE_OPTIONS, { value: 'hospital_admin', title: 'Hospital Admin' }]
const statusFilters = [{ value: 'active', title: 'Active' }, { value: 'suspended', title: 'Suspended' }]

const headers = [
  { title: 'Name', key: 'name', sortable: false },
  { title: 'Role', key: 'role', sortable: false },
  { title: 'Status', key: 'status', sortable: false },
  { title: 'Last sign-in', key: 'last_login_at', sortable: false },
  { title: '', key: 'actions', sortable: false, align: 'end' as const, width: '48px' },
]

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await api.admins({
      page: page.value, per_page: perPage.value,
      search: search.value || undefined, role: role.value || undefined, status: status.value || undefined,
    })
    items.value = res.data
    total.value = res.meta.total
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Could not load admins.'
  } finally {
    loading.value = false
  }
}

function onTableUpdate(opts: { page: number; itemsPerPage: number }) {
  page.value = opts.page
  perPage.value = opts.itemsPerPage
  load()
}

let searchTimer: ReturnType<typeof setTimeout>
function reloadFromFirstPage(debounce = false) {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; load() }, debounce ? 300 : 0)
}

// Root admin accounts (and your own) are managed from the server CLI only.
function isLocked(a: RootAdminAccount) {
  return a.platform_role === 'root_admin' || a.id === auth.user?.id
}

// ── One dialog for every action; each needs a reason (it's audited). ──────
type Action = 'role' | 'suspend' | 'reactivate' | 'signout'
const dialog = ref<{ action: Action; admin: RootAdminAccount } | null>(null)
const newRole = ref<string | null>(null)
const reason = ref('')
const saving = ref(false)

const dialogTitle = computed(() => ({
  role: 'Change role',
  suspend: 'Suspend account',
  reactivate: 'Reactivate account',
  signout: 'Sign out everywhere',
}[dialog.value?.action ?? 'role']))

function open(action: Action, admin: RootAdminAccount) {
  dialog.value = { action, admin }
  newRole.value = admin.platform_role
  reason.value = ''
}

async function confirm() {
  if (!dialog.value) return
  const { action, admin } = dialog.value
  saving.value = true
  try {
    if (action === 'signout') {
      const n = await api.revokeSessions(admin.id, reason.value)
      $showToast(`Signed out of ${n} session${n === 1 ? '' : 's'}.`)
    } else {
      const input = action === 'role'
        ? { platform_role: newRole.value ?? undefined, reason: reason.value }
        : { suspended: action === 'suspend', reason: reason.value }
      const updated = await api.updateAdmin(admin.id, input)
      items.value = items.value.map((a) => (a.id === updated.id ? updated : a))
      $showToast('Saved.')
    }
    dialog.value = null
  } catch (e: any) {
    $showToast(e?.response?.data?.message || 'Could not save the change.')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" :text="error" />

    <v-card rounded="lg" elevation="10" class="mb-4">
      <v-card-text class="d-flex flex-wrap ga-3">
        <v-text-field v-model="search" label="Search name, username or email" prepend-inner-icon="mdi-magnify"
          variant="outlined" density="comfortable" hide-details clearable style="max-width:360px; min-width:220px"
          @update:model-value="reloadFromFirstPage(true)" />
        <v-select v-model="role" :items="roleFilters" label="Role" variant="outlined" density="comfortable"
          hide-details clearable style="max-width:220px; min-width:160px" @update:model-value="reloadFromFirstPage()" />
        <v-select v-model="status" :items="statusFilters" label="Status" variant="outlined" density="comfortable"
          hide-details clearable style="max-width:180px; min-width:140px" @update:model-value="reloadFromFirstPage()" />
      </v-card-text>
    </v-card>

    <v-card rounded="lg" elevation="10">
      <v-data-table-server :headers="headers" :items="items" :items-length="total" :loading="loading"
        :items-per-page="perPage" :page="page" :items-per-page-options="[10, 25, 50, 100]"
        @update:options="onTableUpdate">
        <template #item.name="{ item }">
          <div class="py-2">
            <div class="font-weight-medium">{{ item.name }}</div>
            <div class="text-caption textSecondary">{{ item.username || '—' }} · {{ item.email }}</div>
          </div>
        </template>

        <template #item.role="{ item }">
          <v-chip size="small" variant="tonal" label :color="item.platform_role ? 'primary' : 'grey'">
            {{ roleTitle(item.platform_role) }}
          </v-chip>
          <div v-if="item.hospital_admin_of.length" class="text-caption textSecondary mt-1">
            {{ item.hospital_admin_of.map((h) => h.organization_name || h.organization_id).join(', ') }}
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip v-if="item.suspended" color="error" size="small" variant="tonal" label prepend-icon="mdi-account-cancel-outline">Suspended</v-chip>
          <v-chip v-else color="success" size="small" variant="tonal" label prepend-icon="mdi-account-check-outline">Active</v-chip>
        </template>

        <template #item.last_login_at="{ item }">{{ fmtDateTime(item.last_login_at) }}</template>

        <template #item.actions="{ item }">
          <v-tooltip v-if="isLocked(item)" text="Managed from the server command line">
            <template #activator="{ props }">
              <v-icon v-bind="props" icon="mdi-lock-outline" size="18" color="medium-emphasis" />
            </template>
          </v-tooltip>
          <v-menu v-else location="bottom end">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text" size="small" aria-label="Actions" />
            </template>
            <v-list density="compact">
              <v-list-item v-if="item.platform_role" prepend-icon="mdi-account-switch-outline" title="Change role" @click="open('role', item)" />
              <v-list-item v-if="!item.suspended" prepend-icon="mdi-account-cancel-outline" title="Suspend" @click="open('suspend', item)" />
              <v-list-item v-else prepend-icon="mdi-account-check-outline" title="Reactivate" @click="open('reactivate', item)" />
              <v-list-item prepend-icon="mdi-logout" title="Sign out everywhere" @click="open('signout', item)" />
            </v-list>
          </v-menu>
        </template>

        <template #no-data><div class="pa-8 text-center textSecondary">No admins match these filters.</div></template>
      </v-data-table-server>
    </v-card>

    <v-dialog :model-value="!!dialog" max-width="460" @update:model-value="(v) => { if (!v) dialog = null }">
      <v-card v-if="dialog" rounded="lg">
        <v-card-title class="text-h6">{{ dialogTitle }}</v-card-title>
        <v-card-text>
          <p class="mb-4">
            <strong>{{ dialog.admin.name }}</strong> ({{ dialog.admin.email }})
            <template v-if="dialog.action === 'suspend'"> will be signed out and won't be able to sign in until reactivated.</template>
            <template v-else-if="dialog.action === 'signout'"> will be signed out of every device.</template>
          </p>
          <v-select v-if="dialog.action === 'role'" v-model="newRole" :items="ROLE_OPTIONS" label="New role"
            variant="outlined" density="comfortable" class="mb-2" />
          <v-textarea v-model="reason" label="Reason (recorded in the audit log)" variant="outlined"
            density="comfortable" rows="2" auto-grow counter="500" :rules="[(v: string) => v.trim().length >= 5 || 'At least 5 characters']" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="saving" @click="dialog = null">Cancel</v-btn>
          <v-btn :color="dialog.action === 'suspend' ? 'error' : 'primary'" variant="flat" :loading="saving"
            :disabled="reason.trim().length < 5 || (dialog.action === 'role' && newRole === dialog.admin.platform_role)"
            @click="confirm">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
