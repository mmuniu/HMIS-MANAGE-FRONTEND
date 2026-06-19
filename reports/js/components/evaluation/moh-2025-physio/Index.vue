<template>
  <v-card>
    <v-card-title height="23">
      <h4>Physiotheraphy</h4>
    </v-card-title>

    <procedures-search :obj="obj" @filter="performFilter" />

    <collabmed-floating-loader v-if="saveLoader" />

    <template>
      <v-data-table :headers="list.headers" :items="list.data" :search="search" class="elevation-1">
      </v-data-table>
    </template>
  </v-card>
</template>

<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";

export default {
  name: "PhysiotherapyReport",

  mixins: [reportsMixin],

  data: () => ({
    module: "evaluation",
    decoratorKey: "moh-2025-physio",
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

  components: {
    "procedures-search": Filter,
  },

  methods: {
    navigate(page) {
      this.get(page, this.obj.filters);
    }
  }
};
</script>