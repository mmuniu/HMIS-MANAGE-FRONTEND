<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row>
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
            filename: 'Covid consent report',
            loading: false,
            search: '',
            filters: {
              start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:mm'),
              end_date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
                facility_id: null,
                county: null,
                sub_county: null,
                village: null,
            },
        };
    },

    computed: {
        url() {
            return '/api/reports/module/evaluation/covid-consent-report';
        },
    },

    methods: {
        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },
        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        filter() {
            this.obj.filters = _.omitBy(this.filters, _.isNil);

            this.$emit('filter');
        },
    },
};
</script>
