<template>
    <v-card-title>
        <v-spacer/>

        <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>

        <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>

        <v-select label="Status"
                  :items="['Pending', 'Authorized', 'Cancelled']"
                  class="mx-2"
                  v-model="filters.status"
        ></v-select>

        <v-text-field label="Receipt No"
                      class="mx-2"
                      v-model="filters.receipt"
                      clearable
        ></v-text-field>

        <patient-search label="Search customer"
                        placeholder="" @patientSelected="selectedPatient($event)">
        </patient-search>

        <v-btn small color="success" @click="filter()">Filter</v-btn>
        <download-to-csv :headers="obj.reportData.headers" :data="obj.reportData.data" :filename="filename"></download-to-csv>
        <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
    </v-card-title>
</template>
<script>
import moment from "moment";
import PatientSearch from '@reception/components/patients/PatientSearch.vue';
import _ from "lodash";

export default {
    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    components: {
        PatientSearch,
    },

    data() {
        return {
            filename: "Credit Note Report",
            loading: false,
            search: "",
            filters: {
                start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
                end_date: moment(new Date()).endOf('day').format("YYYY-MM-DD HH:MM"),
                status: null,
                patient_id: null,
                receipt: null,
            },
        };
    },

    computed: {
        url() {
            return "/api/reports/module/finance/credit-note-report";
        },
    },

    methods: {
        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },
        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        selectedPatient(patient) {
            this.filters.patient_id = patient ? patient.id : null;
        },

        filter() {
            this.obj.filters = _.omitBy(this.filters, _.isNil);

            this.$emit("filter");
        },
    },

    mounted() {
    },
};
</script>
