<template>
  <v-container class="pa-4">
    <!-- Page header -->
    <v-row class="align-center mb-2">
      <v-col cols="12">
        <h2 class="text-h6 mb-1">Patient Appointments</h2>
        <p class="text-body-2 text-medium-emphasis">Manage patient appointments</p>
      </v-col>
    </v-row>

    <!-- Filters + actions -->
    <v-card variant="outlined" class="mb-4">
      <v-card-text>
        <v-row class="align-end" dense>
          <v-col cols="12" md="3">
            <v-text-field v-model="filters.externalPatient" label="External patient" hide-details density="comfortable" variant="outlined" />
          </v-col>
          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="filters.patient"
              :items="patientOptions"
              label="Search patient"
              hide-details
              clearable
              density="comfortable"
              variant="outlined"
              append-inner-icon="mdi-menu-down"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.doctor"
              :items="doctorOptions"
              label="Doctor"
              hide-details
              clearable
              density="comfortable"
              variant="outlined"
              append-inner-icon="mdi-menu-down"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="filters.from" type="datetime-local" label="From" hide-details density="comfortable" variant="outlined" />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field v-model="filters.to" type="datetime-local" label="To" hide-details density="comfortable" variant="outlined" />
          </v-col>
          <v-col cols="12" md="3" class="d-flex ga-3">
            <v-btn color="primary" @click="applyFilter" class="text-capitalize" variant="flat">FILTER</v-btn>
          </v-col>
          <v-spacer />
          <v-col cols="12" md="3" class="d-flex justify-end ga-3">
            <v-btn color="primary" variant="flat" size="small" @click="createNew">
              <v-icon icon="mdi-plus" start /> NEW
            </v-btn>
            <v-btn color="secondary" variant="flat" size="small" @click="printList">
              <v-icon icon="mdi-printer" start /> PRINT
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Results table -->
    <v-card variant="outlined">
      <v-card-title class="text-subtitle-1">Made appointments list</v-card-title>
      <v-data-table
        :headers="headers"
        :items="filteredItems"
        :loading="loading"
        disable-pagination
        hide-default-footer
        class="text-body-2"
        item-key="id"
      >
        <template #item.patient="{ item }">
          <span class="text-primary font-weight-medium">{{ item.patient }}</span>
        </template>
        <template #item.scheduled_date="{ item }">
          <span>{{ formatDate(item.scheduled_date) }}</span>
        </template>
        <template #item.actions="{ item }">
          <div class="d-flex flex-wrap ga-2">
            <v-btn size="x-small" color="info" variant="flat" @click="updateVisit(item)">UPDATE VISIT</v-btn>
            <v-btn size="x-small" color="secondary" variant="tonal" @click="printTicket(item)">PRINT TICKET</v-btn>
            <v-btn size="x-small" color="primary" variant="tonal" @click="changeDestination(item)">CHANGE DESTINATION</v-btn>
            <v-btn size="x-small" color="success" variant="tonal" @click="review(item)">REVIEW</v-btn>
            <v-btn size="x-small" color="error" variant="tonal" @click="cancelCheckin(item)">CANCEL CHECKIN</v-btn>
          </div>
        </template>
        <template #no-data>
          <div class="py-8 text-center text-medium-emphasis">No data available</div>
        </template>
      </v-data-table>

      <!-- Simple pager placeholder to match screenshot -->
      <div class="d-flex align-center justify-end pa-3">
        <v-btn icon size="small" variant="text" :disabled="true"><v-icon>mdi-chevron-left</v-icon></v-btn>
        <v-btn icon size="small" color="primary" variant="flat">1</v-btn>
        <v-btn icon size="small" variant="text" :disabled="true"><v-icon>mdi-chevron-right</v-icon></v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

definePageMeta({})

const loading = ref(false)

// Filters
const filters = reactive({
  externalPatient: '',
  patient: null as string | null,
  doctor: null as string | null,
  from: new Date().toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
  to: '',
})

const patientOptions = ref<string[]>([
  'Benter Atieno Odiambo',
  'Ephantus Kariuki Ireri',
  'Geofrey Agira',
])

const doctorOptions = ref<string[]>(['Dr. Kiptoo', 'Dr. Shah', 'Dr. Wambui'])

// Table
interface AppointmentRow {
  id: number
  patient: string
  category: string
  scheduled_date: string // ISO
  doctor: string
  instructions?: string
  status: 'Pending' | 'Done' | 'Cancelled'
  created_by: string
}

const headers = [
  { title: 'Patient', key: 'patient', sortable: false },
  { title: 'Category', key: 'category', sortable: false },
  { title: 'Scheduled Date', key: 'scheduled_date' },
  { title: 'Doctor', key: 'doctor' },
  { title: 'Instructions', key: 'instructions', sortable: false },
  { title: 'Status', key: 'status' },
  { title: 'Created By', key: 'created_by' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const rows = ref<AppointmentRow[]>([])

const filteredItems = computed(() => {
  const qExternal = (filters.externalPatient || '').toLowerCase()
  const qPatient = (filters.patient || '').toLowerCase()
  const qDoctor = (filters.doctor || '').toLowerCase()
  const from = filters.from ? new Date(filters.from) : null
  const to = filters.to ? new Date(filters.to) : null

  return rows.value.filter(r => {
    if (qExternal && !r.patient.toLowerCase().includes(qExternal)) return false
    if (qPatient && !r.patient.toLowerCase().includes(qPatient)) return false
    if (qDoctor && !r.doctor.toLowerCase().includes(qDoctor)) return false
    const d = new Date(r.scheduled_date)
    if (from && d < from) return false
    if (to && d > to) return false
    return true
  })
})

function applyFilter() {
  // With client-side filtering, nothing to do.
}

function createNew() {
  const { $showToast } = useNuxtApp() as any
  $showToast?.('New appointment form coming soon')
}

function printList() {
  const { $showToast } = useNuxtApp() as any
  $showToast?.('Printing appointments list...')
}

function updateVisit(item: AppointmentRow) {
  const { $showToast } = useNuxtApp() as any
  $showToast?.(`Update visit for ${item.patient}`)
}
function printTicket(item: AppointmentRow) {
  const { $showToast } = useNuxtApp() as any
  $showToast?.(`Print ticket for ${item.patient}`)
}
function changeDestination(item: AppointmentRow) {
  const { $showToast } = useNuxtApp() as any
  $showToast?.(`Change destination for ${item.patient}`)
}
function review(item: AppointmentRow) {
  const { $showToast } = useNuxtApp() as any
  $showToast?.(`Review appointment for ${item.patient}`)
}
function cancelCheckin(item: AppointmentRow) {
  const { $showToast } = useNuxtApp() as any
  $showToast?.(`Cancel check-in for ${item.patient}`)
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleString()
  } catch (e) {
    return iso
  }
}

// Seed a couple of items for demo
rows.value = [
  { id: 1, patient: 'Benter Atieno Odiambo', category: 'Consultation', scheduled_date: new Date().toISOString(), doctor: 'Dr. Kiptoo', instructions: 'Bring previous reports', status: 'Pending', created_by: 'Reception' },
  { id: 2, patient: 'Geofrey Agira', category: 'Dental', scheduled_date: new Date(Date.now() + 86400000).toISOString(), doctor: 'Dr. Shah', instructions: '', status: 'Pending', created_by: 'Reception' },
]
</script>
