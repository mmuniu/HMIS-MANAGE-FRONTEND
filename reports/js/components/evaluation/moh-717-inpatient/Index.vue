<template>
  <v-card>
      <v-card-title height="23">
          <h4>Moh 717 Inpatient</h4>
          <v-spacer></v-spacer>
      </v-card-title>

      <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

      <moh-717-filters :obj="obj" @filter="performFilter()"></moh-717-filters>


      <v-data-table
              flat
              disable-pagination
              hide-default-footer
              :headers="list.headers"
              :items="list.data"
      >
      </v-data-table>


      <v-row>
          <v-col cols="12" class="text-center">
              <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
          </v-col>
      </v-row>
  </v-card>
</template>
<script>
import { reportsMixin } from '@reports/libs/reportsMixin';
import Filters from './Filters';

export default {
  name: 'moh-717',

  mixins: [
      reportsMixin,
  ],

  components: {
    "moh-717-filters": Filters,
  },

  methods: {
    executeShellCommand() {
      this.saveLoader = true; // Show the loader
      fetch('/api/reports/exec/moh717', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') // For CSRF protection
        },
        body: JSON.stringify({ /* Additional data if needed */ })
      })
        .then(response => response.json())
        .then(data => {
          this.saveLoader = false; // Hide the loader
          console.log('Shell command executed:', data);
          // Handle response data here if needed
        })
        .catch(error => {
          this.saveLoader = false; // Hide the loader
          console.error('Error executing shell command:', error);
        });
    },

  },

  data: () => ({
      module: 'evaluation',
      decoratorKey: 'moh-717-inpatient',
  }),

  mounted() {
    this.executeShellCommand(); // Call the function when the component is mounted
  },

};
</script>
