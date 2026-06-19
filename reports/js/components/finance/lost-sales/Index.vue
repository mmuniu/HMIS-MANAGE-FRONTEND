<template>
    <v-card>
        <v-card-title height="23">
            <h4>Lost sales report</h4>
            <v-spacer></v-spacer>
<!--            <inpatient-performance-graph :graphData="list.data"></inpatient-performance-graph>-->
        </v-card-title>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <lost-sales-filter :obj="obj" @filter="performFilter()"></lost-sales-filter>


        <div>
            <v-alert
                    :value="true"
                    color="success"
                    outlined
            >
                <p>Total Amount: {{ list.total | numberFormat  }}</p>
            </v-alert>
        </div>

        <hr/>

        <template>
            <v-data-table
                    hide-default-footer
                    :headers="list.headers"
                    :items="list.data"
                    class="elevation-1"
            >
            </v-data-table>
        </template>

        <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
    </v-card>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";
// import Graph from './ViewGraph'

export default {

    mixins: [
        reportsMixin,
    ],

    components: {
        "lost-sales-filter": Filter,
        // 'inpatient-performance-graph': Graph
    },

    data: () => ({
        module: "finance",
        decoratorKey: "lost-sales",
    }),
};
</script>
