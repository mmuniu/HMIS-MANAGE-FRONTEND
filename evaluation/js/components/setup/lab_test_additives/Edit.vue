<template>
    <v-card>
        <v-card-title class="text-bold grey--text text--darken-1">
            Update a test additive
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <test-additive-form :isAdditive="isAdditive"></test-additive-form>
        </v-card-text>
    </v-card>
</template>

<script>
import TestAdditiveForm from './partials/LabTestAdditiveForm';
export default {
    name: 'test-unit-create',

    props: [
        'isAdditive',
    ],

    components: {
        'test-additive-form': TestAdditiveForm,
    },
};
</script>
