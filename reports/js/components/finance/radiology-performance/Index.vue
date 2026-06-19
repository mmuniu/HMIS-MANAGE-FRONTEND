<template>
    <v-card>
        <v-card-title height="23">
            <h4>Radiology Performance</h4>
        </v-card-title>
        <radiology-filters :obj="obj" @filter = "performFilter()"></radiology-filters>
        <div>
            <v-alert
                    :value="true"
                    color="success"
                    outlined
            >
                Total Amount: {{ list.total_amount }}
            </v-alert>
        </div>
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
        module: "finance",
        decoratorKey: "radiology-performance",
    }),

    components: {
        "radiology-filters": Filter,
    },

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>
