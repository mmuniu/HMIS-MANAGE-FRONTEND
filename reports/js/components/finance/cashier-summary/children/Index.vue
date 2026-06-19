<template>
    <div>
        <v-card>
            <v-card-title height="23">
                <h4>Cashier Summary</h4>
            </v-card-title>
            <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>
            <v-alert
                    :value="true"
                    color="success"
                    outlined
            >
                <p>Cash: {{ list.cash }}.</p>
                <p>Cheque: {{ list.cheque }}.</p>
                <p>Mpesa: {{ list.mpesa }}.</p>
                <p>Card: {{ list.card }}.</p>
                <p>Totals: {{ list.total_amount }}.</p>
            </v-alert>

            <collabmed-floating-loader v-if="list.length < 1 || obj.form.loading"></collabmed-floating-loader>

            <template v-else>
                <v-data-table
                        :headers="cashier_info_headers"
                        :items="list.data"
                        class="elevation-1"
                        hide-default-footer
                >
                    <template v-slot:item.actions="{ item }">
                        <v-btn small color="primary" @click="viewDetails(item)">view</v-btn>
                    </template>
                    <template slot="footer">
                        <v-row  class="py-2 pb-2">
                            <v-col cols="3" class="pt-3 pl-3">
                                Total records count: {{ list.meta.total }}
                            </v-col>

                            <v-col cols="6" class="text-center">
                                <v-pagination
                                        v-model="page"
                                        :length="list.meta.last_page"
                                        circle
                                        :total-visible="totalVisible"
                                ></v-pagination>
                            </v-col>
                        </v-row>
                    </template>
                </v-data-table>
            </template>
        </v-card>
    </div>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";

export default {

    mixins: [
        reportsMixin,
    ],

    data: () => ({
        module: "finance",
        decoratorKey: "cashier-summary",
        page: 1,
        totalVisible: 8,
        filename: "Cashier Summary breakdown",
        cashier_info_headers: [
            { text: "Cashier", value: "cashier", sortable: false },
            { text: "Amount", value: "amount", sortable: false },
            { text: "Receipt", value: "receipt" },
            { text: "Patient", value: "patient" },
            { text: "Mode", value: "mode" },
            { text: "Time", value: "time" },
            { text: "Actions", value: "", sortable: false },
        ],
    }),

    computed: {
        url() {
            return "/api/reports/module/finance/cashier-summary?excel=true";
        },

        filteredHeaders() {
            const data = [];
            _.map(this.cashier_info_headers, (item) => {
                if (item.text != "#") {
                    data.push(item);
                }
            });

            return data;
        },

        filterInfo() {
            const filters_data = _.omitBy(this.$route.query, _.isNil);

            const filters_text = {};

            _.map(filters_data, function(val, key) {
                if (val && key != "child") {
                    filters_text[key.replace("_", " ")] = val;
                }
            });

            return filters_text;
        },
    },

    methods: {
        viewDetails(item) {
            window.open(`/finance/evaluation/payment_details/${item.id}`, "_blank");
        },
    },

    watch: {
        page(val) {
            this.obj.filters = _.omitBy(this.$route.query, _.isNil);

            this.obj.performFilter(this.module, this.decoratorKey, val);
        },
    },

    created() {
        this.processing_child = true;

        this.obj.filters = _.omitBy(this.$route.query, _.isNil);

        this.obj.performFilter(this.module, this.decoratorKey);
    },
};
</script>
