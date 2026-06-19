<template>
    <div>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
        <v-card>
            <v-card-title height="23">
                <h4>Departmental Procedures</h4>
                <v-spacer></v-spacer>
                <departmental-procedure-graph :graphData="list.data"></departmental-procedure-graph>
            </v-card-title>

            <patients-procedures-filter :obj="obj"  @filter="performFilter"></patients-procedures-filter>

            <v-data-table
                    :headers="list.headers"
                    :items="list.data"
                    class="elevation-1"
                    hide-default-footer
            >
                <template v-slot:item.actions="{ item }">
                    <div class="my-2">
                        <v-btn small color="primary" @click="view(item)" dark>view more</v-btn>
                    </div>
                </template>
                <template v-slot:footer>
                    Total Procedures performed in various departments: <strong>{{ list.total_quantity }}</strong>
                </template>
            </v-data-table>
        </v-card>
    </div>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";
import Graph from "./ViewGraph";


export default {

    mixins: [
        reportsMixin,
    ],

    data: () => ({
        decoratorKey: "departmental-procedures",
        module: "evaluation",
    }),

    components: {
        "patients-procedures-filter": Filter,
        "departmental-procedure-graph": Graph,
    },

    methods: {
        view(department) {
            const filters = this.obj.filters;

            filters.type = department.type;

            let request_data = "?child=true&";

            _.map(filters, (item, key) => {
                request_data = request_data + key + "=" + item + "&";
            });

            request_data = request_data + "total_filter_quantity=" + department.quantity;

            window.open(`/reports/module/evaluation/departmental-procedures${request_data}`, "_blank");
        },
    },
};
</script>
