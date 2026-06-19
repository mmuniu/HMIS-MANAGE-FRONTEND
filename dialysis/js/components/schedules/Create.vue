<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <div class="mb-5" v-else>
        <v-alert :value="true" class="mb-4" outline color="info" icon="info" >
            <v-row>
                <v-col cols="10">
                    <p class="at-middle-center"><b>Doctor's Recommendation:</b>
                        {{ patient.dialysis.doctors_recommendation }}
                    </p>
                </v-col>

                <v-col cols="2" class="text-right">
                    <v-btn :href="`/dialysis/schedules?patient_id=${patient.id}`" class="pink" small flat dark>
                        Schedules: {{ schedules.length }} / {{ patient.dialysis.days_per_week }}
                    </v-btn>
                </v-col>
            </v-row>
        </v-alert>

        <form>
            <!-- Personnel and scheduling information -->
            <v-row  class="mt-1">
                <v-col cols="12">
                    <v-row >
                        <v-col cols="12" md="4">
                            <div class="mr-3">
                                <h2 class="long-form-heading ml-1">Ward, chair and location details</h2>
                                <p class="ml-1">Specify the location that the patient will be placed</p>
                            </div>
                        </v-col>

                        <v-col cols="12" md="8">
                            <v-card>
                                <v-container fluid>
                                    <v-row >
                                        <v-col cols="3">
                                            <label class="mid-center
                                             font-weight-regular subheading mt-2">
                                                Select a ward
                                            </label>
                                        </v-col>
                                        <v-col cols="9">
                                            <v-select label="Dialysis ward"
                                                      v-model="schedule.ward" outline
                                                      :items="wards" item-text="name"
                                                      @change="wardSelected()" return-object
                                            ></v-select>
                                        </v-col>

                                        <v-col cols="3">
                                            <label class="mid-center font-weight-regular subheading mt-2">
                                                Pick a chair
                                            </label>
                                        </v-col>
                                        <v-col cols="9">
                                            <v-select label="Dialysis chair"
                                                      v-model="schedule.dialysis_chair_id" outline
                                                      :items="chairs" item-value="id" item-text="display_name"
                                                      :error="errors.has('dialysis_chair_id')"
                                                      :hint="errors.get('dialysis_chair_id')"
                                                      persistent-hint @keyup="errors.clear('dialysis_chair_id')"
                                            ></v-select>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card>
                        </v-col>
                    </v-row>

                    <v-divider class="my-4"></v-divider>

                    <v-row >
                        <v-col cols="12" md="4">
                            <div class="mr-3">
                                <h2 class="long-form-heading ml-1">Timing and scheduling details</h2>
                                <p class="ml-1">Enter time for dialysis appointment</p>
                            </div>
                        </v-col>

                        <v-col cols="12" md="8">
                            <v-card>
                                <v-container fluid>
                                    <v-row >
                                        <v-col cols="3">
                                            <label class="mid-center font-weight-regular subheading mt-2">
                                                Select day
                                            </label>
                                        </v-col>
                                        <v-col cols="9">
                                            <v-select v-model="schedule.day" label="Choose day of week" outline
                                                      :items="schedule.days"
                                                      :error="errors.has('day')" :hint="errors.get('day')"
                                                      persistent-hint @change="errors.clear('day')"
                                            ></v-select>
                                        </v-col>
                                    </v-row>

                                    <v-divider class="mt-0"></v-divider>

                                    <v-row >
                                        <v-col cols="3">
                                            <label class="mid-center font-weight-regular subheading mt-2">
                                                Start time
                                            </label>
                                        </v-col>
                                        <v-col cols="9">

                                            <collabmed-date-time-picker
                                            v-model="schedule.start_time"
                                                timeOnly
                                                :datetime="date"
                                                label="Appointment start time">
                                            </collabmed-date-time-picker>

                                          
                                        </v-col>

                                        <v-col cols="3">
                                            <label class="mid-center font-weight-regular subheading mt-2">
                                                End time
                                            </label>
                                        </v-col>
                                        <v-col cols="9">
                                            
                                            <collabmed-date-time-picker
                                            v-model="schedule.end_time"
                                                timeOnly
                                                :datetime="date"
                                                label="Appointment end time">
                                            </collabmed-date-time-picker>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card>
                        </v-col>
                    </v-row>

                    <v-divider class="my-4"></v-divider>

                    <v-row >
                        <v-col cols="12" offset-md="4" md="8">
                            <v-card>
                                <v-container fluid>
                                    <v-row >
                                        <v-col cols="12" class="text-right">
                                            <v-btn @click.prevent="createSchedule()"
                                                   class="blue lighten-1" color="blue"
                                                   large :dark="!saveLoader"
                                                   :loading="saveLoader" :disabled="saveLoader">
                                                Save appointment
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </form>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import DialysisSchedule from "@dialysis/libs/schedules/DialysisSchedule";

export default {
    props: [
        "isPatient",
    ],

    data() {
        return {
            schedule: new DialysisSchedule,
            patient: null,
            chairs: [],
            start: false,
            end: false,
            saveLoader: false,
          date: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),

        };
    },

    watch: {
        submitted(value) {
            if (value) {
                this.chairs = [];
                this.saveLoader = false;
                this.schedule.form.submitted = false;
                this.schedule.patient_id = this.patient.id;
                this.schedules.length = this.schedules.length + 1;
            }
        },

        contaminated(value) {
            if (value) {
                this.saveLoader = false;
                this.schedule.form.submitted = false;
                this.schedule.form.errorDetected = false;
            }
        },
    },

    computed: {
        ...mapGetters([
            "getDialysisWards",
        ]),

        initialised() {
            return this.wards && this.patient && this.schedules;
        },

        wards() {
            return this.getDialysisWards.data;
        },

        schedules() {
            if (this.patient) {
                return this.patient.dialysis_schedules;
            } else {
                return null;
            }
        },

        errors() {
            return this.schedule.form.errors;
        },

        submitted() {
            return this.schedule.form.submitted;
        },

        contaminated() {
            return this.schedule.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisWards", "setDialysisSchedules",
        ]),

        wardSelected() {
            this.errors.clear("dialysis_chair_id");

            const ward = this.schedule.ward;

            if (ward !== null) {
                this.chairs = ward.chairs;

                if (this.chairs.length === 0) {
                    flash({
                        alert: "red",
                        message: "Sorry! That ward has no chairs",
                    });

                    this.schedule.ward = null;
                }
            }
        },

        selectStartTime() {
            this.errors.clear("start_time");
            this.$refs.start.save(this.schedule.start_time);
        },

        selectEndTime() {
            this.errors.clear("end_time");
            this.$refs.end.save(this.schedule.end_time);
        },

        createSchedule() {

            if (!this.schedule.start_time || !this.schedule.end_time) {
    
                    flash({
                        alert: "red",
                        message: "Please fill in both Start Time and End Time before submitting",
                    });
               return; 
             }


            this.saveLoader = true;
            this.schedule.save();
        },
    },

    mounted() {
        this.setDialysisWards();
        this.patient = JSON.parse(this.isPatient);
        this.schedule.patient_id = this.patient.id;
    },
};
</script>

<style lang="scss">
    .v-input--selection-controls.v-input .v-label {
        top: 5px;
    }

    .v-text-field__details {
        padding: 0 0 5px 0 !important;

        .theme--light.v-messages{
            color: #e74c3c !important;
        }
    }
</style>
