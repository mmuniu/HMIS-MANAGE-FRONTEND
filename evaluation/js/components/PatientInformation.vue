<template>
  <transition name="slide">
    <v-card>

      <collabmed-loading v-if="! initialised">Loading Patient Info...</collabmed-loading>

      <div v-else class="mb-4">
        <v-toolbar text height="100"  :color="getColor(visit.color_code)">
          <div class="row" >

            <div class="col-md-1">
              <v-avatar size="60px" @click="openPortal()" style="cursor: pointer">
                <img :src="getPatientImage(visit.patient)" alt="Avatar">
              </v-avatar>
            </div>
            <div class="col-md-11">
              <div class="row" style=" margin-bottom: 25px;">
                <p class="ml-3 mt-3" style="margin-bottom:0 !important">
                          <span class="font-weight-bold pl-2 subheading grey--text text--darken-1">
                              {{ visit.patient_name }} |
                              {{ visit.patient.sex ? visit.patient.sex : 'Gender not available' }} |
                            {{ visit.patient.dob }} ( {{ visit.patient.age_friendly ? visit.patient.age_friendly : 'Age not available' }})
                              
                          </span> <br>
                </p>
                <p class="ml-3 mt-3" style="margin-bottom:0 !important">
                  <v-chip class="font-weight-bold" color="blue" text-color="white" small>
                    #{{ visit.id }}
                  </v-chip>

                  <v-chip class="font-weight-bold" color="red" text-color="white"
                          small
                          v-if="visit.patient.number">
                    {{ visit.patient.number }}
                  </v-chip>

                  <v-chip class="font-weight-bold" color="teal" text-color="white" small>
                    Mode: {{ visit.payment_mode }}
                    <span v-if="visit.payment_mode === 'insurance' && visit.patient_scheme">
                                  <v-icon>arrow_right_alt</v-icon>
                                  {{ visit.patient_scheme.scheme_name }}
                              </span>
                  </v-chip><br>

                </p>
                <p class="ml-3 mt-3" style="margin-bottom:0 !important">
                  <v-chip class="font-weight-bold" color="yellow" v-if="msetting('finance.wallet_integrated')"  text-color="white"  small>
                    Wallet Number: {{ wallet_number  }}
                  </v-chip> </p>
                <p class="ml-3 mt-3" style="margin-bottom:0 !important">
                  <v-chip class="font-weight-bold" color="green" v-if="msetting('finance.wallet_integrated')"  text-color="white" small>
                    Wallet Amount: {{ wallet_amount }} KSH
                  </v-chip>
                </p>
              </div>
              <v-spacer></v-spacer>
              <div class="row">
                <v-toolbar-items>
                  <v-dialog v-model="portalDialog" max-width="900">
                    <template v-slot:activator="{ on }">
                      <v-btn text  v-on="on">
                        procedures
                      </v-btn>
                    </template>

                    <reception-patients-portal :patient-id="visit.patient.id"
                                               is-dialog="true"
                                               v-if="portalDialog"
                                               doc-side="true"
                                               type="investigations"
                                               @close="portalDialog = false">
                    </reception-patients-portal>
                  </v-dialog>

                  <v-dialog v-model="vitalsPortalDialog" max-width="900">
                    <template v-slot:activator="{ on }">
                      <v-btn text  v-on="on">
                        Vitals
                      </v-btn>
                    </template>

                    <reception-patients-portal :patient-id="visit.patient.id"
                                               is-dialog="true"
                                               v-if="vitalsPortalDialog"
                                               doc-side="true"
                                               type="vitals"
                                               @close="vitalsPortalDialog = false">
                    </reception-patients-portal>
                  </v-dialog>

                  <v-btn v-if="msetting('evaluation.remove_theatre_inpatient_renal_diagnosis_bookings') != '1'"
                         text  @click="toggleBookingDialog = true"
                         :class="[bookingButtonDisabled ? 'pink--text' : 'black--text']">
                    {{ bookingButtonDisabled ? 'Booked for Theatre' : 'Book  Theatre' }}
                  </v-btn>

                  <v-btn v-if="msetting('evaluation.remove_theatre_inpatient_renal_diagnosis_bookings') != '1'"
                         text  @click="toggleAdmissionRequestDialog = true"
                         :class="[admissionRequestButtonDisabled ? 'pink--text' : 'black--text']">
                    {{ admissionRequestButtonDisabled ? 'Admission Request Pending' : 'Admission' }}
                  </v-btn>

                  <v-btn small
                         :color="visit.emergency === 1 ? 'red' : 'pink'"
                         :disabled="visit.emergency"
                         text
                         rounded
                         @click="emergencyConsult"
                         class="font-weight-bold">
                    {{ visit.color_code === 1 ? 'Routine' : (visit.color_code === 2 ? 'Urgent' : (visit.color_code === 3 ? 'Very Urgent' : (visit.color_code === 4 ? 'Emergency' : 'Code Patient'))) }}
                  </v-btn>

                  <!-- Start dialysis buttons -->
                  <v-btn
                      v-if="msetting('evaluation.remove_theatre_inpatient_renal_diagnosis_bookings') != '1' &&
                                   isDialytic"
                      text @click="diagnosis = true">
                      {{ renalButtonDisabled ? 'Booked for Dialysis' : 'Dialysis' }}
                    </v-btn>

                  <!-- add a destination -->
                  <v-btn small  rounded text @click="addDestination()">
                    Checkin elsewhere
                  </v-btn>

                  <!-- add a destination -->
                  <evaluation-queue-checkout :id="visit.id"
                                             :from="destinationSlug"
                                             :clinic="visit.clinic.id">
                  </evaluation-queue-checkout>
                </v-toolbar-items>
              </div>
            </div>
          </div>
        </v-toolbar>

        <v-card class="px-4 pb-1" flat  :color="getColor(visit.color_code)">
          <v-dialog v-if="food_allergies" width="500" v-model="foodAllergiesDialog">
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" color="red lighten-2" dark small rounded>
                Food allergies
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="text-h5 grey lighten-2">
                Patient Food Allergies
              </v-card-title>
              <v-card-text>
                {{ food_allergies }}
              </v-card-text>
            </v-card>
          </v-dialog>
          <v-chip v-else color="green" text-color="white" small>
            NKFA
          </v-chip>

          <v-dialog v-if="drug_allergies" width="500" v-model="drugAllergiesDialog">
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" color="red lighten-2" dark small rounded>
                Drug allergies
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="text-h5 grey lighten-2">
                Patient Drug Allergies
              </v-card-title>
              <v-card-text>
                {{ drug_allergies }}
              </v-card-text>
            </v-card>
          </v-dialog>
          <v-chip v-else color="green" text-color="white" small>
            NKDA
          </v-chip>

          <v-dialog v-if="chronicIllness" width="500" v-model="chronicDialog">
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" color="red lighten-2" dark small>
                Patient has Chronic illnesses
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="text-h5 grey lighten-2">
                Patient Chronic Illnesses
              </v-card-title>
              <v-card-text>
                {{ chronicIllness }}
              </v-card-text>
            </v-card>
          </v-dialog>
        </v-card>


        <!-- Modals for the different locations -->
        <renal-diagnosis
            v-if="showDialog()"
            :diagnosis="diagnosis"
            :patientId="visit.patient.id"
            @diagnosed="updateRenalBookingStatus">
        </renal-diagnosis>

        <!-- admission modal -->
        <inpatient-admission-requests-create-modal
            v-if="showDialog()"
            :patientId="visit.patient.id"
            :visitId="visit.id"
            :show="toggleAdmissionRequestDialog"
            @close="toggleAdmissionRequestDialog = false"
            @saved="updateAdmissionRequestStatus"
        >
        </inpatient-admission-requests-create-modal>

        <!-- theatre modal -->
        <theatre-bookings-create-modal
            v-if="showDialog()"
            :visitId="visit.id"
            :show="toggleBookingDialog"
            @close="toggleBookingDialog = false"
            @saved="updateBookingStatus"
        ></theatre-bookings-create-modal>

        <reception-visits-emergency-consult v-if="emergencyConsultVisit"
                                            :show="emergencyConsultDialog"
                                            :visit-obj="emergencyConsultVisit"
                                            @close="closeEmergencyConsult">
        </reception-visits-emergency-consult>

        <reception-add-destination @changed="destinationAdded()"
                                   v-if="destinationVisit"
                                   @close="dialogAddDestination = false"
                                   :show="dialogAddDestination"
                                   :destination-visit="visit"
        >
        </reception-add-destination>
      </div>

    </v-card>
  </transition>
</template>

<script>
import Visit from '@reception/libs/visits/Visit';
import RenalDiagnosis from '@dialysis/components/RenalDiagnosis';
import AddDestination from '@reception/components/visits/partials/AddDestination';
import EmergencyConsult from '@reception/components/visits/partials/EmergencyConsult';

export default {
  name: 'evaluation-patient-information',

  props: [
    'visit_key', 'is-visit', 'document_types', // essentially visit_id
    'drug_allergies', 'food_allergies', 'chronicIllness', 'edd',
  ],

  components: {
    'renal-diagnosis': RenalDiagnosis,
    'reception-add-destination': AddDestination,
    'reception-visits-emergency-consult': EmergencyConsult,
  },

  data() {
    return {
      visitObj: new Visit,
      diagnosis: false,
      toggleAdmissionRequestDialog: false,
      admissionRequestButtonDisabled: false,
      toggleBookingDialog: false,
      bookingButtonDisabled: false,
      renalButtonDisabled:false,
      dialogAddDestination: false,
      destinationVisit: null,
      checkoutDialog: false,
      emergencyConsultVisit: null,
      emergencyConsultDialog: false,
      foodAllergiesDialog: false,
      drugAllergiesDialog: false,
      chronicDialog: false,
      portalDialog: false,
      vitalsPortalDialog: false,
      wallet_number: 0,
      wallet_amount: 0,
      isWalletLoaded: false,
    };
  },

  computed: {
    visit() {
      const visit = this.visitObj.selectedVisit;
      if (visit && this.msetting('finance.wallet_integrated')) {
        const patient_id = this.visitObj.selectedVisit.patient_id;

       
          
      }
      return this.visitObj.selectedVisit;
    },

    isDialytic() {
      return Boolean(this.visit.patient.dialysis);
    },

    destinationSlug() {
      return this.$route.params.destination;
    },

    initialised() {
      return this.visit;
    },
  },

  methods: {
    getColor(colorCode) {
      switch (colorCode) {
        case 1:
          return 'green lighten-4'; // Routine - green
        case 2:
          return 'yellow lighten-4'; // Urgent - yellow
        case 3:
          return 'orange lighten-4'; // Very urgent - orange
        case 4:
          return 'pink lighten-4'; // Emergency - red
        default:
          return 'white'; // Default to white if color code is not recognized
      }
    },
    updateAdmissionRequestStatus() {
      this.toggleAdmissionRequestDialog = false;
      this.admissionRequestButtonDisabled = true;
    },

    updateRenalBookingStatus(){
      this.diagnosis = false
      this.renalButtonDisabled = true
    },
    updateBookingStatus() {
      this.toggleBookingDialog = false;
      this.bookingButtonDisabled = true;
    },
    emergencyConsult: function emergencyConsult() {
      this.emergencyConsultVisit = this.visit;
      this.emergencyConsultDialog = true;
    },
    closeEmergencyConsult: function closeEmergencyConsult() {
      this.emergencyConsultDialog = false;
      this.emergencyConsultVisit = null;
    },

    getPatientImage(patient) {
      if (patient.image) {
        return patient.image;
      }

      return '/img/placeholder.png';
    },

    showDialog() {
      return !this.msetting('evaluation.disable_theatre_renal_inpatient');
    },

    addDestination() {
      this.destinationVisit = this.visit;
      this.dialogAddDestination = true;
    },


    destinationAdded() {
      this.dialogAddDestination = false;
      this.destinationVisit = null;
      flash({
        'message': 'Destination added successfully',
        'alert': 'green',
      });
      window.location.reload();
    },


    openPortal() {
      window.open(`/reception/${this.visit.patient.id}/portal/details`, '_blank');
    },

    initialize() {
      if (this.isVisit) {
        const vist = JSON.parse(this.isVisit);

        let vist_id = null;

        if (this.visit_key) {
          vist_id = this.visit_key;
        } else {
          if (this.$route.params.visitId) {
            vist_id = this.$route.params.visitId;
          } else {
            vist_id = vist.id;
          }
        }
        this.visitObj.find(vist_id);
      }
    },
  },

  async mounted() {
    this.initialize();
  },
};
</script>
