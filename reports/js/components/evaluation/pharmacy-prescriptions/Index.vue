<template>
  <div>
    <v-card>
      <v-card-title height="23">
        <h4>Pharmacy Prescriptions Report</h4>
      </v-card-title>

      <pharmacy-prescriptions-filters
        :obj="obj"
        @filter="performFilter"
      ></pharmacy-prescriptions-filters>
      <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
      <div>
        <v-data-table
          hide-default-footer
          :headers="list.headers"
          :items="list.data"
          class="elevation-1"
        >
          <template v-slot:item.label="{ item }">
            {{ item.label }}
          </template>
        </v-data-table>
        <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
      </div>
    </v-card>
  </div>
</template>

<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";

export default {
  title: "Pharmacy Prescriptions Report",

  mixins: [reportsMixin],

  components: {
    "pharmacy-prescriptions-filters": Filter,
  },

  data: () => ({
    module: "evaluation",
    decoratorKey: "pharmacy-prescriptions",
  }),

  methods: {
    navigate(page) {
      this.get(page, this.obj.filters);
    },
  },
};
</script>
