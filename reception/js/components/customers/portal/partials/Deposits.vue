<template>
  <div>
    <v-card>
      <v-card-title>
        <h3>Patient Deposits</h3>
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
        :items="deposits"
        :search="search"
        :loading="loading"
        loading-text="Loading deposits... Please wait"
        no-data-text="No deposits found"
        class="elevation-1"
      >
        <template v-slot:item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>
        <template v-slot:item.amount="{ item }">
          {{ formatCurrency(item.amount) }}
        </template>
        <template v-slot:item.balance="{ item }">
          {{ formatCurrency(item.balance) }}
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
            @click="viewReceipt(item)"
          >
            View Receipt
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Receipt Dialog -->
    <v-dialog v-model="receiptDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Deposit Receipt</span>
        </v-card-title>
        <v-card-text v-if="selectedDeposit">
          <v-container>
            <v-row>
              <v-col cols="12" class="text-center">
                <h2>DEPOSIT RECEIPT</h2>
                <p>Receipt #: {{ selectedDeposit.receipt_number }}</p>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Date:</v-col>
              <v-col cols="6">{{ formatDate(selectedDeposit.date) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Amount:</v-col>
              <v-col cols="6">{{ formatCurrency(selectedDeposit.amount) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Payment Method:</v-col>
              <v-col cols="6">{{ selectedDeposit.payment_method }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Reference:</v-col>
              <v-col cols="6">{{ selectedDeposit.reference }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Status:</v-col>
              <v-col cols="6">{{ selectedDeposit.status }}</v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="printReceipt">Print</v-btn>
          <v-btn color="error" text @click="closeReceiptDialog">Close</v-btn>
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
    deposits: [],
    headers: [
      { text: 'Receipt #', value: 'receipt_number' },
      { text: 'Date', value: 'date' },
      { text: 'Amount', value: 'amount' },
      { text: 'Payment Method', value: 'payment_method' },
      { text: 'Reference', value: 'reference' },
      { text: 'Balance', value: 'balance' },
      { text: 'Status', value: 'status' },
      { text: 'Actions', value: 'actions', sortable: false }
    ],
    receiptDialog: false,
    selectedDeposit: null
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
        case 'Completed':
          return 'green';
        case 'Pending':
          return 'orange';
        case 'Failed':
          return 'red';
        default:
          return 'grey';
      }
    },

    viewReceipt(deposit) {
      this.selectedDeposit = deposit;
      this.receiptDialog = true;
    },

    closeReceiptDialog() {
      this.receiptDialog = false;
      this.selectedDeposit = null;
    },

    printReceipt() {
      // Implement print functionality
      window.print();
    },

    fetchDeposits() {
      this.loading = true;

      // Call the API endpoint to get real deposit data
      axios.get(`/api/reception/customers/${this.customerId}/portal/deposits`)
        .then(response => {
          // Process the deposits data from the API
          const deposits = response.data.deposits || [];

          this.deposits = deposits.map(deposit => {
            return {
              receipt_number: deposit.receipt_no || `DEP-${deposit.id}`,
              date: deposit.created_at || deposit.date,
              amount: deposit.amount || 0,
              payment_method: deposit.payment_method || 'Cash',
              reference: deposit.reference || deposit.remarks || '',
              balance: deposit.balance || 0,
              status: deposit.status || 'Completed'
            };
          });

          this.loading = false;
        })
        .catch(error => {
          console.error('Error fetching deposits:', error);
          this.loading = false;
          this.deposits = []; // Empty array in case of error
        });
    }
  },

  created() {
    this.fetchDeposits();
  }
};
</script>
