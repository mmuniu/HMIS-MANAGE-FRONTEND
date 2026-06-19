<template>
  <div>

      <v-card>
        <v-card-title height="23">
            <h4>Period Summary</h4>


        </v-card-title>
        <template>
          <v-data-table
                  :headers="periodSummaryHeaders"
                  :items="periodSummary"
                  class="elevation-1"
                  hide-default-footer
                   :items-per-page="-1"
          >

          <template v-slot:item.total_cash="{ item }">
           {{ total_cash }}
        </template>
          <template v-slot:item.total_insurance="{ item }">
            {{ total_insurance }}
        </template>
          <template v-slot:item.total_income="{ item }">
           {{ list.total_income }}
        </template>
          <template v-slot:item.total_exempted="{ item }">
           {{ list.total_exempted }}
        </template>
          <template v-slot:item.total_waived="{ item }">
           {{ list.total_waived }}
        </template>
          <template v-slot:item.actual_revenue="{ item }">
           {{ list.actual_revenue }}
        </template>

          </v-data-table>
          <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
      </template>
        </v-card>

  </div>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";


export default {

  mixins: [
      reportsMixin,
  ],
  props : {
    total_cash : {
      type:Number
    },

    total_insurance: {
      type:Number
    },

  },

  data: () => ({
      module: "finance",
      decoratorKey: "revenue-income-summary",

        periodSummary: [
          {
            total_cash: 0,
            total_insurance: 0,
            total_income: 0,
            total_exempted: 0,
            total_waived: 0,
            actual_revenue: 0
          }
        ],
      periodSummaryHeaders:[
              {text: 'Total Cash', value: 'total_cash', align: "right"},
              {text: 'Total Insurance', value: 'total_insurance', align: "right"},
              {text: 'Total Income', value: 'total_income', align: "right"},
              {text: 'Total Exempted', value: 'total_exempted', align: "right"},
              {text: 'Total Waived', value: 'total_waived', align: "right"},
              {text: 'Actual Revenue', value: 'actual_revenue', align: "right"},

            ],

  }),

  components: {
      "revenue-income-summary-filter": Filter,

  },
  methods: {
      navigate(page) {
          this.get(page, this.obj.filters);
      },



  },
};
</script>
