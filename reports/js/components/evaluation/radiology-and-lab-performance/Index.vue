<template>
  <v-card>
    <v-card-title height="23">
      <h4>Radiology And Lab Performance</h4>
    </v-card-title>

    <procedures-search :obj="obj" @filter="performFilter" />

    <collabmed-floating-loader v-if="saveLoader" />

    <v-card-text v-if="list.data.length > 1" class="py-0 my-0 d-flex justify-end">
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
      </v-card-text>
    <v-data-table :headers="list.headers" :items="list.data" class="elevation-1" hide-default-footer>
      <template v-slot:item.label="{ item }">
        {{ item.label }}
      </template>
    </v-data-table>

    <!-- Paginator -->
    <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
  </v-card>
</template>

<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";

export default {
  name: "RadiologyAndLabPerformanceReport",

  mixins: [reportsMixin],

  data: () => ({
    module: "evaluation",
    decoratorKey: "radiology-and-lab-performance",
    search: '',
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