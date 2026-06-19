<template>
  <collabmed-loading v-if="loading"></collabmed-loading>
  <div v-else>
    <v-card flat class="px-3">

      <v-card-title>
        <h4 style="text-decoration: underline"
            class="pt-6 pl-2"> Presenting complaints </h4>
        <v-spacer/>
        <!-- <v-btn small color="primary" @click="printForm()">
             print form
         </v-btn>-->
      </v-card-title>

      <div class="mx-4">
        <!-- residence -->
        <v-row>
          <v-col cols="4">
            <v-autocomplete
                :items="symptoms"
                label="What is the symptom"
                v-model="selectedSymptom"
                @change="addSymptomRow"
            ></v-autocomplete>
          </v-col>

        </v-row>

        <div v-for="(symptom, index) in presentingComplaints.symptoms" :key="index">
          <v-row>
            <v-col cols="4">
              <v-text-field
                  v-model="symptom.text"
                  label="Symptom"
                  readonly
              ></v-text-field>
            </v-col>

            <v-col cols="2">
              <v-select
                  :items="durationOptions"
                  v-model="symptom.duration"
                  label="Duration (days)"
              ></v-select>
            </v-col>

            <v-col cols="4">
              <v-select
                  :items="['Gradual', 'Sudden']"
                  v-model="symptom.onset"
                  label="Onset"
              ></v-select>
            </v-col>

            <v-col cols="2">

              <v-btn text icon color="red" @click="removeSymptomRow(index)" small>
                <v-icon small>delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </div>

          <v-row v-if="disease">
            <v-col cols="12">
              <!-- Render the response data here -->
              <p>Data saved successfully: {{ disease }}</p>
            </v-col>
          </v-row>

        <v-row style="justify-content:center;display:flex">
          <v-btn class="blue lighten-1" style="background-color: blue; color: white;" @click="savePresentingComplaints">
            Save
          </v-btn>
        </v-row>
      </div>
    </v-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import presentingComplaints from "@evaluation/libs/presenting_complaints/PresentingComplaints";

export default {
  data: () => ({
    loading: false,
    durationOptions: Array.from({ length: 24 }, (_, i) => i + 1),
    presentingComplaints: {
      symptoms: [] // Initialize as an empty array
    },
    presentingComplaintsObject : new presentingComplaints(),
    symptoms: [],
    selectedSymptom: null,
    symptom:[],
    disease : null
  }),

  computed: {
    ...mapGetters({}),
  },

  watch: {
    review(val) {
      this.loading = false;
      this.presentingComplaintsObject.assemble(val);
    }
  },

  methods: {
    ...mapActions(['setpresentingComplaints']),

    addSymptomRow() {
      if (this.selectedSymptom) {
        const selectedSymptomObject = this.symptoms.find(symptom => symptom.value === this.selectedSymptom);
        if (selectedSymptomObject) {
          this.presentingComplaints.symptoms.push({
            text: selectedSymptomObject.text,
            duration: null,
            onset: null
          });
          this.selectedSymptom = null;
        }
      }
    },

    async savePresentingComplaints() {
      // Here you can handle the data as needed. For example, sending it to an API endpoint.
      // const response = await fetch(`/api/evaluation/tb/screening/update/${this.visitId}`);

      const presentingData = this.presentingComplaints.symptoms.map(symptom => ({
        symptom: symptom.text,
        duration: symptom.duration,
        onset: symptom.onset
      }));



      this.presentingComplaintsObject.saveData(presentingData)
          .then(response => {

            this.diseases = response;
            this.$emit('appendPresentingComplaintsDoctorNotes',presentingData)
            if(this.disease !== 'Unknown Disease')
          {
            this.$emit('appendDiseaseDoctorsNotes',this.diseases)
          }


          })
          .catch(error => {
            console.error('Error saving data:', error);
          });
    },

    removeSymptomRow(index) {
      this.presentingComplaints.symptoms.splice(index, 1);
    },

    async fetchSymptoms() {
      try {
        const response = await this.presentingComplaintsObject.fetchSymptoms();

        this.symptoms = response.map(symptom => ({
          value: symptom.id,
          text: symptom.name
        }));
      } catch (error) {
        console.error("Error fetching symptoms:", error);
      }
    },

    toPresentableFormat(stringType) {
      const type = stringType.replace(/_/g, " ");
      return type.charAt(0).toUpperCase() + type.slice(1);
    },

    init() {
      this.setpresentingComplaints({
        params: {
          visit_id: this.$route.params.visitId
        }
      });
    }
  },

  mounted() {
    this.presentingComplaintsObject.visit_id = this.$route.params.visitId;
    this.init();
    this.fetchSymptoms();
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
