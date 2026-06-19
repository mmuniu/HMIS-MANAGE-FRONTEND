<template>
    <div>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <v-card>
            <v-card-title height="23">
                <h4>Lab TAT Report</h4>
            </v-card-title>

            <lab-tat-report-filters :obj="obj" @filter="performFilter"></lab-tat-report-filters>
            <v-data-table
                flat
                disable-pagination
                hide-default-footer
                :headers="list.headers"
                            :items="list.data"
                    >
                    </v-data-table>

            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
    </div>

</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filters from './Filters';

export default {
    title: "Lab TAT Report",

    mixins: [
        reportsMixin,
    ],
    components: {
        "lab-tat-report-filters": Filters,
    },
    data: () => ({
        decoratorKey: "lab-tat-report",
        module: "evaluation",
    }),

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>
