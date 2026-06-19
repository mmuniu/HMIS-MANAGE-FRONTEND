<template>
  <div>
    <v-card>
      <v-card-title>
        <h3>Patient Withdrawals</h3>
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
        :items="withdrawals"
        :search="search"
        :loading="loading"
        loading-text="Loading withdrawals... Please wait"
        no-data-text="No withdrawals found"
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
          <span class="headline">Withdrawal Receipt</span>
        </v-card-title>
        <v-card-text v-if="selectedWithdrawal">
          <v-container>
            <v-row>
              <v-col cols="12" class="text-center">
                <h2>WITHDRAWAL RECEIPT</h2>
                <p>Receipt #: {{ selectedWithdrawal.receipt_number }}</p>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Date:</v-col>
              <v-col cols="6">{{ formatDate(selectedWithdrawal.date) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Amount:</v-col>
              <v-col cols="6">{{ formatCurrency(selectedWithdrawal.amount) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Withdrawal Method:</v-col>
              <v-col cols="6">{{ selectedWithdrawal.withdrawal_method }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Reason:</v-col>
              <v-col cols="6">{{ selectedWithdrawal.reason }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Approved By:</v-col>
              <v-col cols="6">{{ selectedWithdrawal.approved_by }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Status:</v-col>
              <v-col cols="6">{{ selectedWithdrawal.status }}</v-col>
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
    withdrawals: [],
    headers: [
      { text: 'Receipt #', value: 'receipt_number' },
      { text: 'Date', value: 'date' },
      { text: 'Amount', value: 'amount' },
      { text: 'Withdrawal Method', value: 'withdrawal_method' },
      { text: 'Reason', value: 'reason' },
      { text: 'Balance After', value: 'balance' },
      { text: 'Status', value: 'status' },
      { text: 'Actions', value: 'actions', sortable: false }
    ],
    receiptDialog: false,
    selectedWithdrawal: null
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
        case 'Rejected':
          return 'red';
        default:
          return 'grey';
      }
    },

    viewReceipt(withdrawal) {
      this.selectedWithdrawal = withdrawal;
      this.receiptDialog = true;
    },

    closeReceiptDialog() {
      this.receiptDialog = false;
      this.selectedWithdrawal = null;
    },

    printReceipt() {
      // Implement print functionality
      window.print();
    },

    fetchWithdrawals() {
      this.loading = true;

      // Call the API endpoint to get real withdrawal data
      axios.get(`/api/reception/customers/${this.customerId}/portal/withdrawals`)
        .then(response => {
          // Process the withdrawals data from the API
          const withdrawals = response.data.withdrawals || [];

          // Map the API data to match our component's expected format
          this.withdrawals = withdrawals.map(withdrawal => {
            return {
              receipt_number: withdrawal.receipt_number || withdrawal.receipt_no || `WTH-${withdrawal.id}`,
              date: withdrawal.date || withdrawal.created_at,
              amount: withdrawal.amount,
              withdrawal_method: withdrawal.withdrawal_method || withdrawal.payment_method || 'Cash',
              reason: withdrawal.reason || withdrawal.remarks || 'Withdrawal',
              balance: withdrawal.balance || 0,
              status: withdrawal.status || 'Completed',
              approved_by: withdrawal.approved_by || 'System'
            };
          });

          this.loading = false;
        })
        .catch(error => {
          console.error('Error fetching withdrawals:', error);
          this.loading = false;
          this.withdrawals = []; // Empty array in case of error
        });
    }
  },

  created() {
    this.fetchWithdrawals();
  }
};
</script>
