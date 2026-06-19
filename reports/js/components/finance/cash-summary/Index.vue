<template>
    <v-card flat>
        <v-card-title height="23" class="pt-2 text-center">
            <h4>Cash Summary</h4>
            <v-spacer></v-spacer>
            <cash-summary-graph :graphData="list.data"></cash-summary-graph>
        </v-card-title>

        <revenues-search  :obj="obj" @filter="performFilter"></revenues-search>


        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

        <v-card>
            <v-data-table hide-default-footer :headers="list.headers" :items="list.data" class="elevation-1">
                <template v-slot:item.actions="{ item }">
                    <v-btn outline small color="indigo" @click="view(item)">
                        <i class="fa fa-eye"></i> &nbsp; view more info
                    </v-btn>
                </template>
                <template v-slot:footer>
                    Total Amount: <strong>{{ list.total_amount }}</strong>
                </template>
            </v-data-table>
        </v-card>
    </v-card>

</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filters from "./Filters";
import Graph from "./ViewGraph";

export default {
    title: "Cash Summary",

    mixins: [
        reportsMixin,
    ],

    components: {
        "revenues-search": Filters,
        "cash-summary-graph": Graph,
    },

    data: () => ({
        decoratorKey: "cash-summary",
        module: "finance",
    }),

    methods: {
        view(department) {
            const filters = this.obj.filters;

            console.log(this.list);

            filters.type = department.type;

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_filter_amount=" + department.amount;

            window.open(`cash-summary${request_data}`, "_blank");
        },
    },
};
</script>
