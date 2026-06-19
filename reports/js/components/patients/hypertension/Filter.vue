<template>
    <v-container fluid>

        <v-row >
            <v-col md="2">
                <collabmed-date-time-picker @input="setStartDate" :datetime="start_date" label="Start date"></collabmed-date-time-picker>
            </v-col>

            <v-col md="2">
                <collabmed-date-time-picker @input="setEndDate" :datetime="end_date" label="End date"></collabmed-date-time-picker>
            </v-col>

            <v-col class="mx-1" cols="1" >
                <v-btn large color="success" @click="navigate()">Filter</v-btn>
            </v-col>

            <v-col class="mx-2" cols="1" >
                <v-btn large dark color="purple" @click="resetFilters()">reset</v-btn>
            </v-col>

            <v-col class="mx-1" cols="1" >
                <v-btn large color="primary" @click="exportData()">export</v-btn>
            </v-col>
        </v-row>

    </v-container>
</template>
<script>
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        startDate: {
            default: null,
        },
        endDate: {
            default: null,
        },
    },
    data: () => ({
        start_date: null,
        end_date: null,
    }),

    methods: {
        setStartDate(datetime) {
            this.start_date = datetime;
        },

        setEndDate(datetime) {
            this.end_date = datetime;
        },

        exportData() {
            window.location = `/reports/hypertension?params=params&export=true&start-date=${this.start_date}&end-date=${this.end_date}`;
        },

        resetFilters() {
            window.location = "/reports/hypertension";
        },

        navigate(reset) {
            window.location = `/reports/hypertension?params=params&start-date=${this.start_date}&end-date=${this.end_date}`;
        },
    },

    created() {
        if (this.startDate) {
            this.start_date = moment(this.startDate).format("YYYY-MM-DD HH:MM");
        } else {
            this.start_date = moment(new Date()).format("YYYY-MM-DD HH:MM");
        }

        if (this.endDate) {
            this.end_date = moment(this.endDate).format("YYYY-MM-DD HH:MM");
        } else {
            this.end_date = moment(new Date()).format("YYYY-MM-DD HH:MM");
        }
    },
};
</script>
