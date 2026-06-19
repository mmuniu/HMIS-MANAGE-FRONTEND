<template>
    <v-card-text class="py-0 my-0">
        <v-row>
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
                ></v-autocomplete>
            </v-col>
            <v-col md="2" class="px-2">
                <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
            </v-col>

            <v-col md="2" class="px-2">
                <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date" ></collabmed-date-time-picker>
            </v-col>
            <v-col md="2" class="px-2">
                <v-autocomplete
                    :items="lab_tests"
                    outline
                    color="blue-grey lighten-2"
                    v-model="filters.lab_test"
                    label="Lab Test"
                    item-text="name"
                    clearable
                    @click:clear="labTestCleared"
                    item-value="id"
                ></v-autocomplete>
            </v-col>

            <v-col md="2" class="px-2">
                <seen-by @results="setPatient" :label="'Patient'" :user-list="true" leaveSelected @clearedSelected="clearedPatient()"></seen-by>
            </v-col>
        </v-row>
        <v-row>
            <v-col md="2" class="px-2">
                <seen-by @results="setAnalysedBy" :label="'Analysed by'" leaveSelected @clearedSelected="clearedAnalysedUser()"></seen-by>
            </v-col>
            <v-col md="2" class="px-2">
                <seen-by @results="setReviewedBy" :label="'Reviewed by'" leaveSelected @clearedSelected="clearedReviewedUser()"></seen-by>
            </v-col>
            <v-col md="2" class="px-2">
                <seen-by @results="setApprovedBy" :label="'Approved by'" leaveSelected @clearedSelected="clearedApprovedUser()"></seen-by>
            </v-col>

            <v-col md="2" class="px-2">
                <v-autocomplete
                    :items="varianceSelections"
                    outline
                    color="blue-grey lighten-2"
                    v-model="filters.variance"
                    label="Variance"
                    item-text="text"
                    clearable
                    @click:clear="varianceCleared"
                    item-value="value"
                ></v-autocomplete>
            </v-col>
            <v-col md="2" class="px-2">
                <v-autocomplete
                    :items="types"
                    outline
                    color="blue-grey lighten-2"
                    v-model="filters.type"
                    label="Type"
                    item-text="text"
                    clearable
                    @click:clear="typeCleared"
                    item-value="value"
                ></v-autocomplete>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn @click="filter" class="v-btn v-btn--small theme--light primary" color="success">filter</v-btn>
                <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
            </v-col>
        </v-row>
    </v-card-text>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import moment from 'moment';

export default {
    name: 'lab-tat-report-filters',

    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    computed: {
        ...mapGetters({
            facilities: 'getFacilities',
        }),

        url() {
            return '/api/reports/module/evaluation/lab-tat-report';
        },
        varianceSelections() {
            return [
                { text: "Positive", value: "positive" },
                { text: "Negative", value: "negative" },
            ];
        },
        types() {
            return [
                { text: "All", value: "all" },
                { text: "Radiology", value: "radiology" },
                { text: "Laboratory", value: "laboratory" },
            ];
        },
    },

    data: () => ({
        loading: false,
        filename: 'Lab TAT Report',
        filters: {
            facility_id: null,
            ward_id: null,
            start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:mm'),
            end_date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
            variance: null,
            type: null,
            lab_test: null,
            patient_id: null,
            analysed_by: null,
            reviewed_by: null,
            approved_by: null,
        },
        lab_tests: [],
    }),

    methods: {
        ...mapActions([
            'setFacilities',
        ]),

        facilitySelected(id) {
            this.filters.facility_id = id;
        },

        facilityCleared() {
            this.filters.facility_id = null;
        },

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },

        setAnalysedBy(user) {
            this.filters.analysed_by = user.id;
        },

        setReviewedBy(user) {
            this.filters.reviewed_by = user.id;
        },

        setApprovedBy(user) {
            this.filters.approved_by = user.id;
        },

        clearedAnalysedUser() {
            this.filters.analysed_by = null;
        },

        clearedReviewedUser() {
            this.filters.reviewed_by = null;
        },

        clearedApprovedUser() {
            this.filters.approved_by = null;
        },

        clearedPatient() {
            this.filters.patient_id = null;
        },

        varianceSelected(variance) {
            this.filters.variance = variance;
        },

        varianceCleared() {
            this.filters.variance = null;
        },

        typeSelected(type) {
            this.filters.type = type;
        },

        labTestCleared() {
            this.filters.lab_test = null;
        },

        typeCleared() {
            this.filters.type = null;
        },

        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        fetchTests() {
            axios.get('/api/reports/lab-tat-report-tests/tests')
                .then(response => {
                    this.lab_tests = response.data;
                })
                .catch(error => {
                    console.log(error);
                });
        },

        setPatient(user) {
            this.filters.patient_id = user.id;
        },



        filter() {
            this.obj.filters = _.omitBy(this.filters, _.isNil);
            this.$emit('filter');
        },
    },

    mounted() {
        this.setFacilities();
        this.fetchTests();
        window.events.$on('STORE_SET_ACTION_LOADING', (loading) => {
            this.saveLoader = loading;
        });
    },
};
</script>
