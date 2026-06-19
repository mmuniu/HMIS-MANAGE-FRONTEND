<template>
    <div>
        <collabmed-loading v-if="!insurance"></collabmed-loading>

        <v-card v-else flat>
            <v-row>
                <v-col cols="12">
                    <filters filter-payment :company="insurance" @filtered="filterData" :url="url" :filename="filename"></filters>
                </v-col>
            </v-row>

            <collabmed-loading v-if="!invoices.data || loading"></collabmed-loading>

            <v-data-table
                    v-else
                    :items="invoices.data"
                    hide-default-footer
                    :headers="headers">
            </v-data-table>

            <v-card-text v-if="invoices.data">
                <v-row>
                    <v-col cols="12" md="2">
                        <span style="font-size: 15px; font-weight: bold">Total: {{ invoices.total_amount }}</span>
                    </v-col>
                    <v-col class="text-center" v-if="invoices.meta">
                        <v-pagination
                                v-model="page"
                                :length="invoices.meta.last_page"
                                circle
                                total-visible="8"
                        ></v-pagination>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-text>
                <v-col cols="12">
                    <collabmed-loading v-if="!invoicesGraphData.data || loading"></collabmed-loading>


                    <h4 style="text-decoration: underline">Schemes analysis</h4>

                    <v-data-table :headers="invoicesGraphData.headers"
                                  :items-per-page="5"
                                  :items="invoicesGraphData.data">
                        <template v-slot:item.amount="{ item }">
                            {{ item.amount | numberFormat }}
                        </template>
                    </v-data-table>
                </v-col>
            </v-card-text>

            <collabmed-loading v-if="!agingAnalysis.data"></collabmed-loading>

            <v-card-text v-else>
                <div>
                    <v-card-title style="font-size: 15px; font-weight: bold;" class="grey--text">
                        <h3>Aging analysis</h3>
                        <v-spacer></v-spacer>
                        <span class="text-right">Total: {{ agingAnalysis.total }}</span>
                    </v-card-title>

                    <v-row>
                        <v-col v-for="(analysis, index) in agingAnalysis.data" :key="index">
                            <p style="text-decoration: underline">{{ analysis.time }}</p>
                            <p>No. of records: {{ analysis.no_of_records }}</p>
                            <p>Total Amount: {{ analysis.amount }}</p>
                        </v-col>
                    </v-row>
                </div>
            </v-card-text>
        </v-card>

        <div  style="font-weight: bold; font-style: italic; ">
            <span>Please note: The data presented above in both
            the aging analysis and the scheme analytics is as per the filters provided above.
            </span> <br/>
            <span>The date filters are ignored though in when fetching the aging analyis</span>
        </div>
    </div>
</template>
<script>
import Filters from './Filters';
import { mapActions, mapGetters } from 'vuex';

export default {

    props: {
        insurance: {
            type: Object,
            required: true,
        },
    },

    components: {
        Filters,
    },

    data: () => ({
        page: 1,
        loading: false,
        filters: {},
        graph: null,
        filename: 'billed invoices',
        headers: [
            { text: 'Date', value: 'date' },
            { text: 'Invoice number', value: 'invoice_no' },
            { text: 'Firm', value: 'company' },
            { text: 'Scheme', value: 'scheme' },
            { text: 'Beneficiary', value: 'patient_name' },
            { text: 'Amount', value: 'amount' },
            { text: 'Claim No', value: 'claim_no' },
            { text: 'Policy No', value: 'policy_no' },
        ],
    }),

    computed: {
        ...mapGetters({
            invoices: 'getInsuranceInvoices',
            invoicesGraphData: 'getInsuranceInvoicesGraphData',
            agingAnalysis: 'getAgingAnalysis',
        }),

        url() {
            return `/api/finance/insuranceInvoices?page=1&insurance_account=true&company=${this.insurance.id}&type=billed`;
        },
    },

    watch: {
        page() {
            this.initialize('paginator');
        },


        invoices() {
            this.loading = false;
        },
    },

    methods: {
        ...mapActions({
            fetchInvoices: 'setInsuranceInvoices',
            fetchInvoicesGraphData: 'setInsuranceInvoicesGraphData',
            fetchAgingAnalysis: 'setAgingAnalysis',
        }),

        filterData(filters) {
            this.filters = filters;

            this.initialize();
        },

        prepareGraph(parameters) {
            parameters.graph = true;

            this.fetchInvoicesGraphData({
                params: parameters,
            });
        },

        async initialize(trigger = null) {
            this.loading = true;

            this.filters.company = this.insurance.id;
            this.filters.insurance_account = true;

            const parameters = this.filters;

            parameters.type = 'billed';

            await this.fetchInvoices({
                page: this.page,
                params: parameters,
            });

            if (trigger != 'paginator') {
                await this.prepareGraph(parameters);
            }
        },

        fetchSAgingAnalysis() {
            const parameters = this.filters;

            parameters.type = 'billed';

            this.fetchAgingAnalysis({
                params: parameters,
            });
        }
    },

    mounted() {
        this.filters.company = this.insurance.id;
        this.initialize();
        this.fetchSAgingAnalysis();
    },
};
</script>
