<template>
    <v-row>
        <v-col cols="8">
            <pre-post-theatre-care></pre-post-theatre-care>
        </v-col>
        <v-col cols="4">
            <patient-meta :patient-id="patientId"></patient-meta>
        </v-col>
    </v-row>
</template>
<script>
import PrePostTheatreCare from './partials/PrePostTheatreCare';

export default {
    props: ['visitId', 'patientId', 'paymentMode'],

    components: {
        PrePostTheatreCare
    }
}
</script>
