<template>
  <div>
    <v-expansion-panels
        multiple
        class="accordion-style"
        focusable
        elevation="1"
    >
      <v-expansion-panel
          v-for="visit in visits"
          :key="visit.id"
          class="border mb-2 accordion ui-accordion ui-widget ui-helper-reset"
      >
        <v-expansion-panel-title class="font-weight-bold">
          {{ formatDate(visit.created_at) }} - Clinic {{ visit.clinic_name }}
        </v-expansion-panel-title>

        <v-expansion-panel-text class="p-0">
          <v-table
              class="table-condensed"
              density="compact"
              hide-default-header
          >
            <tbody>
            <template v-if="visit.payment_mode === 'insurance'">
              <MainInsurance :visit="visit" />
              <PharmacyInsurance :visit="visit" />
              <Copay :visit="visit" />
            </template>
            <template v-else>
              <Main :visit="visit" />
              <Pharmacy :visit="visit" />
            </template>
            </tbody>
          </v-table>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-alert
        v-if="!visits.length"
        type="info"
        variant="outlined"
        class="mt-4"
        border="left"
        elevation="1"
    >
      <v-icon left>mdi-information</v-icon>
      This patient has not been billed.
      Click <a :href="billListUrl">here</a> for a list of patients with pending bills.
    </v-alert>
  </div>
</template>

<script>
import MainInsurance from './MainInsurance.vue'
import PharmacyInsurance from './PharmacyInsurance.vue'
import Copay from './Copay.vue'
import Main from './Main.vue'
import Pharmacy from './Pharmacy.vue'

export default {
  props: {
    visits: Array,
  },
  components: {
    MainInsurance,
    PharmacyInsurance,
    Copay,
    Main,
    Pharmacy,
  },
  computed: {
    billListUrl() {
      return '/finance/cash/index/queue'
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString('en-KE', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    },
  },
}
</script>

<style scoped>
.accordion-style .v-expansion-panel-title {
  background-color: #f8f9fa;
  padding: 12px 16px;
  border-bottom: 1px solid #dee2e6;
}

.table-condensed {
  width: 100%;
  border-collapse: collapse;
}

.table-condensed tbody > tr > td,
.table-condensed tbody > tr > th {
  padding: 4px 8px !important;
}

.v-expansion-panel {
  border: 1px solid #dee2e6;
  border-radius: 4px;
}
</style>
