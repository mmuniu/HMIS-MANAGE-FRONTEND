<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNuxtApp } from '#app'

const auth = useAuthStore()
const router = useRouter()
const { $axios, $showToast } = useNuxtApp()

const currentPassword = ref('')
const password = ref('')
const passwordConfirmation = ref('')

const showCurrent = ref(false)
const showNew = ref(false)

const saving = ref(false)
// Field-level errors returned by the API (422), keyed by field name.
const errors = ref<Record<string, string>>({})

const tooShort = computed(() => password.value.length > 0 && password.value.length < 8)
const mismatch = computed(
  () => passwordConfirmation.value.length > 0 && password.value !== passwordConfirmation.value,
)
const sameAsCurrent = computed(
  () => password.value.length > 0 && password.value === currentPassword.value,
)

const canSubmit = computed(
  () =>
    !saving.value &&
    currentPassword.value.length > 0 &&
    password.value.length >= 8 &&
    password.value === passwordConfirmation.value &&
    !sameAsCurrent.value,
)

async function submit() {
  if (!canSubmit.value) return
  saving.value = true
  errors.value = {}
  try {
    const { data } = await $axios.post('/v1/platform/account/password', {
      current_password: currentPassword.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })
    currentPassword.value = ''
    password.value = ''
    passwordConfirmation.value = ''
    // The API revoked every token, this one included, so the session is already
    // dead server-side. Clear it locally and go to login — passing revoked=true
    // skips a /logout call that would only 401.
    await auth.logout(data.message || 'Password changed. Please sign in again.', true)
  } catch (err: any) {
    // Laravel returns {message, errors:{field:[msg]}} on 422. Surface the
    // per-field message against the field rather than as a generic toast, so
    // "current password is wrong" lands where the user is looking.
    const bag = err?.response?.data?.errors
    if (bag) {
      errors.value = Object.fromEntries(
        Object.entries(bag).map(([k, v]) => [k, Array.isArray(v) ? String(v[0]) : String(v)]),
      )
    } else {
      $showToast(err?.response?.data?.message || 'Could not change your password.')
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-h4 font-weight-semibold mb-1">Change Password</h2>
    <p class="textSecondary mb-6">
      Update the password for
      <strong>{{ auth.user?.email || auth.user?.name || 'your account' }}</strong>.
    </p>

    <v-row>
      <v-col cols="12" md="7" lg="6">
        <v-card rounded="lg" elevation="10">
          <v-card-text>
            <v-form @submit.prevent="submit">
              <v-text-field
                v-model="currentPassword"
                label="Current Password"
                :type="showCurrent ? 'text' : 'password'"
                :append-inner-icon="showCurrent ? 'mdi-eye-off' : 'mdi-eye'"
                :error-messages="errors.current_password"
                variant="outlined"
                density="comfortable"
                autocomplete="current-password"
                class="mb-2"
                @click:append-inner="showCurrent = !showCurrent"
                @update:model-value="errors.current_password = ''"
              />

              <v-divider class="my-4" />

              <v-text-field
                v-model="password"
                label="New Password"
                :type="showNew ? 'text' : 'password'"
                :append-inner-icon="showNew ? 'mdi-eye-off' : 'mdi-eye'"
                :error-messages="
                  errors.password ||
                  (tooShort ? 'Password must be at least 8 characters.' : '') ||
                  (sameAsCurrent ? 'New password must be different from the current one.' : '')
                "
                variant="outlined"
                density="comfortable"
                autocomplete="new-password"
                hint="At least 8 characters."
                persistent-hint
                class="mb-4"
                @click:append-inner="showNew = !showNew"
                @update:model-value="errors.password = ''"
              />

              <v-text-field
                v-model="passwordConfirmation"
                label="Confirm New Password"
                :type="showNew ? 'text' : 'password'"
                :error-messages="mismatch ? 'Passwords do not match.' : ''"
                variant="outlined"
                density="comfortable"
                autocomplete="new-password"
                class="mb-2"
              />

              <div class="d-flex gap-2 mt-4">
                <v-btn
                  type="submit"
                  color="primary"
                  prepend-icon="mdi-lock-reset"
                  :loading="saving"
                  :disabled="!canSubmit"
                >
                  Change Password
                </v-btn>
                <v-btn variant="text" :disabled="saving" @click="router.back()">Cancel</v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.gap-2 { gap: 8px; }
</style>
