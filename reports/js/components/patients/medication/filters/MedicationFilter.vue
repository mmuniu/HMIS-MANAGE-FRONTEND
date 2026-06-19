<template>
    <v-container class="spacing-playground py-0 px-3">
        <v-row >
            <v-col md="3">
                <users-search
                        @results="setDoctor"
                ></users-search>
            </v-col>

            <v-col md="2">
                <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
            </v-col>

            <v-col md="2">
                <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
            </v-col>

            <v-col>
                <v-btn large color="success" @click="filterContent()">Filter</v-btn>
                <download-excel
                        class="v-btn v-btn--large theme--light primary small"
                        :fetch  = "fetchData"
                        :before-generate = "startDownload"
                        :before-finish = "finishDownload"
                        name="patient_medication_report.xls"
                >
                    Excel
                </download-excel>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import moment from "moment";
import { mapActions, mapGetters } from "vuex";

export default {
    name: "reports-cash-filters",
    data: () => ({
        filters: {
            start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
            end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
            doctor: null,
        },

    }),
    computed: {
        ...mapGetters({
            medication: "getPatientMedication",
        }),
    },
    methods: {
        ...mapActions([
            "setPatientMedication",
        ]),

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },

        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        setDoctor(doctor) {
            // console.log(cashier.id);
            this.filters.doctor = doctor.id;
        },

        async fetchData() {
            const params = _.omitBy(this.filters, _.isNil);

            try {
                const response = await axios.get(route("api.reports.patients.medication"), { params: params });

                this.loading = false;

                return response.data.data;
            } catch (error) {
                alert("Your search has crashed due to the large number of records fetched. Try and chunk the results");

                location.reload();

                this.loading = false;
            }
        },

        startDownload() {
            this.loading = true;
        },

        finishDownload() {
            this.loading = false;
        },

        filterContent() {
            this.setPatientMedication({
                params: this.filters,
            });
        },

        mounted() {
            this.filterContent();
        },
    },
};
</script>
