<template>
    <v-card class="pa-0 mb-4" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row class="mb-2">

                <v-col cols="12" md="3">
                    <div class="mx-2">
                        <v-autocomplete :items="facilities.facilities" outline v-model="filters.facility_id"
                            color="blue-grey lighten-2" label="Select Facility" item-text="name" clearable
                            @click:clear="facilityCleared" item-value="id" @input="facilitySelected"></v-autocomplete>
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <div class="mx-2">
                        <users-search @results="setDoctor" leaveSelected
                            @clearedSelected="clearedDoctor()"></users-search>
                    </div>
                </v-col>

                <v-col class="d-flex" cols="12" md="2">
                    <v-select :items="ages" item-value="value" item-text="name" label="Over / Under"
                        v-model="filters.ou" outline></v-select>
                </v-col>
                <v-col class="d-flex" cols="12" md="2">
                    <v-select :items="genders" item-value="value" item-text="name" label="Gender"
                        v-model="filters.gender" clearable outline></v-select>
                </v-col>
            </v-row>
            <v-row>
                <v-col class="d-flex" cols="12" md="2">
                    <v-select :items="visitTypes" item-value="value" item-text="name" label="Visit Type"
                        v-model="filters.visit_type" clearable outline></v-select>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date"
                        label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date"
                        label="End date"></collabmed-date-time-picker>
                </v-col>
            </v-row>
            
            <v-row>
                <v-col>
                    <v-btn @click="filter()" class="v-btn v-btn--small theme--light primary"
                        color="success">filter</v-btn>
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
    name: 'PatientDiagnosisFilters',
    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    data() {
        return {
            filename: 'patient diagnosis report',
            loading: false,
            search: '',
            filters: {
                start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:mm'),
                end_date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
                ou: '',
                user_id: '',
                facility_id: null,
                gender: '',
                visit_type: '',
            },
        };
    },

    computed: {
        ...mapGetters({
            facilities: 'getFacilities',
        }),

        url() {
            return '/api/reports/module/evaluation/patients-diagnoses';
        },

        ages() {
            return [
                { name: 'Over 5', value: 'o' },
                { name: 'Under 5', value: 'u' },
            ];
        },

        genders() {
            return [
                { name: 'Male', value: 'male' },
                { name: 'Female', value: 'female' },
            ];
        },

        visitTypes() {
            return [
                { name: 'New Visit', value: 'new' },
                { name: 'Revisit', value: 'revisit' },
            ];
        },
    },

    methods: {
        ...mapActions([
            'setFacilities',
        ]),

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
            // Parse the date and set the time to 00:00
            const startDate = this.$moment(datetime).startOf('day').format('YYYY-MM-DD HH:mm:ss');

            this.filters.start_date = startDate;
        },

        setEndDate(datetime) {
            // Parse the date and set the time to 23:59
            const endDate = this.$moment(datetime).endOf('day').format('YYYY-MM-DD HH:mm:ss');

            this.filters.end_date = endDate;
        },

        filter() {
            this.obj.filters = _.omitBy(this.filters, _.isNil);
            this.$emit('filter');
        },

        autoSelectFacility() {
            // Check if facilities exist and have data
            if (this.facilities && this.facilities.facilities && this.facilities.facilities.length === 1) {
                this.filters.facility_id = this.facilities.facilities[0].id;
            }
        },
    },

    mounted() {
        this.setFacilities();
        this.setFacilities().then(() => {
            this.autoSelectFacility();
        });
    },
    watch: {
        'facilities.facilities': {
            handler(newVal) {
                if (newVal && newVal.length === 1) {
                    this.filters.facility_id = newVal[0].id;
                }
            },
            immediate: true
        }
    },
};
</script>
