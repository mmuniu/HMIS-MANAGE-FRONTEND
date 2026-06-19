<template>
    <div>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <v-card>
            <v-card-title height="23">
                <h4>Cashier Summary</h4>
            </v-card-title>

            <cashier-summary-filter :obj="obj"  @filter="performFilter"></cashier-summary-filter>

            <v-alert
                    :value="true"
                    color="success"
                    outlined
            >
                Total amount: {{ list.totals }}
            </v-alert>

            <v-data-table
                    :headers="cashier_info_headers"
                    :items="list.data"
                    class="elevation-1"
                    hide-default-footer
            >
                <template v-slot:item.actions="{ item }">
                    <div class="my-2">
                        <v-btn outline small color="primary" @click="view(item)" dark>view more</v-btn>
                    </div>
                </template>
                <template v-slot:footer>
                    Total Amount: <strong>{{ list.totals }}</strong>
                </template>
            </v-data-table>
        </v-card>
    </div>
</template>
<script>
import Filter from "./Filters";
import { reportsMixin } from "@reports/libs/reportsMixin";

export default {

    mixins: [
        reportsMixin,
    ],

    data: () => ({
        module: "finance",
        decoratorKey: "cashier-summary",
        cashier_info_headers: [
            { text: "Cashier", value: "cashier", sortable: false },
            { text: "Amount", value: "amount", sortable: true },
            { text: "Action", value: "action", sortable: false },
        ],
    }),

    components: {
        "cashier-summary-filter": Filter,
    },

    computed: {
        filteredHeaders() {
            const data = [];
            _.map(this.cashier_info_headers, (item) => {
                if (item.text != "#") {
                    data.push(item);
                }
            });

            return data;
        },
    },

    methods: {
        view(cash) {
            const filters = this.obj.filters;

            filters.cashier_id = cash.cashier_id;

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_filter_amount=" + cash.amount;

            window.open(`/reports/module/finance/cashier-summary${request_data}`, "_blank");
        },
    },
};
</script>
