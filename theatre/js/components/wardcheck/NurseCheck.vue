
<template>

  <div>
    <v-row  >
      <v-col cols="12" sm="6" md="4">
        <v-select v-model="nurse_check.requested_facility_id" label="Select a Facility to direct the request" outline class="mr-3"
                  :items="facilities" item-text="name" item-value="id" required
                  :error="errors.has('requested_facility_id')" :hint="errors.get('requested_facility_id')" persistent-hint @change="errors.clear('requested_facility_id')"
        ></v-select>
      </v-col>
      </v-row>
      <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-checkbox v-model="nurse_check.gown_and_socks" label="Gown and Socks"></v-checkbox>
    </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-checkbox v-model="nurse_check.wigs" label="Wig"></v-checkbox>
    </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-checkbox v-model="nurse_check.jewellery" label="Jewellery"></v-checkbox>
    </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-checkbox v-model="nurse_check.dentures" label="Dentures"></v-checkbox>
    </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-checkbox v-model="nurse_check.preparation" label="Preparation"></v-checkbox>
    </v-col>

    </v-row>



    <v-typography class="text-h5 font-weight-bold">I.V (Drips)</v-typography>
    <v-row>


      <v-col cols="12" sm="6" md="4">

        <v-text-field
                  v-model="nurse_check.urinalysis"
                  class="mr-2"
                  label="Urinalysis"
                  required></v-text-field>

      </v-col>
      <v-col cols="12" sm="6" md="4">

        <v-text-field
                  v-model="nurse_check.sugar"
                  class="mr-2"
                  label="Sugar"
                  required
                  :error="errors.has('sugar')" :hint="errors.get('sugar')" persistent-hint @change="errors.clear('sugar')"

          ></v-text-field>

      </v-col>
      <v-col cols="12" sm="6" md="4">

        <v-text-field
                  v-model="nurse_check.albumim"
                  class="mr-2"
                  label="Albumim"
                  required
                  :error="errors.has('albumim')" :hint="errors.get('albumim')" persistent-hint @change="errors.clear('albumim')"
          ></v-text-field>

      </v-col>

      <v-col cols="12" sm="12" md="12">
        <v-textarea label="Bladder Check and Urinary Catheter" required v-model="nurse_check.bladder_check_urinary_catheter" outline class="mr-3"
                    :error="errors.has('bladder_check_urinary_catheter')" :hint="errors.get('bladder_check_urinary_catheter')" persistent-hint @change="errors.clear('bladder_check_urinary_catheter')"
        ></v-textarea>
      </v-col>

      <v-col cols="12" sm="12" md="12">
        <v-textarea label="Gastric Tube" required v-model="nurse_check.gastric_tube" outline class="mr-3"
                    :error="errors.has('gastric_tube')" :hint="errors.get('gastric_tube')" persistent-hint @change="errors.clear('gastric_tube')"
        ></v-textarea>
      </v-col>

      <v-col cols="12" sm="6" md="4">

        <v-text-field
                  v-model="nurse_check.xrays"
                  class="mr-2"
                  label="X-rays"
                  required
                  :error="errors.has('xrays')" :hint="errors.get('xrays')" persistent-hint @change="errors.clear('xrays')"

          ></v-text-field>

          <!-- <v-textarea  v-model="nurse_check.bookingId" hidden></v-textarea> -->


          <!-- <input type="hidden" name="booking-id" :value="bookingId"> -->


      </v-col>
      <v-col cols="12" sm="6" md="4">

        <v-text-field
                  v-model="nurse_check.blood_available"
                  class="mr-2"
                  label="Number of Litres of Blood Available"
                  required
                  :error="errors.has('blood_available')" :hint="errors.get('blood_available')" persistent-hint @change="errors.clear('blood_available')"

          ></v-text-field>

      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-select v-model="nurse_check.consent_given" label="Consent Given" outline class="mr-3"
                  :items="yesNoOptions"  item-text="label"
                  item-value="value" required
                  :error="errors.has('consent_given')" :hint="errors.get('consent_given')" persistent-hint @change="errors.clear('consent_given')"
        ></v-select>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-select v-model="nurse_check.premedication_given" label="Premedication Given" outline class="mr-3"
                  :items="yesNoOptions"  item-text="label"
                  item-value="value" required
                  :error="errors.has('premedication_given')" :hint="errors.get('premedication_given')" persistent-hint @change="errors.clear('premedication_given')"
        ></v-select>
      </v-col>

    </v-row>

    <v-row>
      <v-btn type="submit" class="blue lighten-1" color="blue" @click.prevent="save" block large
             :dark="!saveLoader" :loading="saveLoader"  :disabled="isSubmitDisabled"
      >
        {{ nurse_check.booking_id ? 'Update Nurses Check' : buttonText }}
      </v-btn>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import NurseCheck from "@theatre/libs/wardcheck/NurseCheck";
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
      nurse_check:  new NurseCheck,
      saveLoader: false,
      date: new Date().toISOString().substr(0, 10),
      menu: false,
      modal: false,
      isSubmitDisabled:false
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
      return this.nurse_check.form.errors;
    },

    submitted() {
      return this.nurse_check.form.submitted;
    },

    contaminated() {
      return this.nurse_check.form.errorDetected;
    },
  },

  watch: {
    contaminated(value) {
      if (value) {
        this.saveLoader = false;
        this.nurse_check.form.errorDetected = false;
      }
    },

    submitted() {
      this.nurse_check.form.submitted = false;
      this.saveLoader = false;


      if (this.nurse_check.visit_id) {
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
      this.nurse_check.findForVisit(this.visitId);
    },

    save() {

      this.isSubmitDisabled = true;
      if (! this.nurse_check.requested_facility_id) {
        alert("Please select a Facility to continue");
        return;
      }
      if(this.nurse_check.urinalysis && this.nurse_check.sugar && this.nurse_check.albumim && this.nurse_check.bladder_check_urinary_catheter && this.nurse_check.gastric_tube && this.nurse_check.xrays && this.nurse_check.blood_available && this.nurse_check.consent_given && this.nurse_check.premedication_given) {
        this.saveLoader = true;

      this.nurse_check.visit_id = this.visitId;
      this.nurse_check.bookingId = this.bookingId;

      // console.log(this.nurse);
      this.isSubmitDisabled = false;

      this.nurse_check.save();
      }else{
        alert("Please fill all the required fields");
        this.isSubmitDisabled = false;

        return;

      }

  
    },
  },

  mounted() {

    console.log(this.bookingId);

    const url = `/api/theatre/schedule/nurses/check/`+this.bookingId;
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

                    // this.nurse_check = data;

                    // console.log(this.nurse_check);

                  })
                  .catch(error => {
                    // Handle errors
                    console.error('There was a problem with the fetch operation:', error);
                  });

    // /

    this.initialise();
  },
};
</script>

<style scoped lang="scss">

</style>
