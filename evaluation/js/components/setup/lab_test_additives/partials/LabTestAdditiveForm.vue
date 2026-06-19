<template>
    <form @submit.prevent="!isAdditive ? saveAdditive() : updateAdditive()">
        <v-row >
            <v-col cols="12" md="4">
                <div class="mx-3">
                    <v-text-field label="Additive name" v-model="labTestAdditive.name" :error="errors.has('name')" outline
                                  :hint="errors.get('name')" persistent-hint @keyup="errors.clear('name')"></v-text-field>
                </div>
            </v-col>

            <v-col cols="12" md="8">
                <div class="mx-3">
                    <v-text-field label="Additive description" v-model="labTestAdditive.description" outline></v-text-field>
                </div>
            </v-col>

            <v-col offset-md="10" cols="12" md="2" class="text-right">
                <div class="mx-2">
                    <v-btn v-if="!isAdditive" type="submit" class="blue lighten-1" color="blue" large
                           :dark="!loader" :loading="loader" :disabled="loader">
                        Save additive
                    </v-btn>

                    <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                           :dark="!loader" :loading="loader" :disabled="loader">
                        Edit additive
                    </v-btn>
                </div>
            </v-col>
        </v-row>
    </form>
</template>

<script>
import { mapActions } from 'vuex';
import LabTestAdditive from '@evaluation/libs/setup/lab_test_additives/LabTestAdditive';

export default {
    name: 'test-additive-form',

    props: [
        'isAdditive',
    ],

    data() {
        return {
            labTestAdditive: new LabTestAdditive(),
            loader: false,
        };
    },

    watch: {
        contaminated(value) {
            if (value) {
                this.loader = false;
                this.labTestAdditive.form.errorDetected = false;
            }
        },

        submitted(value) {
            if (value) {
                this.loader = false;
                this.labTestAdditive.form.submitted = false;
                this.setLabTestAdditives();
            }
        },
    },

    computed: {
        errors() {
            return this.labTestAdditive.form.errors;
        },

        submitted() {
            return this.labTestAdditive.form.submitted;
        },

        contaminated() {
            return this.labTestAdditive.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            'setLabTestAdditives',
        ]),

        saveAdditive() {
            this.loader = true;
            this.labTestAdditive.save();
        },

        updateAdditive() {
            this.loader = true;
            this.labTestAdditive.update();
        },

        initializePage() {
            const additive = this.isAdditive;

            if (additive) {
                this.labTestAdditive.assemble(additive);
            }
        },
    },

    mounted() {
        this.initializePage();
    },
};
</script>
