<template>
    <v-card>
        <v-card-title height="23">
        <h4>Theatre Monthly Performance</h4>
        </v-card-title>

        <procedures-search :obj="obj" @filter="performFilter()" />

        <collabmed-floating-loader v-if="saveLoader" />

        <template>
            <v-data-table
                :headers="list.headers"
                :items="list.data"
                class="elevation-1"
                :items-per-page="15"
                hide-default-footer
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
    name: "TheatreMonthlyPerformanceReport",

    mixins: [reportsMixin],

    data: () => ({
      module: "evaluation",
      decoratorKey: "theatre-monthly-performance",
    }),

    components: {
        "procedures-search": Filter,
    },
    
    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>

