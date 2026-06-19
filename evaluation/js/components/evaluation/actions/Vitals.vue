<template>
  <collabmed-loading v-if="!initialised"></collabmed-loading>

  <v-row  v-else>
    <v-col cols="7">
      <v-card class="py-3" flat>
        <v-card-text>
         
          <v-row>
            <v-col :cols="filteringComponents ? '12' : '6'" class="px-4">
              <v-col cols="12" v-if="showComponent('weight')">
                <v-text-field label="Weight" v-model="vital.weight" outline suffix="Kgs" @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12"  v-if="showComponent('height')">
                <v-text-field label="Height" v-model="vital.height" outline
                              :suffix="msetting('evaluation.use_centimetres_instead_of_metres_under_vitals') ? 'Centimeters ' : 'meters'"
                              @change="!vital.new_entry && vital.save()">
                </v-text-field>
              </v-col>

              <v-col cols="12"  v-if="showComponent('bp_systolic')">
                <v-text-field label="BP Systolic" v-model="vital.bp_systolic" outline suffix="mm/hg" @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12" v-if="showComponent('bp_diastolic')">
                <v-text-field label="BP Diastolic" v-model="vital.bp_diastolic" outline suffix="mm/hg" @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12" v-if="showComponent('pulse')">
                <v-text-field label="Pulse" v-model="vital.pulse" outline suffix="per min" @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12" v-if="showComponent('respiration')">
                <v-text-field label="Respiration" v-model="vital.respiration" outline suffix="per min" @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>


              <v-col cols="12"  v-if="showComponent('visual_acuity')">
                <v-text-field label="Visual acuity-uncorrected-corrected" v-model="vital.visual_acuity" outline suffix="" @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12"  v-if="showComponent('intracular_pressure')">
                <v-text-field label="Intraocular pressure (IOP)" v-model="vital.intracular_pressure" outline suffix="mmHg" @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12"  v-if="showComponent('autorefraction')">
                <v-text-field label="Autorefraction" v-model="vital.autorefraction" outline suffix="" @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>


              <v-col cols="12" v-if="showComponent('temperature')">
                <v-text-field label="Temperature" v-model="vital.temperature" outline suffix="celcius" @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12" v-if="showComponent('temperature_location')">
                <v-select label="Temperature Location" outline v-model="vital.temperature_location_id"
                          :items="configurations.temperature_location" item-text="item_name" item-value="id" @change="!vital.new_entry && vital.save()"
                ></v-select>
              </v-col>

              <v-col cols="12" v-if="showComponent('nurse_notes')">
                <v-textarea label="Nurse's notes" v-model="vital.nurse_notes" outline @change="!vital.new_entry && vital.save()"></v-textarea>
              </v-col>


              <v-col cols="12" v-if="showComponent('current_medication')">
                <v-textarea label="Current Medication (s)" v-model="vital.current_medication" outline @change="!vital.new_entry && vital.save()"></v-textarea>
              </v-col>
            </v-col>

            <v-col :cols="filteringComponents ? '12' : '6'" class="pr-4">

              <v-col cols="12"  v-if="showComponent('uncorrected_near_vision')">
                <v-text-field label="Uncorrected near vision" v-model="vital.uncorrected_near_vision" outline suffix="" @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12"  v-if="showComponent('corrected_near_vision')">
                <v-text-field label="Corrected near vision" v-model="vital.corrected_near_vision" outline suffix="" @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12"  v-if="showComponent('random_blood_sugar')">
                <v-text-field label="Random Blood Sugar (RBS)" v-model="vital.random_blood_sugar" outline suffix="Mmol/l Mg/dl" @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12"  v-if="showComponent('fasting_blood_sugar')">
                <v-text-field label="Fasting Blood Sugar (FBS)" v-model="vital.fasting_blood_sugar" outline suffix="Mmol/l Mg /dl" @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12"  v-if="showComponent('oxygen')">
                <v-text-field label="Oxygen" v-model="vital.oxygen" outline @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12"  v-if="showComponent('waist')">
                <v-text-field label="Waist" v-model="vital.waist" outline @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12"  v-if="showComponent('hip')">
                <v-text-field label="Hip" v-model="vital.hip" outline @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12"  v-if="showComponent('head_circumference')">
                <v-text-field label="Head circumference (cm)" v-model="vital.head_circumference" outline @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12"  v-if="showComponent('muac')">
                <v-text-field label="M.U.A.C (cm)" v-model="vital.muac" outline @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-col cols="12"  v-if="showComponent('blood_sugar')">
                <v-text-field label="Blood sugar" v-model="vital.blood_sugar" outline @change="!vital.new_entry && vital.save()"></v-text-field>
              </v-col>

              <v-row class="cols"   v-if="showComponent('blood_sugar_units')">
                <v-col cols="5">
                  <label class="mid-center font-weight-regular subheading mt-3">Blood sugar unit:</label>
                </v-col>
                <v-col cols="7">
                  <v-radio-group v-model="vital.blood_sugar_units" row @change="!vital.new_entry && vital.save()">
                    <v-radio label="mmol/L" value="mmol/L"></v-radio>
                    <v-radio label="mg/dL" value="mg/dL"></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>

              <v-divider v-if="!vitalsToShow"></v-divider>

              <v-col cols="12">
                <v-row
                    v-if="showComponent('bmi') && visitObj.selectedVisit && visitObj.selectedVisit.patient.age_months > 60">
                  <v-col cols="5" >
                    <label class="mid-center font-weight-regular subheading mt-3">BMI: </label>
                  </v-col>
                  <v-col cols="7">
                    <label class="mid-center font-weight-regular subheading mt-3" v-text="bmi"></label>
                  </v-col>
                </v-row>

                <v-row  v-if="showComponent('bmi') && visitObj.selectedVisit && visitObj.selectedVisit.patient.age_months > 60">
                  <v-col cols="5">
                    <label class="mid-center font-weight-regular subheading mt-3">BMI Status: </label>
                  </v-col>
                  <v-col cols="7">
                    <label class="mid-center font-weight-regular subheading mt-3" v-text="bmiStatus"></label>
                  </v-col>
                </v-row>

                <v-row v-if="visitObj.selectedVisit && visitObj.selectedVisit.patient.age_months > 60">
                  <v-col cols="12">
                    <label class="mid-center font-weight-regular subheading mt-3">BMI/age percentile: </label>

                    <label class="mid-center font-weight-regular text-right ml-3 subheading mt-3">
                      <span>{{ getPercentileSuffix(vital.bmi_percentile) }}</span>
                    </label>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="5"  v-if="showComponent('waist_ratio')">
                    <label class="mid-center font-weight-regular subheading mt-3">Waist/Hip ratio: </label>
                  </v-col>

                  <v-col cols="7"  v-if="showComponent('whr')">
                    <label class="mid-center font-weight-regular subheading mt-3" v-text="whr">N/A</label>
                  </v-col>
                  <v-btn  @click="addNewVital" small color="primary" dark>
                    {{ buttonLabel }}
                  </v-btn>
                </v-row>

                <v-row v-if="visitObj.selectedVisit && visitObj.selectedVisit.patient.age_months < 60">
                  <v-col cols="12">
                    <label class="mid-center font-weight-regular subheading mt-3">Length/age percentile: </label>

                    <label class="mid-center font-weight-regular text-right ml-3 subheading mt-3">
                      <span>{{ getPercentileSuffix(vital.length_percentile) }}</span>
                    </label>
                  </v-col>
                </v-row>

                <v-row v-if="visitObj.selectedVisit && visitObj.selectedVisit.patient.age_months < 60">
                  <v-col cols="12">
                    <label class="mid-center font-weight-regular subheading mt-3">Weight/age percentile: </label>

                    <label class="mid-center font-weight-regular text-right ml-3 subheading mt-3">
                      <span>{{ getPercentileSuffix(vital.weight_percentile) }}</span>
                    </label>
                  </v-col>
                </v-row>

              </v-col>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="5">
      <v-row  class="px-4">
        <v-col cols="12">
          <patient-meta :patient-id="selectedVisit.patient_id"
                        :meta-vitals-to-show="metaVitalsToShow"
                        v-if="selectedVisit"></patient-meta>
        </v-col>
      </v-row>
    </v-col>
  </v-row>

</template>

<script>
import Vital from '@evaluation/libs/vitals/Vital';
import Visit from '@reception/libs/visits/Visit';
import SettingsOptions from '@settings/libs/SettingsOptions';
import { _ } from 'vue-underscore';

export default {
  props: {
    vitalsToShow: {
      type: Array,
    },
    metaVitalsToShow: {
      type: Array,
    },
  },

  data() {
    return {
      saveLoader: false,
      vital: new Vital(),
      visitObj: new Visit(),
      options: new SettingsOptions(),
      filteringComponents: false,
    };
  },

  watch: {
    submitted() {
      this.saveLoader = false;
    },

    visit(value) {
      if (value) {
        const vitals = value.vitals;
        this.vital.populate(vitals);
      }
    },
  },

  computed: {
    initialised() {
      return this.visit && this.configurations;
    },
    buttonLabel() {
      return this.checkFilledFields() ? 'Submit Vital Details' : 'Add new';
    },
    bmi() {
      if (this.vital.weight && this.vital.height) {
        const bmi = (this.vital.weight / (this.vital.height * this.vital.height)).toFixed(2);

        return bmi;
      }

      return 'N/A';
    },

    bmiStatus() {
      let status = 'N/A';

      if (this.bmi) {
        _.each(this.vital.bmi_indices, (values, index) => {
          if (this.bmi > values[0] && this.bmi < values[1]) {
            status = index;
          }
        });
      }

      return status;
    },

    // waist to hip ratio
    whr() {
      if (this.vital.waist && this.vital.hip) {
        return this.vital.waist / this.vital.hip;
      }

      return 'N/A';
    },

    visit() {
      return this.visitObj.selectedVisit;
    },

    selectedVisit() {
      return this.visitObj.selectedVisit;
    },

    errors() {
      return this.vital.form.errors;
    },

    submitted() {
      return this.vital.form.submitted;
    },

    contaminated() {
      return this.vital.form.errorDetected;
    },

    configurations() {
      return this.options.configurations;
    },
  },

  methods: {
    showComponent(component) {
      if (!this.msetting('evaluation.remove_' + component)) {
        if (this.vitalsToShow && this.vitalsToShow.length > 0) {
          return this.vitalsToShow.includes(component);
        } else {
          return true;
        }
      }
    },
    isEagleEyeDomain() {
    return ["eagleeye.collabmed.co", "eagleeye.collabmed.net"].includes(window.location.hostname);
    },
    checkFilledFields() {
      // Check if all required fields are filled
      if (this.vital.temperature && this.vital.height && this.vital.weight && this.vital.bp_systolic && this.vital.bp_diastolic && this.vital.pulse &&
          this.vital.respiration   && this.vital.nurse_notes && this.vital.current_medication && this.vital.oxygen && this.vital.blood_sugar
      ) {
        return true; // All fields are filled
      } else {
        return false; // At least one field is not filled
      }
    },

    addNewVital() {
      this.vital.new_entry= true;


      if (this.checkFilledFields()) {
        this.vital.save();
        // Clear all form fields
        this.vital.weight = '';
        this.vital.height = '';
        this.vital.bp_systolic = '';
        this.vital.bp_diastolic = '';
        this.vital.pulse = '';
        this.vital.respiration = '';
        this.vital.visual_acuity = '';
        this.vital.intracular_pressure = '';
        this.vital.autorefraction = '';
        this.vital.temperature = '';
        this.vital.temperature_location_id = null;
        this.vital.nurse_notes = '';
        this.vital.current_medication = '';
        this.vital.uncorrected_near_vision = '';
        this.vital.corrected_near_vision = '';
        this.vital.random_blood_sugar = '';
        this.vital.fasting_blood_sugar = '';
        this.vital.oxygen = '';
        this.vital.waist = '';
        this.vital.hip = '';
        this.vital.head_circumference = '';
        this.vital.muac = '';
        this.vital.blood_sugar = '';
        this.vital.blood_sugar_units = '';
      }
    },

    getPercentileSuffix(n) {
      if (n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]) + ' percentile';
      } else {
        return 'No result found';
      }
    },
  },

  mounted() {
    this.vital.visit = this.$route.params.visitId;
    this.visitObj.find(this.vital.visit);
    this.options.config([
      'temperature_location',
    ]);
    this.filteringComponents = !!this.vitalsToShow;
  },
};
</script>

<style scoped>

</style>
