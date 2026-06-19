<template>
  <div>

    <v-card>
      <v-card-title height="23">
        <h4>Waivers Report</h4>
      </v-card-title>
      <waiver-report-filter :obj="obj" @filter="performFilter()"></waiver-report-filter>
      <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
      <v-data-table
          :headers="waiver_report_headers"
          :items="list.data"
          class="elevation-1"
          hide-default-footer
      >
        <template v-slot:footer>
          Total Amount: <strong>{{ list.total }}</strong>
        </template>
      </v-data-table>
      <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />

    </v-card>
  </div>
</template>
<script>
import { reportsMixin } from '@reports/libs/reportsMixin';
import Filter from '@reports/components/finance/waiver-report/Filters.vue';

export default {

  mixins: [
    reportsMixin,
  ],

  data: () => ({
    module: 'finance',
    decoratorKey: 'waiver-report',
    waiver_report_headers: [
      { text: 'Date', value: 'date', sortable: false },
      { text: 'Patient Name', value: 'patient', sortable: true },
      { text: 'Amount waived', value: 'amount', sortable: false },
      { text: 'Invoice Number', value: 'invoice', sortable: false },
      { text: 'Created by', value: 'created_by', sortable: false },
      { text: 'Waived by', value: 'waived_by', sortable: false },

    ],
  }),

  components: {
    "waiver-report-filter": Filter,
  },

  computed: {

  },

  methods: {
    navigate(page) {
      this.get(page, this.obj.filters);
    },
  },
};
</script>
