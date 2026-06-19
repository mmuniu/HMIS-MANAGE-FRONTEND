
<template>

  <div>
    <v-row  >
      <v-col cols="12" sm="6" md="4">
        <v-select v-model="doctor_check.requested_facility_id" label="Select a Facility to direct the request" outline class="mr-3"
                  :items="facilities" item-text="name" item-value="id"
                  :error="errors.has('requested_facility_id')" :hint="errors.get('requested_facility_id')" persistent-hint @change="errors.clear('requested_facility_id')"
        ></v-select>
      </v-col>
      </v-row>
      <v-row  >
      <v-col cols="12" sm="6" md="4">
        <v-select v-model="doctor_check.hydration_normal" label="Hydration Normal?" outline class="mr-3"
                  :items="yesNoOptions"  item-text="label"
                  item-value="value"
                  :error="errors.has('hydration_normal')" :hint="errors.get('hydration_normal')" persistent-hint @change="errors.clear('hydration_normal')"
        ></v-select>
      </v-col>

      <v-col cols="12" sm="6" md="4">

        <v-text-field
                  v-model="doctor_check.hb"
                  class="mr-2"
                  label="Hb(Gram %)"

          ></v-text-field>

      </v-col>

      <v-col cols="12" sm="6" md="4">

        <v-text-field
                  v-model="doctor_check.PVC"
                  class="mr-2"
                  label="PVC(%)"

          ></v-text-field>

      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-select v-model="doctor_check.electrolyte_normal" label="Is the Electrolytes Normal?" outline class="mr-3"
                  :items="yesNoOptions"  item-text="label"
                  item-value="value"
                  :error="errors.has('electrolyte_normal')" :hint="errors.get('electrolyte_normal')" persistent-hint @change="errors.clear('electrolyte_normal')"
        ></v-select>
      </v-col>

      <v-col cols="12" sm="6" md="4">

        <v-text-field
                  v-model="doctor_check.temp"
                  class="mr-2"
                  label="Temparature( C)"

          ></v-text-field>

      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-select v-model="doctor_check.chest_normal" label="Is the Chest Normal?" outline class="mr-3"
                  :items="yesNoOptions"  item-text="label"
                  item-value="value"
                  :error="errors.has('chest_normal')" :hint="errors.get('chest_normal')" persistent-hint @change="errors.clear('chest_normal')"
        ></v-select>
      </v-col>


      <v-col cols="12" sm="6" md="4">

        <v-text-field
                  v-model="doctor_check.bp_systolic"
                  class="mr-2"
                  label="Bp Systolic( MmHg)"

          ></v-text-field>

      </v-col>

      <v-col cols="12" sm="6" md="4">

        <v-text-field
                  v-model="doctor_check.diastolic"
                  class="mr-2"
                  label="Diastolic( MmHg)"

          ></v-text-field>

      </v-col>

      <v-col cols="12" sm="6" md="4">

        <v-text-field
                  v-model="doctor_check.pulse"
                  class="mr-2"
                  label="Pulse( /min)"

          ></v-text-field>

      </v-col>


      <v-col cols="12" sm="6" md="4">
        <v-select v-model="doctor_check.relevant_medical_preoperative_preparation_completed" label="Relevant medical preoperative preparation completed?" outline class="mr-3"
                  :items="yesNoOptions"  item-text="label"
                  item-value="value"
                  :error="errors.has('relevant_medical_preoperative_preparation_completed')" :hint="errors.get('relevant_medical_preoperative_preparation_completed')" persistent-hint @change="errors.clear('relevant_medical_preoperative_preparation_completed')"
        ></v-select>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-select v-model="doctor_check.patient_fit_operation" label="Is patient fit for operation" outline class="mr-3"
                  :items="yesNoOptions"  item-text="label"
                  item-value="value"
                  :error="errors.has('patient_fit_operation')" :hint="errors.get('patient_fit_operation')" persistent-hint @change="errors.clear('patient_fit_operation')"
        ></v-select>
      </v-col>

      <v-col cols="12" sm="6" md="4">

        <v-text-field
                  v-model="doctor_check.blood_available"
                  class="mr-2"
                  label="Blood Available( Litres)"

          ></v-text-field>

      </v-col>


      <v-col cols="12" sm="6" md="4">
        <v-select v-model="doctor_check.consent_given" label="Has Consent Been Given?" outline class="mr-3"
                  :items="yesNoOptions"  item-text="label"
                  item-value="value"
                  :error="errors.has('consent_given')" :hint="errors.get('consent_given')" persistent-hint @change="errors.clear('consent_given')"
        ></v-select>
      </v-col>

    </v-row>

    <v-row>
      <v-btn type="submit" class="blue lighten-1" color="blue" @click.prevent="save" block large
             :dark="!saveLoader" :loading="saveLoader" :disabled="saveLoader"
      >
        {{ doctor_check.visit_id ? 'Update Nurses Check' : buttonText }}
      </v-btn>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import DoctorCheck from "@theatre/libs/wardcheck/DoctorCheck";
import _ from "lodash";

export default {
  props: {
    visitId: {
      required: true,
    },

    bookingId:
    {
      required:true
    },

    buttonText: {
      type: String,
      default: "Place Nurses Check",
    },
  },

  data() {
    return {
      doctor_check: new DoctorCheck,
      saveLoader: false,
      date: new Date().toISOString().substr(0, 10),
      menu: false,
      modal: false,
    };
  },

  computed: {
    ...mapGetters([
      "getTheatreDeposits", "getFacilities",
    ]),

     yesNoOptions() {
      return [
        { label: 'Yes', value: true },
        { label: 'No', value: false }
      ];
    },

    facilities() {
      return this.getFacilities.facilities;
    },

    errors() {
      return this.doctor_check.form.errors;
    },

    submitted() {
      return this.doctor_check.form.submitted;
    },

    contaminated() {
      return this.doctor_check.form.errorDetected;
    },
  },

  watch: {
    contaminated(value) {
      if (value) {
        this.saveLoader = false;
        this.doctor_check.form.errorDetected = false;
      }
    },

    submitted() {
      this.doctor_check.form.submitted = false;
      this.saveLoader = false;

      if (this.doctor_check.visit_id) {
        // an admission request exists
        this.$emit("saved");
      }
    },
  },

  methods: {
    ...mapActions([
      "setTheatreDeposits", "setFacilities",
    ]),

    initialise() {
      this.setTheatreDeposits();
      this.setFacilities();
      this.doctor_check.findForVisit(this.visitId);
    },

    save() {
      if (! this.doctor_check.requested_facility_id) {
        alert("Please select a Facility to continue");
        return;
      }

      this.saveLoader = true;

      this.doctor_check.visit_id = this.visitId;
      this.doctor_check.booking_id = this.bookingId;

      // console.log(this.doctor);

      this.doctor_check.save();
    },
  },

  mounted() {

    this.initialise();
    const url = `/api/theatre/schedule/doctors/check/`+this.bookingId;
    fetch(url, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      // You can add additional headers if needed
                    },

                  })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error('Network response was not ok');
                    }
                    return response.json(); // Parse the JSON response
                  })
                  .then(data => {
                    // Handle the response data

                    // console.log(data);

                    this.doctor_check = data;

                    console.log(this.doctor_check);

                  })
                  .catch(error => {
                    // Handle errors
                    console.error('There was a problem with the fetch operation:', error);
                  });
  },
};
</script>

<style scoped lang="scss">

</style>
