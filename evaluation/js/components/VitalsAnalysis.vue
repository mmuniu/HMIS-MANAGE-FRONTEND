<template>
    <v-card flat>
        <v-card-title>
            <v-spacer/>
            <v-col md="4" class="mx-3">
                <collabmed-date-time-picker outline @input="setStartDate" :datetime="params.start_date" label="Start date"></collabmed-date-time-picker>
            </v-col>

            <v-col md="4" class="mx-3">
                <collabmed-date-time-picker outline @input="setEndDate" :datetime="params.end_date" label="End date" ></collabmed-date-time-picker>
            </v-col>

            <v-col md="2" class="mx-3">
                <v-btn color="primary" class="px-2" @click="initialize()">filter</v-btn>
            </v-col>
        </v-card-title>

        <collabmed-loading v-if="!vitals.data"></collabmed-loading>

        <v-data-table v-else :headers="headers"
                      :items="vitals.data"
                      hide-default-footer>

        </v-data-table>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    props: [
        'patient_id',
    ],

    data: () => ({
        params: {
            start_date: '',
            end_date: '',
            patient_id: window.location.href.substring(window.location.href.lastIndexOf('/') + 1),
        },
        headers: [
            { text: 'Bp Systolic', value: 'bp_systolic' },
            { text: 'Bp Diastolic', value: 'bp_diastolic' },
            { text: 'Temperature', value: 'temperature' },
            { text: 'Weight', value: 'weight' },
            { text: 'height', value: 'height' },
            { text: 'Date', value: 'date' },
        ],
    }),

    computed: {
        ...mapGetters({
            vitals: 'getVitals',
        }),
    },

    methods: {
        ...mapActions([
            'setVitals',
        ]),

        setStartDate(datetime) {
            this.params.start_date = datetime;
        },

        setEndDate(datetime) {
            this.params.end_date = datetime;
        },

        initialize() {
            this.setVitals({
                page: 1,
                params: this.params,
            });
        },
    },

    mounted() {
        this.initialize();
    },
};
</script>
