<template>
  <Form @submit="onSubmit" class="mt-2">
    <v-label class="font-weight-semibold pb-2">Email</v-label>
    <Field name="email" :rules="emailRules" v-slot="{ field, errorMessage }">
      <VTextField
        v-bind="field"
        v-model="formData.email"
        label="you@example.com"
        type="email"
        required
        :error-messages="errorMessage"
        hide-details="auto"
        class="mb-6"
      />
    </Field>

    <v-label class="font-weight-semibold pb-2">Password</v-label>
    <Field name="password" :rules="requiredRule" v-slot="{ field, errorMessage }">
      <VTextField
        v-bind="field"
        v-model="formData.password"
        label="Password"
        type="password"
        required
        :error-messages="errorMessage"
        hide-details="auto"
        class="mb-6"
      />
    </Field>

    <v-label class="font-weight-semibold pb-2">Organization ID</v-label>
    <Field name="organization_id" :rules="requiredRule" v-slot="{ field, errorMessage }">
      <VTextField
        v-bind="field"
        v-model="formData.organization_id"
        label="e.g. org_hmis_demo"
        required
        :error-messages="errorMessage"
        hide-details="auto"
        class="mb-6"
      />
    </Field>

    <v-label class="font-weight-semibold pb-2">Active Facility ID</v-label>
    <Field name="active_facility_id" :rules="requiredRule" v-slot="{ field, errorMessage }">
      <VTextField
        v-bind="field"
        v-model="formData.active_facility_id"
        label="e.g. fac_demo_main"
        required
        :error-messages="errorMessage"
        hide-details="auto"
        class="mb-2"
      />
    </Field>

    <p class="text-caption textSecondary mb-4">
      Your token is scoped to one organization and facility. You can switch
      facilities after signing in.
    </p>

    <v-btn
      size="large"
      color="primary"
      type="submit"
      block
      flat
      :loading="auth.submitting"
    >
      Sign In
    </v-btn>

    <v-alert v-if="auth.apiError" type="error" variant="tonal" class="mt-4" density="compact">
      {{ auth.apiError }}
    </v-alert>
  </Form>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";
import { Form, Field } from "vee-validate";
import { useAuthStore } from "@/stores/auth";
import { useTenantStore } from "@/stores/tenant";

const auth = useAuthStore();
const tenant = useTenantStore();

const formData = reactive({
  email: "",
  password: "",
  organization_id: "",
  active_facility_id: "",
});

onMounted(() => {
  // Pre-fill the email from a previous session if available.
  if (tenant.lastEmail) formData.email = tenant.lastEmail as string;
});

const requiredRule = (v: string) => (!!v ? true : "This field is required");
const emailRules = (v: string) => {
  if (!v) return "Email is required";
  return /.+@.+\..+/.test(v) ? true : "Enter a valid email";
};

const onSubmit = async () => {
  await auth.login({
    email: formData.email,
    password: formData.password,
    organization_id: formData.organization_id,
    active_facility_id: formData.active_facility_id,
  });
};
</script>
