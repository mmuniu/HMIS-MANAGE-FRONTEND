<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <div class="mb-5" v-else>
        <v-row >
            <v-col cols="4">
                <h2 class="long-form-heading ml-1">Nursing care details</h2>
                <p class="ml-1">Fill in information pertaining nursing</p>
            </v-col>

            <v-col cols="8">
                <v-card class="ml-3">
                    <v-container fluid>
                        <v-row >
                            <v-col cols="3">
                                <label class="mid-center font-weight-regular subheading mt-2">
                                    Administering nurse
                                </label>
                            </v-col>
                            <v-col cols="9">

                                <users-search  outlined
                                @results="userSelected"
                                :roles-like="getCheckinToRoles"
                                label="Select a nurse">
                                </users-search>
                            </v-col>
                            <v-col cols="3" md="9" offset-md="3" v-if="session.nurses.length > 0">
                                <v-chip small outlined
                                        v-for="(nurse, index) in session.nurses"
                                        :key="nurse.id"
                                        color="primary"
                                        class="mx-2">
                                  {{ nurse.name }}
                                </v-chip>
                              </v-col>

                        </v-row>
                    </v-container>
                </v-card>
            </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <v-row >
            <v-col cols="4">
                <h2 class="long-form-heading ml-1">Financial details</h2>
                <p class="ml-1">Record financial & payment details</p>
            </v-col>

            <v-col cols="8">
                <v-card class="ml-3">
                    <v-container fluid>
                        <v-row >
                            <v-col cols="3">
                                <label class="mid-center font-weight-regular subheading mt-3">Payment Mode</label>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group v-model="session.visit.payment_mode" row>
                                    <v-radio label="Cash" value="cash"></v-radio>
                                    <v-radio label="Insurance" value="insurance" v-if="schemes.length > 0"></v-radio>
                                </v-radio-group>
                            </v-col>


                            <v-col cols="12">
                                <transition-group name="slide-fade">
                                    <v-row  key="insurance"
                                              v-if="session.visit.payment_mode == 'insurance'">
                                        <v-col cols="3">
                                            <label class="mid-center font-weight-regular subheading mt-2">
                                                Insurance scheme
                                            </label>
                                        </v-col>

                                        <v-col cols="9">
                                            <v-autocomplete
                                                    label="Patient scheme" outline
                                                    :items="schemes" item-text="scheme_name" item-value="id"
                                                    v-model="session.visit.scheme" :error="errors.has('visit.scheme')"
                                                    :hint="errors.get('visit.scheme')"
                                                    persistent-hint @change="errors.clear('visit.scheme')"
                                            ></v-autocomplete>
                                        </v-col>
                                    </v-row>
                                </transition-group>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card>
            </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <v-row >
            <v-col class="md-and-up text-right" offset-md="4" md="8" >
                <v-card class="ml-3 pa-3">
                    <v-btn class="blue" large
                           :disabled="loading" :loading="loading" :dark="!loading"
                           @click="saveSession()"
                    >
                        Checkin & Assess
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import DialysisSession from "@dialysis/libs/sessions/DialysisSession";

export default {
    props: [
        "isSchedule", "clinicId", "userId",
    ],

    data() {
        return {
            session: new DialysisSession(),
            schedule: null,
            loading: false,
            users:[],
        };
    },

    watch: {
        contaminated() {
            this.loading = false;
            this.session.form.errorDetected = false;
        },

        submitted() {
            this.loading = false;
            this.session.form.submitted = false;
        },
        
        getUsers({ data }) {
            this.loading = false;
            this.users = data;
        }
    },

    computed: {
        ...mapGetters([
            "getUsers", "getDialysisSchedules",
        ]),


        schemes() {
            return this.schedule.patient.schemes;
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
            return this.schedule ;
        },

        errors() {
            return this.session.form.errors;
        },

        submitted() {
            return this.session.form.submitted;
        },

        contaminated() {
            return this.session.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            "setUsers", "setDialysisSchedules",
        ]),

        async fetchUsers(){ 
      try {
        const response = await fetch('/api/users');
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.data;
            this.users = Array.isArray(data)
          ? data.map(doctor => ({
              id: doctor.id, 
              name: doctor.full_name || doctor.username ,
            }))
          : []; 
    
      } catch (error) {
        console.error('Error fetching users:', error);
        this.users = []; 
      }
    },

    
    userSelected(user) {
            this.session.administering_nurse_id = user.id;
            
            const nurse = {
        name: user.full_name,
        id: user.id,
      };

      if (!this.session.nurses.some((nur) => JSON.stringify(nur) === JSON.stringify(nurse))) {
        this.session.nurses.push(nurse);
      }
        },
      
        saveSession() {
            this.loading = true;

            this.session.save();
        },
    },

    mounted() {
       
        this.schedule = JSON.parse(this.isSchedule);
        this.session.visit.patient = this.schedule.patient_id;
        this.session.visit.clinic = JSON.parse(this.clinicId);
        this.session.visit.user = JSON.parse(this.userId);
        this.session.schedule_id = this.schedule.id;
    },
};
</script>

<style lang="scss">
    .v-input--selection-controls.v-input .v-label {
        top: 5px;
    }
</style>
