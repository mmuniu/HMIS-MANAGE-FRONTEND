<template>
  <v-container class="pa-4">
    <!-- Page header -->
    <v-row class="align-center mb-2">
      <v-col cols="12">
        <h2 class="text-h6 mb-1">Patient Documents</h2>
        <v-btn variant="text" class="text-primary text-caption pl-0" href="#">View patient documents</v-btn>
      </v-col>
    </v-row>

    <!-- List and search -->
    <v-card variant="outlined">
      <v-card-title class="d-flex align-center justify-space-between">
        <div class="text-subtitle-1">List of all patients</div>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          density="comfortable"
          variant="outlined"
          hide-details
          placeholder="Search Patients..."
          style="max-width: 320px"
        />
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="filtered"
        :loading="loading"
        disable-pagination
        hide-default-footer
        item-key="id"
        class="mb-3 text-body-2"
      >
        <!-- Name column -->
        <template #item.name="{ item }">
          <div class="py-3">
            <a :href="`/reception/${item.id}/portal/details`" class="text-primary text-decoration-none">
              {{ item.full_name }}
            </a>
            <div class="text-caption ml-5 text-medium-emphasis font-italic" v-if="item.schemes && item.schemes.length">
              Has {{ item.schemes.length }} {{ pluralize('insurance', item.schemes.length) }}
            </div>
          </div>
        </template>

        <!-- Patient number column -->
        <template #item.patient_number="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{ item.number }}</span>
            <span class="text-caption text-medium-emphasis">Id No: {{ item.id_no }}</span>
          </div>
        </template>

        <!-- Age -->
        <template #item.age="{ item }">
          <div class="text-center" style="min-width: 60px">{{ item.age_friendly }}</div>
        </template>

        <!-- Mobile -->
        <template #item.mobile="{ item }">
          <span>{{ item.mobile }}</span>
        </template>

        <!-- Temperature -->
        <template #item.temperature="{ item }">
          <div class="text-center" style="min-width: 70px">{{ item.temperature ?? '-' }}</div>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-btn size="small" color="purple" class="text-white" @click="viewFiles(item)">
            <v-icon start>mdi-folder</v-icon>
            VIEW FILES
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const loading = ref(false)
const search = ref('')

interface PatientRow {
  id: number
  full_name: string
  number: string
  id_no: string
  age_friendly: string
  mobile: string
  temperature?: string | number
  schemes?: any[]
}

const headers = [
  { title: 'Name', key: 'name', sortable: false },
  { title: 'Patient Number', key: 'patient_number' },
  { title: 'Age', key: 'age', align: 'center', width: 60 },
  { title: 'Mobile', key: 'mobile', sortable: false },
  { title: 'Temperature', key: 'temperature', align: 'center', width: 80 },
  { title: 'Patient Actions', key: 'actions', sortable: false },
]

// Seed demo rows (reuse similar to Manage Patients)
const rows = ref<PatientRow[]>([
  { id: 1, full_name: 'Mary Musinga Mugenya', number: 'PT50001', id_no: '23655904', age_friendly: '52 yrs', mobile: '0712455435', temperature: '', schemes: [{ id: 1 }] },
  { id: 2, full_name: 'KYLE EMMANUEL KIBET', number: 'PT50002', id_no: '0700213660', age_friendly: '57 yrs', mobile: '0700213660' },
  { id: 3, full_name: 'Susan Adhiambo Ouma', number: 'PT50003', id_no: '28078301', age_friendly: '34 yrs', mobile: '0723048174' },
  { id: 4, full_name: 'Japheth Senere Kinagu', number: 'PT50004', id_no: '22577013', age_friendly: '41 yrs', mobile: '0725039638', temperature: '' },
  { id: 5, full_name: 'Taffie Edith Rose', number: 'PT50005', id_no: '22577013', age_friendly: '36 yrs', mobile: '0721516502', temperature: 36.3 },
])

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter(r =>
    [r.full_name, r.number, r.id_no, r.mobile, r.age_friendly].filter(Boolean).some(v => String(v).toLowerCase().includes(q))
  )
})

function viewFiles(item: PatientRow) {
  const { $showToast } = useNuxtApp() as any
  $showToast?.(`Open files for ${item.full_name}`)
}

function pluralize(word: string, count: number) {
  return count === 1 ? word : `${word}s`
}
</script>
