<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card>
      <v-card-title>{{ isEdit ? "Edit Role" : "Create Role" }}</v-card-title>

      <v-card-text>
        <v-text-field v-model="form.name" label="Role Name" required />

        <v-select
          v-model="form.permissions"
          :items="permissions"
          item-text="name"
          item-value="id"
          label="Permissions"
          multiple
          chips
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="close">Cancel</v-btn>
        <v-btn color="primary" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue"
import type { Ref } from "vue"
import { useRolesStore } from "~/stores/roles"

interface Role {
  id?: number
  name: string
  permissions?: { id: number; name: string }[]
}

interface Form {
  name: string
  permissions: number[]
}

const props = defineProps<{ show: boolean; role?: Role }>()
const emit = defineEmits<{
  (e: "update:show", value: boolean): void
  (e: "saved"): void
}>()

const rolesStore = useRolesStore()
const show = ref(props.show)
const form: Ref<Form> = ref({ name: "", permissions: [] })
const isEdit = computed(() => !!props.role?.id)

// Dynamically get permissions from rolesStore but only id and name
const permissions = computed(() =>
  rolesStore.permissions.map(p => ({ id: p.id, name: p.name }))
)

watch(() => props.show, (val) => (show.value = val))

watch(() => props.role, (val) => {
  if (val) {
    form.value = {
      name: val.name,
      permissions: val.permissions?.map(p => p.id) || []
    }
  } else {
    form.value = { name: "", permissions: [] }
  }
}, { immediate: true })

const close = () => emit("update:show", false)

const save = async () => {
  if (!form.value.name.trim()) return

  if (isEdit.value && props.role?.id) {
    const roleId = props.role.id
    const oldPermissions = props.role.permissions?.map(p => p.id) || []

    // Assign newly selected permissions
    for (const permId of form.value.permissions) {
      if (!oldPermissions.includes(permId)) {
        await rolesStore.assignPermissionsToRole(roleId, [permId])
      }
    }

    // Remove unchecked permissions
    for (const permId of oldPermissions) {
      if (!form.value.permissions.includes(permId)) {
        await rolesStore.unassignPermissionsFromRole(roleId, [permId])
      }
    }

    // Update role name if changed
    if (form.value.name !== props.role.name) {
      await rolesStore.updateRole(roleId, { name: form.value.name })
    }
  } else {
    const newRole = await rolesStore.createRole({ name: form.value.name })
    if (form.value.permissions.length) {
      await rolesStore.assignPermissionsToRole(newRole.id, form.value.permissions)
    }
  }

  emit("saved")
  close()
}
</script>
