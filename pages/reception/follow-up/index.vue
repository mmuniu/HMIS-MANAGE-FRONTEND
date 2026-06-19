<template>
  <v-container class="pa-4">
    <!-- Page header -->
    <v-row class="align-center mb-4">
      <v-col cols="12">
        <h2 class="text-h5">Patients follow up
          <span class="text-caption text-medium-emphasis ml-2">Manage set patients next steps/follow ups</span>
        </h2>
      </v-col>
    </v-row>

    <!-- Filters card -->
    <v-card variant="outlined" class="mb-4">
      <v-card-text>
        <v-row class="align-end ga-2">
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.clinician"
              :items="clinicians"
              label="Clinician"
              density="comfortable"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-autocomplete
              v-model="filters.patient"
              :items="patientOptions"
              label="Search patient"
              density="comfortable"
              variant="outlined"
              hide-details
              clearable
              :menu-props="{ maxHeight: 260 }"
              prepend-inner-icon="mdi-magnify"
            />
          </v-col>

          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.start"
              type="date"
              label="Start date"
              density="comfortable"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="filters.end"
              type="date"
              label="End date"
              density="comfortable"
              variant="outlined"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn color="success" class="mt-1" @click="applyFilter">FILTER</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Follow up table -->
    <v-card variant="outlined">
      <v-data-table
        :headers="headers"
        :items="filteredRows"
        :loading="loading"
        class="mb-3 text-body-2"
        item-key="id"
        disable-pagination
        hide-default-footer
      >
        <template #item.patient="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.patient_name }}</div>
          </div>
        </template>

        <template #item.next_steps="{ item }">
          <div class="text-medium-emphasis">{{ item.next_steps }}</div>
        </template>

        <template #item.plan="{ item }">
          <div>{{ item.plan }}</div>
        </template>

        <template #item.date="{ item }">
          <div>
            <div>{{ formatDate(item.date) }}</div>
            <div class="text-caption text-medium-emphasis">{{ formatTime(item.date) }}</div>
          </div>
        </template>

        <template #item.actions="{ item }">
          <v-btn size="small" color="success" @click="markDone(item)">DONE</v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

definePageMeta({})

const loading = ref(false)

interface FollowUpRow {
  id: number
  patient_name: string
  clinician: string
  next_steps: string
  plan: string
  date: string // ISO
  done?: boolean
}

const headers = [
  { title: 'Patient', key: 'patient', sortable: false },
  { title: 'Next steps', key: 'next_steps', sortable: false },
  { title: 'Plan of Management', key: 'plan', sortable: false },
  { title: 'Date', key: 'date' },
  { title: 'Actions', key: 'actions', sortable: false }
]

// demo rows to illustrate UI
const rows = ref<FollowUpRow[]>([
  { id: 1, patient_name: 'Cindy Walker', clinician: 'Dr. Patel', next_steps: '', plan: 'MOMATE SPRAY USE PRN', date: new Date().toISOString() },
  { id: 2, patient_name: 'Maurice Ochieng Owiro', clinician: 'Dr. Nyong', next_steps: '', plan: 'BOOK LEFT TYMPANOPLASTY ON TUESDAY 8 AM', date: new Date(Date.now() - 60*1000*60).toISOString() },
  { id: 3, patient_name: 'James Otieno Omondi', clinician: 'Dr. Patel', next_steps: '', plan: 'MOMATE SPRAY CEFUROXIME SYRUP X 5/7 REVIEW PRN', date: new Date(Date.now() - 2*60*1000*60).toISOString() },
  { id: 4, patient_name: 'Tamara Favour Odour', clinician: 'Dr. Achieng', next_steps: '', plan: 'MOMATE NASAL SPRAY AERIUS SYRUP X 14/7 THEN PRN', date: new Date(Date.now() - 3*60*1000*60).toISOString() },
  { id: 5, patient_name: 'Brian Sheldon', clinician: 'Dr. Nyong', next_steps: '', plan: 'REVIEW IN 2 WEEKS', date: new Date(Date.now() - 4*60*1000*60).toISOString() },
])

const clinicians = ['Dr. Patel', 'Dr. Nyong', 'Dr. Achieng']
const patientOptions = rows.value.map(r => r.patient_name)

const filters = reactive({
  clinician: null as string | null,
  patient: null as string | null,
  start: '',
  end: ''
})

const filteredRows = computed(() => {
  const s = filters.start ? new Date(filters.start).getTime() : -Infinity
  const e = filters.end ? new Date(filters.end).getTime() : Infinity
  return rows.value.filter(r => {
    if (r.done) return false
    const t = new Date(r.date).getTime()
    const inRange = t >= s && t <= e
    const matchClin = !filters.clinician || r.clinician === filters.clinician
    const matchPat = !filters.patient || r.patient_name === filters.patient || r.patient_name.toLowerCase().includes(String(filters.patient).toLowerCase())
    return inRange && matchClin && matchPat
  })
})

function applyFilter() {
  // reactive filtering in place; keep for server-side hook
}

function markDone(item: FollowUpRow) {
  item.done = true
  const { $showToast } = useNuxtApp() as any
  $showToast?.(`Marked follow up as done for ${item.patient_name}`)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>
