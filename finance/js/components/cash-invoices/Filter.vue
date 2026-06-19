<template>
    <v-card flat>
        <v-card-title>
            <v-col cols="9" md="4">
                <patient-search @patientSelected="patientSelected"></patient-search>
            </v-col>

            <v-spacer/>
            <v-btn small color="primary"
                   @click="resetFilters()"
                   rounded>Reset filter</v-btn>
        </v-card-title>
    </v-card>
</template>
<script>
    import PatientSearch from "@reception/components/patients/PatientSearch";

    export default {
        components: {
            PatientSearch
        },

        methods: {
            patientSelected(patient) {

                const url = window.location.origin + window.location.pathname + '?patient_id=' + patient.id;

                window.open(url, '_self');
            },

            resetFilters() {
                window.open(window.location.origin + window.location.pathname, '_self');
            }
        }
    }
</script>
