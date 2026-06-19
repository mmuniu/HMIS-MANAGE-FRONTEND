<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-row  v-else>
        <v-col>
            <v-card class="py-3">
                <v-card-text>
                    <v-row  >
                        <v-col cols="6">
                            <v-row  class="px-4">
                                <v-col cols="12">
                                    <v-text-field label="Weight"
                                                  v-model="vital.weight"
                                                  outline
                                                  suffix="Kgs"
                                                  @change="vital.save()">
                                    </v-text-field>
                                </v-col>

                                <v-col cols="12">
                                    <v-text-field label="Height"
                                                  v-model="vital.height" outline
                                                  :suffix="msetting('evaluation.use_centimetres_instead_of_metres_under_vitals') ? 'Centimeters ' : 'meters'"
                                                  @change="vital.save()">
                                    </v-text-field>
                                </v-col>

                                <v-col cols="12">
                                    <v-text-field label="BP Systolic"
                                                  v-model="vital.bp_systolic"
                                                  hint="Normal range: (90 - 139)"
                                                  persistent-hint
                                                  outline suffix="mm/hg"
                                                  @change="vital.save()">
                                    </v-text-field>
                                </v-col>

                                <v-col cols="12">
                                    <v-text-field
                                            label="BP Diastolic"
                                            v-model="vital.bp_diastolic"
                                            hint="Normal range: (60 - 89)"
                                            persistent-hint
                                            outline suffix="mm/hg"
                                            @change="vital.save()">
                                    </v-text-field>
                                </v-col>

                                <v-col cols="12">
                                    <v-text-field
                                            label="Body Fat"
                                            v-model="vital.body_fat"
                                            hint="(Male 8 -20, Female: < 30)"
                                            persistent-hint
                                            outline
                                            @change="vital.save()">
                                    </v-text-field>
                                </v-col>

                                <v-col cols="12">
                                    <v-text-field
                                            label="Muscle Mass"
                                            hint="(Male > 47, Female: < 37)"
                                            persistent-hint
                                            v-model="vital.muscle_mass"
                                            outline
                                            @change="vital.save()">
                                    </v-text-field>
                                </v-col>

                                <v-col cols="12">
                                    <v-text-field
                                            label="Bone Mass"
                                            hint="(Male > 1.7, Female: < 1.5)"
                                            persistent-hint
                                            v-model="vital.bone_mass"
                                            outline
                                            @change="vital.save()">
                                    </v-text-field>
                                </v-col>

                            </v-row>
                        </v-col>

                        <v-col cols="6">

                            <v-col cols="12">
                                <v-text-field
                                        label="Metabolic Age"
                                        v-model="vital.metabolic_age"
                                        outline
                                        @change="vital.save()">
                                </v-text-field>
                            </v-col>

                            <v-col cols="12">
                                <v-text-field
                                        label="Body water"
                                        hint="(Male 55% - 65%, Female: < 50% - 65%)"
                                        persistent-hint
                                        v-model="vital.body_water"
                                        outline
                                        @change="vital.save()">
                                </v-text-field>
                            </v-col>

                            <v-col cols="12">
                                <v-text-field
                                        label="Visceral Fat"
                                        hint="Normal range: 1 - 13"
                                        persistent-hint
                                        v-model="vital.visceral_fat"
                                        outline
                                        @change="vital.save()">
                                </v-text-field>
                            </v-col>

                            <v-col cols="12">
                                <v-text-field
                                        class="wellness"
                                        label="Blood Sugar"
                                        hint="(R.B.S: 4.0 - 11.0 mmol/L, F.B.S: 3.5 - 7.0 MMOL/L)"
                                        persistent-hint
                                        v-model="vital.blood_sugar"
                                        outline
                                        @change="vital.save()">
                                </v-text-field>
                            </v-col>

                            <v-divider></v-divider>

                            <v-col cols="12">
                                <v-row >

                                    <v-col cols="5">
                                        <label class="mid-center font-weight-regular subheading mt-3">BMI: </label>
                                    </v-col>
                                    <v-col cols="7">
                                        <label class="mid-center font-weight-regular subheading mt-3" v-text="bmi"></label>
                                    </v-col>

                                    <v-col cols="5">
                                        <label class="mid-center font-weight-regular subheading mt-3">BMI Status: </label>
                                    </v-col>
                                    <v-col cols="7">
                                        <label class="mid-center font-weight-regular subheading mt-3" v-text="bmiStatus"></label>
                                    </v-col>

                                    <v-col cols="5">
                                        <label class="mid-center font-weight-regular subheading mt-3">Waist/Hip ratio: </label>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>

</template>

<script>
    import Vital from '@evaluation/libs/vitals/Vital';
    import Visit from '@reception/libs/visits/Visit';
    import { _ } from 'vue-underscore';

    export default {
        data() {
            return {
                saveLoader: false,
                vital: new Vital(),
                visitObj: new Visit(),
            };
        },

        watch: {
            submitted() {
                this.saveLoader = false;
            },

            visit(value) {
                if (value) {
                    const vitals = value.vitals;
                    this.vital.populate(vitals);
                }
            },
        },

        computed: {
            initialised() {
                return this.visit
            },

            bmi() {
                if (this.vital.weight && this.vital.height) {
                    const bmi = (this.vital.weight / (this.vital.height * this.vital.height)).toFixed(2);

                    return bmi;
                }

                return 'N/A';
            },

            bmiStatus() {
                let status = 'N/A';

                if (this.bmi) {
                    _.each(this.vital.bmi_indices, (values, index) => {
                        if (this.bmi > values[0] && this.bmi < values[1]) {
                            status = index;
                        }
                    });
                }

                return status;
            },

            visit() {
                return this.visitObj.selectedVisit;
            },

            selectedVisit() {
                return this.visitObj.selectedVisit;
            },

            errors() {
                return this.vital.form.errors;
            },

            submitted() {
                return this.vital.form.submitted;
            },

            contaminated() {


                return this.vital.form.errorDetected;
            },


        },

        mounted() {
            this.vital.visit = this.$route.params.visitId;
            this.visitObj.find(this.vital.visit);
        },
    };
</script>

<style scoped lang="scss">

    .wellness .theme--light.v-messages {
        color: #1d00ff !important;
    }

    .wellness {
        .v-text-field__details {
            .theme--light.v-messages {
                color: #1d00ff !important;
            }
        }
    }
</style>
