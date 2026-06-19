<template>
    <div v-if="patient">
        <patient-form :profile="patient" :editing-mode="true"></patient-form>
    </div>
</template>

<script>
import PatientForm from './partials/PatientForm';
import Patient from '@reception/libs/patients/Patient';

export default {
    props: {
        patientId: {
            required: true,
        },
    },

    components: { 'patient-form': PatientForm },


    data() {
        return {
            patientObj: new Patient(),
            saveLoader: false,
        };
    },

    computed: {
        patient() {
            return this.patientObj.patient;
        },

        submitted() {
            return this.patientObj.form.submitted;
        },

        contaminated() {
            return this.patientObj.form.errorDetected;
        },

        errors() {
            return this.patientObj.form.errors;
        },
    },

    watch: {
        submitted() {
            this.saveLoader = false;
        },
    },

    methods: {

    },

    mounted() {
        if (this.patientId) {
            this.patientObj.find(this.patientId);
        }
    },
};
</script>
