<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";
import { useTenantStore } from "@/stores/tenant";

const auth = useAuthStore();
const tenant = useTenantStore();
</script>

<template>
  <v-menu open-on-hover open-on-click>
    <template v-slot:activator="{ props }">
      <v-btn
        variant="text"
        class="custom-hover-primary"
        rounded="circle"
        color="primary"
        v-bind="props"
        icon
      >
        <v-avatar size="35" color="primary" variant="tonal">
          <v-icon icon="mdi-account" />
        </v-avatar>
      </v-btn>
    </template>
    <v-sheet rounded="md" width="300" elevation="10">
      <div class="pa-6">
        <div class="d-flex align-center pb-4">
          <v-avatar size="48" color="primary" variant="tonal">
            <v-icon icon="mdi-account" size="28" />
          </v-avatar>
          <div class="ml-3">
            <h6 class="text-subtitle-1">{{ auth.user?.name || auth.user?.email || tenant.lastEmail || 'Signed in' }}</h6>
            <span class="text-caption textSecondary">{{ auth.user?.email }}</span>
          </div>
        </div>
        <v-divider class="mb-3" />
        <v-btn block color="error" variant="tonal" prepend-icon="mdi-logout" @click="auth.logout">
          Logout
        </v-btn>
      </div>
    </v-sheet>
  </v-menu>
</template>
