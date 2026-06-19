<template>
  <div>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card class="mb-4" flat  v-else>

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
    @submit.prevent="submitAcceptForm"
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
          <p>To return</p>
          <v-text-field
            v-model.number="toReturn"
            type="number"
            outlined
            label="Return Quantity"
            required
            min="0"
            :rules="[value => value <= dispensedNotAdministered || 'Cannot return more than dispensed']"
            @change="onToReturnInput"

          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider class="my-0"></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <!-- Actions for 'pending' status -->
      <v-btn color="blue" :loading="isSubmitting" :disabled="isSubmitting || dispensedNotAdministered === 0 || !toReturn || toReturn > dispensedNotAdministered"  type="submit">Accept</v-btn>
      <v-btn color="red" :loading="isSubmitting" :disabled="isSubmitting || dispensedNotAdministered === 0 || !toReturn || toReturn > dispensedNotAdministered"   @click="rejectReturn">Reject</v-btn>
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
          @change="onToReturnInput"
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
      <v-row >
        <v-col cols="12">
          <!--dispensed drugs are prescriptions with 'dispensed' for this visit-->
          <v-data-table
              v-if="list"
              :headers="headers"
              :items="list"
              class="elevation-1"
          >
            <template v-slot:item.pharmacy_price="{ item }">
              {{ item.pharmacy_price | numberFormat }}
            </template>
            <template v-slot:item.pharmacy_total="{ item }">
              {{ item.pharmacy_total | numberFormat }}
            </template>
            <template v-slot:item.meta="{ item }">
              <td>
                <v-chip color="black" text-color="white" @click="printLabel(item)">Print Label</v-chip>
                <v-chip small color="info" text-color="white" v-if="item.for_admission">For Admission</v-chip>
                <v-chip small color="success" text-color="white" v-if="item.for_discharge">For Discharge</v-chip>
                <v-chip small color="brown" text-color="white" v-if="item.treatment_location_name === 'outpatient'">Outpatient</v-chip>
                <v-chip small color="indigo" text-color="white" v-if="item.treatment_location_name === 'inpatient'">Inpatient</v-chip>
                <v-chip small color="orange" text-color="white" v-if="item.treatment_location_name === 'theatre'">Theatre</v-chip>
              </td>
            </template>
            <template v-slot:item.actions="{ item }">
              
  

              <span >
                      <v-chip v-if="item.stopped" small color="grey" text-color="white">Drug stopped</v-chip>
                  </span>

              <v-chip v-if="item.cancelled" small color="yellow" text-color="white">Cancelled</v-chip>

  
                <v-btn dark small 
                :color="item.return_status === 'pending' ? 'purple' : 'green'"
                  :loading="loadingId === item.id"
                  :disabled="loadingId === item.id"
                  @click="openReturnDialog(item)">
                  {{ item.return_status === 'pending' ? 'Pending' : 'Return' }}
                </v-btn>
            </template>
          </v-data-table>

          <v-alert v-else :value="true" type="info">
            No data found
          </v-alert>

        </v-col>
      </v-row>
    </v-card>
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
import Dispensing from '@evaluation/libs/prescriptions/Dispensing';
import Visit from '@reception/libs/visits/Visit';
import DrugLabelPrintout from '@evaluation/components/evaluation/actions/partials/DrugLabelPrintout';
import Prescription from '@evaluation/libs/notes/Prescription';


export default {
  components: {
    'drug-label-printout': DrugLabelPrintout,
  },
  data() {
    return {
      dialogPrintLabel: false,
      drug: [],
      visit_object: [],
      patient_id: null,
      headers: [
        { text: 'Date', value: 'created_at' },
        { text: 'Drug', value: 'drug_name' },
        { text: 'Dosage', value: 'dosage' },
        { text: 'Price', value: 'pharmacy_price' },
        // {text: 'Discount', value: 'dosage'},
        { text: 'P', value: 'p' },
        { text: 'D', value: 'd' },
        { text: 'A', value: 'a' },
        { text: 'Amount', value: 'pharmacy_total' },
        { text: 'Meta', value: 'meta' },
        {text:'Actions',value:'actions'}
      ],
      administerDrugsModal: false,
      dispensedNotAdministered: null,
      toReturn: null,
      return_status:null,
      returnQuantity:null,
      isSubmitting: false, // Loading state for buttons
      output_return_quantity:null,
      dispensing: new Dispensing(),
      prescription: new Prescription(),
      returnDialog:false,
      returnDrugId:null,
      loadingId: null, // Loading state for buttons

    };
  },

  computed: {
    list() {
      return this.dispensing.dispensedPrescriptions;
    },

    initialised() {
      return this.list;
    },
  },

  methods: {
    setData() {
      return this.dispensing.dispensed(this.$route.params.visitId);
    },
    fetchList() {
      return this.dispensing.dispensedPrescriptions;
    },
    printLabel(item) {
      this.dialogPrintLabel = true;
      this.drug= item;
      this.visit_object= this.visitObj.selectedVisit;
    },


    onToReturnInput() {
      // Ensure `toReturn` doesn't exceed `dispensedNotAdministered`
      if (this.toReturn > this.dispensedNotAdministered) {
        this.toReturn = this.dispensedNotAdministered;
      }
    },
    async openReturnDialog(prescription){

            //do a  fetch to check status of the prescribed form
            this.loadingId = prescription.id; // Set the loading state for the clicked button
            
            try {
              // Fetch the return status
              const response = await this.prescription.fetchReturnStatus(prescription.id);


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
                // this.toReturn = response.return_quantity;

              } else if (response.status === "rejected") {
                this.return_status = "rejected";
                // this.toReturn = response.return_quantity;

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
this.setData();
},
  },

  mounted() {
    this.setData();
  },
};
</script>

<style type="scss">

</style>
