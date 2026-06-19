<template>
    <form @submit.prevent="isCategory ? updateCategory() : saveCategory()">
        <v-row >
            <v-col cols="12" md="4">
                <div class="mx-3">
                    <v-text-field label="Category name" v-model="labTestCategory.name" :error="errors.has('name')" outline
                                  :hint="errors.get('name')" persistent-hint @keyup="errors.clear('name')"></v-text-field>
                </div>
            </v-col>

            <v-col cols="12" md="8">
                <div class="mx-3">
                    <v-text-field label="Category description" v-model="labTestCategory.description" outline></v-text-field>
                </div>
            </v-col>

            <v-col offset-md="10" cols="12" md="2" class="text-right">
                <div class="mx-2">
                    <v-btn v-if="!isCategory" type="submit" class="blue lighten-1" color="blue" large
                           :dark="!loader" :loading="loader" :disabled="loader">
                        Save category
                    </v-btn>

                    <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                           :dark="!loader" :loading="loader" :disabled="loader">
                        Edit category
                    </v-btn>
                </div>
            </v-col>
        </v-row>
    </form>
</template>

<script>
import { mapActions } from 'vuex';
import LabTestCategory from '@evaluation/libs/setup/lab_test_categories/LabTestCategory';

export default {
    name: 'test-category-form',

    props: [
        'isCategory',
    ],

    data() {
        return {
            labTestCategory: new LabTestCategory(),
            loader: false,
        };
    },

    watch: {
        contaminated(value) {
            if (value) {
                this.loader = false;
                this.labTestCategory.form.errorDetected = false;
            }
        },

        submitted(value) {
            if (value) {
                this.loader = false;
                this.labTestCategory.form.submitted = false;
                this.setLabTestCategories();
            }
        },
    },

    computed: {
        errors() {
            return this.labTestCategory.form.errors;
        },

        submitted() {
            return this.labTestCategory.form.submitted;
        },

        contaminated() {
            return this.labTestCategory.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            'setLabTestCategories',
        ]),

        saveCategory() {
            this.loader = true;
            this.labTestCategory.save();
        },

        updateCategory() {
            this.loader = true;
            this.labTestCategory.update();
        },

        initializePage() {
            const category = this.isCategory;

            if (category) {
                this.labTestCategory.assemble(category);
            }
        },
    },

    mounted() {
        this.initializePage();
    },
};
</script>
