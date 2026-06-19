<template>
    <v-card>
        <v-card-text>
            <div>
                <v-row>
                    <v-col class="px-2" md="2">
                        <users-search
                            :roles-like="['doc']"
                            :label="'Clinician'"
                            v-model="filters.doctor"
                        ></users-search>
                    </v-col>

                    <v-col md="3">
                        <patient-search outline @patientSelected="patientSelected($event)"></patient-search>
                    </v-col>

                    <v-col class="px-2" md="2" >
                        <collabmed-date-time-picker dateOnly outline  v-model="filters.start_date" label="Start date"></collabmed-date-time-picker>
                    </v-col>

                    <v-col class="px-2" md="2" >
                        <collabmed-date-time-picker dateOnly outline v-model="filters.end_date" label="End date"></collabmed-date-time-picker>
                    </v-col>

                    <v-col>
                        <v-btn @click="filter()" class="v-btn v-btn--small theme--light primary" color="success">filter</v-btn>
                    </v-col>

                </v-row>
            </div>
            <div>
                <collabmed-loading v-if="!followUps"></collabmed-loading>

                <div v-else>
                    <v-data-table :headers="headers"
                                  disable-pagination
                                  hide-default-footer
                                  flat
                                  :items="followUps.data">

                        <template v-slot:item.next_steps="{ item }">
                            <span v-for="(action, index) in item.next_steps" :key="index">{{ action.value }}</span>
                        </template>

                        <template v-slot:item.actions="{ item }">

                            <v-btn small
                                   @click="showDialog(item)"
                                   color="primary"
                                   :disabled="item.next_steps_done"
                                   v-if="item.todos.includes('book_for_theatre')">
                                Book for theatre
                            </v-btn>

                            <v-btn small color="primary" @click="bookAppointment(item)" v-if="item.todos.includes('tca')">
                                book appointment
                            </v-btn>

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn small
                                           color="success"
                                           :disabled="item.next_steps_done"
                                           v-on="on" @click="actionsDone(item)">
                                        done
                                    </v-btn>
                                </template>
                                <span>
                                    Mark as done
                                </span>
                            </v-tooltip>
                        </template>

                        <template slot="footer" v-if="followUps.links">
                            <v-row >
                                <v-col class="text-center" v-if="followUps.meta">
                                    <v-pagination
                                            v-model="page"
                                            :length="followUps.meta.last_page"
                                            circle
                                            total-visible="8"
                                    ></v-pagination>
                                </v-col>
                            </v-row>
                        </template>
                    </v-data-table>
                </div>

                <!-- theatre modal -->
                <theatre-bookings-create-modal
                    :visitId="visit_id"
                    :show="toggleBookingDialog"
                    @close="toggleBookingDialog = false"
                    @saved="updateBookingStatus"
                ></theatre-bookings-create-modal>
            </div>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import moment from "moment";
import DoctorNote from '@evaluation/libs/notes/DoctorNote';
import PatientSearch from '@reception/components/patients/PatientSearch.vue';

export default {
    components: {
        PatientSearch,
    },

    data: () => ({
        page: 1,
        visit_id: null,
        followUps:[],
        doctorNotes: new DoctorNote(),
        toggleBookingDialog: false,
        filters: {
            start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
            end_date: moment(new Date()).endOf('day').format("YYYY-MM-DD HH:MM"),
            doctor: null,
            patient_id: null
        },
        headers: [
            { text: 'Patient', value: 'patient'},
            { text: 'Next steps', value: 'next_steps'},
            {text:'Plan of Management',value:'treatment_plan'},
            { text: 'Date', value: 'date'},
            { text: 'Actions', value: 'actions'},
        ]
    }),

    computed: {
        ...mapGetters({
        })
    },

    methods: {
        ...mapActions([
            'setFollowUps'
        ]),

        patientSelected(patient) {
            this.filters.patient_id = patient.id;
        },

        async bookAppointment (item) {
            await this.actionsDone(item);
            window.open('/reception/appointments/create', '_SELF')
        },

        updateBookingStatus() {
            this.toggleBookingDialog = false;
        },

        showDialog(item) {
            this.visit_id = item.visit_id;
            this.toggleBookingDialog = true;
        },

        filter () {
            this.page = 1;
            this.init();
        },

        async actionsDone (item) {
            await this.doctorNotes.nextStepsActionsDone(item.visit_id);
            this.init();
        },


        async fetchFollowUps() {
          try {
              const params = {
                  visit_id: this.$route.params.visitId, // Getting visitId from the route params
              };

              // Check if the response has the expected structure
              const response = await this.doctorNotes.fetchFollowUps(this.$route.params.visitId); 

            // Check if the response has the expected fstructure
            if (response) {
                    this.followUps = response
            }
          } catch (error) {
              console.error('Error fetching folow ups data:', error);
          }
       },

       navigate(page) {
            this.page = page;

            this.init();
        },

        init () {
            this.setFollowUps({
                page: this.page,
                params: _.omitBy(this.filters, _.isNil)
            })
        }
    },

    mounted () {
        this.fetchFollowUps();
    }
}
</script>
