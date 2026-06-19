<template>
  <div>
      <v-card>
          <v-card-title height="23">
              <h4>Revenue Summary</h4>
          </v-card-title>
          <revenue-income-summary-filter :obj="obj" @filter="performFilter()"></revenue-income-summary-filter>

          <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
          <template>
                <v-data-table
              :headers="list.headers"
              :items="list.data"
              class="elevation-1"
              hide-default-footer
              :items-per-page="-1"
            >

            <template v-slot:item.total_cash="{ item }">
              <a @click="viewCash(item)">{{ item.total_cash }}</a>
                     </template>
            <template v-slot:item.total_insurance="{ item }">
              <a @click="viewInsurance(item)">{{ item.total_insurance }}</a>
                     </template>
            <template v-slot:item.income="{ item }">
              <a @click="viewIncome(item)">{{ item.income }}</a>
                     </template>

            </v-data-table>

              <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
          </template>
      </v-card>

      <period-summary :total_insurance="list.total_insurance" :total_cash="list.total_cash"></period-summary>





  </div>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";
import PeriodSummary from "./PeriodSummary.vue";


export default {

  mixins: [
      reportsMixin,
  ],

  data: () => ({
      module: "finance",
      decoratorKey: "revenue-income-summary",



  }),

  components: {
      "revenue-income-summary-filter": Filter,
      "period-summary" : PeriodSummary


  },
  methods: {
      navigate(page) {
          this.get(page, this.obj.filters);
      },

      viewCash(data) {
        
            const filters = this.obj.filters;
            filters.mode = "cash";
            filters.tag = data.tag

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_amount=" + data.total_cash;

            window.open(`revenue-summary-income${request_data}`, "_blank");
        },

        viewInsurance(data) {
        
            const filters = this.obj.filters;
            filters.mode = "insurance";
            filters.tag = data.tag

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_amount=" + data.total_insurance;

            window.open(`revenue-summary-income${request_data}`, "_blank");
        },
        viewIncome(data) {
    
            const filters = this.obj.filters;
            filters.mode = "income";
            filters.tag = data.tag
            let request_data = "?child=true&";
            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_amount=" + data.income;

            window.open(`revenue-summary-income${request_data}`, "_blank");
        },

      mounted() {
        console.log(this.list.data);


}

  },
};
</script>
