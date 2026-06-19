<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row >

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

                <v-col cols="12" md="3" class="px-2">
                    <div class="mx-2">
                        <v-autocomplete
                                :items="departments"
                                outline
                                v-model="filters.type"
                                color="blue-grey lighten-2"
                                label="Select Department"
                                @input="departmentSelected()"
                                item-text="type"
                                clearable
                                @click:clear="departmentCleared"
                                item-value="type"
                        ></v-autocomplete>
                    </div>
                </v-col>

                <v-col cols="12" md="3" class="px-2">
                    <div class="mx-2">
                        <checked-in-by @results="setCheckedInBy" leaveSelected  @clearedSelected="clearedUser()"></checked-in-by>

                    </div>
                </v-col>
                <v-col cols="12" md="3" class="px-2">
                    <div class="mx-2">
                        <seen-by @results="setSeenBy" leaveSelected  @clearedSelected="clearedUser()"></seen-by>

                    </div>
                </v-col>

                <v-col cols="12" md="2" class="px-2">
                    <v-autocomplete
                            :items="paymentModes"
                            outline
                            color="blue-grey lighten-2"
                            v-model="filters.payment_mode"
                            label="Payment mode"
                            @input="paymentSelected"
                            item-text="text"
                            clearable
                            @click:clear="paymentCleared"
                            item-value="value"
                    ></v-autocomplete>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>
                <v-col  md="2" >
                    <div class="mx-2">
                        <v-autocomplete
                                :items="gender"
                                outline
                                v-model="filters.gender"
                                color="blue-grey lighten-2"
                                label="Select Gender"
                                @input="genderSelected()"
                                item-text="type"
                                clearable
                                @click:clear="genderCleared"
                                item-value="type"
                        ></v-autocomplete>
                    </div>
                </v-col>
                <v-col  md="2" >
                    <div class="mx-2">
                        <v-autocomplete
                                :items="ageRange"
                                outline
                                v-model="filters.age_range"
                                color="blue-grey lighten-2"
                                label="Select Age range"
                                @input="ageRangeSelected()"
                                item-text="type"
                                clearable
                                @click:clear="ageRangeCleared"
                                item-value="type"
                        ></v-autocomplete>
                    </div>
                </v-col>
                <v-col  md="2" >
                    <div class="mx-2">
                        <v-autocomplete
                                :items="visitRevisitSelected"
                                outline
                                v-model="filters.visit_revisit_selected"
                                color="blue-grey lighten-2"
                                label="Visit /revisit ?"
                                @input="visitRevisitSelectedMethod()"
                                item-text="type"
                                clearable
                                @click:clear="visitRevisitCleared"
                                item-value="type"
                        ></v-autocomplete>
                    </div>
                </v-col>
                <v-col  md="2" >
                    <div class="mx-2">
                        <v-autocomplete
                                :items="statuses"
                                outline
                                v-model="filters.status"
                                color="blue-grey lighten-2"
                                label="Select status"
                                @input="statusSelected()"
                                item-text="type"
                                clearable
                                @click:clear="statusCleared"
                                item-value="type"
                        ></v-autocomplete>
                    </div>
                </v-col>
            </v-row>
            <v-row >
                <v-col>
                    <v-btn @click="filter()" class="v-btn v-btn--small theme--light primary" color="success">filter</v-btn>
                    <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
<!--                    <download-to-pdf :headers="printHeaders" :data="obj.reportData.data" :filename="filename"></download-to-pdf>-->
<!--                    <download-to-csv :headers="printHeaders" :data="obj.reportData.data" :filename="filename"></download-to-csv>-->
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

    data: () => ({
        loading: false,
        filename: "Departmental Procedures Report",
        filters: {
          start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:mm'),
          end_date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
            facility_id: null,
            department: null,
            payment: null,
            gender:null,
            visit_revisit_selected:null,
            status:null
        },
    }),

    computed: {
        printHeaders() {
            return [
                { text: "Type", value: "" },
                { text: "Total Procedures", value: "" },
            ];
        },
        ...mapGetters({
            facilities: "getFacilities",
            departments: "getRevenueDepartments",
        }),

        url() {
            return "/api/reports/module/evaluation/patients-seen";
        },

        paymentModes() {
            return [
                { text: "Cash", value: "cash" },
                { text: "Insurance", value: "insurance" },
            ];
        },
        gender(){
            return [
                { text: "Male", value: "male" },
                { text: "Female", value: "female" },
            ];
        },
        ageRange(){
            return [
                { text: "Over 5", value: "over-5" },
                { text: "Under 5", value: "under-5" },
            ];
        },
        visitRevisitSelected(){
            return [
                { text: "Visit", value: "visit" },
                { text: "Revisit", value: "revisit" },
            ];
        },
        statuses() {
        return [
            { text: "Routine", value: "routine" },
            { text: "Urgent", value: "urgent" },
            { text: "Very Urgent", value: "very_urgent" },
            { text: "Emergency-Resuscitation", value: "emergency" }
            ];
        }


    },

    methods: {
        ...mapActions([
            "setFacilities", "setRevenueDepartments",
        ]),

        departmentSelected(department) {
            this.filters.department = department;
        },
        genderSelected(genderSelected) {
            this.filters.gender = genderSelected;
        },
        ageRangeSelected(ageRangeSelected) {
            this.filters.age_range_selected = ageRangeSelected;
        },

        visitRevisitSelectedMethod(visitRevisitSelected){
            this.filters.visit_revisit_selected = visitRevisitSelected;
        },

        visitRevisitCleared(){
            this.filters.visit_revisit_selected = null;
        },
        statusCleared(){
            this.filters.status = null;
        },
        
        setCheckedInBy(user) {
            this.filters.checked_in_by_id = user.id;
        },
        setSeenBy(user) {
            this.filters.seen_by_id = user.id;
        },
        ageRangeCleared(){
            this.filters.age_range_selected = null;
        },

        departmentCleared() {
            this.filters.department = null;
        },
        genderCleared() {
            this.filters.gender = null;
        },
        facilityCleared() {
            this.filters.facility_id = null;
        },

        paymentSelected(payment) {
            this.filters.payment = payment;
        },
        paymentCleared() {
            this.filters.payment = null;
        },

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },

        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        startDownload() {
            this.loading = true;
        },
        finishDownload() {
            this.loading = false;
        },

        filter() {
            this.obj.filters = _.omitBy(this.filters, _.isNil);

            this.$emit("filter" );
        },

    },

    mounted() {
        this.setFacilities();
        this.setRevenueDepartments();
    },
};
</script>
