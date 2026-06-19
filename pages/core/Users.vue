<script setup lang="ts">
import { ref, onMounted } from "vue";

import BaseBreadcrumb from "@/components/shared/BaseBreadcrumb.vue";
import UiParentCard from "@/components/shared/UiParentCard.vue";
import UserFormDialog from "~/components/pages/UserFormDialog.vue";
import { useUsersStore } from "~/stores/users";

// Page info
const page = ref({ title: "Users" });
const breadcrumbs = ref([
  { text: "Dashboard", disabled: false, href: "#" },
  { text: "Users", disabled: true, href: "#" },
]);

// Store + state
const usersStore = useUsersStore();
const loading = ref(false);
const dialog = ref(false);
const selectedUser = ref<any>(null);

// Fetch users
const fetchUsers = async () => {
  loading.value = true;
  await usersStore.fetchUsers();
  loading.value = false;
};

onMounted(fetchUsers);

// Handlers
const openCreateDialog = () => {
  selectedUser.value = null;
  dialog.value = true;
};

const editUser = (user: any) => {
  selectedUser.value = user;
  dialog.value = true;
};

const deleteUser = async (id: number | string) => {
  if (confirm("Are you sure you want to delete this user?")) {
    await usersStore.deleteUser(id);
    await fetchUsers();
  }
};

const onSaved = async () => {
  dialog.value = false;
  await fetchUsers();
};
</script>

<template>
  <div class="d-flex align-center justify-space-between mb-4">
    <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs" />
  </div>

  <v-row>
    <v-col cols="12">
      <UiParentCard title="Users">
        <v-btn color="primary" class="mt-2" @click="openCreateDialog">
          <v-icon start>mdi-plus</v-icon>
          Add User
        </v-btn>

        <v-card elevation="0" class="mt-4 border">
          <v-progress-linear
            v-if="loading"
            indeterminate
            color="primary"
            height="4"
          />

          <!-- Users Table -->
          <v-table v-else class="user-table">
            <thead>
              <tr>
                <th class="text-h6 ps-6">User</th>
                <th class="text-h6">Status</th>
                <th class="text-h6">Email</th>
                <th class="text-h6">Roles</th>
                <th class="text-h6 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="item in usersStore.users"
                :key="item.id"
                class="month-item"
              >
                <td class="ps-6">
                  <div class="d-flex gap-3 align-center">
                    <v-avatar size="40">
                      <img
                        :src="item.avatar || '/images/default-avatar.png'"
                        alt="avatar"
                      />
                    </v-avatar>
                    <div>
                      <h6 class="text-h6">{{ item.full_name }}</h6>
                      <div class="text-body-1 textSecondary">
                        {{ item.username }}
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <v-chip
                    :color="item.active ? 'success' : 'error'"
                    size="small"
                    rounded="sm"
                  >
                    {{ item.active ? "Active" : "Inactive" }}
                  </v-chip>
                </td>

                <td>{{ item.email }}</td>

                <td>
                  <div class="d-flex flex-wrap">
                    <v-chip
                      v-for="role in item.roles || []"
                      :key="role.id"
                      color="primary"
                      size="small"
                      class="ma-1"
                    >
                      {{ role.name }}
                    </v-chip>
                  </div>
                </td>

                <td class="text-center">
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn icon variant="text" v-bind="props">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>

                    <v-list>
                      <v-list-item @click="editUser(item)">
                        <v-icon start>mdi-pencil</v-icon>Edit
                      </v-list-item>
                      <v-list-item @click="deleteUser(item.id)">
                        <v-icon start color="error">mdi-delete</v-icon>Delete
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </td>
              </tr>

              <tr v-if="!usersStore.users.length && !loading">
                <td colspan="5" class="text-center text-medium-emphasis py-6">
                  No users found.
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </UiParentCard>
    </v-col>
  </v-row>

  <UserFormDialog v-model:show="dialog" :user="selectedUser" @saved="onSaved" />
</template>

<style scoped>
.user-table {
  width: 100%;
  border-collapse: collapse;
}
.user-table th {
  background-color: #f5f5f5;
}
</style>
