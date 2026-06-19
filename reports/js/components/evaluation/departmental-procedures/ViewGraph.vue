<template>
    <v-dialog v-model="dialog" max-width="50%">
        <template v-slot:activator="{ on }">
            <v-btn small color="primary" dark class="mb-2" v-on="on">view graph</v-btn>
        </template>
        <v-card>
            <v-card-title>
                <span class="headline">{{ graphTitle }}</span>
            </v-card-title>

            <v-card-text>
                <v-container>
                    <v-row >
                        <v-col cols="12" sm="6" md="12">
                            <summary-graph :graphData="graphData"/>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn small color="blue darken-1" text @click="close">close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
import Graph from "./Graph";

export default {

    props: {
        graphData: {
            type: Array,
        },
    },

    data: () => ({
        graphTitle: "Departmental Procedures Graph",
        dialog: false,
    }),

    components: {
        "summary-graph": Graph,
    },

    methods: {

        close() {
            this.dialog = false;
        },
    },

};
</script>
