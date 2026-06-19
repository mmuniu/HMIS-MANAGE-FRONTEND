<template>
    <v-card>
        <v-card-title height="23">
            <h4> Inpatient Revenue </h4>
        </v-card-title>
        <patient-search :obj="obj" @filter="performFilter()"></patient-search>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <template>
            <v-data-table
                    hide-default-footer
                    :headers="list.headers"
                    :items="list.data"
                    class="elevation-1"
                    :loading="saveLoader"
            >
                <template v-slot:item.actions="{ item }" class="text-right">
                    <v-btn @click="viewMore(item)" small round outline color="primary" dark>view more</v-btn>
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
        "patient-search": Filter,
    },

    data: () => ({
        patient_id: null,
        module: "finance",
        decoratorKey: "inpatient-revenue",
    }),

    methods: {
        navigate(page) {
            this.get(page);
        },

        viewMore(data) {
            const filters = this.obj.filters;

            // filters.type = department.type;

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "visit_id=" + data.visit;

            window.open(`inpatient-revenue${request_data}`, "_blank");
        },
    },

};
</script>
