<template>
  <!--<collabmed-loading v-if="!initialised"></collabmed-loading>-->

  <div v-if="initialised">
    <!-- Stop drug use -->
    <v-dialog
        v-model="stopDialog"
        width="400">
      <v-card>
        <v-card-title
            class="subheading"
            primary-title >
          Cancel prescription
          <v-spacer></v-spacer>
          <v-btn text icon small color="red" @click="stopDialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
          <v-row >
            <v-col cols="12">
              <p>Enter reason for stopping drug</p>
              <v-textarea
              outlined
              rows="8"
              v-model="prescription.stop_reason"
              :error="showError"
              :error-messages="showError ? 'This field is required' : ''"
              @input="validateStopReason"
              required
            ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider class="my-0"></v-divider>

        <v-card-actions>
          <v-btn
              color="pink"
              @click="stopDrug()"
              block large class="my-2"
              :dark="!saveLoader" 
              :loading="saveLoader" 
              :disabled="saveLoader || !isValid"
              >
            Stop drug
          </v-btn>

          
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- End of stop drug -->



     <!-- Start of rturn dialog-->
     <v-dialog
     v-model="returnDialog"
     width="400"
 >
   <v-card>
    <v-card-title class="subheading" primary-title>
      Return Drug
      <v-spacer></v-spacer>
      <v-btn text icon small color="red" @click="returnDialog = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    <v-divider class="my-0"></v-divider>
    <v-form
    ref="returnForm"
    v-if="return_status == 'pending'"
    @submit.prevent="submitAcceptForm">
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <p>Dispensed and not administered</p>
          <v-text-field
            v-model="dispensedNotAdministered"
            type="number"
            outlined
            required
            readonly
            label="Dispensed and not administered"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <p>To return</p>
          <v-text-field
            v-model.number="toReturn"
            type="number"
            outlined
            label="Return Quantity"
            required
            min="0"
            :rules="[value => value <= dispensedNotAdministered || 'Cannot return more than dispensed']"
            @blur="onToReturnInput"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>
  
    <v-divider class="my-0"></v-divider>
  
    <v-card-actions>
      <v-spacer></v-spacer>
      <!-- Actions for 'pending' status -->
      <v-btn color="blue" :loading="isSubmitting" :disabled="isSubmitting || dispensedNotAdministered === 0 || !toReturn || toReturn > dispensedNotAdministered" type="submit">Accept</v-btn>
      <v-btn color="red" :loading="isSubmitting" :disabled="isSubmitting || dispensedNotAdministered === 0 || !toReturn || toReturn > dispensedNotAdministered"  @click="rejectReturn">Reject</v-btn>
    </v-card-actions>
  </v-form>
  
  <!-- Form for 'null' status -->
  <v-form
    ref="returnForm"
    v-else-if=" return_status != 'pending'"
    @submit.prevent="submitReturnForm"
  >
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <p>Dispensed and not administered</p>
          <v-text-field
            v-model="dispensedNotAdministered"
            type="number"
            outlined
            required
            readonly
            label="Dispensed and not administered"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <p>Return Details</p>
          <v-text-field
          v-model.number="toReturn"
          type="number"
          outlined
          label="Return Quantity"
          required
          min="0"
          :rules="[value => value <= dispensedNotAdministered || 'Cannot return more than dispensed']"
          @blur="onToReturnInput"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>
  
    <v-divider class="my-0"></v-divider>
  
    <v-card-actions style="display:flex;justify-content:center">
      <v-spacer></v-spacer>
      <v-btn color="primary" :loading="isSubmitting" 
      :disabled="isSubmitting || dispensedNotAdministered === 0 || !toReturn || toReturn > dispensedNotAdministered" 
      type="submit">Return</v-btn>
    </v-card-actions>
  </v-form>
  

     <v-divider class="my-0"></v-divider>

     <v-card-actions>
      
     </v-card-actions>
   </v-card>
 </v-dialog>
 <!-- End of return drug dialog -->

    <v-card flat>
      <v-card-title class="subheading font-weight-bold grey--text">
        List of prescribed
        <v-spacer></v-spacer>
        <v-menu transition="slide-y-transition" bottom>
          <template v-slot:activator="{ on }">
            <v-btn @click="print(theVisitId, 'a4','administered')" target="_blank" color="success" id="print-prescriptions">
              <i class="fa fa-print pr-3"></i> Print Prescriptions + Administrations
          </v-btn>&nbsp;&nbsp;
            <v-btn  color="primary" @click="openAdministerDrugsModal()">
              <i class="fa fa-ambulance pr-3"></i> Administer Drugs
            </v-btn>&nbsp;&nbsp;
            <v-btn class="purple" color="primary" dark v-on="on">
              Print prescriptions
            </v-btn>
          </template>
          <v-list>
            <v-list-item>
              <v-btn small color="primary" @click="print(theVisitId, 'a4')">Print A4</v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn small color="primary" @click="print(theVisitId, 'a5')">Print A5</v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn small color="primary" @click="print(theVisitId, 'thermal')">Print thermal</v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-title>

      <v-divider class="my-0"></v-divider>

      <v-card-text>
        <v-data-table
            :headers="prescriptions.headers"
            :items="list"
            class="mb-3"
              :items-per-page="-1"
            hide-default-footer
        >
          <template v-slot:item.#="{ item }">
            <v-checkbox
                v-model="selectedPrescriptions"
                :value="item.id"
                primary
                hide-details
            ></v-checkbox>
          </template>

          <template v-slot:item.date="{ item }">
            {{ item.created_at }}
          </template>

          <template v-slot:item.drug="{ item }">
            {{ item.drug_name }}
          </template>

          <template v-slot:item.dose="{ item }">
            {{ item.dosage }}
          </template>

          <template v-slot:item.prescribed_by="{ item }">
            {{ item.prescribed_by }}
          </template>

          <template v-slot:item.meta="{ item }">
            <td>
             
              <v-chip small color="info" text-color="white" v-if="item.for_admission">For Admission</v-chip>
              <v-chip small color="success" text-color="white" v-if="item.for_discharge">For Discharge</v-chip>
              <v-chip small color="indigo" text-color="white" v-if="item.treatment_location_name === 'inpatient'">Inpatient</v-chip>
              <v-chip small color="brown" text-color="white" v-if="item.treatment_location_name === 'outpatient'">Outpatient</v-chip>
              <v-chip small color="orange" text-color="white" v-if="item.treatment_location_name === 'theatre'">Theatre</v-chip>
            </td>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text small v-on="on" icon color="primary" dark @click="editPrescriptionData(item)">
                  <v-icon small>edit</v-icon>
                </v-btn>
              </template>
              <span>Edit prescription data (date)</span>
            </v-tooltip>

            <span v-if="destinationType != 'evaluation'">
                                <v-btn dark small color="warning" @click="updateDialog(item.id)" :disabled="item.stopped" v-if="!item.stopped">
                                    stop
                                </v-btn>
                                <v-chip v-else small color="grey" text-color="white">Drug stopped</v-chip>
                            </span>
                            <v-btn dark small 
                            :color="item.return_status === 'pending' ? 'purple' : 'green'"
                            :loading="loadingId === item.id"
                            :disabled="loadingId === item.id"
                            @click="openReturnDialog(item)">
                            {{ item.return_status === 'pending' ? 'Pending' : 'Return' }}
                           </v-btn>

            <v-btn dark icon rounded small color="red" @click="cancelPrescription(item.id)" v-if="!item.canceled">
              <v-icon small>delete</v-icon>
            </v-btn>

            <v-chip v-else small color="grey" text-color="white">Cancelled</v-chip>
          </template>

          <template slot="footer" v-if="links">
            <v-row  class="py-2 pb-2">
              <v-col cols="3" class="mt-3 ml-3">
                Total records: {{ prescriptions.meta.total }}
              </v-col>

              <v-col cols="8" class="text-right">
                <v-pagination
                    v-model="page"
                    :length="prescriptions.meta.last_page"
                    circle
                    :total-visible="8"
                ></v-pagination>

                <!--<v-btn icon @click="navigate(links.prev)" :disabled="prescriptions.meta.current_page <= 1">
                    <v-icon>chevron_left</v-icon>
                </v-btn>
                <v-btn icon @click="navigate(links.next)" :disabled="prescriptions.meta.current_page === prescriptions.meta.last_page">
                    <v-icon>chevron_right</v-icon>
                </v-btn>-->
              </v-col>
            </v-row>
          </template>
        </v-data-table>

        <!-- editing dialog -->
        <v-dialog v-model="prescriptionEditDialog" width="400" v-if="prescriptionData">
          <v-card>
            <v-card-title class="text-h5 primary" primary-title>
              <span class="font-weight-bold white--text">{{ prescriptionData.drug_name | ucwords }} </span>

              <v-btn icon small dark @click.native="prescriptionEditDialog = false" absolute right>
                <v-icon small>close</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text>
              <v-row>
                <v-col>
                  <collabmed-date-time-picker outline @input="updateDate" :datetime="prescriptionData.non_formatted_created_at" label="update date"></collabmed-date-time-picker>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>


    <v-card flat>
      <v-card-title class="subheading font-weight-bold grey--text">
        List of own medications
        <v-spacer></v-spacer>
        <v-menu transition="slide-y-transition" bottom>
          <!-- <template v-slot:activator="{ on }">
            <v-btn @click="print(theVisitId, 'a4','administered')" target="_blank" color="success" id="print-prescriptions">
              <i class="fa fa-print pr-3"></i> Print Prescriptions + Administrations
          </v-btn>&nbsp;&nbsp;
            <v-btn  color="primary" @click="openAdministerDrugsModal()">
              <i class="fa fa-ambulance pr-3"></i> Administer Drugs
            </v-btn>&nbsp;&nbsp;
            <v-btn class="purple" color="primary" dark v-on="on">
              Print prescriptions
            </v-btn>
          </template> -->
          <!-- <v-list>
            <v-list-item>
              <v-btn small color="primary" @click="print(theVisitId, 'a4')">Print A4</v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn small color="primary" @click="print(theVisitId, 'a5')">Print A5</v-btn>
            </v-list-item>
            <v-list-item>
              <v-btn small color="primary" @click="print(theVisitId, 'thermal')">Print thermal</v-btn>
            </v-list-item>
          </v-list> -->
        </v-menu>
      </v-card-title>

      <v-divider class="my-0"></v-divider>

      <v-card-text>
        <v-data-table
            :headers="own_prescriptions.headers"
            :items="own_list"
            class="mb-3"
              :items-per-page="-1"
            hide-default-footer
        >
          <template v-slot:item.#="{ item }">
            <v-checkbox
                v-model="selectedPrescriptions"
                :value="item.id"
                primary
                hide-details
            ></v-checkbox>
          </template>

          <template v-slot:item.date="{ item }">
            {{ item.created_at }}
          </template>

          <template v-slot:item.drug="{ item }">
            {{ item.drug_name }}
          </template>

          <template v-slot:item.dose="{ item }">
            {{ item.dosage }}
          </template>
          <template v-slot:item.meta="{ item }">
            <td>

              <v-chip small color="info" text-color="white" v-if="item.for_admission">For Admission</v-chip>
              <v-chip small color="success" text-color="white" v-if="item.for_discharge">For Discharge</v-chip>
              <v-chip small color="indigo" text-color="white" v-if="item.treatment_location_name === 'inpatient'">Inpatient</v-chip>
              <v-chip small color="brown" text-color="white" v-if="item.treatment_location_name === 'inpatient'">Outpatient</v-chip>
              <v-chip small color="orange" text-color="white" v-if="item.treatment_location_name === 'theatre'">Theatre</v-chip>
            </td>
          </template>

          <template v-slot:item.prescribed_by="{ item }">
            {{ item.prescribed_by }}
          </template>

          

          <template v-slot:item.actions="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text small v-on="on" icon color="primary" dark @click="editPrescriptionData(item)">
                  <v-icon small>edit</v-icon>
                </v-btn>
              </template>
              <span>Edit prescription data (date)</span>
            </v-tooltip>

            <span v-if="destinationType != 'evaluation'">
                                <v-btn dark small color="warning" @click="updateDialog(item.id)" :disabled="item.stopped" v-if="!item.stopped">
                                    stop
                                </v-btn>

                                <v-chip v-else small color="grey" text-color="white">Drug stopped</v-chip>
                            </span>

            <v-btn dark icon rounded small color="red" @click="cancelPrescription(item.id)" v-if="!item.canceled">
              <v-icon small>delete</v-icon>
            </v-btn>

            <v-chip v-else small color="grey" text-color="white">Cancelled</v-chip>
          </template>

          <template slot="footer" v-if="links">
            <v-row  class="py-2 pb-2">
              <v-col cols="3" class="mt-3 ml-3">
                Total records: {{ prescriptions.meta.total }}
              </v-col>

              <v-col cols="8" class="text-right">
                <v-pagination
                    v-model="page"
                    :length="prescriptions.meta.last_page"
                    circle
                    :total-visible="8"
                ></v-pagination>

                <!--<v-btn icon @click="navigate(links.prev)" :disabled="prescriptions.meta.current_page <= 1">
                    <v-icon>chevron_left</v-icon>
                </v-btn>
                <v-btn icon @click="navigate(links.next)" :disabled="prescriptions.meta.current_page === prescriptions.meta.last_page">
                    <v-icon>chevron_right</v-icon>
                </v-btn>-->
              </v-col>
            </v-row>
          </template>
        </v-data-table>

        <!-- editing dialog -->
        <v-dialog v-model="prescriptionEditDialog" width="400" v-if="prescriptionData">
          <v-card>
            <v-card-title class="text-h5 primary" primary-title>
              <span class="font-weight-bold white--text">{{ prescriptionData.drug_name | ucwords }} </span>

              <v-btn icon small dark @click.native="prescriptionEditDialog = false" absolute right>
                <v-icon small>close</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text>
              <v-row>
                <v-col>
                  <collabmed-date-time-picker outline @input="updateDate" :datetime="prescriptionData.non_formatted_created_at" label="update date"></collabmed-date-time-picker>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>

    
    <v-card flat>
      <v-card-title class="subheading font-weight-bold grey--text">
        List of cancelled/stopped drugs
        <v-spacer></v-spacer>
     
      </v-card-title>

      <v-divider class="my-0"></v-divider>

      <v-card-text>
        <v-data-table
            :headers="cancelled_prescriptions.headers"
            :items="cancelled_list"
            class="mb-3"
              :items-per-page="-1"
            hide-default-footer
        >
        
          <template v-slot:item.date="{ item }">
            {{ item.created_at }}
          </template>

          <template v-slot:item.drug="{ item }">
            {{ item.drug_name }}
          </template>

          <template v-slot:item.dose="{ item }">
            {{ item.dosage }}
          </template>
          <template v-slot:item.meta="{ item }">
            <td>
              <!-- <v-chip color="black" text-color="white" @click="printLabel(item)">Print Label</v-chip> -->
              <v-chip small color="info" text-color="white" v-if="item.for_admission">For Admission</v-chip>
              <v-chip small color="success" text-color="white" v-if="item.for_discharge">For Discharge</v-chip>
              <v-chip small color="indigo" text-color="white" v-if="item.treatment_location_name === 'inpatient'">Inpatient</v-chip>
              <v-chip small color="indigo" text-color="white" v-if="item.treatment_location_name === 'outpatient'">Outpatient</v-chip>
              <v-chip small color="orange" text-color="white" v-if="item.treatment_location_name === 'theatre'">Theatre</v-chip>
            </td>
          </template>
          <template v-slot:item.prescribed_by="{ item }">
            {{ item.prescribed_by }}
          </template>

          <template v-slot:item.actions="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn text small v-on="on" icon color="primary" dark @click="editPrescriptionData(item)">
                  <v-icon small>edit</v-icon>
                </v-btn>
              </template>
              <span>Edit prescription data (date)</span>
            </v-tooltip>

            <span v-if="destinationType != 'evaluation'">
                                <v-btn dark small color="warning" @click="updateDialog(item.id)" :disabled="item.stopped" v-if="!item.stopped">
                                    stop
                                </v-btn>
                <v-chip v-else small color="grey" text-color="white">Drug stopped</v-chip>
               
            </span>
            <v-btn dark small 
              :color="item.return_status === 'pending' ? 'purple' : 'green'"
            :loading="loadingId === item.id"
            :disabled="loadingId === item.id"
            @click="openReturnDialog(item)">
              {{ item.return_status === 'pending' ? 'Pending' : 'Return' }}
            </v-btn>
     
            <v-btn dark icon rounded small color="red" @click="cancelPrescription(item.id)" v-if="!item.canceled">
              <v-icon small>delete</v-icon>
            </v-btn>

            <v-chip v-else small color="grey" text-color="white">Cancelled</v-chip>
          </template>

          <template slot="footer" v-if="links">
            <v-row  class="py-2 pb-2">
              <v-col cols="3" class="mt-3 ml-3">
                Total records: {{ prescriptions.meta.total }}
              </v-col>

              <v-col cols="8" class="text-right">
                <v-pagination
                    v-model="page"
                    :length="prescriptions.meta.last_page"
                    circle
                    :total-visible="8"
                ></v-pagination>

                <!--<v-btn icon @click="navigate(links.prev)" :disabled="prescriptions.meta.current_page <= 1">
                    <v-icon>chevron_left</v-icon>
                </v-btn>
                <v-btn icon @click="navigate(links.next)" :disabled="prescriptions.meta.current_page === prescriptions.meta.last_page">
                    <v-icon>chevron_right</v-icon>
                </v-btn>-->
              </v-col>
            </v-row>
          </template>
        </v-data-table>

        <!-- editing dialog -->
        <v-dialog v-model="prescriptionEditDialog" width="400" v-if="prescriptionData">
          <v-card>
            <v-card-title class="text-h5 primary" primary-title>
              <span class="font-weight-bold white--text">{{ prescriptionData.drug_name | ucwords }} </span>

              <v-btn icon small dark @click.native="prescriptionEditDialog = false" absolute right>
                <v-icon small>close</v-icon>
              </v-btn>
            </v-card-title>

            <v-card-text>
              <v-row>
                <v-col>
                  <collabmed-date-time-picker outline @input="updateDate" :datetime="prescriptionData.non_formatted_created_at" label="update date"></collabmed-date-time-picker>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>
    <!--      beginning of administer drugs modal-->


    <administer-drugs-modal
        v-if="administerDrugsModal"
        :visit-id="theVisitId"
        :prescriptions="prescriptions"
        @close="administerDrugsModal = false"
    ></administer-drugs-modal>
    <!--      end of drugs modal-->

    <drug-label-printout
    @close="dialogPrintLabel = false"
    :show="dialogPrintLabel"
    :drug="drug"
    :patient_id="patient_id"
    :selected-visit="visit_object"
>
</drug-label-printout>

  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Prescription from '@evaluation/libs/notes/Prescription';
import Visit from '@reception/libs/visits/Visit';
import DrugLabelPrintout from '@evaluation/components/evaluation/actions/partials/DrugLabelPrintout';

export default {
  props: {
    visitId: {
      default: null,
      type: Number,
    },
    isOfType: {
      type: String,
      default: null,
    },
  },
  components: {
    'drug-label-printout': DrugLabelPrintout,
  },
  data() {
    return {
      prescriptions: null,
      own_prescriptions:null,
      patient_id: null,
      cancelled_prescriptions: {
      headers: [
        { text: 'Date', value: 'created_at' },
        { text: 'Drug', value: 'drug_name' },
        { text: 'Dose', value: 'dosage' },
        { text: 'Prescribed By', value: 'prescribed_by' },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    },     
    drug: [],
    administered_prescriptions: null,
      prescriptionData: null,
      dialogPrintLabel: false,
      visit_object:[],
      prescriptionEditDialog: false,
      stopDrugId: null,
      stopDialog: false,
      saveLoader: false,
      hasInteracted: false,
      returnDialog:false,
      returnDrugId:null,
      loadingId: null,
      prescription: new Prescription(),
      visitObj: new Visit(),
      selectedPrescriptions: [],
      page: 1,
      administerDrugsModal: false,
      dispensedNotAdministered: null,
      toReturn: null,
      return_status:null,
      returnQuantity:null,
      isSubmitting: false, // Loading state for buttons
      output_return_quantity:null
    };
  },
  watch: {
    getPrescriptions(value) {
      this.prescriptions = value.prescriptions;
      this.administered_prescriptions= value.prescriptions.data
    },
    contaminated(value) {
      if (value) {
        this.formLoader = false;
        this.saveLoader = false;
        this.prescription.form.errorDetected = false;
      }
    },
    page(value) {
      // let page = url.substring(url.indexOf("page=")).split("page=")[1];
      this.setPrescriptions({
        page: value,
        params: {
          visit_id: this.theVisitId,
          paginate_results: true,
        },
      });
    },
    visit(val) {
      this.patient_id = val.patient_id;
    },
    submitted(value) {
      if (value) {
        this.formLoader = false;
        this.prescription.form.submitted = false;
        this.stopDrugId = null;
        this.stopDialog = false;
        this.saveLoader = false;
        this.setPrescriptions({
          params: {
            visit_id: this.theVisitId,
          },
        });
      }
    },
  },
  computed: {
    ...mapGetters([
      'getPrescriptions',
    ]),
    initialised() {
      // console.log(this.administered_prescriptions)
      return this.prescriptions;
    },
    destinationType() {
      return window.location.href.split('/')[3];
    },
    theVisitId() {
      if (this.visitId) {
        return this.visitId;
      } // from prop
      return this.$route.params.visitId;
    },
    list() {
      if (this.isOfType && this.prescriptions.data) {
        return this.prescriptions.data.filter((prescription) => {
          return prescription.treatment_location_name.includes(this.isOfType);
        });
      }
      return this.prescriptions.data;
    },
    own_list() {
      return this.own_prescriptions.data;
    },
    visit() {
      return this.visitObj.selectedVisit;
    },
    cancelled_list(){
      return this.cancelled_prescriptions.data;
    },
    links() {
      return this.prescriptions.links;
    },
    errors() {
      return this.prescription.form.errors;
    },
    submitted() {
      return this.prescription.form.submitted;
    },
    contaminated() {
      return this.prescription.form.errorDetected;
    },
    isValid() {
    // Ensure that stop_reason is a non-empty string after trimming
    return (this.prescription.stop_reason ?? '').trim().length > 0;
  },
  showError() {
    // Show error if the field is empty after interacting with it
    return !this.isValid && this.hasInteracted;
  }
  },
  methods: {
    ...mapActions([
      'setPrescriptions',
    ]),
    print(visitId, paper,administered=null) {
      this.prescription.print(visitId, paper, this.selectedPrescriptions,administered);
    },
    onToReturnInput() {
      // Ensure `toReturn` doesn't exceed `dispensedNotAdministered`
      if (this.toReturn > this.dispensedNotAdministered) {
        this.toReturn = this.dispensedNotAdministered;
      }
    },
    printLabel(item) {
      this.dialogPrintLabel = true;
      this.drug= item.drug;
      this.visit_object= this.visitObj.selectedVisit;
    },

    async submitPendingReturnForm() {
        // Capture form data here
        // console.log("Prescription ID:", this.returnDrugId);
        // console.log("Dispensed and not administered:", this.dispensedNotAdministered);
        // console.log("To return:", this.toReturn);

        // Construct data to send to the backend
        const payload = {
          prescription_id: this.returnDrugId,
          dispensed_quantity: this.dispensedNotAdministered,
          status:this.status,
          return_quantity: this.toReturn,
        };
        const response = await this.prescription.returnPrescription(payload);
      if (response) {
          // Close dialog and reset form
          this.resetForm();
        this.returnDialog = false;
      }

     
    },

    async submitAcceptForm(){

      this.isSubmitting = true; // Disable both buttons during submission
      try {
        const payload = {
          prescription_id: this.returnDrugId,
          dispensed_quantity: this.dispensedNotAdministered,
          return_quantity: this.toReturn,
          status: "accept",
        };

        const response = await this.prescription.updateReturnPrescription(payload);

        if (response) {
          this.resetForm();
          this.returnDialog = false;
          this.loadTable();
        }

        return response;
      } catch (error) {
        console.error("Error submitting accept form:", error);
      } finally {
        this.isSubmitting = false; // Re-enable buttons
      }
    },

    async rejectReturn(){
        // Construct data to send to the backend
        this.isSubmitting = true; // Disable both buttons during submission
      try {
        const payload = {
          prescription_id: this.returnDrugId,
          status: "rejected",
        };

        const response = await this.prescription.updateReturnPrescription(payload);

        if (response) {
          this.resetForm();
          this.returnDialog = false;
          this.loadTable();
        }

        return response;
      } catch (error) {
        console.error("Error submitting reject form:", error);
      } finally {
        this.isSubmitting = false; // Re-enable buttons
      }
    },
    async submitReturnForm() {
        

      this.isSubmitting = true; // Disable both buttons during submission
      try {
        const payload = {
          prescription_id: this.returnDrugId,
          dispensed_quantity: this.dispensedNotAdministered,
          return_quantity: this.toReturn,
          status:"pending"
        };

        const response = await this.prescription.updateReturnPrescription(payload);

        if (response) {
          this.resetForm();
          this.returnDialog = false;
          this.loadTable();
        }

        return response;
      } catch (error) {
        console.error("Error submitting reject form:", error);
      } finally {
        this.isSubmitting = false; // Re-enable buttons
      }

    },


    async submitApprovalReturnForm() {
  
        // Construct data to send to the backend
        const payload = {
          prescription_id: this.returnDrugId,
          dispensed_quantity: this.dispensedNotAdministered,
          return_quantity: this.toReturn,
          status:this.status
        };
        const response = await this.prescription.updateRturnPrescription(payload);
      if (response) {
          // Close dialog and reset form
          this.resetForm();
        this.returnDialog = false;
      }

     
    },


    // Method to reset form fields
    resetForm() {
      this.returnDrugId = null;
      this.dispensedNotAdministered = null;
      this.toReturn = null;
    },
  
    validateStopReason() {
    // Mark the field as interacted when the user types
    this.hasInteracted = true;
  },
    openAdministerDrugsModal() {
      this.administerDrugsModal = true;
    },
    editPrescriptionData(prescription) {
      this.prescriptionData = prescription;
      this.prescriptionEditDialog = true;
    },
    async updateDate(updatedDate) {
      const data = {
        edit_system_timestamp: true,
        adjusted_date: updatedDate,
        date_adjusted_from: this.prescriptionData.non_formatted_created_at,
      };
      const response = await this.prescription.update(this.prescriptionData.id, data);
      if (response) {
        this.prescriptionEditDialog = false;
        this.loadTable();
      }
    },
    navigate(url) {
      if (url) {
        const page = url.substring(url.indexOf('page=')).split('page=')[1];
        this.setPrescriptions({
          page,
          params: {
            visit_id: this.theVisitId,
            paginate_results: true,
          },
        });
      }
    },
    updateDialog(prescriptionId) {
      this.stopDrugId = prescriptionId;
      this.stopDialog = true;
    },

   async openReturnDialog(prescription){

      //do a  fetch to check status of the prescribed form
      this.loadingId = prescription.id; // Set the loading state for the clicked button
      console.log(this.loadingId)
      try {
        // Fetch the return status
        const response = await this.prescription.fetchReturnStatus(prescription.id);
      

        this.toReturn = null; // Reset return quantity
        // Update return_status based on the response
        if (response.status === "pending") {
          this.return_status = "pending";
          this.toReturn = response.return_quantity;

        } else if (response.status === null) {
          this.return_status = null;
        } else if (response.status === "approved") {
          this.return_status = "approved";
        } else if (response.status === "accept") {
          this.return_status = "accepted";

        } else if (response.status === "rejected") {
          this.return_status = "rejected";

        }

        // Update dialog data
        this.returnDrugId = prescription.id;
        this.dispensedNotAdministered = (prescription.d ?? 0) - (prescription.a ?? 0);
        this.returnDialog = true;
      } catch (error) {
        console.error("Error fetching return status:", error);
      } finally {
        this.loadingId = null; // Reset the loading state
      }
    },
    cancelPrescription(prescriptionId) {
      this.saveLoader = true;
      this.prescription.cancelled = true;
      this.prescription.update(prescriptionId);
    }, 
    stopDrug() {
        if (this.isValid) {
          this.saveLoader = true;
          this.prescription.update(this.stopDrugId);
          setTimeout(() => {
            this.saveLoader = false;
            this.stopDialog = false;
            this.prescription.stop_reason = '';
            this.hasInteracted = false; // Reset interaction flag

          }, 1000);
        }
    },
    loadTable() {
      this.setPrescriptions({
        params: {
          visit_id: this.theVisitId,
          paginate_results: true,
        },
      });
    },
    async loadOwnPrescriptions() {
    try {
        const response = await this.prescription.fetchOwnPrescriptions(this.theVisitId);
        if (response && response.prescriptions) {
            this.own_prescriptions = response.prescriptions;
        } 
    } catch (error) {
        console.error("Error loading own prescriptions:", error);
    }
},
async loadCancelledPrescriptions() {
    try {
        const cancelled_response = await this.prescription.fetchCancelledPrescriptions(this.theVisitId);
        if (cancelled_response && cancelled_response.prescriptions) {
            this.cancelled_prescriptions = cancelled_response.prescriptions;
        }
    } catch (error) {
        console.error("Error loading cancelled prescriptions:", error);
    }

  }

},

  created() {
    window.events.$on('reload-prescriptions-table', (message) => {
      this.loadTable();
    });
  },
  mounted() {
    this.loadTable();
    this.loadOwnPrescriptions();
    this.loadCancelledPrescriptions();
    this.visitObj.find(this.theVisitId);
  },
};
</script>

<style scoped>
</style>


