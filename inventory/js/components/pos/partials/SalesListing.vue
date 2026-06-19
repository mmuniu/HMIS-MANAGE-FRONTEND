<template>
    <v-card flat>
        <collabmed-loading v-if="!initialised"></collabmed-loading>

        <div v-else class="mt-3">
            <v-card-title class="subheading grey-text text-darken-2">
                <h2 class="body-2 ma-0 pa-0">All sales made today </h2>
                <v-spacer></v-spacer>

<!--                <patient-search @patientSelected="selectedPatient($event)"></patient-search>-->

                <collabmed-date-time-picker outline @input="setStartDate"
                                            :datetime="start_date"
                                            label="Start date">
                </collabmed-date-time-picker>

                <collabmed-date-time-picker outline @input="setStartDate"
                                            :datetime="start_date" label="Start date">
                </collabmed-date-time-picker>

                <v-btn color="primary" @click="initializeResults()">filter</v-btn>

                <download-to-excel :filters="{}" :url="url()" :filename="filename"
                                   requestType="get"
                ></download-to-excel>
            </v-card-title>

            <template>
                <v-data-table
                        :headers="headers"
                        :items="sales.data"
                        class="elevation-1"
                >
                    <template v-slot:item.status="{ item }">
                        <span v-if="item.status === 'Paid'" style="color: green">{{ item.status }}</span>
                        <span v-if="item.status === 'Pending'" style="color: red">{{ item.status }}</span>
                        <span v-if="item.status === 'Invoiced'" style="color: green">{{ item.status }}</span>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <v-btn v-if="can('inventory.make-pos-sales')"
                               small color="success"
                               @click="viewSale(item)">
                            view
                        </v-btn>

                        <v-menu transition="slide-y-transition" bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn small color="warning" dark v-on="on">
                                    Print
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-tile>
                                    <v-btn small
                                           color="teal"
                                           v-if="can('inventory.make-pos-sales')"
                                           @click="pos.printBill(item.id)">
                                        Print A4
                                    </v-btn>
                                </v-list-tile>
                                <v-list-tile>
                                    <v-btn small
                                           color="warning"
                                           v-if="can('inventory.make-pos-sales')"
                                           @click="pos.printBillThermal(item.id)">
                                        Print thermal
                                    </v-btn>
                                </v-list-tile>
                            </v-list>
                        </v-menu>

                        <v-btn small color="primary"
                               :disabled="item.status === 'Paid' === 'Paid' || item.status === 'Invoiced'"
                               @click.once="pos.processPayment(item.id)"
                               v-if="can('inventory.receive-pos-payments')">
                            Process payment
                        </v-btn>

                        <v-btn small color="blue"
                               class="white--text"
                               v-if="can('evaluation.ability_to_process_service_pos_sales')"
                               @click="createInvoice(item)">
                            Create invoice
                        </v-btn>
                        <!--<v-btn v-if="can('inventory.receive-pos-payments')"
                               :disabled="item.status === 'Paid' || item.status === 'Invoiced'"
                               small color="primary"
                               @click="viewSale(item)">
                            process payment
                        </v-btn>-->
                    </template>

                    <template v-slot:footer>
                        <v-row>
                            <v-col cols="12" class="ml-4">
                                <hr/>
                                <div>Total paid: <span class="font-weight-bold">{{  sales.paid_total | numberFormat}}</span></div>
                                <div>Total pending: <span class="font-weight-bold">{{ sales.pending_total | numberFormat }}</span></div>
                            </v-col>
                        </v-row>
                    </template>

                    <template v-slot:no-results>
                        <v-alert :value="true" color="error" icon="warning">
                            Your search for "{{ search }}" found no results.
                        </v-alert>
                    </template>
                </v-data-table>
            </template>
        </div>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import moment from "moment";
// import PatientSearch from "@reception/components/patients/PatientSearch.vue";
import Pos from "@inventory/libs/pos/Pos";

export default {
    props: [
        "station",
    ],

    components: {
        // PatientSearch,
    },

    data: () => ({
        search: null,
        pos: new Pos(),
        filename: 'sales',
        start_date: moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
        end_date: moment().format("YYYY-MM-DD HH:mm:ss"),
        headers: [
            { text: "Date", value: "date" },
            { text: "Customer", value: "customer" },
            { text: "Amount", value: "amount" },
            { text: "Payment Mode", value: "payment_mode" },
            { text: "station", value: "station" },
            { text: "Status", value: "status" },
            { text: "User", value: "user.full_name" },
            { text: "Actions", value: "actions" },
        ],
    }),

    computed: {
        ...mapGetters({
            sales: "getInventoryPosSales",
        }),

        initialised() {
            return this.sales ? true : false;
        },
    },

    methods: {
        ...mapActions([
            "setInventoryPosSales",
        ]),

        url () {
            const params = 'station_id=' + this.station.id + '&start_date=' + this.start_date + '&end_date=' + this.end_date;

            return '/api/inventory/inventoryPosSales?' + params;
        },

        viewSale(item) {
            return window.location.href = route("inventory.point-of-sale.view.sale", item.id );
        },

        createInvoice(sale) {
            const queryString = window.location.search;

            const urlParams = new URLSearchParams(queryString);

            window.open(route('finance.cash.action', {
                'key': 'invoiced',
                'action': 'create-invoice',
                'patient_id': sale.customer_id,
                'source': urlParams.get('type'),
            }), '_blank');
        },

        setStartDate: function(datetime) {
            this.start_date = datetime;
        },

        setEndDate: function(datetime) {
            this.end_date = datetime;
        },

        initializeResults() {
            this.setInventoryPosSales({
                params: {
                    station_id: this.station.id,
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
