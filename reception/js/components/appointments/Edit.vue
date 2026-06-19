<template>
    <v-card flat>
        <v-card-text>
            <create-appointment-form :appointmentData="appointment"
                                     :doctorName="doctorName"
                                     :patientName="patientName"
            ></create-appointment-form>
        </v-card-text>
    </v-card>
</template>
<script>
import CreateAppointmentForm from './partials/CreateAppointmentForm';

export default {
    props: [
        'appointmentdata', 'patientName', 'doctorName'
    ],

    computed: {
        appointment() {
            return JSON.parse(this.appointmentdata);
        },
    },

    components: {
        CreateAppointmentForm,
    },
};
</script>
