<template>
    <div>
        <v-card>
            <v-card-title height="23">
                <h4>Hypertension Reports</h4>
            </v-card-title>

            <hypertension-filter :obj="obj" @filter="performFilter"></hypertension-filter>
            <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

            <v-data-table
                    hide-default-footer
                    :headers="list.headers"
                    :items="list.data"
                    class="elevation-1"
            >
                <template v-slot:item.medications="{ item }">
                        <span v-for="(prescription, index) in item.medications" :key="index">
                            {{prescription}}
                        </span>
                </template>
            </v-data-table>
            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
    </div>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";

export default {

    mixins: [
        reportsMixin,
    ],

    components: {
        "hypertension-filter": Filter,
    },

    data: () => ({
        module: "evaluation",
        decoratorKey: "hypertension-patients",
    }),

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>
