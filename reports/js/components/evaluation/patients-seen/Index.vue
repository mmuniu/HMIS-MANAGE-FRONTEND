<template>
    <div>
        <v-card>
            <v-card-title height="23">
                <h4>Patients Seen</h4>
            </v-card-title>

            <patients-seen-filter :obj="obj" @filter="performFilter"></patients-seen-filter>
            <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

            <v-data-table hide-default-footer
                          :headers="list.headers"
                          :items="list.data"
                          class="elevation-1">
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
        "patients-seen-filter": Filter,
    },

    data: () => ({
        module: "evaluation",
        decoratorKey: "patients-seen",
    }),

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>
