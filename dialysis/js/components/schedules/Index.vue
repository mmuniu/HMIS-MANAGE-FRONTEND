<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <!-- Delete User Dialog -->
        <v-dialog v-model="paymentDialog" persistent max-width="400">
            <v-card>
                <v-card-title>
                    <span class="subheading">Choose patient payment method</span>
                    <v-spacer></v-spacer>
                    <v-btn flat icon color="red" small @click="paymentDialog = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-divider class="my-0"></v-divider>

                <v-card-text>
                    <v-row >
                        <v-col cols="12">
                            <v-radio-group v-model="checkin.visit.payment_mode" row>
                                <v-radio label="Cash" value="cash"></v-radio>
                                <v-radio label="Insurance" value="insurance"></v-radio>
                            </v-radio-group>
                        </v-col>

                        <transition name="slide-fade">
                            <v-col cols="12" v-if="checkin.visit.payment_mode == 'insurance'">
                                <v-select label="Select a scheme" outline v-model="checkin.visit.scheme"
                                          :items="schemes" item-value="id" item-text="name"
                                ></v-select>
                            </v-col>
                        </transition>
                    </v-row>
                </v-card-text>
                <v-card-actions class="pa-3">
                    <v-btn color="blue" block large @click="save()"
                           :loading="loading" :disabled="loading" :dark="!loading">Proceed to Assessment
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- End of delete user -->

        <v-card-title class="text-bold grey--text text--darken-1">
            List of dialysis schedules
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table
                    :headers="schedules.headers" :items="schedules.data"
                    class="mb-3" flat hide-default-footer
            >
                <template v-slot:body="{ items }">
                    <tr v-for="item in items" :key="item.id">
                        <td class="py-3 blue--text text--lighten-2">
                            <a :href="`/reception/patients/${item.id}/basic`">{{ item.patient.full_name }}</a>
                        </td>
                        <td>{{ item.location }}</td>
                        <td>{{ item.day }}</td>
                        <td>{{ item.start }}</td>
                        <td>{{ item.end }}</td>
                        <td>
                            <v-btn :href="`/dialysis/schedule/${item.id}/sessions/create`" color="blue" small dark>
                                Check In
                            </v-btn>

                            <v-btn :href="`/reception/patients/${item.id}/edit`" color="pink" small dark >
                                Cancel
                            </v-btn>
                        </td>
                     </tr>
                </template>

                <template slot="footer" v-if="schedules.links">
                    <td colspan="100%">
                        <v-row  class="py-2 pb-2">
                            <v-col cols="8" class="mt-3 ml-3">
                                Total patient records: {{ schedules.meta.total }}
                            </v-col>

                            <v-col cols="3" class="text-right">
                                <v-btn icon @click="navigate(schedules.links.prev)">
                                    <v-icon>chevron_left</v-icon>
                                </v-btn>

                                <v-btn icon @click="navigate(schedules.links.next)">
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
import { _ } from "vue-underscore";
import { mapGetters, mapActions } from "vuex";
import Visit from "@reception/libs/visits/Visit";

export default {
    props: [
        "params", "userId", "facilityId",
    ],

    data() {
        return {
            patient: null,
            schedules: null,
            paymentDialog: false,
            loading: false,
            checkin: new Visit(),
            schemes: [],
            scheduleId: null,
        };
    },

    watch: {
        getDialysisSchedules(schedules) {
            this.schedules = schedules;
        },

        submitted() {
            const visitId = this.checkin.selectedVisit.id;

            location.href = `/dialysis/schedule/${this.scheduleId}/main-visit/${visitId}/assess/machine`;
        },
    },

    computed: {
        ...mapGetters([
            "getDialysisSchedules",
        ]),

        initialised() {
            return this.schedules;
        },

        submitted() {
            return this.checkin.form.submitted;
        },
    },

    methods: {
        ...mapActions([
            "setDialysisSchedules",
        ]),

        getPaymentMethod(schedule) {
            this.scheduleId = schedule.id;

            const companies = schedule.patient.schemes;

            _.each(companies, ({ scheme }) => {
                this.schemes.push({
                    "name": scheme.name,
                    "id": scheme.id,
                });
            });

            this.checkin.visit.patient = schedule.patient.id;

            this.paymentDialog = true;
        },

        save() {
            this.loading = true;

            this.checkin.save(false);
        },

        initialisePage() {
            const params = JSON.parse(this.params);
            this.checkin.visit.clinic = JSON.parse(this.facilityId);
            this.checkin.visit.user = JSON.parse(this.userId);
            this.setDialysisSchedules({ params });
        },
    },

    mounted() {
        this.initialisePage();
    },
};
</script>

<style lang="scss">
    .v-input--selection-controls.v-input .v-label {
        top: 5px;
    }
</style>
