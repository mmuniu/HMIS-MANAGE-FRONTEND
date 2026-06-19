<template>
  <div>

    <v-card>
      <v-card-title>
        <v-col cols="12" md="3" class="px-2">
          <v-autocomplete
              :items="facilities.facilities"
              outline
              v-model="filters.facility_id"
              color="blue-grey lighten-2"
              label="Select Facility"
              item-text="name"
              @input="filtersInfo()"
              clearable
              @click:clear="facilityCleared"
              item-value="id"
          ></v-autocomplete>
        </v-col>
        <v-col md="2" class="px-2">
          <v-btn small color="success" @click="filter()">Filter</v-btn>
        </v-col>
      </v-card-title>
      <v-card-title>
        <v-btn color="primary" @click="viewInvoices()">View invoices</v-btn>
        <v-spacer></v-spacer>
        <patient-search @patientSelected="searchPatient($event)"></patient-search>

        <!--                <v-btn class="mx-2" small color="primary" @click="filterTo('outpatient')">Outpatient</v-btn>-->
        <v-btn class="mx-2" small color="primary" @click="filterTo('inpatient')">Inpatient</v-btn>
        <v-btn class="mx-2" small color="primary" @click="filterTo('theatre')">Theatre</v-btn>
      </v-card-title>

      <v-card-text>
        <collabmed-loading v-if="!initialised"></collabmed-loading>

        <div v-else>
          <v-data-table  hide-default-footer  :headers="headers" :items="payments.data">
            <template v-slot:item.actions="{ item }">
              <v-btn v-if="item.has_pharmacy_bill" small color="warning" @click="processMeds(item)" :disabled="disableProcessMeds()">process meds</v-btn>
              <v-btn v-else disabled small color="warning">process meds</v-btn>
              <v-btn small color="primary" @click="bill(item)">receive payment</v-btn>
              <v-btn small color="info" v-if="hasCreateInvoicePermission"  @click="createInvoice(item)">
                create invoice</v-btn>
              <v-tooltip v-else bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                      small
                      color="info"
                      v-bind="attrs"
                      v-on="on">
                    Create Invoice
                  </v-btn>
                </template>
                <span>You do not have permission to access this resource</span>
              </v-tooltip>
              <v-btn small color="success" @click="viewAccount(item)">view account</v-btn>
            </template>
            <template v-slot:no-results>
              <v-alert :value="true" color="error" icon="warning">
                Your search for "{{ search }}" found no results.
              </v-alert>
            </template>
          </v-data-table>
          <collabmed-paginator v-if="payments.meta" :meta="payments.meta" @change="navigate" />

        </div>

      </v-card-text>
    </v-card>

  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import PatientSearch from '@reception/components/patients/PatientSearch.vue';
import { permissionsKey } from '@app/libs/Util';
import moment from "moment/moment";

export default {
  props: [
    'queueData',
  ],
  data: () => ({
    search: '',
    page: 1,
    pagination: {},
    filters: {
      facility_id: null,
    },
    headers: [
      { text: 'name', value: 'patient_name' },
      { text: 'ID Number', value: 'patient_idno' },
      { text: 'Date', value: 'created_at' },
      { text: 'Mobile', value: 'patient_mobile' },
      { text: 'Actions', value: 'actions' },
    ],
    fetch: [
      { text: 'Copay', value: 'copay' },
      { text: 'To cash', value: 'to_cash' },
    ],
    params: {
      'payment_mode': 'cash',
      'copay': 1,
      'to_cash': 1,
    },
  }),

  components: {
    PatientSearch,
  },

  computed: {
    ...mapGetters({
      payments: 'getCashPayments',
      facilities: 'getFacilities'

    }),

    initialised() {
      return this.payments.data ? true : false;
    },
    hasCreateInvoicePermission() {
      const userPermissions = JSON.parse(window.localStorage.getItem(permissionsKey));
      return this.hasPermission(userPermissions, 'finance.Create Invoice Button');
    },
  },

  methods: {
    navigate(page) {
      this.page = page;
      this.setCashPayments({
        page: this.page,
        params: {
          ...this.params,
          ..._.omitBy(this.filters, _.isNil),
        },
      });
    },
    ...mapActions([
      'setCashPayments','setFacilities'
    ]),

    disableProcessMeds() {
      return this.msetting('evaluation.disable_process_meds_at_pharmacy') === true;
    },
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
    filterTo(type) {
      this.params.type = type;

      this.initialize();
    },

    searchPatient(patient) {
      const patientId = patient ? patient.id : '';

      this.setCashPayments({
        page: 1,
        params: {
          'copay': 1,
          'patient_id': patientId,
        },
      });
    },

    bill(bill) {
      window.location.href = route('finance.cash.index', { key: 'receive', patient_id: bill.patient_id });
    },

    processMeds(bill) {
      window.location.href = route('finance.evaluation.pay.pharmacy', [bill.patient_id]) + '?visit=' + bill.visit_id;
    },

    viewAccount(bill) {
      window.location.href = route('finance.account.index', { 'patient_id': bill.patient_id, 'key': 'overview' });
    },

    viewInvoices() {
      window.location.href = route('finance.cash.index', { key: 'invoiced' });
    },

    createInvoice(bill) {
      window.location.href = route('finance.cash.action', { 'key': 'invoiced', 'action': 'create-invoice', 'patient_id': bill.patient_id });
    },

    initialize() {
      this.setCashPayments({
        page: this.page,
        params: this.params,
      });

    },
    filter(){
      this.loading = true;
      this.page = 1;

      const self = this;
      // Execute the asynchronous action without await
      const responsePromise = this.setCashPayments({
        page: this.page,
        params: _.omitBy(this.filters, _.isNil),
      });

      responsePromise.then((response) => {
        if (response) {
          self.loading = false;
        }
      }).catch((error) => {
        console.error('Error:', error);
        self.loading = false;
      });
    },
    hasPermission(userPermissions, permission) {
      return userPermissions.includes(permission);
    },
  },
  mounted() {
    this.initialize();
    this.setFacilities();

  },
};
</script>
