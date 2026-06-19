<template>
  <v-container class="pa-4">
    <!-- Page header -->
    <v-row class="align-center mb-4">
      <v-col cols="12">
        <h2 class="text-h5">Patients checked in</h2>
        <v-btn variant="text" class="text-primary text-caption pl-0" href="#">View patients that have been checked in</v-btn>
      </v-col>
    </v-row>

    <!-- Filters card -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="text-subtitle-1">Patient visits listing</v-card-title>
      <v-card-text>
        <v-row class="align-end">
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.start"
              type="datetime-local"
              label="Start date"
              density="comfortable"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="filters.end"
              type="datetime-local"
              label="End date"
              density="comfortable"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn color="success" class="mt-1" @click="applyFilter">FILTER</v-btn>
          </v-col>
          <v-col cols="12" md="4" class="ml-auto">
            <v-text-field
              v-model="filters.q"
              prepend-inner-icon="mdi-magnify"
              label="Search patient"
              density="comfortable"
              variant="outlined"
              hide-details
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Visits table -->
    <v-card variant="outlined">
      <v-data-table
        :headers="headers"
        :items="filteredVisits"
        :loading="loading"
        class="mb-3"
        item-key="id"
        disable-pagination
        hide-default-footer
      >
        <template #item.patient_name="{ item }">
          <div>
            <a :href="`/reception/${item.patient_id}/portal/details`" class="text-primary text-decoration-none">
              {{ item.patient_name }}
            </a>
            <div>
              <a :href="`/reception/tickets/${item.ticket_no}`" class="text-caption text-primary text-decoration-none">Ticket #{{ item.ticket_no }}</a>
            </div>
          </div>
        </template>

        <template #item.destination="{ item }">
          <div>
            <div>{{ item.destination }}</div>
            <div class="text-caption text-medium-emphasis">Facility: {{ item.facility }}</div>
          </div>
        </template>

        <template #item.date="{ item }">
          <div>
            <div>{{ formatDate(item.date) }}</div>
            <div class="text-caption text-medium-emphasis">{{ formatTime(item.date) }}</div>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex flex-wrap ga-2">
            <v-btn size="small" color="primary" @click="updateVisit(item)">UPDATE VISIT</v-btn>
            <v-btn size="small" color="warning" @click="printTicket(item)" class="text-white">PRINT TICKET</v-btn>
            <v-btn size="small" color="teal" @click="changeDestination(item)">CHANGE DESTINATION</v-btn>
            <v-btn size="small" color="purple" @click="review(item)">REVIEW</v-btn>
            <v-btn size="small" color="error" variant="tonal" @click="cancelCheckin(item)">CANCEL CHECKIN</v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const loading = ref(false)

interface VisitRow {
  id: number
  patient_id: number
  patient_name: string
  ticket_no: number
  destination: string
  facility: string
  date: string // ISO
}

const headers = [
  { title: 'Patient Name', key: 'patient_name', sortable: false },
  { title: 'Destinations', key: 'destination', sortable: false },
  { title: 'Date', key: 'date' },
  { title: 'Actions', key: 'actions', sortable: false }
]

// mock data
const visits = ref<VisitRow[]>([
  { id: 1, patient_id: 101, patient_name: 'Michael Nyarach', ticket_no: 336940, destination: 'Triage | Consultation Room 1', facility: 'Main', date: new Date().toISOString() },
  { id: 2, patient_id: 102, patient_name: 'African Health Network', ticket_no: 336939, destination: 'Triage | Consultation Room 1', facility: 'Main', date: new Date(Date.now() - 60*1000*60).toISOString() },
  { id: 3, patient_id: 103, patient_name: 'Cynthia Oduor', ticket_no: 336938, destination: 'Triage', facility: 'Main', date: new Date(Date.now() - 2*60*1000*60).toISOString() },
  { id: 4, patient_id: 104, patient_name: 'Pascal Omolo', ticket_no: 336937, destination: 'Triage', facility: 'Main', date: new Date(Date.now() - 3*60*1000*60).toISOString() },
  { id: 5, patient_id: 105, patient_name: 'Walkin (customer)', ticket_no: 336936, destination: 'Triage', facility: 'Main', date: new Date(Date.now() - 4*60*1000*60).toISOString() }
])

const filters = reactive({
  start: new Date(Date.now() - 14*24*60*60*1000).toISOString().slice(0,16),
  end: new Date().toISOString().slice(0,16),
  q: ''
})

const filteredVisits = computed(() => {
  const s = filters.start ? new Date(filters.start).getTime() : -Infinity
  const e = filters.end ? new Date(filters.end).getTime() : Infinity
  const q = filters.q.trim().toLowerCase()
  return visits.value.filter(v => {
    const t = new Date(v.date).getTime()
    const inRange = t >= s && t <= e
    if (!q) return inRange
    const hay = `${v.patient_name} ${v.ticket_no} ${v.destination} ${v.facility}`.toLowerCase()
    return inRange && hay.includes(q)
  })
})

function applyFilter() {
  // No-op because we filter reactively; keep for future server-side filtering
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function toast(msg: string) {
  const { $showToast } = useNuxtApp() as any
  $showToast?.(msg)
}

function updateVisit(v: VisitRow) { toast(`Update visit for ${v.patient_name}`) }
function printTicket(v: VisitRow) { toast(`Printing ticket #${v.ticket_no}`) }
function changeDestination(v: VisitRow) { toast(`Change destination for ${v.patient_name}`) }
function review(v: VisitRow) { toast(`Review visit for ${v.patient_name}`) }
function cancelCheckin(v: VisitRow) { toast(`Cancel check-in for ${v.patient_name}`) }
</script>
