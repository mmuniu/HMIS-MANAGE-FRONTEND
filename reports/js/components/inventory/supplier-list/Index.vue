<template>
    <v-card>
        <v-card-title height="23">
            <h4>Suppliers List</h4>
            <v-spacer></v-spacer>
            <v-col cols="12" md="3">
                <div class="mx-2">
                    <v-text-field
                            v-model="search"
                            append-icon="search"
                            label="Search"
                            single-line
                            hide-details
                    ></v-text-field>
                </div>
            </v-col>
        </v-card-title>
        <supplier-list :obj="obj" @filter="performFilter()"></supplier-list>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <template>
            <v-data-table
                    :headers="list.headers"
                    :items="list.data"
                    class="elevation-1"
                    :rows-per-page-items="rowsPerPageItems"
                    :pagination.sync="pagination"
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
        "supplier-list": Filter,
    },

    data: () => ({
        search: "",
        module: "inventory",
        decoratorKey: "supplier-list",
        rowsPerPageItems: [30, 60, 100,
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
