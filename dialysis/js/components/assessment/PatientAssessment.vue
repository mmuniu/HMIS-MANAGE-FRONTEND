<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <div v-else>
        <v-row >
            <v-col cols="12">
                <v-card>
                    <v-container fluid>
                        <v-row >
                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">
                                    Weight before session
                                </label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Pre dialysis weight"
                                              outline v-model="assess.patient.pre_dialysis_weight"
                                              :error="errors.has('patient.pre_dialysis_weight')"
                                              :hint="errors.get('patient.pre_dialysis_weight')"
                                              persistent-hint @keyup="errors.clear('patient.pre_dialysis_weight')">
                                </v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Target weight</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Dry weight"
                                              outline
                                              v-model="assess.patient.dry_weight"
                                              :error="errors.has('patient.dry_weight')"
                                              :hint="errors.get('patient.dry_weight')"
                                              persistent-hint @keyup="errors.clear('patient.dry_weight')">
                                </v-text-field>
                            </v-col>
                        </v-row>

                        <v-divider class="mt-0"></v-divider>

                        <v-row >
                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">
                                    Chest pains
                                </label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Chest Pains"
                                              outline
                                              v-model="assess.patient.chest_pains">
                                </v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">
                                    Blood pressure
                                </label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="BP"
                                              outline
                                              v-model="assess.patient.blood_pressure">
                                </v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Dyspnoea</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Dyspnoea" outline v-model="assess.patient.dyspnoea"></v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Coughing</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Coughing" outline v-model="assess.patient.coughing"></v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Fluid overload</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Fluid Overload" outline
                                              v-model="assess.patient.fluid_overload">
                                </v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Dry mouth</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Dry Mouth" outline
                                              v-model="assess.patient.dry_mouth">
                                </v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Nausea</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Nausea" outline v-model="assess.patient.nausea"></v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Vomiting</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Vomiting" outline v-model="assess.patient.vomiting"></v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Ascites</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Ascites" outline v-model="assess.patient.ascites"></v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Headache</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Headache" outline v-model="assess.patient.headache"></v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Insomnia</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Insomnia" outline v-model="assess.patient.insomnia"></v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Restless leag</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Restless leg" outline
                                              v-model="assess.patient.restless_leg">
                                </v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Disorientation</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Disorientation" outline
                                              v-model="assess.patient.disorientation">
                                </v-text-field>
                            </v-col>
                        </v-row>

                        <v-col class="text-right" cols="12" >
                            <v-btn class="blue" :disabled="loading" :dark="!loading"
                                   :loading="loading" @click.prevent="save()">
                                Finalise Assessment
                            </v-btn>
                        </v-col>

                    </v-container>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { assessment_mixin } from "@dialysis/components/assessment/mixins/assessment_mixin";

export default {
    mixins: [
        assessment_mixin,
    ],

    computed: {
        initialised() {
            return true;
        },
    },

    mounted() {
        this.initialisePage("patient");
    },
};
</script>

<style scoped>

</style>
