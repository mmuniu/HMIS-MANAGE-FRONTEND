<template>
    <div v-if="!initialised"></div>

    <div v-else>
        <v-card flat>
            <v-card-title class="text-bold grey--text text--darken-1">
                <v-row class="mx-3">
                    <v-col cols="3">
                        <v-text-field label="External patient"
                                      placeholder="External patient"
                                      v-model="filters.ext_patient">
                        </v-text-field>
                    </v-col>
                    <v-col cols="3">
                        <patient-search outline @patientSelected="patientSelected($event)"></patient-search>
                    </v-col>
                    <v-col cols="3">
                        <users-search @results="userSelected" label="Doctor"
                                      :leave-selected="true"
                                      @clearedSelected="userSelectionCleared">
                        </users-search>
                    </v-col>
                    <v-col md="2">
                        <collabmed-date-time-picker @input="setStartDate" outline :datetime="filters.start_date" label="From"></collabmed-date-time-picker>
                    </v-col>

                    <v-col md="2">
                        <collabmed-date-time-picker @input="setEndDate" outline :datetime="filters.end_date" label="To"></collabmed-date-time-picker>
                    </v-col>

                    <v-col cols="1">
                        <v-btn class="px-4 primary" @click="initialise()">filter</v-btn>
                    </v-col>
                </v-row>
                <v-spacer></v-spacer>
                <v-btn small class="mx-2" color="primary" @click="newAppointment()">
                    <v-icon small>add</v-icon>New
                </v-btn>
                <v-btn small class="mx-2" color="primary" @click="printAppointmentsList()">
                    <v-icon small>print</v-icon> print
                </v-btn>
            </v-card-title>


            <v-card-title class="subheading grey-text text-darken-2">
                <span style="font-size: 15px" class="body-2 ma-0 pa-0">
                    Made appointments list
                </span>
                <v-spacer></v-spacer>
            </v-card-title>

            <v-divider class="my-0"></v-divider>

            <v-card-text>
                <v-data-table
                        :headers="headers" :items="appointments.data"
                        class="mb-3" flat
                        disable-pagination
                        hide-default-footer
                >
                    <template v-slot:item.status="{ item }" >
                        <v-chip small color="primary" outlined v-if="item.status === 'Active'"> {{ item.status }}</v-chip>
                        <v-chip small color="error" outlined v-else> {{ item.status }}</v-chip>
                    </template>
                    <template v-slot:item.actions="{ item }">
                        <v-btn class="mx-0 primary" slot="activator" dark small @click="editAppointment(item)">
                            edit
                        </v-btn>
                        <v-btn class="mx-0 error"
                               v-if="item.status === 'Active'"
                               slot="activator"
                               dark
                               small
                               @click="deleteAppointment(item)">
                            delete
                        </v-btn>
                        <v-btn v-else small color="error" disabled>
                            delete
                        </v-btn>
                    </template>
                    <template v-slot:footer>
                        <collabmed-paginator v-if="appointments.meta" :meta="appointments.meta" @change="navigate" ></collabmed-paginator>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import Appointment from '@reception/libs/appointments/Appointments';
import PatientSearch from '@reception/components/patients/PatientSearch.vue';
import moment from 'moment';

export default {
    components: {
        PatientSearch,
    },

    data: () => ({
        page: 1,
        appointment: new Appointment(),
        filename: 'List of appointments',
        print_title: 'Appointments list',
        filters: {
            patient_id: null,
            ext_patient: null,
            all_appointments: false,
            doctor_id: null,
            start_date: moment(new Date()).startOf('day').format('YYYY-MM-DD HH:MM'),
            end_date: moment(new Date()).endOf('month').format('YYYY-MM-DD HH:MM'),
        },
        headers: [
            { text: 'Patient', value: 'patient' },
            { text: 'Category', value: 'category' },
            { text: 'Scheduled Date', value: 'scheduled_date' },
            { text: 'Doctor', value: 'doctor' },
            { text: 'Instructions', value: 'instructions' },
            { text: 'Status', value: 'status' },
            { text: 'Created By', value: 'user' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    computed: {
        ...mapGetters({
            appointments: 'getAppointments',
        }),

        initialised() {
            return true;
        },
    },

    methods: {
        ...mapActions([
            'setAppointments',
        ]),

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },

        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        userSelected(user) {
            this.filters.doctor_id = user.id;
        },

        userSelectionCleared() {
            this.filters.doctor_id = null;
        },

        newAppointment() {
            window.location.href = '/reception/appointments/create';
        },

        printAppointmentsList() {
            let url = `/reception/appointments/print-appointments?`;

            const params = _.omitBy(this.filters, _.isNil);

            params.export = true;

            for (const [key, value] of Object.entries(params)) {
                url = url + key + '=' + value + '&';
            }

            window.open(url, '_blank');
        },

        patientSelected(patient) {
            this.filters.patient_id = patient.id;
        },

        navigate(page) {
            this.page = page,
            this.initialise();
        },

        initialise() {
            const params = _.omitBy(this.filters, _.isNil);

            this.setAppointments({
                page: this.page,
                params: params,
            });
        },

        async deleteAppointment(appointment) {
            const response = await this.appointment.destroyAppointment(appointment);

            if (response) {
                this.initialise();
            }
        },

        editAppointment(data) {
            window.location.href = '/reception/appointments/' + data.id + '/edit';
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>
