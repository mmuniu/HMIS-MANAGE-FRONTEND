<template>
  <div>
      <v-row >
          <v-col cols="6">
              <v-card class="mr-3">
                  <v-card-text>
                      <!-- <doctor-notes></doctor-notes> -->
                      <evaluation-tb-and-malaria></evaluation-tb-and-malaria>
                  </v-card-text>
              </v-card>
          </v-col>

          <v-col cols="6">
              <v-expansion-panels
                      v-model="panel"
              >


                  <v-expansion-panel>
                      <v-expansion-panel-header>View vitals</v-expansion-panel-header>
                      <v-expansion-panel-content>
                          <vitals :vitals-to-show="vitalsToShow" :meta-vitals-to-show="metaVitalsToShow"></vitals>
                      </v-expansion-panel-content>
                  </v-expansion-panel>
              </v-expansion-panels>
          </v-col>
      </v-row>

  </div>
</template>

<script>
import DoctorNotes from './partials/notes/DoctorNotes';
import Vitals from "@evaluation/components/evaluation/actions/Vitals";

export default {
  components: {
      'doctor-notes': DoctorNotes,
      'vitals': Vitals,
  },

  data: () => ({
      panel: 0,
  }),

  computed: {

      initialised() {
          return true;
      },

      vitalsToShow () {
          return [
              'weight', 'height', 'bp_systolic', 'bp_diastolic', 'pulse', 'bmi',
              'temperature', 'respiration', 'nurse_notes', 'current_medication',
          ]
      },

      metaVitalsToShow() {
          return [
              'allergies', 'chronic_illnesses', 'medical_history', 'family_history',
              'social_history'
          ]
      }
  },

  mounted() {
      if(this.msetting('evaluation.vitals_panel_in_doc_notes_open_by_default_instead_of_prescription_panel')) {
          this.panel = 1;
      }
  }
};
</script>
