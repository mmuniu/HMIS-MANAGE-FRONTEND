<template>
    <div>
        <v-card-title>
            <v-row>
                <v-col cols="12">
                    <filters :company="insurance" @filtered="filterData" :url="url" :filename="filename"></filters>
                </v-col>
            </v-row>
        </v-card-title>

        <v-card-text>

            <collabmed-loading v-if="!invoices.data || loading"></collabmed-loading>

            <finance-invoice-dispatches-list :invoices="invoices" v-else></finance-invoice-dispatches-list>

            <v-row>
                <v-col cols="12" md="2">
                    <span style="font-size: 15px; font-weight: bold">Total: {{ invoices.total_amount }}</span>
                </v-col>
            </v-row>
        </v-card-text>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Filters from './Filters';

export default {
    name: 'Dispatched',

    components: {
        Filters,
    },

    props: {
        insurance: {
            type: Object,
            required: true,
        },
    },

    data: () => ({
        page: 1,
        filters: {},
        loading: false,
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

            this.filters.company = this.insurance.id;

            this.filters.insurance_account = true;

            const parameters = this.filters;

            parameters.type = 'dispatched';

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
