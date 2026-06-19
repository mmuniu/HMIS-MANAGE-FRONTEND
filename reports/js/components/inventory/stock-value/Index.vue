<template>
    <v-card>
        <v-card-title height="23">
            <h4>Stock value</h4>
        </v-card-title>
        <stock-value-filter :obj="obj" @filter="performFilter"></stock-value-filter>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <template>
            <v-data-table
                    hide-default-footer
                    :headers="list.headers"
                    :items="list.data"
                    class="elevation-1"
                    :footer-props="{
                    'items-per-page-options': [10, 25, 50, 100],
                  }"
            >
            </v-data-table>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </template>

        <v-container>
            <v-row  v-if="list.summary" class="font-weight-black">
                <v-col>Total stock value: {{ numberWithCommas(list.summary.total_stock_value) }}</v-col>
                <v-col>Total stock quantities: {{ numberWithCommas(list.summary.current_quantities) }}</v-col>
                <v-col>Total selling price: {{ numberWithCommas(list.summary.selling_price) }}</v-col>
                <v-col>Total insurance price: {{ numberWithCommas(list.summary.insurance_price) }}</v-col>
            </v-row>
        </v-container>
    </v-card>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";

export default {

    mixins: [
        reportsMixin,
    ],

    data: () => ({
        module: "inventory",
        decoratorKey: "stock-value",
    }),

    components: {
        "stock-value-filter": Filter,
    },

    methods: {
        navigate(page) {
            this.get(page);
        },

        numberWithCommas(x) {
            if (x === undefined || x === null) {
                return "0";
            }
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    },
};
</script>
