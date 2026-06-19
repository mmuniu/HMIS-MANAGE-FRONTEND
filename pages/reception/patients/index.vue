<template>
  <v-container class="pa-4">
    <!-- Page header -->
    <v-row class="align-center mb-4">
      <v-col cols="12">
        <h2 class="text-h5 mb-1">All patients</h2>
        <p class="text-body-2 text-medium-emphasis">View all the patients in the system</p>
      </v-col>
    </v-row>

    <v-card variant="outlined">
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="text-subtitle-1">List of all patients</div>
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" density="comfortable" variant="outlined" hide-details placeholder="Search Patients..." style="max-width: 320px" />
      </v-card-title>

      <v-data-table
        :headers="patientsState.headers"
        :items="patientsData"
        :loading="loading"
        :item-class="itemRowBackground"
        disable-pagination
        hide-default-footer
        class="mb-3 text-body-2"
        item-key="id"
      >
        <template #item.name="{ item }">
          <div class="py-3">
            <a :href="`/reception/${item.id}/portal/details`" class="text-primary text-decoration-none">
              {{ item.full_name }}
            </a>
            <v-icon size="small" color="pink" class="ml-2" @click="addNote(item.id)">mdi-note-plus</v-icon>
            <div class="text-caption ml-5 text-medium-emphasis font-italic">mobile id: {{ item.id }}</div>
            <div class="text-caption ml-5 text-medium-emphasis font-italic" v-if="item.schemes && item.schemes.length > 0">
              Has {{ item.schemes.length }} {{ pluralize('insurance', item.schemes.length) }}
            </div>
          </div>
        </template>

        <template #item.patient_number="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{ item.number }}</span>
            <span class="text-caption text-medium-emphasis">Id No: {{ item.id_no }}</span><br/>
            <span v-if="item.pending_invoice_balance > 0" style="font-weight: bolder; font-size: 9px; font-style: italic; color: red">
              Balance: {{ item.pending_invoice_balance }}
            </span>
          </div>
        </template>

        <template #item.age="{ item }">
          <div class="text-center" style="min-width: 60px">{{ item.age_friendly }}</div>
        </template>

        <template #item.mobile="{ item }">
          <div class="d-flex flex-column">
            <span>Primary: {{ item.mobile }}</span>
            <span class="text-caption text-medium-emphasis">Secondary: {{ item.alt_number || '-' }}</span>
          </div>
        </template>
        <template #item.patient_actions="{ item }">
          <v-menu transition="slide-y-transition" location="bottom" v-if="msetting('core.okay_with_menu_actions')">
            <template #activator="{ props }">
              <v-btn size="small" color="primary" v-bind="props">
                actions <v-icon size="small" class="ml-1">mdi-menu-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item>
                <v-btn size="small" color="secondary" :href="`/reception/patients/${item.id}/edit`">Edit</v-btn>
              </v-list-item>
              <v-list-item>
                <v-btn size="small" color="success" :href="`/reception/visits?patient_id=${item.id}`">visits</v-btn>
              </v-list-item>
              <v-list-item>
                <v-btn size="small" color="primary" :href="`/reception/patient/${item.id}/visits/create`">Check In</v-btn>
              </v-list-item>
              <v-list-item>
                <v-btn size="small" color="warning" @click="showMeta(item)">Meta</v-btn>
              </v-list-item>
              <v-list-item>
                <v-btn size="small" color="danger" :href="route('reception.barcode.index', item.id)">Barcode</v-btn>
              </v-list-item>
              <v-list-item>
                <v-btn size="small" color="primary" @click="requestSample(item)">request sample</v-btn>
              </v-list-item>
            </v-list>
          </v-menu>

          <span v-else>
            <v-btn size="small" color="secondary" :href="`/reception/patients/${item.id}/edit`">Edit</v-btn>
            <v-btn size="small" color="success" :href="`/reception/visits?patient_id=${item.id}`">visits</v-btn>
            <v-btn size="small" color="warning" v-if="treatable(item)" :href="`/reception/patient/${item.id}/visits/create`">Check In</v-btn>
            <v-btn size="small" color="error" @click="showMeta(item)">Meta</v-btn><br/>
            <v-btn size="small" color="success" :href="route('reception.barcode.index', item.id)">Barcode</v-btn>
            <v-btn size="small" color="primary" @click="requestSample(item)">request sample</v-btn>
          </span>
        </template>

        <template #footer v-if="patientsState.links">
          <div class="pa-2 w-100">
            <!-- Paginator placeholder: integrate when backend ready -->
            <!--
            <collabmed-paginator v-if="patientsState.meta" :meta="patientsState.meta" @change="navigate"></collabmed-paginator>
            -->
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

definePageMeta({})

const search = ref('')
const loading = ref(false)

// Headers aligned with required keys
const patientsState = reactive({
  headers: [
    { title: 'Name', key: 'name', sortable: false },
    { title: 'Patient Number', key: 'patient_number' },
    { title: 'Age', key: 'age', align: 'center', width: 50 },
    { title: 'Mobile', key: 'mobile', sortable: false },
    { title: 'Patient Actions', key: 'patient_actions', sortable: false }
  ],
  meta: null as any,
  links: null as any
})

// Demo dataset – replace with API call later
interface PatientItem {
  id: number
  full_name: string
  number: string
  id_no: string
  age_friendly: string
  mobile: string
  alt_number?: string
  tsc_number?: string
  file_number?: string
  pending_invoice_balance?: number
  schemes?: any[]
}

const seed: PatientItem[] = [
  { id: 1, full_name: 'Benter Atieno Odiambo', number: 'PT49985', id_no: '23655904', age_friendly: '52 yrs', mobile: '0711408884', alt_number: '', tsc_number: 'TSC-001', file_number: 'F-1001', pending_invoice_balance: 0, schemes: [] },
  { id: 2, full_name: 'Ephantus Kariuki Ireri', number: 'PT49986', id_no: '0700213660', age_friendly: '57 yrs', mobile: '0700213660', alt_number: '', tsc_number: 'TSC-002', file_number: 'F-1002', pending_invoice_balance: 1200, schemes: [{ id: 1 }] },
  { id: 3, full_name: 'Geofrey Agira', number: 'PT49984', id_no: '28078301', age_friendly: '34 yrs', mobile: '0716241403', alt_number: '', file_number: 'F-1003', pending_invoice_balance: 0 },
  { id: 4, full_name: 'Hillary Kevogo', number: 'PT49988', id_no: '22577013', age_friendly: '14 yrs', mobile: '0729038400', alt_number: '' },
  { id: 5, full_name: 'Imelda Oyiela', number: 'PT49987', id_no: '0759637853', age_friendly: '28 yrs', mobile: '0759637853', alt_number: '0700000000', schemes: [{ id: 1 }, { id: 2 }] }
]

const patientsRaw = ref<PatientItem[]>(seed)

const patientsData = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = patientsRaw.value
  if (!q) return list
  return list.filter(p =>
    [p.full_name, p.number, p.id_no, p.mobile, p.alt_number, p.age_friendly]
      .filter(Boolean)
      .some(v => String(v).toLowerCase().includes(q))
  )
})

function itemRowBackground(item: any) {
  // Example: highlight those with pending balance
  return item?.pending_invoice_balance > 0 ? 'bg-red-lighten-5' : ''
}

function addNote(id: number) {
  const { $showToast } = useNuxtApp() as any
  $showToast?.(`Add note for patient #${id}`)
}

function requestSample(item: PatientItem) {
  const { $showToast } = useNuxtApp() as any
  $showToast?.(`Requesting sample for ${item.full_name}`)
}

function showMeta(item: PatientItem) {
  const { $showToast } = useNuxtApp() as any
  $showToast?.(`Patient meta for ${item.full_name}`)
}

function navigate(link: any) {
  // hook paginator change
}

function treatable(item: PatientItem) {
  return true
}

function msetting(key: string) {
  // settings stub, return false to show inline actions by default
  return false
}

function route(name: string, id: number) {
  // simple route helper stub
  if (name === 'reception.barcode.index') return `/reception/barcode/${id}`
  return '#'
}

function pluralize(word: string, count: number) {
  return count === 1 ? word : `${word}s`
}

</script>
