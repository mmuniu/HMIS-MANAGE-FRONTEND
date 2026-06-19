<template>
    <v-card>
        <v-card-title height="23">
            <h4>Supplier Report</h4>
        </v-card-title>
        <suppliers-filter :obj="obj" @filter="performFilter()"></suppliers-filter>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <template>
            <v-data-table
                    hide-default-footer
                    :headers="list.headers"
                    :items="list.data"
                    class="elevation-1"
            >
            </v-data-table>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </template>
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
        decoratorKey: "suppliers-report",
    }),

    components: {
        "suppliers-filter": Filter,
    },

    methods: {
        navigate(page) {
            this.get(page);
        },
    },
};
</script>
