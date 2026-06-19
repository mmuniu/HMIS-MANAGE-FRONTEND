<template>
    <div>
        <v-card>
            <v-card-title>
                <v-row>
                   <!-- <v-col md="2">
                        <collabmed-date-time-picker outline v-model="params.start_date" label="Start date"></collabmed-date-time-picker>
                    </v-col>

                    <v-col md="2">
                        <collabmed-date-time-picker outline v-model="params.end_date" label="End date"></collabmed-date-time-picker>
                    </v-col>-->

                    <v-col class="mx-1" md="3" >
                        <patient-search @patientSelected="selectedPatient($event)"></patient-search>
                    </v-col>

                    <v-col>
                        <v-btn small color="success" @click="filter()">Filter</v-btn>
                        <contact-tracing @traced="newContactAdded()"></contact-tracing>
                    </v-col>
                </v-row>
            </v-card-title>

            <collabmed-loading v-if="!contacts.data"></collabmed-loading>

            <v-data-table v-else :headers="headers"
                          disable-pagination
                          :items="contacts.data"
                          hide-default-footer>
                <template v-slot:item.mobile="{ item }">
                    <span>Primary: {{ item.mobile }}</span><!--<br/>
                    <span>Secondary: {{ item.telephone }}</span>-->
                </template>
                <template v-slot:item.email="{ item }">
                    <span>Primary: {{ item.email }}</span><!--<br/>
                    <span>Secondary: {{ item.secondary_email }}</span>-->
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn small color="primary" @click="manage(item)"> manage </v-btn>
                </template>

                <template slot="footer">
                    <collabmed-paginator :meta="contacts.meta" v-if="contacts.meta" @change="navigate"></collabmed-paginator>
                </template>
            </v-data-table>
        </v-card>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import ContactTracing from './ContactTracing';
import PatientSearch from '@reception/components/patients/PatientSearch.vue';

export default {
    components: {
        ContactTracing, PatientSearch
    },

    data: () => ({
        page: 1,
        params: {
            patient_id: null,
            start_date: null,
            end_date: null
        },
        headers: [
            { text: 'Patient', value: 'patient' },
            { text: 'Mobile', value: 'mobile' },
            { text: 'Email', value: 'email' },
            { text: 'Traced individuals', value: 'traced_contacts' },
            { text: 'Contacted individuals', value: 'contacted_contacts' },
            // { text: 'Location', value: 'location' },
            { text: 'No. Trackees', value: 'trackees' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    computed: {
        ...mapGetters({
            contacts: 'getContactTracing',
        }),
    },

    watch: {
        page () {
            this.initialize();
        }
    },

    methods: {
        ...mapActions([
            'setContactTracing',
        ]),

        selectedPatient (patient) {
            this.params.patient_id = patient.id
        },

        manage(item) {
            window.open('/reception/contact-tracing/' + item.id + '/manage', '_self');
        },

        navigate(page) {
            this.page = page;
        },

        newContactAdded() {
            this.initialize();
        },

        filter () {
           this.initialize();
        },

        initialize() {

            this.setContactTracing({
                page: this.page,
                params:  _.omitBy(this.params, _.isNil)
            });
        },
    },

    mounted() {
        this.initialize();
    },
};
</script>
