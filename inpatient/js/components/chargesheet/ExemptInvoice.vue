<template>
  <v-dialog v-model="exemptDialog" width="800" persistent>

    <template v-slot:activator="{ on }">
      <v-btn color="green" small dark v-on="on" v-if="!msetting('finance.disable_exempt_button')" >
        <v-icon>close</v-icon> {{ label }}
      </v-btn>
    </template>

    <v-card>

      <v-card-title class="text-h5 purple white--text" primary-title>

        {{ invoice ? 'Exempt' : 'Exempt' }}

        <v-spacer></v-spacer>

        <v-btn icon dark @click.native="close" absolute right>
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-container >

          <div >
            <v-row>
              <v-col class="px-2" cols="12" sm="4">
                <label>Invoice Amount:</label>
                <span>{{ invoiceAmount }}</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="px-2" cols="12" sm="4">

                <v-text-field
                    v-model="exempt.amount"
                    outline
                    label="Amount to exempt"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>

          <v-row >
            <v-col class="px2" cols="12">
              <v-btn small color="primary" @click="addExemption()">
                <v-icon small color="white">close</v-icon>
                exempt
              </v-btn>
            </v-col>
          </v-row>
        </v-container>

        <br/>

      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { _ } from 'vue-underscore';
import { mapActions, mapGetters } from 'vuex';
import Exempt from '@inpatient/libs/chargesheet/Exempt';

export default {
  name: 'ExemptInvoice',

  props: {
    visitId: {
      required: true,
    },
    invoice: {
      type: String,
      default: null,
    },
    invoiceAmount: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: 'Exempt',
    },
  },
  data: () => ({
    exemptDialog: false,
    exempt: new Exempt,
    loading: false,
  }),

  computed: {

  },

  methods: {


    close() {
      this.exemptDialog = false;
    },

    async addExemption() {
      const response = this.exempt.exemptInvoice( this.invoice, this.visitId, this.exempt.amount);


      if (response) {
        this.close();
        this.initialize();
      }
    },


    initialize() {
      // this.fetchInsurances();

    },
  },

  mounted() {
    this.initialize();
  },
};
</script>

<style scoped>

</style>
