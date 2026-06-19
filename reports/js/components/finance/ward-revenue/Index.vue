<template>
    <v-card>
        <v-card-title height="23">
            <h4>Ward Revenue</h4>
            <v-spacer></v-spacer>
            <ward-revenue-graph :graphData="list.data"></ward-revenue-graph>
        </v-card-title>
        <ward-revenue-filter :obj="obj" @filter="performFilter()"></ward-revenue-filter>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <template>
            <v-data-table
                    hide-default-footer
                    :headers="list.headers"
                    :items="list.data"
                    class="elevation-1"
            >
            </v-data-table>
        </template>
    </v-card>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";
import Graph from "./ViewGraph";

export default {

    mixins: [
        reportsMixin,
    ],

    components: {
        "ward-revenue-filter": Filter,
        "ward-revenue-graph": Graph,
    },

    data: () => ({
        module: "finance",
        decoratorKey: "ward-revenue",
    }),

    methods: {
        viewMore(data) {
            const filters = this.obj.filters;

            filters.total_revenue = data.total_revenue;

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "ward_id=" + data.ward_id;

            window.open(`ward-revenue${request_data}`, "_blank");
        },
    },
};
</script>
