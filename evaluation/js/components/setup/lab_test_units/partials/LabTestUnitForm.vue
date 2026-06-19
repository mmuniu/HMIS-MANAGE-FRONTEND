<template>
    <form @submit.prevent="!isUnit ? saveUnit() : updateUnit()">
        <v-row >
            <v-col cols="12" md="4">
                <div class="mx-3">
                    <v-text-field label="Unit name" v-model="labTestUnit.name" :error="errors.has('name')" outline
                                  :hint="errors.get('name')" persistent-hint @keyup="errors.clear('name')"></v-text-field>
                </div>
            </v-col>

            <v-col cols="12" md="8">
                <div class="mx-3">
                    <v-text-field label="Unit description" v-model="labTestUnit.description" outline></v-text-field>
                </div>
            </v-col>

            <v-col offset-md="10" cols="12" md="2" class="text-right">
                <div class="mx-2">
                    <v-btn v-if="!isUnit" type="submit" class="blue lighten-1" color="blue" large
                           :dark="!loader" :loading="loader" :disabled="loader">
                        Save unit
                    </v-btn>

                    <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                           :dark="!loader" :loading="loader" :disabled="loader">
                        Edit unit
                    </v-btn>
                </div>
            </v-col>
        </v-row>
    </form>
</template>

<script>
import { mapActions } from 'vuex';
import LabTestUnit from '@evaluation/libs/setup/lab_test_units/LabTestUnit';

export default {
    name: 'test-unit-form',

    props: [
        'isUnit',
    ],

    data() {
        return {
            labTestUnit: new LabTestUnit(),
            loader: false,
        };
    },

    watch: {
        contaminated(value) {
            if (value) {
                this.loader = false;
                this.labTestUnit.form.errorDetected = false;
            }
        },

        submitted(value) {
            if (value) {
                this.loader = false;
                this.labTestUnit.form.submitted = false;
                this.setLabTestUnits();
            }
        },
    },

    computed: {
        errors() {
            return this.labTestUnit.form.errors;
        },

        submitted() {
            return this.labTestUnit.form.submitted;
        },

        contaminated() {
            return this.labTestUnit.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            'setLabTestUnits',
        ]),

        saveUnit() {
            this.loader = true;
            this.labTestUnit.save();
        },

        updateUnit() {
            this.loader = true;
            this.labTestUnit.update();
        },

        initializePage() {
            const unit = this.isUnit;

            if (unit) {
                this.labTestUnit.assemble(unit);
            }
        },
    },

    mounted() {
        this.initializePage();
    },
};
</script>
