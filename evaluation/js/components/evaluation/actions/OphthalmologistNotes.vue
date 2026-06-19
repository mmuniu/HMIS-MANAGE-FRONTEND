<template>
  <div>

      <v-expansion-panels
          v-model="panel"
          multiple
      >
          <!--     Preliminary Exam       -->
          <v-expansion-panel>
              <v-expansion-panel-header>
                 <v-row>
                     <v-col cols="4">
                         <div class="panel-header">
                             Preliminary Exam
                         </div>
                     </v-col>
                 </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                  <refraction-base></refraction-base>
              </v-expansion-panel-content>
          </v-expansion-panel>


          <v-expansion-panel>
              <v-expansion-panel-header>
                  <v-row>
                      <v-col cols="4">
                          <div class="panel-header">
                              Notes and treatment
                          </div>
                      </v-col>
                  </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                  <v-row>
                      <v-col cols="6">
                          <v-card class="mr-3" flat>
                              <v-card-text>
                                  <v-textarea
                                      label="Presenting complaints"
                                      v-model="ophthalmologist.notes.presenting_complaints"
                                      rows="3"
                                      outlined
                                      @change="ophthalmologist.saveNotes()">
                                  </v-textarea>

                                  <v-textarea label="Ocular history"
                                              v-model="ophthalmologist.notes.ocular_history"
                                              rows="3"
                                              outlined
                                              @change="ophthalmologist.saveNotes()">
                                  </v-textarea>

                                  <v-textarea label="Past medical history"
                                              v-model="ophthalmologist.notes.past_medical_history"
                                              rows="3"
                                              outlined
                                              @change="ophthalmologist.saveNotes()">
                                  </v-textarea>

                                  <v-textarea v-model="ophthalmologist.notes.additional_examination"
                                              outlined
                                              @change="ophthalmologist.saveNotes()"
                                              label="Additional Examination">
                                  </v-textarea>


            
                                  <v-textarea label="Comments and Remarks"
                                              v-model="ophthalmologist.notes.comments"
                                              rows="3"
                                              outlined
                                              @change="ophthalmologist.saveNotes()">
                                  </v-textarea>

                                  <follow-up></follow-up>

                                  <counselling-discussion></counselling-discussion>
                              </v-card-text>
                          </v-card>
                      </v-col>
                      <v-col cols="6">
                          <v-expansion-panels
                              v-model="prePanels"
                              multiple
                          >
                              <v-expansion-panel>
                                  <v-expansion-panel-header>
                                      <v-row>
                                          <v-col cols="4">
                                              <div class="panel-header">
                                                  Slit Lamp exam
                                              </div>
                                          </v-col>
                                      </v-row>
                                  </v-expansion-panel-header>
                                  <v-expansion-panel-content>
                                      <slit-lamp-exam></slit-lamp-exam>
                                  </v-expansion-panel-content>
                              </v-expansion-panel>

                              <v-expansion-panel>
                                  <v-expansion-panel-header>
                                      <v-row>
                                          <v-col cols="4">
                                              <div class="panel-header">
                                                  Pharmacy prescription
                                              </div>
                                          </v-col>
                                      </v-row>
                                  </v-expansion-panel-header>
                                  <v-expansion-panel-content>
                                      <prescribe-drugs is-of-type="outpatient"
                                                       :show-for-admission="true">
                                      </prescribe-drugs>
                                  </v-expansion-panel-content>
                              </v-expansion-panel>

                              <v-expansion-panel>
                                  <v-expansion-panel-header>
                                      <v-row>
                                          <v-col cols="4">
                                              <div class="panel-header">
                                                  Vitals and nursing notes
                                              </div>
                                          </v-col>
                                      </v-row>
                                  </v-expansion-panel-header>
                                  <v-expansion-panel-content>
                                      <vitals :show-refraction="false"
                                              :meta-vitals-to-show="metaVitalsToShow"></vitals>
                                  </v-expansion-panel-content>
                              </v-expansion-panel>

                          </v-expansion-panels>
                      </v-col>
                  </v-row>
              </v-expansion-panel-content>
          </v-expansion-panel>


          <!--     refraction       -->
          <v-expansion-panel>
              <v-expansion-panel-header>
                  <v-row>
                      <v-col cols="4">
                          <div class="panel-header">
                              Refraction
                          </div>
                      </v-col>
                  </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                  <v-row>
                      <v-col cols="12">
                          <refraction-view></refraction-view>
                      </v-col>
                  </v-row>
              </v-expansion-panel-content>
          </v-expansion-panel>


        <!--     Drawing       -->
          <v-expansion-panel>
              <v-expansion-panel-header>
                  <v-row>
                      <v-col cols="4">
                          <div class="panel-header">
                              Documentation & Drawing
                          </div>
                      </v-col>
                  </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                  <div>
                        <drawing-canvas></drawing-canvas>
                    <media-upload :visitId="visit_id"></media-upload>
                  </div>
              </v-expansion-panel-content>
          </v-expansion-panel>

          <!--     Pharmacy prescription       -->
          <v-expansion-panel>
              <v-expansion-panel-header>
                  <v-row>
                      <v-col cols="4">
                          <div class="panel-header">
                              List of prescribed drugs
                          </div>
                      </v-col>
                  </v-row>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                  <v-row  class="mt-4">
                      <v-col cols="12">
                          <evaluation-prescriptions-index></evaluation-prescriptions-index>
                      </v-col>
                  </v-row>
              </v-expansion-panel-content>
          </v-expansion-panel>
      </v-expansion-panels>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Vitals from '@evaluation/components/evaluation/actions/Vitals';
import OphthalmologistObj from '@evaluation/libs/Ophthalmologist/Ophthalmologist';
import Investigations from '@evaluation/components/evaluation/actions/Investigations';
import Treatment from '@evaluation/components/evaluation/actions/Treatment';
import RefractionBase from '@evaluation/components/evaluation/actions/partials/RefractionBase';
import CounsellingDiscussion from '@evaluation/components/evaluation/actions/partials/notes/CounsellingDiscussion';
import FollowUp from '@evaluation/components/evaluation/actions/partials/notes/FollowUp';
import SlitLampExam from '@evaluation/components/evaluation/actions/partials/notes/SlitLampExam';
import RefractionForm from '@evaluation/components/evaluation/actions/partials/RefractionForm';
import DrawingCanvas from '@evaluation/components/evaluation/actions/partials/DrawCanvas';
import CorrectionForm from '@evaluation/components/evaluation/actions/partials/CorrectionForm';
import MediaUpload from './partials/MediaUpload';

export default {
    components: {
        MediaUpload,
        'vitals': Vitals,
        'Investigations': Investigations,
        'Treatment': Treatment,
        'RefractionBase': RefractionBase,
        'CounsellingDiscussion': CounsellingDiscussion,
        'FollowUp': FollowUp,
        'slit-lamp-exam': SlitLampExam,
        'RefractionView': RefractionForm,
        'DrawingCanvas': DrawingCanvas,
        'CorrectionView': CorrectionForm,
    },

    data: () => ({
        panel: [0, 1, 4],
        prePanels: [0],
        procedurePanels: false,
        ophthalmologist: new OphthalmologistObj(),
        visit_id: null,
    }),

    computed: {
        ...mapGetters([
            'getNote'
        ]),

        initialised() {
            return true;
        },

        vitalsToShow() {
            return [
                'weight', 'height', 'bp_systolic', 'bp_diastolic', 'pulse', 'bmi',
                'temperature', 'respiration', 'nurse_notes', 'current_medication',
            ];
        },

        metaVitalsToShow() {
            return [
                'allergies', 'chronic_illnesses', 'medical_history', 'family_history',
                'social_history',
            ];
        },
    },

    watch: {
        getOphthalmologyNotes(val) {
            if (val) {
                this.ophthalmologist.assembleNotes(val);
            }
        },
    },

    methods: {
        ...mapActions([
       ]),

        init() {
          
        },

        async fetchNotes() {
          try {
              const params = {
                  visit_id: this.$route.params.visitId, // Getting visitId from the route params
              };
              // Check if the response has the expected structure
              const response = await this.ophthalmologist.fetchNotes(params); 

             if (response) {
            // Ensure `notes` is reactive
            if (!this.ophthalmologist.notes) {
                this.$set(this.ophthalmologist, 'notes', {});
            }

            // Populate the fields, ensuring Vue detects the changes
            this.$set(this.ophthalmologist.notes, 'presenting_complaints', response.presenting_complaints || '');
            this.$set(this.ophthalmologist.notes, 'ocular_history', response.ocular_history || '');
            this.$set(this.ophthalmologist.notes, 'past_medical_history', response.past_medical_history || '');
            this.$set(this.ophthalmologist.notes, 'additional_examination', response.additional_examination || '');
            this.$set(this.ophthalmologist.notes, 'diagnosis', response.diagnosis ? JSON.parse(response.diagnosis) : []);
            this.$set(this.ophthalmologist.notes, 'treatment_plan', response.treatment_plan || '');
            this.$set(this.ophthalmologist.notes, 'comments', response.comments || '');
            this.$forceUpdate();
        }
          } catch (error) {
              console.error('Error fetching slit lamp data:', error);
          }
       }
    },


    mounted() {
        if (this.msetting('evaluation.vitals_panel_in_doc_notes_open_by_default_instead_of_prescription_panel')) {
            this.panel = 1;
        }
        this.visit_id = this.$route.params.visitId;
        this.fetchNotes()

        this.ophthalmologist.visit_id = this.$route.params.visitId;
        this.init();

    },
};
</script>
<style scoped>
input {
  padding: 0 10px;
  margin: 3px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.v-input--selection-controls {
  margin-top: 0;
  padding-top: 0;
}

.panel-header {
  background-color: orange;
  color: black;
  clip-path: polygon(0 1%, 90% 0%, 100% 100%, 0% 100%);
  padding: 15px 20px;
}

.v-expansion-panel-header {
  padding: 0
}
</style>
