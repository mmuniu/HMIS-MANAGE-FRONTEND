<template>
    <div>
        <time-filter  :obj="obj" @filter="performFilter"></time-filter>
        <v-card>
            <v-card-title height="23">
                <h4>Revenue Summary</h4>
            </v-card-title>
            <collabmed-loading v-if="!list.data"></collabmed-loading>
            <v-card-text v-else>
                <v-data-table hide-default-footer :headers="list.headers" :items="list.data" class="elevation-1">
                    <template v-slot:item.quantity="{ item }">{{item.quantity ? item.quantity : 'Unavailable'}}</template>
                    <template v-slot:item.amount="{ item }">{{item.amount ? item.amount : 'Unavailable'}}</template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </div>

</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";
// import Detail from "./Detail";

export default {
    title: "Revenues Report Information",

    mixins: [
        reportsMixin,
    ],

    components: {
        "time-filter": Filter,
        // "detail-view": Detail,
    },

    data: () => ({
        decoratorKey: "revenues-income-information",
        module: "finance",
        type: null,
    }),

    methods: {
        mounted() {
            this.type = this.$route.query.type;
        },
    },
};
</script>
