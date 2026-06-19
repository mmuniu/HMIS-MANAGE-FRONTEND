<template>
    <!--<collabmed-loading v-if="!initialised"></collabmed-loading>-->
  
    <div v-if="initialised">
      <!-- Stop drug use -->
      <v-dialog
          v-model="stopDialog"
          width="400"
      >
      
        <v-card>
          <v-card-title
              class="subheading"
              primary-title
          >
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
                <v-textarea outline rows="8"
                            v-model="prescription.stop_reason"></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>
  
          <v-divider class="my-0"></v-divider>
  
          <v-card-actions>
            <v-btn
                color="pink"
                @click="stopDrug()"
                block large class="my-2"
                :dark="!saveLoader" :loading="saveLoader" :disabled="saveLoader"
            >
              Stop drug
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- End of stop drug -->
  
  
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
      <!--      beginning of administer drugs modal-->
  
  
      <administer-drugs-modal
          v-if="administerDrugsModal"
          :visit-id="theVisitId"
          :prescriptions="administered_prescriptions"
          @close="administerDrugsModal = false"
      ></administer-drugs-modal>
      <!--      end of drugs modal-->
  
    </div>
  </template>
  
  <script>
  import { mapActions, mapGetters } from 'vuex';
  import Prescription from '@evaluation/libs/notes/Prescription';
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
    data() {
      return {
        prescriptions: null,
        administered_prescriptions: null,
        prescriptionData: null,
        prescriptionEditDialog: false,
        stopDrugId: null,
        stopDialog: false,
        saveLoader: false,
        prescription: new Prescription(),
        selectedPrescriptions: [],
        page: 1,
        administerDrugsModal: false,
      };
    },
    watch: {
      getPrescriptions(value) {
        this.prescriptions = value.prescriptions;
        this.administered_prescriptions= value.administered_prescriptions
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
    },
    methods: {
      ...mapActions([
        'setPrescriptions',
      ]),
      print(visitId, paper,administered=null) {
        this.prescription.print(visitId, paper, this.selectedPrescriptions,administered);
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
      cancelPrescription(prescriptionId) {
        this.saveLoader = true;
        this.prescription.cancelled = true;
        this.prescription.update(prescriptionId);
      },
      stopDrug() {
        this.saveLoader = true;
        this.prescription.update(this.stopDrugId);
      },
      loadTable() {
        this.setPrescriptions({
          params: {
            visit_id: this.theVisitId,
            paginate_results: true,
          },
        });
      },
    },
    created() {
      window.events.$on('reload-prescriptions-table', (message) => {
        this.loadTable();
      });
    },
    mounted() {
      this.loadTable();
    },
  };
  </script>
  
  <style scoped>
  </style>
  
  