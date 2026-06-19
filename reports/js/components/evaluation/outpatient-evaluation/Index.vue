<template>
  <v-card>
    <v-card-title height="23">
      <h4 class="px-4 pt-4">OutPatient Evaluation</h4>
    </v-card-title>

    <v-card-title>
      <procedures-search :obj="obj" @filter="performFilter" />
    </v-card-title>

    <collabmed-floating-loader v-if="saveLoader" />

    <hr />
    <!-- Vuetify Data Table -->
    <template>
      <v-card-text v-if="list.data.length > 1" class="py-0 my-0">
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
      </v-card-text>
      <v-spacer></v-spacer>
      <v-data-table :headers="list.headers" :items="list.data" :search="search" class="elevation-1"></v-data-table>
    </template>
  </v-card>
</template>

<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";

export default {
  name: "OutPatientEvaluation",
  title: "OPD Report",
  mixins: [reportsMixin],
  components: {
    "procedures-search": Filter,
  },
  data: () => ({
    module: "evaluation",
    decoratorKey: "outpatient-evaluation",
    search: '',
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
