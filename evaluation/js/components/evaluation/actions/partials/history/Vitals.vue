<template>
  <div>
    <h5 class="headline" style="font-weight: bold; text-decoration: underline">Vitals</h5>

    <v-container fluid v-if="vitals">
      <v-row >

        <v-col sm="4">
          <table class="table">
            <tbody>
            <tr>
              <td class="text-bold">Weight</td>
              <td>{{ vitals.weight }} <span class="grey--text">Kgs</span></td>
            </tr>
            <tr>
              <td class="text-bold">Height</td>
              <td>{{ vitals.height }} <span class="grey--text">meters</span></td>
            </tr>
            <tr>
              <td class="text-bold">Hip</td>
              <td>{{ vitals.hip }}</td>
            </tr>
            <tr>
              <td class="text-bold">BMI</td>
              <td><span class="grey--text">N/A</span></td>
            </tr>
            <tr>
              <td class="text-bold">BMI Status</td>
              <td><span class="grey--text">N/A</span></td>
            </tr>
            <tr>
              <td class="text-bold">Waist/Hip Ratio</td>
              <td><span class="grey--text">N/A</span></td>
            </tr>

            </tbody>
          </table>
        </v-col>

        <v-col sm="4">
          <table class="table">
            <tbody>
            <tr>
              <td class="text-bold">BP Systolic</td>
              <td>{{ vitals.bp_systolic }} <span class="grey--text">mm/hg</span></td>
            </tr>
            <tr>
              <td class="text-bold">BP Diastolic</td>
              <td>{{ vitals.bp_diastolic }} <span class="grey--text">mm/hg</span></td>
            </tr>
            <tr>
              <td class="text-bold">Pulse</td>
              <td>{{ vitals.bp_diastolic }} <span class="grey--text">per min</span></td>
            </tr>
            <tr>
              <td class="text-bold">Respiration</td>
              <td>{{ vitals.respiration }} <span class="grey--text">per min</span></td>
            </tr>
            <tr>
              <td class="text-bold">Temperature</td>
              <td>{{ vitals.temperature }} <span class="grey--text">celcius</span></td>
            </tr>

            <tr>
              <td class="text-bold">Temperature Location</td>
              <td>{{ vitals.temperature_location }}</td>
            </tr>

            </tbody>
          </table>
        </v-col>

        <v-col sm="4">
          <table class="table">
            <tbody>
            <tr>
              <td class="text-bold">Oxygen</td>
              <td>{{ vitals.oxygen }}</td>
            </tr>
            <tr>
              <td class="text-bold">Blood Sugar</td>
              <td>{{ vitals.blood_sugar }}</td>
            </tr>
            <tr>
              <td class="text-bold">Blood Sugar Unit</td>
              <td>{{ vitals.blood_sugar_unit }}</td>
            </tr>
            <tr>
              <td class="text-bold">Nurse Notes</td>
              <td>{{ vitals.nurse_notes }}</td>
            </tr>
            </tbody>
          </table>
        </v-col>

        <v-col sm="12">
          <p class="teal--text"><strong>Recorded on:</strong> {{ vitals.created_at }}</p>
          <p class="teal--text"><strong>Recorded by:</strong> {{ vitals.user ? vitals.user.full_name : '-' }}</p>
        </v-col>

      </v-row>
    </v-container>


    <v-alert v-else :value="true" type="info">
      No data found
    </v-alert>

  </div>

</template>

<script>
export default {
  props: ['items'],

  computed: {
    vitals() {
      return this.items;
    },
  },

};
</script>

<style scoped>
</style>
