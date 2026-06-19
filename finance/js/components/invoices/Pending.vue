<template>
    <v-card>

        <v-card-title>
            <filters @filtered="filterData" @clearFilters="clearFilters" patient></filters>
        </v-card-title>

        <v-card-text>

            <collabmed-loading v-if="!invoices.data || loading"></collabmed-loading>

            <v-data-table
                    :headers="headers"
                    :items="invoices.data"
                    v-else
                    flat
                    class="elevation-1"
                    hide-default-footer
            >
                <template v-slot:item.name="{ item }">
                    {{ item.patient_name }} <br/>
                    <span class="grey--text" style="font-size: 11px;">{{ item.patient_no }}</span>
                </template>

                <template v-slot:item.visit_date="{ item }">
                    {{ item.visit_date }}<br/>
                    <span class="grey--text" style="font-size: 11px;"> Policy_no: {{ item.policy_number }}</span>
                </template>

                <template v-slot:item.company="{ item }">
                    {{ item.company }} <br/>
                    <span class="grey--text" style="font-size: 11px;">{{ item.scheme }}</span>
                </template>

                <template v-slot:item.amount="{ item }">
                    <v-btn small color="purple" outlined class="white--text"
                           @click="viewBills(item)"
                           >{{ item.unpaid_amount }}</v-btn>
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-btn small color="primary"
                           @click="bill(item)"
                           class="white--text" >
                        bill
                    </v-btn>
                    <v-btn small color="success" class="white--text"
                           @click="changeToCash(item)"
                           >change</v-btn>
                </template>

                <template v-slot:item.dollar="{ item }">
                    <v-btn small :disabled="!item.has_pharmacy_bill"
                           @click="processMeds(item)"
                           color="warning" class="white--text" >process meds</v-btn>

                    <v-btn small color="purple" class="white--text"
                           @click="splitBill(item)"
                           >split</v-btn>
                </template>

                <template slot="footer" v-if="invoices.links">
                    <v-row >
                        <v-col class="text-center" v-if="invoices.meta">
                            <v-pagination
                                    v-model="page"
                                    :length="invoices.meta.last_page"
                                    circle
                                    total-visible="8"
                            ></v-pagination>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Filters from './partials/Filters';

export default {
    name: 'Pending',

    components: {
        Filters,
    },

    data: () => ({
        filters: {},
        loading: false,
        page: 1,
        headers: [
            { text: 'Name', value: 'patient_name' },
            { text: 'Visit', value: 'visit_date' },
            { text: 'Branch', value: 'clinic' },
            { text: 'Company', value: 'company' },
            { text: 'Amount', value: 'amount' },
            { text: 'Actions', value: 'actions' },
            { text: '$', value: 'dollar', sortable: false },
        ],
    }),

    computed: {
        ...mapGetters({
            invoices: 'getInsuranceInvoices',
        }),
    },

    methods: {
        ...mapActions({
            fetchInvoices: 'setInsuranceInvoices',
        }),

        viewBills(visit) {
            window.open(`/finance/invoices/pending/action/view?visit_id=${visit.visit_id}`, '_self');
        },

        processMeds(visit) {
            window.open(`/finance/evaluation/pharmacy/${visit.patient_id}/1?visit=${visit.visit_id}`, '_self');
        },

        changeToCash(visit) {
            window.open(`/finance/invoices/pending/action/change-mode?visit_id=${visit.visit_id}`, '_self');
        },

        splitBill(visit) {
            window.open(`/finance/split-bill/${visit.visit_id}`, '_self');
        },

        bill(visit) {
            window.open(`/finance/invoices/pending/action/bill?visit_id=${visit.visit_id}`, '_self');
        },

        filterData(filters) {
            this.filters = filters;

            this.initialize();
        },

        clearFilters() {
            this.filters = {};

            this.initialize();
        },

        async initialize() {
            this.loading = true;

            const parameters = this.filters;

            parameters.type = 'pending';

            await this.fetchInvoices({
                page: this.page,
                params: parameters,
            });
        },
    },

    watch: {
        invoices() {
            this.loading = false;
        },

        page() {
            this.initialize();
        },
    },

    mounted() {
        this.initialize();
    },
};
</script>
