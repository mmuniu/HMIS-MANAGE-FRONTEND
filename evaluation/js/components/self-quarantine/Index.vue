<template>
   <v-card flat>
          <div>
              <div class="pa-3">
                  <span style="font-size: 14px;" class="grey--text font-weight-bold"> List of patients under self quarantine</span>
              </div>
              <v-card-title>
                  <v-row class="text-right">
                      <v-col md="2">
                          <collabmed-date-time-picker date-only outline v-model="params.start_date" label="Start date"></collabmed-date-time-picker>
                      </v-col>

                      <v-col md="2">
                          <collabmed-date-time-picker date-only outline v-model="params.end_date" label="End date"></collabmed-date-time-picker>
                      </v-col>


                      <v-col md="2">
                          <v-select label="Approval status"
                                    v-model="params.approval_status"
                                    :items="['Pending', 'Partially approved', 'Approved', 'Rejected']"
                          >
                          </v-select>
                      </v-col>

                      <v-col class="mx-1" md="3" >
                          <patient-search @patientSelected="selectedPatient($event)"></patient-search>
                      </v-col>

                      <v-col>
                          <v-btn small color="success" @click="filter()">Filter</v-btn>
                          <v-btn color="primary" small @click="addNew()">Add new</v-btn>
                      </v-col>
                  </v-row>
              </v-card-title>


              <collabmed-loading v-if="!patients.data"></collabmed-loading>

              <v-data-table :headers="headers"
                            v-else
                            :items="patients.data"
                            hide-default-footer>

                  <template v-slot:item.patient_name="{ item }">
                      <v-btn small icon color="primary" @click="updateData(item)">
                          <v-icon small color="primary">edit</v-icon>
                      </v-btn>
                      <span>{{ item.patient_name }}</span>
                  </template>

                  <template v-slot:item.approval_status="{ item }">
                      <span v-if="item.approval_status === 'Pending'" class="warning--text font-weight-bold">Pending</span>
                      <span v-if="item.approval_status === 'Approved'" class="success--text font-weight-bold">Approved</span>
                      <span v-if="item.approval_status === 'Rejected'" class="error--text font-weight-bold">Rejected</span>
                      <span v-if="item.approval_status === 'Partially approved'" class="purple--text font-weight-bold">Partially approved</span>
                  </template>

                  <template v-slot:item.discharged="{ item }">
                      <span v-if="!item.discharged" class="warning--text font-weight-bold">Pending</span>
                      <span v-if="item.discharged" class="success--text font-weight-bold">Discharged</span>
                  </template>

                  <!--<template v-slot:item.screening_status="{ item }">
                      <v-icon small v-if="!item.screening_status" color="error" class="px-4">close</v-icon>
                      <v-icon small v-else color="success" class="px-4">check</v-icon>
                  </template>-->

                  <template v-slot:item.actions="{ item }">
                      <v-btn  :disabled="(item.approval_status === 'Approved' || !!item.discharged)" small color="purple"
                              class="white--text"
                              v-if="can('evaluation.approve_self_quarantines')"
                              @click="approve(item)">
                          approve
                      </v-btn>
                      <!-- :disabled="disableTreatment(item)" -->
                      <v-btn
                              :disabled="!isApproved(item.approval_status)"
                              small
                             color="success"
                             @click="viewPatientVitals(item)">
                          view vitals
                      </v-btn>
                      <v-btn :disabled="!isApproved(item.approval_status)"
                              small
                             color="primary"
                             @click="viewMovements(item)">
                          view movement
                      </v-btn>
                      <v-btn :disabled="!isApproved(item.approval_status)"
                             small
                             color="warning"
                             @click="dischargePatient(item)">
                          Discharge
                      </v-btn>
                  </template>

                  <template v-slot:footer>
                      <collabmed-paginator v-if="patients.meta" :meta="patients.meta" @change="navigate"></collabmed-paginator>
                  </template>
              </v-data-table>
          </div>
      </div>
   </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import AddNewSelfQuarantine from './Create';
import SelfQuarantine from '@evaluation/libs/SelfQuarantine/SelfQuarantine';
import PatientSearch from '@reception/components/patients/PatientSearch.vue';


export default {
    components: {
        AddNewSelfQuarantine, PatientSearch
    },

    data: () => ({
        params: {},
        page: 1,
        selfQuarantine: new SelfQuarantine(),
        headers: [
            { text: 'Name', value: 'patient_name' },
            { text: 'Start date', value: 'start_date' },
            { text: 'No. of days', value: 'no_days' },
            { text: 'Approval status', value: 'approval_status' },
            { text: 'Days left', value: 'days_left' },
            { text: 'Discharged', value: 'discharged' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    computed: {
        ...mapGetters({
            patients: 'getSelfQuarantinePatients',
        }),
    },

    methods: {
        ...mapActions([
            'setSelfQuarantinePatients',
        ]),

        isApproved (approvalStatus) {
            if (approvalStatus === 'Approved' || approvalStatus === 'Partially approved') {
                return true
            } else {
                return false;
            }
        },

        selectedPatient (patient) {
            this.params.patient_id = patient.id
        },

        disableTreatment (item) {
            if(item.approval_status === 'Approved' && item.discharged) {
                return true;
            }

            if(item.approval_status !== 'Approved' && !item.discharged) {
                return true;
            }

            return false
        },

        navigate(page) {
            this.page = page;
            this.initialize();
        },

        viewMovements(patient) {
            window.open('/reception/view-patient-movement/' + patient.patient_id, '_blank');
        },

        updateData (item) {
            window.open(`/evaluation/self-quarantine/create?p_id=${item.patient_id}&inst_id=${item.id}&editing=true`, '_self');
        },

        approve (item) {
            window.open(`/evaluation/self-quarantine/create?p_id=${item.patient_id}&inst_id=${item.id}&approving=1`, '_self');
        },

        addNew() {
            window.open('/evaluation/self-quarantine/create', '_self');
        },

        dischargePatient(item) {
            window.open(`/evaluation/self-quarantine/${item.id}/discharge`, '_self');
        },

        filter () {
            this.initialize();
        },

        /*async approve(patient) {
            const response = await this.selfQuarantine.approve(patient);

            if (response) {
                this.initialize();
            }
        },*/

        viewPatientVitals(patient) {
            window.open('/evaluation/view-patient-vitals/' + patient.patient_id, '_self');
        },

        initialize() {
            this.setSelfQuarantinePatients({
                page: this.page,
                params: this.params,
            });
        },
    },

    mounted() {
        this.initialize();
    },
};
</script>
