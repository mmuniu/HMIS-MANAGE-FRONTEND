<template>
  <v-card class="pa-0" color="transparent" flat>
    <v-card-text class="py-0 my-0">
      <v-row  >
        <v-col md="3" class="px-2">
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
        <v-col md="2" class="px-2">
          <users-search
              @results="setCashier"
              leaveSelected
              @clearedSelected="clearedCashier()"
          ></users-search>
        </v-col>

        <v-col cols="12" md="2" class="px-2">
          <v-autocomplete
              :items="paymentModes"
              outline
              color="blue-grey lighten-2"
              v-model="filters.payment_mode"
              label="Payment mode"
              item-text="text"
              item-value="value"
              clearable
              @click:clear="paymentModeCleared()"
          ></v-autocomplete>
        </v-col>

        <v-col md="2" class="px-2">
          <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
        </v-col>

        <v-col md="2" class="px-2">
          <collabmed-date-time-picker small outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
        </v-col>
      </v-row>
      <v-row >
        <v-col>
          <v-btn small color="success" @click="filter()">Filter</v-btn>
          <download-to-csv :headers="obj.reportData.headers" :data="obj.reportData.data" :filename="filename" :extratitle="extraTitles"></download-to-csv>
          <download-to-excel :filters="filters" :url="url" :filename="filename" :extratitle="extraTitles"></download-to-excel>
          <download-to-pdf :headers="cashier_info_headers" :data="obj.reportData.data" :filename="filename" :extratitle="extraTitles"></download-to-pdf>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
import moment from 'moment';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'cashier-filters',

  props: {
    obj: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    loading: false,
    search: '',
    filename: 'Cashier Collections Report',
    cashier_info_headers: [
      { 'text': 'Cashier', 'value': 'cashier', 'sortable': false },
      { 'text': 'Amount', 'value': 'amount', 'sortable': true },
    ],
    filters: {
      start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:MM'),
      end_date: moment(new Date()).format('YYYY-MM-DD HH:MM'),
      cashier_id: '',
      payment_mode: null,
      // facility_id: ''
    },
    cashier_name: '',
    facility_name: '',
    clinic_name: '',
    selectedFacilityName: '',
    selectedCashierName:''
  }),

  computed: {
    ...mapGetters({
      facilities: 'getFacilities',
      users: 'getUsers',
    }),

    paymentModes() {
      return [
        { text: 'Cash', value: 'cash' },
        { text: 'M pesa', value: 'mpesa' },
        { text: 'Credit card', value: 'card' },
        { text: 'Cheque', value: 'cheque' },
      ];
    },

    extraTitles() {
      return {
        start_date: this.filters.start_date,
        end_date: this.filters.end_date,
        main_facility_title: this.msetting('core.set_single_name_to_appear_on_printouts'),
        facility: this.selectedFacilityName ?this.selectedFacilityName : '',
        cashier: this.selectedCashierName ?this.selectedCashierName :'',
      };
    },

    url() {
      return '/api/reports/module/finance/cashier-summary';
    },
  },
  watch: {
    'filters.facility_id': function(newVal, oldVal) {
      if (newVal !== oldVal) {
        // Find the selected facility name
        const selectedFacility = this.facilities.facilities.find((facility) => facility.id === newVal);
        if (selectedFacility) {
          this.selectedFacilityName = selectedFacility.name;
        }
      }
    },
  },
  methods: {
    ...mapActions([
      'setFacilities', 'setUsers',
    ]),

    clearedCashier() {
      this.filters.user_id = null;
    },

    facilityCleared() {
      this.filters.facility_id = null;
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
      this.selectedCashierName = cashier.full_name;
    },

    async fetchData() {
      const params = _.omitBy(this.filters, _.isNil);

      try {
        const response = await axios.get(route('api.reports.payments.cash'), { params: params });

        this.loading = false;

        return response.data.data;
      } catch (error) {
        alert('Your search has crashed due to the large number of records fetched. Try and chunk the results');

        location.reload();

        this.loading = false;
      }
    },

    startDownload() {
      this.loading = true;
    },

    finishDownload() {
      this.loading = false;
    },

    async fetchReportDetails() {
      const details_response = await axios.get(route('api.reports.payments.report-details'));
      this.cashier_name = details_response.data.cashier;
      this.facility_name= details_response.data.facility;
      this.clinic_name = details_response.data.clinic;
    },
    filter() {
      this.obj.filters = _.omitBy(this.filters, _.isNil);

      this.$emit('filter');
    },
  },

  mounted() {
    this.setFacilities();
    this.setUsers();
    this.fetchReportDetails();

    window.events.$on('STORE_SET_ACTION_LOADING', (val) => {
      this.loading = val;
    });
  },
};
</script>
