<template>
  <!-- checkout dialog -->
  <v-dialog v-model="checkoutDialog" persistent max-width="30%" >

    <template v-slot:activator="{ on }">
      <button v-on="on" class="btn btn-xs btn-sm" :class="color"> CHECKOUT</button>
    </template>

    <v-card>
      <v-card-title class="headline primary">Checkout patient</v-card-title>

      <v-card-text class="py-4">
        Are you sure you want to checkout the patient.
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary darken-1"
               @click="checkoutPatient()">Yes</v-btn>
        <v-btn color="error darken-1" @click="checkoutDialog = false">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import Visit from '@reception/libs/visits/Visit';

export default {
  props: [
    'id', 'from', 'clinic', 'color',
  ],

  data() {
    return {
      visitObj: new Visit,
      checkoutDialog: false,
    };
  },

  methods: {
    async checkoutPatient() {
      this.visitObj.checkoutData.id = this.id;
      this.visitObj.checkoutData.from = this.from;

      const response = await this.visitObj.checkoutPatient();

      if (response) {
        this.checkoutDialog = false;

        window.open(`/evaluation/queue/${this.from}?facility=${this.clinic}`, '_self');
      }
    },
  },
};
</script>
