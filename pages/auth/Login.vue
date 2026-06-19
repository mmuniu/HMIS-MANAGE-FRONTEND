<template>
  <ClientOnly>
    <div class="authentication auth-bg">
      <v-container class="pa-3 auth-login">
        <v-row class="h-100vh d-flex justify-center align-center">
          <v-col cols="12" class="d-flex align-center">
            <v-card rounded="md" elevation="10" class="mx-auto">
              <div class="pa-3">
                <v-row>
                  <v-col
                    cols="12"
                    md="6"
                    class="border-e px-md-12 px-6 py-md-12 py-6"
                  >
                    <div class="d-flex"><Logo /></div>
                    <h2 class="text-34 my-6">Sign in to HMIS Platform</h2>
                    <BoxedLoginForm />
                    <p class="text-16 text-medium-emphasis mt-6">
                      Accounts are provisioned by your platform administrator.
                    </p>
                  </v-col>
                  <v-col cols="12" md="6" class="d-md-flex d-none">
                    <div
                      class="d-flex flex-column justify-center px-md-12 px-6 h-100 align-center"
                    >
                      <div>
                        <img
                          src="/images/backgrounds/login-side.png"
                          alt="matdash-img"
                          width="300"
                        />
                      </div>

                      <v-carousel
                        :continuous="false"
                        :show-arrows="false"
                        cycle
                        height="200"
                        hide-delimiter-background
                        class="text-center mt-4"
                      >
                        <v-carousel-item
                          v-for="item in AuthCuroselData"
                          :key="item.title"
                        >
                          <h3 class="text-h3 mb-4">{{ item.title }}</h3>
                          <p class="textSecondary text-body-1">
                            {{ item.subtitle }}
                          </p>
                          <v-btn color="primary" class="mt-4" flat
                            >Learn More</v-btn
                          >
                        </v-carousel-item>
                      </v-carousel>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import BoxedLoginForm from "@/components/auth/BoxedLoginForm.vue";

import { AuthCuroselData } from "@/_mockApis/components/pages/auth";
import Logo from "~/components/lc/Full/logo/Logo.vue";

definePageMeta({
  layout: "blank",
});
</script>
