<template>
  <div>
    <div>
      <v-spacer></v-spacer>
      <v-row>
        <v-col cols="12" md="3" class="px-2">
          <!-- cashiers select -->
          <users-search
              label="Search and select cashier"
              @results="setCashier"
              leaveSelected
              @clearedSelected="clearedCashier()"
          ></users-search>
        </v-col>


        <v-col cols="12" md="3" class="px-2">
          <!-- receipt search -->
          <v-text-field
            v-model="filters.receipt_search"
            label="Search Receipt Number"
            outline
            clearable
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="3" class="px-2">
          <collabmed-date-time-picker outline @input="setStartDate"
                                      :datetime="filters.start_date"
                                      label="Start date">
          </collabmed-date-time-picker>
        </v-col>

        <v-col cols="12" md="3" class="px-2">
          <collabmed-date-time-picker outline @input="setEndDate"
                                      :datetime="filters.end_date" label="End date">
          </collabmed-date-time-picker>
        </v-col>

        <v-col cols="12" md="3" class="px-2">
          <v-btn color="primary" @click="init()" class="mx-3">Filter</v-btn>
          <download-to-excel 
            :filters="filters" 
            :export_pos="1" 
            :url="export_url()" 
            :filename="filename"
            requestType="get"
          ></download-to-excel>
        </v-col>
      </v-row>
    </div>

    <collabmed-loading v-if="transactions === null"></collabmed-loading>
    <v-data-table
        v-else
        :headers="headers"
        :items="transactions.data"
        item-key="id"
        :items-per-page="30"
        class="mb-3" flat
        hide-default-footer
    >
      <template v-slot:item.discount_amount="{ item }">
        {{ formatMoney(item.discount_amount) }}
      </template>
      <template v-slot:item.total_amount_was="{ item }">
        {{ formatMoney(item.total_amount_was) }}
      </template>
      <template v-slot:item.payment_mode="{ item }">
        <v-chip
            :color="getPaymentModeColor(item.payment_mode)"
            text-color="white"
            small
        >
          {{ formatPaymentMode(item.payment_mode) }}
        </v-chip>
      </template>
      <template v-slot:item.cash_amount="{ item }">
        {{ formatMoney(item.cash_amount) }}
      </template>
      <template v-slot:item.mpesa_amount="{ item }">
        {{ formatMoney(item.mpesa_amount) }}
      </template>
      <template v-slot:item.card_amount="{ item }">
        {{ formatMoney(item.card_amount) }}
      </template>
      <template v-slot:item.cheque_amount="{ item }">
        {{ formatMoney(item.cheque_amount) }}
      </template>
      <template v-slot:item.pesa_pal_card_amount="{ item }">
        {{ formatMoney(item.pesa_pal_card_amount) }}
      </template>
      <template v-slot:item.pesa_pal_mpesa_amount="{ item }">
        {{ formatMoney(item.pesa_pal_mpesa_amount) }}
      </template>
      <template v-slot:item.voucher_amount="{ item }">
        {{ formatMoney(item.voucher_amount) }}
      </template>
      <template v-slot:item.giftcard_amount="{ item }">
        {{ formatMoney(item.giftcard_amount) }}
      </template>
      <template v-slot:item.loyalty_amount="{ item }">
        {{ formatMoney(item.loyalty_amount) }}
      </template>
      <template v-slot:footer>
        <v-row>
          <v-col cols="12" class="text-center">
            <collabmed-paginator v-if="transactions.meta" :meta="transactions.meta" @change="navigate" />
          </v-col>
        </v-row>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import moment from "moment";
import {mapActions,mapGetters} from "vuex";
import _ from 'lodash';

export default {
  props: {
    cashiers: {
      type: Array,
      default: () => []
    },
    label: {
      type: String,
      default: 'Select cashier',
    },
    required: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    loading: false,
    filename: 'Discount Transactions Report',
    filters: {
      start_date: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      end_date: moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      user_id: null,
      payment_mode: 'All',
      customer_id: null,
      receipt_search: '',
      reason_search: '',
      page: 1,
      cashier_id:null,
      // Add missing filters to avoid sending the string "undefined" in query params
      station_id: null,
      status: 'All',
      service_point_id: null,
      facility_id: null,
      product_id: null,

    },
    selected_cashier_id:null,

    transactions: null,
    headers: [
      {text:'Cashier', value:'user'},
      {text:'Transaction Date', value:'transaction_date'},
      {text:'Receipt Number', value:'receipt_number'},
      {text:'Discount Amount (KSH)', value:'discount_amount'},
      {text:'Total Amount Was (KSH)', value:'total_amount_was'},
      {text:'Discount Reason', value:'discount_reason'},
      {text:'Payment Mode', value:'payment_mode'},
      {text:'Cash Amount (KSH)', value:'cash_amount'},
      {text:'M-Pesa Amount (KSH)', value:'mpesa_amount'},
      {text:'Card Amount (KSH)', value:'card_amount'},
      {text:'Cheque Amount (KSH)', value:'cheque_amount'},
      {text:'PesaPal Card Amount (KSH)', value:'pesa_pal_card_amount'},
      {text:'PesaPal M-Pesa Amount (KSH)', value:'pesa_pal_mpesa_amount'},
      {text:'Voucher Amount (KSH)', value:'voucher_amount'},
      {text:'Gift Card Amount (KSH)', value:'giftcard_amount'},
      {text:'Loyalty Amount (KSH)', value:'loyalty_amount'},
    ],
  }),

  computed: {
    ...mapGetters({
      facilities: "getFacilities",
      users: "getUsers",
    }),
  },

  watch: {

    getUsers({ data }) {
      // When Vuex users list updates, stop loading spinner on the autocomplete
      this.loading = false;
    },
    'filters.user_id'(newValue) {
      this.filters.page = 1;
      this.init();
    },
    'filters.payment_mode'(newValue) {
      this.filters.page = 1;
      this.init();
    },
    'filters.cashier_id'(newValue) {
      // Support both object and primitive id values
      if (newValue !== null && newValue !== undefined) {
        this.selected_cashier_id = typeof newValue === 'object' ? newValue.id : newValue;
      } else {
        this.selected_cashier_id = null;
      }
      this.filters.page = 1;
      this.init();
    },
    'filters.customer_id'(newValue) {
      this.filters.page = 1;
      this.init();
    },
    'filters.receipt_search'(newValue) {
      this.filters.page = 1;
      this.init();
    },
    'filters.reason_search'(newValue) {
      this.filters.page = 1;
      this.init();
    },
  },


  methods: {
    // Format currency amounts to 2 decimal places
    formatMoney(value) {
      const num = Number(value) || 0;
      return num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    clearedSelected() {
      // Clear selected cashier and search state
      this.filters.cashier_id = null;
      this.selected_cashier_id = null;
    },
    clearedCashier() {
      this.filters.cashier_id = null;
    },
    setCashier(cashier) {
      this.filters.cashier_id = cashier.id;
    },
    setStartDate: function(datetime) {
      this.filters.start_date = datetime;
    },
    ...mapActions({
      setUsers: 'setUsers'   ,
    }),



    setEndDate: function(datetime) {
      this.filters.end_date = datetime;
    },

    formatPaymentMode(paymentMode) {
      if (!paymentMode) return 'N/A';
      
      const modeMap = {
        'cash': 'Cash',
        'mpesa': 'M-Pesa',
        'card': 'Card',
        'cheque': 'Cheque',
        'pesa_pal_mpesa': 'Pesapal M-Pesa',
        'pesa_pal_card': 'Pesapal Card',
        'bank': 'Bank Deposit',
        'credit': 'Credit',
        'airtel': 'Airtel Money',
        'insurance': 'Insurance',
        'loyalty': 'Loyalty Points',
        'giftcard': 'Gift Card',
        'voucher': 'Voucher'
      };
      
      return modeMap[paymentMode] || paymentMode.charAt(0).toUpperCase() + paymentMode.slice(1);
    },

    getPaymentModeColor(paymentMode) {
      if (!paymentMode) return 'grey';
      
      const colorMap = {
        'cash': 'green',
        'mpesa': 'blue',
        'card': 'purple',
        'cheque': 'orange',
        'pesa_pal_mpesa': 'blue',
        'pesa_pal_card': 'purple',
        'bank': 'teal',
        'credit': 'amber',
        'airtel': 'cyan',
        'insurance': 'indigo',
        'loyalty': 'pink',
        'giftcard': 'lime',
        'voucher': 'deep-orange'
      };
      
      return colorMap[paymentMode] || 'grey';
    },

    // Helper to build query params without undefined/null/empty values
    buildQueryParams(extra = {}) {
      const params = {};

      // always include date range and page
      params.start_date = this.filters.start_date;
      params.end_date = this.filters.end_date;

      // optional filters
      if (this.filters.station_id != null) params.station_id = this.filters.station_id;
      if (this.filters.service_point_id != null) params.service_point_id = this.filters.service_point_id;
      if (this.selected_cashier_id != null) params.cashier_id = this.selected_cashier_id;
      if (this.filters.facility_id != null) params.facility_id = this.filters.facility_id;
      if (this.filters.product_id != null) params.product_id = this.filters.product_id;
      if (this.filters.user_id != null) params.user_id = this.filters.user_id;

      // Include status/payment_mode only when not 'All' and not empty
      if (this.filters.status && this.filters.status !== 'All') params.status = this.filters.status;
      if (this.filters.payment_mode && this.filters.payment_mode !== 'All') params.payment_mode = this.filters.payment_mode;

      // discount-specific searches
      if (this.filters.receipt_search) params.receipt_search = this.filters.receipt_search;
      if (this.filters.reason_search) params.reason_search = this.filters.reason_search;

      // merge any extra parameters (like page/export/receipt)
      return new URLSearchParams({ ...params, ...extra }).toString();
    },

    url(page = 1) {
      const query = this.buildQueryParams({ page });
      return `/reports/product/discount-transactions/report?${query}`;
    },

    export_url(page = 1) {
      const extra = { page, export: 1 };
      if (this.filters.receipt_search) extra.reception_number = this.filters.receipt_search;
      const query = this.buildQueryParams(extra);
      return `/reports/product/discount-transactions/report?${query}`;
    },
    navigate(page) {
      this.filters.page = page;
      this.init();
    },


    async init() {
      const url = this.url(this.filters.page || 1);
      try {
        const response = await axios.get(url);
        const payload = response.data || {};

        // Normalize pagination shape to always expose { data, meta }
        const meta = payload.meta
          ? payload.meta
          : {
              current_page: payload.current_page || this.filters.page || 1,
              per_page: payload.per_page || 30,
              total: payload.total || (payload.data ? payload.data.length : 0),
              last_page: payload.last_page || 1,
              from: payload.from || 1,
              to: payload.to || (payload.data ? payload.data.length : 0),
              path: payload.path || this.url().split('?')[0],
              links: payload.links || [],
            };

        this.transactions = {
          data: payload.data || [],
          meta,
        };
      } catch (error) {
        console.error('Error fetching discount transactions:', error);
        this.transactions = { data: [], meta: null };
      }
    },
  },

  mounted() {
    console.log("hello")
    this.init();
  },
};
</script>

<style scoped>
.v-input--selection-controls__input{
  display:none !important
}
</style>

