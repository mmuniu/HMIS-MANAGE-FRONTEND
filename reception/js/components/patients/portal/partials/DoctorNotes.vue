<template>
    <v-container>
      <v-row>

        <v-col cols="12" v-if="!msetting('evaluation.disable_chief_complaints_on_doc_notes')">
          <v-textarea label="Chief complaints"
                      v-model="doctorNote.chief_complaints"
                      rows="3"
                      outlined
                      @change="doctorNote.save()">
          </v-textarea>
        </v-col>

        <v-dialog v-model="presentingComplaintsDialog"
                  persistent
                  max-width="1200">
          <template v-slot:activator="{ on }">
            <v-btn outlined  v-on="on" color="primary" class="mb-2">
              Presenting complaints
            </v-btn>
          </template>

          <v-card flat>
            <v-card-title>
              <v-spacer/>
              <v-btn small icon @click="closePresentingComplaintsDialog()">
                <v-icon small color="red">close</v-icon>
              </v-btn>
            </v-card-title>
            <presenting-complaints @appendPresentingComplaintsDoctorNotes="handlePresentingComplaints" @appendDiseaseDoctorsNotes="handlePresentingDisease"></presenting-complaints>

          </v-card>
        </v-dialog>

        <v-col cols="12">
          <v-textarea
              label="Presenting complaints"
              v-model="doctorNote.presenting_complaints"
              rows="3"
              outlined
              :disabled="isPresentingComplaintsAdded"
              @change="doctorNote.save()">
          </v-textarea>
               <!-- Your other content -->
               <v-chip
               v-if="disease"
               class="ma-2"
               color="red"
               text-color="white"
             >
            Suspected Illness: {{ disease }}
             </v-chip>
        </v-col>

        <v-col cols="12">
          <v-textarea label="Past medical history"
                      v-model="doctorNote.past_medical_history"
                      rows="3"
                      outlined
                      @change="doctorNote.save()">
          </v-textarea>
        </v-col>

        <v-col cols="12">
          <v-dialog v-model="systemReviewDialog"
                    persistent
                    max-width="1200">
            <template v-slot:activator="{ on }">
              <v-btn outlined  v-on="on" color="primary" class="mb-2">
                Systems Review
              </v-btn>
            </template>

            <v-card flat>
              <v-card-title>
                <v-spacer/>
                <v-btn small icon @click="closeSystemReviewDialog()">
                  <v-icon small color="red">close</v-icon>
                </v-btn>
              </v-card-title>

              <systems-review></systems-review>
            </v-card>
          </v-dialog>

          <v-textarea label="Systems Review"
                      v-model="doctorNote.systems_review"
                      rows="3"
                      outlined
                      @change="doctorNote.save()">
          </v-textarea>
        </v-col>

        <v-col cols="12">
          <v-dialog v-model="examinationReviewDialog"
                    persistent
                    max-width="1200">
            <template v-slot:activator="{ on }">
              <v-btn outlined  v-on="on" color="primary" class="mb-2">
                Examination Review
              </v-btn>
            </template>

            <v-card flat>
              <v-card-title>
                <v-spacer/>
                <v-btn small icon @click="closeExaminationReviewDialog()">
                  <v-icon small color="red">close</v-icon>
                </v-btn>
              </v-card-title>

              <examination-review></examination-review>
            </v-card>
          </v-dialog>

          <v-textarea label="Examination"
                      v-model="doctorNote.examination"
                      rows="3"
                      outlined
                      @change="doctorNote.save()">
          </v-textarea>
        </v-col>


        <v-col cols="12">
          <v-textarea label="Investigation history"
                      v-model="doctorNote.investigations"
                      rows="3"
                      outlined
                      @change="doctorNote.save()">
          </v-textarea>
        </v-col>

        <icd10 :visit-id="this.$route.params.visitId" style="width: 100%;"></icd10>
        <register_705 :visit-id="this.$route.params.visitId" style="width: 100%;">
        </register_705>
        <!--  v-if="msetting('evaluation.write_in_diagnosis')" -->
        <v-col cols="12" v-if="msetting('evaluation.write_in_diagnosis')" class="mt-2">
          <v-combobox
              outlined
              v-model="doctorNote.diagnosis"
              persistent-hint
              hint="Press tab after typing the diagnosis. (please only use this option when you can't find the diagnosis in the icd10 list)"
              :return-object="false"
              :items="[]"
              multiple chips
              @change="doctorNote.save()"
              label="Type in diagnosis"
          >
            <template v-slot:selection="data">
              <v-chip color="teal" :key="JSON.stringify(data.item)">
                {{ data.item }}
              </v-chip>
            </template>
          </v-combobox>
        </v-col>
        <v-row>
          <v-col cols="12">
            <!-- Textarea for Plan of Treatment / Management -->
            <v-textarea
                label="Plan of Treatment / Management"
                v-model="doctorNote.treatment_plan"
                rows="3"
                outlined
                @change="doctorNote.save()"
            ></v-textarea>
          </v-col>
        </v-row>

        <v-col cols="12">
          <p class="green--text">All changes are saved automatically</p>
        </v-col>
      </v-row>
    </v-container>
  </template>

  <script>
  import DoctorNote from '@evaluation/libs/notes/DoctorNote';
  import Icd10 from '@evaluation/libs/icd10/Icd10';
  import Register_705 from '@evaluation/libs/registers/Register_705';
  import { evaluationMixin } from '@evaluation/mixins/EvaluationMixin';
  import { mapActions, mapGetters } from 'vuex';
  import SystemsReview from "@evaluation/components/evaluation/actions/SystemsReview";
  import PresentingComplaints from "@evaluation/components/evaluation/actions/PresentingComplaints";

  import ExaminationReview from "@evaluation/components/evaluation/actions/ExaminationReview";


  export default {
    mixins: [
      evaluationMixin,
    ],



    components: {
      'systems-review': SystemsReview,
      'presenting-complaints': PresentingComplaints,
      'examination-review': ExaminationReview,
    },
    data() {
      return {
        doctorNote: new DoctorNote(),
        icd10: new Icd10(),
        Register_705: new Register_705(),
        model: null,
        systemReviewDialog: false,
        presentingComplaintsDialog: false,
        examinationReviewDialog: false,
        isPresentingComplaintsAdded: true,
        dangerSignsOptions: [
          { value: '1', text: 'Unable to drink or breastfeed' },
          { value: '2', text: 'Vomits everything' },
          { value: '3', text: 'Had convulsions in this illness' },
          { value: '4', text: 'Is lethargic or unconscious' },
          { value: '5', text: 'Is convulsing now' },
        ],
        suspectedMalariaCasesOptions: [
          { value: 'yes', text: 'Yes' },
          { value: 'no', text: 'No' },
        ],
        immunizationStatusOptions: [
          { value: 'Y', text: 'Yes' },
          { value: 'N', text: 'No' },
        ],
        TBScreeningOptions: [
          { value: '1', text: 'Presumed TB' },
          { value: '2', text: 'Not done' },
          { value: '3', text: 'Referred' },
        ],
        nutritionAndDieteticsOptions: [
          { value: '1', text: 'Nutrition Counseling' },
          { value: '2', text: 'Nutrition Therapeutic Supplements' },
          { value: '3', text: 'Dietetics' },
        ],
        allOtherTreatmentOptions: [
          { value: 'CPAP', text: 'Continuous Positive Airway Pressure (CPAP)' },
          { value: 'Other_Treatments', text: 'Record the name and formulation of ALL OTHER treatments prescribed that are NOT included in the tracer drugs column' },
        ],
        tracerDrugsOptions: [
          { value: 'ORS_Zinc', text: 'ORS & Zinc' },
          { value: 'ORS_only', text: 'ORS only' },
          { value: 'Zinc_only', text: 'Zinc only' },
          { value: 'Vitamin_A', text: 'Vitamin A' },
          { value: 'Amox_DT', text: 'Amox DT' },
          { value: 'Oxygen', text: 'Oxygen' },
          { value: 'Albendazole', text: 'Albendazole' },
          { value: 'IV_fluids', text: 'IV fluids' },
        ],
        malariaSymptomsOptions: [
          { value: 'Presenting with symptoms but NOT tested', text: 'Presenting with symptoms but NOT tested' },
          { value: 'RDT Tested (-ve)', text: 'RDT Tested (-ve)' },
          { value: 'Microscopy Tested (-ve)', text: 'Microscopy Tested (-ve)' },
          { value: 'RDT Tested (+ve)', text: 'RDT Tested (+ve)' },
          { value: 'Microscopy Tested (+ve)', text: 'Microscopy Tested (+ve)' },
        ],
        disease: null
      };
    },

    computed: {
      ...mapGetters([
        'getNote', 'getDoctorsNotes',
      ]),

      term() {
        return this.icd10.search.term;
      },

      variation() {
        return this.icd10.variation;
      },

      variations() {
        return this.getNote().data;
      },
    },

    watch: {
      term(value) {
        if (value) {
          if (value.length > 2) {
            if (value.charAt(1) === '-') {
              this.icd10.searchByCode();
            } else {
              this.icd10.searchByName();
            }
          } else {
            this.icd10.search.reset();
          }
        }
      },

      variation(value) {
        if (value && this.variations ) {
          this.updatePatientConditions(value);
          this.variations.push(this.icd10Transformer(value));
          this.icd10.search.results = [];
          this.icd10.variation = null;
        }
      },

      visit(value) {
        this.doctorNote.visit = value.id;
        this.doctorNote.populate(value.doctor_notes);
      },

      getDoctorsNotes(val) {
        console.log(val);
        this.doctorNote.populate(val);
      },
    },

    methods: {
      ...mapActions([
        'setNote', 'setDoctorsNotes',
      ]),

      closeSystemReviewDialog() {
        this.systemReviewDialog = false;
        this.fetchNotes();
      },

      handlePresentingComplaints(presentingData) {
        // Append each item to presenting_complaints textarea on a new line
        if (this.doctorNote.presenting_complaints === null){
          this.doctorNote.presenting_complaints = '';
        }
        // Append each item to presenting_complaints textarea on a new line
        presentingData.forEach(item => {
          this.doctorNote.presenting_complaints += `${item.symptom}, ${item.duration} days, ${item.onset}\n`;
        });

        this.closePresentingComplaintsDialog();
        this.isPresentingComplaintsAdded = false;
        this.doctorNote.save();

      },

      handlePresentingDisease(presentingData) {

        this.disease = presentingData;

        this.closePresentingComplaintsDialog();
        this.isPresentingComplaintsAdded = false;

      },

      closePresentingComplaintsDialog(){
        this.presentingComplaintsDialog = false;
      },

      closeExaminationReviewDialog() {
        this.examinationReviewDialog = false;
        this.fetchNotes();
      },

      icd10Transformer(value) {
        const data = {
          variation: { name: value.name, code: value.code },
        };
        return data;
      },

      showVariation() {
        // let isVariationShowed = (this.variations.length > 0);
        // if(!isVariationShowed)
        //     window.$emit("isIcd10Set");
        return (this.variations.length > 0);
      },

      remove(variation) {
        this.icd10.deletePatientId10Condition(variation, this.$route.params.visitId);
        this.variations.splice(this.variations.indexOf(variation), 1);
        this.icd10.variation = null;
      },

      updatePatientConditions(variation) {
        this.icd10.insertPatientId10Condition(variation, this.$route.params.visitId);
      },

      fetchNotes() {
        this.setDoctorsNotes({
          params: {
            visit_id: this.$route.params.visitId,
          },
        });
      }
    },

    mounted() {
      this.setNote({
        params: {
          visit_id: this.$route.params.visitId,
        },
      });

    if (this.doctorNote.presenting_complaints !== null ||  this.doctorNote.presenting_complaints !== ''){
          this.isPresentingComplaintsAdded = false;
        };
    },
  };
  </script>

  <style scoped>

  </style>
