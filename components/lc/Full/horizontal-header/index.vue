<script setup lang="ts">
import { ref, watch } from "vue";
import { useCustomizerStore } from "@/stores/customizer";
import { Icon } from "@iconify/vue";
import { useEcomStore } from "@/stores/apps/eCommerce";
// Icon Imports
import { Menu2Icon } from "vue-tabler-icons";
import LanguageDD from "../vertical-header/LanguageDD.vue";
import NotificationDD from "../vertical-header/NotificationDD.vue";
import ProfileDD from "../vertical-header/ProfileDD.vue";
import RightMobileSidebar from "../vertical-header/RightMobileSidebar.vue";
const customizer = useCustomizerStore();
const showSearch = ref(false);
const priority = ref(customizer.setHorizontalLayout ? 0 : 0);
function searchbox() {
  showSearch.value = !showSearch.value;
}
watch(priority, (newPriority) => {
  // yes, console.log() is a side effect
  priority.value = newPriority;
});
// count items
const store = useEcomStore();
const getCart = computed(() => {
  return store.cart;
});
</script>

<template>
  <v-app-bar
    elevation="0"
    :priority="priority"
    height="70"
    class="horizontal-header border-b "
  >
    <div
      :class="
        customizer.boxed
          ? 'maxWidth v-toolbar__content'
          : 'v-toolbar__content px-6'
      "
    >
      <div class="hidden-md-and-down">
        <LcFullLogo />
      </div>

      <v-btn
        class="hidden-lg-and-up ms-3 custom-hover-primary"
        icon
        rounded="circle"
        variant="flat"
        @click.stop="customizer.SET_SIDEBAR_DRAWER"
        size="small"
      >
        <Menu2Icon size="20" stroke-width="1.5" />
      </v-btn>

      <v-sheet v-if="showSearch" class="search-sheet v-col-12">
        <LcFullVerticalHeaderSearchbar :closesearch="searchbox" />
      </v-sheet>

      <!-- ---------------------------------------------- -->
      <!-- Search part -->
      <!-- ---------------------------------------------- -->

      <LcFullVerticalHeaderSearchbar />

      <!---/Search part -->

      <!-- ---------------------------------------------- -->
      <!-- Mega menu -->
      <!-- ---------------------------------------------- -->
      <div class="hidden-sm-and-down">
        <LcFullVerticalHeaderNavigations />
      </div>

      <v-spacer class="hidden-sm-and-down" />

      <!-- ---------------------------------------------- -->
      <!-- Mobile Logo -->
      <!-- ---------------------------------------------- -->
      <div class="hidden-md-and-up">
        <LcFullLogo />
      </div>

      <LcFullVerticalHeaderThemeToggler />

      <!-- ---------------------------------------------- -->
      <!---right part -->
      <!-- ---------------------------------------------- -->
      <!-- ---------------------------------------------- -->
      <!-- translate -->
      <!-- ---------------------------------------------- -->
      <div class="hidden-sm-and-down">
        <LcFullVerticalHeaderLanguageDD />
      </div>

      <!-- ---------------------------------------------- -->
      <!-- ShoppingCart -->
      <!-- ---------------------------------------------- -->
      <v-btn
        icon
        variant="text"
        class="custom-hover-primary hidden-sm-and-down"
        to="/apps/ecommerce/checkout"
        size="small"
      >
        <v-badge color="error" :content="getCart?.length">
          <Icon icon="solar:cart-large-2-outline" height="22" />
        </v-badge>
      </v-btn>
      <!-- ------------------------------------------------>
      <!-- Notification -->
      <!-- ------------------------------------------------>
      <div class="hidden-sm-and-down">
        <LcFullVerticalHeaderNotificationDD />
      </div>

      <!-- ---------------------------------------------- -->
      <!-- User Profile -->
      <!-- ---------------------------------------------- -->
      <div class="hidden-sm-and-down">
        <LcFullVerticalHeaderProfileDD />
      </div>

      <v-menu :close-on-content-click="true" class="mobile_popup">
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            class="hidden-md-and-up custom-hover-primary"
            color="primary"
            variant="text"
            v-bind="props"
            size="small"
          >
            <Icon icon="solar:menu-dots-bold-duotone" height="22" />
          </v-btn>
        </template>
        <v-sheet
          rounded="lg"
          elevation="10"
          class="mt-4 dropdown-box px-4 py-3"
        >
          <div class="d-flex justify-space-between align-center">
            <RightMobileSidebar />
            <LanguageDD />
            <v-btn
              icon
              variant="text"
              class="custom-hover-primary "
              to="/apps/ecommerce/checkout"
              size="small"
            >
              <v-badge color="error" :content="getCart?.length">
                <Icon icon="solar:cart-large-2-outline" height="22" />
              </v-badge>
            </v-btn>
            <NotificationDD />
            <ProfileDD />
          </div>
        </v-sheet>
      </v-menu>
    </div>
  </v-app-bar>
  
</template>
