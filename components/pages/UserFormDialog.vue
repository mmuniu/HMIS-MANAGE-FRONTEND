<template>
  <v-dialog v-model="localShow" max-width="500px">
    <v-card>
      <v-card-title>
        {{ isEdit ? 'Edit User' : 'Add User' }}
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="saveUser">
          <v-text-field v-model="form.full_name" label="Full Name" required />
          <v-text-field v-model="form.username" label="Username" required />
          <v-text-field v-model="form.email" label="Email" type="email" required />
          <v-switch v-model="form.active" label="Active" />

          <v-btn
            type="submit"
            color="primary"
            class="mt-4"
            :loading="saving"
            block
          >
            {{ isEdit ? 'Save Changes' : 'Create User' }}
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useUsersStore } from '~/stores/users'

interface Props {
  show: boolean
  user?: any
}

const props = defineProps<Props>()
const emit = defineEmits(['update:show', 'saved'])

const usersStore = useUsersStore()

const localShow = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
})

const form = ref({
  full_name: '',
  username: '',
  email: '',
  active: true,
})

const saving = ref(false)
const isEdit = computed(() => !!props.user)

watch(
  () => props.user,
  (user) => {
    if (user) {
      form.value = {
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        active: user.active,
      }
    } else {
      form.value = { full_name: '', username: '', email: '', active: true }
    }
  },
  { immediate: true }
)

const saveUser = async () => {
  saving.value = true
  try {
    if (isEdit.value && props.user?.id) {
      await usersStore.updateUser(props.user.id, form.value)
    } else {
      await usersStore.createUser(form.value)
    }
    emit('saved')
    emit('update:show', false)
  } finally {
    saving.value = false
  }
}
</script>
