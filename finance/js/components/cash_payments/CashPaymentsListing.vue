<template>
  <v-card flat>
    <collabmed-floating-loader v-if="loading"></collabmed-floating-loader>

    <div v-if="receipts">

      <v-card-text class="pt-4 my-0">
        <v-row  >
          <v-col md="2" class="px-2">
            <v-autocomplete
                v-model="filters.selectedUsers"
                :loading="loading"
                :items="users.data"
                outline
                class="mx-3"
                multiple
                item-text="name"
                item-value="id"
                hide-no-data
                hide-details
                label="Select user/s"
            >
              <template v-slot:selection="data">
                <v-chip
                    :selected="data.selected"
                    close
                    class="chip--select-multi"
                    @input="remove(data.item)"
                >
                  {{ data.item.name }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>

          <v-col cols="12" md="2" class="px-2">
            <v-text-field outline v-model="filters.receipt_input" @change="receiptChanged()" :placeholder="placeholder" label="Receipt"></v-text-field>
          </v-col>

          <v-col cols="12" md="2" class="px-2">
            <patient-search @patientSelected="patientSelected"></patient-search>
          </v-col>


          <v-col cols="12" md="2" class="px-2">
            <v-select
                :items="statuses"
                label="Status"
                v-model="filters.status"
                outline
            ></v-select>
          </v-col>

          <v-col cols="12" md="2" class="px-2">
            <v-autocomplete
              :items="paymentModes"
              v-model="filters.payment_mode"
              multiple
              class="mx-3"
              outline
              item-text="text"
              item-value="value"
              label="Select payment mode"
            >
              <template v-slot:selection="data">
                <v-chip
                  :selected="data.selected"
                  close
                  class="chip--select-multi"
                  @click:close="removePaymentModeSelected(data.item)"
                >
                  {{ data.item.text }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-col>

          <v-col md="2" class="px-2">
            <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
          </v-col>

          <v-col md="2" class="px-2">
            <collabmed-date-time-picker small outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
          </v-col>

          <v-col md="2" class="px-2">
            <v-btn small color="success" @click="filter()">Filter</v-btn>
          </v-col>

          <v-col md="2" class="px-2">
            <download-to-excel   :filters="cleanedFilters" :url="url" :filename="filename"></download-to-excel>
          </v-col>
        </v-row>


        <v-row v-if="can('reports.financial-cash') && receipts.total && receipts.total_cash">
          <v-col>
            <h5 class=" px-3 grey--text">Total amount: {{ receipts.total }}</h5>
          </v-col>
          <v-col>
            <h5 class=" px-3 grey--text">Opening cash balance: {{ receipts.total }}</h5>
          </v-col>

          <v-col>
            <h5 class=" px-3 grey--text">Actual Total cash collected: {{ receipts.total_cash }}</h5>
          </v-col>
          <v-col>
            <h5 class=" px-3 grey--text">Total pickups: {{  }}</h5>
          </v-col>
          <v-col>
            <h5 class=" px-3 grey--text">Total M-pesa payments: {{ receipts.total_mpesa }}</h5>
          </v-col>

          <v-col>
            <h5 class=" px-3 grey--text">Total cARD payments : {{receipts.total_pesa_pal_card }}</h5>
          </v-col>
          <v-col>
            <h5 class=" px-3 grey--text">Total cancelled amount: {{ receipts.total_cancelled }}</h5>
          </v-col>
        </v-row>
      </v-card-text>

      <v-data-table
          :headers="headers"
          :items="receipts.data"
          hide-default-footer
          class="elevation-1"
      >
        <template v-slot:item.status="{ item }">
          <v-chip small>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn small color="primary" @click="viewDetails(item)">view</v-btn>
          <v-btn small color="indigo" class="ml-1" @click="printReceipt(item)" v-if="item.status === 'Processed'">Print</v-btn>
          <v-btn small color="error" class="ml-1" @click="cancelReceipt(item)" v-if="item.status === 'Processed'">Cancel</v-btn>
          <v-btn small color="success" class="ml-1" @click="initializeCreditNote(item)" v-if="item.status === 'Processed'">Issue Credit note</v-btn>
          <v-btn small color="teal" class="ml-1" @click="createInvoice(item)" v-if="item.status === 'Cancelled'">Create Invoice</v-btn>
          <v-btn small color="info" class="ml-1" @click="viewCreditNote(item)" v-if="item.status === 'Credit note requested (waiting approval)'">View Credit Note</v-btn>
        </template>
        <template v-slot:footer>
          <v-row>
            <v-col cols="12" class="text-center">
              <collabmed-paginator  :meta="receipts.meta" @change="navigate"></collabmed-paginator>
            </v-col>
          </v-row>
        </template>
      </v-data-table>

      <!-- raise credit note dialog -->
      <!-- edit consumable -->
      <v-dialog v-model="dialog" persistent max-width="800" >
        <v-card>
          <v-card-title class="text-h5 primary">
            <span class="white--text"> Issue client/patient with a credit note</span>
            <v-btn icon dark @click.native="closeDialog()" absolute right>
              <v-icon>close</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-text-field v-model="credit_note.customer_name" outline label="Patient/Customer"></v-text-field>

            <v-textarea v-model="credit_note.note" outline label="Notes"></v-textarea>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="success" small @click="issueClientCreditNote()">save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- view credit note dialog -->
      <v-dialog v-model="creditNoteDialog" persistent max-width="800" >
        <v-card>
          <v-card-title class="text-h5 primary">
            <span class="white--text"> Credit Note Details</span>
            <v-btn icon dark @click.native="closeCreditNoteDialog()" absolute right>
              <v-icon>close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text v-if="creditNoteDetails">
            <v-text-field v-model="creditNoteDetails.customer" outline label="Patient/Customer" readonly></v-text-field>

            <v-text-field v-model="creditNoteDetails.issued_by" outline label="Issued by" readonly></v-text-field>
            <v-textarea v-model="creditNoteDetails.note" outline label="Note" readonly></v-textarea>


            <v-text-field v-model="creditNoteDetails.receipt" outline label="Receipt Number" readonly></v-text-field>

            <v-text-field v-model="creditNoteDetails.amount" outline label="Amount" readonly></v-text-field>

            <v-text-field :value="formatDate(creditNoteDetails.date)" outline label="Date" readonly></v-text-field>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="success" small @click="approveCreditNote()">Approve Credit Note</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

    </div>
  </v-card>
</template>
<script>
import moment from 'moment';
import { mapGetters, mapActions } from 'vuex';
import Receipt from '@finance/libs/payments/Receipts';
import PatientSearch from '@reception/components/patients/PatientSearch';
import axios from 'axios';

export default {
  components: { PatientSearch },
  props: [
    'user_id'
  ],
  data: () => ({
    loading: true,
    searchCashier: '',
    page: null,
    dialog: false,
    creditNoteDialog: false,
    filename: 'Cashier Collections Report',
    receipt: new Receipt(),
    credit_note: {
      note: '',
      customer_name: null,
      receipt_id: null,
    },
    creditNoteDetails: {
      customer_name: null,
      note: null,
      amount: null,
      date: null,
      receipt_id: null,
    },
    filters: {
      start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:MM'),
      end_date: moment(new Date()).format('YYYY-MM-DD HH:MM'),
      selectedUsers: [],
      payment_mode: [],
      receipt: null,
      receipt_input: null,
      patient_id: null,
      status: 'processed',
    },
    headers: [
      { text: 'Receipt', value: 'receipt_no' },
      { text: 'Customer', value: 'patient_name' },
      { text: 'Date', value: 'date' },
      { text: 'Amount', value: 'amount' },
      { text: 'Cashier', value: 'cashier' },
      { text: 'Payment mode', value: 'payment_mode' },
      { text: 'Status', value: 'status' },
      { text: 'Actions', value: 'actions' },
    ],
  }),

  methods: {
    ...mapActions([
      'setPaymentsReceipts', 'setUsers','setFacilities'
    ]),
    filtersInfo() {
            const filters_data = _.omitBy(this.filters, _.isNil);

            const filtersInfo = {};

            const self = this;

            _.map(filters_data, function(val, key) {
                if (key === "facility_id") {
                    _.map(self.facilities.facilities, (item) => {
                        if (item.id === val) {
                            filtersInfo["facility"] = item.name;
                        }
                    });
                } else {
                    filtersInfo[key.replace("_", " ")] = val;
                }
            });

            this.filters_info = filtersInfo;
        },
        facilityCleared() {
            this.filters.facility_id = null;
        },

    receiptChanged() {
      if (this.msetting('finance.use_short_receipt_no')) {
        this.filters.receipt_id = this.filters.receipt_input ? this.filters.receipt_input : null;
      } else {
        this.filters.receipt = this.filters.receipt_input ? this.filters.receipt_input : null;
      }
    },
    removePaymentModeSelected(item) {
    this.filters.payment_mode = this.filters.payment_mode.filter(
      (value) => value !== item.value
    );
  },

    clearedCashier() {
      this.filters.user_id = null;
    },

    patientSelected(val) {
      if (val) {
        this.filters.patient_id = val.id;
      } else {
        this.filters.patient_id = null;
      }
    },

    setStartDate(datetime) {
      this.filters.start_date = datetime;
    },

    paymentModeCleared() {
      this.filters.payment_mode = null;
    },

    setEndDate(datetime) {
      this.filters.end_date = datetime;
    },

    setCashier(cashier) {
      this.filters.cashier_id = cashier.id;
    },

    nativeAutoPrintFromUrl(url) {
      return new Promise((resolve, reject) => {
        if (!url) return reject(new Error('Missing print URL'));
        let oldIframe = document.getElementById('print-iframe');
        if (oldIframe) oldIframe.remove();
        const iframe = document.createElement('iframe');
        iframe.id = 'print-iframe';
        iframe.style.display = 'none';
        iframe.src = `${url}${url.includes('?') ? '&' : '?'}auto_print=1`;
        iframe.onload = () => {
          try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            resolve();
          } catch (err) {
            reject(err);
          } finally {
            setTimeout(() => iframe.remove(), 3000);
          }
        };
        document.body.appendChild(iframe);
      });
    },

    viewDetails(item) {
      window.open(`/finance/evaluation/payment_details/${item.id}`, '_blank');
    },

    async viewCreditNote(item) {
      try {
        const response = await axios.get(`/api/finance/credit/note/${item.id}`);
        this.creditNoteDetails = response.data.data
        console.log('Response data:', response.data.data);
        console.log(this.creditNoteDetails);
        this.creditNoteDialog = true;
      } catch (error) {
        console.error('Error fetching credit note details:', error);
      }
    },

    filter() {
      this.loading = true;
      this.page = 1;

      const self = this;

      // Execute the asynchronous action without await
      const responsePromise = this.setPaymentsReceipts({
        page: this.page,
        params: _.omitBy(this.filters, _.isNil),
      });

      // Handle the Promise
      responsePromise.then((response) => {
        // Process the response if needed
        if (response) {
          self.loading = false;
        }
        // Set loading to false when the response is received
      }).catch((error) => {
        // Handle any errors that occur during the API call
        console.error('Error:', error);
        // Set loading to false in case of an error
        self.loading = false;
      });
    },


    async cancelReceipt(item) {
      this.loading = true;

      const response = await this.receipt.cancelReceipt(item);

      if (response) {
        this.reInitialize();
      }
    },

    reInitialize() {
      const self = this;

      if (this.page) {
        this.setPaymentsReceipts({
          page: self.page,
          params: _.omitBy(self.filters, _.isNil),
        }).then((response) => {
          self.loading = false;
        });
      } else {
        this.setPaymentsReceipts();
      }
    },

    initializeCreditNote(receipt) {
      this.dialog = true;
      this.credit_note.receipt_id = receipt.id;
      this.credit_note.customer_name = receipt.patient_name;
    },

    issueClientCreditNote() {
      const self = this;

      this.receipt.issueCreditNote(this.credit_note).then((response) => {
        self.dialog = false;
        self.reInitialize();
        self.credit_note.note = null;
        self.credit_note.customer_name = null;
      });
    },

    async printReceipt(item) {
      try {
        const urlObj = this.$router ? this.$router.resolve({ name: 'finance.evaluation.normal.rcpt.print.get', params: { payment: item.id } }) : null;

        const url =  `/finance/evaluation/print/receipt/thermal/${item.id}`;


        await this.nativeAutoPrintFromUrl(url);
      } catch (e) {
        console.warn('Failed to print receipt', e);
        try { window.open(`/finance/evaluation/payment_details/${item.id}?auto_print=1`, '_blank'); } catch (e2) {}
      }
    },

    createInvoice(receipt) {
      window.location.href = route('finance.cash.action', { 'key': 'invoiced', 'action': 'create-invoice', 'patient_id': receipt.patient_id });
    },

    navigate(page) {
      this.page = page;
      this.reInitialize();
    },

    creditNote(item) {
    // Your credit note logic here
    // If you want to perform any action when the button is clicked
    // before opening the dialog, you can place it here
  },

    closeDialog() {
      this.dialog = false;
      this.credit_note.note = null;
      this.credit_note.customer_name = null;
    },

    closeCreditNoteDialog() {
      this.creditNoteDialog = false;
      this.creditNoteDetails = {
        customer_name: null,
        note: null,
        amount: null,
        date: null,
        receipt_id: null,
      };
    },

    async approveCreditNote() {
      try {
        await axios.post(`/api/finance/paymentsReceipts/${this.creditNoteDetails.receipt_id}/approve-credit-note`);
        this.closeCreditNoteDialog();
        this.reInitialize();
      } catch (error) {
        console.error('Error approving credit note:', error);
      }
    },

    formatDate(date) {
      return moment(date).format('DD/MM/YYYY');
    },
  },

  computed: {
    ...mapGetters({
      receipts: 'getPaymentsReceipts',
      facilities: 'getFacilities',
      users: 'getUsers',
    }),
    cleanedFilters() {
      return _.omitBy(this.filters, v =>
          _.isNil(v) ||
          (Array.isArray(v) && v.length === 0) ||
          v === ''
      );
    },


    url() {
            return "/api/finance/paymentsReceipts";
        },
    placeholder() {
      return this.msetting('finance.use_short_receipt_no') ? 'remove the prefix e.g: 1024' : '';
    },

    statuses() {
      return [
        { text: 'All', value: 0 },
        { text: 'Processed', value: 'processed' },
        { text: 'Cancelled', value: 'cancelled' },
        { text: 'Issued credit note', value: 'issued credit note' },
      ];
    },
    paymentModes() {
      return [
        { text: 'Cash', value: 'cash' },
        { text: 'M pesa', value: 'mpesa' },
        { text: 'Credit card', value: 'card' },
        { text: 'Cheque', value: 'cheque' },
        { text: 'Pesa pal M-pesa', value: 'pesapal-mpesa' },
        { text: 'Pesa pal Card', value: 'pesapal-card' },

      ];
    },

  },

  watch: {
    receipts(val) {
      this.loading = false;
    },
  },

  mounted() {
    if(this.user_id){
      this.setPaymentsReceipts({
        params: {
          selectedUsers: this.user_id,
        },
      });
    }
    this.reInitialize();
    this.setFacilities();
    this.setUsers({
      params: {
        'no_pagination': true,
      },
    });
  },
};
</script>
