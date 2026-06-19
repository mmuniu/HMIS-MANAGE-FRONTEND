<template>
    <v-card>
        <v-card-title class="text-bold grey--text text--darken-1">
            Add a new test category
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <test-category-form :isCategory="null"></test-category-form>
        </v-card-text>
    </v-card>
</template>

<script>
import TestCategoryCreateForm from './partials/LabTestCategoryForm';
export default {
    name: 'test-category-create',

    components: {
        'test-category-form': TestCategoryCreateForm,
    },

    data() {
        return {

        };
    },
};
</script>
