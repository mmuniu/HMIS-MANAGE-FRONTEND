<template>
  <div>
    <v-card>
      <v-card-title height="23">
        <h4>Exemptions Report</h4>
      </v-card-title>
      <exemption-report-filter :obj="obj" @filter="performFilter()"></exemption-report-filter>
      <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
      <v-data-table
          :headers="exemptions_report_headers"
          :items="list.data"
          class="elevation-1"
          hide-default-footer
      > <template v-slot:footer>
        Total Amount: <strong>{{ list.total }}</strong>
      </template>
      </v-data-table>
      <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
    </v-card>
  </div>
</template>
<script>
import { reportsMixin } from '@reports/libs/reportsMixin';
import Filter from '@reports/components/finance/exemption-report/Filters.vue';


export default {

  mixins: [
    reportsMixin,
  ],

  data: () => ({
    module: 'finance',
    decoratorKey: 'exemption-report',
    exemptions_report_headers: [
      { text: 'Date', value: 'date', sortable: false },
      { text: 'Patient Name', value: 'patient', sortable: true },
      { text: 'Amount exempted', value: 'exemption_amount', sortable: false },
      { text: 'Invoice Number', value: 'invoice', sortable: false },
      { text: 'Exempted by', value: 'exempted_by', sortable: false },

    ],
  }),

  components: {
    'exemption-report-filter': Filter,

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
