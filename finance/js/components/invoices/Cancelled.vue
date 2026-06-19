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
                    class="elevation-1"
                    hide-default-footer
            >
                <template v-slot:item.invoice="{ item }">
                    <a :href="`/finance/invoice/view/${item.id}/show`" target="_blank">{{ item.invoice_no }}</a> <br/>

                    <span class="grey--text" style="font-size: 11px;">{{ item.date }}</span> <br/>
                    <v-chip @click="viewInvoice(item)" outlined v-if="!item.patient_signature" color="error" small> not signed</v-chip>
                    <v-chip outlined v-else color="success" small>signed</v-chip>
                </template>

                <template v-slot:item.patient_name="{ item }">
                    {{ item.patient_name }}<br/>
                    <span class="grey--text" style="font-size: 11px;"> {{ item.patient_no }}</span> <br/>
                    <span class="grey--text" style="font-size: 11px;">Id No: {{ item.patient_id_no }}</span> <br/>
                </template>

                <template v-slot:item.company="{ item }">
                    {{ item.company }} <br/>
                    <span class="grey--text" style="font-size: 11px;">{{ item.scheme }}</span>
                </template>

                <template v-slot:item.amount="{ item }">
                    <v-btn small color="purple" outlined class="white--text"
                           @click="viewBills(item)"
                           rounded> {{ item.amount }} </v-btn>
                </template>

                <template v-slot:item.status="{ item }">
                    <v-chip color="default" small> Cancelled </v-chip>
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-btn small color="primary"
                           class="white--text"
                           :disabled="!item.unbilled"
                           @click="undoCancellation(item.id)" outlined rounded>
                        undo
                    </v-btn>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn outlined
                                    rounded
                                    small
                                    color="error"
                                    v-on="on"
                                    v-bind="attrs"
                                    class="mx-0"
                                    @click="unbillItems(item)">
                                unbill items
                            </v-btn>
                        </template>
                        <span>Remove items within the invoice, process is irreversible</span>
                    </v-tooltip>
                </template>
            </v-data-table>
        </v-card-text>

        <v-card-text v-if="invoices.data">
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
        </v-card-text>
    </v-card>
</template>
<script>
import Invoice from '@finance/libs/invoices/Invoice';
import { mapActions, mapGetters } from 'vuex';
import Filters from './partials/Filters';
import { _ } from 'vue-underscore';

export default {
    name: 'Cancelled',

    components: {
        Filters,
    },

    data: () => ({
        page: 1,
        filters: {},
        loading: false,
        invoice: new Invoice(),
        headers: [
            { text: 'Invoice', value: 'invoice' },
            { text: 'Name', value: 'patient_name' },
            { text: 'Company', value: 'company' },
            { text: 'Amount', value: 'amount' },
            { text: 'Status', value: 'status' },
            { text: 'Actions', value: 'actions' },
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

        viewInvoice(invoice) {
            window.open(`/finance/invoice/view/${invoice.id}/show`);
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

            parameters.type = 'cancelled';

            await this.fetchInvoices({
                page: this.page,
                params: parameters,
            });
        },

        async undoCancellation( invoice_id ) {
            const response = await this.invoice.undoInvoiceCancellation(invoice_id);

            if (response) {
                this.initialize();
            }
        },

        async unbillItems (invoice) {
            if(confirm('Are you sure you want to unbill the items as well. Please note that this process cannot be undone.')) {
                const response = await this.invoice.unbillItems(invoice);

                if(response) {
                    await this.initialize();
                }
            }
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
