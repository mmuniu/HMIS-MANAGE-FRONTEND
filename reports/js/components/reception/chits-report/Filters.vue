<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row>
                <v-col md="2">
                   <div class="mx-2">
                       <patient-search outline @patientSelected="patientSelected"></patient-search>
                   </div>
               </v-col>
                <v-col cols="12" md="2">
                    <div class="mx-2">
                        <users-search @results="setUsers" leaveSelected  @clearedSelected="clearedUser()"></users-search>
                    </div>
                </v-col>
                <v-col md="2">
                    <v-select v-model="filters.type"
                              label="Type"
                              :items="['Paid sick chit','Light duty chit', 'Treatment and back to work chit', 'Referral chit']"
                              ></v-select>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>

                <v-col>
                    <v-btn @click="filter()" color="success">filter</v-btn>
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
    import PatientSearch from "@reception/components/patients/PatientSearch";

    export default {
        components: {PatientSearch},
        title: "Chits Report ",

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
                filename: "Chits report",
                filters: {
                    start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
                    end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
                    patient_id: null,
                    type: null,
                    user: null,
                    filter: true,
                },
            };
        },

        computed: {
            url() {
                return "/api/reports/module/reception/chits-report";
            },
        },

        methods: {
            patientSelected(patient) {
                this.filters.patient_id = patient.id;
            },

            setUsers(user) {
                this.filters.user = user.id;
            },

            clearedUser() {
                this.filters.user = null;
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
    };
</script>
