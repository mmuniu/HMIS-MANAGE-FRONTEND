<template>
    <v-card>
        <v-card-title height="23">
            <h4>Credits report</h4>
            <v-spacer></v-spacer>
        </v-card-title>

        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

        <credits-report-filter :obj="obj" @filter="performFilter()"></credits-report-filter>

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

export default {

    mixins: [
        reportsMixin,
    ],

    components: {
        "credits-report-filter": Filter,
    },

    data: () => ({
        module: "finance",
        decoratorKey: "credit-report",
    }),
};
</script>
