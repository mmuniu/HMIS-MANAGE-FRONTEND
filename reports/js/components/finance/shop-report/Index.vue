<template>
    <v-card>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <v-card-title>
            <h4>Shop Reports</h4>
        </v-card-title>
        <shop-filter :obj="obj" @filter="performFilter"></shop-filter>
        <template>
            <v-data-table
                    :headers="list.headers"
                    :items="list.data"
                    class="elevation-1"
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

    mixins: [
        reportsMixin,
    ],

    components: {
        "shop-filter": Filter,
    },

    data: () => ({
        module: "finance",
        decoratorKey: "shop-report",
    }),

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>
