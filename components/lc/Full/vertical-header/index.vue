<script setup lang="ts">
import { ref } from "vue";
import { useCustomizerStore } from "@/stores/customizer";
import { useTenantStore } from "@/stores/tenant";
import { Icon } from "@iconify/vue";
// Icon Imports
import { Menu2Icon } from "vue-tabler-icons";
import RightMobileSidebar from "./RightMobileSidebar.vue";
import LanguageDD from "./LanguageDD.vue";
import ProfileDD from "./ProfileDD.vue";
import FacilitySwitcher from "@/components/hmis/FacilitySwitcher.vue";

const customizer = useCustomizerStore();
const tenant = useTenantStore();
const priority = ref(customizer.setHorizontalLayout ? 0 : 0);
</script>

<template>
  <v-app-bar
    elevation="0"
    :priority="priority"
    height="70"
    class="main-head"
    id="top"
  >
    <v-btn
      class="custom-hover-primary hidden-lg-and-up"
      icon
      rounded="circle"
      variant="flat"
      @click.stop="customizer.SET_SIDEBAR_DRAWER"
      size="small"
    >
      <Menu2Icon size="20" stroke-width="1.5" />
    </v-btn>

    <!-- Organization context -->
    <v-chip
      v-if="tenant.organizationId"
      color="primary"
      variant="tonal"
      size="small"
      class="ml-2 hidden-sm-and-down"
      prepend-icon="mdi-domain"
    >
      {{ tenant.organizationId }}
    </v-chip>

    <v-spacer />

    <!-- Mobile Logo -->
    <div class="hidden-md-and-up">
      <LcFullLogo />
    </div>

    <!-- Active facility switcher -->
    <div class="hidden-sm-and-down mr-2">
      <FacilitySwitcher />
    </div>

    <LcFullVerticalHeaderThemeToggler />

    <div class="hidden-sm-and-down">
      <LcFullVerticalHeaderLanguageDD />
    </div>

    <!-- User Profile -->
    <div class="hidden-sm-and-down">
      <LcFullVerticalHeaderProfileDD />
    </div>

    <v-menu :close-on-content-click="true" class="mobile_popup">
      <template v-slot:activator="{ props }">
        <v-btn
          icon
          class="hidden-md-and-up custom-hover-primary"
          color="primary"
          rounded="circle"
          variant="text"
          v-bind="props"
          size="small"
        >
          <Icon icon="solar:menu-dots-bold-duotone" height="22" />
        </v-btn>
      </template>
      <v-sheet rounded="lg" elevation="10" class="mt-4 dropdown-box px-4 py-3">
        <div class="d-flex justify-space-between align-center">
          <RightMobileSidebar />
          <LanguageDD />
          <ProfileDD />
        </div>
      </v-sheet>
    </v-menu>
  </v-app-bar>
</template>
