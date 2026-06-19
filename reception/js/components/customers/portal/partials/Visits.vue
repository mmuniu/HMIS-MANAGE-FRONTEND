<template>
  <div>
    <v-card>
      <v-card-title>
        <h3>Customer Visits</h3>
        <v-spacer></v-spacer>
        <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
          :headers="headers"
          :items="visits"
          :search="search"
          :loading="loading"
          loading-text="Loading visits... Please wait"
          no-data-text="No visits found"
          class="elevation-1"
      >
        <template v-slot:item.visit_date="{ item }">
          {{ formatDate(item.visit_date) }}
        </template>


      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';
import moment from 'moment';

export default {
  props: ['customerId'],

  data: () => ({
    search: '',
    loading: false,
    visits: [],
    headers: [
      { text: 'Visit Date', value: 'visit_date' },

    ]
  }),

  computed: {
    ...mapGetters({
      customers: 'getCustomers',
    }),
  },

  methods: {
    formatDate(date) {
      return date ? moment(date).format('DD MMM YYYY, h:mm a') : '';
    },



    fetchVisits() {
      this.loading = true;

      // Call the API endpoint to get real visit data
      axios.get(`/api/reception/customers/${this.customerId}/portal/visits`)
          .then(response => {
            console.log(response)
            // Process the visits data from the API
            this.visits = response.data.data || [];
            this.loading = false;
          })
          .catch(error => {
            console.error('Error fetching visits:', error);
            this.loading = false;
            this.visits = []; // Empty array in case of error
          });
    }
  },

  created() {
    this.fetchVisits();
  }
};
</script>
