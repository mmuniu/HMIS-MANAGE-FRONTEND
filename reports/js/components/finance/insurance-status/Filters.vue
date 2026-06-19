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

                <v-col cols="12" md="3" class="px-2">
                    <v-autocomplete
                            :items="insuranceCompanies.companies"
                            @change="insuranceCompanySelected($event)"
                            item-text="name" return-object
                            clearable
                            item-value="id"
                            @click:clear = "insuranceCompanyCleared"
                            label="Insurance Company" outline
                    ></v-autocomplete>
                </v-col>

                <v-col cols="12" md="3" class="px-2" v-if="filters.insurance_company_id">
                    <v-autocomplete
                            :items="insuranceSchemes"
                            v-model="filters.scheme_id"
                            @change="schemeSelected($event)"
                            item-text="name"
                            clearable
                            item-value="id"
                            @click:clear = "schemeCleared"
                            label="Insurance Company" outline
                    ></v-autocomplete>
                </v-col>

                <v-col class="d-flex" cols="12" md="2" >
                    <v-select
                            :items="status"
                            item-value="value"
                            item-text="name"
                            label="Status"
                            v-model="filters.status"
                            clearable
                            @click:clear = "statusCleared"
                            outline
                    ></v-select>
                </v-col>


                <v-col md="2" class="px-2">
                    <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="2" class="px-2">
                    <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>
            </v-row>
            <v-row >
                <v-col>
                    <v-btn @click="filter()" small color="success">filter</v-btn>
                    <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
<script>
import moment from "moment";
import { mapActions, mapGetters } from "vuex";

export default {
    title: "insurance status",

    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    data: () => ({
        filename: "Insurance Status",
        insuranceSchemes: [],
        filters_info: null,
        filters: {
            start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
            end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
            facility_id: null,
            insurance_company_id: null,
            scheme_id: null,
            invoiced_state: null,
            status: null,
        },
    }),

    computed: {
        ...mapGetters({
            facilities: "getFacilities",
            insuranceCompanies: "getInsurances",
        }),

        status() {
            return [
                { name: "Incomplete", value: "0" },
                { name: "Complete", value: "1" },
            ];
        },

        url() {
            return "/api/reports/module/finance/insurance-status";
        },
    },

    methods: {
        ...mapActions([
            "setFacilities", "setInsurances",
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

        facilityCleared() {
            this.filters.facility_id = null;
        },

        insuranceCompanySelected(selected) {
            this.filters.insurance_company_id = selected.id;
            this.insuranceSchemes = selected.schemes;
        },

        insuranceCompanyCleared() {
            this.filters.insurance_company_id = null;
            this.$emit("change", this.filters.insurance_company_id);
        },

        schemeSelected(selected) {
            console.log(selected);
        },

        schemeCleared() {
            this.filters.scheme_id = null;
        },

        statusCleared() {
            this.filters.status = null;
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
        this.filtersInfo();
        this.setInsurances();
    },
};
</script>
