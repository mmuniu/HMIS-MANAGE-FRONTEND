<template>
  <v-card flat>
    <v-card flat v-if="prescriptions && prescriptions.length > 0">
      <v-card-text>
        <v-row>
          <v-col cols="1" offset="1" class="black--text font-weight-black">
            #
          </v-col>
          <v-col cols="4" class="black--text font-weight-black text-center">Drug</v-col>
          <v-col cols="5" class="black--text font-weight-black text-center">Administer</v-col>
        </v-row>


        <!--        <v-row v-for="drug in prescriptions" :key="drug.id">-->
        <v-row  v-for="drug in drugs.prescriptions" :key="drug.prescription_id">

          <v-col cols="1" class="text-right" offset="1">
            <v-checkbox v-model="drug.selected"></v-checkbox>
          </v-col>
          <v-col cols="3">
            <v-subheader>{{ drug.name }}</v-subheader>
          </v-col>
          <v-col cols="3">
            <v-text-field
                label="Administering"
                type="number"
                :disabled="!drug.selected"
                :value="drug.administered"
                :max="drug.administered"
                @change="drugs.checkValidity(drug)"
                :min="1"
                v-model="drug.administered"
            ></v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field
                label="Notes"
                type="text"
                :disabled="!drug.selected"
                :value="drug.notes"             
                v-model="drug.notes"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn small color="primary" @click.once="save()">Record</v-btn>
    </v-card-actions>
  </v-card>

</template>
<script>
import { _ } from 'vue-underscore';
import AdministerDrugs from '@inpatient/libs/prescriptions/AdministerDrugs';

export default {
  props: {
    prescriptions: Array,
  },

  data: () => ({
    drugs: new AdministerDrugs(),
    selectAll: false,
  }),

  watch: {
    selectAll(val) {
      this.drugs.prescriptions.forEach(function(item, index) {
        item.selected = val;
      });

      // console.log(this.prescriptions);
    },
  },

  methods: {
    save() {
      if (this.prescriptions.length > 0) {
        this.drugs.save();
      } else {
        flash({
          message: 'Can\'t administer nothing',
          alert: 'warning',
        });
      }
    },

    initialise() {
  const data = this.prescriptions;
  const drugs_data = this.drugs;

  // Clear the prescriptions array to prevent duplication
  drugs_data.prescriptions = [];

  _.map(data, function(value) {
    // Check if administered is greater than 0 before pushing into the array
    if (value.can_administer > 0) {
      drugs_data.prescriptions.push({
        administered: value.can_administer,
        selected: false,
        max: value.can_administer,
        notes: value.notes,
        name: value.drug,
        prescription_id: value.id,
      });
    }
  });
},

  },
  mounted() {
    this.initialise();
  },

};
</script>

