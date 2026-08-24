<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useDeploymentsStore } from '@/stores/deployments'
import { useUsersApi } from '@/composables/useUsersApi'
import { ASSIGNMENT_ROLE_LABEL, ASSIGNMENT_ROLES, REQUIRED_ASSIGNMENT_ROLES } from '@/types/deployment'
import type { AssignmentRole } from '@/types/deployment'
import type { PlatformUser } from '@/types/user'

interface Props {
  show: boolean
  deploymentId: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:show'])

const store = useDeploymentsStore()
const usersApi = useUsersApi()

const localShow = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})

const assignments = computed(() => store.current?.assignments || [])

function assignmentsFor(role: AssignmentRole) {
  return assignments.value.filter((a) => a.role_key === role)
}

const ROLE_OPTIONS = ASSIGNMENT_ROLES.map((role) => ({
  title: ASSIGNMENT_ROLE_LABEL[role] + (REQUIRED_ASSIGNMENT_ROLES.includes(role) ? ' (required)' : ''),
  value: role,
}))

const form = reactive<{ role_key: AssignmentRole | null; assigneeMode: 'user' | 'contact'; assignee_user_id: number | null; contact_name: string; contact_email: string; contact_phone: string }>({
  role_key: null,
  assigneeMode: 'user',
  assignee_user_id: null,
  contact_name: '',
  contact_email: '',
  contact_phone: '',
})

const userSearch = ref('')
const userOptions = ref<PlatformUser[]>([])
const searchingUsers = ref(false)

watch(userSearch, async (query) => {
  searchingUsers.value = true
  try {
    const res = await usersApi.list({ search: query || undefined, per_page: 10 })
    userOptions.value = res.data
  } finally {
    searchingUsers.value = false
  }
})

const adding = ref(false)
const canAdd = computed(() =>
  !!form.role_key && (form.assigneeMode === 'user' ? !!form.assignee_user_id : !!form.contact_name.trim())
)

async function addAssignment() {
  if (!canAdd.value || !form.role_key) return
  adding.value = true
  const res = await store.addAssignment(props.deploymentId, {
    role_key: form.role_key,
    assignee_user_id: form.assigneeMode === 'user' ? form.assignee_user_id ?? undefined : undefined,
    contact_name: form.assigneeMode === 'contact' ? form.contact_name : undefined,
    contact_email: form.assigneeMode === 'contact' ? form.contact_email || undefined : undefined,
    contact_phone: form.assigneeMode === 'contact' ? form.contact_phone || undefined : undefined,
  })
  if (res.success) {
    form.role_key = null
    form.assignee_user_id = null
    form.contact_name = ''
    form.contact_email = ''
    form.contact_phone = ''
  }
  adding.value = false
}

const removingId = ref<number | null>(null)

async function removeAssignment(assignmentId: number) {
  removingId.value = assignmentId
  await store.deleteAssignment(props.deploymentId, assignmentId)
  removingId.value = null
}
</script>

<template>
  <v-dialog v-model="localShow" max-width="720px" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        Team Assignment
        <v-btn icon="mdi-close" variant="text" size="small" @click="localShow = false" />
      </v-card-title>
      <v-divider />
      <v-card-text style="max-height: 70vh">
        <div v-for="role in ASSIGNMENT_ROLES" :key="role" class="mb-4">
          <div class="d-flex align-center ga-2 mb-1">
            <span class="font-weight-medium">{{ ASSIGNMENT_ROLE_LABEL[role] }}</span>
            <v-chip v-if="REQUIRED_ASSIGNMENT_ROLES.includes(role)" size="x-small" variant="tonal" color="primary" label>required</v-chip>
          </div>
          <div v-if="assignmentsFor(role).length" class="d-flex flex-wrap ga-2 mb-1">
            <v-chip
              v-for="a in assignmentsFor(role)" :key="a.id"
              closable size="small" variant="tonal"
              :disabled="removingId === a.id"
              @click:close="removeAssignment(a.id)"
            >
              {{ a.assignee_name || a.contact_name }}
              <span v-if="a.contact_email" class="text-caption ml-1">({{ a.contact_email }})</span>
            </v-chip>
          </div>
          <p v-else class="text-caption textSecondary mb-1">Not yet assigned.</p>
        </div>

        <v-divider class="my-4" />

        <h4 class="text-subtitle-1 font-weight-medium mb-2">Add assignment</h4>
        <div class="d-flex flex-wrap ga-2 align-center mb-2">
          <v-select
            v-model="form.role_key"
            :items="ROLE_OPTIONS"
            label="Role" density="compact" variant="outlined" hide-details style="min-width: 220px"
          />
          <v-btn-toggle v-model="form.assigneeMode" density="compact" mandatory>
            <v-btn value="user" size="small">System user</v-btn>
            <v-btn value="contact" size="small">External contact</v-btn>
          </v-btn-toggle>
        </div>

        <div v-if="form.assigneeMode === 'user'" class="mb-2">
          <v-autocomplete
            v-model="form.assignee_user_id"
            v-model:search="userSearch"
            :items="userOptions"
            :loading="searchingUsers"
            item-title="name" item-value="id"
            label="Search users by name/email" density="compact" variant="outlined" hide-details
            no-filter
          />
        </div>
        <div v-else class="d-flex flex-wrap ga-2 mb-2">
          <v-text-field v-model="form.contact_name" label="Contact name" density="compact" variant="outlined" hide-details style="max-width: 200px" />
          <v-text-field v-model="form.contact_email" label="Email (optional)" density="compact" variant="outlined" hide-details style="max-width: 200px" />
          <v-text-field v-model="form.contact_phone" label="Phone (optional)" density="compact" variant="outlined" hide-details style="max-width: 160px" />
        </div>

        <v-btn color="primary" variant="tonal" :loading="adding" :disabled="!canAdd" @click="addAssignment">
          Add assignment
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
