<template>
    <v-container fluid>
        <v-row >
            <v-col cols="12" md="4">
                <reception-patient-info :patient-id="patientId"></reception-patient-info>
            </v-col>

            <v-col cols="12" md="8">
                <visit-create-form :patient="patient" :userId="userId" :facilityId="facilityId" :morgue="morgue" :patientVisitData="null"></visit-create-form>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import VisitCreateForm from './partials/VisitForm';

export default {
    props: [
        'patient', 'userId', 'facilityId', 'morgue'
    ],

    components: {
        VisitCreateForm,
    },

    computed: {

        patientId() {
            return JSON.parse(this.patient).id;
        },
    },
};
</script>
