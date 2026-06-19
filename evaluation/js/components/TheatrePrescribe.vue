<template>
  <collabmed-loading v-if="!initialised"></collabmed-loading>

  <v-container fluid v-else>

    <!-- First section -->
    <v-dialog  width="800" persistent v-model="dialogVisible">
      <template v-slot:activator="{ on }">
        <v-btn color="orange" small dark v-on="on" @click="dialogVisible = true">
          <v-icon>add</v-icon> Prescribe own medication
        </v-btn>
      </template>
      <v-card>
        <v-card-title class="text-h5 blue white--text" primary-title>
          Add own prescription
          <v-btn icon dark @click.native="dialogVisible=false" absolute right>
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
            <v-card-text>
              <v-container >
              <!-- First section -->
                <v-row>
                  <v-col cols="5">
                    <v-autocomplete
                      v-model="prescription.own_department_id"
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
                      :label="`Search for drug ${placeholder} `"
                      class="mb-4"
                      :items="product.search.own_results"
                      item-text="text"
                      persistent-hint
                      v-model="prescription.own_product"
                      @change="selectedPrescription(prescription.own_product)"
                      chips
                      :loading="product.search.own_loading"
                      :search-input.sync="product.search.own_term"
                      return-object
                      :disabled="!prescription.own_department_id"
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
                    <div v-if="!msetting('evaluation.allow_doctors_to_type_prescriptions')">

                      <!-- Conditionally show v-autocomplete or v-textarea -->
                      <v-autocomplete
                        v-if="showAutocomplete"
                        outline
                        :label="`Search for drug ${placeholder}`"
                        class="mb-4"
                        :items="product.search.own_results"
                        item-text="text"
                        v-model="prescription.own_product"
                        :loading="product.search.own_loading"
                        :search-input.sync="product.search.own_term"
                        return-object
                        :disabled="!prescription.own_department_id"
                        :error="errors.has('own_drug')"
                        :hint="errors.get('own_drug')"
                        persistent-hint
                        :no-filter="true"
                        :clearable="false"
                      >
                        <!-- Template for individual items -->
                        <template slot="item" slot-scope="{ item }">
                          <v-list-item-content>
                            <v-list-item-title class="caption">{{ item.text }}</v-list-item-title>
                            <v-list-item-subtitle>
                              <span v-if="item.stock_take_status" class="caption red--text">{{ item.stock_take_status }}</span>
                              <span v-else-if="item.closed" class="caption red--text">Store closed</span>
                              <span v-else>
                                <span class="caption blue--text font-weight-bold" v-if="item.exclusion_price && !item.product_excluded">
                                  Exclusion Price: {{ item.exclusion_price }}
                                  <br />
                                </span>
                                <span class="caption warning--text font-weight-bold" v-if="item.product_excluded">
                                  Product not covered by patient scheme
                                  <br />
                                </span>
                                <span class="mx-1 caption">Cash price: {{ item.selling_price }}</span>
                                <span class="caption">: Insurance Price: {{ item.insurance_price }}</span>
                              </span>
                            </v-list-item-subtitle>
                          </v-list-item-content>
                        </template>
                  
                        <!-- No data slot (Switch to textarea when no matching results) -->
                        <template v-slot:no-data>
                          <v-list-item @click="switchToTextArea" class="cursor-pointer">
                            <v-list-item-content>
                              <v-list-item-title class="caption">
                                No matching results found. Add: "{{ product.search.own_term }}"
                              </v-list-item-title>
                            </v-list-item-content>
                          </v-list-item>
                        </template>
                      </v-autocomplete>
                  
                      <!-- Textarea for custom input (only appears when no autocomplete results) -->
                      <v-textarea
                        v-else
                        label="Enter custom drug"
                        v-model="prescription.own_product"
                        outlined
                        rows="2"
                        @input="onTextAreaInput"
                      ></v-textarea>
                  
                    </div>
                  </v-col>
                </v-row>

                <!-- Dosage assignment select -->
                <v-row>
                  <v-col cols="3">
                    <v-text-field type="number" label="Dosage take" v-model="prescription.own_take"
                                  :error="errors.has('take')"
                                  :hint="errors.get('take')" persistent-hint
                                  @keyup="errors.clear('take')"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="3">
                    <v-text-field label="UoM" outline v-model="prescription.own_unit_of_measurement"
                    :error="errors.has('unit_of_measurement')" :hint="errors.get('unit_of_measurement')"
                    persistent-hint @keyup="errors.clear('unit_of_measurement')"
                   
                ></v-text-field>
                  </v-col>

                  <v-col cols="3">
                      <v-select v-model="prescription.own_whereto" label="Route"
                                :items="configurations.prescription_whereto" item-text="item_name" item-value="id"
                                :error="errors.has('whereto')" :hint="errors.get('whereto')"
                                persistent-hint @change="errors.clear('whereto')"
                      ></v-select>
                  </v-col>

                  <v-col cols="3">
                    <v-select v-model="ownMethodObject" label="Frequency" outline
                              :items="configurations.prescription_method" item-text="item_name" return-object
                              :error="errors.has('method')" :hint="errors.get('method')"
                              persistent-hint 
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


                  <v-col cols="3">
                    <v-select v-model="ownMeasureObject" label="Measure"
                              :items="configurations.prescription_duration" item-text="item_name" return-object
                              :error="errors.has('time_measure')" :hint="errors.get('time_measure')"
                              persistent-hint @change="errors.clear('time_measure')"
                    ></v-select>
                  </v-col>

                  <v-col cols="3">
                    <v-text-field label="Quantity" v-model="prescription.own_quantity" @change="calculateDispensableUnit()"></v-text-field>

                  </v-col>
                </v-row>
                <v-row>
                <!-- <v-col cols="12" sm="6" md="4" > -->
                  <v-col cols="12" sm="6" md="4" v-if="msetting('inventory.enable_dispensable_amount')">
                    <div class="mx-3">
                        <v-text-field label="Dispensable Units" v-model="prescription.own_dispensable_unit" :error="errors.has('dispensable_unit')" outline required
                                      :hint="errors.get('dispensable_unit')" persistent-hint @keyup="errors.clear('dispensable_unit')">
                        </v-text-field>
                    </div>
                </v-col>

                </v-row>

                <!-- Divider -->
                <v-divider class="mb-1 mt-0"></v-divider>

                <!-- Switches -->
                    <v-row  >
                    <v-col cols="12" v-if="checkForDiscountedDrugsAbility">
                        <v-switch label="Check here if it is a discounted drug (Part of a procedure)"
                                  v-model="prescription.own_drug_part_of_procedure"></v-switch>
                    </v-col>

                    <v-col cols="12">
                        <v-switch label="Drug substitution is allowed"
                                  v-model="prescription.own_allow_substitution"></v-switch>
                    </v-col>

                    <v-col cols="12" v-if="showForAdmission">
                        <v-switch label="Drug is for Admission" v-model="prescription.own_for_admission"></v-switch>
                    </v-col>

                    <v-col cols="12" v-if="showForDischarge">
                        <v-switch label="Drug is for Discharge" v-model="prescription.own_for_discharge"></v-switch>
                    </v-col>
                  </v-row>




                  <!-- Generated sections -->
                  <v-row>
                <template v-for="(section, index) in sections">

                  <!-- <template v-for="(section, index) in sections" :key="index"> -->
                    <v-row>


                      <single-prescribe-drug @setPrescription="handleExternalPrescription" :main-prescription="prescription"/>

                    </v-row>
                    <!-- <v-divider class="mb-1 mt-0"></v-divider> -->
                    <v-col>
                    <v-btn @click="removeSection(index)" class="red lighten-1" color="white">Remove Section</v-btn>
                    </v-col>

                    <!-- <v-divider class="mb-1 mt-0"></v-divider> -->



                    <!-- <v-col cols="12">

                    </v-col> -->

                  </template>

                </v-row>




                <!-- Textarea for doctor's notes -->
                <v-row>
                  <v-col cols="12">
                    <v-textarea label="Doctor's notes" v-model="prescription.own_notes" outlined rows="2"></v-textarea>
                  </v-col>
                </v-row>


                <!-- <v-btn class="green lighten-1" color="white" @click="addSection" block large>Add Section</v-btn> -->
                <!-- Save prescription button -->
                <v-row>
                  <v-col cols="12">
                    <v-btn class="blue lighten-1" color="blue" @click.prevent="saveOwnPrescription" block large
                          :dark="!saveOwnLoader" :loading="saveOwnLoader" :disabled="saveOwnLoader"
                    >
                      Save prescription
                    </v-btn>
                  </v-col>
                </v-row>



          
          </v-container>
          </v-card-text>
      </v-card>
    </v-dialog>
    <v-row style="width:100% !important">
      <v-col cols="5">
        <v-autocomplete
            v-model="prescription.store_id"
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
                  <span class="mx-1 caption">Cash price
                    : {{ item.selling_price}}</span>
                  <span class="caption">:  Insurance Price: {{ item.insurance_price }} </span>
                </span>

              </v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-autocomplete>
      </v-col>
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
      <v-col cols="3">
        <v-text-field label="UoM" outline v-model="prescription.unit_of_measurement"
        :error="errors.has('unit_of_measurement')" :hint="errors.get('unit_of_measurement')"
        persistent-hint @keyup="errors.clear('unit_of_measurement')"

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
    <v-row>
      <!-- <v-col cols="12" sm="6" md="4" > -->
      <v-col cols="12" sm="6" md="4" v-if="msetting('inventory.enable_dispensable_amount')">
        <div class="mx-3">
          <v-text-field label="Dispensable Units" v-model="prescription.dispensable_unit" :error="errors.has('dispensable_unit')" outline required
                        :hint="errors.get('dispensable_unit')" persistent-hint @keyup="errors.clear('dispensable_unit')">
          </v-text-field>
        </div>
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




    <!-- Generated sections -->
    <v-row>
      <template v-for="(section, index) in sections">

        <!-- <template v-for="(section, index) in sections" :key="index"> -->
        <v-row>


          <single-prescribe-drug @setPrescription="handleExternalPrescription" :main-prescription="prescription"/>

        </v-row>
        <!-- <v-divider class="mb-1 mt-0"></v-divider> -->
        <v-col>
          <v-btn @click="removeSection(index)" class="red lighten-1" color="white">Remove Section</v-btn>
        </v-col>

        <!-- <v-divider class="mb-1 mt-0"></v-divider> -->



        <!-- <v-col cols="12">

        </v-col> -->

      </template>

    </v-row>




    <!-- Textarea for doctor's notes -->
    <v-row>
      <v-col cols="12">
        <v-textarea label="Doctor's notes" v-model="prescription.notes" outlined rows="2"></v-textarea>
      </v-col>
    </v-row>


    <!-- <v-btn class="green lighten-1" color="white" @click="addSection" block large>Add Section</v-btn> -->
    <!-- Save prescription button -->
    <v-row>
      <v-col cols="12">
        <v-btn type="submit" class="blue lighten-1" color="blue" @click.prevent="savePrescription" block large
               :dark="!saveLoader" :loading="saveLoader" :disabled="saveLoader"
        >
          Save prescription
        </v-btn>
      </v-col>
    </v-row>



  </v-container>
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
    operationId: {
      default: null,
      type: Number,
    },
    userId: {
      default: null,
      type: Number,
    },
    isOfType: String,

    showForAdmission: {
      default: false,
      type: Boolean,
    },

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
      saveOwnLoader: false,
      dialogVisible: false,
      showAutocomplete: true,
      options: new SettingsOptions(),
      placeholder: '',
      sections: [], // Array to store sections
      allPrescriptions:[],
    };
  },

  computed: {
    ...mapGetters([
      'getStoreDepartments', 'setPrescriptions', 'getSessions',
    ]),

    term() {
      return this.product.search.term;
    },
    own_term() {
          return this.product.search.own_term;
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
  return this.prescription?.form?.errors || [];
},

submitted() {
  return this.prescription?.form?.submitted || false;
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
    prescription: {
          handler(newVal, oldVal) {

            this.handleSelectedPrescription(newVal);
          },
          deep: true // Watch for changes deeply in the object
        },
        'prescription.product'(newProduct) {
          // This watcher is triggered whenever 'prescription.product' changes
          if (newProduct) {
            this.handleSelectedPrescription(newProduct);
            this.handleOwnSelectedPrescription(newProduct)

            }
        },
    own_item(value) {
            if (value) {
                this.product.search.own_results = [];
                this.product.search.own_term = false;
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
    'product.search.own_term'(newTerm) {
      if (newTerm && this.showAutocomplete === false) {
        this.showAutocomplete = true; // Switch back to autocomplete if the user starts typing
      }
    },
   
    
    prescription: {
      handler(newVal, oldVal) {
        // Handle the new value of prescription here
        // You can perform any actions you need with the new value
      },
      deep: true // Watch for changes deeply in the object
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
    selectedOwnProduct(value) {
            if (value) {
    
                if(typeof value === 'string') {
                    this.prescription.own_drug = value;
                } else {
                    this.prescription.own_drug = value.id;
                }
            }
      },
    'prescription.quantity': function(newVal) {
      this.calculateDispensableUnit();
    },
    'product.dispensable_amount': function(newVal) {
      this.calculateDispensableUnit();
    }
  },

  methods: {
    ...mapActions([
      'setStoreDepartments', 'setSessions',
    ]),

    selectedDrug() {
      this.errors.clear('drug');
    },
    switchToTextArea() {
      this.prescription.own_product = this.product.search.own_term; // Set the custom drug input
      this.showAutocomplete = false; // Switch to textarea
    },
    resetOwnPrescriptionForm() {
      this.prescription = {
        own_department_id: null,
        own_product: null,
        own_take: '',
        own_unit_of_measurement: '',
        own_whereto: '',
        duration: '',
        own_quantity: '',
        own_dispensable_unit: '',
        own_notes: '',
        own_drug_part_of_procedure: false,
        own_allow_substitution: false,
        own_for_admission: false,
        own_for_discharge: false
      };
      this.product.search.own_term = '';
      this.product.search.own_results = [];
    },
    own_reset(){
          this.prescription.product = null;
            this.prescription.drug = null;
            this.ownMethodObject= null;
            this.ownMeasureObject= null;
            this.prescription.own_take = null;
            this.prescription.own_duration = null;
            this.prescription.own_whereto = null;
            this.prescription.own_notes = null;
            this.prescription.own_allow_substitution = false;
            this.prescription.own_for_admission = false;
            this.prescription.own_for_discharge = false;
            this.prescription.own_quantity = null;
            this.prescription.own_for_discharge = this.checkIfDischarge();
            this.showAutocomplete = true;
            this.prescription.own_department_id = null
        },
    async saveOwnPrescription() {
    this.saveOwnLoader = true; // Show loader before starting the save operation

    try {
        // Attempt to save the prescription
        await this.prescription.saveOwnPrescription();

              // Close the dialog and reset the form if the save is successful
              this.dialogVisible = false;
              this.resetOwnPrescriptionForm();
                } catch (error) {
                    console.error(error);
                } finally {
                    // Ensure the loader is hidden and the form is reset
                    this.saveOwnLoader = false;
                }
      },

     // Method to handle typing in the textarea and switch back to autocomplete
     onTextAreaInput(value) {
    //   this.product.search.own_term = value; // Set the search term to what the user is typing
      this.showAutocomplete = true; // Switch back to autocomplete to search again
    },
    resetOwnPrescriptionForm() {
     this.own_reset()
      this.product.search.own_term = '';
      this.product.search.own_results = [];
    },
  
        addCustomDrug() {
      // Assign the search term to the v-model (prescription.own_product)
      this.prescription.own_product = this.product.search.own_term;
    },
       
        selectedOwnDrug() {
          this.errors.clear('own_drug');

      if (!this.prescription.own_product) {
        this.prescription.own_product = this.product.search.own_term;
      }
    },
    handleSelectedPrescription(product) {
           //check about dispensable amount if it is greater than 0 
          if(product.unit_of_measurement !== null){
            this.prescription.unit_of_measurement = product.unit_of_measurement
            this.prescription.dispensable_amount = product.dispensable_amount
          }

        },

        handleOwnSelectedPrescription(product) {
           //check about dispensable amount if it is greater than 0 
          if(product.own_unit_of_measurement !== null){
            this.prescription.own_unit_of_measurement = product.unit_of_measurement
            this.prescription.own_dispensable_amount = product.dispensable_amount
          }


        },

    async calculateDispensableUnit() {

      const response = await fetch('/api/inventory/product/'+this.prescription.drug);
      const data = await response.json();

      // Check if prescription.quantity and product.dispensable_amount are valid numbers
      if (!isNaN(this.prescription.quantity) && !isNaN(data.dispensable_amount)) {
        // Perform the division
        this.prescription.dispensable_unit =   this.prescription.quantity / data.dispensable_amount;

      } else {
        // Handle invalid input
        this.prescription.dispensable_unit = null;
      }
    },

    addSection() {
      // Add a new section to the sections array
      this.sections.push({});
    },

    removeSection(index) {
      // Remove the section at the specified index
      this.sections.splice(index, 1);
    },

    mergePrescriptionData(sectionData) {
      // Merge the values of the prescription object from the section into the main object
      this.prescription = { ...this.prescription, ...sectionData };
    },

    drugSelected(selected) {
      // console.log(selected);
    },

    async savePrescription() {
      if (this.checkIfQuantityExceedsStock() && !this.msetting('evaluation.unavailable_prescriptions')) {
        flash({ alert: 'error', message: 'The dosage quantity exceeds that in stock!' });
        return;
      }
      this.saveLoader = true;
      this.prescription.visit = this.visitId;
      this.prescription.user = this.userId;
      this.prescription.operation_id = this.operationId

      await this.prescription.saveTheatrePrescriptions();

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

  handleExternalPrescription(prescription)
  {
    this.allPrescriptions.push(prescription);
    // console.log(this.allPrescriptions);
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

<style lang="scss">
table.v-table thead th{
  font-size: 14px;
}

.small-font{
  input{
    font-size: 13px;
  }
}
.v-autocomplete__content .v-list__item{
  height: auto;
}
</style>

