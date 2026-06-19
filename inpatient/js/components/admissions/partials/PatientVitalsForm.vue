<template>
    <div class="panel-body">
      <form @submit.prevent="submitForm" id="vitals-form" class="row">
        <input type="hidden" name="visit_id" :value="visit">
        <input type="hidden" name="user_id" :value="user">
        <input type="hidden" name="admission_id" :value="visit">
        <div class="col-md-4">
          <div class="form-group">
            <label for="date_recorded">Date Recorded</label>
            <input type="date" name="date_recorded" v-model="dateRecorded" class="form-control">
          </div>
        </div>
        <div class="col-md-2">
          <div class="form-group">
            <label for="time_recorded">Time Recorded</label>
            <input type="time" name="time_recorded" v-model="timeRecorded" class="form-control">
          </div>
        </div>

        <!-- Other form fields go here with Vue.js v-model bindings -->

        <div class="col-md-6">
          <div class="form-group">
            <label for="waist">Waist Circumference:[cm]</label>
            <input type="number" name="waist" v-model="waist" class="form-control">
          </div>
        </div>

        <!-- Repeat the structure for other form fields -->

        <div class="col-md-6">
          <div class="form-group">
            <label for="temperature">Temperature:[Celsius]</label>
            <input type="text" name="temperature" v-model="temperature" class="form-control" required>
          </div>
        </div>

        <div class="col-md-6">
          <div class="form-group">
            <label for="temperature_location">Temperature Location</label>
            <select name="temperature_location" v-model="temperatureLocation" class="form-control">
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
            <input type="number" name="oxygen" v-model="oxygen" class="form-control" required>
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
    },
    data() {
        return {
            currentUser: {},
            dateRecorded: '',
            timeRecorded: '',
            waist: null,
            temperature: '',
            temperatureLocation: 'Oral',
            oxygen: null,
        };
    },
    methods: {
        submitForm() {
        },
    },
};
</script>
