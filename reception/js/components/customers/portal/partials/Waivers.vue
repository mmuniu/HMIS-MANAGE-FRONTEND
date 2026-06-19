<template>
  <div>
    <v-card>
      <v-card-title>
        <h3>Waivers</h3>
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
        :items="waivers"
        :search="search"
        :loading="loading"
        loading-text="Loading waivers... Please wait"
        no-data-text="No waivers found"
        class="elevation-1"
      >
        <template v-slot:item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>
        <template v-slot:item.amount="{ item }">
          {{ formatCurrency(item.amount) }}
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            dark
          >
            {{ item.status }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            small
            color="primary"
            @click="viewWaiver(item)"
          >
            View Details
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Waiver Details Dialog -->
    <v-dialog v-model="waiverDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Waiver Details</span>
        </v-card-title>
        <v-card-text v-if="selectedWaiver">
          <v-container>
            <v-row>
              <v-col cols="12" class="text-center">
                <h2>WAIVER CERTIFICATE</h2>
                <p>Waiver #: {{ selectedWaiver.waiver_number }}</p>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Date:</v-col>
              <v-col cols="6">{{ formatDate(selectedWaiver.date) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Invoice #:</v-col>
              <v-col cols="6">{{ selectedWaiver.invoice_number }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Original Amount:</v-col>
              <v-col cols="6">{{ formatCurrency(selectedWaiver.original_amount) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Waived Amount:</v-col>
              <v-col cols="6">{{ formatCurrency(selectedWaiver.amount) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Final Amount:</v-col>
              <v-col cols="6">{{ formatCurrency(selectedWaiver.final_amount) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Reason:</v-col>
              <v-col cols="6">{{ selectedWaiver.reason }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Approved By:</v-col>
              <v-col cols="6">{{ selectedWaiver.approved_by }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Status:</v-col>
              <v-col cols="6">{{ selectedWaiver.status }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <h4>Notes:</h4>
                <p>{{ selectedWaiver.notes }}</p>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="printWaiver">Print</v-btn>
          <v-btn color="error" text @click="closeWaiverDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import moment from 'moment';

export default {
  props: ['customerId'],

  data: () => ({
    search: '',
    loading: false,
    waivers: [],
    headers: [
      { text: 'Waiver #', value: 'waiver_number' },
      { text: 'Date', value: 'date' },
      { text: 'Invoice #', value: 'invoice_number' },
      { text: 'Original Amount', value: 'original_amount' },
      { text: 'Waived Amount', value: 'amount' },
      { text: 'Final Amount', value: 'final_amount' },
      { text: 'Reason', value: 'reason' },
      { text: 'Status', value: 'status' },
      { text: 'Actions', value: 'actions', sortable: false }
    ],
    waiverDialog: false,
    selectedWaiver: null
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

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'KES'
      }).format(amount);
    },

    getStatusColor(status) {
      switch (status) {
        case 'Approved':
          return 'green';
        case 'Pending':
          return 'orange';
        case 'Rejected':
          return 'red';
        default:
          return 'grey';
      }
    },

    viewWaiver(waiver) {
      this.selectedWaiver = waiver;
      this.waiverDialog = true;
    },

    closeWaiverDialog() {
      this.waiverDialog = false;
      this.selectedWaiver = null;
    },

    printWaiver() {
      // Implement print functionality
      window.print();
    },

    fetchWaivers() {
      this.loading = true;

      // Call the API endpoint to get real waiver data
      axios.get(`/api/reception/customers/${this.customerId}/portal/waivers`)
        .then(response => {
          // Process the waivers data from the API
          const waivers = response.data.waivers || [];

          // Map the API data to match our component's expected format
          this.waivers = waivers.map(waiver => {
            return {
              waiver_number: waiver.waiver_number || `WVR-${waiver.id}`,
              date: waiver.created_at || waiver.date,
              invoice_number: waiver.invoice_number || `INV-${waiver.invoice_id}`,
              original_amount: waiver.original_amount || 0,
              amount: waiver.amount || 0,
              final_amount: waiver.final_amount || (waiver.original_amount - waiver.amount) || 0,
              reason: waiver.reason || waiver.remarks || '',
              approved_by: waiver.approved_by || '',
              status: waiver.status || 'Pending',
              notes: waiver.notes || waiver.remarks || ''
            };
          });

          this.loading = false;
        })
        .catch(error => {
          console.error('Error fetching waivers:', error);
          this.loading = false;
          this.waivers = []; // Empty array in case of error
        });
    }
  },

  created() {
    this.fetchWaivers();
  }
};
</script>
