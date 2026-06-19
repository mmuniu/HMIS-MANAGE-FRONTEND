<template>
  <v-card class="pa-4">
    <div class="d-flex justify-space-between align-center mb-4">
      <h3>Roles & Permissions</h3>
      <v-btn color="primary" @click="openCreateRole">
        <v-icon left>mdi-plus</v-icon>
        Add Role
      </v-btn>
    </div>

    <v-table>
      <thead>
        <tr>
          <th>Role</th>
          <th>Permissions</th>
          <th class="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="role in rolesStore.roles" :key="role.id">
          <td>{{ role.name }}</td>
          <td>
            <v-chip
              v-for="perm in role.permissions || []"
              :key="perm.id"
              color="info"
              class="ma-1"
              close
              @click:close="removePermission(role, perm)"
            >
              {{ perm.name }}
            </v-chip>
          </td>
          <td class="text-center">
            <v-btn icon @click="editRole(role)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon @click="deleteRole(role.id)">
              <v-icon color="error">mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>

        <tr v-if="!rolesStore.roles.length">
          <td colspan="3" class="text-center py-6">No roles found.</td>
        </tr>
      </tbody>
    </v-table>

    <RoleFormDialog
      v-model:show="dialog"
      :role="selectedRole"
      @saved="onSaved"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRolesStore } from "~/stores/roles";
import RoleFormDialog from "@/components/pages/RoleFormDialog.vue";

const rolesStore = useRolesStore();
const dialog = ref(false);
const selectedRole = ref<any>(null);

// Fetch roles and permissions on mount
const fetchRoles = async () => {
  await rolesStore.fetchRoles();
  await rolesStore.fetchPermissions();
};

onMounted(fetchRoles);

const openCreateRole = () => {
  selectedRole.value = null;
  dialog.value = true;
};

const editRole = (role: any) => {
  selectedRole.value = role;
  dialog.value = true;
};

const deleteRole = async (roleId: number) => {
  if (!confirm("Are you sure you want to delete this role?")) return;
  await rolesStore.deleteRole(roleId);
  await fetchRoles();
};

// Unassign a single permission from a role
const removePermission = async (role: any, perm: any) => {
  await rolesStore.unassignPermissionsFromRole(role.id, [perm.id]);
  await fetchRoles();
};

// Refresh table after creating or updating a role
const onSaved = async () => {
  dialog.value = false;
  await fetchRoles();
};
</script>
