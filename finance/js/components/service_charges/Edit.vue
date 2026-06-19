<template>
    <v-card class="tallest">
        <v-card-title class="subheading grey--text text--darken-3">
            Enter a new service charge
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <service-charge-form :service="charge"></service-charge-form>
        </v-card-text>
    </v-card>
</template>

<script>
import ServiceChargeForm from './partials/ServiceChargeForm';

export default {
    props: [
        'charge',
    ],

    components: {
        'service-charge-form': ServiceChargeForm,
    },
};
</script>
