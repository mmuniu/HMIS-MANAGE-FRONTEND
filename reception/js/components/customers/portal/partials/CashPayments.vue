<template>
  <div>
    <v-card>
      <v-card-title>
        <h3>Cash Payments</h3>
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
        :items="payments"
        :search="search"
        :loading="loading"
        loading-text="Loading cash payments... Please wait"
        no-data-text="No cash payments found"
        class="elevation-1"
        hide-default-footer
      >
        <template v-slot:item.created_at="{ item }">
          {{ formatDate(item.created_at) }}
        </template>
        <template v-slot:item.amount="{ item }">
          {{ formatCurrency(item.amount) }}
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
        <template v-slot:footer>
          <div class="d-flex justify-center pt-4">
            <v-pagination
              v-model="pagination.page"
              :length="pagination.totalPages"
              :total-visible="7"
              @input="handlePageChange"
            ></v-pagination>
          </div>
          <div class="d-flex justify-end pa-4">
            <v-select
              v-model="pagination.perPage"
              :items="[5, 10, 15, 20, 25]"
              label="Items per page"
              @change="handlePerPageChange"
              style="max-width: 150px;"
            ></v-select>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Receipt Dialog -->
    <v-dialog v-model="receiptDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Cash Payment Receipt</span>
        </v-card-title>
        <v-card-text v-if="selectedPayment">
          <v-container>
            <v-row>
              <v-col cols="12" class="text-center">
                <h2>CASH PAYMENT RECEIPT</h2>
                <p>Receipt #: {{ selectedPayment.receipt_number }}</p>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Date:</v-col>
              <v-col cols="6">{{ formatDate(selectedPayment.date) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Amount:</v-col>
              <v-col cols="6">{{ formatCurrency(selectedPayment.amount) }}</v-col>
            </v-row>

            <v-row>
              <v-col cols="6">Department:</v-col>
              <v-col cols="6">{{ selectedPayment.department }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Cashier:</v-col>
              <v-col cols="6">{{ selectedPayment.cashier }}</v-col>
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
import {  mapGetters } from 'vuex';
import moment from 'moment';

export default {
  props: ['customerId'],

  data: () => ({
    search: '',
    loading: false,
    payments: [],
    pagination: {
      page: 1,
      perPage: 10,
      total: 0,
      totalPages: 0
    },
    headers: [
      { text: 'Receipt #', value: 'receipt_number' },
      { text: 'Date', value: 'date' },
      { text: 'Amount', value: 'amount' },
      { text: 'Department', value: 'department' },
      { text: 'Cashier', value: 'cashier' },
      { text: 'Actions', value: 'actions', sortable: false }
    ],
    receiptDialog: false,
    selectedPayment: null
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


    viewReceipt(payment) {
      this.selectedPayment = payment;
      this.receiptDialog = true;
    },

    closeReceiptDialog() {
      this.receiptDialog = false;
      this.selectedPayment = null;
    },

    printReceipt() {
      // Implement print functionality
      window.print();
    },

    handlePageChange(page) {
      this.pagination.page = page;
      this.fetchPayments();
    },

    handlePerPageChange(perPage) {
      this.pagination.perPage = perPage;
      this.pagination.page = 1; // Reset to first page when changing items per page
      this.fetchPayments();
    },

    fetchPayments() {
      this.loading = true;

      // Call the API endpoint to get real cash payment data with pagination parameters
      axios.get(`/api/reception/customers/${this.customerId}/portal/cash-payments`, {
        params: {
          page: this.pagination.page,
          per_page: this.pagination.perPage
        }
      })
        .then(response => {
          // Process the cash payments data from the API
          const data = response.data;
          const cashPayments = data.data || [];

          // Update pagination metadata
          if (data.meta) {
            this.pagination.total = data.meta.total;
            this.pagination.totalPages = data.meta.last_page;
          }

          // Map the API data to match our component's expected format
          this.payments = cashPayments.map(payment => {
            return {
              receipt_number: payment.receipt || `CSH-${payment.id}`,
              date: payment.created_at || '',
              amount: payment.amount || 0,
              department: payment.department || payment.details?.department || 'Finance',
              cashier: payment.cashier || payment.created_by || 'System',
              remarks: payment.remarks || ''
            };
          });

          this.loading = false;
        })
        .catch(error => {
          console.error('Error fetching cash payments:', error);
          this.loading = false;
          this.payments = []; // Empty array in case of error
        });
    }
  },

  created() {
    this.fetchPayments();
  }
};
</script>
