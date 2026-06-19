<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 29/10/2018
* Time: 19:04
* Project: platform
-->

<template>
    <v-container fluid>
        <v-row >
            <v-col md="2">
                <!--dropdown-->
                <v-select
                        :items="treatmentLocations"
                        label="Treatment Locations"
                        item-text="text"
                        @change="changeLocation()"
                        item-value="value"
                        v-if="treatmentLocations"
                        v-model="treatment_location"
                        outline
                ></v-select>
            </v-col>

            <v-col md="2">
                <collabmed-date-time-picker outline @input="setStartDate" :datetime="start_date" label="Start date"></collabmed-date-time-picker>
            </v-col>

            <v-col md="2">
                <collabmed-date-time-picker outline @input="setEndDate" :datetime="end_date" label="End date"></collabmed-date-time-picker>
            </v-col>

            <v-col md="2">
                <v-select
                        :items="facilities"
                        label="Select a Facility"
                        item-text="name"
                        item-value="id"
                        v-if="facilities"
                        v-model="facilityId"
                        outline
                ></v-select>
            </v-col>


            <v-col class="mx-1" md="2" >
                <patient-search @patientSelected="selectedPatient($event)"></patient-search>
            </v-col>

            <v-col cols="1">
                <v-btn large color="success" @click="filterQueue()">Filter queue</v-btn>
            </v-col>
        </v-row>
        <v-row >
            <v-col>
                <v-btn small color="purple" @click="changeLocation()" class="white--text">Reset</v-btn>
                <v-btn small class="success"  @click="changeStore" target="_blank">
                    Select operating store
                </v-btn>

                <v-btn small class="primary mx-1" v-if="currentDestination.slug == 'pharmacy'"  @click="undispensed()" target="_blank">
                    pending dispense
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import Vue from 'vue';
import { _ } from 'vue-underscore';
import PatientSearch from '@reception/components/patients/PatientSearch.vue';
import { mapActions, mapGetters } from 'vuex';
import moment from 'moment';

export default {
    props: [
        'locations', 'destination', 'changeStoreUrl', 'selectedLocation', 'changeLocationUrl', 'facilityId', 'jana',
    ],

    components: {
        PatientSearch,
    },

    data() {
        return {
            facilities: null,
            patientId: '',
            treatment_location: this.selectedLocation,
            start_date: moment(new Date()).startOf('day').format('YYYY-MM-DD HH:mm'),
            end_date: moment(new Date()).add(1, 'minute').format('YYYY-MM-DD HH:mm'),
            menu1: false,
            menu2: false,
        };
    },

    computed: {
        treatmentLocations() {
            return _.map(JSON.parse(this.locations), (item) => {
                return {
                    text: item.name.toUpperCase(),
                    value: item.name,
                };
            });
        },

        currentDestination() {
            return JSON.parse(this.destination);
        },

        ...mapGetters([
            'getFacilities',
            'getSessions',
        ]),

        storeAlert() {
            return {
                'message': 'Please select the store you currently working in.',
                'alert': 'warning',
                'timeout': 6000,
            };
        },

        janaDates() {
            return JSON.parse(this.jana);
        },
    },

    watch: {
        getFacilities(value) {
            this.facilities = value.facilities;
        },

        getSessions(value) {
            if (this.currentDestination.slug === 'pharmacy' && !value.store_id) {
                flash(this.storeAlert);
            }
        },

        /* facilityId(value){
                this.changeFacility(value);
            }*/
    },

    methods: {
        ...mapActions([
            'setFacilities',
        ]),

        setStartDate: function(datetime) {
            this.start_date = datetime;
        },

        setEndDate: function(datetime) {
            this.end_date = datetime;
        },


        selectedPatient(patient) {
            this.patientId = patient ? patient.id : '';
        },

        active(location) {
            return this.selectedLocation === location.name;
        },

        changeLocation() {
            return window.location = `${this.changeLocationUrl}?location=${this.treatment_location}&facility=${this.facilityId}`;
        },

        changeStore() {
            return window.location = this.changeStoreUrl;
        },

        /* changeFacility(id) {
                return window.location = `${this.changeLocationUrl}?facility=${id}`;
            },

            janaQueue() {
                return window.location = `${this.changeLocationUrl}?facility=${this.facilityId}&start-date=${this.janaDates[0]}&end-date=${this.janaDates[1]}`;
            },*/

        filterQueue() {
            return window.location = `${this.changeLocationUrl}?facility=${this.facilityId}&patient=${this.patientId}&start-date=${this.start_date}&end-date=${this.end_date}`;
        },

        undispensed() {
            return window.location = `${this.changeLocationUrl}?facility=${this.facilityId}&patient=${this.patientId}&start-date=${this.start_date}&end-date=${this.end_date}&undispensed=true`;
        },
    },

    mounted() {
        this.setFacilities();

    },
};
</script>

<style scoped lang="scss">
    .active {

    }
</style>
