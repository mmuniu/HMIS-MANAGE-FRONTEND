<template>
    <v-card>
      <v-card-title height="23">
        <h4 class="px-4 pt-4">Ward Admissions Report</h4>
      </v-card-title>
  
      <v-card-title>
        <procedures-search :obj="obj" @filter="performFilter" />
      </v-card-title>
  
      <collabmed-floating-loader v-if="saveLoader" />
  
      <hr />
  
      <!-- Vuetify Data Table -->
      <v-data-table
        :headers="list.headers"
        :items="paginatedData"
        class="elevation-1"
        :items-per-page="itemsPerPage"
        :hide-default-footer="true"
      >
        <template v-slot:item.label="{ item }">
          {{ item.label }}
        </template>
        <template v-slot:item.category="{ item }">
          {{ item.category }}
        </template>
        <template v-slot:item.period="{ item }">
          {{ item.period }}
        </template>
        <template v-slot:item.value="{ item }">
          {{ item.value }}
        </template>
      </v-data-table>
  
      <!-- Custom Pagination -->
      <div class="d-flex justify-end px-4 py-2">
        <v-pagination
          v-model="page"
          :length="pageCount"
          total-visible="7"
          circle
        />
      </div>
    </v-card>
  </template>
  
  <script>
  import { reportsMixin } from "@reports/libs/reportsMixin";
  import Filter from "./Filters";
  
  export default {
    name: "WardAdmissionsReport",
  
    mixins: [reportsMixin],
  
    components: {
      "procedures-search": Filter,
    },
  
    data() {
      return {
        module: "inpatient",
        decoratorKey: "ward-admissions",
        page: 1,
        itemsPerPage: 10,
      };
    },
  
    computed: {
      pageCount() {
        if (!this.list.data) return 1;
        return Math.ceil(this.list.data.length / this.itemsPerPage);
      },
      paginatedData() {
        if (!this.list.data) return [];
        const start = (this.page - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.list.data.slice(start, end);
      },
    },
  
    watch: {
      // Reset to first page on new data
      'list.data'(newVal) {
        if (newVal) this.page = 1;
      }
    }
  };
  </script>
  