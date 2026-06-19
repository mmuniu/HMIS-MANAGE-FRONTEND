<template>
  <collabmed-loading v-if="loading"></collabmed-loading>
  <div v-else>
    <v-card flat class="px-3">
      <v-card-title>
        <h4 style="text-decoration: underline" class="pt-6 pl-2">Vaccine notes</h4>
        <v-spacer/>
      </v-card-title>

      <div class="mx-4">
        <v-row>
          <v-col cols="4">
            <v-autocomplete
              v-model="selectedVaccine"
              @change="addVaccineRow"
              item-text="text"
              item-value="value"
              label="Vaccine Name"
              :items="vaccines"
              outlined
              hide-details
              :search-input.sync="search"
              no-data-text="No matching records found"
              :loading="loading"
            ></v-autocomplete>
          </v-col>

          <v-col cols="4">
            <v-select
              v-model="vaccineVenue"
              @change="toggleRequiredVaccineFields"
              item-text="text"
              item-value="value"
              label="Vaccine taken at?"
              :items="vaccine_venue"
              outlined
              hide-details
              :search-input.sync="search"
              no-data-text="No matching records found"
              :loading="loading"
            ></v-select>
          </v-col>

          <v-col cols="3">
            <v-select
              v-model="vaccineVerified"
              item-text="text"
              item-value="value"
              label="Verified?"
              :items="vaccine_required"
              outlined
              hide-details
              :search-input.sync="search"
              no-data-text="No matching records found"
              :loading="loading"
            ></v-select>
          </v-col>
        </v-row>

        <div v-for="(vaccine, index) in vaccineNotes.vaccines" :key="index">
          <v-row>
            <v-col cols="3">
              <v-text-field
                v-model="vaccine.vaccine"
                label="Vaccine"
                readonly
              ></v-text-field>
            </v-col>

            <v-col cols="2" v-if="vaccine.vaccine === 'Covid-19'">
              <v-select
              v-model="vaccine.patient_covid_vaccine_tested"
              item-text="text"
              item-value="value"
              label="Since patient vaccination,have they been tested for COVID-19"
              :items="tested_after_patient_vaccination"
              outlined
              hide-details
              :search-input.sync="search"
              no-data-text="No matching records found"
              :loading="loading"
            ></v-select>
            </v-col>

            <v-col cols="2" v-if="vaccine.vaccine === 'Covid-19'">
              <v-select
              v-model="vaccine.patient_covid_vaccine_tested_result"
              item-text="text"
              item-value="value"
              label="If yes,what was the result?"
              :items="after_test_results"
              outlined
              hide-details
              :search-input.sync="search"
              no-data-text="No matching records found"
              :loading="loading"
            ></v-select>
            </v-col>
            

            <v-col cols="1">
              <v-text-field
                v-model="vaccine.dose"
                :label="requiredFieldLabel('Dose', vaccine)"
                :rules="[v => !isFieldRequired('dose', vaccine) || !!v || 'Required']"
              ></v-text-field>
            </v-col>

            <v-col cols="1">
              <collabmed-date-time-picker
                outline
                :datetime="start_date"
                v-model="vaccine.date_given"
                :label="requiredFieldLabel('Date given', vaccine)"
                :rules="[v => !isFieldRequired('date_given', vaccine) || !!v || 'Required']"
              ></collabmed-date-time-picker>
            </v-col>

            <v-col cols="1">
              <v-text-field
                v-model="vaccine.lot_no"
                :label="requiredFieldLabel('Lot no', vaccine)"
                :rules="[v => !isFieldRequired('lot_no', vaccine) || !!v || 'Required']"
              ></v-text-field>
            </v-col>

            <v-col cols="2">
              <v-text-field
                v-model="vaccine.manufacturer"
                :label="requiredFieldLabel('Manufacturer', vaccine)"
                :rules="[v => !isFieldRequired('manufacturer', vaccine) || !!v || 'Required']"
              ></v-text-field>
            </v-col>

            <v-col cols="1">
              <v-btn text icon color="red" @click="removeVaccineRow(index)" small>
                <v-icon small>delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </div>
        <v-row style="justify-content:center;display:flex;margin-bottom:60px">
          <v-btn class="blue lighten-1" style="background-color: blue; color: white" @click="saveVaccineNotes">                                                  1 
            Save
          </v-btn>
        </v-row>
      </div>
    </v-card>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import vaccineNotes from "@evaluation/libs/vaccine_notes/VaccineNotes";

export default {
  data: () => ({
    start_date: '',
    loading: false,
    vaccineNotes: {
      vaccines: [] // Initialize as an empty array
    },
    search:'',
    vaccineNotesObject: new vaccineNotes(),
    vaccines: [
      { text: "HPV ", value: "hpv_vaccine" },
      { text: "Bacillus Calmette–Guérin (BCG)", value: "bcg_vaccine" },
      { text: "Polio Oral (Bivalent Oral Polio (bOPV))", value: "bopv_vaccine" },
      { text: "DIPHTHERIA TETANUS AND PERTUSSIS  (DPT)", value: "dpt_vaccine" },
      { text: "Hepatitis B", value: "hepatitis_b_vaccine" },
      { text: "HEMOPHILUS INFLUENZA B (Last 6 months)", value: "hemophilus_influenza_b_vaccine" },
      { text: "MEASLES RUBELLA VACCINE (MR)", value: "mr_vaccine" },
      { text: "Pentavalent Pneumovax", value: "pentavalent_pneumovax_vaccine" },
      { text: "Yellow Fever", value: "yellow_fever_vaccine" },
      { text: "Tetanus Toxoid ", value: "tetanus_toxoid_vaccine" },
      { text: "Rota Virus", value: "rota_virus_vaccine" },
      { text: "Covid-19", value: "covid_19_vaccine" },
      { text: "Inactivated Polio (IPV)", value: "ipv_vaccine" },
      { text: "DIPHTHERIA/PERTUSSIS/TETANUS/HEPATITIS B/HAEMOPHILUS INFLUENZA Type b", value: "dpt_hb_hib_vaccine" },
      { text: "PNEUMOCOCCAL CONJUGATE VACCINE (PCV)", value: "pcv_vaccine" }
    ],
    vaccine_venue: [
      { text: "This facility", value: "this_facility" },
      { text: "Another facility", value: "another_facility" }
    ],
    vaccine_required: [
      { text: "Yes (Vaccination card/Hospital record", value: "yes" },
      { text: "No", value: "no" }
    ],
    tested_after_patient_vaccination:[
      { text: "Yes", value: "yes" },
      { text: "No", value: "no" }
    ],
    after_test_results:[
      { text: "Positive", value: "positive" },
      { text: "Negative", value: "negative" }
    ],
    selectedVaccine: null,
    vaccineVenue: null,
    vaccineVerified: null,

  }),

  computed: {
    ...mapGetters({})
  },

  watch: {
    review(val) {
      this.loading = false;
      this.vaccineNotesObject.assemble(val);
    },
    selectedVaccine(newValue) {
  }
  },

  methods: {

    addVaccineRow() {
      if (this.selectedVaccine) {
        const selectedVaccineObject = this.vaccines.find(vaccine => vaccine.value === this.selectedVaccine);
        if (selectedVaccineObject) {
          this.vaccineNotes.vaccines.push({
            vaccine: selectedVaccineObject.text,
            lot_no: null,
            dose: null,
            manufacturer: null,
            date_given: null,
            required: this.vaccineVenue === 'this_facility',

          });
          this.selectedVaccine = null;
        }
      }
    },

    toggleRequiredVaccineFields() {
      this.vaccineNotes.vaccines.forEach(vaccine => {
        vaccine.required = this.vaccineVenue === 'this_facility';
      });
    },

    isFieldRequired(field, vaccine) {
      return vaccine.required;
    },

    requiredFieldLabel(label, vaccine) {
      return this.isFieldRequired(label.toLowerCase(), vaccine) ? `${label} *` : label;
    },

    saveVaccineNotes() {
      const vaccineData = this.vaccineNotes.vaccines.map(vaccine => ({
        vaccine: vaccine.vaccine,
        lot_no: vaccine.lot_no,
        dose: vaccine.dose,
        manufacturer: vaccine.manufacturer,
        date_given: vaccine.date_given,
        visit_id:this.vaccineNotesObject.visit_id,
        verified:this.vaccineVerified
      }));


      this.vaccineNotesObject.saveVaccines(vaccineData)
        .then(response => {

          this.$emit('appendVaccineNotes', vaccineData);

          // console.log('Data saved successfully:', response.data);
        })
        .catch(error => {
          console.error('Error saving data:', error);
        });
    },

    removeVaccineRow(index) {
      this.vaccineNotes.vaccines.splice(index, 1);
    },

    init() {
      this.setvaccineNotes({
        params: {
          visit_id: this.$route.params.visitId
        }
      });
    }
  },

  mounted() {
    this.vaccineNotesObject.visit_id = this.$route.params.visitId;
    this.init();
    document.querySelectorAll('.v-messages').forEach(e => e.remove());
  }
}
</script>



<style scoped>
label {
  font-weight: 400;
}

.v-input--selection-controls {
  margin-top: 0;
  padding-top: 0;
}
</style>
