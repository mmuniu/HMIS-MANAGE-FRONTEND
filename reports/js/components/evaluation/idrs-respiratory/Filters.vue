<template>
  <v-card class="pa-0" color="transparent" flat>
      <v-card-text class="py-0 my-0">
          <v-row  >
              <v-col cols="12" md="2">
                  <div class="mx-2">
                      <v-autocomplete
                              :items="facilities.facilities"
                              outline
                              v-model="filters.facility_id"
                              color="blue-grey lighten-2"
                              label="Select Facility"
                              item-text="name"
                              clearable
                              @click:clear="facilityCleared"
                              item-value="id"
                              @input="facilitySelected"
                      ></v-autocomplete>
                  </div>
              </v-col>


              <v-col cols="12" md="2">
                  <div class="mx-2">
                    <v-autocomplete
                    :items="diseases"
                    outline
                    v-model="filters.disease"
                    color="blue-grey lighten-2"
                    label="Select a Disease"
                    item-text="text"
                    clearable
                    item-value="text"
            ></v-autocomplete>
                  </div>
              </v-col>



              <v-col md="2">
                  <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
              </v-col>

              <v-col md="2">
                  <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
              </v-col>

          </v-row>
          <v-row  >

              <v-col>
                  <v-btn @click="filter()" class="v-btn v-btn--small theme--light primary" color="success">filter</v-btn>
                  <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>

                  <v-btn @click="collect_sample()" class="v-btn v-btn--small theme--light primary" color="success">Collect Sample</v-btn>
                </v-col>
          </v-row>
      </v-card-text>
      <v-container>


        <!-- Modal Dialog -->
        <v-dialog v-model="showModal" max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">Sample Collection Form</span>
            </v-card-title>
            <v-card-text>
              <!-- Form inside the modal -->
              <v-form>
                <v-row>
                  <!-- First Dropdown -->

                  <v-col cols="12" sm="6">
                    <v-autocomplete
                      v-model="selectedPatient"
                      :items="patientName"
                      item-text="patient_name"
                      item-value="id"
                      label="Select Patient"
                      outlined
                      dense
                    ></v-autocomplete>
                  </v-col>


                  <!-- Second Dropdown -->
                  <!-- <v-col cols="12" sm="6" v-if="selectedPatient"> -->
                    <!-- <v-autocomplete
                      v-model="selectedDisease"
                      :items="diseases"
                      item-text="text"
                      item-value="value"
                      label="Select Disease Diagnosis"
                      outlined
                      dense
                    ></v-autocomplete> -->
                    <!-- </v-col> -->

                </v-row>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn color="green darken-1" text @click="submitForm">
                Submit
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
  </v-card>

</template>

<script>
import { mapActions, mapGetters } from "vuex";
import _ from "lodash";
import moment from "moment";

export default {
  props: {
      obj: {
          required: true,
          type: Object,
      },
  },

  data() {
      return {
          filename: "diseases & diagnosis analysis",
          loading: false,
          search: "",
          selectedPatient: null,
          showModal: false, // Controls the visibility of the modal
          patientName: [],
          disease: null,
          diseases: [
                { text: "Influenza Like Illness(ILI)", value: "ILI" },
                { text: "Severe Acute Respiratory Illness(SARI)", value: "SARI" },
          ],
          filters: {
            start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:mm'),
            end_date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
              disease: null,
              user_id: "",
              written_diagnosis: null,
              variation_id: null,
              facility_id: null,
          },
      };
  },

  computed: {
      ...mapGetters({
          facilities: "getFacilities",
      }),

      url() {
          return "/api/reports/module/evaluation/idrs-respiratory";
      },
  },

  methods: {
      ...mapActions([
          "setFacilities",
      ]),

      diseaseSelected(disease) {
        console.log(disease);
          this.filters.disease = disease.disease;
      },



      facilitySelected(facility) {
          this.filters.facility_id = facility;
      },

      facilityCleared() {
          this.filters.facility_id = null;
      },

      setDoctor(user) {
          this.filters.user_id = user.id;
      },

      clearedDoctor() {
          this.filters.user_id = null;
      },

      setStartDate(datetime) {
          this.filters.start_date = datetime;
      },
      setEndDate(datetime) {
          this.filters.end_date = datetime;
      },

      filter() {
          this.obj.filters = _.omitBy(this.filters, _.isNil);
          console.log(this.obj.filters);

          this.$emit("filter");
      },



      async collect_sample() {


         this.showModal = true;
         const response = await fetch("/api/evaluation/visit/symptoms");
         const data = await response.json();
         this.patientName = data;
         console.log(this.patientName);
      },

      submitForm()
      {
           const data = {
        visit_symptom_id: this.selectedPatient,
        // disease: this.selectedDisease
      };

      // Send the POST request using fetch
      fetch('/api/evaluation/collect/sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(responseData => {
          flash("Data saved successfully");
          console.log('Data saved successfully:', responseData);
          // Handle the response as needed

        })
        .catch(error => {
          console.error('Error saving data:', error);
        });
        // console.log(this.selectedDisease);
      }


  },

  mounted() {
      this.setFacilities();
      console.log(this.disease);
  },
};
</script>
