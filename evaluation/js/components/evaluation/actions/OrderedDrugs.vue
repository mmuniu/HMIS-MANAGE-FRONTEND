<template>
  <div>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else class="short mb-4" flat>
      <v-row >
        <v-col cols="12" v-if="flattenedPrescriptions && flattenedPrescriptions.length <= 0">
          <div class="jumbotron text-center mx-3">
            <p>Sorry this patient does not have any prescriptions.</p>
          </div>
        </v-col>

        <v-col cols="12" v-else>
          <div class="mx-3">
            <form>
              <v-data-table :headers="pharmacyHeaders"
                            :items="flattenedPrescriptions"
                            show-select
                            class="mb-3"
                            flat
                            v-model="selectedPrescriptions">
                <template v-slot:item.drug="{ item }">
                  <div v-if="item.can_dispense">
                    {{ item.pharmacy_drug }}
                    <p>Dose: {{ item.pharmacy_prescription }}</p>
                  </div>
                  <div v-else>
                    {{ item.pharmacy_drug }}
                  </div>
                  <span class="grey--text text-caption">Store: {{ item.store }}</span> <br/>
                  <span class="grey--text text-caption">Available quantity: {{ item.available_quantity }}</span> <br/>

                </template>
           
                <template v-slot:item.prescription="{ item }">
                  <div v-if="item.can_dispense">
                  {{ item.pharmacy_drug }}
                  <p>Dose: {{ item.pharmacy_prescription }}</p>
                </div>
                <div v-else>
                  {{ item.pharmacy_drug }}
                </div>
                <span class="grey--text text-caption">Store: {{ item.store }}</span> <br/>
                <span class="grey--text text-caption">Available quantity: {{ item.available_quantity }}</span> <br/>
                  <div v-if="item.can_dispense" class="pt-3">
                    <p>Date: {{ item.created_at }}</p>
                    <p>Prescribed by: {{ item.prescribed_by }}</p>
                    <p>Notes: {{ item.notes }}</p>
                  </div>
                  <div v-else>
                    <p>{{ item.pharmacy_prescription }}</p>
                  </div>
                </template>

                <template v-slot:item.dispensing="{ item }">
                  <input class="text-center"
                         style="border-radius: 4px; padding: 12px 20px;border: 1px solid #ccc;"
                         :disabled="item.treatment_location_name !== 'inpatient'"
                         v-model="item.dispensing_quantity"
                         value="item.dispensing_quantity">
                </template>

                <template v-slot:item.total="{ item }">
                  <span v-if="item.pharmacy_total">{{ item.pharmacy_total }}</span>
                  <v-chip v-else color="red" text-color="white">Not paid</v-chip>
                </template>

                <template v-slot:item.meta="{ item }">
                  <v-chip color="info" text-color="white" v-if="item.for_admission">For Admission</v-chip>
                  <v-chip color="success" text-color="white" v-if="item.for_discharge">For Discharge</v-chip>
                      <v-chip small color="brown" text-color="white" v-if="item.treatment_location_name === 'outpatient'">Outpatient</v-chip>
                  <v-chip color="indigo" text-color="white" v-if="item.treatment_location_name === 'inpatient'">Inpatient</v-chip>
                  <v-chip color="orange" text-color="white" v-if="item.treatment_location_name === 'theatre'">Theatre</v-chip>
                </template>


                <template slot="footer">
                  <v-row>
                    <v-col cols="12">
                      <v-btn :disabled="!canDispenseDrug()"
                             @click="dispenseDrugs()"
                             class="success"
                             :dark="canDispenseDrug()"
                             small
                      >Dispense</v-btn>
                      <v-btn class="info" dark small :href="`/evaluation/print/prescription/${visitId}`" target="_blank" disabled>Print</v-btn>
                      <v-btn class="pink" dark small :href="`/evaluation/print/prescription/${visitId}/true`" target="_blank" disabled>Print Thermal</v-btn>
                    </v-col>
                  </v-row>
                </template>
              </v-data-table>
            </form>
          </div>

          <div v-if="getPrescriptions.links" class="text-center">
            <v-pagination
                v-model="page"
                :length="getPrescriptions.meta.last_page"
                circle
                :total-visible="8"
            ></v-pagination>
          </div>
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
import { mapActions, mapGetters } from 'vuex';
import Dispensing from '@evaluation/libs/prescriptions/Dispensing';
import Visit from '@reception/libs/visits/Visit';
import DrugLabelPrintout from '@evaluation/components/evaluation/actions/partials/DrugLabelPrintout';

import { _ } from 'vue-underscore';

export default {
  components: {
    'drug-label-printout': DrugLabelPrintout,
  },
  data() {
    return {
      selected: true,
      selectedPrescriptions: [],
      dispensing: new Dispensing,
      visitObj: new Visit(),
      loading: false,
      dialogPrintLabel: false,
      drug:[],
      
      visit_object:[],
      patient_id: null,
      isPharamcyDrugsDisabled: false ,

      pharmacyHeaders: [
        { text: 'Drug', value: 'drug' },
        { text: 'Prescription', value: 'prescription' },
        // { text: 'Already dispensed', value: 'already_dispensed' },
        { text: 'P', value: 'p' },
        { text: 'D', value: 'd' },
        { text: 'A', value: 'a' },
        { text: 'Dispensing', value: 'dispensing' },
        { text: 'Price', value: 'pharmacy_price' },
        { text: 'Quantity', value: 'pharmacy_quantity' },
        { text: 'Total', value: 'total' },
        { text: 'Meta', value: 'meta' },
      ],
    };
  },

  computed: {
    ...mapGetters([
      'getPrescriptions',
    ]),
    flattenedPrescriptions() {
      return this.prescriptions.flat();
    },
    initialised() {
      return this.prescriptions;
    },

    prescriptions() {
      const data = [];

      _.map(this.getPrescriptions.prescriptions, function(pres) {
        if (!pres.stopped) {
          data.push(pres);
        }
      });

      return data;
    },

    visitId() {
      return this.$route.params.visitId;
    },

    visit() {
      return this.visitObj.selectedVisit;
    },
  },

  watch: {
    visit(val) {
      this.patient_id = val.patient_id;
    },
  },

  methods: {
    ...mapActions([
      'setPrescriptions',
    ]),

    filterSelectedPrescriptions() {
      return this.selectedPrescriptions.map(function(prescription) {
        return {
          prescription_id: prescription.id,
          drug_id: prescription.drug_id,
          can_dispense: Boolean(prescription.can_dispense),
          price: prescription.pharmacy_price,
          quantity: prescription.pharmacy_quantity,
          dispensed_quantity: prescription.dispensing_quantity,
        };
      });
    },

    printLabel(item) {
      this.dialogPrintLabel = true;
      this.drug= item;
      this.visit_object= this.visitObj.selectedVisit;
    },
    canDispenseDrug(item) {
      return !(this.selectedPrescriptions.length <= 0 || this.loading);
    },

    dispenseDrugs() {
      if (! this.patient_id) {
        flash({ alert: 'info', message: 'Please wait for the page to finish loading or refresh the page' });
        return;
      }

      this.loading = true;

      const formData = {
        data: this.filterSelectedPrescriptions(),
        visit: this.visitId,
        patient: this.patient_id,
      };

      this.dispensing.save(formData); // reload page on success
      this.loading = false;
    },
  },

  mounted() {
    this.setPrescriptions({
      params: {
        visit_id: this.visitId,
        dispensing: 1,
        status: 0,
      },
    });

    this.visitObj.find(this.$route.params.visitId);
  },
};
</script>

<style type="scss">

</style>
