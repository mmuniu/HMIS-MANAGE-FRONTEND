
<template>
    <div v-if="!initialised"></div>

    <div v-else>
        <form @submit.prevent="!appointmentData ? saveAppointment() : updateAppointment()">
            <v-row >
                <v-col cols="12" md="3">
                    <div class="mx-3">
                        <patient-search
                                outline
                                :placeholder="patientName ? patientName : 'Search for patient'"
                                @patientSelected="patientSelected($event)">
                        </patient-search>
                    </div>
                </v-col>
                <v-col cols="12" md="3" class="text-center">
                    <div class="mx-3">
                        <h3 class="grey--text">--OR--</h3>
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <div class="mx-3">
                        <v-text-field label="External Patient"
                                      v-model="appointment.ext_patient"
                                      hint="Only use this option when completely sure that the patient isn't previously captured"
                                      placeholder="Full name">
                        </v-text-field>
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <div class="mx-3">
                        <v-autocomplete label="Clinic"
                                        :items="facilities.facilities"
                                        v-model="appointment.clinic" item-text="name"
                                        item-value="id"
                                        >
                        </v-autocomplete>
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <div class="mx-3">
                        <users-search outlined @results="userSelected($event)"
                                      :placeholder="doctorName ? doctorName : ''"
                                      label="Search and select doctor" role="doctor"
                                      leaveSelected></users-search>
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <div class="mx-3">
                        <v-select label="Category"
                                  :items="categories" item-text="name" item-value="id"
                                  v-model="appointment.category_id"
                        ></v-select>
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <collabmed-date-time-picker @input="setDate"
                                                :placeholder="appointment.schedule_date"
                                                :datetime="date" label="Date">
                    </collabmed-date-time-picker>
                </v-col>

                <v-col cols="12" md="9">
                    <div class="mx-3">
                        <v-textarea label="Instructions"
                                    v-model="appointment.instructions"
                                    placeholder="Title to show">
                        </v-textarea>
                    </div>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="1">
                    <v-btn large color="error" @click="goBack()">cancel</v-btn>
                </v-col>

                <v-col cols="11" class="text-right">
                    <div class="mx-3">
                        <v-btn v-if="!appointmentData" type="submit" class="primary lighten-1" color="blue" large
                               :dark="!loader" :loading="loader" :disabled="loader">
                            Save
                        </v-btn>

                        <v-btn v-else type="submit" class="primary lighten-1" color="blue" large
                               :dark="!loader" :loading="loader" :disabled="loader">
                            update
                        </v-btn>
                    </div>
                </v-col>
            </v-row>
        </form>
    </div>
</template>
<script>
import Appointment from '@reception/libs/appointments/Appointments';
import PatientSearch from '@reception/components/patients/PatientSearch.vue';
import { mapGetters, mapActions } from 'vuex';

export default {
    props: [
        'appointmentData', 'patientName', 'doctorName'
    ],

    components: {
        PatientSearch,
    },

    data: () => ({
        appointment: new Appointment(),
        loader: false,
        date: null,
    }),

    watch: {
        contaminated(value) {
            if (value) {
                this.loader = false;
                this.appointment.form.errorDetected = false;
            }
        },

        submitted(value) {
            if (value) {
                this.loader = false;
                this.appointment.form.submitted = false;
            }
        },

        appointmentData(val) {
            this.appointment.editAppointment(val);
        },
    },

    computed: {
        ...mapGetters({
            facilities: 'getFacilities',
            users: 'getUsers',
            categories: 'getAppointmentCategories',
        }),

        errors() {
            return this.appointment.form.errors;
        },

        submitted() {
            return this.appointment.form.submitted;
        },

        initialised() {
            return this.facilities;
        },

        contaminated() {
            return this.appointment.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            'setFacilities', 'setUsers', 'setAppointmentCategories',
        ]),

        goBack() {
            window.history.back();
        },

        patientSelected(patient) {
            this.appointment.patient_id = patient.id;
        },

        userSelected(doctor) {
            if (doctor) {
                this.appointment.doctor_id = doctor.id;
            }
        },

        setDate: function(datetime) {
            this.appointment.schedule_date = datetime;
        },
        async saveAppointment() {
            this.loader = true;

            await this.appointment.save();

            this.loader = false;
        },

        async updateAppointment() {
            this.loader = true;

            await this.appointment.updateAppointment(this.appointmentData.id);

            this.loader = false;
        },
    },

    mounted() {
        this.setFacilities();
        this.appointment.editAppointment(this.appointmentData);
        this.setUsers();
        this.setAppointmentCategories();
    },
};
</script>
