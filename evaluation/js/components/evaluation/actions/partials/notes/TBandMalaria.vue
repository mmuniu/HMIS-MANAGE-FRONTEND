<template>
  <v-container>
      <v-row>


          <v-row>
                        <v-col cols="12">
                          <div>
                              <span>Have you had a cough recently?</span>
                          </div>
                          <div>



                            <v-radio-group v-model="tbScreening.cough" row>
                              <!-- label="Yes" -->
                                <v-radio :label="`Yes`"  @change="save()" value="yes"></v-radio>
                                <v-radio :label="`No`"  @change="save()" value="no"></v-radio>
                            </v-radio-group>
                        </div>
                      </v-col>

                      <v-col cols="12">
                        <div>Have you been having night sweats recently?</div>
                        <div>
                          <v-radio-group v-model="tbScreening.night_sweat" row>
                            <v-radio :label="`Yes`" value="yes" @change="save()"></v-radio>
                            <v-radio :label="`No`" value="no" @change="save()"></v-radio>
                          </v-radio-group>
                        </div>
                    </v-col>

                    <v-col cols="12">
                        <div>Have you had unexplained weight loss?</div>
                        <div>
                            <v-radio-group v-model="tbScreening.weight_loss" row>
                                <v-radio :label="`Yes`" @change="save()" value="yes"></v-radio>
                                <v-radio :label="`No`"  @change="save()" value="no"></v-radio>
                            </v-radio-group>
                        </div>
                    </v-col>


                    <v-col cols="12">
                        <div>Have you been experiencing fever symptoms?</div>
                        <div>
                            <v-radio-group v-model="tbScreening.fever_symptoms" row>
                                <v-radio :label="`Yes`" @change="save()" value="yes"></v-radio>
                                <v-radio :label="`No`"  @change="save()" value="no"></v-radio>
                            </v-radio-group>
                        </div>
                    </v-col>




                    <v-col cols="12">
                        <div>Have you had a TB contact recently?</div>
                        <div>
                            <v-radio-group v-model="tbScreening.TB_contact" row>
                                <v-radio :label="`Yes`" @change="save()" value="yes"></v-radio>
                                <v-radio :label="`No`"  @change="save()" value="no"></v-radio>
                            </v-radio-group>
                        </div>
                    </v-col>





                    <v-col cols="12">
                        <div>Have you had a TB treatment history?</div>
                        <div>
                            <v-radio-group v-model="tbScreening.TB_treatment_history" row>
                                <v-radio :label="`Yes`" @change="save()" value="yes"></v-radio>
                                <v-radio :label="`No`"  @change="save()" value="no"></v-radio>
                            </v-radio-group>
                        </div>
                    </v-col>




                    <v-col cols="12">
                        <div>Child reduced playfulness?</div>
                        <div>
                            <v-radio-group v-model="tbScreening.child_playfulness" row>
                                <v-radio :label="`Yes`" @change="save()" value="yes"></v-radio>
                                <v-radio :label="`No`"  @change="save()" value="no"></v-radio>
                            </v-radio-group>
                        </div>
                    </v-col>



                    <v-col cols="12">
                      <v-autocomplete
                              v-model="tbScreening.TB_status"
                              label="Select TB Status:"
                              outline
                              style="width:100%"
                              :items="tbStatuses"
                              item-value="text" item-text="text"
                              @change="doctorNote.save()"

                      ></v-autocomplete>
                  </v-col>


                  <v-col cols="12">
                    <div>Do you Smoke?</div>
                    <div>
                        <v-radio-group v-model="tbScreening.smoke" row>
                            <v-radio :label="`Yes `" @change="save()" value="yes"></v-radio>
                            <v-radio :label="`No `"  @change="save()" value="no"></v-radio>
                        </v-radio-group>
                    </div>
                </v-col>


                  <v-col cols="12">
                    <div>Do you sometimes drink alcohol?</div>
                    <div>
                        <v-radio-group v-model="tbScreening.drink_alcohol" row>
                            <v-radio :label="`Yes`" @change="save()" value="yes"></v-radio>
                            <v-radio :label="`No`"  @change="save()" value="no"></v-radio>
                        </v-radio-group>
                    </div>
                </v-col>


                  <v-col cols="12">
                    <div>Any Allergies to Drugs?</div>
                    <div>
                        <v-radio-group v-model="tbScreening.drugs" row>
                            <v-radio :label="`Yes`" @change="save()" value="yes"></v-radio>
                            <v-radio :label="`No `"  @change="save()" value="no"></v-radio>
                        </v-radio-group>
                    </div>
                </v-col>


                  <v-col cols="12">
                    <div>On any medication Currently?</div>
                    <div>
                        <v-radio-group v-model="tbScreening.medication_currently" row>
                            <v-radio :label="`Yes`" @change="save()" value="yes"></v-radio>
                            <v-radio :label="`No`"  @change="save()" value="no"></v-radio>
                        </v-radio-group>
                    </div>
                </v-col>



              <v-col cols="12">
                <!-- Select dropdown for duration_of_current_illness -->


                <v-textarea
                label="If Yes which drugs?"
                v-model="tbScreening.which_drugs"
                rows="3"
                outlined
                @change="save()"
              ></v-textarea>
              </v-col>


              <v-col cols="12">
                <div>Do you have Diabetes?</div>
                <div>
                    <v-radio-group v-model="tbScreening.diabetes" row>
                        <v-radio :label="`Yes `" @change="save()" value="yes"></v-radio>
                        <v-radio :label="`No`"  @change="save()" value="no"></v-radio>
                    </v-radio-group>
                </div>
            </v-col>




            <v-col cols="12">
              <!-- Select dropdown for duration_of_current_illness -->


              <v-textarea
              label="If Yes which medication?"
              v-model="tbScreening.which_medication"
              rows="3"
              outlined
              @change="save()"
            ></v-textarea>
            </v-col>


            <v-col cols="12">
              <div>Family with heart problems or High BP?</div>
              <div>
                  <v-radio-group v-model="tbScreening.family_heart_problems" row>
                      <v-radio :label="`Yes`" @change="save()" value="yes"></v-radio>
                      <v-radio :label="`No`"   @change="save()" value="no"></v-radio>
                  </v-radio-group>
              </div>
          </v-col>




            <v-col cols="12" v-if="age < 5">
                <v-autocomplete
                        v-model="doctorNote.danger_signs"
                        label="Select Danger Signs:"
                        outline
                        style="width:100%"
                        :items="dangerSignsOptions"
                        item-value="text" item-text="text"
                        @change="doctorNote.save()"

                ></v-autocomplete>
            </v-col>

            <!-- Hidden input field -->
    <!-- <input type="hidden" v-model="tbScreening.visit" value={{ visitId }}> -->
    <input type="hidden" v-model="tbScreening.visit">


              <v-col cols="12" v-if="age < 5">
                  <!-- Select dropdown for duration_of_current_illness -->


                  <v-textarea
                  label="Duration of Current Illness:"
                  v-model="doctorNote.duration_of_current_illness"
                  rows="3"
                  outlined
                  @change="doctorNote.save()"
                ></v-textarea>
                </v-col>






              <v-col cols="12">
                <v-autocomplete
                        v-model="doctorNote.suspected_malaria_cases"
                        label="Suspected Malaria Cases:"
                        outline
                        style="width:100%"
                        :items="suspectedMalariaCasesOptions"
                        item-value="value" item-text="text"
                        @change="doctorNote.save()"

                ></v-autocomplete>
            </v-col>



              <v-col cols="12">
                <v-autocomplete
                        v-model="doctorNote.malaria_case_symptoms"
                        label="Malaria Symptoms:"
                        outline
                        style="width:100%"
                        :items="malariaSymptomsOptions"
                        item-value="value" item-text="text"
                        @change="doctorNote.save()"
                        v-if="doctorNote.suspected_malaria_cases === 'yes'"
                ></v-autocomplete>
            </v-col>

              <v-col cols="12" v-if="age < 5">
                <v-autocomplete
                        v-model="doctorNote.tracer_drugs_prescribed"
                        label="Tracer Drugs Prescribed:"
                        outline
                        style="width:100%"
                        :items="tracerDrugsOptions"
                        item-value="value" item-text="text"
                        @change="doctorNote.save()"
                ></v-autocomplete>
            </v-col>


              <v-col cols="12" v-if="age < 5">
                <v-autocomplete
                        v-model="doctorNote.all_other_treatment_prescribed"
                        label="All Other Treatment Prescribed:"
                        outline
                        style="width:100%"
                        :items="allOtherTreatmentOptions"
                        item-value="value" item-text="text"
                        @change="doctorNote.save()"
                ></v-autocomplete>
            </v-col>



              <v-col cols="12" v-if="age < 5">
                <v-autocomplete
                        v-model="doctorNote.immunization_status_to_date"
                        label="Immunization Status Up to Date:"
                        outline
                        style="width:100%"
                        :items="immunizationStatusOptions"
                        item-value="value" item-text="text"
                        @change="doctorNote.save()"
                ></v-autocomplete>
            </v-col>


              <v-col cols="12">
                <v-autocomplete
                        v-model="doctorNote.TBScreening"
                        label="TB Screening:"
                        outline
                        style="width:100%"
                        :items="TBScreeningOptions"
                        item-value="text" item-text="text"
                        @change="doctorNote.save()"
                ></v-autocomplete>
            </v-col>


              <v-col cols="12" v-if="age < 5">
                <v-autocomplete
                        v-model="doctorNote.nutrition_and_dietetics"
                        label="Nutrition and Dietetics:"
                        outline
                        style="width:100%"
                        :items="nutritionAndDieteticsOptions"
                        item-value="text" item-text="text"
                        @change="doctorNote.save()"
                ></v-autocomplete>
            </v-col>




              <v-col cols="12">
                  <!-- Textarea for Refereedto -->
                  <v-textarea
                    label="Refereed to"
                    v-model="doctorNote.refereed_to"
                    rows="3"
                    outlined

                    @change="doctorNote.save()"
                  ></v-textarea>
                </v-col>

              <v-col cols="12">
                  <!-- Textarea for IMNCI classifications or diagnosis -->
                  <v-textarea
                    label="Remarks"
                    v-model="doctorNote.remarks"
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
import TBScreening from '@evaluation/libs/notes/TBScreening';
import Icd10 from '@evaluation/libs/icd10/Icd10';
import Register_705 from '@evaluation/libs/registers/Register_705';
import { evaluationMixin } from '@evaluation/mixins/EvaluationMixin';
import { mapActions, mapGetters } from 'vuex';
import SystemsReview from "@evaluation/components/evaluation/actions/SystemsReview";
import ExaminationReview from "@evaluation/components/evaluation/actions/ExaminationReview";


export default {

  props: ['document_types', 'patient_id', 'age'],

  mixins: [
      evaluationMixin,
  ],

  components: {
      'systems-review': SystemsReview,
      'examination-review': ExaminationReview,
  },
  data() {
      return {
          doctorNote: new DoctorNote(),
          visitId: this.$route.params.visitId,
          icd10: new Icd10(),
        Register_705: new Register_705(),
          tbScreening: new TBScreening(),
          model: null,
          age: localStorage.getItem('age'),
          systemReviewDialog: false,
          examinationReviewDialog: false,
          selectedStatus: '', // Initially no status selected
      tbStatuses: [
        'Active TB',
        'Latent TB',
        'Drug-Susceptible TB',
        'Drug-Resistant TB',
        'Cured TB',
        'Relapse'
        // Add more statuses as needed
      ],
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

      selectedCough: localStorage.getItem('tbCough') || 'no', // Retrieve from localStorage or default to 'no'
      selectedNightSweats: localStorage.getItem('tbNightSweats') || 'no', // Retrieve from localStorage or default to 'no'
      selectedWeightLoss: localStorage.getItem('tbWeightLoss') || 'no', // Retrieve from localStorage or default to 'no'
      selectedFeverSymptoms: localStorage.getItem('tbFeverSymptoms') || 'no', // Retrieve from localStorage or default to 'no'
      selectedTBContact: localStorage.getItem('tbFeverSymptoms') || 'no', // Retrieve from localStorage or default to 'no'
      selectedTBTreatmentHistory: localStorage.getItem('tbTreatmentHistory') || 'no', // Retrieve from localStorage or default to 'no'
      selectedTBChildPlayfulness: localStorage.getItem('tbChildPlayfulness') || 'no', // Retrieve from localStorage or default to 'no'
      selectedSmoke: localStorage.getItem('tbSmoke') || 'no', // Retrieve from localStorage or default to 'no'
      selectedDrinkAlcohol: localStorage.getItem('tbSelectedDrinkAlcohol') || 'no', // Retrieve from localStorage or default to 'no'
      selectedDrugs: localStorage.getItem('tbDrugs') || 'no', // Retrieve from localStorage or default to 'no'
      selectedMedicationCurrently: localStorage.getItem('tbMedicationCurrently') || 'no', // Retrieve from localStorage or default to 'no'
      selectedDiabetes: localStorage.getItem('tbDiabetes') || 'no', // Retrieve from localStorage or default to 'no'
      selectedFamilyHeartProblems: localStorage.getItem('tbFamilyHeartProblems') || 'no', // Retrieve from localStorage or default to 'no'
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
          // this.tbScreening.populate(value.tbScreening);
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

      setLocalStorageItem(key, value) {
        localStorage.removeItem(key);
    localStorage.setItem(key, value);
          },

      save()
      {

      // Save the selected value to localStorage
    this.setLocalStorageItem('tbCough', this.tbScreening.cough);
    this.setLocalStorageItem('tbNightSweats', this.tbScreening.night_sweat);
    this.setLocalStorageItem('tbWeightLoss', this.tbScreening.weight_loss);
    this.setLocalStorageItem('tbFeverSymptoms', this.tbScreening.fever_symptoms);
    this.setLocalStorageItem('tbContact', this.tbScreening.TB_contact);
    this.setLocalStorageItem('tbTreatmentHistory', this.tbScreening.TB_treatment_history);
    this.setLocalStorageItem('tbChildPlayfulness', this.tbScreening.child_playfulness);
    this.setLocalStorageItem('tbSmoke', this.tbScreening.smoke);
    this.setLocalStorageItem('tbSelectedDrinkAlcohol', this.tbScreening.drink_alcohol);
    this.setLocalStorageItem('tbDrugs', this.tbScreening.drugs);
    this.setLocalStorageItem('tbMedicationCurrently', this.tbScreening.medication_currently);
    this.setLocalStorageItem('tbDiabetes', this.tbScreening.diabetes);
    this.setLocalStorageItem('tbFamilyHeartProblems', this.tbScreening.family_heart_problems);

        this.tbScreening.visit = this.visitId;
        console.log(this.tbScreening.weight_loss)
        this.tbScreening.save()
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

  async mounted()  {
    this.age = localStorage.getItem('age');

    alert("this age");
    console.log(this.age);

      try {
        // Make API call to fetch data using visitId
        const response = await fetch(`/api/evaluation/tb/screening/update/${this.visitId}`);
        const data = await response.json();
        this.responseData = data; // Store the API response data in a variable
        console.log(this.responseData[0])
        var tbMalaria = this.responseData[0];
        if(tbMalaria)
        {


          this.tbScreening.cough = tbMalaria.cough;
          this.tbScreening.night_sweat = tbMalaria.night_sweat;
          this.tbScreening.weight_loss = tbMalaria.weight_loss;
          this.tbScreening.fever_symptoms = tbMalaria.fever_symptoms;
          this.tbScreening.TB_contact = tbMalaria.TB_contact;
          this.tbScreening.fever_symptoms = tbMalaria.fever_symptoms;
          this.tbScreening.TB_treatment_history = tbMalaria.TB_treatment_history;
          this.tbScreening.child_playfulness = tbMalaria.child_playfulness;
          this.tbScreening.drink_alcohol = tbMalaria.drink_alcohol;
          this.tbScreening.TB_treatment_history = tbMalaria.TB_treatment_history;
          this.tbScreening.drugs = tbMalaria.drugs;
          this.tbScreening.medication_currently = tbMalaria.medication_currently;
          this.tbScreening.diabetes = tbMalaria.diabetes;
          this.tbScreening.family_heart_problems = tbMalaria.family_heart_problems;
          this.tbScreening.TB_status = tbMalaria.TB_status;
          this.tbScreening.which_drugs = tbMalaria.which_drugs;
          this.tbScreening.which_medication = tbMalaria.which_medication;
          this.doctorNote.malaria = tbMalaria.notes.malaria;
          this.doctorNote.malaria_case_symptoms = tbMalaria.notes.malaria_case_symptoms;
          this.doctorNote.IMNCI_classifications_or_diagnosis = tbMalaria.notes.IMNCI_classifications_or_diagnosis;
          this.doctorNote.TB_screening = tbMalaria.notes.TB_screening;
          this.doctorNote.danger_signs = tbMalaria.notes.danger_signs;
          this.doctorNote.suspected_malaria_cases = tbMalaria.notes.suspected_malaria_cases;
          this.doctorNote.TB_screening = tbMalaria.notes.TB_screening;
          this.doctorNote.duration_of_current_illness = tbMalaria.notes.duration_of_current_illness;
          this.doctorNote.tracer_drugs_prescribed = tbMalaria.notes.tracer_drugs_prescribed;
          this.doctorNote.all_other_treatement_prescibed = tbMalaria.notes.all_other_treatement_prescibed;
          this.doctorNote.immunization_status_to_date = tbMalaria.notes.immunization_status_to_date;
          this.doctorNote.nutrition_and_diatetics = tbMalaria.notes.nutrition_and_diatetics;
          this.doctorNote.refereed_to = tbMalaria.notes.refereed_to;
          this.doctorNote.remarks = tbMalaria.notes.remarks;
          this.doctorNote.malaria_case_symptoms = tbMalaria.notes.malaria_case_symptoms;







        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }



      this.setNote({
          params: {
              visit_id: this.$route.params.visitId,
          },
      });
  },
};
</script>

<style scoped>

</style>
