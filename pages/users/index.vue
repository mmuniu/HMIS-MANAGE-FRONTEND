<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { PLATFORM_ROLE_COLOR, type PlatformUser } from '@/types/user'

const store = useUsersStore()
const auth = useAuthStore()

const search = ref('')
const page = ref(1)
const perPage = ref(25)
const confirmDelete = ref<PlatformUser | null>(null)

const headers = [
  { title: 'Name', key: 'name', sortable: false },
  { title: 'Username', key: 'username', sortable: false },
  { title: 'Email', key: 'email', sortable: false },
  { title: 'Role', key: 'role', sortable: false },
  { title: 'Core-service', key: 'core_user_id', sortable: false },
  { title: 'Created', key: 'created_at', sortable: false },
  { title: '', key: 'actions', sortable: false, align: 'end' as const, width: '48px' },
]

function load() {
  store.fetchList({ page: page.value, per_page: perPage.value, search: search.value || undefined })
}

function onTableUpdate(opts: { page: number; itemsPerPage: number }) {
  page.value = opts.page
  perPage.value = opts.itemsPerPage
  load()
}

let searchTimer: ReturnType<typeof setTimeout>
function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    load()
  }, 300)
}

function fmt(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'
}

async function deleteUser() {
  if (!confirmDelete.value) return
  const res = await store.remove(confirmDelete.value.id)
  if (res.success) confirmDelete.value = null
}

onMounted(load)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
      <div>
        <h2 class="text-h4 font-weight-semibold">Users</h2>
        <p class="textSecondary mb-0">Every account on the platform — company staff and hospital tenant users.</p>
      </div>
    </div>

    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" :text="store.error" />

    <v-card rounded="lg" elevation="10" class="mb-4">
      <v-card-text>
        <v-text-field v-model="search" label="Search name, username or email" prepend-inner-icon="mdi-magnify"
          variant="outlined" density="comfortable" hide-details clearable style="max-width:420px"
          @update:model-value="onSearchInput" />
      </v-card-text>
    </v-card>

    <v-card rounded="lg" elevation="10">
      <v-data-table-server
        :headers="headers"
        :items="store.items"
        :items-length="store.meta?.total ?? 0"
        :loading="store.loading"
        :items-per-page="perPage"
        :page="page"
        :items-per-page-options="[10, 25, 50, 100]"
        @update:options="onTableUpdate"
      >
        <template #item.username="{ item }">{{ item.username || '—' }}</template>

        <template #item.role="{ item }">
          <v-chip v-if="item.platform_role" :color="PLATFORM_ROLE_COLOR[item.platform_role] || 'grey'"
            size="small" variant="tonal" label class="text-capitalize">
            {{ item.platform_role.replace('_', ' ') }}
          </v-chip>
          <div v-else-if="item.tenant_roles.length" class="d-flex flex-wrap ga-1">
            <v-chip v-for="r in item.tenant_roles" :key="r.organization_id" size="small" variant="outlined" label>
              {{ r.role_key.replace('_', ' ') }} · {{ r.organization_name || r.organization_id }}
            </v-chip>
          </div>
          <span v-else class="textSecondary">—</span>
        </template>

        <template #item.core_user_id="{ item }">
          <v-chip v-if="item.core_user_id" color="success" size="small" variant="tonal" label>Active</v-chip>
          <v-chip v-else color="grey" size="small" variant="tonal" label>Not provisioned</v-chip>
        </template>

        <template #item.created_at="{ item }">{{ fmt(item.created_at) }}</template>

        <template #item.actions="{ item }">
          <v-tooltip v-if="item.id === auth.user?.id" text="You can't delete your own account">
            <template #activator="{ props }">
              <span v-bind="props"><v-btn icon="mdi-delete-outline" color="error" variant="text" size="small" disabled /></span>
            </template>
          </v-tooltip>
          <v-btn v-else icon="mdi-delete-outline" color="error" variant="text" size="small"
            @click="confirmDelete = item" />
        </template>

        <template #no-data>
          <div class="pa-8 text-center textSecondary">No users found.</div>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="confirmDelete" max-width="440">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Delete user?</v-card-title>
        <v-card-text>
          This will permanently delete <strong>{{ confirmDelete?.name }}</strong> ({{ confirmDelete?.email }}).
          <template v-if="confirmDelete?.tenant_roles.length">
            They will lose access to every hospital they're assigned to.
          </template>
          This cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="store.deleting === confirmDelete?.id" @click="confirmDelete = null">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="store.deleting === confirmDelete?.id" @click="deleteUser">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
