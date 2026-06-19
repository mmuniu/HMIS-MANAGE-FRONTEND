<template>
    <v-card>
        <v-card-title height="23">
            <h4>Purchase Report</h4>
            <v-spacer></v-spacer>
            <v-col md="3" class="px-2">
                <v-text-field
                        v-model="search"
                        append-icon="search"
                        label="Search"
                        single-line
                        hide-details
                ></v-text-field>
            </v-col>
        </v-card-title>
        <purchase-filter :obj="obj" @filter="performFilter"></purchase-filter>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <template>
            <v-data-table
                    :headers="list.headers"
                    :items="list.data"
                    class="elevation-1"
                    :options.sync="options"
                    :footer-props="{
                      'items-per-page-options': [10, 25, 50, 100],
                    }"
                    :search="search"
            >
            </v-data-table>
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
        "purchase-filter": Filter,
    },

    data: () => ({
        module: "inventory",
        search: "",
        decoratorKey: "purchase-report",
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['created_at'],
        sortDesc: [true],
      },
        rowsPerPageItems: [10, 20, 30,
            {
                text: "$vuetify.dataIterator.rowsPerPageAll",
                value: -1,
            }],
        pagination: {
            rowsPerPage: 10,
        },
    }),

    methods: {
        loadSavedFilters() {
            const savedFilters = localStorage.getItem('purchase-report-filters');
            if (savedFilters) {
                this.obj.filters = JSON.parse(savedFilters);
            }
        }
    },

    created() {
        this.loadSavedFilters();
    },
};
</script>
