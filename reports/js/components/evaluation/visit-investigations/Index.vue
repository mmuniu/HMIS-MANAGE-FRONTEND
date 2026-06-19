<template>
  <v-card>
      <v-card-title height="23">
          <h4>Visit Investigations</h4>
          <v-spacer></v-spacer>
      </v-card-title>

      <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

      <filters  :obj="obj" @filter="performFilter()"></filters>

      <v-data-table
              flat

              hide-default-footer
              :headers="list.headers"
              :items="list.data"
      >
      </v-data-table>
      <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />

      <v-row>
          <v-col cols="12" class="text-center">

          </v-col>
      </v-row>
  </v-card>
</template>
<script>
import { reportsMixin } from '@reports/libs/reportsMixin';
import Filters from './Filters';

export default {
  name: 'visit-investigations',

  mixins: [
      reportsMixin,
  ],

  components: {
      Filters
  },

  // computed: {
  //   meta() {
  //           return this.list.meta;
  //       },

  // },


  methods: {
    executeShellCommand() {
      this.saveLoader = true; // Show the loader
      fetch('/api/reports/exec/moh204', {
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
          // alert('sadadsa');
          // Handle response data here if needed
        })
        .catch(error => {
          this.saveLoader = false; // Hide the loader
          console.error('Error executing shell command:', error);
        });
    },

    navigate(page) {
            this.get(page, this.obj.filters);
        },


  },

  data: () => ({
      module: 'evaluation',
      decoratorKey: 'visit-investigations',
  }),

  mounted() {
    // this.executeShellCommand(); // Call the function when the component is mounted
    // alert('sadadsa');
  },

};
</script>
