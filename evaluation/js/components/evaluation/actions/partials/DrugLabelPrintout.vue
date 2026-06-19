<style scoped>


.custom-table {
  width: 100%;
  border-collapse: collapse;
}

.custom-table .table-cell {
  vertical-align: top;
}
/* Ensure the print-only section is hidden on screen */
#print-only-section {
  display: none;
}

/* Ensure the print-only section is visible during print */
@media print {

  #print-only-section {
    margin-top:-37px !important;
    width: 89mm;
    height: 27mm;
    display: block !important;
    page-break-before: always; /* Add page break before print-only section */
    font-size:6px !important;
  }

  .text-caption{
    font-size:8px !important;
  }
  .text-caption-prescribed-by{
    font-size:5px !important;
  }
  /* Optionally hide other sections during print */
  body * {
    visibility: hidden;
  }

  #print-only-section,
  #print-only-section * {
    visibility: visible;
  }
  #print-only-section {
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>


<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" width="1000" persistent >
      <v-card>
        <v-card-title class="subheading">
          Drug Label Printout
          <v-spacer></v-spacer>
          <v-btn text icon color="red" small @click="close()">
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider class="ma-0 pa-0"></v-divider>
        <v-card-text id="drug-details">
          <v-row>
            <v-col cols="4" style="margin-top:1px">
              <p class="text-caption"><strong>{{ uppercasePatientName }}</strong></p>
                  <p class="text-caption">
                    <strong>{{ is_pos ? pos_drug_name : drugData.name }}</strong>
                  </p>   
              <p class="text-caption">
                <strong>{{ drug?.dosage_expression ?? drugData?.dosage_expression ?? '' }}</strong>
              </p>
              
              <b>Dispensed quantity: {{ drug?.d ?? dispensing_quantity ?? "" }}</b>
            </v-col>
            <v-col cols="2" style="margin-top:5px"></v-col>
            <v-col cols="6" style="margin-top:5px">
              <p class="text-caption"><b>{{ organizationName }}</b></p>
              <p class="text-caption"><b>{{ facilityName }}</b></p>
              <p class="text-caption"><b>{{ organizationDetails.postal_address }}</b></p>
              <p class="text-caption"><b>Tel: {{ organizationDetails.telephone }}</b></p>
              <p class="text-caption"><b>Date: {{ drugData.prescription_date ?? "" }}</b></p>

            </v-col>
          </v-row>
          <v-row>
            <v-col cols="5">

            </v-col>
            <v-col cols="2"></v-col>
            <v-col cols="5"></v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <ckeditor ref="ckeditor"  :editor="editor" v-model="drugData.description"></ckeditor>
              &nbsp;<br>
              <v-chip color="blue" text-color="white" @click="saveDrugInstructionTemplate(drugData)">Save</v-chip>
            </v-col>
            <v-col cols="1"></v-col>
            <v-col cols="5">
        
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="7">
              <p class="text-caption"><b>{{ uppercasePrescribedBy }}</b></p>
              <p class="text-caption"><b>{{ uppercaseDispensedBy }}</b></p>
            </v-col>
            <v-col cols="2"></v-col>
            <v-col cols="3"></v-col>
          </v-row>
          <v-row>
            <v-col cols="7">
              <v-chip color="blue" text-color="white" @click="printDrugDetails()">Print</v-chip>

            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Print-Only Section -->
    <v-card-text id="print-only-section" style="display: none;">
      <v-simple-table class="custom-table">
        <template v-slot:default>
          <tbody>
          <tr>
            <!-- First Column -->
            <td class="table-cell">
              <p class="text-caption"><strong>{{ uppercasePatientName }}</strong></p>
              <p class="text-caption"><strong>{{ is_pos ? pos_drug_name : drugData.name }}</strong></p>
              <p class="text-caption"> <strong>{{ drug?.dosage_expression ?? drugData?.dosage_expression ?? '' }}</strong></p>
              <b><div v-html="drugData.description"  class="text-caption"></div></b>
              <p class="text-caption"> <b>Dispensed quantity: {{ drug?.d ?? dispensing_quantity ?? "" }}</b></p>

              <p class="text-caption-prescribed-by"><b>{{ uppercasePrescribedBy }}</b></p>
              <p class="text-caption-prescribed-by"><b>{{ uppercaseDispensedBy }}</b></p>
            </td>

            <!-- Second Column -->
            <td class="table-cell">
              <p class="text-caption"><b>{{ organizationName }}</b></p>
              <p class="text-caption"><b>{{ facilityName }}</b></p>
              <p class="text-caption"><b>P.O Box: {{ organizationDetails.postal_address }}</b></p>
              <p class="text-caption"><b>Tel: {{ organizationDetails.telephone }}</b></p>
              <p class="text-caption"><b>Date: {{ drugData?.prescription_date }}</b></p>
            </td>
          </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
    <!-- Print-Only Section -->

  </v-row>
</template>


<script>
import Visit from '@reception/libs/visits/Visit';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default {
  name: 'drug-label-printout',

  props: {
    selectedVisit: {
      required: true,
    },
    drug: {
      required: true,
      default: () => ({
        d: null 
      })
    },
    is_pos: {
        type: Boolean,
        default: false
    },
    pos_drug_name: {
        type: String,
        default: ''
    },
    dispensing_quantity: {
    type: Number,
    default: 0, // or another suitable default value
  },
      show: {
      required: true,
      type: Boolean,
    },
  },

  data() {
    return {
      dialog: false,
      editor: ClassicEditor,
      visitObj: new Visit(),
      drugData: {
        dispensing_quantity:null
      },
    
      organizationDetails: {},
      dispensing_pharmacist: '',
      patient_name: '',
    };
  },

  computed: {
    uppercasePatientName() {
      return this.patient_name ?
          this.patient_name.toUpperCase() :
          '';
    },
    uppercasePrescribedBy() {
      return this.drug && this.drug.prescribed_by ?
          'PRESCRIBED BY: ' + this.drug.prescribed_by.toUpperCase() :
          'PRESCRIBED BY:';
    },
    uppercaseDispensedBy() {
      return this.drug && this.dispensing_pharmacist ?
          'DISPENSED BY: ' + this.dispensing_pharmacist.toUpperCase() :
          'DISPENSED BY: ';
    },

    organizationName() {
      return this.organizationDetails && this.organizationDetails.name ?
          this.organizationDetails.name:
          '';
    },
    facilityName() {
      return this.selectedVisit && this.selectedVisit.facility_name ?
          this.selectedVisit.facility_name :
          '';
    },
    facilityPhone() {
      if (this.selectedVisit && this.selectedVisit.telephone) {
        return `${this.selectedVisit.telephone}`;
      } else if (this.selectedVisit && this.selectedVisit.mobile) {
        return `${this.selectedVisit.selectedVisit.mobile}`;
      } else if (this.selectedVisit && this.selectedVisit.office) {
        return `${this.selectedVisit.selectedVisit.office}`;
      } else {
        return '';
      }
    },
    facilityAddress() {
      if (this.selectedVisit && this.selectedVisit.clinic && this.selectedVisit.clinic.location ) {
        return `${this.selectedVisit.clinic.location.toUpperCase()}`;
      } else {
        return '';
      }
    },
    facilityPoBox() {
      return this.selectedVisit && this.selectedVisit.clinic && this.selectedVisit.clinic.address ?
          this.selectedVisit.clinic.address.toUpperCase() :
          '';
    },
  },

  watch: {
    show(val) {
      if (val) {
        this.dialog = true;
        this.fetchDrugDetails();
      }
    },
  },

  methods: {
    close() {
      this.dialog = false;
      this.$emit('close');
    },
    async fetchDrugDetails() {
      try {

        const prescription = this.drug;
        const response = await this.visitObj.fetchDrugDetails(prescription);
        this.drugData = {
          ...response.data.drugs,
          // description: response.data.drugs.instructions || '',
          prescription_date:response.data.prescription.created_at||'',
          description:response.data.prescription.description||'',
        };
        this.organizationDetails = response.data.organization;
        this.dispensing_pharmacist = response.data.dispensing_pharmacist;
        this.patient_name = response.data.patient_name;
      } catch (error) {

        console.error(error);

      }
    },

    printDrugDetails() {
      const printOnlySection = document.getElementById('print-only-section');
      const originalDisplay = printOnlySection.style.display;

      // Save the original contents of the document body
      const originalContents = document.body.innerHTML;

      // Show the print-only section
      printOnlySection.style.display = 'block';

      // Create a temporary container and set its contents to the print-only section
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = printOnlySection.outerHTML;

      // Replace the document body's contents with the temporary container's contents
      document.body.innerHTML = tempContainer.innerHTML;

      // Print the contents
      window.print();

      location.reload();
      // Revert the document body's contents to the original contents
      document.body.innerHTML = originalContents;

      // Hide the print-only section again
      printOnlySection.style.display = originalDisplay;
    },

    saveDrugInstructionTemplate(item) {
      this.visitObj.updatePrescriptionInstruction(item);
    },
  },

  async mounted() {
    this.dialog = this.show;
    if (this.dialog ) {
      this.fetchDrugDetails();
    }


  },
};

</script>
