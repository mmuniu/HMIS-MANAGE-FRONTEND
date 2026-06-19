<template>
    <div>
        <v-card>
            <v-card-title height="23">
                <h4>Insurance Summary</h4>
            </v-card-title>
            <insurance-summary-filter :obj="obj" @filter="performFilter()"></insurance-summary-filter>
            <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
            <template>
                <v-data-table
                        :headers="list.headers"
                        :items="list.data"
                        class="elevation-1"
                        hide-default-footer
                         :items-per-page="-1"
                >
                </v-data-table>
                <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
            </template>
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

    data: () => ({
        module: "finance",
        decoratorKey: "insurance-summary",
    }),

    components: {
        "insurance-summary-filter": Filter,
    },
    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },

      
    },
};
</script>
