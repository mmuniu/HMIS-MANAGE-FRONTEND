<template>
    <v-container fluid>
        <v-row >
            <v-col md="2">
                <v-autocomplete label="Select a insurance"
                                :items="insurances.companies"
                                item-text="name"
                                outline
                                item-value="id"
                                v-model="insurance"
                ></v-autocomplete>
            </v-col>

            <v-col class="mx-1" md="2" >
                <v-autocomplete label="Select a scheme"
                                :items="schemes.data"
                                item-text="name"
                                outline
                                item-value="id"
                                v-model="scheme"
                ></v-autocomplete>
            </v-col>

            <v-col md="2">
                <collabmed-date-time-picker @input="setStartDate" :datetime="start_date" label="Start date"></collabmed-date-time-picker>
            </v-col>

            <v-col md="2">
                <collabmed-date-time-picker @input="setEndDate" :datetime="end_date" label="End date"></collabmed-date-time-picker>
            </v-col>
        </v-row>
        <v-row >
            <v-col cols="1">
                <v-btn small color="success" @click="navigate()">Filter</v-btn>
            </v-col>
            <v-col cols="1">
                <v-btn small color="primary" @click="exportData()">export</v-btn>
            </v-col>
            <v-col cols="1">
                <v-btn small color="purple" class="white--text" @click="resetFilters()">reset</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
    data: () => ({
        start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
        end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
        insurance: "",
        scheme: "",
    }),

    computed: {
        ...mapGetters({
            insurances: "getInsurances",
            schemes: "getSchemes",
        }),
    },

    methods: {
        ...mapActions([
            "setSchemes", "setInsurances",
        ]),

        setStartDate(datetime) {
            this.start_date = datetime;
        },
        setEndDate(datetime) {
            this.end_date = datetime;
        },

        exportData() {
            window.location = `/reports/payments/insurance?params=params&export=true&insurance_company=
            ${this.insurance}&insurance_scheme=${this.scheme}&start-date=${this.start_date}&end-date=${this.end_date}`;
        },

        resetFilters() {
            window.location = "/reports/payments/insurance";
        },

        navigate(reset) {
            window.location = `/reports/payments/insurance?params=params&insurance_company=
            ${this.insurance}&insurance_scheme=${this.scheme}&start-date=${this.start_date}&end-date=${this.end_date}`;
        },
    },

    mounted() {
        this.setSchemes();
        this.setInsurances();
    },
};
</script>
