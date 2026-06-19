<template>
  <div>
    <v-card class="mb-5">
      <v-card-title>
        <h3>Financial Summary</h3>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6" lg="3">
            <v-card class="mx-auto" color="primary" dark>
              <v-card-text>
                <div class="text-h6">Total Deposits</div>
                <div class="text-h4 text-center my-4">{{ formatCurrency(summary.totalDeposits) }}</div>
                <div class="text-caption">Last deposit: {{ formatDate(summary.lastDepositDate) }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card class="mx-auto" color="error" dark>
              <v-card-text>
                <div class="text-h6">Total Withdrawals</div>
                <div class="text-h4 text-center my-4">{{ formatCurrency(summary.totalWithdrawals) }}</div>
                <div class="text-caption">Last withdrawal: {{ formatDate(summary.lastWithdrawalDate) }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card class="mx-auto" color="success" dark>
              <v-card-text>
                <div class="text-h6">Current Balance</div>
                <div class="text-h4 text-center my-4">{{ formatCurrency(summary.currentBalance) }}</div>
                <div class="text-caption">Updated: {{ formatDate(summary.lastUpdateDate) }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card class="mx-auto" color="warning" dark>
              <v-card-text>
                <div class="text-h6">Outstanding Invoices</div>
                <div class="text-h4 text-center my-4">{{ formatCurrency(summary.outstandingInvoices) }}</div>
                <div class="text-caption">{{ summary.pendingInvoicesCount }} pending invoices</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mb-5">
      <v-card-title>
        <h3>Transaction History</h3>
      </v-card-title>
      <v-card-text>
        <v-timeline dense>
          <v-timeline-item
            v-for="(transaction, index) in recentTransactions"
            :key="index"
            :color="getTransactionColor(transaction.type)"
            small
          >
            <template v-slot:opposite>
              <span class="caption">{{ formatDate(transaction.date) }}</span>
            </template>
            <v-card class="elevation-1">
              <v-card-title class="text-subtitle-1">
                {{ transaction.description }}
              </v-card-title>
              <v-card-text>
                <div class="d-flex justify-space-between">
                  <span>{{ transaction.type }}</span>
                  <span :class="getAmountClass(transaction.type)">{{ formatCurrency(transaction.amount) }}</span>
                </div>
                <div v-if="transaction.reference" class="text-caption mt-2">
                  Reference: {{ transaction.reference }}
                </div>
              </v-card-text>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <h3>Payment Distribution</h3>
          </v-card-title>
          <v-card-text>
            <v-sheet class="pa-5">
              <div class="text-center">
                <v-progress-circular
                  :rotate="-90"
                  :size="200"
                  :width="15"
                  :value="summary.depositsPercentage"
                  color="primary"
                >
                  Deposits
                </v-progress-circular>
                <v-progress-circular
                  :rotate="-90"
                  :size="200"
                  :width="15"
                  :value="summary.withdrawalsPercentage"
                  color="error"
                  class="ml-5"
                >
                  Withdrawals
                </v-progress-circular>
              </div>
              <div class="d-flex justify-space-around mt-5">
                <div>
                  <div class="d-flex align-center">
                    <v-icon color="primary">mdi-circle</v-icon>
                    <span class="ml-2">Deposits ({{ summary.depositsPercentage }}%)</span>
                  </div>
                  <div class="d-flex align-center mt-2">
                    <v-icon color="error">mdi-circle</v-icon>
                    <span class="ml-2">Withdrawals ({{ summary.withdrawalsPercentage }}%)</span>
                  </div>
                </div>
                <div>
                  <div class="d-flex align-center">
                    <v-icon color="success">mdi-circle</v-icon>
                    <span class="ml-2">Cash Payments ({{ summary.cashPaymentsPercentage }}%)</span>
                  </div>
                  <div class="d-flex align-center mt-2">
                    <v-icon color="warning">mdi-circle</v-icon>
                    <span class="ml-2">Invoice Payments ({{ summary.invoicePaymentsPercentage }}%)</span>
                  </div>
                </div>
              </div>
            </v-sheet>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <h3>Upcoming Payments</h3>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="upcomingHeaders"
              :items="upcomingPayments"
              hide-default-footer
              class="elevation-1"
            >
              <template v-slot:item.due_date="{ item }">
                {{ formatDate(item.due_date) }}
              </template>
              <template v-slot:item.amount="{ item }">
                {{ formatCurrency(item.amount) }}
              </template>
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  dark
                  small
                >
                  {{ item.status }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import moment from 'moment';

export default {
  props: ['customerId'],

  data: () => ({
    loading: false,
    summary: {
      totalDeposits: 0,
      totalWithdrawals: 0,
      currentBalance: 0,
      outstandingInvoices: 0,
      pendingInvoicesCount: 0,
      lastDepositDate: null,
      lastWithdrawalDate: null,
      lastUpdateDate: null,
      depositsPercentage: 0,
      withdrawalsPercentage: 0,
      cashPaymentsPercentage: 0,
      invoicePaymentsPercentage: 0
    },
    recentTransactions: [],
    upcomingPayments: [],
    upcomingHeaders: [
      { text: 'Invoice #', value: 'invoice_number' },
      { text: 'Due Date', value: 'due_date' },
      { text: 'Amount', value: 'amount' },
      { text: 'Type', value: 'type' },
      { text: 'Status', value: 'status' }
    ]
  }),

  computed: {
    ...mapGetters({
      customers: 'getCustomers',
    }),
  },

  methods: {
    formatDate(date) {
      return date ? moment(date).format('DD MMM YYYY') : 'N/A';
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'KES'
      }).format(amount);
    },

    getTransactionColor(type) {
      switch (type) {
        case 'Deposit':
          return 'primary';
        case 'Withdrawal':
          return 'error';
        case 'Cash Payment':
          return 'success';
        case 'Invoice Payment':
          return 'warning';
        case 'Waiver':
          return 'info';
        default:
          return 'grey';
      }
    },

    getAmountClass(type) {
      switch (type) {
        case 'Deposit':
          return 'success--text';
        case 'Withdrawal':
        case 'Cash Payment':
        case 'Invoice Payment':
          return 'error--text';
        case 'Waiver':
          return 'info--text';
        default:
          return '';
      }
    },

    getStatusColor(status) {
      switch (status) {
        case 'Paid':
          return 'green';
        case 'Pending':
          return 'orange';
        case 'Overdue':
          return 'red';
        default:
          return 'grey';
      }
    },

    fetchFinancialData() {
      this.loading = true;

      // Call the API endpoint to get real financial data
      axios.get(`/api/reception/customers/${this.customerId}/portal/financial-overview`)
        .then(response => {
          const data = response.data;

          // Update the summary with real data
          this.summary = data.summary;
          this.recentTransactions = data.recentTransactions;
          this.upcomingPayments = data.upcomingPayments;
          this.loading = false;
        })
        .catch(error => {
          console.error('Error fetching financial data:', error);
          this.loading = false;

          // Fallback to sample data in case of error
          this.summary = {
            totalDeposits: 0,
            totalWithdrawals: 0,
            currentBalance: 0,
            outstandingInvoices: 0,
            pendingInvoicesCount: 0,
            lastDepositDate: null,
            lastWithdrawalDate: null,
            lastUpdateDate: null,
            depositsPercentage: 0,
            withdrawalsPercentage: 0,
            cashPaymentsPercentage: 0,
            invoicePaymentsPercentage: 0
          };

          this.recentTransactions = [];
          this.upcomingPayments = [];
        });
    }
  },

  created() {
    this.fetchFinancialData();
  }
};
</script>
