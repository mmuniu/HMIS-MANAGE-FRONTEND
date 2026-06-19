<template>
  <collabmed-loading v-if="!resultFetchDone"></collabmed-loading>
  <div v-else>
    <v-card flat>
      <v-card-title>
        <v-btn color="success" small
               class="mx-2"
               @click="openAll()">
          Open all
        </v-btn>

        <v-btn color="success"
               small
               class="mx-2"
               @click="closeAll()">
          Close
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn v-if="viewPublished" color="primary"
               class="mx-2"
               @click="investigationResult.printAll(visitid, 0)"
               small>
          Print All
        </v-btn>
        <v-btn v-if="viewPublished" color="primary"
               class="mx-2"
               @click="investigationResult.printAll(visitid, 1)"
               small>
          Print without letterhead
        </v-btn>

        <v-btn v-if="viewPublished" color="warning"
               class="mx-2"
               @click="investigationResult.emailInvestigationResult(null, visitid)"
               small>
          Email All
        </v-btn>
        <v-btn v-if="viewPublished" color="warning"
               class="mx-2"
               @click="investigationResult.emailInvestigationResult(null, visitid, 1)"
               small>
          Email without letterhead
        </v-btn>
      </v-card-title>
    </v-card>


    <div v-if="patient_results.length <= 0">
      <v-card>
        <v-alert :value="true" icon="info" color="info">
          Seems like there are no tests here
        </v-alert>
      </v-card>
    </div>


    <v-expansion-panels  v-else multiple vw-model="panel">
      <!-- here is where we render the view result logs -->
      <v-expansion-panel
          v-for="(result, index) in patient_results"
          :key="index + result.procedure_name"
      >
      <v-expansion-panel-header class="d-flex align-items-center">
        <v-row class="w-100 align-items-center">
          <v-col md="10" class="d-flex align-items-center">
            <h5 class="font-weight-black">{{ result.procedure_name }}</h5>
          </v-col>
          <v-col md="2" class="d-flex justify-end align-items-center">
            <h5 class="font-weight-black">{{ result.requested_on }}</h5>
          </v-col>
          <v-col md="2">
            <investigation-result-view-logs :visit-id="result.visit_id" ></investigation-result-view-logs>
          </v-col>
        </v-row>
      </v-expansion-panel-header>


        <v-expansion-panel-content>
          <v-card flat>
            <v-container class="ml-5" fluid>
              <!-- Retracted alert -->
              <v-row v-if="action === 'retracted'">
                <v-col md="6">
                  <v-alert
                      :value="true"
                      color="error"
                      icon="info"
                      outlined
                  >
                    {{ result.reason }}
                  </v-alert>
                </v-col>
              </v-row>

              <!-- Headers Row -->
              <v-row>
                <v-col md="9" style="margin-left:6px;border-bottom: 1px solid black">
                    <v-col
                        v-for="(header, index) in result.headers"
                        :key="index + header.display_name"
                        class="font-weight-black d-flex align-items-center justify-center"
                            :style="{
                    textAlign: 'center',
                          whiteSpace: 'nowrap'
                      }"

                        :md="getColumnMd(header.display_name)"
                        :class="{ 'text-xs-center': index != 'test' }"
                    >
                      <span  style="padding: 10px;">
                        {{ header.display_name }}
                      </span>
                    </v-col>
                </v-col>
                <!-- Results Row -->
                <v-col md="9" style="margin-top:3px">
                  <v-row v-for="(group, key) in result.results" :key="key">
                    <v-col style="margin-top:12px">
                      <v-row
                          class="pl-3"
                          v-for="(test, index) in group"
                          :key="test.test + index + test.result"
                          v-if="!test.type_wysiwg">
                        <!-- Test -->
                        <v-col md="3" class="py-2 d-flex align-items-center">
                          <span style="font-size: 15px; font-weight: bold;" v-if="test.appear_bold">{{ test.test }}</span>
                          <span style="font-size: 15px;" v-else>{{ test.test }}</span>
                          <br />
                          <span style="font-size: 12px; font-style: italic">{{ test.sub_title }}</span>
                        </v-col>

                        <!-- Result -->
                        <v-col
                            style="padding-right:2px;padding-left:-2px"
                            class="text-center py-2 d-flex align-items-center justify-center"
                            :class="{ bold_result: boldIncorrectResult(test) }"
                            md="1"
                        >
                          <span style="font-size: 15px">{{ test.result }}</span>
                          <br />
                        </v-col>

                        <!-- Unit -->
                        <v-col

                            class="text-center py-2 d-flex align-items-center justify-center"
                            v-if="result.headers.hasOwnProperty('unit')"
                            md="2"
                        >
                          <span style="font-size: 15px">{{ test.unit }}</span>
                        </v-col>

                        <!-- Flag -->
                        <v-col

                            class="text-center py-2 d-flex align-items-center justify-center"
                            md="1"
                        >
                          <span style="font-size: 15px" v-html="test.flag"></span>
                        </v-col>
                        <!-- Biological Reference -->
                        <v-col
                            class="text-left py-2 pl-3 d-flex align-items-center"
                            v-if="result.headers.hasOwnProperty('reference_ranges')"
                            md="3"
                        >
                          <p
                              style="padding: 0; margin: 0;"
                              v-for="(range, index) in test.reference_ranges"
                              :key="index + range.bio_reference + range.type"
                          >
                            {{ range.bio_reference }}
                          </p>
                        </v-col>

                        <!-- Edit Results Button -->
                        <v-col cols="1" v-if="action != 'published' && test.result_value_type != 'other'">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                              <v-btn icon color="blue" small dark v-on="on" @click="editResult(test)">
                                <v-icon>fa-edit</v-icon>
                              </v-btn>
                            </template>
                            <span>Edit Result</span>
                          </v-tooltip>
                        </v-col>
                      </v-row>

                      <!-- WYSIWYG Content -->
                      <v-row v-else>
                        <v-col
                            v-html="test.result"
                            v-if="!(investigationResult.resultBeingEdited && (investigationResult.resultBeingEdited.id === test.id))"
                        ></v-col>
                        <v-col v-else>
                          <div v-if="investigationResult.resultBeingEdited">
                            <div v-if="investigationResult.resultBeingEdited.result_value_type == 'rich_text'">
                              <ckeditor
                                  :editor="editor"
                                  :id="investigationResult.resultBeingEdited.id + 'editor'"
                                  @editorInit="editorInit(investigationResult.resultBeingEdited.result, 'editTm' + investigationResult.resultBeingEdited.id)"
                                  v-model="investigationResult.resultBeingEdited.result"
                              ></ckeditor>

                              <v-btn color="primary darken-1" @click="updateEditedResult()">
                                Update Changes
                              </v-btn>
                            </div>
                          </div>
                        </v-col>

                        <v-col cols="1" v-if="action != 'published' && test.result_value_type != 'other'">
                          <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                              <v-btn icon color="blue" small dark v-on="on" @click="editResult(test)">
                                <v-icon>fa-edit</v-icon>
                              </v-btn>
                            </template>
                            <span>Edit Result</span>
                          </v-tooltip>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                </v-col>
                <!-- Results Row -->
              </v-row>
              <v-row v-if="result.investigation_file_path">
                <v-col v-for="(filePath, index) in JSON.parse(result.investigation_file_path)" :key="index">
                  <v-btn
                    small
                    dark
                    color="blue"
                    :href="filePath.path"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                  View File: {{ filePath.name ? filePath.name : getFileName(file.path) }}
                </v-btn>
                </v-col>
              </v-row>
              

              <v-row>


                <!-- Comments Section -->
                <v-col class="text-left py-2 pl-3 d-flex align-items-center" md="2" v-if="result.comments && result.comments !='null'">
                  <h5>Comments: </h5>
                  <div v-html="result.comments"></div>
                </v-col>
              </v-row>

              <!-- Action Buttons Row -->
              <v-row>
                <v-col>
                  <v-btn 
                  small 
                  color="warning" 
                  @click="reviewInvestigation(result)"
                >
                  {{ result.reviewed ? 'Reviewed' : review_text }}
                </v-btn>

                  <v-btn small color="primary" :loading="loading" v-if="(reviewSubmitted || result.reviewed) && action === 'pending' && can('evaluation.approve-laboratory-procedure')" @click="updateResultStatus(result, index, 'approved')">
                    Approve
                  </v-btn>

                  <span v-if="action != 'retracted'">
                    <v-btn
                        small
                        color="error"
                        :loading="loading"
                        v-if="(reviewSubmitted || result.reviewed ) && (action === 'pending' || action === 'approved') &&
                        can('evaluation.retract-laboratory-procedure') ||
                        (action === 'published' && can('evaluation.retract-published-results'))"
                        @click="retractResults(result, index)"
                    >
                      Retract
                    </v-btn>
                  </span>

                  <v-btn small color="error" v-if="action === 'retracted' && can('evaluation.revert-laboratory-procedure')" @click="investigationResult.revertResults(result.investigation_result_id)">
                    Revert
                  </v-btn>

                  <v-btn small color="primary" :loading="loading" v-if="action === 'approved' && can('evaluation.publish-laboratory-procedure')" @click="updateResultStatus(result, index, 'published')">
                    Publish
                  </v-btn>

                  <v-btn small dark color="teal" v-if="action === 'published'" @click="investigationResult.printOne(result.investigation_id, result.visit_id, false, true)">
                    Download
                  </v-btn>

                  <v-btn small dark color="teal lighten-1" v-if="action === 'published'" @click="investigationResult.printOne(result.investigation_id, result.visit_id, true, true)">
                    Download without letterhead
                  </v-btn>

                  <v-btn small color="primary" v-if="action === 'published'" @click="investigationResult.printOne(result.investigation_id, result.visit_id)">
                    Print
                  </v-btn>

                  <v-btn small color="info" v-if="action === 'published'" @click="investigationResult.printOne(result.investigation_id, result.visit_id, true)">
                    Print without letterhead
                  </v-btn>

                  <v-btn small color="warning" v-if="action === 'published'" @click="investigationResult.emailInvestigationResult(result.investigation_id, result.visit_id)">
                    Email
                  </v-btn>

                  <v-btn small color="warning" v-if="action === 'published'" @click="investigationResult.emailInvestigationResult(result.investigation_id, result.visit_id, 1)">
                    Email without letterhead
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-expansion-panel-content>

      </v-expansion-panel>
    </v-expansion-panels>


    <!-- edit lab result for none richtext results -->
    <v-dialog v-model="investigationResult.edit_result_dialog"
              :retain-focus="false"
              persistent
              max-width="70%"
              id="result_edit_dialog"
              v-if="investigationResult.resultBeingEdited && investigationResult.resultBeingEdited.result_value_type !== 'rich_text'">
      <v-card>
        <v-card-title class="text-h5 primary">Edit result</v-card-title>
        <v-card-text>
          <v-row   class="px-3">
            <v-col md="8">

              <v-row  v-if="investigationResult.resultBeingEdited.result_value_type == 'number'">
                <v-col>
                  <v-switch
                      v-model="investigationResult.resultBeingEdited.less_greater"
                      @change="investigationResult.resultBeingEdited.second_value = null"
                      label="Of type less/greater"
                  ></v-switch>
                </v-col>
              </v-row>

              <v-row v-if="investigationResult.resultBeingEdited.result_value_type == 'number'">
                <v-col class="px-5" v-if="investigationResult.resultBeingEdited.less_greater">
                  <v-select
                      outline flat solo clearable
                      placeholder="Select"
                      item-text="text"
                      item-value="value"
                      :items="investigationResult.lessGreater"
                      v-model="investigationResult.resultBeingEdited.second_value"
                  ></v-select>

                </v-col>
                <v-col class="px3" >
                  <v-text-field v-model="investigationResult.resultBeingEdited.result" solo
                                type="number"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-textarea v-model="investigationResult.resultBeingEdited.result"
                          outline
                          v-if="investigationResult.resultBeingEdited.result_value_type == ('text' || 'select')">
              </v-textarea>

              <v-row v-if="investigationResult.resultBeingEdited.result_value_type == 'range'">
                <v-col class="mx-2" cols="6" >
                  <v-text-field v-model="investigationResult.resultBeingEdited.result"
                                solo
                                type="number">
                  </v-text-field>
                </v-col>
                <v-col class="mx-2" cols="6" >
                  <v-text-field v-model="investigationResult.resultBeingEdited.second_value"
                                solo
                                type="number">
                  </v-text-field>
                </v-col>
              </v-row>

            </v-col>

            <v-col class="pl-5">
              <p class="text-center" style="font-weight: bold">Reference Ranges</p>
              <div  v-if="investigationResult.resultBeingEdited.reference_ranges">
                <p  style="padding: 0; margin: 0"
                    v-for="(range, index) in investigationResult.resultBeingEdited.reference_ranges"
                    :key="index + range.bio_reference + range.type">
                </p>
              </div>
            </v-col>
          </v-row>

          <v-row   class="px-3 pt-3"
                   v-if="investigationResult.resultBeingEdited.result_value_type == 'less_greater'"
          >
            <v-col md="8">
                            <span style="font-size: 12px;">
                                Adjust the flag if applicable, based on the provided references
                            </span> <br/>
              <v-select
                  outline flat solo clearable
                  placeholder="Select"
                  :items=flags
                  v-model="investigationResult.resultBeingEdited.updated_flag"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error darken-1"
                 @click="investigationResult.edit_result_dialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary darken-1"
                 @click="updateEditedResult()">
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="investigationResult.retract_results_dialog" persistent max-width="40%" >
      <v-card>
        <v-card-title class="text-h5 primary">Retract results</v-card-title>
        <v-card-text>
          Please provide a detailed reason behind retracting these results.
          <v-textarea
              flat
              outline
              label="Reason"
              v-model="investigationResult.rejection_reason"
              required
              color="purple"
              hide-details
          ></v-textarea>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error darken-1" @click="investigationResult.retract_results_dialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary darken-1"
                 @click="updateResultStatus(retractingResult, retractingResultIndex, 'retracted')">
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog  v-model="investigationResult.email_result_dialog" persistent max-width="650" >
      <v-card>
        <v-card-title class="text-h5 primary">Email patient results</v-card-title>
        <v-card-text>
          <v-row  >
            <v-col class="px-3" md="6" >
              <v-autocomplete
                  label="Select institution"
                  required
                  @change="investigationResult.institutionSelected()"
                  :items="institutions.data"
                  item-text="name" item-value="id"
                  return-object
                  v-model="investigationResult.emailing_partial.selected_institution"
              ></v-autocomplete>
            </v-col>
            <v-col class="pl-4" md="6" >
              <v-switch
                  v-model="investigationResult.emailing_partial.emailToDoctorInInstitution"
                  label="Email to a doctor in the institution"
              ></v-switch>
            </v-col>
          </v-row>

          <v-row  >
            <v-col class="px-3" md="6" v-if="investigationResult.emailing_partial.emailToDoctorInInstitution">
              <v-select
                  label="Select Doctor/Other Staff"
                  required
                  @change="investigationResult.staffSelected()"
                  return-object
                  :items="investigationResult.emailing_partial.institution_staff"
                  item-text="name" item-value="id"
                  v-model="investigationResult.emailing_partial.selected_doctor"
              ></v-select>
            </v-col>
            <v-col class="pl-4" md="6" >
              <v-btn small color="primary"
                     v-if="!investigationResult.emailing_partial.emailToDoctorInInstitution"
                     @click="investigationResult.addInstitutionToMailing()"> <v-icon small>add</v-icon> add</v-btn>
            </v-col>
          </v-row>

          <v-row  >
            <v-col class="px-4" md="8" >
              <v-text-field
                  v-model="investigationResult.emailing_partial.extra_personnel"
                  type="email"
                  label="Send to an external individual (relative/doctor/friend)"
              ></v-text-field>
            </v-col>
            <v-col md="4">
              <v-btn small color="primary" @click="investigationResult.addExtraEmail()"> <v-icon small>add</v-icon> add</v-btn>
            </v-col>
          </v-row>

          <v-chip
              v-for="email in investigationResult.email.recipients"
              :key="email"
              close
              @input="investigationResult.removeEmail(email)"
              color="green"
              outline
          > {{ email }}</v-chip>

          <v-switch
              v-model="investigationResult.email.send_to_patient"
              label="Send a copy to the patient"
              color="primary"
              hide-details
          ></v-switch>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error darken-1" @click="investigationResult.email_result_dialog = false">Cancel</v-btn>
          <v-btn color="primary darken-1"
                 :disabled="investigationResult.email.recipients.length < 1 && !investigationResult.email.send_to_patient"
                 @click="investigationResult.emailResult()">Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="investigationResult.review_investigation_modal" persistent max-width="40%" >
      <v-card>
        <v-card-title class="text-h5 primary">Review Investigation</v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <v-textarea
                  flat
                  outline
                  label="Comments"
                  v-model="investigationResult.review_comments"
                  required
                  color="purple"
                  hide-details
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error darken-1" @click="investigationResult.review_investigation_modal = false">
            Cancel
          </v-btn>
          <v-btn color="primary darken-1"
                 @click="submitReview(investigationResult.id)">
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <collabmed-floating-loader v-if="investigationResult.loading"></collabmed-floating-loader>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { _ } from 'vue-underscore';
import InvestigationResults from '@evaluation/libs/investigation_results/InvestigationResults.js';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default {
  props: [
    'action', 'visitid', 'type',
  ],

  data: () => ({
    loading: false,
    panel: [],
    dialog: false,
    investigationResult: new InvestigationResults(),
    patient_results: [],
    flags: ['L', 'H', 'None'],
    resultFetchDone: false,
    retractingResult: null,
    retractingResultIndex: null,
    testing: null,
    editor: ClassicEditor,
    reviewSubmitted:false,
    toggleReceiveSampleDialog: false,
    review_investigation_modal :false,
    resultSampleTakenText: 'Receive sample',
    review_text:'Review'
  }),

  computed: {
    ...mapGetters({
      results: 'getInvestigationResults',
      institutions: 'getPartnerInstitutions',
    }),

    initialised() {
      return this.results ? true : false;
    },

    viewPublished() {
      return window.location.href.substring(window.location.href.lastIndexOf('/') + 1) === 'published-investigations';
    },
  },

  watch: {
    visitid(val) {
      this.initialize();
    },

    results(val) {
      this.resultFetchDone = true;

      const self = this;

      this.patient_results = [];

      Object.keys(val).map((key) => {
        self.patient_results.push(val[key]);
      });
    },
  },

  methods: {
    ...mapActions([
      'setInvestigationResults', 'setPartnerInstitutions',
    ]),

    openAll() {
      this.panel = this.patient_results.map((k, i) => i);
    },
    getColumnMd(displayName) {
      switch (displayName.toLowerCase()) {
        case 'investigations':
          return 3;
        case 'results':
          return 1;
        case 'unit':
          return 2;
        case 'flag':
          return 1;
        case 'biological reference':
          return 2;
        default:
          return 2; // Fallback or default width
      }
    },
    getFileName(filePath) {
      return filePath.split('/').pop(); // Extracts the filename from the path
    },
    closeAll() {
      this.panel = [];
    },

    editorInit( value, ref) {
      setTimeout(() => {
        this.$refs[ref][0].editor.setContent(value);
      }, 1000);
    },

   async submitReview(id){
      const response = await this.investigationResult.submitReviewInvestigation(this.investigationResult.selectedReviewId);
      if(response.alert){
        this.reviewSubmitted = true;
        this.review_text = 'Reviewed';
        this.investigationResult.review_investigation_modal = false; // Close modal after submitting
      }
      

    },
    editResult(test) {
      this.investigationResult.resultBeingEdited = test;

      if (this.investigationResult.resultBeingEdited.result_value_type != 'rich_text') {
        this.investigationResult.edit_result_dialog = true;
      }
    },

    async updateEditedResult() {
      const response = await this.investigationResult.updateEditedResult();

      if (response) {
        this.investigationResult.edit_result_dialog = false;

        if (this.investigationResult.resultBeingEdited.result_value_type == 'rich_text') {
          window.location.reload();
        }
      }
    },

    updateReceiveSampleDialog() {
      this.toggleReceiveSampleDialog = false;
    },
  
    boldIncorrectResult(test) {
      if (test.flag === 'H' || test.flag === 'L') {
        return true;
      } else {
        if (test.reference_ranges) {
          if (test.reference_ranges[0].type === 'text') {
            return test.reference_ranges[0].bio_reference != test.result;
          }
        }
      }
    },

    retractResults(result, index) {
      this.investigationResult.retract_results_dialog = true;
      this.investigationResult.investigation_id = result.investigation_id;
      this.retractingResult = result;
      this.retractingResultIndex = index;
    },

    async updateResultStatus(result, index, action) {
      this.loading = true;
      const response = await this.investigationResult.updateStatus(result.investigation_id, action);

      if (response) {
        this.patient_results.splice(index, 1);

        window.events.$emit('update-action-status');

        this.investigationResult.retract_results_dialog = false;

        flash(response);

        this.loading = false;
      } else {
        flash({
          message: 'Something wrong happened',
          alert: 'error',
        });
      }
    },
    async reviewInvestigation(result) {
      
      //fetch review investigation
      const reviewed_investigations = await this.investigationResult.fetchReviewedInvestigation(result.investigation_id);

      if(reviewed_investigations){
        this.investigationResult.review_comments = reviewed_investigations;
      }
      this.investigationResult.review_investigation_modal = true;
      this.investigationResult.selectedReviewId = result.investigation_id; // Store result.id

    
    },

    reloadPage() {
      window.location.reload();
    },

 

    async initialize() {
      if (window.location.href.substring(window.location.href.lastIndexOf('/') + 1) === 'published-investigations') {
        this.setPartnerInstitutions();
      }

      this.setInvestigationResults({
        params: {
          visit_id: this.visitid ? this.visitid : this.$route.params.visitId,
          type: this.type ? this.type : this.$route.params.destination,
          action: this.action,
        },
      });

      
    },
  },

  mounted() {
    this.resultFetchDone = false;
    this.initialize();
    this.panel = [0];
  },
};
</script>

<style>
.bold_result {
  font-weight: bold;
}
</style>
