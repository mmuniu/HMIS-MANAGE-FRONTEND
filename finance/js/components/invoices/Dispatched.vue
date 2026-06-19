<template>
    <v-card>
        <v-card-title>
            <filters @filtered="filterData" @clearFilters="clearFilters"></filters>
        </v-card-title>

        <v-card-text>

            <collabmed-loading v-if="!invoices.data || loading"></collabmed-loading>

            <finance-invoice-dispatches-list :invoices="invoices" v-else></finance-invoice-dispatches-list>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Filters from './partials/Filters';

export default {
    name: 'Dispatched',

    components: {
        Filters,
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
