<template>
  <collabmed-loading v-if="!initialised"></collabmed-loading>

  <div v-else>
    <v-alert :value="ageConflict" color="info" icon="info" outlined class="mb-4">
      Please note that if the date of birth and the age are both filled in then the date of birth will be ignored
    </v-alert>

    <!-- profile information -->
    <v-card class="mb-5">
      <v-card-title>
        <h2 class="text-body-2 ma-0 pa-0">Patient profile information</h2>
      </v-card-title>

      <v-divider class="ma-0"></v-divider>

      <v-card-text>
        <v-row >
          <v-col cols="12" md="4">
            <div class="mx-3">
              <v-select
              v-model="patient.name"
                :items="genderOptions"
                label="Patient Label"
                outlined
                required
            ></v-select>
            </div>
          </v-col>




          <v-col cols="12" md="4" v-if="showAgeChip">
            <v-chip  color="blue" text-color="white" small>{{ ageChipText }}</v-chip>
            <input type="text" v-model="patient.age">
          </v-col>

          <v-col cols="12" md="4">
            <div class="mx-3" >
              <v-text-field label="Age as number *" type="number" v-model="patient.age" outlined :readonly="ageReadOnly"
                            @keyup="errors.clear('age')"></v-text-field>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="mx-3">
              <v-select label="Age in *" :items="configurations.age_in" item-text="item_name"
                        item-value="item_name"
                        v-model="patient.age_in" :error="errors.has('age_in')" outlined
                        :hint="errors.get('age_in')"
                        persistent-hint @change="errors.clear('age_in')"></v-select>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="mx-3">
              <v-select label="Gender"
                        :items="genders"
                        v-model="patient.profile.sex"
                        :error="errors.has('profile.sex')" outlined
                        :hint="errors.get('profile.sex')" persistent-hint
                        @keyup="errors.clear('profile.sex')"
              ></v-select>
            </div>
          </v-col>


                                <v-col cols="12" class="text-right">
                                  <span v-if="!patient_id">
                                      <v-btn v-if="!profile" type="submit" class="blue lighten-1" color="blue" large
                                            :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                                            @click="savePatient()">
                                          {{ !screen ? 'Save patient' : 'Save' }}
                                      </v-btn>
                                  </span>

                        <span v-if="!patient_id">
                                          <v-btn v-if="!profile" type="submit" class="green lighten-1" color="blue" large
                                                :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                                                @click="saveAndCheckin()">
                                              Save and checkin
                                          </v-btn>
                                      </span>

                            <v-btn v-if="profile " type="submit" class="blue lighten-1" color="blue" large
                                  :dark="!formLoader" :loading="formLoader" :disabled="formLoader"
                                  @click="updatePatient()">
                              {{ !screen ? 'Update patient' : 'Update' }}
                            </v-btn>

                            <v-btn v-if="checkin" class="green lighten-1" dark large @click="checkinPatient()">
                              Checkin Patient
                            </v-btn>
                          </v-col>

          <!--<v-col cols="12" md="4" v-if="can('evaluation.view-patient-allergies')">
              <div class="mx-3">
                  <v-textarea label="Allergies" outlined v-model="patient.allergies" outline></v-textarea>
              </div>
          </v-col>-->
        </v-row>
      </v-card-text>
    </v-card>








  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Patient from '@reception/libs/patients/Patient';
import SettingsOptions from '@settings/libs/SettingsOptions';
import countiesJson from '/resources/frontend/reception/counties/counties.json';
import subCountiesJson from '/resources/frontend/reception/counties/sub-counties.json';

export default {
  props: {
    profile: {
      default: null,
    },

    editingMode: {
      type: Boolean,
      default: false,
    },
    screen: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      patient_id: null,
      dob: false,
      name: null,
      genderOptions: [
        'Unknown Male',
        'Unknown Female'
      ],
      formLoader: false,
      checkin: false,
      insuranceSchemes: [],
      insuranceCompanies: [],
      patient: new Patient(),
      options: new SettingsOptions(),
      countries: [],
      counties: null,
      ethnicity: null,
      tsc_no: null,
      age: null,
      dob_selection: null,
      age_in_years: false,
      nemis_number: null,
      sub_counties: [],
      getSubCounties: [],
      showAgeChip: false,
      showSelectAge: false,
      useAgeDatePicker: true,
      ageChipText: '',
      genders: [
        { text: 'Male', value: 'male' },
        { text: 'Female', value: 'female' },
      ],
      marital_status: [
        { text: 'Single', value: 'single' },
        { text: 'Married', value: 'married' },
        { text: 'Divorced', value: 'divorced' },
        { text: 'Widowed', value: 'windowed' },

      ],

    };
  },

  computed: {
    ...mapGetters([
      'getInsurances', 'getCounties',
    ]),

    ageReadOnly() {
      return !!this.patient.profile.dob; // Check if dob is filled
    },

    ageConflict() {
      return this.patient.profile.dob && this.patient.age;
    },

    configurations() {
      return this.options.configurations;
    },

    initialised() {
      const initial = this.getInsurances && this.configurations;

      if (this.profile) {
        return initial && this.profile && this.populated;
      }

      return initial;
    },

    errors() {
      return this.patient.form.errors;
    },

    submitted() {
      return this.patient.form.submitted;
    },

    contaminated() {
      return this.patient.form.errorDetected;
    },

    populated() {
      return this.patient.populated;
    },
  },

  watch: {


    getInsurances({ companies }) {
      return this.insuranceCompanies = companies;
    },


    'patient.profile.dob'(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.calculateAge();
      }
    },

    contaminated(value) {
      if (value) {
        this.formLoader = false;

        this.patient.form.errorDetected = false;
      }
    },

    submitted(value) {
      if (value) {
        this.formLoader = false;
        this.checkin = true;

        this.patient.form.submitted = false;
      }
    },
  },

  methods: {
    ...mapActions([
      'setInsurances', 'setCounties',
    ]),


    selectDobAge() {
      if (this.dob_selection === 'dob') {
        this.useAgeDatePicker = true;
        this.showSelectAge =false;
        console.log('Using DOB');
      } else if (this.dob_selection === 'age_in_years') {
        console.log('age in years');
        this.showAgeChip = false;
        this.showSelectAge =true;
        this.useAgeDatePicker = false;
      }
    },

    calculateAge() {
      if (this.patient.profile.dob) {
        const dob = new Date(this.patient.profile.dob);
        const today = new Date();
        const millisecondsInDay = 1000 * 60 * 60 * 24;
        const millisecondsInMonth = millisecondsInDay * 30; // Approximation, can be adjusted as needed

        // Calculate age in days
        const ageInDays = Math.floor((today - dob) / millisecondsInDay);

        // Calculate age in months
        const ageInMonths = Math.floor(ageInDays / 30);

        // Calculate age in years
        const ageInYears = Math.floor(ageInDays / 365);

        if (ageInDays <= 30) {
          this.patient.age = ageInDays; // Retain the age as days
          this.ageChipText = ageInDays + ' day(s)';
        } else if (ageInDays <= 540) { // 18 months = 18 * 30 days
          this.patient.age = ageInMonths; // Retain the age as months
          this.ageChipText = ageInMonths + ' month(s)';
        } else {
          // Calculate the remaining months after subtracting full years
          const remainingMonths = ageInMonths - (ageInYears * 12);
          this.patient.age = ageInYears; // Retain the age as years
          if (remainingMonths === 0) {
            this.ageChipText = ageInYears + ' years';
          } else {
            this.ageChipText = ageInYears + ' years ' + remainingMonths + ' months';
          }
        }

        this.showAgeChip = true;
      } else {
        this.showAgeChip = false;
      }
    },

    dependantSelected(patient) {
      const data = {
        name: patient.full_name,
        relationship_id: null,
        age: patient.age_friendly,
        id: patient.id,
      };

      if (this.patient.dependants.length >= this.msetting('reception.number_of_dependants')) {
        flash({
          message: 'This patient has reached the maximum number of dependants',
          alert: 'warning',
        });
      } else {
        if (this.patient.dependants.some((obj) => obj.id === data.id)) {
          flash({
            message: 'Already selected',
            alert: 'warning',
          });
        } else {
          this.patient.dependants.push(data);
        }
      }
    },

    removeDependant(index) {
      this.patient.dependants.splice(index, 1);
    },

    pickDate(index) {
      const reference = `reference${index}`;
      this.$refs[reference][0].save(this.patient.schemes[index].dob);
    },

    dateMenu(index) {
      return this.patient.schemes[index].menu;
    },

    addScheme() {
      this.patient.schemes.push(
          this.patient.schemeTemplate(),
      );
    },

    addNok() {
      this.patient.noks.push(
          this.patient.nokTemplate(),
      );
    },

    removeScheme(index) {
      this.insuranceSchemes.splice(index, 1);
      this.patient.schemes.splice(index, 1);
    },

    removeNok(index) {
      this.patient.noks.splice(index, 1);
    },

    selectSchemes(company, index) {
      this.$set(this.insuranceSchemes, index, company.schemes);
    },

    async savePatient() {
      this.formLoader = true;

      const response = await this.patient.saveunkownpatient();

      this.patient_id = response.patient_id;

      if (response) {
        this.screen ? this.redirectToScreened() : null;
      }
    },

    redirectToScreened() {
      window.open('/reception/screened-patients?screened=1', '_self');
    },

    async saveAndCheckin() {
      const response = await this.patient.saveunkownpatient();

      if (response) {
        this.checkinPatient();
      }
    },

    async updatePatient() {
      this.formLoader = true;
      const response = await this.patient.update();

      if (response) {
        this.formLoader = false;

        this.screen ? this.redirectToScreened() : null;
      }
    },

    checkinPatient() {
      window.location = route('reception.patient.visits.create', this.patient.patient_id);
    },

    async fetchCountries() {
      if (this.screen) {
        this.patient.profile.nationality = 'Kenya';
      }

      const response = await fetch('https://restcountries.eu/rest/v2/all?fields=name;capital');

      if (response) {
        this.countries = await response.json();
      }
    },

    setSubCounties({ params }) {
      try {
        // Extract the selected county code from the params
        const selectedCountyCode = params.county_code;

        // Find the entry for the selected county code in the subCountiesJson
        const subCountiesEntries = subCountiesJson.filter((entry) => entry.county_code === selectedCountyCode);


        // Extract sub-counties array if the entries exist
        // Set the sub-counties in your data property (assuming `getSubCounties` is a data property)
        this.getSubCounties = subCountiesEntries.map((entry) => {
          return {
            value: entry.name, // Assuming 'name' is the property containing sub-county name
            text: entry.name, // Display the sub-county name in the dropdown
          };
        });
      } catch (error) {
        // Handle errors, if any
        console.error('Error setting sub-counties', error);
      }
    },
    fetchSubCounties() {
      // Find the entry for the selected county in countiesJson
      const selectedCounty = this.patient.profile.resident_county;
      const countyEntry = countiesJson.find((entry) => entry.name === selectedCounty);

      if (!countyEntry) {
        console.error('County entry not found for:', selectedCounty);
        return;
      }

      // Extract the county code
      const countyCode = countyEntry.code;

      this.setSubCounties({
        params: {
          county_code: countyCode,
        },
      });
    },

    initializePage() {
      this.setInsurances();

      this.options.config([
        'relationship', 'age_in', 'covid_symptoms',
      ]);

      if (this.profile) {
        this.patient.populate(this.profile);
      }

      this.checkin = false;

      if (this.screen) {
        this.patient.profile.resident_county = 'Kisii';

        this.fetchSubCounties();
      }

      this.fetchCountries();
      // this.setCounties();
    },
  },

  mounted() {
    this.screen ? this.patient.screening = 1 : 0;
    this.initializePage();
    this.counties = countiesJson.map((county) => county.name); // disable browser cached autocompletes
    this.dob_selection = 'dob'; // Set dob_selection to 'dob' to check the radio button
  },
};
</script>

<style lang="scss">
/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all .5s ease;
}
.slide-fade-leave-active {
  transition: all .2s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
  /* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateY(15px);
  opacity: 0;
}

.v-text-field__details {
  padding: 0 0 5px 0 !important;

  .theme--light.v-messages{
    color: #e74c3c !important;
  }
}
</style>
