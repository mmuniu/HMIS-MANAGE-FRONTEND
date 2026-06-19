<template>
  <div>
      <v-card>
          <v-card-title height="23">
              <h4>Receipts Summary</h4>
          </v-card-title>
          <cash-receipts-reports-filter :obj="obj" @filter="performFilter()"></cash-receipts-reports-filter>
          <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
          <template>
              <v-data-table
                      :headers="list.headers"
                      :items="list.data"
                      class="elevation-1"
                      hide-default-footer
                       :items-per-page="-1"
              >
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

  data: () => ({
      module: "finance",
      decoratorKey: "cash-receipts-reports",
  }),

  components: {
      "cash-receipts-reports-filter": Filter,
  },
  methods: {
      navigate(page) {
          this.get(page, this.obj.filters);
      },


  },
};
</script>
