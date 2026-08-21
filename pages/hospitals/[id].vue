<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import { useHospitalsStore } from '@/stores/hospitals'
import { useAuthStore } from '@/stores/auth'
import { STATUS_COLOR, TIER_COLOR, BILLING_COLOR, type HospitalAdminUser } from '@/types/hospital'

const route = useRoute()
const router = useRouter()
const store = useHospitalsStore()
const auth = useAuthStore()
const { $showToast } = useNuxtApp()

const id = computed(() => String(route.params.id))
const h = computed(() => store.current)

const addressLines = computed(() => {
  const a = h.value?.address
  if (!a) return []
  return [a.line1, a.city, a.country].filter(Boolean)
})

const BED_FIELDS: { key: 'total_beds' | 'normal_beds' | 'icu_beds' | 'hdu_beds' | 'dialysis_beds' | 'number_of_cots'; label: string }[] = [
  { key: 'total_beds', label: 'Total beds' },
  { key: 'normal_beds', label: 'Normal beds' },
  { key: 'icu_beds', label: 'ICU beds' },
  { key: 'hdu_beds', label: 'HDU beds' },
  { key: 'dialysis_beds', label: 'Dialysis beds' },
  { key: 'number_of_cots', label: 'Number of cots' },
]

const confirmDelete = ref(false)

async function deleteHospital() {
  const res = await store.remove(id.value)
  confirmDelete.value = false
  if (res.success) router.push('/hospitals')
}

const showAdminPassword = ref(false)
const copiedAdminField = ref<'username' | 'password' | null>(null)

async function copyAdminField(text: string, field: 'username' | 'password') {
  await navigator.clipboard.writeText(text)
  copiedAdminField.value = field
  setTimeout(() => (copiedAdminField.value = null), 1500)
}

function provisionAdmin(adminId: number) {
  store.provisionAdmin(id.value, adminId)
}

const editAdminDialog = ref(false)
const editingAdmin = ref<HospitalAdminUser | null>(null)
const editAdminForm = reactive({ name: '', username: '', email: '' })

function openEditAdmin(a: HospitalAdminUser) {
  editingAdmin.value = a
  editAdminForm.name = a.name
  editAdminForm.username = a.username
  editAdminForm.email = a.email
  editAdminDialog.value = true
}

async function saveAdminEdit() {
  if (!editingAdmin.value) return
  const res = await store.updateAdmin(id.value, editingAdmin.value.id, { ...editAdminForm })
  if (res.success) {
    editAdminDialog.value = false
    $showToast(res.notified ? 'Admin details updated — confirmation email sent.' : 'Admin details updated.')
  }
}

const addAdminDialog = ref(false)
const addAdminForm = reactive({ name: '', username: '', email: '', password: '' })
const showAddAdminPassword = ref(false)

const PASSWORD_SYMBOLS = ['!', '@', '#', '$', '%', '^', '&', '*']
function generateAddAdminPassword() {
  const firstName = addAdminForm.name.trim().split(/\s+/)[0] || 'User'
  const digits = Math.floor(100000 + Math.random() * 900000)
  const symbol = PASSWORD_SYMBOLS[Math.floor(Math.random() * PASSWORD_SYMBOLS.length)]
  addAdminForm.password = `${firstName}${digits}${symbol}`
  showAddAdminPassword.value = true
}

function openAddAdmin() {
  addAdminForm.name = ''
  addAdminForm.username = ''
  addAdminForm.email = ''
  addAdminForm.password = ''
  showAddAdminPassword.value = false
  addAdminDialog.value = true
}

async function saveNewAdmin() {
  const res = await store.addAdmin(id.value, { ...addAdminForm })
  if (res.success) {
    addAdminDialog.value = false
    $showToast('Admin added — an invite email was sent.')
  }
}

// `[id].vue` is reused (not remounted) when navigating from one hospital's
// detail page straight to another's, since both match this same route —
// watch the param directly rather than relying on onMounted alone, or the
// page would keep showing the previous hospital's facilities/admins (and a
// leftover one-time credentials panel from a provisionAdmin() call made on
// the hospital navigated away from).
watch(
  id,
  (newId) => {
    store.lastAdminProvisionResult = null
    showAdminPassword.value = false
    editAdminDialog.value = false
    editingAdmin.value = null
    addAdminDialog.value = false
    store.fetchOne(newId)
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="ma-0" to="/hospitals">
        Back to hospitals
      </v-btn>
      <div class="d-flex ga-2">
        <v-btn v-if="auth.isPlatformUser && h" color="primary" variant="tonal" prepend-icon="mdi-pencil"
          :to="`/hospitals/${id}/edit`">
          Edit hospital
        </v-btn>
        <v-btn v-if="auth.isSystemAdmin && h" color="error" variant="tonal" prepend-icon="mdi-delete"
          @click="confirmDelete = true">
          Delete hospital
        </v-btn>
      </div>
    </div>

    <v-alert v-if="store.error" type="error" variant="tonal" class="mb-4" :text="store.error" />
    <v-progress-linear v-if="store.loading" indeterminate color="primary" class="mb-4" />

    <template v-if="h">
      <!-- Header -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-6 ga-3">
        <div>
          <h2 class="text-h4 font-weight-semibold">{{ h.display_name || h.name }}</h2>
          <p class="textSecondary">{{ h.legal_name || h.name }}</p>
        </div>
        <div class="d-flex ga-2">
          <v-chip :color="STATUS_COLOR[h.status]" variant="flat" label>{{ h.status }}</v-chip>
          <v-chip :color="TIER_COLOR[h.subscription_tier]" variant="tonal" label>{{ h.subscription_tier }}</v-chip>
          <v-chip v-if="h.is_sandbox" color="warning" variant="tonal" label>SANDBOX</v-chip>
        </div>
      </div>

      <v-row>
        <!-- 1. Isolation -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item>
              <v-card-title><v-icon icon="mdi-shield-lock" class="mr-2" />Tenant & Isolation</v-card-title>
            </v-card-item>
            <v-card-text>
              <v-list density="compact" lines="two">
                <v-list-item title="Tenant ID" :subtitle="h.tenant_id" />
                <v-list-item title="Organization ID" :subtitle="h.id" />
                <v-list-item title="Subdomain" :subtitle="h.subdomain || '—'" />
                <v-list-item title="Custom domain" :subtitle="h.custom_domain || '—'" />
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 2. Identity & localization -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item>
              <v-card-title><v-icon icon="mdi-map-marker" class="mr-2" />Identity & Localization</v-card-title>
            </v-card-item>
            <v-card-text>
              <v-list density="compact" lines="two">
                <v-list-item title="Legal name" :subtitle="h.legal_name || '—'" />
                <v-list-item title="Display name" :subtitle="h.display_name || '—'" />
                <v-list-item title="Timezone" :subtitle="h.timezone" />
                <v-list-item title="Locale" :subtitle="h.locale" />
                <v-list-item title="Address" :subtitle="addressLines.length ? addressLines.join(', ') : '—'" />
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 3. Billing & tiering -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item>
              <v-card-title><v-icon icon="mdi-credit-card" class="mr-2" />Billing & Subscription</v-card-title>
            </v-card-item>
            <v-card-text>
              <v-list density="compact" lines="two">
                <v-list-item title="Subscription tier">
                  <template #subtitle>
                    <v-chip :color="TIER_COLOR[h.subscription_tier]" size="small" variant="tonal" label>
                      {{ h.subscription_tier }}
                    </v-chip>
                  </template>
                </v-list-item>
                <v-list-item title="Billing status">
                  <template #subtitle>
                    <v-chip :color="BILLING_COLOR[h.billing_status]" size="small" variant="tonal" label>
                      {{ h.billing_status }}
                    </v-chip>
                  </template>
                </v-list-item>
                <v-list-item title="Max user slots" :subtitle="String(h.max_user_slots)" />
                <v-list-item title="Max patient records" :subtitle="String(h.max_patient_records)" />
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- 4. System & metadata -->
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item>
              <v-card-title><v-icon icon="mdi-cog" class="mr-2" />System & Metadata</v-card-title>
            </v-card-item>
            <v-card-text>
              <v-list density="compact" lines="two">
                <v-list-item title="Status">
                  <template #subtitle>
                    <v-chip :color="STATUS_COLOR[h.status]" size="small" variant="flat" label>{{ h.status }}</v-chip>
                  </template>
                </v-list-item>
                <v-list-item title="Sandbox" :subtitle="h.is_sandbox ? 'Yes' : 'No'" />
                <v-list-item title="Created" :subtitle="h.created_at || '—'" />
                <v-list-item title="Updated" :subtitle="h.updated_at || '—'" />
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 5. Core-service provisioning -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card rounded="lg" elevation="10">
            <v-card-item>
              <v-card-title><v-icon icon="mdi-cloud-sync" class="mr-2" />Core Service Provisioning</v-card-title>
            </v-card-item>
            <v-card-text>
              <template v-if="h.core_org_id">
                <v-chip color="success" variant="flat" label class="mb-2">Provisioned</v-chip>
                <v-list density="compact" lines="two">
                  <v-list-item title="Core org ID" :subtitle="h.core_org_id" />
                </v-list>
              </template>
              <template v-else>
                <v-chip color="warning" variant="flat" label class="mb-2">Not provisioned in core-service</v-chip>
                <p class="text-body-2 textSecondary mb-3">
                  This hospital exists in hmis-manage but not yet in core-service.
                  Retry re-syncs the organization and its facility; the admin
                  account (if any) still needs manual provisioning.
                </p>

                <v-alert v-if="store.lastRetryResult?.core_provisioned" type="success" variant="tonal" class="mb-3">
                  Synced to core-service.
                </v-alert>
                <v-alert v-else-if="store.lastRetryResult" type="error" variant="tonal" class="mb-3">
                  Retry failed: {{ store.lastRetryResult.core_provisioning_error }}
                </v-alert>

                <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh"
                  :loading="store.retrying" @click="store.retryProvisioning(id)">
                  Retry provisioning
                </v-btn>
              </template>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 6. Facilities (bed capacity + facility administrator, from provisioning) -->
      <v-row v-if="h.facilities?.length">
        <v-col v-for="f in h.facilities" :key="f.id" cols="12" md="6">
          <v-card rounded="lg" elevation="10" class="h-100">
            <v-card-item>
              <v-card-title><v-icon icon="mdi-hospital-building" class="mr-2" />{{ f.name }}</v-card-title>
              <template #append>
                <v-chip :color="f.core_facility_id ? 'success' : 'warning'" size="small" variant="tonal" label>
                  {{ f.core_facility_id ? 'Provisioned' : 'Not in core-service' }}
                </v-chip>
              </template>
            </v-card-item>
            <v-card-text>
              <v-list density="compact" lines="two">
                <v-list-item title="Facility code" :subtitle="f.facility_code || '—'" />
                <v-list-item title="KEPH level" :subtitle="f.keph_level || '—'" />
              </v-list>

              <p class="text-caption textSecondary text-uppercase mt-2 mb-1">Bed occupancy</p>
              <v-row dense>
                <v-col v-for="bf in BED_FIELDS" :key="bf.key" cols="6" sm="4">
                  <p class="text-caption textSecondary mb-0">{{ bf.label }}</p>
                  <p class="text-body-1 font-weight-medium mb-0">{{ f[bf.key] ?? '—' }}</p>
                </v-col>
              </v-row>

              <template v-if="f.facility_administrator_name || f.facility_administrator_email">
                <p class="text-caption textSecondary text-uppercase mt-3 mb-1">Facility administrator</p>
                <v-list density="compact" lines="two">
                  <v-list-item title="Name" :subtitle="f.facility_administrator_name || '—'" />
                  <v-list-item title="Email" :subtitle="f.facility_administrator_email || '—'" />
                  <v-list-item title="Phone" :subtitle="f.facility_administrator_phone || '—'" />
                  <v-list-item title="Identifier" :subtitle="f.facility_administrator_identifier || '—'" />
                </v-list>
              </template>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-alert v-else type="info" variant="tonal" class="mt-6">
        No facility has been added to this hospital yet.
      </v-alert>

      <!-- 7. Hospital admin accounts -->
      <v-card rounded="lg" elevation="10" class="mt-6">
        <v-card-item>
          <v-card-title><v-icon icon="mdi-account-tie" class="mr-2" />Hospital Admins</v-card-title>
          <template #append>
            <v-tooltip v-if="!h.facilities?.length" text="Add a facility to this hospital before adding an admin">
              <template #activator="{ props }">
                <span v-bind="props"><v-btn color="primary" variant="tonal" prepend-icon="mdi-account-plus" disabled>Add admin</v-btn></span>
              </template>
            </v-tooltip>
            <v-btn v-else color="primary" variant="tonal" prepend-icon="mdi-account-plus" @click="openAddAdmin">
              Add admin
            </v-btn>
          </template>
        </v-card-item>
        <v-card-text>
          <v-list v-if="h.admins?.length" density="comfortable" lines="two">
            <v-list-item v-for="a in h.admins" :key="a.id" :title="a.name" :subtitle="`${a.username} · ${a.email}`">
              <template #prepend><v-icon icon="mdi-account-circle" class="mr-2" /></template>
              <template #append>
                <div class="d-flex align-center ga-2">
                  <v-chip v-if="a.core_user_id" color="success" size="small" variant="tonal" label>
                    Core account active
                  </v-chip>
                  <template v-else>
                    <v-chip color="warning" size="small" variant="tonal" label>Not in core-service</v-chip>
                    <v-btn size="small" variant="tonal" prepend-icon="mdi-cloud-upload"
                      :loading="store.provisioningAdminId === a.id" @click="provisionAdmin(a.id)">
                      Provision
                    </v-btn>
                  </template>
                  <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEditAdmin(a)" />
                </div>
              </template>
            </v-list-item>
          </v-list>
          <p v-else class="text-body-2 textSecondary mb-0">No admin account has been created for this hospital yet.</p>

          <!-- One-time credentials from a just-completed provisionAdmin() call — the -->
          <!-- backend never keeps the plaintext, so this is the only chance to see it. -->
          <v-card v-if="store.lastAdminProvisionResult" variant="tonal" color="primary" rounded="lg" class="mt-4">
            <v-card-text>
              <p class="text-subtitle-2 font-weight-medium mb-3">
                New core-service login for {{ store.lastAdminProvisionResult.data.username }}
              </p>
              <div class="d-flex align-center ga-2 mb-1">
                <span class="text-body-2">Username:</span>
                <span class="font-mono font-weight-medium">{{ store.lastAdminProvisionResult.data.username }}</span>
                <v-btn icon="mdi-content-copy" size="x-small" variant="text"
                  @click="copyAdminField(store.lastAdminProvisionResult.data.username, 'username')" />
                <v-chip v-if="copiedAdminField === 'username'" size="x-small" color="success" variant="flat">Copied</v-chip>
              </div>
              <div class="d-flex align-center ga-2">
                <span class="text-body-2">Password:</span>
                <span class="font-mono font-weight-medium">{{ showAdminPassword ? store.lastAdminProvisionResult.password : '••••••••' }}</span>
                <v-btn :icon="showAdminPassword ? 'mdi-eye-off' : 'mdi-eye'" size="x-small" variant="text" @click="showAdminPassword = !showAdminPassword" />
                <v-btn icon="mdi-content-copy" size="x-small" variant="text"
                  @click="copyAdminField(store.lastAdminProvisionResult.password, 'password')" />
                <v-chip v-if="copiedAdminField === 'password'" size="x-small" color="success" variant="flat">Copied</v-chip>
              </div>
              <p class="text-caption textSecondary mt-2 mb-0">
                This password replaces the admin's previous one and won't be shown again — share it with them now.
              </p>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>

      <!-- Integrations shortcut -->
      <v-card rounded="lg" elevation="10" class="mt-6">
        <v-card-text class="d-flex align-center justify-space-between pa-5">
          <div>
            <p class="text-subtitle-1 font-weight-semibold mb-1">Integrations</p>
            <p class="text-body-2 textSecondary mb-0">Connect this hospital to external systems like QuickBooks, Dynamics 365 and more.</p>
          </div>
          <v-btn color="primary" variant="tonal" prepend-icon="mdi-plug"
            :to="{ path: '/integrations', query: { hospitalId: id, hospitalName: h.display_name || h.name } }">
            Manage integrations
          </v-btn>
        </v-card-text>
      </v-card>
    </template>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="confirmDelete" max-width="440">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Delete hospital?</v-card-title>
        <v-card-text>
          This will permanently remove <strong>{{ h?.display_name || h?.name }}</strong> from the platform's
          active hospital list. Its facilities, admin accounts and integration config are kept and can be
          restored if this was a mistake — contact platform engineering to reverse it.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="store.deleting" @click="confirmDelete = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="store.deleting" @click="deleteHospital">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit admin dialog -->
    <v-dialog v-model="editAdminDialog" max-width="480">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Edit admin details</v-card-title>
        <v-card-text>
          <v-text-field v-model="editAdminForm.name" label="Name" variant="outlined" density="comfortable" class="mb-3" hide-details="auto" />
          <v-text-field v-model="editAdminForm.username" label="Username" variant="outlined" density="comfortable" class="mb-3" hide-details="auto" />
          <v-text-field v-model="editAdminForm.email" label="Email" type="email" variant="outlined" density="comfortable" hide-details="auto" />
          <p class="text-caption textSecondary mt-3 mb-0">
            Saving sends a notification email to the admin's (possibly new) address confirming what changed.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="store.updatingAdminId === editingAdmin?.id" @click="editAdminDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="store.updatingAdminId === editingAdmin?.id" @click="saveAdminEdit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add admin dialog -->
    <v-dialog v-model="addAdminDialog" max-width="480">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Add hospital admin</v-card-title>
        <v-card-text>
          <v-text-field v-model="addAdminForm.name" label="Name" variant="outlined" density="comfortable" class="mb-3" hide-details="auto" />
          <v-text-field v-model="addAdminForm.username" label="Username" variant="outlined" density="comfortable" class="mb-3" hide-details="auto" />
          <v-text-field v-model="addAdminForm.email" label="Email" type="email" variant="outlined" density="comfortable" class="mb-3" hide-details="auto" />
          <v-text-field
            v-model="addAdminForm.password" label="Password" :type="showAddAdminPassword ? 'text' : 'password'"
            variant="outlined" density="comfortable" hide-details="auto"
            hint="Min 8 characters. An invite email is sent to this admin." persistent-hint
          >
            <template #append-inner>
              <v-btn icon="mdi-refresh" size="small" variant="text" @click="generateAddAdminPassword" />
            </template>
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="store.addingAdmin" @click="addAdminDialog = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :loading="store.addingAdmin"
            :disabled="!addAdminForm.name || !addAdminForm.username || !addAdminForm.email || addAdminForm.password.length < 8"
            @click="saveNewAdmin">
            Add admin
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
