<template>
  <div>
    <h5 class="headline " style="font-weight: bold; text-decoration: underline">Visit</h5>
    <v-row>
      <v-col sm="6">
        <table class="table">
          <tbody>
          <tr>
            <td><strong>Clinic:</strong></td>
            <td>{{ visit.clinic.name }}</td>
          </tr>
          <tr>
            <td><strong>Destinations:</strong></td>
            <td>{{ visit.queued_at | ucwords }}</td>
          </tr>
          <tr>
            <td><strong>Patient Name:</strong></td>
            <td>{{ visit.patient.full_name }}</td>
          </tr>
          <tr>
            <td><strong>Mobile:</strong></td>
            <td>{{ visit.patient.mobile }}</td>
          </tr>
          <tr>
            <td><strong>Date:</strong></td>
            <td>{{ visit.created_at }}</td>
          </tr>
          <tr>
            <td><strong>Meta:</strong></td>
            <td>
              <v-chip v-if="visit.admission" color="primary" text-color="white" small>Inpatient</v-chip>
              <v-chip v-if="visit.operation" color="red" text-color="white" small>Theatre</v-chip>
            </td>
          </tr>
          </tbody>
        </table>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  props: ['items'],

  computed: {
    visit() {
      return this.items;
    },
  },

};
</script>

<style scoped>
</style>
