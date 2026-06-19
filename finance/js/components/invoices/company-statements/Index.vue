<template>
    <v-card flat>
        <filters @filtered="filterData" @clearFilters="clearFilters" patient></filters>

        <collabmed-loading v-if="!insCompanies.data || loading"></collabmed-loading>

        <div v-else>
            <v-data-table
                    :headers="headers"
                    disable-pagination
                    flat
                    hide-default-footer
                    :items="insCompanies.data.data"
                    class="elevation-1"
            >
                <template v-slot:item.total="{ item }">
                    {{ item.total | numberFormat }}
                </template>

                <template v-slot:item.paid="{ item }">
                    {{ item.paid | numberFormat }}
                </template>

                <template v-slot:item.balance="{ item }">
                    {{ item.balance | numberFormat }}
                </template>

                <template v-slot:item.actions="{ item }">
                    <a :href="`/finance/insurance-company/${item.id}/account/billed-invoices`">
                        <v-btn small color="primary" outlined>view</v-btn>
                    </a>
                </template>
            </v-data-table>
        </div>

        <v-row class="px-6 py-3" v-if="insCompanies.data">
            <v-col cols="10" class="text-center">
                <collabmed-paginator v-if="insCompanies.meta" :meta="insCompanies.meta" @change="navigate" ></collabmed-paginator>
            </v-col>
        </v-row>

        <div>
            <v-container v-if="insCompanies.data">
                <v-row  style="font-weight: bold" class="pb-4">
                    <v-col cols="12" md="4">
                        <span>Total amount: </span>
                        <span>{{ insCompanies.data.analysis.total }}</span>
                    </v-col>
                    <v-col cols="12" md="4">
                        <span>Paid: </span>
                        <span>{{ insCompanies.data.analysis.paid_total }}</span>
                    </v-col>
                    <v-col cols="12" md="4">
                        <span>Total Balance: </span>
                        <span>{{ insCompanies.data.analysis.total_balance }}</span>
                    </v-col>
                </v-row>
            </v-container>
        </div>
    </v-card>
</template>
<script>
import Filters from './Filters';
import { mapActions, mapGetters } from 'vuex';

export default {
    components: {
        Filters,
    },

    data: () => ({
        page: 1,
        filters: {},
        loading: false,
        headers: [
            { text: 'Name', value: 'name', sortable: false },
            { text: 'Total', value: 'total' },
            { text: 'Paid', value: 'paid' },
            { text: 'Balance', value: 'balance' },
            // { text: "Waivers", value: "waivers"},
            { text: 'Actions', value: 'actions', sortable: false },
        ],
    }),

    computed: {
        ...mapGetters({
            insCompanies: 'getInsCompanies',
        }),
    },

    methods: {
        ...mapActions({
            fetchInsCompanies: 'setInsCompanies',
        }),

        filterData(filters) {
            this.filters = filters;

            this.page = 1;

            this.initialize();
        },

        clearFilters() {
            this.filters = {};

            this.initialize();
        },

        navigate(page) {
            this.page = page;
            this.initialize();
        },

        async initialize() {
            this.loading = true;

            const parameters = this.filters;

            parameters.type = 'pending';

            await this.fetchInsCompanies({
                page: this.page,
                params: this.filters,
            });
        },
    },

    watch: {
        insCompanies() {
            this.loading = false;
        },
    },

    mounted() {
        this.initialize();
    },
};
</script>
