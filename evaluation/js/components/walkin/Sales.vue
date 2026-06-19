<template>
    <v-card flat>
        <v-card-title>
            <h2 class="body-2 ma-0 pa-0">Sales listing</h2>
            <v-spacer></v-spacer>
            <collabmed-date-time-picker outline @input="setStartDate" :datetime="start_date" label="Start date"></collabmed-date-time-picker>

            <collabmed-date-time-picker outline @input="setEndDate" :datetime="end_date" label="End date"></collabmed-date-time-picker>

            <v-btn color="primary" @click="initializeResults()" style="margin-bottom: 10px;" large>filter</v-btn>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-data-table
                v-if="services"
                :headers="headers"
                :items="services.data"
                hide-default-footer
                class="elevation-1 mt-4"
        >
            <template v-slot:item.actions="{ item }">
                <v-btn small color="warning"
                       @click="printSale(item)">
                    Print details
                </v-btn>
                <v-btn small color="primary"
                       v-if="can('evaluation.ability_to_process_service_pos_sales')"
                       @click="receivePayment(item)">
                    Receive payment
                </v-btn>
                <v-btn small color="blue"
                       class="white--text"
                       v-if="can('evaluation.ability_to_process_service_pos_sales')"
                       @click="createInvoice(item)">
                    Create invoice
                </v-btn>
            </template>

            <template v-slot:footer>
                <collabmed-paginator v-if="services.meta" :meta="services.meta" @change="navigate" />
            </template>
        </v-data-table>
        <collabmed-loading v-else></collabmed-loading>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import moment from 'moment';

export default {
    props: [
        'nonPatient',
    ],

    data: () => ({
        page: 1,
        end_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        start_date: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        headers: [
            { text: 'Customer', value: 'customer' },
            { text: 'Amount', value: 'amount' },
            { text: 'Served By', value: 'served_by' },
            { text: 'Date', value: 'date' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    computed: {
        ...mapGetters({
            services: 'getServiceSales',
        }),
    },

    methods: {
        ...mapActions([
            'setServiceSales',
        ]),

        navigate(page) {
            this.page = page;
            this.initializeResults();
        },

        setStartDate: function(datetime) {
            this.start_date = datetime;
        },

        setEndDate: function(datetime) {
            this.end_date = datetime;
        },

        receivePayment(sale) {
            window.open(`/finance/cash/receive?patient_id=${sale.patient_id}`);
        },

        printSale(sale) {
            window.open(`/evaluation/services/commerce/${sale.id}/print`, '_blank');
        },

        createInvoice(sale) {
            window.open(route('finance.cash.action', { 'key': 'invoiced', 'action': 'create-invoice', 'patient_id': sale.patient_id }), '_blank');
        },

        initializeResults() {
            this.setServiceSales({
                page: this.page,
                params: {
                    type: this.nonPatient ? 'non_patient' : 'patient',
                    start_date: this.start_date,
                    end_date: this.end_date,
                },
            });
        },
    },

    mounted() {
        this.initializeResults();
    },
};
</script>
