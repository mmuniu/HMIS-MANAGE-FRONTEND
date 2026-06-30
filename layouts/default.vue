<script setup lang="ts">
import { RouterView } from "vue-router";
import VerticalSidebarVue from "@/components/lc/Full/vertical-sidebar/index.vue";
import VerticalHeaderVue from "@/components/lc/Full/vertical-header/index.vue";
import HorizontalHeader from "@/components/lc/Full/horizontal-header/index.vue";
import HorizontalSidebar from "@/components/lc/Full/horizontal-sidebar/index.vue";
import Customizer from "@/components/lc/Full/customizer/Customizer.vue";

import { onMounted } from "vue";
import { useCustomizerStore } from "@/stores/customizer";
import { useAuthStore } from "@/stores/auth";

const customizer = useCustomizerStore();
const auth = useAuthStore();

// The token persists in a cookie but the user object does not survive a reload.
// Re-hydrate it so role-based UI (sidebar, dashboard) renders correctly.
onMounted(() => {
  if (auth.isAuthenticated && !auth.user) auth.fetchCurrentUser();
});
</script>

<template>
  <!-----RTL LAYOUT------->
  <v-locale-provider v-if="customizer.setRTLLayout" rtl>
    <v-app
      :theme="customizer.actTheme"
      class="bg-containerBg"
      :class="[
        customizer.actTheme,
        customizer.setHorizontalLayout ? 'horizontalLayout' : 'verticalLayout',
        customizer.setBorderCard ? 'cardBordered' : '',
      ]"
    >
      <!---Customizer location left side--->
      <ClientOnly>
        <v-navigation-drawer
          app
          temporary
          elevation="10"
          location="left"
          v-model="customizer.Customizer_drawer"
          width="320"
          class="left-customizer"
        >
          <Customizer />
        </v-navigation-drawer>
        <VerticalSidebarVue v-if="!customizer.setHorizontalLayout" />
        <div :class="customizer.boxed ? 'maxWidth' : 'full-header'">
          <VerticalHeaderVue v-if="!customizer.setHorizontalLayout" />
        </div>
        <div :class="customizer.boxed ? 'maxWidth' : 'full-header'">
          <HorizontalHeader v-if="customizer.setHorizontalLayout" />
        </div>
        <HorizontalSidebar v-if="customizer.setHorizontalLayout" />
      </ClientOnly>
      <v-main class="ml-md-4">
        <div class="rtl-lyt mb-3 hr-layout bg-containerBg">
          <v-container
            fluid
            class="page-wrapper bg-background pt-12 rounded-xl"
          >
            <div class="px-sm-6">
              <div :class="customizer.boxed ? 'maxWidth' : ''">
                <NuxtPage />
                <v-btn
                  class="customizer-btn"
                  size="large"
                  rounded="circle"
                  icon
                  variant="flat"
                  color="primary"
                  @click.stop="
                    customizer.SET_CUSTOMIZER_DRAWER(
                      !customizer.Customizer_drawer
                    )
                  "
                >
                  <SettingsIcon />
                </v-btn>
              </div>
            </div>
          </v-container>
        </div>
      </v-main>
    </v-app>
  </v-locale-provider>

  <!-----LTR LAYOUT------->
  <v-locale-provider v-else>
    <v-app
      :theme="customizer.actTheme"
      class="bg-containerBg"
      :class="[
        customizer.actTheme,
        customizer.setHorizontalLayout ? 'horizontalLayout' : 'verticalLayout',
        customizer.setBorderCard ? 'cardBordered' : '',
      ]"
    >
      <!---Customizer location right side--->
      <ClientOnly>
        <v-navigation-drawer
          app
          temporary
          elevation="10"
          location="right"
          v-model="customizer.Customizer_drawer"
          width="320"
        >
          <Customizer />
        </v-navigation-drawer>
        <VerticalSidebarVue v-if="!customizer.setHorizontalLayout" />
        <div :class="customizer.boxed ? 'maxWidth' : 'full-header'">
          <VerticalHeaderVue v-if="!customizer.setHorizontalLayout" />
        </div>
        <div :class="customizer.boxed ? 'maxWidth' : 'full-header'">
          <HorizontalHeader v-if="customizer.setHorizontalLayout" />
        </div>
        <HorizontalSidebar v-if="customizer.setHorizontalLayout" />
      </ClientOnly>
      <v-main class="mr-md-4">
        <div class="mb-3 hr-layout bg-containerBg">
          <v-container
            fluid
            class="page-wrapper bg-background pt-12 rounded-xl"
          >
            <div class="px-sm-6">
              <div :class="customizer.boxed ? 'maxWidth' : ''">
                <NuxtPage />
                <v-btn
                  class="customizer-btn"
                  size="large"
                  rounded="circle"
                  icon
                  variant="flat"
                  color="primary"
                  @click.stop="
                    customizer.SET_CUSTOMIZER_DRAWER(
                      !customizer.Customizer_drawer
                    )
                  "
                >
                  <SettingsIcon />
                </v-btn>
              </div>
            </div>
          </v-container>
        </div>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>
