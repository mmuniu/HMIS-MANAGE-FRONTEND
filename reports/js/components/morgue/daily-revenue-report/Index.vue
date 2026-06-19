<template>
    <v-card>
        <v-card-title>
            <h3>Daily revenue report morgue</h3>
        </v-card-title>

        <morgue-revenue-filter :obj="obj" @filter="performFilter()"></morgue-revenue-filter>


        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <v-data-table
            v-else
            hide-default-footer
            disable-pagination
            :headers="list.headers"
            :items="list.data"
            class="elevation-1"
        >
        </v-data-table>
        <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
    </v-card>
</template>
<script>
import Filter from "./Filters";
import { reportsMixin } from "@reports/libs/reportsMixin";

export default {
    mixins: [
        reportsMixin,
    ],

    components: {
        "morgue-revenue-filter": Filter,
    },


    data: () => ({
        module: "morgue",
        decoratorKey: "daily-revenue-report",
    }),

    methods: {
        navigate(page) {
            this.get(page);
        },
    },
}
</script>
