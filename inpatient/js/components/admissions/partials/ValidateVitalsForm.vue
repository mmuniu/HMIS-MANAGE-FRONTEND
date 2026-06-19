<template>
  <div class="panel-body">
    <form @submit.prevent="submitForm" id="vitals-form" class="row">
      <input type="hidden" name="visit_id" :value="vitalsObj.visit">
      <input type="hidden" name="user_id" :value="vitalsObj.user">
      <input type="hidden" name="admission_id" :value="vitalsObj.visit">
      <div class="col-md-4">
        <div class="form-group">
          <label for="date_recorded">Date Recorded</label>
          <input type="date" name="date_recorded" v-model="vitalsObj.date_recorded" class="form-control">
        </div>
      </div>
      <div class="col-md-2">
        <div class="form-group">
          <label for="time_recorded">Time Recorded</label>
          <input type="time" name="time_recorded" v-model="vitalsObj.time_recorded" class="form-control">
        </div>
      </div>

      <!-- Other form fields go here with Vue.js v-model bindings -->

      <div class="col-md-6">
        <div class="form-group">
          <label for="waist">Waist Circumference:[cm]</label>
          <input type="number" name="waist" v-model="vitalsObj.waist_circumference" class="form-control">
        </div>
      </div>

      <div class="col-md-6">
        <div class="form-group">
          <div class="row" style="padding: 15px 0px;">
            <div class="col-md-6">
              <label for="waist">Weight:[Kgs]</label>
            </div>
            <div class="col-md-6">
              <div :class="bmiClass" v-if="bmiLabel">
                <v-chip v-if="showChip" :color="chipColor" text-color="white" small>{{ chipText }}</v-chip>
              </div>
            </div>
          </div>

          <input type="number" name="waist" v-model="vitalsObj.weight" class="form-control">
        </div>
      </div>

      <div class="col-md-6">
        <div class="form-group">
          <label for="waist">Hip Circumference:[cm]</label>
          <input type="number" name="waist" v-model="vitalsObj.hip_circumference" class="form-control">
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-group">
          <label for="waist">Height:[{{ vitalCMMeasurement }}]</label>
          <input type="number" name="waist" v-model="vitalsObj.height" class="form-control">
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-group">
          <label for="waist">Blood Sugar</label>
          <input type="number" name="waist" v-model="vitalsObj.blood_sugar" class="form-control">
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-group">
          <label for="bp_systolic">BP Systolic (mm/hg)</label>
          <input type="number" name="bp_systolic" v-model="vitalsObj.bp_systolic" class="form-control">
        </div>
      </div>

      <div class="col-md-6">
        <div class="form-group">
          <label for="bp_diastolic">BP Diastolic (mm/hg)</label>
          <input type="number" name="bp_diastolic" v-model="vitalsObj.bp_diastolic" class="form-control">
        </div>
      </div>

      <div class="col-md-6">
        <div class="form-group">
          <div class="row">
            <div class="col-md-6">
              <label for="bp_diastolic">Blood Sugar Units</label>
            </div>
            <!-- Render chip indicating blood pressure status -->
            <div class=" col-md-6 chip" :class="{ 'high': isHighBP, 'low': !isHighBP }">
              <v-chip v-if="showChip" :color="chipColor" text-color="white" small>{{ chipText }}</v-chip>

            </div>
          </div>
          <input type="number" name="bp_diastolic" v-model="vitalsObj.blood_sugar_units" class="form-control">
        </div>
      </div>


      <div class="col-md-6">
        <div class="form-group">
          <label for="bp_diastolic">Allergies</label>
          <input type="number" name="bp_diastolic" v-model="vitalsObj.allergies" class="form-control">
        </div>
      </div>


      <div class="col-md-6">
        <div class="form-group">
          <label for="bp_diastolic">Pulse:[Per Min]</label>
          <input type="text" name="bp_diastolic" v-model="vitalsObj.pulse_per_min" class="form-control">
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-group">
          <label for="temperature">Chronic Illnesses</label>
          <input type="text" name="temperature" v-model="vitalsObj.chronic_illnesses" class="form-control" required>
        </div>
      </div>
      <div class="col-md-6">
        <div class="form-group">
          <label for="temperature">Respiration:[Per min]</label>
          <input type="text" name="respiration" v-model="vitalsObj.chronic_illnesses" class="form-control" required>
        </div>
      </div>

      <div class="col-md-6">
        <div class="form-group">
          <label for="temperature_location">Temperature Location</label>
          <select name="temperature_location" v-model="vitalsObj.temperature_location" class="form-control">
            <option value="Oral">Oral</option>
            <option value="Tympanic Membrane">Tympanic Membrane</option>
            <option value="Axillary">Axillary</option>
            <option value="Temporal Artery">Temporal Artery</option>
            <option value="Rectal">Rectal</option>
          </select>
        </div>
      </div>

      <!-- Repeat the structure for other form fields -->

      <div class="col-md-6">
        <div class="form-group">
          <label for="oxygen">Oxygen Saturation:[%]</label>
          <input type="number" name="oxygen" v-model="vitalsObj.oxygen" class="form-control" required>
        </div>
      </div>

      <div class="col-md-6">
        <div class="form-group">
          <button type="submit" class="btn btn-primary col-md-4">Record Vitals</button>
        </div>
      </div>

    </form>
  </div>
</template>

<script>
import VitalsForm from '@inpatient/libs/admissions/ValidateVitalsForm';

// Validate Diastolic Blood Pressure

export default {

  props: {
    visit: {
      default() {
        return {};
      },
    },
    admission: {
      default() {
        return {};
      },
    },
    user: {
      default() {
        return {};
      },

    },
    age: {
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      vitalsObj: new VitalsForm(),
      vitalCMMeasurement: null, // Initialize it to null for now
      systolicError: null,
      diastolicError: null,
      isHighBP: false,
      isLowBP: false,
      bpShowChip: false,
      bpChipColor: '',
      bpChipText: '',
      respirationError: '',
      respirationShowChip: false,
      respirationChipColor: '',
      respirationChipText: '',
    };
  },
  created() {
    const useCentimetres = this.msetting('evaluation.use_centimetres_instead_of_metres_under_vitals');
    this.vitalCMMeasurement = useCentimetres ? 'cm' : 'm';
  },
  computed: {
    bmi() {
      if (!this.vitalsObj.weight || this.age <= 0 || this.vitalsObj.height <= 0) return null;

      const weight = this.vitalsObj.weight;
      let heightInMeter;

      if (this.vitalCMMeasurement === 'cm') {
        heightInMeter = this.vitalsObj.height / 100;
      } else {
        heightInMeter = this.vitalsObj.height;
      };

      return weight / (heightInMeter * heightInMeter);
    },
    bmiLabel() {
      if (!this.bmi) return null;

      if (this.age <= 5) {
        if (this.bmi < 14) return 'Underweight';
        else if (this.bmi >= 14 && this.bmi < 18) return null; // Normal weight for children
        else return 'Overweight';
      } else if (this.age >= 6 && this.age <= 18) {
        if (this.bmi < 18.5) return 'Underweight';
        else if (this.bmi >= 18.5 && this.bmi < 25) return null; // Normal weight for teenagers
        else return 'Overweight';
      } else {
        if (this.bmi < 18.5) return 'Underweight';
        else if (this.bmi >= 18.5 && this.bmi < 24) return null; // Normal weight for adults
        else return 'Overweight';
      }
    },
    bmiClass() {
      return {
        'text-danger': this.bmiLabel === 'Underweight',
        'text-warning': this.bmiLabel === 'Overweight',
      };
    },
    showChip() {
      return this.bmiLabel === 'Underweight' || this.bmiLabel === 'Overweight';
    },
    chipText() {
      return this.bmiLabel === 'Underweight' ? 'Underweight' : 'Overweight';
    },
    chipColor() {
      return this.bmiLabel === 'Underweight' ? 'yellow' : 'red';
    },

    minSystolicValue() {
      // Logic to calculate min systolic value based on age
      if (this.age >= 1 && this.age < 3) {
        return 86;
      } else if (this.age >= 3 && this.age < 6) {
        return 90;
      } else if (this.age >= 6 && this.age < 12) {
        return 90;
      } else if (this.age >= 13) {
        return 102;
      } else {
        return 65;
      }
    },
    maxSystolicValue() {
      // Logic to calculate max systolic value based on age
      if (this.age >= 1 && this.age < 3) {
        return 107;
      } else if (this.age >= 3 && this.age < 6) {
        return 110;
      } else if (this.age >= 6 && this.age < 12) {
        return 121;
      } else if (this.age >= 13) {
        return 124;
      } else {
        return 105;
      }
    },
    minDiastolicValue() {
      // Logic to calculate min diastolic value based on age
      if (this.age >= 1 && this.age < 3) {
        return 41;
      } else if (this.age >= 3 && this.age < 6) {
        return 47;
      } else if (this.age >= 6 && this.age < 12) {
        return 59;
      } else if (this.age >= 13) {
        return 64;
      } else {
        return 37;
      }
    },
    maxDiastolicValue() {
      // Logic to calculate max diastolic value based on age
      if (this.age >= 1 && this.age < 3) {
        return 78;
      } else if (this.age >= 3 && this.age < 6) {
        return 75;
      } else if (this.age >= 6 && this.age < 12) {
        return 80;
      } else if (this.age >= 13) {
        return 80;
      } else {
        return 65;
      }
    },
  },
  methods: {
    submitForm() {
    },
    validateSystolicValue(value, age) {
      if (!value) {
        return 'Please enter BP Systolic';
      }

      let minValue; let maxValue;
      const fieldValue = parseInt(value);

      if (age >= 1 && age < 3) {
        minValue = 86;
        maxValue = 107;
      } else if (age >= 3 && age < 6) {
        minValue = 90;
        maxValue = 110;
      } else if (age >= 6 && age < 12) {
        minValue = 90;
        maxValue = 121;
      } else if (age >= 13) {
        minValue = 102;
        maxValue = 124;
      } else {
        minValue = 65;
        maxValue = 105;
      }

      if (fieldValue < minValue || fieldValue > maxValue) {
        return 'BP Systolic normal range is between ' + minValue + ' and ' + maxValue;
      }

      return null;
    },
    validateDiastolicValue(value, age) {
      if (!value) {
        return 'Please enter BP Diastolic';
      }

      let minValue; let maxValue;
      const fieldValue = parseInt(value);

      if (age >= 1 && age < 3) {
        minValue = 41;
        maxValue = 78;
      } else if (age >= 3 && age < 6) {
        minValue = 47;
        maxValue = 75;
      } else if (age >= 6 && age < 12) {
        minValue = 59;
        maxValue = 80;
      } else if (age >= 13) {
        minValue = 64;
        maxValue = 80;
      } else {
        minValue = 37;
        maxValue = 65;
      }

      if (fieldValue < minValue || fieldValue > maxValue) {
        return 'BP Diastolic normal range is between ' + minValue + ' and ' + maxValue;
      }

      return null;
    },
    validateSystolic() {
      this.systolicError = this.validateSystolicValue(this.vitalsObj.bp_systolic, this.age);
      this.updateBPStatus();
    },
    validateDiastolic() {
      this.diastolicError = this.validateDiastolicValue(this.vitalsObj.bp_diastolic, this.age);
      this.updateBPStatus();
    },
    updateBPStatus() {
      // Check if there is an error due to invalid values
      const hasInvalidValues = this.systolicError !== null || this.diastolicError !== null;

      // Check if systolic and diastolic values are higher than normal range
      const isHighSystolic = this.vitalsObj.bp_systolic && parseInt(this.vitalsObj.bp_systolic) > this.maxSystolicValue;
      const isHighDiastolic = this.vitalsObj.bp_diastolic && parseInt(this.vitalsObj.bp_diastolic) > this.maxDiastolicValue;

      // Check if systolic and diastolic values are lower than normal range
      const isLowSystolic = this.vitalsObj.bp_systolic && parseInt(this.vitalsObj.bp_systolic) < this.minSystolicValue;
      const isLowDiastolic = this.vitalsObj.bp_diastolic && parseInt(this.vitalsObj.bp_diastolic) < this.minDiastolicValue;

      // Set isHighBP based on the presence of invalid values and both systolic and diastolic values being higher than normal range
      this.isHighBP = hasInvalidValues && isHighSystolic && isHighDiastolic;

      // Set isLowBP based on the presence of invalid values and either systolic or diastolic value being lower than normal range
      this.isLowBP = !this.isHighBP && hasInvalidValues && (isLowSystolic || isLowDiastolic);

      // Set values for displaying blood pressure status chip
      if (this.isHighBP) {
        this.bpShowChip = true;
        this.bpChipColor = 'red';
        this.bpChipText = 'High Blood Pressure';
      } else if (this.isLowBP) {
        this.bpShowChip = true;
        this.bpChipColor = 'blue';
        this.bpChipText = 'Low Blood Pressure';
      } else {
        // Reset chip display
        this.bpShowChip = false;
        this.bpChipColor = ''; // Reset chip color
        this.bpChipText = ''; // Reset chip text
      }
    },

    validateRespiration() {
      this.respirationError = this.validateRespirationValue(this.vitalsObj.respiratory_rate);
      this.updateRespirationStatus();
    },
    validateRespirationValue(value) {
      if (!value) {
        return 'Please enter Respiration Rate';
      }

      // Add logic to validate the respiration rate value
      // For example, check if it falls within a certain range

      return null; // Return null if validation passes
    },
    updateRespirationStatus() {
      // Implement logic to determine whether the respiration rate is high, low, or normal
      // Set values for displaying the v-chip accordingly
      // For example:
      // this.respirationShowChip = true;
      // this.respirationChipColor = 'red';
      // this.respirationChipText = 'High Respiration Rate';
    },
  },
};
</script>

