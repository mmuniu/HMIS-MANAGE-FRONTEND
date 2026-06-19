<template>
  <collabmed-loading v-if="!initialised"></collabmed-loading>

  <v-card flat v-else>
    <div v-if="investigationResult.patient_tests.length < 1">
      <v-card>
        <v-alert :value="true" icon="info" color="info">
          Seems like there are no tests here
        </v-alert>
      </v-card>
    </div>

    <v-expansion-panels v-else  v-model="panel">
      <v-expansion-panel v-for="(investigation, index) in investigationResult.patient_tests" :key="investigation.id">
        <v-expansion-panel-header v-if="investigation.can_be_offered || msetting('evaluation.bypass_investigations_billing') || /\binsurance\b/i.test(mode)">
          <receive-sample-modal
            :result="investigation"
            :show="toggleReceiveSampleDialog"
            @close="toggleReceiveSampleDialog = false"
            @saved="updateReceiveSampleStatus"
          ></receive-sample-modal>
          <v-card-title style="padding: 0; margin: 0">
            <h5>{{ investigation.test }}</h5>
            <v-spacer></v-spacer>
            <h4 style="text-decoration: underline">Run No: <span style="font-weight: bold">{{ investigation.run_no }}</span></h4>
            <v-spacer></v-spacer>
            <h5 class="font-weight-black" @click="toggleReceiveSampleDialog = true">
              {{ investigation.sample_received_on ? 'Sample received' : resultSampleTakenText }}
            </h5> &nbsp; &nbsp;
            <span v-for="(detail, idx) in investigationResult.procedure_info[investigation.investigation_id].details" :key="idx">
              <h5 v-if="detail.title === 'Date: '">
               {{ detail.value }}
              </h5>
            </span>
          </v-card-title>


        </v-expansion-panel-header>
      
        <v-expansion-panel-header v-else>
          <h5 class="red--text">
            Procedure not paid for yet
          </h5>
        </v-expansion-panel-header>
      
        <v-expansion-panel-content>
          <v-card flat v-if="investigation.can_be_offered || msetting('evaluation.bypass_investigations_billing') || /\binsurance\b/i.test(mode)">
            <v-container fluid class="ml-5">
              <v-row>
                <v-col md="7" cols="12">
                  <!-- Procedure has predefined template -->
                  <div v-if="investigation.subtests">
                    <div v-for="(tests, index) in investigation.subtests" :key="index">
                      <v-row>
                        <v-col>
                          <h6 class="font-weight-black" v-if="index != 'null'">{{ index }} </h6>
                        </v-col>
                      </v-row>
                      
                      <br />
                      <v-row v-for="(subtest, i) in tests" :key="i">
                        <v-col md="9" cols="12" v-if="subtest.lab_result_type == 'rich_text'">
                          <ckeditor :editor="editor" :id="'pre' + i" v-model="subtest.result"></ckeditor>
                          <v-file-input
                          v-model="investigation.uploadedFiles"
                          label="Upload PDF"
                            accept=".pdf"
                            show-size
                            outlined
                            multiple
                            dense
                            @change="handleFileUpload(investigation, $event)"
                            ></v-file-input>
                        </v-col>
                        <v-col v-else cols="12">
                          <v-row>
                            <v-col md="4" cols="12">
                              <span>{{ subtest.subtest }}</span>
                            </v-col>
                            <v-col md="4" cols="12">
                              <v-row v-if="subtest.lab_result_type == 'number'">
                                <v-col class="px-3" v-if="subtest.less_greater">
                                  <v-select
                                    outlined flat solo clearable
                                    placeholder="Select"
                                    item-text="text"
                                    item-value="value"
                                    :items="investigationResult.lessGreater"
                                    v-model="subtest.second_value"
                                  ></v-select>
                                </v-col>
                                <v-col class="px3">
                                  <v-text-field v-model="subtest.result" solo type="number" v-if="subtest.lab_result_type == 'number'"></v-text-field>
                                </v-col>
                              </v-row>
                              <v-textarea v-model="subtest.result" outlined v-if="subtest.lab_result_type == 'text'"></v-textarea>
                              <v-select
                                v-if="subtest.lab_result_type == 'select'"
                                outlined flat solo clearable
                                placeholder="Select"
                                :items="parseTypeItems(subtest)"
                                v-model="subtest.result"
                              ></v-select>
                              <v-row v-if="subtest.lab_result_type == 'range'">
                                <v-col class="mx-2" cols="6">
                                  <v-text-field v-model="subtest.result" solo type="number"></v-text-field>
                                </v-col>
                                <v-col class="mx-2" cols="6">
                                  <v-text-field v-model="subtest.second_value" solo type="number"></v-text-field>
                                </v-col>
                              </v-row>
                            </v-col>
                            <v-col class="px-3" md="3">
                              <v-switch
                                v-model="subtest.less_greater"
                                @change="subtest.second_value = null"
                                label="Of type less/greater"
                              ></v-switch>
                            </v-col>
                          </v-row>
                        </v-col>
                      </v-row>
                    </div>
                  </div>
      
                  <!-- No predefined template -->
                  <v-row v-else>
                  

                    <v-col md="11" v-if="investigation.input_type == 'rich_text'">
                      <ckeditor :editor="editor" :ref="'tm' + investigation.investigation_id"
                                :id="investigation.investigation_id + 'editor'"
                                v-model="investigation.result"
                                @editorInit="editorInit(investigation.result, 'tm' + investigation.investigation_id)"
                              ></ckeditor>


                              
                    </v-col>
                    <v-col  md="5" v-if="investigation.input_type == 'rich_text'">
                      <!-- File input for uploading a PDF -->
                      <v-file-input
                      v-model="investigation.uploadedFiles"
                      label="Upload PDF"
                      accept=".pdf"
                      show-size
                      outlined
                      multiple
                      @change="handleFileUpload(investigation, $event)"
                      dense
                    ></v-file-input>
                    </v-col>
      
                    <v-col v-else>
                      <v-col md="3" cols="12">
                        <span class="ml-4">Result:</span>
                      </v-col>
                      <v-col md="6" cols="12">
                        <v-text-field v-model="investigation.result"
                                      solo
                                      v-if="investigation.input_type === 'number'"
                                      type="number">
                        </v-text-field>
      
                        <v-textarea v-model="investigation.result"
                                    outlined
                                    v-if="investigation.input_type == 'text'">
                        </v-textarea>
      
                        <v-select
                          v-if="investigation.input_type == 'select'"
                          outlined flat solo clearable
                          placeholder="Select"
                          :items="parseTypeItems(investigation)"
                          v-model="investigation.result"
                        ></v-select>
                      </v-col>
                    </v-col>
                  </v-row>
                </v-col>
      
                <v-col md="4">
                  <v-card flat>
      
                    <v-card-title><h4>Procedure Information</h4></v-card-title>
                    <v-card-text>
                      <!-- Debugging output -->
      
                      <!-- Loop over each key in procedure_info related to the current investigation -->
                      <div v-for="(infoObject, index) in investigationResult.procedure_info" :key="index">
                        <div v-if="infoObject.investigation_id === investigation.investigation_id">
                            <div v-for="(detail, idx) in infoObject.details" :key="idx">
                                <strong>{{ detail.title }}</strong> {{ detail.value }}
                            </div>
                        </div>
                    </div>
                    <br/>
                    <h6>Comments:</h6>

                      <v-row>
                        <br/>
                        <v-col>
                          <div>
                            <v-textarea v-model="investigation.comment" outlined>
                            </v-textarea>
                          </div>
                        </v-col>
                      </v-row>

                    </v-card-text>
      
                    <v-card-actions>
                      <v-btn color="primary" small
                             :loading="loading"
                             @click="saveTestResults(investigation, index)"
                      >
                        save
                      </v-btn>
                      <v-btn small
                             color="red"
                             @click="investigationResult.cancelInvestigation(investigation.investigation_id)"
                      >
                        cancel
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
      
      
    </v-expansion-panels>
  </v-card>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import InvestigationResults from '@evaluation/libs/investigation_results/InvestigationResults.js';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default {
  data: () => ({
    loading: false,
    panel: 0,
    investigationResult: new InvestigationResults(),
    editor: ClassicEditor,
    uploadedFile: null, 
    toggleReceiveSampleDialog: false,
    resultSampleTakenText: 'Receive sample',

  }),

  computed: {
    ...mapGetters({
      investigations: 'getInvestigations',
    }),

    mode() {
      return this.investigations.data[0].visit.mode;
    },
    

    initialised() {
      return this.investigations.data ? true : false;
    },
  },

  watch: {
    investigations(investigations) {
      this.investigationResult.assemble(investigations);
      
    },
  },

  methods: {
    ...mapActions([
      'setInvestigations',
    ]),
    
  parseTypeItems(subtest) {
      let data = [];

      if (subtest.lab_result_options) {
        data = JSON.parse(subtest.lab_result_options).filter((item) => {
          return item != null;
        });
      }

      return data;
    },
 
  handleFileUpload(investigation, files) {
  if (files && files.length > 0) {
    // Ensure the property is reactive if it doesn't exist
    if (!investigation.uploadedFiles) {
      this.$set(investigation, 'uploadedFiles', []);
    }

    // Convert FileList to an array and store all files without filtering
    investigation.uploadedFiles = Array.from(files);
  }
},



    async saveTestResults(investigation, index) {
      this.loading = true;
      const response = await this.investigationResult.saveResult(investigation);

      if (response) {
        window.events.$emit('update-action-status');

        this.investigationResult.patient_tests.splice(index, 1);

        flash(response);

        this.loading = false;
      }
    },
    updateReceiveSampleDialog() {
      this.toggleReceiveSampleDialog = false;
    },
    async updateReceiveSampleStatus() {
      this.loading = false;
      this.toggleReceiveSampleDialog = false;
      this.resultSampleTakenText = 'Sample received';
    },
    editorInit( value, ref) {
      this.$refs[ref][0].editor.setContent(value);
    },

    initialize() {
    //  ('investigations here and now')
      this.setInvestigations({
        
        params: {
          visit_id: this.$route.params.visitId,
          type: this.$route.params.destination,
          action: 'withoutResults',
        },
      });
    },
  },

  mounted() {
    this.initialize();
    // console.log(this.investigations)
  },
};
</script>
