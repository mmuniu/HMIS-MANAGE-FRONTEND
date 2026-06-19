<template>
  <v-card class="ml-4 taller">

    <div  v-if="loadingPayment" class="dialog-payment">
      <v-card>
        <v-card-title class="blue darken-4 text-h5 white--text">
          <span>Waiting for payment..</span>
          <v-spacer/>
          <v-icon class="white--text" @click="closeLoadingPayment()">close</v-icon>
        </v-card-title>
        <v-card-text>
          <collabmed-loading></collabmed-loading>
        </v-card-text>
      </v-card>
    </div>
    <div v-if="visitObj.show_wallet_message && !loadingPayment && wallet_notification || payment_successful
      && !loadingPayment && wallet_notification" class="payment_modal">
      <v-card>
        <v-card-title class="text-h5 primary payment-notification" >{{ card_title }}</v-card-title>
        <v-col md="6" style="max-width: 100% !important" v-if="initiateTopup">
          <input type="hidden" v-model="visitObj.wallet_number">

          <v-row >
            <v-col  offset-md="1" class="mx-4">
              <v-text-field label="Mpesa number"  type="text"  v-model="visitObj.mobile_number"></v-text-field>
            </v-col>
          </v-row>
          <v-row >
            <v-col offset-md="1" class="mx-4">
              <v-text-field label="Amount" outline type="number"  v-model="visitObj.amount" ></v-text-field>
            </v-col>
          </v-row>
        </v-col>
        <v-card-text v-else class="py-4">
          {{visitObj.wallet_message }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary darken-1" @click="initiateTopUpPayment(visitObj)"><i v-if="showTopupLoader" class="fa fa-spinner fa-spin"></i> {{ card_action }}</v-btn>
          <v-btn color="eror darken-1" @click="closeWalletNotification()">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <v-card-title class="grey-text text-darken-2">
      <h2 class="subheading ma-0 pa-0">Check in patient</h2>
    </v-card-title>

    <v-divider class="my-0"></v-divider>

    <v-card-text>

      <collabmed-loading v-if="!initialised"></collabmed-loading>

      <collabmed-floating-loader v-if="systemLoading"></collabmed-floating-loader>

      <v-row  v-else>

        <v-row v-if="thePatient">
          <v-col cols="5" v-if="thePatient.tsc_number && !msetting('reception.change_tsc_no_to_file_no')">
            <span class="text-h5">TSC Number: <strong>{{ thePatient.tsc_number }}</strong></span>

          </v-col>
          <v-col cols="7" v-if="thePatient.tsc_number && !msetting('reception.change_tsc_no_to_file_no')">

            <div v-if="checkingTscNumber">
              <v-icon color="blue">fa fa-spin fa-refresh</v-icon>
              Checking TSC Number Last Visit
            </div>

            <div v-else>
              <div v-if="lastTscNumberVisit">
                <v-alert :value="true" :type="tscNumberStatus(lastTscNumberVisit)" small outlined>
                  TSC Number last visit: {{ lastTscNumberVisit.created_at | moment('from') }} <small>({{ lastTscNumberVisit.created_at_friendly }})</small>
                </v-alert>
              </div>

              <v-alert v-else :value="true" type="info" small outlinedd>
                No previous visit records with this TSC Number
              </v-alert>
              <br/>

            </div>
          </v-col>
        </v-row>

        <v-col v-if="Object.keys(lastVisitMeta).length > 0" cols="6">
          <div v-for="(item, index) in lastVisitMeta" :key="index">
            <v-alert :value="true" :type="item.alert" small outlined>
              <span>
                Last visit: {{ $options.filters.moment(item.lvd_w3c, 'from') }}
                <small>({{ item.lvd_friendly }})</small>
              </span>
              <br>
            </v-alert>
          </div>
        </v-col>

        <v-col cols="12">
          <h2 class="text-body-2 ma-0 pa-0 grey--text text--darken-1">Queueing details</h2>
        </v-col>

        <v-col cols="3">
          <v-subheader class="pl-1">Choose check in destinations</v-subheader>
        </v-col>

        <v-col cols="9">
          <v-autocomplete
              label="Select destinations" outlined multiple
              :items="destinations" item-text="name" item-value="slug"
              v-model="visitObj.destinations" :error="errors.has('destinations')"
              :hint="errors.get('destinations')" persistent-hint @change="errors.clear('destinations')"
          >
            <template
                slot="selection"
                slot-scope="data"
            >
              <v-chip
                  :input-value="data.selected"
                  close
                  class="chip--select-multi"
                  @click:close="removeDestinationFromSelection(data.item)"
                  @input="visitObj.removeDestination(data.item)"
              >
                {{ data.item.name }}
              </v-chip>
            </template>
            <template
                slot="item"
                slot-scope="data"
            >
              <template v-if="typeof data.item !== 'object'">
                <v-list-item-content v-text="data.item"></v-list-item-content>
              </template>
              <template v-else>
                <v-list-item-content>
                  <v-list-item-title v-html="data.item.name"></v-list-item-title>
                </v-list-item-content>
              </template>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="3">
          <v-subheader class="pl-1">Purpose of visit</v-subheader>
        </v-col>

        <v-col cols="9">
          <v-autocomplete
              label="select"
              outlined
              required
              :items="getVisitPurposes"
              @change="institutionSelected()"
              item-text="name" item-value="id"
              v-model="visitObj.visit.purpose"
              persistent-hint
          ></v-autocomplete>
        </v-col>

        <v-divider></v-divider>


        <v-col cols="3">
          <v-subheader class="pl-1">Specify doctor / Consultant</v-subheader>
        </v-col>
        <v-col cols="9">
          <users-search  outlined
                         @results="userSelected"
                         :roles-like="getCheckinToRoles"
                         label="Search for doctor / consultant">
          </users-search>
        </v-col>

        <v-col cols="12" md="9" offset-md="3" v-if="visitObj.consultants.length > 0">
          <v-chip small outlined
                  v-for="(consultant, index) in visitObj.consultants"
                  :key="consultant.id"
                  close
                  @click:close="removeConsultant(index)"
                  color="primary"
                  class="mx-2">
            {{ consultant.name }}<span v-if="consultant.specialty"> ({{ consultant.specialty }})</span>
          </v-chip>
        </v-col>

        <!--                <v-col cols="12">-->
        <!--                    <h2 class="body-2 ma-0 pa-0 grey&#45;&#45;text text&#45;&#45;darken-1">Payment details</h2>-->
        <!--                </v-col>-->

        <v-divider></v-divider>

        <v-col cols="3">
          <v-subheader class="pl-1">Payment method</v-subheader>
        </v-col>

        <v-col cols="9">
          <v-radio-group v-model="visitObj.visit.payment_mode" row>
            <v-radio label="Cash" value="cash" class="mid-center"></v-radio>
            <v-radio label="Insurance" value="insurance" class="mid-center"></v-radio>
          </v-radio-group>
        </v-col>

        <v-col cols="12">
          <transition-group name="slide-fade">
            <v-row  key="insurance" v-if="visitObj.visit.payment_mode == 'insurance'">
              <v-col cols="3">
                <v-subheader class="pl-1">Insurance scheme</v-subheader>
              </v-col>

              <v-col cols="9">
                <v-autocomplete
                    label="Patient scheme" outlined
                    :items="schemes" item-text="scheme_name" item-value="id"
                    v-model="visitObj.visit.scheme" :error="errors.has('visit.scheme')"
                    @change="onSchemeSelect"
                    :hint="errors.get('visit.scheme')" persistent-hint 
                >
                  <template slot="item" slot-scope="{ item }">
                    <v-list-item-content>
                      <v-list-item-title class="text-caption">
                        {{ item.scheme_name }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <span class="text-caption grey--text"> {{  item.company_name }} </span>
                        <span class="pl-5 ml-5">
                                                    <small>Policy Number:   ( {{ item.policy_number }} )</small>
                                                </span>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
          </transition-group>
        </v-col>

        <v-col cols="3">
          <v-subheader class="pl-1">Pre-paid fees</v-subheader>
        </v-col>

        <v-col cols="9">
          <v-switch label="Check switch to allow pre paid fee selection" v-model="visitObj.allowPrePaidProcedures"></v-switch>
        </v-col>

        <v-col cols="12">
          <transition-group name="slide-fade">
            <v-row  v-if="visitObj.allowPrePaidProcedures" key="prepaid">
              <v-col cols="3">
                <v-subheader class="pl-1">Choose procedure(s)</v-subheader>
              </v-col>

              <v-col cols="9">
                <v-autocomplete
                label="Select procedures"
                outlined
                multiple
                :items="procedures"
                item-text="name"
                item-value="value"
                v-model="visitObj.precharges"
                :error="errors.has('precharges')"
                :hint="errors.get('precharges')"
                persistent-hint
                @change="handleProcedureChange"
              ></v-autocomplete>
              </v-col>

                  <!-- Dynamic Doctors Selection -->
                <v-col cols="6">
                  <div v-for="(item, index) in visitObj.proceduresWithDoctors" :key="item.value" class="mb-4">
                    <v-row>
                      <v-subheader>{{ item.name }}</v-subheader>
                    </v-row>
                      <v-row>
             

                        <v-col cols="12">
                          <v-autocomplete
                            label="Select performing doctor"
                            outlined
                            :items="doctors"
                            item-text="name"
                            item-value="id"
                            v-model="visitObj.proceduresWithDoctors[index].doctor"
                            :error="errors.has(`doctor_${index}`)"
                            :hint="errors.get(`doctor_${index}`)"
                            persistent-hint
                            :rules="msetting('reception.make_clinicians_checking_mandatory') ? [v => !!v || 'Performing doctor is required'] : []"
                          ></v-autocomplete>
                        </v-col>
                      </v-row>
                  </div>
                </v-col>
            </v-row>
          </transition-group>
        </v-col>

        <v-col cols="3">
          <v-subheader class="pl-1">Referring Doctor</v-subheader>
        </v-col>

        <v-col cols="9">
          <v-switch label="Applies to Lab-tests (Mostly) requested by external doctors"
                    :error="errors.has('external_doctor')"
                    :hint="errors.get('external_doctor')" persistent-hint
                    v-model="visitObj.external_doctor"></v-switch>
        </v-col>

        <v-col cols="12">
          <transition-group name="slide-fade">
            <v-row  v-if="visitObj.external_doctor" key="prepaid">
              <v-col cols="3">
                <v-subheader class="pl-1">Partner Institution</v-subheader>
              </v-col>

              <v-col cols="9">
                <v-autocomplete
                    label="Select institution"
                    outlined
                    required
                    :items="getPartnerInstitutions.data"
                    @change="institutionSelected()"
                    item-text="name" item-value="id"
                    return-object
                    v-model="institution"
                    :error="errors.has('precharges')"
                    :hint="errors.get('precharges')" persistent-hint
                ></v-autocomplete>
              </v-col>
            </v-row>
          </transition-group>
        </v-col>

        <v-col cols="12">
          <transition-group name="slide-fade">
            <v-row  v-if="institution" key="prepaid">
              <v-col cols="3">
              </v-col>

              <v-col cols="9">
                <v-select
                    label="Select Doctor/Other Staff"
                    outlined
                    required
                    :items="staff"
                    item-text="name" item-value="id"
                    v-model="visitObj.visit.referring_doctor"
                    :error="errors.has('precharges')"
                    :hint="errors.get('precharges')" persistent-hint
                    @change="errors.clear('precharges')"
                ></v-select>
              </v-col>
            </v-row>
          </transition-group>
        </v-col>

        <v-col cols="12" class="text-right" v-if="!visitData">
          <v-btn type="submit" class="green lighten-1"
                 color="blue"
                 v-if="treatable()"
                 large
                 :dark="!saveLoader" :loading="saveLoader" :disabled="saveLoader"
                 @click.prevent="checkin(0)">
            Checkin -
          </v-btn>
          <v-btn type="submit" class="blue lighten-1" color="blue" large
                 v-if="treatable()"
                 :dark="!saveLoader" :loading="saveLoader" :disabled="saveLoader"
                 @click.prevent="checkin(1)">
            Checkin and Treat
          </v-btn>
          <v-btn type="submit" class="purple white--text lighten-1" color="purple" large
                 v-if="visitObj.destinations.includes('inpatient') && treatable()"
                 :dark="!saveLoader" :loading="saveLoader" :disabled="saveLoader"
                 @click.prevent="checkin(2)">
            Checkin and admit
          </v-btn>
        </v-col>

        <v-col cols="12" class="text-right" v-else>
          <v-btn type="submit" class="blue lighten-1" color="blue" large
                 :dark="!saveLoader" :loading="saveLoader" :disabled="saveLoader"
                 @click="updateVisitData()">
            Update visit details
          </v-btn>
        </v-col>


        <!-- random notes-->
        <v-col cols="12" v-if="randomNotes">
          <v-snackbar
              v-model="snackbar"
              bottom right
              color="white"
              :timeout="0"
              multi-line
              vertical
              v-if="randomNotes.length > 0"
          >

            <v-container fluid style="margin: 0; padding: 0">
              <v-row >
                <v-col cols="10">
                  <h4 class="grey--text text-h6">please note:</h4>
                </v-col>
                <v-col cols="2">
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn small icon dark color="blue" @click="dismissSnackbar()" v-on="on">
                        <v-icon>cancel</v-icon>
                      </v-btn>
                    </template>
                    <span>dismiss</span>
                  </v-tooltip>
                </v-col>
              </v-row>

              <v-row >
                <v-col cols="10">
                  <transition-group
                      name="slideInDown"
                      mode="out-in"
                      tag="ul"
                      class="updates-list"
                      enter-active-class="animated fadeInDown"
                      leave-active-class="animated slideOutRight"
                  >
                    <v-row  v-for="(item, index) in randomNotes" :key="item.id">
                      <v-col>
                        <span :class="[item.color  ? item.color + '--text' : 'black--text' ]" class="font-weight-black">{{ item.note }}</span>
                        <br/>
                        <small class="grey--text">
                          created by: {{ item.user }}
                          <br/>
                          on: {{ item.date }}
                        </small>

                        <v-divider></v-divider>

                        <v-tooltip bottom style="float: right; margin-right: 12px; margin-top: -60px;">
                          <template v-slot:activator="{ on }">
                            <v-btn small icon dark v-on="on" @click="clearNote(item.id, index)">
                              <v-icon small color="error">cancel</v-icon>
                            </v-btn>
                          </template>
                          <span>Clear note</span>
                        </v-tooltip>
                      </v-col>
                    </v-row>
                  </transition-group>
                </v-col>
              </v-row>
            </v-container>
          </v-snackbar>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { _ } from 'vue-underscore';
import { mapActions, mapGetters } from 'vuex';
import Visit from '@reception/libs/visits/Visit';
import Patient from '@reception/libs/patients/Patient';
import moment from 'moment';

export default {
  props: [
    'patient', 'userId', 'facilityId', 'patientVisitData', 'morgue',
  ],

  data() {
    return {
      schemes: [],
      procedures: [],
      destinations: [],
      visitObj: new Visit(),
      saveLoader: false,
      thePatient: null,
      institution: null,
      systemLoading: false,
      staff: [],
      snackbar: false,
      patientObj: new Patient(),
      randomNotes: null,
      wallet_notification: false,
      initiateTopup: false,
      card_action: 'Top-up',
      card_title: 'Payment Notification',
      paymentCheckDialog: false,
      payment_successful: false,
      doctors:[],
      loadingPayment: false,
      showTopupLoader: false,
      redirect_url: '',
      lastVisitData: [],
      lastVisitMeta: []
    };
  },

  computed: {
    ...mapGetters([
      'getDestinations', 'getProcedures', 'getPartnerInstitutions', 'getVisitPurposes', 'getPatientRandomNotes',
    ]),

    initialised() {
      return this.destinations.length > 0;
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

    errors() {
      return this.visitObj.form.errors;
    },

    submitted() {
      return this.visitObj.form.submitted;
    },

    contaminated() {
      return this.visitObj.form.errorDetected;
    },

    lastTscNumberVisit() {
      return this.visitObj.lastTscNumberVisit;
    },

    checkingTscNumber() {
      return this.visitObj.checkingTscNumber;
    },


    visitData() {
      if (this.patientVisitData) {
        return JSON.parse(this.patientVisitData);
      } else {
        return null;
      }
    },
  },

  watch: {
    getDestinations({ data }) {
      if (this.morgue == 'true') {
        // Fetch data from the specified API endpoint
        this.fetchDataFromApi();
      } else {
        // Use the existing data
        this.processDestinationsData(data);
      }
    },

    getPatientRandomNotes(val) {
      this.snackbar = true;
      this.randomNotes = val.data;
    },

    getProcedures({ data }) {
      _.each(data, (procedure, index) => {
        this.procedures.push({
          name: `${procedure.name} - (Cash: ${procedure.cash_charge}, Insurance: ${procedure.insurance_charge})`,
          value: procedure.id,
        });
      });
    },

    contaminated(value) {
      if (value) {
        this.saveLoader = false;

        this.visitObj.form.errorDetected = false;
      }
    },

    submitted(value) {
      if (value) {
        this.saveLoader = false;

        this.visitObj.form.submitted = false;
      }
    },

    thePatient(val) {
      this.setPatientRandomNotes({
        params: {
          patient_id: val.id,
        },
      });
    },
  },

  methods: {
    ...mapActions([
      'setDestinations', 'setProcedures', 'setPartnerInstitutions', 'setVisitPurposes', 'setPatientRandomNotes',
    ]),
    async fetchDataFromApi() {
      try {
        const response = await fetch(`/api/morgue/setup/get/morgue/`);
        const data = await response.json();

        this.processDestinationsData(data);
      } catch (error) {
        console.error('Error fetching data from API:', error);
      }
    },
    async onSchemeSelect(selectedId) {
      const selectedScheme = this.schemes.find(scheme => scheme.id === selectedId);
      if (!selectedScheme) return;
  
      const data = {
          scheme_id: selectedScheme.scheme_id,
          patient_id: this.thePatient.id,
          facility_id: JSON.parse(this.facilityId)
      };

      this.visitObj.visit.patient_scheme_id = selectedScheme.scheme_id;
      try {
          const scheme_procedures = await this.visitObj.fetchExcludedSchemeProcedures(data);
  
          if (scheme_procedures.length > 0) {
            
              // Create a map of new procedures for a quick lookup
              const newProceduresMap = new Map(scheme_procedures.map(proc => [proc.id, proc]));
  
              // Update existing procedures if they exist, otherwise keep them
              this.procedures = this.procedures.map(proc => {
                  if (newProceduresMap.has(proc.value)) {
                      const updatedProc = newProceduresMap.get(proc.value);
                      return {
                    
                          name: `${updatedProc.name} - (Cash: ${updatedProc.price}, Insurance: ${updatedProc.price},Exclusion : ${updatedProc.price})`,
                          value: updatedProc.id
                      };
                  }
                  return proc; // Keep procedures that are not in newProceduresMap
              });
  
              // Find new procedures that are not in the current list and add them
              scheme_procedures.forEach(proc => {
                  if (!this.procedures.some(existing => existing.value === proc.id)) {
                      this.procedures.push({
                          name: `${proc.name} - (Cash: ${proc.price}, Insurance: ${proc.price}),Exclusion : ${proc.price})`,
                          value: proc.id
                      });
                  }
              });
          }
      } catch (error) {
          console.error("Error fetching procedures:", error);
      }
  },
    processDestinationsData(data) {
      _.each(data, (places, header) => {
        header = header.toUpperCase();
        this.destinations.push({ header });

        _.each(places, (destination) => {
          if (destination.slug) {
            this.destinations.push({
              name: destination.name,
              slug: destination.slug,
            });

            if (destination.auto_checkin) {
              this.visitObj.destinations.push(destination.slug);
            }
          }
        });

        this.destinations.push({ divider: true });
      });
    },
    handleProcedureChange(selectedProcedureIds) {
      this.visitObj.proceduresWithDoctors = selectedProcedureIds.map((procedureId) => {
        // Find the complete procedure object from the procedures array
        const procedure = this.procedures.find((item) => item.value === procedureId);
    
        if (!procedure) {
          console.error(`Procedure with ID ${procedureId} not found in procedures list.`);
          return null; // Handle cases where a procedure ID is not found
        }
    
        // Preserve the existing doctor selection, if any
        const existing = this.visitObj.proceduresWithDoctors.find((item) => item.id === procedureId);
    
        return {
          id: procedureId, // Send the ID to the backend
          name: procedure.name, // Display the name in the UI
          doctor: existing ? existing.doctor : null, 
          performing_doctor_id: existing && existing.doctor ? existing.doctor.id : null,
        };
      }).filter(Boolean); // Remove null entries in case a procedure wasn't found
    
      // Remove errors for removed procedures
    },
      

    
    userSelected(val) {
      const consultant = {
        specialty:val.specialty,
        name: val.full_name,
        id: val.id,
      };

      if (!this.visitObj.consultants.some((consul) => JSON.stringify(consul) === JSON.stringify(consultant))) {
        this.visitObj.consultants.push(consultant);
      }
    },

    removeConsultant(index) {
      this.visitObj.consultants.splice(index, 1);
    },
    closeWalletNotification() {
      this.wallet_notification=false;
      location.href = this.redirect_url;
    },
    closeLoadingPayment() {
      this.loadingPayment = false;
      this.visitObj.show_wallet_message= false;
      location.href = this.redirect_url;
    },
    async initiateTopUpPayment(visit) {
      this.initiateTopup= true;
      this.card_action = 'Initiate';
      this.card_title = 'Initiate Payment';

      const response = await this.visitObj.requestClientPayment(visit);
      this.showTopupLoader=true;
      if (response.transaction_id) {
        this.loadingPayment = true;

        // this.initiatePaymentChecks('finsprint', response.transaction_id);
        this.startUpdatingBalance();
      }
    },
    initiatePaymentChecks(type, transaction_id) {
      this.paymentCheckDialog = true;

      if (this.paymentCheckDialog) {
        setTimeout(() => {
          const check = setInterval(async () => {
            if (!this.paymentCheckDialog) {
              this.loadingPayment = false;

              clearInterval(check);
              // this.stopUpdatingBalance();
            }
            if (this.paymentCheckDialog) {
              await this.fetchPayment(type, transaction_id, this.visitObj.mobile_number);
            }
          }, 3000);
        }, 5000);
      }
    },
    startUpdatingBalance() {
      setTimeout(() => {
        this.loadingPayment = false;
        this.wallet_notification =false;
        this.showTopupLoader=false;
        location.href = this.redirect_url;
      }, 9000);
    },
    async fetchPayment(type, transaction_id, number) {
      const response = await this.visitObj.fetchTransaction(transaction_id, number);

      if (response) {
        const response_data = response.data[0];

        if (response_data.ref_no) {
          // this.his.visitObj.mpesa.code = response_data.ref_no;
          this.paymentCheckDialog = false;
          this.payment_successful =true;
        }
      }
    },
    treatable() {
      if (this.thePatient) {
        if (!this.thePatient.is_dependant) {
          return true;
        } else {
          if (this.thePatient.is_dependant.eligible) {
            return true;
          }
        }
        return false;
      }
    },

    removeDestinationFromSelection(destination) {
      const index = this.visitObj.destinations.indexOf(destination.slug);

      if (index >= 0) this.visitObj.destinations.splice(index, 1);
    },

    dismissSnackbar() {
      this.snackbar = false;
    },

    async clearNote(note_id, index) {
      await this.patientObj.clearNote(this.thePatient.id, note_id);

      this.randomNotes.splice(index, 1);
    },

    institutionSelected() {
      this.staff = this.institution.staff;
    },

    initialise() {
      const patient = JSON.parse(this.patient);
      const facilityId = JSON.parse(this.facilityId);

      if (patient.tsc_number && !this.msetting('reception.change_tsc_no_to_file_no')) {
        this.visitObj.checkLastVisitForTscNumber(patient.tsc_number);
      }

      this.setDestinations();
      this.setPartnerInstitutions();
      this.setVisitPurposes();
      if (this.visitData) {
        this.visitObj.assemble(this.visitData);
      }

      this.setProcedures({
        params: {
          precharge: 1,
          facility_id: facilityId, // most facilities will have the save consultation fees e.g. amber
          no_pagination: true,
        },
      });

      this.schemes = patient.schemes;
      this.visitObj.visit.patient = patient.id;
      this.visitObj.visit.clinic = facilityId;
      this.visitObj.visit.user = JSON.parse(this.userId);
    },

    async updateVisitData() {
      this.systemLoading = true;

      const response = await this.visitObj.update();

      if (response) {
        this.systemLoading = false;
      }
    },

    async fetchDoctors(){ 
      try {
        const response = await fetch('/api/users/get/doctors');
    
        // Check if the response is successful
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
            this.doctors = Array.isArray(data)
          ? data.map(doctor => ({
              id: doctor.id, 
              name: doctor.full_name || doctor.username ,
            }))
          : []; 
    
      } catch (error) {
        console.error('Error fetching doctors:', error);
        this.doctors = []; // Handle errors gracefully by resetting the list
      }
    },
    
    async checkin(redirect = 1) {
      // here do validation to check if user has not selected a prepaid fee and payment mode is cash throw error
      if (this.msetting('reception.enforce_prepaid_fees') && this.visitObj.precharges.length === 0) {
        flash({
          message: 'Please select pre-paid fee to continue!',
          alert: 'error',
        });
        return; // Stop execution further if condition is not met
      }


      // Validate if all procedures have a performing doctor selected if performing doctor compulsory has been set
      if (this.msetting('reception.performing_doctor_compulsory')){
        const missingDoctors = this.visitObj.proceduresWithDoctors.filter((item) => !item.doctor);
        if (missingDoctors.length > 0) {
          flash({
            message: 'Please assign a performing doctor to all selected procedures before continuing!',
            alert: 'error',
          });
          return; 
        }
      }
      
      this.saveLoader = true;
      this.wallet_notification = true;
      this.redirect_url = await this.visitObj.save(redirect);
    },

    tscNumberStatus(visit) {
      const diff = moment().diff(visit.created_at_w3c, 'days');

      return diff < 7 ? 'error' : 'success';
    },
  },


  mounted() {
    this.thePatient = JSON.parse(this.patient);
    this.visitObj.fetchPatientWalletNumber(this.thePatient.id);
    this.initialise();
    this.fetchDoctors();
    axios.get(route('api.reception.visits.last-visit-meta', this.thePatient.id))
        .then((response) => {
          this.lastVisitMeta = response.data;
        })
        .catch((error) => {
          console.error('Error fetching visitData:', error);
        });
  },
};
</script>

<style lang="scss">
.v-input--selection-controls.v-input .v-label {
  top: 3px;
}

.payment-notification {
  color:white !important
}
.payment_modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000; /* Ensure it's on top of other elements */
}

.dialog-payment{
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000; /* Ensure it's on top of other elements */
}
.v-subheader {
  margin-top: 7px;
}

.updates-list {
  max-height: 400px;
  overflow-y: auto;

  li {
    line-height: 1.4;
    word-wrap: break-word;
  }
}
</style>

