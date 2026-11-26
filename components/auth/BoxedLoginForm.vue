<template>
  <!-- Select Your System (platform users with more than one) -->
  <div v-if="auth.step === 'system'" class="facility-selection-container">
    <div class="text-center mb-6">
      <Logo class="mb-4" />
      <h2 class="text-h5 font-weight-medium mb-1">Select a System</h2>
      <p class="text-body-2 textSecondary">Choose the system you want to work in</p>
    </div>

    <div class="facility-cards">
      <v-card
        v-for="sys in auth.systems"
        :key="sys.id"
        hover
        rounded="xl"
        variant="outlined"
        class="facility-card mb-3"
        :disabled="!!loadingSystemId && loadingSystemId !== sys.id"
        @click="selectSystem(sys.id)"
      >
        <v-card-text class="d-flex align-center pa-5">
          <v-avatar color="primary" variant="tonal" size="48" class="mr-4">
            <v-icon icon="mdi-layers-triple-outline" />
          </v-avatar>
          <div class="flex-grow-1">
            <p class="text-subtitle-1 font-weight-medium mb-0">{{ sys.name }}</p>
            <p class="text-caption textSecondary mb-0">
              {{ sys.is_default ? 'Default system' : 'System' }}
            </p>
          </div>
          <v-progress-circular
            v-if="loadingSystemId === sys.id"
            indeterminate
            color="primary"
            size="22"
            width="2"
          />
          <v-icon v-else color="primary" size="24" icon="mdi-chevron-right" />
        </v-card-text>
      </v-card>
    </div>

    <div class="text-center mt-6">
      <v-btn
        variant="text"
        color="secondary"
        prepend-icon="mdi-arrow-left"
        :disabled="!!loadingSystemId"
        @click="backToLoginFromSystem"
      >
        Back to Login
      </v-btn>
    </div>

    <v-alert
      v-if="auth.apiError"
      type="error"
      variant="tonal"
      density="compact"
      rounded="lg"
      class="mt-4"
    >
      {{ auth.apiError }}
    </v-alert>
  </div>

  <!-- Step 2: Select Your Facility -->
  <div v-else-if="auth.step === 'facility'" class="facility-selection-container">
    <div class="text-center mb-6">
      <Logo class="mb-4" />
      <h2 class="text-h5 font-weight-medium mb-1">Select Your Facility</h2>
      <p v-if="auth.organization" class="text-body-2 textSecondary">
        {{ auth.organization.name }}
      </p>
    </div>

    <div class="facility-cards">
      <v-card
        v-for="facility in auth.facilities"
        :key="facility.id"
        hover
        rounded="xl"
        variant="outlined"
        class="facility-card mb-3"
        :disabled="!!loadingFacilityId && loadingFacilityId !== facility.id"
        @click="selectFacility(facility.id)"
      >
        <v-card-text class="d-flex align-center pa-5">
          <v-avatar color="primary" variant="tonal" size="48" class="mr-4">
            <v-icon icon="mdi-hospital-building" />
          </v-avatar>
          <div class="flex-grow-1">
            <p class="text-subtitle-1 font-weight-medium mb-0">{{ facility.name }}</p>
            <p class="text-caption textSecondary mb-0">{{ facility.organization_name }}</p>
          </div>
          <v-progress-circular
            v-if="loadingFacilityId === facility.id"
            indeterminate
            color="primary"
            size="22"
            width="2"
          />
          <v-icon v-else color="primary" size="24" icon="mdi-chevron-right" />
        </v-card-text>
      </v-card>
    </div>

    <div class="text-center mt-6">
      <v-btn
        variant="text"
        color="secondary"
        prepend-icon="mdi-arrow-left"
        :disabled="!!loadingFacilityId"
        @click="backToLogin"
      >
        Back to Login
      </v-btn>
    </div>

    <v-alert
      v-if="auth.apiError"
      type="error"
      variant="tonal"
      density="compact"
      rounded="lg"
      class="mt-4"
    >
      {{ auth.apiError }}
    </v-alert>
  </div>

  <!-- Step 1: Login -->
  <div v-else>
    <div class="text-center mb-6">
      <Logo class="mb-4" />
      <h2 class="text-h5 font-weight-medium mb-1">Welcome Back</h2>
      <p class="text-body-2 textSecondary">Sign in to continue to your dashboard</p>
    </div>

    <Form @submit="onSubmit" class="mt-2">
      <Field name="username" :rules="requiredRule" v-slot="{ field, errorMessage }">
        <VTextField
          v-bind="field"
          v-model="form.username"
          label="Username"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
          :error-messages="errorMessage"
          hide-details="auto"
          class="mb-4"
        />
      </Field>

      <Field name="password" :rules="requiredRule" v-slot="{ field, errorMessage }">
        <VTextField
          v-bind="field"
          v-model="form.password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          variant="outlined"
          :error-messages="errorMessage"
          hide-details="auto"
          class="mb-4"
        />
      </Field>

      <v-btn
        size="large"
        color="primary"
        type="submit"
        block
        flat
        rounded="lg"
        :loading="isLoading"
        class="mb-4"
      >
        Sign In
      </v-btn>

      <div class="text-center mb-4">
        <a href="#" class="text-body-2 text-primary" @click.prevent="openForgotPassword">
          Forgot password?
        </a>
      </div>

      <v-alert
        v-if="auth.apiError"
        type="error"
        variant="tonal"
        density="compact"
        rounded="lg"
      >
        {{ auth.apiError }}
      </v-alert>
    </Form>
  </div>

  <!-- Forgot password -->
  <v-dialog v-model="showForgotPassword" max-width="440">
    <v-card rounded="lg">
      <v-card-title class="text-h6 pt-5 px-5">Forgot password?</v-card-title>
      <v-card-text class="px-5">
        <template v-if="!forgotPasswordResult">
          <p class="text-body-2 textSecondary mb-4">
            Enter your username or email. If an account matches, we'll email a new password to it.
          </p>
          <VTextField
            v-model="forgotPasswordIdentifier"
            label="Username or email"
            variant="outlined"
            hide-details="auto"
            autofocus
            :disabled="forgotPasswordLoading"
            @keyup.enter="submitForgotPassword"
          />
        </template>
        <v-alert
          v-else
          :type="forgotPasswordResult.success ? 'success' : 'error'"
          variant="tonal"
          density="compact"
          rounded="lg"
        >
          {{ forgotPasswordResult.message }}
        </v-alert>
      </v-card-text>
      <v-card-actions class="px-5 pb-5">
        <v-spacer />
        <v-btn variant="text" @click="closeForgotPassword">
          {{ forgotPasswordResult ? 'Close' : 'Cancel' }}
        </v-btn>
        <v-btn
          v-if="!forgotPasswordResult"
          color="primary"
          flat
          :loading="forgotPasswordLoading"
          :disabled="!forgotPasswordIdentifier"
          @click="submitForgotPassword"
        >
          Send new password
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { Form, Field } from "vee-validate";
import { useAuthStore } from "@/stores/auth";
import Logo from "~/components/lc/Full/logo/Logo.vue";

const auth = useAuthStore();

const form = reactive({ username: "", password: "" });
const showPassword = ref(false);
const isLoading = ref(false);
const loadingFacilityId = ref<string | null>(null);
const loadingSystemId = ref<string | null>(null);

const showForgotPassword = ref(false);
const forgotPasswordIdentifier = ref("");
const forgotPasswordLoading = ref(false);
const forgotPasswordResult = ref<{ success: boolean; message: string } | null>(null);

const requiredRule = (v: string) => (!!v ? true : "This field is required");

const onSubmit = async () => {
  isLoading.value = true;
  await auth.login({ username: form.username, password: form.password });
  isLoading.value = false;
};

const openForgotPassword = () => {
  forgotPasswordIdentifier.value = form.username;
  forgotPasswordResult.value = null;
  showForgotPassword.value = true;
};

const closeForgotPassword = () => {
  showForgotPassword.value = false;
  forgotPasswordIdentifier.value = "";
  forgotPasswordResult.value = null;
};

const submitForgotPassword = async () => {
  if (!forgotPasswordIdentifier.value || forgotPasswordLoading.value) return;
  forgotPasswordLoading.value = true;
  const result = await auth.forgotPassword(forgotPasswordIdentifier.value);
  forgotPasswordResult.value = {
    success: result.success,
    message: result.message || "If that account exists, we've emailed a new password to it.",
  };
  forgotPasswordLoading.value = false;
};

const selectFacility = async (facilityId: string) => {
  if (loadingFacilityId.value) return;
  loadingFacilityId.value = facilityId;
  await auth.selectFacilityAndLogin(facilityId);
  loadingFacilityId.value = null;
};

const selectSystem = async (systemId: string) => {
  if (loadingSystemId.value) return;
  loadingSystemId.value = systemId;
  await auth.selectSystemAndLogin(systemId);
  loadingSystemId.value = null;
};

const backToLogin = () => {
  form.password = "";
  auth.cancelFacilitySelection();
};

const backToLoginFromSystem = () => {
  form.password = "";
  auth.cancelSystemSelection();
};

// Clear the per-card spinner if an error fires.
watch(() => auth.apiError, (err) => {
  if (err) {
    loadingFacilityId.value = null;
    loadingSystemId.value = null;
  }
});
</script>

<style scoped>
.facility-cards {
  max-height: 340px;
  overflow-y: auto;
}
.facility-card {
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.facility-card:hover {
  background: rgba(var(--v-theme-primary), 0.04);
  border-color: rgba(var(--v-theme-primary), 0.3);
}
</style>
