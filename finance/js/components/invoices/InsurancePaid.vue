<template>
    <v-card flat>

        <v-card-title>
            <filters @filtered="filterData" @clearFilters="clearFilters"  account></filters>
        </v-card-title>

        <v-card-text>

            <collabmed-loading v-if="!cheques.data || loading"></collabmed-loading>

            <v-data-table
                    :headers="headers"
                    :items="cheques.data.data"
                    v-else
                    hide-default-footer
            >
                <template v-slot:item.actions="{ item }">
                    <v-btn small color="primary" @click="viewInvoices(item)">view respective invoices</v-btn>
                    <v-btn small color="info"  @click="printReceipt(item)">print receipt</v-btn>
<!--                    <v-btn small color="info"  @click="deleteCheque(item)">print receipt</v-btn>-->
                </template>
            </v-data-table>
        </v-card-text>

        <v-card-text v-if="cheques.data">
            <v-row >
                <v-col class="text-center" v-if="cheques.meta">
                    <v-pagination
                            v-model="page"
                            :length="cheques.meta.last_page"
                            circle
                            total-visible="8"
                    ></v-pagination>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Filters from './partials/Filters';

export default {
    name: 'Insurance-paid',

    props: [
        'company', 'account',
    ],

    components: {
        Filters,
    },

    data: () => ({
        page: 1,
        filters: {},
        loading: false,
        headers: [
            { text: 'Company', value: 'company' },
            { text: 'Name', value: 'name' },
            { text: 'Number', value: 'number' },
            { text: 'Bank', value: 'bank' },
            { text: 'Amount', value: 'amount' },
            { text: 'Transacted By', value: 'transacted_by' },
            { text: 'Date', value: 'date' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    computed: {
        ...mapGetters({
            cheques: 'getInsuranceInvoices',
        }),
    },

    methods: {
        ...mapActions({
            fetchCheques: 'setInsuranceInvoices', // naming checks don't get confused: (got lazy)
        }),

        viewInvoices(cheque) {
            window.open(`/finance/invoices/insurance-paid/action/view?cheque_id=${cheque.id}`);
        },

        printReceipt(payment) {
            window.open(`/finance/insurance-payment/${payment.id}/print-receipt`);
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

            parameters.type = 'insurance-paid';
            parameters.company = this.$route.params.insuranceId;

            await this.fetchCheques({
                page: this.page,
                params: parameters,
            });
        },
    },

    watch: {
        cheques(val) {
            if (val.data) {
                this.loading = false;
            }
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

