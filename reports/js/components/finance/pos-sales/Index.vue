<template>
  <div>

    <div >
      <h2 class="text-body-2 ma-0 pa-0">Pos Sales Report </h2>
      <v-spacer></v-spacer>
      <v-row>
        <v-col cols="12" md="3" class="px-2">

          <v-autocomplete
              :items="facilities.facilities"
              outline
              v-model="filters.facility_id"
              color="blue-grey lighten-2"
              label="Select Facility"
              item-text="name"
              clearable
              @click:clear="facilityCleared"
              item-value="id"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" md="3" class="px-2">

          <!-- service point -->
          <v-autocomplete
              :items="stations"
              outline
              v-model="filters.service_point_id"
              color="blue-grey lighten-2"
              label="Select Service Point"
              item-text="name"
              clearable
              @click:clear="servicePointCleared"
              item-value="id"
          ></v-autocomplete>
        </v-col>
        <v-col cols="12" md="3" class="px-2">

          <!-- cashiers select -->
          <v-autocomplete  clearable
                           :label="label"
                           class="mb-4"
                           :items="users.data"
                           item-text="name"
                           v-model="filters.cashier_id"
                           :required="required"
                           return-object
                           @click:clear="clearedSelected()"
                           hide-no-data no-filter outline hide-details

                           :loading="loading"
          >
            <template slot="item" slot-scope="{ item }">
              <v-list-item-content>
                <v-list-item-title class="caption" v-text="item.name"></v-list-item-title>
              </v-list-item-content>
            </template>
          </v-autocomplete>

        </v-col>
        <v-col cols="12" md="3" class="px-2">

          <product-search @results="productSelected" @selectionCleared="productCleared" :un-clear-selected="true"></product-search>
        </v-col>

      </v-row>

      <v-row>
        <v-col>
          <v-select label="Status"
                    closable
                    :items="['All', 'Paid', 'Pending','Dispensed']"
                    v-model="filters.status"
          ></v-select>
        </v-col>
        <v-col>
          <v-select label="Payment Mode"
                    closable
                    :items="paymentModeOptions"
                    item-text="text"
                    item-value="value"
                    v-model="filters.payment_mode"
          ></v-select>
        </v-col>
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
        <v-col>
          <v-btn color="primary" @click="init()" class="mx-3">filter</v-btn>
          <download-to-excel :filters="filters" :export_pos="1" :url="export_url()" :filename="filename"
                             requestType="get"
          ></download-to-excel>

        </v-col>
      </v-row>

    </div>


    <collabmed-loading v-if="sales === null"></collabmed-loading>
    <v-data-table
        v-else
        :headers="headers"
        :items="sales.data"
        item-key="uniqueKey"
        v-model="selectedItems"
        :items-per-page="30"
        class="mb-3" flat
        hide-default-footer
    >


      <template v-slot:item.status="{ item }">
        <span v-if="item.status === 'Paid' || item.status === 'paid'" style="color: green">{{ capitalizeStatus(item.status) }}</span>
        <span v-if="item.status === 'Pending' || item.status === 'pending'" style="color: red">{{ capitalizeStatus(item.status) }}</span>
        <span v-if="item.status === 'Invoiced'" style="color: green">{{ capitalizeStatus(item.status) }}</span>
        <span v-if="item.status === 'Dispensed' || item.status === 'dispensed'" style="color: green">{{ capitalizeStatus(item.status) }}</span>
        <span v-if="item.status === 'Processed'" style="color: green">{{ capitalizeStatus(item.status) }}</span>

      </template>
      <template v-slot:item.actions="{ item }">
        <v-chip
            :color="item.status === 'Dispensed' ? 'green' : 'blue'"
            text-color="white"
            @click="printLabel(item)"
            :disabled="item.status !== 'Dispensed'"
        >
        </v-chip>
      </template>
      <template v-slot:item.amount="{ item }">
        {{ item.amount | numberFormat }}
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
      <template v-slot:footer="{ item }">
        <v-row>
          <v-col cols="12" class="text-center">
            <collabmed-paginator v-if="sales.meta" :meta="sales.meta" @change="navigate" />
          </v-col>
        </v-row>
      </template>
    </v-data-table>

    <drug-label-printout
        @close="dialogPrintLabel = false"
        :show="dialogPrintLabel"
        :drug="prescription"
        :dispensing_quantity="dispensing_quantity"
        :pos_drug_name="pos_drug_name"
        :is_pos="true"
        :patient_id="patient_id"
        :selected-visit="visit_object">
    </drug-label-printout>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import { reportsMixin } from "@reports/libs/reportsMixin";

import _ from "lodash";
import moment from "moment";
import ProductSearch from '@inventory/components/ProductsSearch';
import ProcedureSearch from '@evaluation/components/procedures/ProcedureSearch';
import Pos from "@inventory/libs/pos/Pos";
import Visit from '@reception/libs/visits/Visit';
import DrugLabelPrintout from '@evaluation/components/evaluation/actions/partials/DrugLabelPrintout';

export default {

  mixins: [
    reportsMixin,
  ],
  props: {
    station: {
      default:null
    },
    roles: {
      // performs an exact match on roles
      default: () => [],
      type: Array,
    },

    rolesLike: {
      // performs a LIKE %role% on roles
      default: () => [],
      type: Array,
    },

    visit_id: {
      default:null
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    userList: {
      type: Boolean,
      default: false,
    },
    stations: Array,
    label: {
      type: String,
      default: 'Select cashier',
    },
  },

  components: {
    ProductSearch,
    ProcedureSearch,
    'drug-label-printout': DrugLabelPrintout,
  },

  data: () => ({
    page: 1,
    placeholder: '',
    filename: 'Pos Sale details Report',
    pos :new Pos(),
    visitObj: new Visit(),
    visit_object: [],
    patient_id:null,
    initial_drug_data:null,
    dispensing_quantity:null,
    pos_drug_name:null,
    loading: false,
    selected_cashier_id:null,
    filters: {
      station_id: null,
      start_date: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
      end_date: moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      status: 'All',
      visit_id: null,
      product_id: null,
      service_id: null,
      cashier_id:null,
      service_point_id:null,
      facility_id:null,
      payment_mode: 'All',
      page: 1,
    },
    selectedItems:[],
    dialogPrintLabel: false,
    drug: [],
    search: '',
    final_export_filters: {},
    prescription:null,
    sales: null,
    headers: [
      {text:'Customer name', value:'customer_name'},
      { text: 'Service point', value: 'service_point' },
      { text: 'Invoice no', value: 'invoice_no' },
      { text: 'Product', value: 'product' },
      { text: 'Item Code', value: 'item_code' },
      { text: 'Category', value: 'category' },
      { text: 'Parent Category', value: 'parent_category' },
      { text: 'Tax Category', value: 'tax_category' },      
      { text: 'Unit Cost', value: 'unit_cost' },
      { text: 'Price', value: 'price' },
      { text: 'Quantity', value: 'qty' },
      { text: 'Amount', value: 'amount' },
      { text: 'Payment Mode', value: 'payment_mode' },
      { text: 'Date', value: 'date' },
      { text: 'User', value: 'user' },
      { text: 'Status', value: 'status' },

    ],
  }),

  computed: {

    initialised() {
      return this.station || this.$route.params.station;
    },
    ...mapGetters({
      facilities: "getFacilities",
      users: "getUsers",
    }),


    visit() {
      return this.visitObj.selectedVisit;
    },

    paymentModeOptions() {
      return [
        { text: 'All', value: 'All' },
        { text: 'Cash', value: 'cash' },
        { text: 'M-Pesa', value: 'mpesa' },
        { text: 'Card', value: 'card' },
        { text: 'Cheque', value: 'cheque' },
        { text: 'Pesapal M-Pesa', value: 'pesa_pal_mpesa' },
        { text: 'Pesapal Card', value: 'pesa_pal_card' },
        { text: 'Bank Deposit', value: 'bank' },
        { text: 'Credit', value: 'credit' },
        { text: 'Airtel Money', value: 'airtel' },
        { text: 'Insurance', value: 'insurance' },
        { text: 'Loyalty Points', value: 'loyalty' },
        { text: 'Gift Card', value: 'giftcard' },
        { text: 'Voucher', value: 'voucher' },
        { text: 'Invoice', value: 'invoice' }
      ];
    },

  },

  watch: {
    search(term) {
      if (term && term.length > 2 && this.user === null) {
        this.placeholder = '';
        this.searchItems(term);
      } else if (term) {
        this.placeholder = 'Enter ' + (3 - term.length) + ' more characters';
      }
    },
    export_filters(val) {
      // append current filters to export_filters
      this.final_export_filters = { ...this.filters, ...val };
      this.final_export_filters.export = 1;
    },
    station(val) {
      if (val) {
        this.filters.station_id = val.id;

        this.init();
      }
    },
    getUsers({ data }) {
      this.loading = false;
      this.users = data;
    },
    'filters.cashier_id'(newValue) {
      if (newValue) {
        this.selected_cashier_id = newValue.id;
      } else {
        this.selected_cashier_id = null;
      }
      this.init();
    },
    'filters.facility_id'(newValue) {
      this.init();
    },
    'filters.service_point_id'(newValue) {
      this.init();
    },
    'filters.product_id'(newValue) {
      this.init();
    },
    'filters.status'(newValue) {
      this.init();
    },
    'filters.payment_mode'(newValue) {
      this.init();
    },

  },

  methods: {
    ...mapActions({
      fetchPosSales: 'fetchPosSales',
      setUsers: 'setUsers'   ,
      setFacilities:'setFacilities'
    }),

    clearedSelected() {
      this.filters.cashier_id = null;
      this.selected_cashier_id = null;
    },
    searchItems: _.debounce(function (search) {
      if (!search || search.length === 0) {
        // Load all cashiers when search is empty
        this.loading = true;
        const action = {
          params: {
            no_pagination: true,
            users_list: this.userList ? 1 : 0,
          },
        };

        if (this.roles.length > 0) {
          action.params.roles = _.join(this.roles, ',');
        } else if (this.rolesLike.length > 0) {
          action.params.roles_like = _.join(this.rolesLike, ',');
        }

        this.setUsers(action)
            .then(() => {
              this.loading = false;
            })
            .catch((error) => {
              console.error('Error fetching users:', error);
              this.loading = false;
            });
        return;
      }

      if (search.length < 3) {
        this.placeholder = 'Enter at least 3 characters to search';
        return;
      }

      this.loading = true;

      const action = {
        params: {
          no_pagination: true,
          users_list: this.userList ? 1 : 0,
          search, // Pass search term
        },
      };

      if (this.roles.length > 0) {
        action.params.roles = _.join(this.roles, ',');
      } else if (this.rolesLike.length > 0) {
        action.params.roles_like = _.join(this.rolesLike, ',');
      }

      this.setUsers(action)
          .then(() => {
            this.loading = false;
          })
          .catch((error) => {
            console.error('Error fetching users:', error);
            this.loading = false;
          });

    }, 500),



    selectItem(us) {
      this.$emit('results', this.user);
      if (!this.leaveSelected) {
        this.users = [];
      }
      this.user = null;
    },
    capitalizeStatus(status) {
      return status.charAt(0).toUpperCase() + status.slice(1);
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
    facilityCleared() {
      this.filters.facility_id = null;
    },
    servicePointCleared(){
      this.filters.service_point_id= null;
    },

    async printLabel(item) {
      //morph the drug now to whats needed in the modal
      //let the drug have prescription deets
      this.initial_drug_data  = await this.visitObj.fetchDrugFromSaleDetails(item.sale_id)
      this.drug = this.initial_drug_data.data.data.drugs
      this.prescription = this.initial_drug_data.data.data.prescription
      this.visitObj.fetch(this.initial_drug_data.data.data.visit_id);
      this.visit_object = this.visitObj.fetchVisit(this.initial_drug_data.data.data.visit_id);
      this.dialogPrintLabel = true;
      this.pos_drug_name = item.product;
      if(item.status === 'Dispensed' || item.status === 'dispensed'){

        this.dispensing_quantity = item.qty

      }
      else{

        this.dispensing_quantity = null;

      }


    },

    uniqueSales() {
      if (this.sales && this.sales.data) {

        return this.sales.data.map(item => ({
          ...item,
          uniqueKey: `${item.sale_id}-${item.product}`,
        }));
      }
      return [];
    },
    url(page = 1) {
      // Build the query string, appending the page parameter
      const params = [
        `station_id=${this.filters.station_id}`,
        `start_date=${this.filters.start_date}`,
        `end_date=${this.filters.end_date}`,
        `status=${this.filters.status}`,
        `service_point_id=${this.filters.service_point_id}`,
        `cashier_id=${this.selected_cashier_id}`,
        `facility_id=${this.filters.facility_id}`,
        `product_id=${this.filters.product_id}`,
        `payment_mode=${this.filters.payment_mode}`,
        `page=${page}`
      ].join('&');

      return `/reports/product/pos-sales/report?${params}`;
    },

    export_url(page = 1) {
      // Build the query string, appending the page parameter
      const params = [
        `station_id=${this.filters.station_id}`,
        `start_date=${this.filters.start_date}`,
        `end_date=${this.filters.end_date}`,
        `status=${this.filters.status}`,
        `service_point_id=${this.filters.service_point_id}`,
        `cashier_id=${this.selected_cashier_id}`,
        `facility_id=${this.filters.facility_id}`,
        `product_id=${this.filters.product_id}`,
        `payment_mode=${this.filters.payment_mode}`,
        `page=${page}`,
        `export=1`,
      ].join('&');

      return `/reports/product/pos-sales/report?${params}`;
    },


    dispense(){
      const selectedItems = this.selectedItems; // From the v-data-table
      // Ensure that both products and stores are selected
      if (selectedItems.length === 0 ) {
        alert("Please select at least one product and one store.");
        return;
      }

      this.pos.dispenseItems(selectedItems)
          .then(() => {
            // After successfully dispensing, reload the data table
            this.init(); // This will re-fetch the sales data and update the table

            window.location.reload(); // This will reload the current page

          })
          .catch(error => {
            console.error('Error during dispensing:', error);
            alert("An error occurred while dispensing items.");
          });
    },

    process(){
      const selectedItems = this.selectedItems; // From the v-data-table
      // Ensure that both products and stores are selected
      if (selectedItems.length === 0 ) {
        alert("Please select at least one product and one store.");
        return;
      }

      this.pos.processItems(selectedItems)
          .then(() => {

            this.init(); // This will re-fetch the sales data and update the table

            window.location.reload(); // This will reload the current page

          })
          .catch(error => {
            console.error('Error during proessing:', error);
            alert("An error occurred while processing items.");
          });
    },

    setStartDate: function(datetime) {
      this.filters.start_date = datetime;
    },

    setEndDate: function(datetime) {
      this.filters.end_date = datetime;
    },

    navigate(page) {
      // Update the filters or state as needed for navigation
      this.filters.page = page; // Set the current page in filters
      this.init(); // Fetch the data for the specified page
    },

    productSelected(product) {
      this.placeholder = product.name;
      this.filters.product_id = product.id;
    },

    procedureSelected(procedure) {
      this.filters.service_id = procedure.id;
    },

    productCleared() {
      this.filters.product_id = null;
    },

    async init() {
      const url = this.url(this.filters.page || 1); // Use page from filters, default to 1
      try {
        const response = await axios.get(url);
        this.sales = response.data;

        if (this.sales && this.sales.data) {
          this.sales.data = this.sales.data.map(item => ({
            ...item,
            uniqueKey: `${item.sale_id}-${item.product}`, // Add uniqueKey to each item
          }));
        }
      } catch (error) {
        console.error('Error fetching POS sales:', error);
      }
    },

  },

  mounted() {

    this.setFacilities();
    
    // Initialize cashier search with empty search to load all cashiers
    this.searchItems('');

    if (this.visit_id) {
      this.filters.visit_id = this.visit_id;
    }
    this.init();
    this.uniqueSales();

  },
};
</script>
<style scoped>
.v-input--selection-controls__input{
  display:none !important
}
</style>
