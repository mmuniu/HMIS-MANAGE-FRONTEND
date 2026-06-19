<template>
    <v-card class="mb-4">
        <v-card-title>
            Select patient below if patient already exists
            <span style="font-size: 11px; font-style: italic"> ( Must have been indicated as deceased )</span>
        </v-card-title>
        <v-card-text>
            <div>
                <patient-search @patientSelected="selectedPatient($event)" morgue></patient-search>
            </div>
            <div class="mt-2">
                <v-btn :disabled="!patientId" small color="success" @click="checkin">Checkin</v-btn>

            </div>
        </v-card-text>
    </v-card>
</template>
<script>
import PatientSearch from '@reception/components/patients/PatientSearch.vue';

export default {
    components: {
        PatientSearch,

    },

    data () {
        return {
            patientId: null,
        }
    },

    methods: {
        selectedPatient(patient) {

            this.patientId = patient ? patient.id : '';
        },

        checkin () {
            window.location = route('reception.patient.visits.create', this.patientId);
        }
    }
}
</script>
