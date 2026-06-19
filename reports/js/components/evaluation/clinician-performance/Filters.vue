<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row  >
                <v-col cols="12" md="3">
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

                <v-col cols="12" md="3">
                    <div class="mx-2">
                        <v-autocomplete
                                v-model="filters.doctor"
                                :items="all_doctors.data"
                                :search-input.sync="search"
                                outline
                                hide-no-data
                                hide-selected
                                item-text="name"
                                clearable
                                @clear:clear="doctorCleared"
                                item-value="id"
                                label="Select Doctor"
                        ></v-autocomplete>
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
            filename: "Clinician Report",
            loading: false,
            search: "",
            filters: {
              start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:mm'),
              end_date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
                doctor: "",
                facility_id: null,
            },
        };
    },

    watch: {
        getUsers(newValue, oldValue) {
            console.log(newValue, oldValue);
        },
    },

    computed: {
        ...mapGetters({
            all_doctors: "getUsers",
            facilities: "getFacilities",
        }),

        url() {
            return "/api/reports/module/evaluation/clinician-performance";
        },
    },

    methods: {
        ...mapActions([
            "setUsers", "setFacilities",
        ]),

        facilitySelected(facility) {
            this.filters.facility_id = facility;
        },

        facilityCleared() {
            this.filters.facility_id = null;
        },

        doctorCleared() {
            this.filters.doctor = null;
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
        this.setUsers({
            page: 2,
            params: {
                role: "doctor",
            },
        });
        this.setFacilities();
    },
};
</script>
