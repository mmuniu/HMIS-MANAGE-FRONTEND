<template>
  <v-container class="pa-4">
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5">Patients form</h2>
        <p class="text-body-2 text-medium-emphasis">Add new patient into the system</p>
      </v-col>
    </v-row>

    <!-- Patient profile information -->
    <v-card class="mb-6" variant="outlined">
      <v-card-title class="text-subtitle-1">Patient profile information</v-card-title>
      <v-card-text>
        <v-form ref="profileForm">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.firstName" label="First Name" required :rules="[req]" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.middleName" label="Middle Name" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.lastName" label="Last Name" required :rules="[req]" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="4">
              <div class="d-flex align-center ga-4">
                <v-radio-group v-model="useDob" inline hide-details class="mr-4">
                  <v-radio label="DoB" :value="true" />
                  <v-radio label="Age" :value="false" />
                </v-radio-group>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-if="useDob" v-model="form.dob" type="date" label="Date of Birth" required :rules="[req]" />
              <v-text-field v-else v-model.number="form.age" type="number" min="0" label="Age (years)" required :rules="[reqNumber]" />
            </v-col>
            <v-col cols="12" md="4">
              <v-select v-model="form.gender" :items="genders" label="Gender" required :rules="[req]" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-select v-model="form.maritalStatus" :items="maritalStatuses" label="Marital status" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.idNumber" label="ID Number" required :rules="[req]" />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Patient contact information -->
    <v-card class="mb-6" variant="outlined">
      <v-card-title class="text-subtitle-1">Patient contact information</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="form.mobile" label="Mobile" required :rules="[req]" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="form.secondaryNumber" label="Secondary Number" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="form.email" type="email" label="Email Address" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="form.telephone" label="Telephone" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="form.town" label="Town" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="form.homeLocation" label="Home Location" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Next of kin -->
    <v-card class="mb-6" variant="outlined">
      <v-card-title class="text-subtitle-1">Patient's next of kin information</v-card-title>
      <v-card-text>
        <v-btn variant="tonal" color="primary" @click="addNextOfKin"><v-icon icon="mdi-plus" class="mr-2" />Add</v-btn>
        <div v-if="form.nextOfKin.length === 0" class="text-medium-emphasis mt-3">No next of kin added.</div>
        <v-row v-for="(nok, idx) in form.nextOfKin" :key="idx" class="mt-2">
          <v-col cols="12" md="4">
            <v-text-field v-model="nok.name" label="Full Name" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="nok.relationship" label="Relationship" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="nok.phone" label="Phone" />
          </v-col>
          <v-col cols="12" md="1" class="d-flex align-center">
            <v-btn icon="mdi-delete" variant="text" color="error" @click="removeNextOfKin(idx)" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Dependants -->
    <v-card class="mb-6" variant="outlined">
      <v-card-title class="text-subtitle-1">Patient's dependants</v-card-title>
      <v-card-text>
        <p class="text-caption text-medium-emphasis mb-3">
          All dependants must be created as patients first and then attached as dependants to other existing patients.
        </p>
        <v-autocomplete v-model="form.dependant" :items="dependantOptions" label="Search and select patient" clearable chips />
      </v-card-text>
    </v-card>

    <!-- Finance & Insurance -->
    <v-card class="mb-6" variant="outlined">
      <v-card-title class="text-subtitle-1">Patient finance & insurance details</v-card-title>
      <v-card-text>
        <v-switch v-model="form.hasInsurance" label="Patient has insurance" inset />
      </v-card-text>
      <v-card-actions class="justify-end pa-4">
        <v-btn color="primary" variant="flat" @click="save(false)">Save Patient</v-btn>
        <v-btn color="success" variant="flat" class="ml-2" @click="save(true)">Save and Checkin</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

definePageMeta({
  // Use default layout; adjust if needed
})

const genders = ['Male', 'Female', 'Other']
const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed']

const useDob = ref(true)

const form = reactive({
  firstName: '',
  middleName: '',
  lastName: '',
  dob: '',
  age: undefined as number | undefined,
  gender: '',
  maritalStatus: '',
  idNumber: '',
  mobile: '',
  secondaryNumber: '',
  email: '',
  telephone: '',
  town: '',
  homeLocation: '',
  nextOfKin: [] as Array<{ name: string; relationship: string; phone: string }>,
  dependant: null as string | null,
  hasInsurance: false,
})

const dependantOptions = ref<string[]>([])

const req = (v: any) => !!v || 'Required'
const reqNumber = (v: any) => (v !== undefined && v !== null && v !== '' && !isNaN(Number(v))) || 'Required'

function addNextOfKin() {
  form.nextOfKin.push({ name: '', relationship: '', phone: '' })
}
function removeNextOfKin(idx: number) {
  form.nextOfKin.splice(idx, 1)
}

const { $showToast } = useNuxtApp()

async function save(checkin: boolean) {
  // Minimal stub – in real integration, call backend API here
  // Basic front-end validation for required fields
  if (!form.firstName || !form.lastName || (!useDob.value && (form.age === undefined || form.age === null)) || (useDob.value && !form.dob) || !form.gender || !form.idNumber || !form.mobile) {
    $showToast?.('Please fill in all required fields.')
    return
  }
  console.log('Saving patient', { ...form, checkin, used: useDob.value ? 'dob' : 'age' })
  $showToast?.(checkin ? 'Patient saved and checked in' : 'Patient saved')
}
</script>
