<template>
    <v-row >
        <v-btn
                color="error"
                dark class="ml-3"
                @click="recordModal = true"
        >
            Record Observations
        </v-btn>
    <v-dialog v-model="recordModal" absolute persistent width="750">
        <v-card>
            <v-card-title class="subheading grey--text text--darken-4">
                Document observations made
                <v-spacer></v-spacer>
                <v-btn flat icon color="red" small @click="dismissModal()">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>
            <v-divider class="my-0"></v-divider>
            <v-card-text>
                <v-form class="px-3">
                    <v-row >
                        <v-col cols="12">
                            <div class="mx-2 mb-3">
                                <v-alert
                                        :value="integrationMessage"
                                        color="info"
                                        icon="info"
                                        outline
                                >
                                    {{ integrationMessage }}
                                </v-alert>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-2">
                                <v-text-field label="Blood pressure" outline
                                              v-model="evaluator.monitoring.blood_pressure">
                                </v-text-field>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-2">
                                <v-text-field label="Pulse rate" outline
                                              v-model="evaluator.monitoring.pulse">
                                </v-text-field>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-2">
                                <v-text-field label="Temperature" outline
                                              v-model="evaluator.monitoring.temperature">
                                </v-text-field>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-2">
                                <v-text-field label="Blood flow rate" outline
                                              v-model="evaluator.monitoring.blood_flow_rate">
                                </v-text-field>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-2">
                                <v-text-field label="Transmemb. pressure" outline
                                              v-model="evaluator.monitoring.transmembrane_pressure">
                                </v-text-field>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-2">
                                <v-text-field label="Ultrafiltration" outline
                                              v-model="evaluator.monitoring.ultrafiltration">
                                </v-text-field>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-2">
                                <v-text-field label="Venous pressure" outline
                                              v-model="evaluator.monitoring.venous_pressure">
                                </v-text-field>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-2">
                                <v-text-field label="Dialysate rate" outline
                                              v-model="evaluator.monitoring.dr">
                                </v-text-field>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-2">
                                <v-text-field label="Dialysate temperature" outline
                                              v-model="evaluator.monitoring.dialysate_temperature">
                                </v-text-field>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-2">
                                <v-text-field label="Heparin" outline
                                              v-model="evaluator.monitoring.heparin">
                                </v-text-field>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-2">
                                <v-text-field label="Protamine sulphate" outline
                                              v-model="evaluator.monitoring.prot_sulp">
                                </v-text-field>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-2">
                                <v-text-field label="Fluids" outline
                                              v-model="evaluator.monitoring.fluids">
                                </v-text-field>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-2"> 
                                <collabmed-date-time-picker
                                v-model="evaluator.monitoring.coag_time"    
                                    timeOnly
                                    :datetime="date"
                                     label="Time recorded">
                                </collabmed-date-time-picker>
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="mx-2">
                            
                                    <collabmed-date-time-picker
                                    v-model="evaluator.monitoring.time"    
                                        timeOnly
                                        :datetime="date"
                                         label="Time recorded">
                                    </collabmed-date-time-picker>
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <div class="mx-2">
                                <v-textarea label="Comments" outline
                                            v-model="evaluator.monitoring.comments">
                                </v-textarea>
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <v-btn class="blue lighten-1 mt-3" color="blue"
                                   large :dark="!saveLoader" :loading="saveLoader"
                                   block :disabled="saveLoader"
                                   @click.prevent="submit()">
                                Save details
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
    </v-row>
</template>
<script>
import Evaluator from "@dialysis/libs/evaluation/Evaluator";
import { _ } from "vue-underscore";
export default {
    props: [
        "connected", "readings",
    ],
    data() {
        return {
            evaluator: new Evaluator(),
            recordModal: false,
            saveLoader: false,
            time: false,
            integrationMessage: null,
        };
    },
    watch: {
        contaminated() {
            this.saveLoader = false;
            this.evaluator.form.errors = false;
            this.evaluator.form.submitted = false;
        },
        submitted() {
            this.saveLoader = false;
            this.recordModal = false;
            this.evaluator.form.submitted = false;
            this.$emit("saved");
        },
        connected(value) {
            if (value) {
                this.recordModal = true;
                this.integrationMessage = "Readings received from integrated machine";
                _.each(this.readings, (reading, index) => {
                    this.evaluator.monitoring[index] = reading.value;
                });
            }
        },
    },
    computed: {
        visitId() {
            return this.$route.params.visitId;
        },
        errors() {
            return this.evaluator.form.errors;
        },
        submitted() {
            return this.evaluator.form.submitted;
        },
        contaminated() {
            return this.evaluator.form.errorDetected;
        },
    },
    methods: {
        submit() {
            this.saveLoader = true;
            this.evaluator.save(this.visitId, "monitoring");
        },
        dismissModal() {
            this.recordModal = false;
            this.integrationMessage = null;
            this.$emit("cancelled");
        },
    },
};
</script>
<style lang="scss">
    aside.v-navigation-drawer--close {
        margin: -20px;
    }
</style>