<template>
    <v-card>
        <v-card-title class="subheading grey--text text--darken-3">
            Update measurement unit
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <measurement-unit-form :isMeasurementUnit="isMeasurementUnit"></measurement-unit-form>
        </v-card-text>
    </v-card>
</template>

<script>
import MeasurementUnitForm from "./partials/MeasurementUnitForm";

export default {
    props: [
        "isMeasurementUnit",
    ],

    components: {
        "measurement-unit-form": MeasurementUnitForm,
    },
};
</script>
