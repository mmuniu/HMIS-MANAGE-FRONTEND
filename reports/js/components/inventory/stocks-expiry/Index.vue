<template>
    <v-card>
        <v-card-title height="23">
            <h4>Expiry Report</h4>
            <v-spacer></v-spacer>
            <v-col md="4" class="px-2">
                <v-text-field
                        v-model="localSearch"
                        append-icon="search"
                        label="Search"
                        single-line
                        hide-details
                ></v-text-field>
            </v-col>
        </v-card-title>
        <stocks-filter :obj="obj" @filter="performFilter"></stocks-filter>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <template>
            <v-data-table
                    :headers="list.headers"
                    :items="list.data"
                    class="elevation-1"
                    :search="localSearch"
                    :rows-per-page-items="rowsPerPageItems"
                    :pagination.sync="pagination"
            >
            </v-data-table>
<!--            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />-->
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
        "stocks-filter": Filter,
    },

    data: () => ({
        localSearch: "",
        module: "inventory",
        decoratorKey: "stocks-expiry",
        rowsPerPageItems: [10, 20, 30,
            {
                text: "$vuetify.dataIterator.rowsPerPageAll",
                value: -1,
            }],
        pagination: {
            rowsPerPage: 10,
        },
    }),
};
</script>
