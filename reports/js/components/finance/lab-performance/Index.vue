<template>
    <v-card>
        <v-card-title height="23">
            <h4>Lab Performance</h4>
        </v-card-title>
        <lab-filters :obj="obj" @filter="performFilter()"></lab-filters>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <div>
            <v-alert
                    class="mx-4"
                    :value="true"
                    color="success"
                    outlined
            >
                Total Amount: {{ list.total_amount }}
            </v-alert>
        </div>
        <template>
            <v-data-table
                    hide-default-footer
                    :items-per-page="25"
                    :headers="list.headers"
                    :items="list.data"
            >
                <template v-slot:items="props">
                    <td>{{ props.index + 1 }}</td>
                    <td>{{ props.item.procedure }}</td>
                    <td>{{ props.item.amount }}</td>
                    <td>{{ props.item.patient }}</td>
                </template>
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
        "lab-filters": Filter,
    },

    data: () => ({
        module: "finance",
        decoratorKey: "lab-performance",
    }),

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>
