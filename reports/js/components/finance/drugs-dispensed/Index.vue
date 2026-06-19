<template>
    <div>
        <v-card>
            <v-card-title height="23">
                <h4>Drugs Dispensed</h4>
            </v-card-title>
            <drugs-dispensed-filter :obj="obj" @filter="performFilter"></drugs-dispensed-filter>
            <collabmed-floating-loader v-if="list.length < 1 || obj.form.loading"></collabmed-floating-loader>
            <template>
                <v-data-table
                        :headers="list.headers"
                        :items="list.data"
                        class="elevation-1"
                        hide-default-footer
                >

                    <template v-slot:footer>
                       <v-row>
                           <v-col cols="6">
                               Total Quantity: <strong>{{ list.total_quantity }}</strong>
                           </v-col>
                           <v-col cols="6">
                               Total Amount:  <strong> Ksh. {{ list.total_amount }}</strong>
                           </v-col>
                       </v-row>
                    </template>
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
    title: "Drugs Dispensed Report",

    mixins: [
        reportsMixin,
    ],

    data: () => ({
        module: "finance",
        decoratorKey: "drugs-dispensed",
    }),

    components: {
        "drugs-dispensed-filter": Filter,
    },
    methods: {
        navigate(page) {
            this.get(page);
        },
    },
};
</script>
