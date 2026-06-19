<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <div v-else>
        <v-row >
            <v-col cols="12">
                <v-card class="mb-4">
                    <v-container fluid>
                        <v-row >
                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">
                                    Staff setting machine
                                </label>
                            </v-col>
                            <v-col cols="12" md="4">
                                    <users-search  outlined
                                        @results="userSelected"
                                        :roles-like="getCheckinToRoles"
                                        label="Select a staff">
                                    </users-search>
                            </v-col>
                        </v-row>

                        <v-row v-if="selected_staff">
                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">
                                    Selected staff  
                                </label>
                            </v-col>

                            <v-col cols="12" md="4">
                                <v-chip  class="mx-1" 
                                v-model="assess.machine.staff_setting_machine"
                                close @click:close="selected_staff = null">
                                    {{selected_staff.name}}
                                </v-chip>
                            </v-col>
                            
                        </v-row>

                        <v-divider class="mt-0"></v-divider>

                        <v-row >
                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">
                                    Machine temperature
                                </label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Temperature"
                                              outline
                                              v-model="assess.machine.temperature"
                                              :error="errors.has('machine.temperature')"
                                              :hint="errors.get('machine.temperature')"
                                              persistent-hint @keyup="errors.clear('machine.temperature')">
                                </v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">
                                    Machine conductivity
                                </label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Conductivity"
                                              outline
                                              v-model="assess.machine.conductivity"
                                              :error="errors.has('machine.conductivity')"
                                              :hint="errors.get('machine.conductivity')"
                                              persistent-hint @keyup="errors.clear('machine.conductivity')">
                                </v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Dialysis pressure</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Dialysis P."
                                              outline
                                              v-model="assess.machine.dialysis_pressure">
                                </v-text-field>
                            </v-col>

                            <v-col class="hidden-sm-and-down" md="2">
                                <label class="mid-center font-weight-regular subheading mt-2">Rejection rate</label>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field label="Rej. Rate" outline
                                              v-model="assess.machine.rejection_rate">
                                </v-text-field>
                            </v-col>
                        </v-row>

                        <v-divider class="mt-0"></v-divider>

                        <v-row >
                            <v-col cols="12">
                                <v-checkbox label="Trans-membrane pressure is on"
                                            class="mid-center"
                                            v-model="assess.machine.is_tmp_on">
                                </v-checkbox>
                            </v-col>

                            <v-col cols="12">
                                <v-checkbox label="Machine has no blood leaks"
                                            class="mid-center"
                                            v-model="assess.machine.no_blood_leak">
                                </v-checkbox>
                            </v-col>

                            <v-col cols="12">
                                <v-checkbox label="No air detected in machine"
                                            class="mid-center"
                                            v-model="assess.machine.no_air_detection">
                                </v-checkbox>
                            </v-col>
                        </v-row>

                        <v-divider class="mt-0"></v-divider>

                        
                        <v-col class="text-right" cols="12" >
                            <v-btn  class="blue ":disabled="loading"
                                   :dark="!loading" :loading="loading"
                                   @click.prevent="save()"  >
                                Record and Proceed
                            </v-btn>
                        </v-col>
                    </v-container>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { assessment_mixin } from "@dialysis/components/assessment/mixins/assessment_mixin";

export default {
    mixins: [
        assessment_mixin,
    ],
    data() {
        return {
            selected_staff: null,
        };
    },

    computed: {
        ...mapGetters([
            "getUsers",
        ]),

        users() {
            return _.map(this.getUsers, (user) => {
                return {
                    id: user.id,
                    name: user.full_name,
                };
            });
        },
        getCheckinToRoles() {
            if (this.msetting('reception.checkin_to_roles')) {
                const reg = RegExp('[a-z]+', 'gi');

                const data = this.msetting('reception.checkin_to_roles');

                return data.match(reg);
            } else {
                return [];
            }
        },

        initialised() {
            return this.users.length > 0;
        },
    },

    methods: {
        ...mapActions([
            "setUsers",
        ]),
  userSelected(user) {

                this.assess.machine.staff_setting_machine = user.id;
                const nurse = {
                    name: user.full_name,
                    id: user.id,
                };
                //based on the selectd nurse store them in a variable that we will later display in a v-chip
                this.selected_staff = nurse;


        },
    },

    mounted() {
        this.setUsers();
        this.initialisePage("machine", "vascular");
    },
};
</script>

