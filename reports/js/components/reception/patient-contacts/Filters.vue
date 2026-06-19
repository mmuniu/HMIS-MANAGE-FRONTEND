<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row  >
                <v-col cols="12" md="3" class="px-2">
                    <v-autocomplete
                            :items="facilities.facilities"
                            outline
                            v-model="filters.facility_id"
                            color="blue-grey lighten-2"
                            label="Select Facility"
                            item-text="name"
                            clearable
                            @click:clear="facilityCleared"
                            item-value="id"
                            @input="facilitySelected"
                    ></v-autocomplete>
                </v-col>
                <!--<v-flex xs12 md2>
                    <div class="mx-2">
                        <patient-search outline @patientSelected="patientSelected"></patient-search>
                    </div>
                </v-flex>-->

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>
            </v-row>
            <v-row  >

                <v-col>
                    <v-btn @click="filter()" small color="success">filter</v-btn>
                    <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
                    <download-to-csv :headers="obj.reportData.headers" :data="obj.reportData.data" :filename="filename"></download-to-csv>
                    <download-to-pdf :headers="obj.reportData.headers" :data="obj.reportData.data" :filename="filename"></download-to-pdf>
                </v-col>

                <collabmed-floating-loader v-if="loading"></collabmed-floating-loader>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import { mapActions, mapGetters } from "vuex";

export default {
    title: "Patients Contacts Report ",

    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    data() {
        return {
            loading: false,
            search: "",
            filename: "Patient Contacts Report",
            filters: {
                start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
                end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
                patient_id: null,
                filter: true,
                facility_id: null,
            },
        };
    },

    computed: {
        ...mapGetters({
            facilities: "getFacilities",
        }),

        url() {
            return "/api/reports/module/reception/patient-contacts";
        },
    },

    methods: {
        ...mapActions([
            "setFacilities",
        ]),

        facilitySelected(facility) {
            this.filters.facility_id = facility;
        },

        facilityCleared() {
            this.filters.facility_id = null;
        },

        patientSelected(patient) {
            this.filters.patient_id = patient.id;
        },

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
        this.setFacilities();
    },
};
</script>
