<template>
    <div>
        <v-card flat>
            <v-card-title>
                <h4>Stock Movement Report</h4>
            </v-card-title>

            <stock-movement-filters :obj="obj" @filter="performFilter"></stock-movement-filters>

            <v-card-text>
                <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
                <template>
                <v-data-table
                        :headers="list.headers"
                        hide-default-footer
                        :items="list.data"
                        class="elevation-1"
                >
                </v-data-table>
                        <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
            </template>
            </v-card-text>
    
        </v-card>
    </div>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filters from "./Filters";

export default {
    title: "Stock Movement",

    mixins: [
        reportsMixin,
    ],

    components: {
        "stock-movement-filters": Filters,
    },

    data: () => ({
        loaded: false,
        route_params: null,
        decoratorKey: "stock-movement",
        module: "inventory",
    }),

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>
