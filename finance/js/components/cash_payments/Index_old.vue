<template>
    <div>

        <v-card>
            <v-card-title>
                <v-btn color="primary" @click="viewInvoices()">View invoices</v-btn>
                <v-spacer></v-spacer>

              <patient-search @patientSelected="searchPatient($event)"></patient-search>

<!--                <v-btn class="mx-2" small color="primary" @click="filterTo('outpatient')">Outpatient</v-btn>-->
                <v-btn class="mx-2" small color="primary" @click="filterTo('inpatient')">Inpatient</v-btn>
                <v-btn class="mx-2" small color="primary" @click="filterTo('theatre')">Theatre</v-btn>
            </v-card-title>
          <filters @filtered="filterData" @clearFilters="clearFilters" patient></filters>

            <v-card-text>
                <collabmed-loading v-if="!initialised"></collabmed-loading>

                <div v-else>
                    <v-data-table disable-pagination hide-default-footer  :headers="headers" :items="payments.data">
                       <template v-slot:item.actions="{ item }">
                           <v-btn v-if="item.has_pharmacy_bill" small color="warning" @click="processMeds(item)">process meds</v-btn>
                           <v-btn v-else disabled small color="warning">process meds</v-btn>
                           <v-btn small color="primary" @click="bill(item)">receive payment</v-btn>
                           <v-btn small color="info" @click="createInvoice(item)">create invoice</v-btn>
                           <v-btn small color="success" @click="viewAccount(item)">view account</v-btn>
                       </template>
                        <template v-slot:no-results>
                            <v-alert :value="true" color="error" icon="warning">
                                Your search for "{{ search }}" found no results.
                            </v-alert>
                        </template>
                    </v-data-table>
                </div>

            </v-card-text>
        </v-card>

    </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
// import Filter from "@finance/components/cash_payments/Filter";
import Filters from './Filter';

import PatientSearch from '@reception/components/patients/PatientSearch.vue';

export default {
    props: [
        'queueData',
    ],
    data: () => ({
        search: '',
        page: 1,
        pagination: {},
      filters: {},
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
        }
    }),

    components: {
        PatientSearch,
        Filters,
    },

    computed: {
        ...mapGetters({
            payments: 'getCashPayments',
        }),

        initialised() {
            return this.payments.data ? true : false;
        },
    },

    methods: {
        ...mapActions([
            'setCashPayments',
        ]),
      filterData(filters) {
        this.filters = filters;

        this.page = 1;

        this.initialize();
      },

      clearFilters() {
        this.filters = {};
        this.initialize();
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
              params: this.filters,
              //params: this.params,
            });
        }
    },
    mounted() {
        this.initialize();
    },
};
</script>
