<template>
    <v-card>
        <v-card-title>
            Departmental Patients Visits
            <v-spacer></v-spacer>
            <patients-visit-graph :graphData="list.data"></patients-visit-graph>
        </v-card-title>
        <patients-visits-filter :obj="obj" @filter="performFilter" />
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <v-card-text class="py-0 my-0">
            <v-row>
                <v-col cols="12">
                    <v-alert :value="true" color="success mx-5" outlined>
                        Total visits: {{ list.total_visits }}
                    </v-alert>
                </v-col>
            </v-row>
        </v-card-text>
        <template>
            <v-card-text v-if="list.data.length > 1" class="py-0 my-0">
                <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                    hide-details></v-text-field>
            </v-card-text>
            <v-spacer></v-spacer>
            <v-data-table :headers="list.headers" :items="list.data" :search="search" class="elevation-1">
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

    data: () => ({
        module: "evaluation",
        decoratorKey: "departmental-visits",
        search: '',
        rowsPerPageItems: [
            10,
            20,
            30,
            {
                text: "$vuetify.dataIterator.rowsPerPageAll",
                value: -1,
            },
        ],
        pagination: {
            rowsPerPage: 10,
        },
    }),

    components: {
        "patients-visits-filter": Filter,
        "patients-visit-graph": Graph,
    },
};
</script>
