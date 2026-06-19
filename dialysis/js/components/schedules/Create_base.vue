<template>
    <form @submit.prevent="createSchedule">
        <v-row  class="mt-1">
            <v-col cols="12">
                <h4 class="form-legend text-bold">Schedule ward details</h4>
            </v-col>

            <v-col cols="12">
                <v-select v-model="schedule.ward" label="Dialysis ward" outline
                          :items="wards" item-text="name" @change="wardSelected()" return-object
                ></v-select>
            </v-col>

            <v-col cols="12">
                <v-select v-model="schedule.dialysis_chair_id" label="Dialysis chair" outline
                          :items="chairs" item-value="id" item-text="number"
                ></v-select>
            </v-col>

            <v-col cols="12">
                <h4 class="form-legend text-bold">Schedule time details</h4>
            </v-col>

            <v-col cols="12">
                <v-select v-model="schedule.day" label="Choose day of week" outline
                          :items="schedule.days"
                ></v-select>
            </v-col>

            <v-col cols="12">
                <v-menu ref="start"
                        :close-on-content-click="false"
                        v-model="start"
                        lazy
                        transition="scale-transition"
                        offset-y
                        full-width
                        min-width="290px"
                >
                    <v-text-field
                            flat outline class="body-2"
                            slot="activator"
                            v-model="schedule.start_time"
                            label="Appointment start time"
                    ></v-text-field>
                    <v-time-picker
                            v-if="start"
                            v-model="schedule.start_time"
                            full-width
                            @change="$refs.start.save(schedule.start_time)"
                    ></v-time-picker>
                </v-menu>
            </v-col>

            <v-col cols="12" class="mb-4">
                <v-menu ref="end"
                        :close-on-content-click="false"
                        v-model="end"
                        lazy
                        transition="scale-transition"
                        offset-y
                        full-width
                        min-width="290px"
                >
                    <v-text-field
                            flat outline class="body-2"
                            slot="activator"
                            v-model="schedule.end_time"
                            label="Appointment end time"
                    ></v-text-field>
                    <v-time-picker
                            v-if="end"
                            v-model="schedule.end_time"
                            full-width
                            @change="$refs.end.save(schedule.end_time)"
                    ></v-time-picker>
                </v-menu>
            </v-col>

            <v-col cols="12" class="mt-5">
                <v-btn type="submit" class="blue lighten-1" color="blue"
                       large :dark="!saveLoader" block :loading="saveLoader"
                       :disabled="saveLoader">
                    Set procedure time
                </v-btn>
            </v-col>
        </v-row>
    </form>
</template>

<script>

import { mapGetters, mapActions } from "vuex";
import DialysisSchedule from "@dialysis/libs/schedules/DialysisSchedule";

export default {
    props: [
        "patientId",
    ],

    data() {
        return {
            schedule: new DialysisSchedule,
            chairs: [],
            start: false,
            end: false,
            saveLoader: false,
        };
    },

    watch: {
        submitted() {
            this.chairs = [];

            this.saveLoader = false;

            this.setDialysisSchedules({
                "params": {
                    pid: this.patientId,
                },
            });
        },
    },

    computed: {
        ...mapGetters([
            "getDialysisWards",
        ]),

        wards() {
            return this.getDialysisWards.wards;
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
            if (this.schedule.ward) {
                this.chairs = this.schedule.ward.chairs.data;

                if (this.chairs.length == 0) {
                    flash({
                        alert: "red",
                        message: "Sorry! That ward has no chairs",
                    });

                    this.schedule.ward = null;
                }
            }
        },

        createSchedule() {
            this.saveLoader = true;

            this.schedule.save();
        },
    },

    mounted() {
        this.setDialysisWards();

        this.schedule.patient_id = JSON.parse(this.patientId);
    },
};
</script>

<style lang="scss">
    .theme--light .v-text-field--outline .v-input__slot {
        border: 1px solid rgba(0, 0, 0, 0.34) !important;
    }
</style>
