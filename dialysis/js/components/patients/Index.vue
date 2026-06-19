<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <!-- Remove a dialysis patient-->
        <v-dialog v-model="deleteDialog" persistent max-width="400">
            <v-card>
                <v-card-title>
                    <span class="subheading">Remove patient</span>
                    <v-spacer></v-spacer>
                    <v-btn flat icon color="red" small @click="deleteDialog = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider class="my-0"></v-divider>

                <v-card-text>
                    <v-row >
                        <v-col cols="12">
                            <v-textarea label="Enter reason for removing patient" outline required
                                        v-model="patient.stoppage_reason"></v-textarea>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions class="pa-3">
                    <v-btn color="pink" type="submit" block large @click.prevent="destroy()"
                           :loading="loading" :disabled="loading" :dark="!loading"
                    >
                        Remove patient from list
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- End of delete user -->

        <!-- add days per week and hours per week dialog -->
        <v-dialog v-model="add_frequency_dialog" persistent max-width="400">
            <v-card>
                <v-card-title>
                    <span class="subheading">Add frequency & sessions</span>
                    <v-spacer></v-spacer>
                    <v-btn flat icon color="red" small @click="add_frequency_dialog = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-divider class="my-0"></v-divider>
                <v-card-text>
                    <v-row >
                        <v-col cols="12">
                            <v-text-field label="Days per week" type="number" v-model="selected_schedule.days_per_week"
                                          required></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="Hours per session" type="number" v-model="selected_schedule.hours_per_session"
                                          required></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-text>
                <v-card-actions class="pa-3">
                    <v-btn color="green" type="submit" block large @click.prevent="addFrequency()"
                           :loading="loading" :disabled="loading" :dark="!loading"
                    >
                        Add frequency
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- End of add frequency dialog -->

        <v-card-title class="text-bold grey--text text--darken-1">
            Dialysis patients list
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
            :headers="patients.headers"
            :items="patients.data"
            class="mb-3"
            flat 
            hide-default-footer
        >
            <!-- Row Items Slot -->
            <template v-slot:body="{ items }">
                <tr v-for="item in items" :key="item.id">
                    <td class="py-3">{{ item.patient.full_name }}</td>
                    <td>
                        {{ item.days_per_week_to_string }} -> {{ item.hours_per_session_to_string }}
                    </td>
                    <td>{{ item.dialysis_start_date }}</td>
                    <td>{{ item.schedule_recommendation_ratio }}</td>
                    <td>
                        <v-btn
                        small
                        color="green"
                        dark
                        @click="addSession(item)"
                    >
                        Add Session
                    </v-btn>

                        <v-btn
                            small
                            color="blue"
                            dark
                            :href="`/dialysis/patient/${item.patient.id}/schedules/create`"
                        >
                            Schedule
                        </v-btn>
                        <v-btn small color="pink" dark @click="callDestroyModal(item.id)">
                            Discontinue
                        </v-btn>
                    </td>
                </tr>
            </template>
        
            <!-- Footer Slot -->
            <template v-slot:footer v-if="links">
                <td colspan="100%">
                    <v-row class="py-2 pb-2">
                        <v-col cols="8" class="mt-3">
                            Total patient records: {{ pagination.total }}
                        </v-col>
        
                        <v-col cols="3" class="text-right">
                            <v-btn icon @click="navigate(links.prev)">
                                <v-icon>chevron_left</v-icon>
                            </v-btn>
                            <v-btn icon @click="navigate(links.next)">
                                <v-icon>chevron_right</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </td>
            </template>
        </v-data-table>
        
        </v-card-text>
    </v-card>

</template>

<script>
import { mapGetters, mapActions } from "vuex";
import DialysisPatient from "@dialysis/libs/patients/DialysisPatient";

export default {
    data() {
        return {
            patient: new DialysisPatient(),
            deleteDialog: false,
            loading: false,
            patients: null,
            selected_schedule: {
            schedule_id: null,
            days_per_week: null,
            hours_per_session: null,
        },
            add_frequency_dialog:false
        };
    },

    watch: {
        submitted() {
            this.loading = false;
            this.deleteDialog = false;
            this.setDialysisPatients({ page: 1 });
            this.patient.form.submitted = false;
        },

        getDialysisPatients(value) {
            this.patients = value;
        },
    },

    computed: {
        ...mapGetters([
            "getDialysisPatients",
        ]),

        initialised() {
            return this.patients && this.patients.data;
        },

        links() {
            return this.patients.links;
        },

        pagination() {
            return this.patients.meta;
        },

        submitted() {
            return this.patient.form.submitted;
        },

        contaminated() {
            return this.patient.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisPatients",
        ]),

        navigate(url) {
            if (url) {
                const page = url.substring(url.indexOf("page=")).split("page=")[1];
                this.setDialysisPatients({ page });
            }
        },
        addSession(schedule){
            this.selected_schedule.schedule_id = schedule.id
            this.add_frequency_dialog = true
        },

        addFrequency(){
            this.loading = true;
            // console.log(this.selected_schedule)
            this.patient.addFrequency(this.selected_schedule)
            
            const schedule = { ...this.selected_schedule }; // Clone the object
            this.patient.addFrequency(schedule).then((response) => {

                console.log(response)
                // Check if the response contains a success alert
                if (response.alert === "success") {
                    this.add_frequency_dialog = false;
                }
            }).catch((error) => {
                console.error("Error adding frequency:", error);
            }).finally(() => {
                this.loading = false;
            });
        },
        
        callDestroyModal(patientId) {
            this.patient.patient_id = patientId;
            this.deleteDialog = true;
        },

        destroy() {
            if (!this.patient.stoppage_reason) {
                flash({
                    "message": "Please enter a reason",
                    "alert": "red",
                });

                return;
            }

            this.loading = true;
            this.patient.destroy();
        },
    },

    mounted() {
        this.setDialysisPatients({ page: 1 });
    },
};
</script>
