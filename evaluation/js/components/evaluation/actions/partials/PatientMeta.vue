<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 07/11/2018
* Time: 11:26
* Project: platform
-->

<template>
  <v-row  class="px-2 py-2" :class="backgroundColor" v-if="initialised">
    <v-col cols="12" class="relative pt-2">
      <p class="blue--text" v-if="disabled">Click the button on the right to <strong>Enable Editing</strong> <i class="fa fa-arrow-right"></i></p>
      <p>Last updated by: <strong>{{ patientMeta.last_updated_by }}</strong></p>

      <v-btn fab dark small absolute right :class="[disabled ? 'blue' : 'green']" top @click="toggle">
        <v-icon dark small v-if="disabled">edit</v-icon>
        <v-icon dark small v-if="!disabled">check</v-icon>
      </v-btn>
    </v-col>

    <v-col :cols="12">
      <p v-if="!can('evaluation.view-patient-medical-history')" class="grey--text">Unauthorized to view medical history</p>
      <v-textarea v-else
                  label="Ocular history"
                  outline
                  :readonly="disabled"
                  v-model="patientMeta.ocular_history"
                  @change="save">
      </v-textarea>
    </v-col>

    <v-col :cols="12" v-if="can('evaluation.view-patient-covid-vaccinations')">
      <v-select label="Vaccinated against covid"
                :items="['No', 'Yes']"
                :readonly="disabled"
                v-model="patientMeta.covid_vaccinated.state"
                @change="save">
      </v-select>
    </v-col>
    <v-col :cols="12" >

      <p  class="grey--text">Vaccination history</p>
      <v-textarea
          label="Vaccination history"
          outline
          v-model="patientMeta.vaccination_history"
        >
      </v-textarea>


      <v-dialog v-model="immunizationDialog"
                persistent
                max-width="1200">
        <template v-slot:activator="{ on }">
          <v-btn outlined  v-on="on" color="primary" class="mb-2">
            Immunization notes
          </v-btn>
        </template>

        <v-card flat>
          <v-card-title>
            <v-spacer/>
            <v-btn small icon @click="closeVaccineNotesDialog()">
              <v-icon small color="red">close</v-icon>
            </v-btn>
          </v-card-title>
          <vaccine-notes @appendVaccineNotes="handleImmunizationNotes"></vaccine-notes>
        </v-card>
      </v-dialog>
    </v-col>

    <v-col :cols="12" v-if="patientMeta.covid_vaccinated.state === 'Yes'">
      <v-select label="Dose"
                :items="['Moderna', 'Astrazeneca', 'Pfizer', 'Johnson and Johnson']"
                v-model="patientMeta.covid_vaccinated.dose"
                @change="save">
      </v-select>
    </v-col>

    <v-col :cols="12" v-if="patientMeta.covid_vaccinated.state === 'Yes'">
      <v-select label="Number of doses"
                :items="[1, 2]"
                v-model="patientMeta.covid_vaccinated.number_of_doses"
                @change="save">
      </v-select>
    </v-col>

    <v-col :cols="12" v-if="showComponent('food_allergies')">
      <p v-if="!can('evaluation.view-patient-food-allergies')" class="grey--text">Unauthorized to view Food Allergies</p>
      <v-textarea v-else
                  label="Food allergies"
                  placeholder="Leave blank if no food allergies"
                  outline
                  :readonly="disabled"
                  v-model="patientMeta.food_allergies"
                  @change="save">
      </v-textarea>
    </v-col>

    <v-col :cols="12" v-if="showComponent('drug_allergies')">
      <p v-if="!can('evaluation.view-patient-drug-allergies')" class="grey--text">Unauthorized to view Drug Allergies</p>
      <v-textarea v-else
                  label="Drug allergies"
                  placeholder="Leave blank if no drug allergies"
                  outline
                  :readonly="disabled"
                  v-model="patientMeta.drug_allergies"
                  @change="save">
      </v-textarea>
    </v-col>

    <v-col :cols="12" v-if="showComponent('chronic_illnesses')">
      <p v-if="!can('evaluation.view-patient-chronic-illnesses')" class="grey--text">Unauthorized to view Chronic Illnesses</p>
      <v-textarea v-else
                  label="Chronic Illnesses"
                  outline
                  :readonly="disabled"
                  v-model="patientMeta.chronic_illnesses"
                  @change="save">
      </v-textarea>
    </v-col>

    <v-col :cols="12" v-if="showComponent('medical_history')">
      <p v-if="!can('evaluation.view-patient-medical-history')" class="grey--text">Unauthorized to view medical history</p>
      <v-textarea v-else
                  label="Medical history"
                  outline
                  :readonly="disabled"
                  v-model="patientMeta.medical_history"
                  @change="save">
      </v-textarea>
    </v-col>

    <v-col :cols="12" v-if="showComponent('family_history')">
      <p v-if="!can('evaluation.view-patient-family-history')" class="grey--text">Unauthorized to view family history</p>
      <v-textarea v-else
                  label="Family history"
                  outline
                  :readonly="disabled"
                  v-model="patientMeta.family_history"
                  @change="save">
      </v-textarea>
    </v-col>

    <v-col :cols="12" v-if="showComponent('social_history')">
      <p v-if="!can('evaluation.view-patient-social-history')" class="grey--text">Unauthorized to view social history</p>
      <v-textarea v-else
                  label="Social history"
                  outline
                  :readonly="disabled"
                  v-model="patientMeta.social_history"
                  @change="save">
      </v-textarea>
    </v-col>

    <v-col cols="12" v-if="showComponent('blood_group')">
      <v-select :items="bloodTypes" item-text="name" item-value="value" label="Blood Group" v-model="patientMeta.blood_group" @change="save" :readonly="disabled"></v-select>
    </v-col>


    <v-col cols="12"  v-if="showComponent('rhesus_factor')">
      <v-select :items="rhFactorStatuses" item-text="name" item-value="value" label="Rhesus Factor" v-model="patientMeta.rhesus_factor" @change="save" :readonly="disabled"></v-select>
    </v-col>

    <v-col cols="12"  v-if="showComponent('hiv_status')">
      <p v-if="!can('evaluation.view-patient-hiv-status')" class="grey--text">Unauthorized to view HIV Status</p>
      <v-select v-else :items="hivStatuses" item-text="name" item-value="value" label="HIV Status" v-model="patientMeta.hiv_status" @change="save" :readonly="disabled"></v-select>
    </v-col>

    <v-col cols="12"  v-if="showComponent('allergies')">
      <p v-if="!can('evaluation.view-patient-allergies')" class="grey--text">Unauthorized to view Allergies</p>
      <v-textarea v-else label="Allergies" v-model="patientMeta.allergies" outline @change="save" :readonly="disabled"></v-textarea>
      <!--<p class="title mt-4">Allergies</p>-->
      <!--<tiny-mce id="allergies" v-model="allergies"  v-on:change="allergies = $event" :toolbar="'bullist numlist | fullscreen print'"></tiny-mce>-->
    </v-col>

    <v-col cols="12"  v-if="showComponent('chronic_illnesses')">
      <p v-if="!can('evaluation.view-patient-chronic-illnesses')" class="grey--text">Unauthorized to view Chronic Illnesses</p>
      <v-textarea label="Chronic Illnesses" v-model="patientMeta.chronic_illnesses" outline @change="save" :readonly="disabled"></v-textarea>
      <!--<p class="title mt-4">Chronic Illnesses</p>-->
      <!--<tiny-mce id="chronicIllnesses" v-model="chronicIllnesses"  v-on:change="chronicIllnesses = $event" :toolbar="'bullist numlist | fullscreen print'"></tiny-mce>-->
    </v-col>

    <v-col cols="12"  v-if="showComponent('medical_history')">
      <p v-if="!can('evaluation.view-patient-medical-history')" class="grey--text">Unauthorized to view medical history</p>
      <v-textarea label="Medical history" v-model="patientMeta.medical_history" outline @change="save" :readonly="disabled"></v-textarea>
    </v-col>

    <v-col cols="12"  v-if="showComponent('family_history')">
      <p v-if="!can('evaluation.view-patient-family-history')" class="grey--text">Unauthorized to view family history</p>
      <v-textarea label="Family history" v-model="patientMeta.family_history" outline @change="save" :readonly="disabled"></v-textarea>
    </v-col>

    <v-col cols="12"  v-if="showComponent('social_history')">
      <p v-if="!can('evaluation.view-patient-social-history')" class="grey--text">Unauthorized to view social history</p>
      <v-textarea label="Social history" v-model="patientMeta.social_history" outline @change="save" :readonly="disabled"></v-textarea>
    </v-col>
    <v-col cols="12">
      <p class="green--text"><v-icon color="green" small>check_circle</v-icon> All changes are autosaved</p>
    </v-col>
  </v-row>
</template>

<script>
import Meta from '@evaluation/libs/patientmeta/Meta';
import VaccineNotes from "@evaluation/components/evaluation/actions/VaccineNotes";

export default {
  props: {
    patientId: {
      required: true,
    },
    backgroundColor: {
      default: 'white',
    },
    metaVitalsToShow: {
      type: Array,
    }
  },
  components: {
    'vaccine-notes': VaccineNotes
  },
  data() {
    return {
      patientMeta: new Meta(),
      allergies: '',
      chronicIllnesses: '',
      immunizationDialog: false,
      isImmunizationNotesAdded:true,
      disabled: true,
      hivStatuses: [
        { name: 'Positive', value: 'positive' },
        { name: 'Negative', value: 'negative' },
      ],
      bloodTypes: [
        { name: 'A', value: 'a' },
        { name: 'B', value: 'b' },
        { name: 'AB', value: 'ab' },
        { name: 'O', value: 'o' },
      ],
      rhFactorStatuses: [
        { name: 'Rh-negative', value: '-' },
        { name: 'Rh-positive', value: '+' },
      ],
    };
  },

  computed: {
    initialised() {
      return this.patientMeta && this.patientId;
    },

  },

  watch: {
    allergies(value) {
      this.patientMeta.allergies = value;
      this.save();
    },

    chronicIllnesses(value) {
      this.patientMeta.chronic_illnesses = value;
      this.save();
    },
  },

  methods: {
    save() {
      return this.patientMeta.save(this.patientId);
    },

    showComponent (component)  {
      if(this.metaVitalsToShow && this.metaVitalsToShow.length > 0) {
        return this.metaVitalsToShow.includes(component);
      } else {
        return true;
      }
    },

    handleImmunizationNotes(immunizationData) {

      if(this.patientMeta.vaccination_history == null){
        this.patientMeta.vaccination_history = '';
      }
      immunizationData.forEach(item => {
        this.patientMeta.vaccination_history += `Vaccine: ${item.vaccine}, Dose: ${item.dose}, Manufacturer: ${item.manufacturer}, Date Given ${item.date_given} \n`;
      });
      this.closeImmunizationDialog();
      this.isImmunizationNotesAdded = false;
      immunizationData.forEach(item => {

        this.patientMeta.vaccination_history += `Vaccine: ${item.vaccine}, Dose: ${item.dose}, Manufacturer: ${item.manufacturer}, Date Given ${item.date_given} \n`;
      });

    this.save();
    },

  

    closeVaccineNotesDialog(){
      this.immunizationDialog = false;

    },
    closeImmunizationDialog(){
      this.immunizationDialog = false;
    },

    setup() {
      return this.patientMeta.get(this.patientId);
    },

    toggle() {
      this.disabled = !this.disabled;
    },
  },

  mounted() {
    this.setup();

  },
};
</script>

<style scoped lang="scss">
.bordered {
  padding: 0.5em;
  border-color: #0097fa;
}
.relative {
  position: relative;
}
</style>
