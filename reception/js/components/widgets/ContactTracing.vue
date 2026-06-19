<template>
    <v-col cols="12" class="my-4" md="6">
        <collabmed-loading v-if="!list"></collabmed-loading>

        <base-material-card
                v-else
                class="px-5 py-3"
        >
            <v-card-title class="info white--text" style="margin-top: -50px; border-radius: 8px; box-shadow: 4px 0px 10px 3px #d4d2d2">
                <div class="display-1 font-weight-bold">
                    Patient contact tracing
                </div>

                <div class="subtitle-1 font-weight-light">
                    List of contacts to the affected patients
                </div>
            </v-card-title>
            <v-card-text>
                <v-data-table :headers="headers" :items="list.data" :items-per-page="5">
                    <template v-slot:item.actions="{ item }">
                        <v-btn small color="primary" @click="manage(item)"> manage </v-btn>
                    </template>
                </v-data-table>
            </v-card-text>
        </base-material-card>
    </v-col>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    data: () => ({
        list: null,
        headers: [
            { text: 'Contact name', value: 'contact' },
            { text: 'Mobile', value: 'mobile' },
            { text: 'Patient', value: 'patient' },
            { text: 'Location', value: 'location' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    watch: {
        contacts(val) {
            this.list = val;
        },
    },

    computed: {
        ...mapGetters({
            contacts: 'getContactTracing',
        }),

        covidEnabled() {
            return this.mconfig('settings.config.enable_covid_setup');
        },

        title() {
            return this.covidEnabled ? 'Screenings today' : 'Visits today';
        },
    },

    methods: {
        ...mapActions([
            'setContactTracing',
        ]),

        manage(item) {
            window.open('/reception/contact-tracing/' + item.id + '/manage', '_self');
        },

        reviewPatient(patient_id) {
            window.open(`/reception/visits?patient_id=${patient_id}`, '_self');
        },
    },

    mounted() {
        this.setContactTracing();
    },
};
</script>
