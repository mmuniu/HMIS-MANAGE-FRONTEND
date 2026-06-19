<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useNuxtApp } from "#app";

import google from "/images/svgs/google-icon.svg";
import facebook from "/images/svgs/facebook-icon.svg";
import type { RegisterUser } from "~/types/components/auth/auth";

const router = useRouter();
const { $axios, $showToast } = useNuxtApp();

const loggedUser = ref<RegisterUser>({
  username: "",
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const apiError = ref("");

const usernameRules = [(v: string) => !!v || "Username is required"];
const nameRules = [(v: string) => !!v || "Name is required"];
const emailRules = [
  (v: string) => !!v || "E-mail is required",
  (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid",
];
const passwordRules = [(v: string) => !!v || "Password is required"];
const passwordConfirmationRules = [
  (v: string) => !!v || "Password confirmation is required",
  (v: string) => v === loggedUser.value.password || "Passwords must match",
];

const authStore = useAuthStore()

const onSubmit = async (values: any) => {
  await authStore.register(values)
}


await authStore.logout()

</script>

<template>
  <v-row class="d-flex mb-6">
    <v-col cols="6" sm="6" class="pr-2">
      <v-btn variant="outlined" size="large" block>
        <img :src="facebook" width="20" class="mr-1" alt="facebook" />
        <span class="d-md-flex d-none mr-1">Sign in with</span> Facebook
      </v-btn>
    </v-col>
    <v-col cols="6" sm="6" class="pl-2">
      <v-btn variant="outlined" size="large" block>
        <img :src="google" height="16" class="mr-2" alt="google" />
        <span class="d-md-flex d-none mr-1">Sign in with</span> Google
      </v-btn>
    </v-col>
  </v-row>

  <div class="d-flex align-center text-center mb-6">
    <div class="text-h6 w-100 px-5 font-weight-regular auth-divider position-relative">
      <span class="bg-surface px-5 py-3 position-relative">Or sign up with email</span>
    </div>
  </div>

  <v-form @submit.prevent="onSubmit" class="mt-5">
    <v-label class="font-weight-medium pb-2">Username</v-label>
    <VTextField v-model="loggedUser.username" :rules="usernameRules" required />

    <v-label class="font-weight-medium pb-2">Name</v-label>
    <VTextField v-model="loggedUser.name" :rules="nameRules" required />

    <v-label class="font-weight-medium pb-2">Email Address</v-label>
    <VTextField v-model="loggedUser.email" :rules="emailRules" required />

    <v-label class="font-weight-medium pb-2">Password</v-label>
    <VTextField
      v-model="loggedUser.password"
      :rules="passwordRules"
      required
      variant="outlined"
      type="password"
      color="primary"
    />

    <v-label class="font-weight-medium pb-2">Confirm Password</v-label>
    <VTextField
      v-model="loggedUser.password_confirmation"
      :rules="passwordConfirmationRules"
      required
      variant="outlined"
      type="password"
      color="primary"
    />

    <v-btn size="large" class="mt-2" color="darkgray" block type="submit" flat>
      Sign Up
    </v-btn>

    <div v-if="apiError" class="mt-2">
      <v-alert color="error">{{ apiError }}</v-alert>
    </div>
  </v-form>
</template>
