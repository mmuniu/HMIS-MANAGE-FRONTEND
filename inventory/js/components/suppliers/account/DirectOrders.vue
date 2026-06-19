<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <div v-else>
        <v-card flat style="padding: 0">

            <v-card-text>
                <v-row>
                    <v-col cols="12" md="2">
                        <div class="mx-2">
                            <v-text-field label="Invoice number" outline v-model="filters.invoice_number"></v-text-field>
                        </div>
                    </v-col>

                    <v-col md="2">
                        <collabmed-date-time-picker outline @input="setStartDate" dateOnly :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                    </v-col>

                    <v-col md="2">
                        <collabmed-date-time-picker outline @input="setEndDate" dateOnly :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                    </v-col>

                    <v-col>
                        <v-btn @click="filter()" large color="success">filter</v-btn>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-text v-if="invoices.data">
                <v-data-table
                        :headers="headers"
                        :items="invoices.data"
                        hide-default-footer
                        class="mb-2"
                        flat
                >
                    <template v-slot:item.comments="{ item }">
                        <v-btn v-if="item.grns.length > 0"
                               :href="`/inventory/goods-received-notes/${item.grns[0].id}`"
                               color="cyan"
                               class="caption"
                               dark
                        >
                            View Details
                        </v-btn>
                    </template>
                    <template slot="footer" v-if="invoices.links">
                        <v-row  class="pt-3">
                            <v-col cols="4" class="mt-3 ml-3">
                                Total records: {{ invoices.meta.total }}
                            </v-col>

                            <v-col cols="8" class="text-right">
                                <v-pagination
                                        v-model="page"
                                        :length="invoices.meta.last_page"
                                        circle
                                        :total-visible="8"
                                ></v-pagination>
                            </v-col>
                        </v-row>
                    </template>

                </v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import moment from "moment";

export default {

    props: [
        "userId", "supplier_id",
    ],

    data () {
        return {
            page: 1,
            headers: [
                { text: "Invoice number", value: "number" },
                { text: "Amount", value: "amount" },
                { text: "Invoice Date", value: "invoice_date" },
                { text: "User", value: "user" },
                { text: "Created At", value: "created_at.date" },
                { text: "Comments", value: "comments" },
            ],

            filters: {
                start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
                end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
                invoice_number: null,
                type: "direct_order",
                supplier_id: this.$route.params.supplier_id,
            },
        }
    },

    watch: {
        page(value) {
            const params = _.omitBy(this.filters, _.isNil);

            this.setInvoices({
                page: value,
                params: params,
            });
        },
    },

    computed: {
        ...mapGetters({
            invoices: "getInvoices",
        }),

        initialised() {
            return !!this.invoices;
        },
    },

    methods: {
        ...mapActions([
            "setInvoices",
        ]),

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },
        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        filter() {
            this.filters.supplier_id = this.supplier_id;

            const params = _.omitBy(this.filters, _.isNil);

            this.setInvoices({ params: params });
        },
    },

    mounted() {
        const invoice_id = this.$route.query.invoice_id;

        this.setInvoices({
            params: {
                type: "direct_order",
                supplier_id: this.supplier_id,
            },
        });
    },
};
</script>
