<template>
    <v-card>
        <v-card-title class="text-bold grey--text text--darken-1">
            Add a new test unit
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <test-unit-form :isUnit="null"></test-unit-form>
        </v-card-text>
    </v-card>
</template>

<script>
import TestUnitForm from './partials/LabTestUnitForm';
export default {
    name: 'test-category-create',

    components: {
        'test-unit-form': TestUnitForm,
    },

    data() {
        return {

        };
    },
};
</script>
