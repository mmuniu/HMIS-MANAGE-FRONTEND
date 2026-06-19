<template>
    <v-card>
        <v-card-title class="text-bold grey--text text--darken-1">
            Update a test unit
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <test-unit-form :isUnit="isUnit"></test-unit-form>
        </v-card-text>
    </v-card>
</template>

<script>
import TestUnitForm from './partials/LabTestUnitForm';

export default {
    name: 'test-unit-create',

    props: [
        'isUnit',
    ],

    components: {
        'test-unit-form': TestUnitForm,
    },
};
</script>
