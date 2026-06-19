<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row>
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
                                v-if="getCounties.length > 1"
                                :items="getCounties"
                                label="County"
                                @input="fetchSubCounties()"
                                chips
                                deletable-chips
                                v-model="filters.county">
                        </v-autocomplete>
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <div class="mx-2">
                        <v-autocomplete
                                v-if="getSubCounties.length > 1"
                                :items="getSubCounties"
                                label="Sub county"
                                item-text="sub_county"
                                item-value="sub_county"
                                chips
                                deletable-chips
                                v-model="filters.sub_county">
                        </v-autocomplete>
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <div class="mx-2">
                        <v-text-field label="Village / Estate"
                                      v-model="filters.village"
                        ></v-text-field>
                    </div>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>

                <v-col>
                    <v-btn @click="filter()" class="v-btn v-btn--small theme--light primary" color="success">filter</v-btn>
                    <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import _ from 'lodash';
import moment from 'moment';

export default {
    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    data() {
        return {
            filename: 'Sample collection report',
            loading: false,
            search: '',
            filters: {
              start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:mm'),
              end_date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
                // doctor: '',
                facility_id: null,
                county: null,
                sub_county: null,
                village: null,
            },
        };
    },

    computed: {
        ...mapGetters({
            facilities: 'getFacilities',
            getCounties: 'getCounties',
            getSubCounties: 'getSubCounties'
        }),

        url() {
            return '/api/reports/module/evaluation/collected-samples';
        },
    },

    methods: {
        ...mapActions([
            'setFacilities', 'setSubCounties', 'setCounties'
        ]),

        facilitySelected(facility) {
            this.filters.facility_id = facility;
        },

        facilityCleared() {
            this.filters.facility_id = null;
        },

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },
        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        async fetchCountries() {

            if(this.screen) {
                this.patient.profile.nationality = 'Kenya';
            }

            let response = await fetch('https://restcountries.eu/rest/v2/all?fields=name;capital');

            if(response) {
                this.countries = await response.json();
            }
        },

        fetchSubCounties () {
            this.getSubCounties = [];

            this.setSubCounties({
                params: {
                    county: this.filters.county
                }
            });
        },

        filter() {
            this.obj.filters = _.omitBy(this.filters, _.isNil);

            this.$emit('filter');
        },
    },

    mounted() {
        this.setFacilities();
        this.setCounties();
        this.fetchCountries();
    },
};
</script>
