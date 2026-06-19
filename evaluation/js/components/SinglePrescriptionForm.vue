<template>
  <div>
    <!-- Render existing sections -->

      <!-- Your section content goes here -->
      <v-row>


        <!-- First section -->
        <v-row>
          <v-col cols="5">
            <v-autocomplete
              v-model="prescription.department_id"
              label="Choose department"
              outline
              :items="departments"
              item-value="id"
              item-text="name"
            ></v-autocomplete>
          </v-col>

          <v-col cols="7" class="small-font">
            <v-combobox
              v-if="msetting('evaluation.allow_doctors_to_type_prescriptions')"
              outline
              :label="`Search for drug ${placeholder}`"
              class="mb-4"
              :items="product.search.results"
              item-text="text"
              persistent-hint
              v-model="prescription.product"
              @change="selectedDrug()"
              chips
              :loading="product.search.loading"
              :search-input.sync="product.search.term"
              return-object
              :disabled="!prescription.department_id"
              :error="errors.has('drug')"
              :hint="errors.get('drug')"
            >
              <template v-slot:selection="data">
                <v-chip color="gray" :key="JSON.stringify(data.item)">
                  <span v-if="data.item.text">
                    {{ data.item.text }}
                  </span>
                  <span v-else>{{ data.item }}</span>
                </v-chip>
              </template>
              <template slot="item" slot-scope="{ item }">
                <v-list-item-content>
                  <v-list-item-title class="caption">
                    {{ item.text }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <span v-if="item.stock_take_status" class="caption red--text">
                      {{  item.stock_take_status }}
                    </span>
                    <span v-else-if="item.closed" class="caption red--text">  Store closed  </span>

                    <span v-else>
                      <span class="caption blue--text font-weight-bold"
                            v-if="item.exclusion_price && !item.product_excluded">
                        Exclusion Price: {{ item.exclusion_price }}
                        <br/>
                      </span>
                      <span class="caption warning--text font-weight-bold"
                            v-if="item.product_excluded">
                        Product not covered by patient scheme
                        <br/>
                      </span>
                      <span class="mx-1 caption">Cash price: {{ item.selling_price}}</span>
                      <span class="caption">:  Insurance Price: {{ item.insurance_price }} </span>
                    </span>

                  </v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-combobox>

            <v-autocomplete
              v-else
              outline
              :label="`Search for drug ${placeholder}`"
              class="mb-4"
              :items="product.search.results"
              item-text="text"
              v-model="prescription.product"
              @change="selectedDrug()"
              :loading="product.search.loading"
              :search-input.sync="product.search.term"
              return-object
              :disabled="!prescription.department_id"
              :error="errors.has('drug')"
              :hint="errors.get('drug')"
              persistent-hint
            >
              <template slot="item" slot-scope="{ item }">
                <v-list-item-content>
                  <v-list-item-title class="caption">
                    {{ item.text }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <span v-if="item.stock_take_status" class="caption red--text">
                      {{  item.stock_take_status }}
                    </span>
                    <span v-else-if="item.closed" class="caption red--text">  Store closed  </span>

                    <span v-else>
                      <span class="caption blue--text font-weight-bold"
                            v-if="item.exclusion_price && !item.product_excluded">
                        Exclusion Price: {{ item.exclusion_price }}
                        <br/>
                      </span>
                      <span class="caption warning--text font-weight-bold"
                            v-if="item.product_excluded">
                        Product not covered by patient scheme
                        <br/>
                      </span>
                      <span class="mx-1 caption">Cash price: {{ item.selling_price}}</span>
                      <span class="caption">:  Insurance Price: {{ item.insurance_price }} </span>
                    </span>

                  </v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-autocomplete>
          </v-col>
        </v-row>

      </v-row>


         <!-- Dosage assignment select -->
    <v-row>
      <v-col cols="3">
        <v-text-field type="number" label="Dosage take" v-model="prescription.take"
                      :error="errors.has('take')"
                      :hint="errors.get('take')" persistent-hint
                      @keyup="errors.clear('take')"
        ></v-text-field>
      </v-col>

      <v-col cols="5">
        <v-select v-model="prescription.whereto" label="Route"
                  :items="configurations.prescription_whereto" item-text="item_name" item-value="id"
                  :error="errors.has('whereto')" :hint="errors.get('whereto')"
                  persistent-hint @change="errors.clear('whereto')"
        ></v-select>
      </v-col>

      <v-col cols="4">
        <v-select v-model="methodObject" label="Frequency" outline
                  :items="configurations.prescription_method" item-text="item_name" return-object
                  :error="errors.has('method')" :hint="errors.get('method')"
                  persistent-hint @change="errors.clear('method')"
        ></v-select>
      </v-col>
    </v-row>

      <!-- Duration and quantity fields -->
      <v-row>
        <v-col cols="3">
          <v-text-field label="Duration" outline v-model="prescription.duration"
                        :error="errors.has('duration')" :hint="errors.get('duration')"
                        persistent-hint @keyup="errors.clear('duration')"
          ></v-text-field>
        </v-col>

        <v-col cols="5">
          <v-select v-model="measureObject" label="Measure"
                    :items="configurations.prescription_duration" item-text="item_name" return-object
                    :error="errors.has('time_measure')" :hint="errors.get('time_measure')"
                    persistent-hint @change="errors.clear('time_measure')"
          ></v-select>
        </v-col>

        <v-col cols="4">
          <v-text-field label="Quantity" v-model="prescription.quantity"></v-text-field>
        </v-col>
      </v-row>

      <!-- Divider -->
      <v-divider class="mb-1 mt-0"></v-divider>

      <!-- Switches -->
          <v-row  >
          <v-col cols="12" v-if="checkForDiscountedDrugsAbility">
              <v-switch label="Check here if it is a discounted drug (Part of a procedure)"
                        v-model="prescription.drug_part_of_procedure"></v-switch>
          </v-col>

          <v-col cols="12">
              <v-switch label="Drug substitution is allowed"
                        v-model="prescription.allow_substitution"></v-switch>
          </v-col>

          <v-col cols="12" v-if="showForAdmission">
              <v-switch label="Drug is for Admission" v-model="prescription.for_admission"></v-switch>
          </v-col>

          <v-col cols="12" v-if="showForDischarge">
              <v-switch label="Drug is for Discharge" v-model="prescription.for_discharge"></v-switch>
          </v-col>
        </v-row>


        <!-- <v-btn @click="removeSection(index)">Remove Section</v-btn> -->




  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import SettingsOptions from '@settings/libs/SettingsOptions';
import Prescription from '@evaluation/libs/notes/Prescription';
import StoreProduct from '@inventory/libs/products/StoreProduct';
import TreatmentLocation from '@evaluation/libs/treatment/TreatmentLocation';

import { dosageMixin } from '@evaluation/mixins/DosageMixin';
import { evaluationMixin } from '@evaluation/mixins/EvaluationMixin';
import _ from 'lodash';
import SinglePrescriptionForm from './SinglePrescriptionForm.vue';

export default {
    props: {
        visitId: {
            default: null,
            type: Number,
        },

        isOfType: String,

        showForAdmission: {
            default: false,
            type: Boolean,
        },


        MainPrescription: Object, // Define prescription prop

        showForDischarge: {
            default: false,
            type: Boolean,
        },

        checkedAllowSubsitution: {
            default: false,
            type: Boolean,
        },

        checkedForAdmission: {
            default: false,
            type: Boolean,
        },

        checkedForDischarge: {
            default: false,
            type: Boolean,
        },
    },

    mixins: [
        evaluationMixin, dosageMixin,
    ],

    data() {
        return {
            treatmentLocationObj: new TreatmentLocation(),
            prescription: new Prescription(),
            product: new StoreProduct(),
            prescriptions: null,
            saveLoader: false,
            options: new SettingsOptions(),
            placeholder: '',
            sections: [], // Array to store sections
                  // Merge prescription prop with local prescription data
            prescription: {
              department_id: null,
              product: null,
              take: null,
              whereto: null,
              method: null,
              duration: null,
              measure: null,
              quantity: null,
              drug_part_of_procedure: false,
              allow_substitution: false,
              for_admission: false,
              for_discharge: false
            },
            prescriptionData: {} // Initialize prescription data object
        };
    },

    computed: {
        ...mapGetters([
            'getStoreDepartments', 'setPrescriptions', 'getSessions',
        ]),

        term() {
            return this.product.search.term;
        },

        initialised() {
            return this.getStoreDepartments && this.treatmentLocationObj.type && this.configurations;
        },

        /**
         *
         * @returns {Array}
         */
        departments() {
            if (this.getStoreDepartments) {
                return _.map(this.getStoreDepartments.data, (item) => {
                    return {
                        id: item.id,
                        name: this.$options.filters.ucwords(item.name),
                    };
                });
            } else {
                return [];
            }
        },

        /**
         *
         * @returns {boolean}
         */
        checkForDiscountedDrugsAbility() {
            if (this.$route.params.destination === 'dental') {
                return true;
            } else {
                return false;
            }
        },

        dispenseFromAStore() {
            if (this.msetting('evaluation.doctor_dispense_from_one_store') == '1') {
                return false;
            } else {
                return true;
            };
        },

        treatmentLocation() {
            return this.treatmentLocationObj.type;
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

        configurations() {
            return this.options.configurations;
        },

        selectedProduct() {
            return this.prescription.product;
        },

        outpatient() {
            return this.$route.path.substring(1, 11) == 'evaluation' ? 1 : 0;
        },
    },

    watch: {
        item(value) {
            if (value) {
                this.product.search.results = [];
                this.product.search.term = false;
            }
        },

        term(value) {
            if (value) {
                if (value.length > 2) {
                    this.placeholder = '';
                    this.product.index(this.prescription.department_id, this.prescription.scheme_id, this.outpatient);
                } else {
                    this.placeholder = '(Enter ' + (3 - value.length) + ' more characters)';
                    this.product.search.reset();
                }
            }
        },

            prescriptionData: {
          handler(newValue) {
            if (Object.keys(newValue).length) {
              this.$emit('prescriptionAdded', newValue);
            }
          },
          deep: true
        },

        visit(value) {
            if (value) {
                this.prescription.visit = value.id;
                this.prescriptions = value.prescriptions;

                if (value.patient_scheme && value.patient_scheme.scheme) {
                    this.prescription.scheme_id = value.patient_scheme.scheme.id;
                }
            }
        },

        treatmentLocation(value) {
            this.prescription.treatment_location_id = value.id;
        },

        contaminated(value) {
            if (value) {
                this.saveLoader = false;
                this.prescription.form.errorDetected = false;
            }
        },

        submitted() {
            this.prescription.form.submitted = false;
            this.saveLoader = false;
            this.loadCurrentVisit();
            this.reset();

            // check for scheme capitation status
            window.events.$emit('check-capitation', 'From Prescribe.vue');
            window.events.$emit('reload-prescriptions-table', 'From Prescribe.vue');
        },

        departments(value) {
            if (value) {
                const pharmacyDept = _.find(value, (item) => {
                    return item.name.toLowerCase() === 'pharmacy';
                });
                pharmacyDept ? this.prescription.department_id = pharmacyDept.id : value[0].id;
            }
        },

        selectedProduct(value) {
            if (value) {
                if(typeof value === 'string') {
                    this.prescription.drug = value;
                } else {
                    this.prescription.drug = value.id;
                }
            }
        },
    },

    methods: {
        ...mapActions([
            'setStoreDepartments', 'setSessions',
        ]),

        selectedDrug() {
            this.errors.clear('drug');
        },

        removeSection(index) {
      // Remove the section at the specified index
      this.sections.splice(index, 1);
    },

     // Method to update prescription data
     updatePrescriptionData(newData) {
      this.prescriptionData = newData;
      // console.log(this.prescriptionData);
    },

        drugSelected(selected) {

        },

        setPrescription() {
          this.$emit('setPrescription', this.prescription);
        },


        async savePrescriptionInChild() {
            // Save prescription in the child component
            await this.prescription.save();

            // Emit an event to notify the parent component that prescription is saved in the child component
            // this.$emit('prescriptionSavedInChild');
          },


        savePrescription() {
            if (this.checkIfQuantityExceedsStock() && !this.msetting('evaluation.unavailable_prescriptions')) {
                flash({ alert: 'error', message: 'The dosage quantity exceeds that in stock!' });
                return;
            }



            this.saveLoader = true;
            this.prescription.save();
        },

        checkIfQuantityExceedsStock() {
            return this.prescription.quantity > this.prescription.product.available;
        },

        feedDefaultStates() {
            this.prescription.allow_substitution = this.allowSubsitutionTrue;
            this.prescription.for_admission = this.checkedForAdmission;
            this.prescription.for_discharge = this.checkedForDischarge;
        },

        reset() {
            this.prescription.product = null;
            this.prescription.drug = null;
            this.methodObject = null;
            this.prescription.take = 1;
            this.prescription.duration = 1;
            this.prescription.whereto = null;
            this.prescription.notes = null;
            this.prescription.allow_substitution = false;
            this.prescription.for_admission = false;
            this.prescription.for_discharge = false;
            this.prescription.for_discharge = this.checkIfDischarge();
        },

        checkIfDischarge() {
            const val = window.location.href.indexOf('discharge');

            return val > 1 ? true : false;
        },
    },

    mounted() {
        this.treatmentLocationObj.find(this.isOfType);
        this.setStoreDepartments();
        this.options.config([
            'prescription_whereto', 'prescription_method', 'prescription_duration',
        ]);

        this.prescription.for_discharge = this.checkIfDischarge();

        this.feedDefaultStates();


    },
};
</script>
