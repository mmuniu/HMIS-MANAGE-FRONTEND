<template>

  <v-container>
    <v-dialog v-model="doctorNoteDialog" width="70%" persistent>
      <v-card>
        <v-card-title class="text-h5 white--text teal" primary-title>
          Doctor's Notes

          <v-spacer></v-spacer>

          <v-btn icon dark @click.prevent="doctorNoteDialog=false" absolute right>
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-5" style="margin-top:30px">
          <v-row>
            <!-- Left Column for Notes -->
            <v-col cols="6">
              <p><b>Presenting complaints</b></p>
              <p>{{ notes.presentingComplaints }}</p>

              <p><b>Past medical history</b></p>
              <p>{{ notes.pastMedicalHistory }}</p>

              <p><b>Systems review</b></p>
              <p>{{ notes.systemsReview }}</p>

              <p><b>Examination review</b></p>
              <p>{{ notes.examinationReview }}</p>

              <p><b>Investigation history</b></p>
              <p>{{ notes.investigationHistory }}</p>

              <p><b>Diagnosis</b></p>
              <p>{{ notes.diagnosis }}</p>

              <p><b>Plan of management</b></p>
              <p>{{ notes.planOfManagement }}</p>
            </v-col>

            <!-- Right Column for Logs -->
            <v-col cols="6">
              <p><b>View Logs</b></p>
              <v-list dense>
                <v-list-item v-for="(log, index) in notes.logs" :key="index">
                  <v-list-item-content>
                  <p><b>Viewer's name: </b></p><p>{{ log.doctor_name }}</p><br>
                    <p><b>View date:</b> </p><p>{{ log.created_at }}</p>
                    <p><b>IP address</b></p><p>{{log.ip_address }} </p>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn color="primary" @click.prevent="doctorNoteDialog=false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-row>
      <v-col cols="12" v-if="!msetting('evaluation.disable_chief_complaints_on_doc_notes')">
        <v-textarea label="Chief complaints"
                    v-model="doctorNote.chief_complaints"
                    rows="3"
                    outlined
                    @change="doctorNote.save()">
        </v-textarea>
      </v-col>


      <div v-if="previousDoctorNotes.length > 0">
        <div style="font-size:12px">
          Notes by other clinicians for this patient's visit
        </div><br>

        <!-- Buttons for previous notes -->
        <div class="notes-container">
          <button
            v-for="(note, index) in previousDoctorNotes"
            :key="index"
            :title="note.createdAt"
            class="doctor-note-button"
            @click.prevent="renderDoctorNotes(note)"
          >
            {{ note.doctorName }} || {{note.createdAt}}
          </button>
        </div>
    </div>

    &nbsp;

      <div v-if="msetting('evaluation.presenting_complaints_compulsory')" style="font-size:12px">
        <span style="color: red;">*</span>Presenting complaints is compulsory before saving prescription
      </div>
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
            <v-btn small icon @click.prevent="closePresentingComplaintsDialog()">
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
             <div v-if="disease && disease.length > 0">
              <v-chip
                v-for="(illness, index) in disease"
                :key="index"
                class="ma-2"
                color="red"
                text-color="white"
              >
                Suspected Illness: {{ illness }}
              </v-chip>
            </div>
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
              <v-btn small icon @click.prevent="closeSystemReviewDialog()">
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
              <v-btn small icon @click.prevent="closeExaminationReviewDialog()">
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
            hint="Press tab after typing the diagnosis. (please only use this option when you can't find the diagnosis in the icd11 list)"
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

<style>
.doctor-note-button {
  margin: 5px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
}

.doctor-note-button:hover {
  background-color: #0056b3;
}
</style>
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
      moh705 : null,
      model: null,
      previousDoctorNotes:[],
      user_id:null,
      doctorNoteDialog:false,
      systemReviewDialog: false,
      presentingComplaintsDialog: false,
      examinationReviewDialog: false,
      notes:{},
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
        this.updatePatientConditionps(value);
        this.variations.push(this.icd10Transformer(value));
        this.icd10.search.results = [];
        this.icd10.variation = null;
      }
    },

    visit(value) {
      if (!this.user_id) {
        console.error('User ID is missing, cannot populate notes');
        return;
    }
      this.doctorNote.visit = value.id;

      this.doctorNote.populate(value.doctor_notes,this.user_id);
    },

    getDoctorsNotes(val) {

      if (!this.user_id) {
        console.error('User ID is missing, cannot populate notes');
        return;
    }
      this.doctorNote.populate(val,this.user_id);
    },
    'doctorNote.presenting_complaints'(newVal) {
    if (newVal && newVal.trim() !== '') {
      this.isPresentingComplaintsAdded = false;
    }
  }
  },

  methods: {
    ...mapActions([
      'setNote', 'setDoctorsNotes',
    ]),

    closeSystemReviewDialog() {
      this.systemReviewDialog = false;
      this.fetchNotes();
    },
    renderDoctorNotes(note){
        // Populate modal data with the selected note
        this.notes = {
        presentingComplaints: note.presentingComplaints,
        pastMedicalHistory: note.pastMedicalHistory,
        systemsReview: note.systemsReview,
        examinationReview: note.examination,
        investigationHistory: note.investigations,
        diagnosis: note.diagnosis,
        planOfManagement: note.treatmentPlan,
        created_at:note.createdAt,
        logs: note.logs || [],
      };

      // Open the modal
      this.doctorNoteDialog = true;

      var logData  = {
        doctor: note.doctorName,
        note_id: note.id,
        visit_id: this.$route.params.visitId,
      }
      this.doctorNote.logViews(logData);
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

    check_existent_symptoms(){

      const exist_disease = [];

      fetch('/api/evaluation/get/patient/visit/symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') // For CSRF protection
        },
        body: JSON.stringify({ 'visit' : this.$route.params.visitId })
      })
        .then(response => response.json())
        .then(data => {
          this.saveLoader = false; // Hide the loader

          data.forEach(value => {
            if (!exist_disease.includes(value)) {
              exist_disease.push(value);
            }
          });


          this.disease = exist_disease;

          // Handle response data here if needed
        })
        .catch(error => {
          this.saveLoader = false; // Hide the loader
          console.error('Error :', error);
        });
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

      var visit_id = this.$route.params.visitId;

      this.doctorNote.populate(val,visit_id);


    },
    async fetchAllNotes(){
      this.user_id = await this.doctorNote.fetchCurrentlyLoggedInUser();

     const previousNotes =  await this.doctorNote.fetchAllNotes(this.user_id,this.$route.params.visitId);
      // Extract noteos and logs from the response
      const notes = previousNotes?.notes?.data || []; // Access notes data array
        const logs = previousNotes.logs || [];

        // Map through notes and enrich with logs
        this.previousDoctorNotes = notes.map(note => {
          return {
            user_id:note.user,
            id: note.id,
            doctorName: note.doctor || '',
            chiefComplaints: note.chief_complaints || '',
            presentingComplaints: note.presenting_complaints || '',
            pastMedicalHistory: note.past_medical_history || '',
            systemsReview: note.systems_review || '',
            examination: note.examination || '',
            investigations: note.investigations || '',
            diagnosis:note.diagnosis || '',
            treatmentPlan: note.treatment_plan || '',
            createdAt: note.created_at || '',
            logs: logs.filter(log => log.doctor_note_id === note.id) || [],
          };
        });


        //populate medical history
        const userNotes = this.previousDoctorNotes.filter(
        (note) => note.user_id === this.user_id // Use `user_id` from notes
      );



      // Collect past medical histories and join them with commas
      const histories = userNotes
        .map((note) => note.pastMedicalHistory)
        .filter((history) => history) // Exclude null/empty histories
        .join(', ');

      // Set the textarea model
      this.doctorNote.past_medical_history = histories;

          const previousData = {
        presenting_complaints: [],
        systems_review: [],
        examination_review: [],
        examination: [],
        treatment_plan: []
    };

    userNotes.forEach(note => {
        if (note.presentingComplaints) previousData.presenting_complaints.push(note.presentingComplaints);
        if (note.systemsReview) previousData.systems_review.push(note.systemsReview);
        if (note.examination) previousData.examination_review.push(note.examination);
        if (note.examination) previousData.examination.push(note.examination);
        if (note.treatmentPlan) previousData.treatment_plan.push(note.treatmentPlan);
    });

    this.doctorNote.presenting_complaints = previousData.presenting_complaints.join(', ');
    this.doctorNote.systems_review = previousData.systems_review.join(', ');
    this.doctorNote.examination_review = previousData.examination_review.join(', ');
    this.doctorNote.examination = previousData.examination.join(', ');
    this.doctorNote.treatment_plan = previousData.treatment_plan.join(', ');
    this.doctorNote.visit_id = this.$route.params.visitId;
    this.doctorNote.visit = this.$route.params.visitId;

      //populate investigation history
      const userMedicalNotes = this.previousDoctorNotes.filter(

    (note) => note.user_id === this.user_id // Use `user_id` from notes
  );



  // Collect past investigations and join them with commas
  const investigations = userMedicalNotes
    .map((note) => note.investigations)
    .filter((investigations) => investigations) // Exclude null/empty investigations
    .join(', ');

  // Set the textarea model
  this.doctorNote.investigations = investigations;

    },



  },

  mounted() {
    this.fetchAllNotes();
    this.setNote({
      params: {
        visit_id: this.$route.params.visitId,
      },
    });


    this.check_existent_symptoms();

    if (this.msetting('evaluation.presenting_complaints_before_selection')) {
      if (this.doctorNote.presenting_complaints !== null &&
          this.doctorNote.presenting_complaints !== undefined &&
          this.doctorNote.presenting_complaints !== '') {
        this.isPresentingComplaintsAdded = false;
      };

    }else{

      this.isPresentingComplaintsAdded = false;

    }


  },
};
</script>

<style scoped>

</style>
