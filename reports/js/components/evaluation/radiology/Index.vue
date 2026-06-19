<template>
  <div>
    <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
    <v-card>
      <h4 class="px-4 pt-4">Radiology Procedures</h4>
      <v-card-title>
        <procedures-search :obj="obj" @filter="performFilter"></procedures-search>
      </v-card-title>
      <v-alert :value="true" color="success" class="mx-3" outlined>
        Total Quantity: {{ list.total_quantity }}
      </v-alert>
      <hr />
      
      <div>
        <v-data-table
          :headers="list.headers"
          :items="list.data"
          class="elevation-1"
        ></v-data-table>
      </div>
    </v-card>
  </div>
</template>

<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";

export default {
  name: "RadiologyProceduresReport",
  title: "Radiology Procedures Report",
  mixins: [reportsMixin],
  components: {
    "procedures-search": Filter,
  },
  data: () => ({
    module: "evaluation",
    decoratorKey: "radiology",
    rowsPerPageItems: [
      10,
      20,
      30,
      {
        text: "$vuetify.dataIterator.rowsPerPageAll",
        value: -1,
      },
    ],
    pagination: {
      rowsPerPage: 10,
    },
  }),
};
</script>
