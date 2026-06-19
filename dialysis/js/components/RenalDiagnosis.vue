<template>
    <v-dialog v-model="diagnosis" persistent max-width="500" v-if="msetting('evaluation.with_clinic_renal')">
        <v-card>
            <v-card-title class="subheading grey--text text--darken-4">
                Dialysis' initial diagnosis

                <v-spacer></v-spacer>

                <v-btn flat icon color="red" small @click="close()">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider class="my-0"></v-divider>

            <v-card-text>
                <v-row >
                    <v-col cols="6">
                        <div class="mx-3">
                            <v-text-field type="number" label="Days per week" min="1" max="7" outline
                                          v-model="dialysis.days_per_week" :error="errors.has('days_per_week')"
                                          :hint="errors.get('days_per_week')" persistent-hint
                                          @keyup="errors.clear('days_per_week')">
                            </v-text-field>
                        </div>
                    </v-col>

                    <v-col cols="6">
                        <div class="mx-3">
                            <v-text-field type="number" label="Hours per day" min="1" max="24" outline
                                          v-model="dialysis.hours_per_session" :error="errors.has('hours_per_session')"
                                          :hint="errors.get('hours_per_session')" persistent-hint
                                          @keyup="errors.clear('hours_per_session')">
                              
                            </v-text-field>
                        </div>
                    </v-col>

                    <v-col cols="12">
                        <div class="mx-3">
                            <collabmed-date-time-picker
                            v-model="dialysis.dialysis_start_date"    
                                dateOnly
                                :datetime="date"
                                 label="Dialysis start date">
                            </collabmed-date-time-picker>
                        </div>
                    </v-col>

                    <v-col cols="12">
                        <div class="mx-3">
                            <v-textarea label="Notes" outline
                                         v-model="dialysis.initial_diagnosis" :error="errors.has('initial_diagnosis')"
                                         :hint="errors.get('initial_diagnosis')" persistent-hint
                                         @keyup="errors.clear('initial_diagnosis')" rows="10">
                                        </v-textarea>
                        </div>
                    </v-col>
                </v-row>

            </v-card-text>
            <v-card-actions>
                <v-btn class="mx-2 mb-2" color="info" block large @click.prevent="saveDiagnosis()"
                       :dark="!saveLoader" :loading="saveLoader" :disabled="saveLoader">
                    Send patient to renal queue
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import DialysisPatient from "@dialysis/libs/patients/DialysisPatient";
import {mapGetters} from 'vuex';

export default {
    props: [
        "diagnosis", "patientId",
    ],

    data() {
        return {
            start: false,
            saveLoader: false,
            dialysis: new DialysisPatient(),
            date: new Date().toISOString().substr(0, 10),
        };
    },

    watch: {
        submitted() {
            this.saveLoader = false;
            this.dialysis.form.submitted = false;
            if (!this.errors.any()) {
                this.$emit("diagnosed");
            }
        },

        contaminated() {
            this.saveLoader = false;
            this.dialysis.form.submitted = false;
            this.dialysis.form.errorDetected = false;
        },
    },

    computed: {
        errors() {
            return this.dialysis.form.errors;
        },

        submitted() {
            return this.dialysis.form.submitted;
        },

        contaminated() {
            return this.dialysis.form.errorDetected;
        },
        variations() {
            return this.getNote().data;
     },
    },

    methods: {
        ...mapGetters([
      'getNote',
    ]),
        close() {
            this.$emit("diagnosed");
        },

        selectInitialDate() {
            this.errors.clear("dialysis_start_time");
            this.$refs.start.save(this.dialysis.dialysis_start_date);
        },

        saveDiagnosis() {
            this.saveLoader = true;
            this.dialysis.save();
        },


    },

    mounted() {
        this.dialysis.patient_id = JSON.parse(this.patientId);
    },
};
</script>
