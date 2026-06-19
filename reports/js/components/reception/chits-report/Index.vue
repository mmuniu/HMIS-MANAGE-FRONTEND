<template>
    <div>
        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

        <v-card>
            <v-card-title height="23">
                <h4>Chits report</h4>
                <v-spacer></v-spacer>
            </v-card-title>

            <chits-report-filter :obj="obj" @filter="performFilter"></chits-report-filter>

            <div>
                <v-data-table
                        :headers="list.headers" :items="list.data"
                        flat hide-default-footer
                >
                </v-data-table>
            </div>
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

        data() {
            return {
                module: "reception",
                decoratorKey: "chits-report",
            };
        },

        components: {
            "chits-report-filter": Filter,
        },

        methods: {
            navigate(page) {
                this.get(page, this.obj.filters);
            },
        },
    };
</script>
