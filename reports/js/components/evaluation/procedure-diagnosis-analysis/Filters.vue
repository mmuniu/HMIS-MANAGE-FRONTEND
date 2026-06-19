<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row  >
                <v-col cols="12" md="2">
                    <div class="mx-2">
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
                    </div>
                </v-col>

                <v-col cols="12" md="2">
                    <div class="mx-2">
                        <users-search
                                @results="setDoctor"
                                leaveSelected
                                @clearedSelected="clearedDoctor()"
                        ></users-search>
                    </div>
                </v-col>

                <v-col cols="12" md="2">
                    <div class="mx-2">
                        <evaluation-procedure-search @results="procedureSelected" @cleared="filters.procedure_id = null"></evaluation-procedure-search>
                    </div>
                </v-col>

                <v-col cols="12" md="2">
                    <div class="mx-2">
                        <v-text-field v-model="filters.written_diagnosis" label="Diagnosis"
                                      outline v-if="msetting('evaluation.write_in_diagnosis')"></v-text-field>

                        <evaluation-icd10-search @results="diagnosisSelected" v-else></evaluation-icd10-search>
                    </div>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>

            </v-row>
            <v-row  >

                <v-col>
                    <v-btn @click="filter()" class="v-btn v-btn--small theme--light primary" color="success">filter</v-btn>
                    <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import _ from "lodash";
import moment from "moment";

export default {
    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    data() {
        return {
            filename: "procedures & diagnosis analysis",
            loading: false,
            search: "",
            filters: {
              start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:mm'),
              end_date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
                procedure_id: null,
                user_id: "",
                written_diagnosis: null,
                variation_id: null,
                facility_id: null,
            },
        };
    },

    computed: {
        ...mapGetters({
            facilities: "getFacilities",
        }),

        url() {
            return "/api/reports/module/evaluation/procedure-diagnosis-analysis";
        },
    },

    methods: {
        ...mapActions([
            "setFacilities",
        ]),

        procedureSelected(procedure) {
            this.filters.procedure_id = procedure.id;
        },

        diagnosisSelected(diagnosis) {
            console.log(diagnosis);
            this.filters.variation_id = diagnosis.id;
        },

        facilitySelected(facility) {
            this.filters.facility_id = facility;
        },

        facilityCleared() {
            this.filters.facility_id = null;
        },

        setDoctor(user) {
            this.filters.user_id = user.id;
        },

        clearedDoctor() {
            this.filters.user_id = null;
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
