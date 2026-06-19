<template>
    <div>
        <v-card>
            <v-card-title height="23">
                <h4>Eabl Wheel Report</h4>

                <v-spacer/>
                <v-row >
                    <v-col>
                        <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
                    </v-col>
                </v-row>
            </v-card-title>

<!--            <patients-seen-filter :obj="obj" @filter="performFilter"></patients-seen-filter>-->
            <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

            <v-data-table hide-default-footer
                          :headers="list.headers"
                          disable-pagination
                          :items="list.data"
                          class="elevation-1">
            </v-data-table>

            <collabmed-paginator v-if="list.meta" :meta="list.meta" @change="navigate" />
        </v-card>
    </div>

</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
// import Filter from "./Filters";

export default {

    mixins: [
        reportsMixin,
    ],

    components: {
        // "patients-seen-filter": Filter,
    },

    data: () => ({
        module: "evaluation",
        decoratorKey: "eabl-wheel-report",
        filters: {},
        filename: 'eabl report',
        url: '/api/reports/module/evaluation/eabl-wheel-report',
    }),

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>
