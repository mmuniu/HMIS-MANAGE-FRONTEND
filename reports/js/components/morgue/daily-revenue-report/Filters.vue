<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row>
                <v-col md="2" class="px-2">
                    <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="2" class="px-2">
                    <collabmed-date-time-picker small outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>

                <v-col>
                    <v-btn color="success" @click="filter()">Filter</v-btn>
                    <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
<!--                    <download-to-csv :headers="obj.reportData.headers" :data="obj.reportData.data" :filename="filename"></download-to-csv>-->
<!--                    <download-to-pdf :headers="obj.reportData.headers" :data="obj.reportData.data" :filename="filename"></download-to-pdf>-->
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
<script>
import moment from "moment";

export default {
    name: "morgue-revenue-filter",

    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    data: () => ({
        loading: false,
        search: "",
        filename: "Morgue revenue Report",
        filters: {
            start_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
            end_date: moment(new Date()).endOf('day').format("YYYY-MM-DD HH:MM"),
        },
    }),

    computed: {
        url() {
            return "/api/reports/module/morgue/daily-revenue-report";
        },

    },

    methods: {
        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },

        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        filter() {
            this.obj.filters = _.omitBy(this.filters, _.isNil);

            this.$emit("filter");
        },
    },

    mounted() {
        window.events.$on("STORE_SET_ACTION_LOADING", (val) => {
            this.loading = val;
        });
    },
};
</script>
