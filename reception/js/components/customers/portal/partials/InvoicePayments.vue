<template>
  <div>
    <v-card>
      <v-card-title>
        <h3>Invoice Payments</h3>
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
        loading-text="Loading invoice payments... Please wait"
        no-data-text="No invoice payments found"
        class="elevation-1"
      >
        <template v-slot:item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>
        <template v-slot:item.amount="{ item }">
          {{ formatCurrency(item.amount) }}
        </template>
        <template v-slot:item.invoice_amount="{ item }">
          {{ formatCurrency(item.invoice_amount) }}
        </template>
        <template v-slot:item.balance="{ item }">
          {{ formatCurrency(item.balance) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            small
            color="primary"
            @click="viewReceipt(item)"
            class="mr-2"
          >
            View Receipt
          </v-btn>
          <v-btn
            small
            color="info"
            @click="viewInvoice(item)"
          >
            View Invoice
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Receipt Dialog -->
    <v-dialog v-model="receiptDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Invoice Payment Receipt</span>
        </v-card-title>
        <v-card-text v-if="selectedPayment">
          <v-container>
            <v-row>
              <v-col cols="12" class="text-center">
                <h2>INVOICE PAYMENT RECEIPT</h2>
                <p>Receipt #: {{ selectedPayment.receipt_number }}</p>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Date:</v-col>
              <v-col cols="6">{{ formatDate(selectedPayment.date) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Invoice #:</v-col>
              <v-col cols="6">{{ selectedPayment.invoice_number }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Invoice Amount:</v-col>
              <v-col cols="6">{{ formatCurrency(selectedPayment.invoice_amount) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Amount Paid:</v-col>
              <v-col cols="6">{{ formatCurrency(selectedPayment.amount) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Payment Method:</v-col>
              <v-col cols="6">{{ selectedPayment.payment_method }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Balance:</v-col>
              <v-col cols="6">{{ formatCurrency(selectedPayment.balance) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Status:</v-col>
              <v-col cols="6">{{ selectedPayment.status }}</v-col>
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

    <!-- Invoice Dialog -->
    <v-dialog v-model="invoiceDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">Invoice Details</span>
        </v-card-title>
        <v-card-text v-if="selectedPayment">
          <v-container>
            <v-row>
              <v-col cols="12" class="text-center">
                <h2>INVOICE</h2>
                <p>Invoice #: {{ selectedPayment.invoice_number }}</p>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Date:</v-col>
              <v-col cols="6">{{ formatDate(selectedPayment.invoice_date) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Due Date:</v-col>
              <v-col cols="6">{{ formatDate(selectedPayment.due_date) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Total Amount:</v-col>
              <v-col cols="6">{{ formatCurrency(selectedPayment.invoice_amount) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Amount Paid:</v-col>
              <v-col cols="6">{{ formatCurrency(selectedPayment.amount) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="6">Balance:</v-col>
              <v-col cols="6">{{ formatCurrency(selectedPayment.balance) }}</v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <h4>Invoice Items</h4>
                <v-simple-table>
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in selectedPayment.invoice_items" :key="index">
                        <td>{{ item.name }}</td>
                        <td>{{ item.description }}</td>
                        <td>{{ item.quantity }}</td>
                        <td>{{ formatCurrency(item.unit_price) }}</td>
                        <td>{{ formatCurrency(item.total) }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="printInvoice">Print</v-btn>
          <v-btn color="error" text @click="closeInvoiceDialog">Close</v-btn>
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
    payments: [],
    headers: [
      { text: 'Receipt #', value: 'receipt_number' },
      { text: 'Date', value: 'date' },
      { text: 'Invoice #', value: 'invoice_number' },
      { text: 'Invoice Amount', value: 'invoice_amount' },
      { text: 'Payment Method', value: 'payment_method' },
      { text: 'Balance', value: 'balance' },
      { text: 'Status', value: 'status' },
      { text: 'Actions', value: 'actions', sortable: false }
    ],
    receiptDialog: false,
    invoiceDialog: false,
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

    getStatusColor(status) {
      switch (status) {
        case 'Paid':
          return 'green';
        case 'Partial':
          return 'orange';
        case 'Pending':
          return 'blue';
        case 'Overdue':
          return 'red';
        default:
          return 'grey';
      }
    },

    viewReceipt(payment) {
      this.selectedPayment = payment;
      this.receiptDialog = true;
    },

    closeReceiptDialog() {
      this.receiptDialog = false;
      this.selectedPayment = null;
    },

    viewInvoice(payment) {
      this.selectedPayment = payment;
      this.invoiceDialog = true;
    },

    closeInvoiceDialog() {
      this.invoiceDialog = false;
      this.selectedPayment = null;
    },

    printReceipt() {
      // Implement print functionality
      window.print();
    },

    printInvoice() {
      // Implement print functionality
      window.print();
    },

    fetchPayments() {
      this.loading = true;

      // Call the API endpoint to get real invoice payment data
      axios.get(`/api/reception/customers/${this.customerId}/portal/invoice-payments`)
        .then(response => {
          const data = response.data;

          // Process the invoice payments data from the API
          const invoicePayments = response.data.invoicePayments || [];

          // Update pagination metadata
          if (data.meta) {
            this.pagination.total = data.meta.total;
            this.pagination.totalPages = data.meta.last_page;
          }

          // Map the API data to match our component's expected format
          this.payments = invoicePayments.map(payment => {
            return {
              date: payment.created_at || payment.date,
              receipt_number:payment.receipt_number||'',
              invoice_number: payment.invoice_no ,
              invoice_date: payment.invoice_date || payment.created_at,
              invoice_amount: payment.invoice_amount || 0,
              payment_method: payment.payment_method || 'Cash',
              user:payment.user
            };
          });

          this.loading = false;
        })
        .catch(error => {
          console.error('Error fetching invoice payments:', error);
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
