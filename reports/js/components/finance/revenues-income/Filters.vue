<template>
    <v-card class="pa-0 pt-3" flat>
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
                            @input="filtersInfo()"
                            clearable
                            @click:clear="facilityCleared"
                            item-value="id"
                    ></v-autocomplete>
                </v-col>

                <v-col cols="12" md="2" class="px-2">
                    <v-autocomplete
                            :items="departments"
                            outline
                            v-model="filters.type"
                            color="blue-grey lighten-2"
                            label="Select Department"
                            @input="filtersInfo()"
                            item-text="type"
                            clearable
                            @click:clear="departmentCleared"
                            item-value="type"
                    ></v-autocomplete>
                </v-col>

                <v-col cols="12" md="2" class="px-2">
                    <v-autocomplete
                            :items="paymentModes"
                            outline
                            color="blue-grey lighten-2"
                            v-model="filters.payment_mode"
                            label="Payment mode"
                            @input="filtersInfo()"
                            item-text="text"
                            clearable
                            @click:clear="paymentCleared"
                            item-value="value"
                    ></v-autocomplete>
                </v-col>

                <v-col cols="12" md="2" class="px-2" v-if="filters.payment_mode === 'cash'">
                    <v-autocomplete
                            :items="['paid', 'unpaid']"
                            outline
                            color="blue-grey lighten-2"
                            v-model="filters.payment_state"
                            @input="filtersInfo()"
                            label="Payment status"
                            clearable
                            @click:clear="paymentStateCleared()"
                    ></v-autocomplete>
                </v-col>

                <v-col cols="12" md="2" v-if="filters.payment_mode === 'insurance'" class="px-2">
                    <v-autocomplete :items="insuranceCompanies.companies"
                                    @change="insuranceCompanySelected($event)"
                                    item-text="name" return-object
                                    clearable
                                    @click:clear="insuranceCompanyCleared"
                                    label="Insurance Company" outline
                    ></v-autocomplete>
                </v-col>
                <v-col cols="12" md="2" v-if="filters.payment_mode === 'insurance'"  class="px-2">
                        <v-autocomplete v-if="insuranceSchemes.length > 0" v-model="filters.scheme_id"
                                        :items="insuranceSchemes"
                                        @click:clear="schemeCleared"
                                        clearable
                                        item-text="full_name" item-value="id"
                                        label="Insurance Schemes" outline
                        ></v-autocomplete>
                </v-col>

                <v-col md="2" class="px-2">
                    <collabmed-date-time-picker outline @input="setStartDate"
                                                :datetime="filters.start_date"
                                                label="Start date">
                    </collabmed-date-time-picker>
                </v-col>

                <v-col md="2" class="px-2">
                    <collabmed-date-time-picker
                            outline @input="setEndDate"
                            :datetime="filters.end_date" label="End date">
                    </collabmed-date-time-picker>
                </v-col>
            </v-row>
            <v-row >
                <v-col>
                    <v-btn @click="filter()" small color="success">filter</v-btn>
                    <download-to-pdf :headers="printHeaders"
                                     :data="obj.reportData.data"
                                     :filename="filename">
                    </download-to-pdf>
                    <download-to-csv :headers="obj.reportData.headers"
                                     :data="obj.reportData.data"
                                     :filename="filename">
                    </download-to-csv>
                    <download-to-excel :filters="filters"
                                       :url="url"
                                       :filename="filename">
                    </download-to-excel>
                </v-col>
            </v-row>
        </v-card-text>

        <v-alert
                :value="true"
                color="success"
                small
                outlined
        >
            <strong>
                <small>Your selection is based on the following:</small>
                <h6 v-for="(key, value) in filters_info" :key="key">
                    <span>{{ value + ': ' + key }}</span><br/>
                </h6>
            </strong>
        </v-alert>
    </v-card>
</template>
<script>
import moment from "moment";
import { mapActions, mapGetters } from "vuex";

export default {
    title: "revenue income",

    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    data: () => ({
        filename: "Revenues income per department",
        insuranceSchemes: [],
        filters_info: null,
        filters: {
            start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
            end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
            facility_id: "",
            payment_mode: "",
            insurance_company_id: null,
            scheme_id: null,
            payment_state: null,
            invoiced_state: null,
        },
    }),

    computed: {
        ...mapGetters({
            facilities: "getFacilities",
            paymentModes: "getPaymentModes",
            insuranceCompanies: "getInsurances",
            departments: "getRevenueDepartments",
        }),

        url() {
            return "/api/reports/module/finance/revenues-income";
        },

        printHeaders() {
            return [
                { text: "Type", value: "" },
                { text: "Quantity", value: "" },
                { text: "Amount", value: "" },
            ];
        },

        paymentModes() {
            return [
                { text: "Cash", value: "cash" },
                { text: "Insurance", value: "insurance" },
            ];
        },
    },

    methods: {
        ...mapActions([
            "setFacilities", "setPaymentModes", "setInsurances", "setRevenueDepartments",
        ]),

        filtersInfo() {
            const filters_data = _.omitBy(this.filters, _.isNil);

            const filtersInfo = {};

            const self = this;

            _.map(filters_data, function(val, key) {
                if (key === "facility_id") {
                    _.map(self.facilities.facilities, (item) => {
                        if (item.id === val) {
                            filtersInfo["facility"] = item.name;
                        }
                    });
                } else {
                    filtersInfo[key.replace("_", " ")] = val;
                }
            });

            this.filters_info = filtersInfo;
        },

        paymentCleared() {
            this.filters.payment_mode = null;
            this.insuranceCompanyCleared();
            this.schemeCleared();
            this.insuranceSchemes = [];
        },

        insuranceCompanySelected(selected) {
            this.filters.insurance_company = selected.id;
            this.insuranceSchemes = selected.schemes;
        },

        insuranceCompanyCleared() {
            this.filters.insurance_company = null;
            this.insuranceSchemes = [];
            this.schemeCleared();
        },

        schemeCleared() {
            this.filters.scheme_id = null;
        },

        paymentStateCleared() {
            this.filters.payment_state = null;
        },

        invoicedStateCleared() {
            this.filters.invoiced_state = null;
        },

        departmentCleared() {
            this.filters.type = null;
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

        filter() {

            this.obj.filters = _.omitBy(this.filters, _.isNil);
            console.log(this.obj.filters);
            this.$emit("filter");
        },
    },

    mounted() {

      console.log(this.obj);
        this.setFacilities();
        this.filtersInfo();
        this.setPaymentModes();
        this.setInsurances();
        this.setRevenueDepartments();
    },
};
</script>
