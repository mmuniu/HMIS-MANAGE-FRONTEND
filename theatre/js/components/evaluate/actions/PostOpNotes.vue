<template>
    <v-row>
        <v-col>
            <pre-post-theatre-care></pre-post-theatre-care>
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
