<template>
    <v-card>
        <v-card-title height="23">
            <h4>Credit Note report</h4>
            <v-spacer></v-spacer>
        </v-card-title>

        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

        <credit-note-report-filter :obj="obj" @filter="performFilter()"></credit-note-report-filter>
        <hr/>
        <template>
            <v-data-table
                hide-default-footer
                :headers="list.headers"
                :items="list.data"
                class="elevation-1">
                <template v-slot:item.actions="{ item }">
                    <v-btn small color="primary" @click="viewDetails(item)">view more</v-btn>
                  </template>
            </v-data-table>
        </template>

        <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
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
        "credit-note-report-filter": Filter,
    },

    data: () => ({
        module: "finance",
        decoratorKey: "credit-note-report",
    }),

    methods :{
        viewDetails(item) {
      window.open(`/finance/evaluation/credit_note_details/${item.id}`, '_blank');
    },
    }
};
</script>
