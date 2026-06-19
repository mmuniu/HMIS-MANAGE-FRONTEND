<template>
    <v-card>
        <v-card-title height="23" class="pt-2 text-center">
            <h4>Departmental Procedures Performed</h4>
        </v-card-title>

        <collabmed-floating-loader v-if="list.length < 1 || obj.form.loading"></collabmed-floating-loader>

        <v-alert
                :value="true"
                color="success"
                small
                outline
        >
            <strong>
                <small>Your selection is based on the following:</small>
                <h6 v-for="(key, value) in filterInfo" :key="key">
                    <span>{{ value + ': ' + key }}</span><br/>
                </h6>
            </strong>
        </v-alert>

        <div v-if="list.data">
            <v-card-title>
                <download-to-pdf :headers="filteredHeaders" :data="list.data" :filename="filename" :title="report_title"></download-to-pdf>
                <download-to-csv :headers="filteredHeaders" :data="list.data" :filename="filename"></download-to-csv>
                <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>
            </v-card-title>
            <template v-if="list.data.length > 0">
                <v-data-table
                        :headers="filteredHeaders"
                        :items="list.data"
                        class="elevation-1"
                        hide-default-footer
                >
                    <template slot="footer">
                        <v-row  class="py-2 pb-2">
                            <v-col cols="3" class="pt-3 pl-3">
                                <!--                                    Total records count: {{ list.meta.total }}-->
                            </v-col>

                            <v-col cols="6" class="text-center">
                                <v-pagination
                                        v-model="page"
                                        :length="list.meta.last_page"
                                        circle
                                        :total-visible="totalVisible"
                                ></v-pagination>
                            </v-col>

                        </v-row>
                    </template>
                </v-data-table>
<!--                <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />-->
            </template>
        </div>

    </v-card>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";


export default {
    mixins: [
        reportsMixin,
    ],

    data: () => ({
        decoratorKey: "departmental-procedures",
        module: "evaluation",
        page: 1,
        totalVisible: 4,
        filename: "Patients Procedures Report",
        report_title: "procedure summary report",
        revenue_info_headers: [
            { text: "Patient", value: "patient" },
            { text: "Procedure", value: "procedure" },
            { text: "Date", value: "date" },
        ],
    }),

    methods: {
        navigate(page) {
            this.get(page);
        },
    },

    watch: {
        page(val) {
            this.obj.filters = _.omitBy(this.$route.query, _.isNil);

            this.obj.performFilter(this.module, this.decoratorKey, val);
        },
    },

    computed: {
        url() {
            return "/api/reports/module/evaluation/departmental-procedures";
        },

        filteredHeaders() {
            const data = [];
            _.map(this.revenue_info_headers, (item) => {
                if (item.text != "#") {
                    data.push(item);
                }
            });

            return data;
        },

        filterInfo() {
            const filters_data = _.omitBy(this.$route.query, _.isNil);

            const filters_text = {};

            _.map(filters_data, function(val, key) {
                if (val && key != "child") {
                    filters_text[key.replace("_", " ")] = val;
                }
            });

            return filters_text;
        },
    },

    created() {
        this.processing_child = true;

        this.obj.filters = _.omitBy(this.$route.query, _.isNil);

        this.obj.performFilter(this.module, this.decoratorKey);
    },
};
</script>
