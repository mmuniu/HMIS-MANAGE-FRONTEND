<template>
  <div>
    <div>
      <div style="padding-top: 10px">
        <div style="margin-right: 20px">
          <div>
          <span style="font-weight: bold; padding-left: 30px;font-size:16px;text-decoration:underline">Subjective Refraction</span>

          <div>
            <div class="flex-container">
              <div style="width: 30px">&nbsp;</div>
              <div class="group-header">Sphere</div>
              <div class="group-header">Cylinder</div>
              <div class="group-header">Axis</div>
              <div class="group-header">BCVA</div>
              <div class="group-header">Duochrome</div>
              <div class="group-header">Near add</div>
              <div class="group-header">Prism Horizontal</div>
              <div class="group-header">Base direction</div>
              <div class="group-header">Prism Vertical</div>
              <div class="group-header">Base direction</div>
            </div>
            <div
              v-for="(subjective, index) in refraction.subjective.data"
              :key="index"
              class="mb-2"
            >
              <div class="flex-container">
                <div style="width: 30px">RE:</div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.subjective.data[index].right.sphere"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.subjective.data[index].right.cylinder"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.subjective.data[index].right.axis"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.subjective.data[index].right.bcva"
                  />
                </div>

                <div class="group-header flex-container mt-1">
                  <v-checkbox
                  v-model="refraction.subjective.data[index].right.duochrome"
                  @change="refraction.save()"
                  background-color="red"
                  color="black"
                  value="red"
                  hide-details
                ></v-checkbox>

                  <v-checkbox
                    class="ml-4"
                    @change="refraction.save()"
                    v-model="refraction.subjective.data[index].right.duochrome"
                    background-color="green"
                    color="black"
                    value="green"
                    hide-details
                  ></v-checkbox>
                </div>

                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.subjective.data[index].right.near_add"
                  />
                </div>

                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.subjective.data[index].right.prism_horizontal
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.subjective.data[index].right
                        .horizontal_base_direction
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.subjective.data[index].right.prism_vertical
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.subjective.data[index].right
                        .vertical_base_direction
                    "
                  />
                </div>
              </div>
              <div class="flex-container">
                <div style="width: 30px">LE:</div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.subjective.data[index].left.sphere"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.subjective.data[index].left.cylinder"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.subjective.data[index].left.axis"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.subjective.data[index].left.bcva"
                  />
                </div>
                <div class="group-header flex-container mt-1">
                  <v-checkbox
                    v-model="refraction.subjective.data[index].left.duochrome"
                    @change="refraction.save()"
                    background-color="red"
                    color="black"
                    value="red"
                    hide-details
                  ></v-checkbox>
                  <v-checkbox
                    class="ml-4"
                    v-model="refraction.subjective.data[index].left.duochrome"
                    @change="refraction.save()"
                    background-color="green"
                    color="black"
                    value="green"
                    hide-details
                  ></v-checkbox>
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.subjective.data[index].left.near_add"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.subjective.data[index].left.prism_horizontal
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.subjective.data[index].left
                        .horizontal_base_direction
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.subjective.data[index].left.prism_vertical
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.subjective.data[index].left
                        .vertical_base_direction
                    "
                  />
                </div>
              </div>
              <div class="flex-container">
                <div style="width: 30px">OU:</div>
                <div class="group-header">
                  <span style="width: 90%">&nbsp;</span>
                </div>
                <div class="group-header">
                  <span style="width: 90%">&nbsp;</span>
                </div>
                <div class="group-header">
                  <span style="width: 90%">&nbsp;</span>
                </div>
                <div class="group-header">
                  <span style="width: 90%">&nbsp;</span>
                </div>
                <div class="group-header flex-container mt-1">
                  <v-checkbox
                    v-model="refraction.subjective.data[index].ou.duochrome"
                    @change="refraction.save()"
                    background-color="red"
                    color="black"
                    value="red"
                    hide-details
                  ></v-checkbox>
                  <v-checkbox
                    class="ml-4"
                    v-model="refraction.subjective.data[index].ou.duochrome"
                    @change="refraction.save()"
                    background-color="green"
                    color="black"
                    value="green"
                    hide-details
                  ></v-checkbox>
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.subjective.data[index].ou.near_add"
                  />
                </div>
                <div class="group-header">
                  <span style="width: 90%">&nbsp;</span>
                </div>
                <div class="group-header">
                  <span style="width: 90%">&nbsp;</span>
                </div>
                <div class="group-header">
                  <span style="width: 90%">&nbsp;</span>
                </div>
                <div class="group-header">
                  <span style="width: 90%">&nbsp;</span>
                </div>
              </div>

              <div v-if="refraction.subjective.data[index].by">
                <span
                  style="background: lightgray; padding: 2px"
                  class="rounded"
                >
                  By: {{ refraction.subjective.data[index].by }}</span
                >
                <v-btn small icon @click="refraction.removeItem(index)">
                  <v-icon small color="red" v-if="!refraction.subjective.final"
                    >delete</v-icon
                  >
                </v-btn>
              </div>
            </div>

            <div class="ma-3">
              <!-- Doctors instructions -->
              <v-textarea
                  label="Doctor's instructions"
                  v-model="refraction.subjective.doctors_instructions"
                  rows="3"
                  outlined
                  @change="refraction.save()"
              >
              </v-textarea>
            </div>
                 <div class="ma-3">

                   <!-- Radio Button Group -->
                  <v-radio-group v-model="prescriptionType" row>
                    <v-radio label="External Prescription" value="external"></v-radio>
                  </v-radio-group>
              
                
              
                  <!-- External Prescription Upload -->
                  <v-row class="mt-3" v-if="prescriptionType === 'external'">
                    <v-col cols="12" sm="6">
                      <v-file-input
                        v-model="prescriptionFile"
                        accept="application/pdf"
                        label="Upload Prescription (PDF)"
                        prepend-icon="mdi-file-upload"
                        @change="handleFileUpload"
                      ></v-file-input>
              
                      <!-- Display selected file name -->
                      <div v-if="uploadedFileName" class="text-success">
                        Uploaded: {{ uploadedFileName }}
                      </div>
              
                      <!-- Save Button -->
                      <v-btn
                        class="mt-3"
                        color="primary"
                        :disabled="!prescriptionFile"
                        @click="savePrescription"
                      >
                        Save Prescription
                      </v-btn>
                    </v-col>
                  </v-row>
              
                  <!-- Success Message -->
                  <div v-if="saveSuccess" class="text-success mt-3">
                    Prescription saved successfully!
                  </div>

                  <!-- Show Previous Uploads Only If Available -->
              <v-row v-if="previousPrescriptions.length > 0" class="mt-3">
                <v-col cols="12">
                  <h3>Previous Prescriptions:</h3>
                  <ul>
                    <li v-for="file in previousPrescriptions" :key="file.id">
                      <a :href="`/storage/${file.file_path.replace('public/', '')}`" target="_blank">
                        {{ file.file_name }}
                      </a>
                    </li>
                  </ul>
                </v-col>
              </v-row>
                </div>
           
            <div>
              <v-btn
                small
                color="primary"
                @click="addSubjective()"
                v-if="!refraction.subjective.final"
              >
                add
              </v-btn>
              <v-btn
                small
                class="mx-3"
                color="primary"
                :disabled="refraction.subjective.final"
                @click="refraction.markAsFinal()"
              >
                Mark as final
              </v-btn>
            </div>

          </div>

            <div class="ma-3">
              <h4>Pupillary Distance</h4>
              <v-row class="mt-3">
                <v-col cols="12" sm="6">
                  <v-row>
                    <v-col>
                      <div>
                        <v-text-field
                          v-model="
                            ophthalmologistObj.eyewear_pres.right
                              .pupillary_distance
                          "
                          dense
                          @change="
                            ophthalmologistObj.saveEyewearPres(
                              refraction.visit_id
                            )
                          "
                          label="Pupillary distance (50 and 80) mm"
                        >
                        </v-text-field>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div>
      <div style="padding: 10px">
        <div style="margin-right: 20px">
          <span style="font-weight: bold; padding-left: 30px;font-size:16px;text-decoration:underline"
          
            >Objective Refraction</span
          >

          <div>
            <div style="margin-top: 20px">
              <h6 style="font-weight: bold">Retinoscopy:</h6>
            </div>

            <div class="flex-container" style="margin: 20px 0">
              <v-radio-group
                @change="refraction.save()"
                v-model="refraction.objective_refraction.retinoscopy.type"
                row
              >
                <v-radio
                  label="Dry"
                  value="dry"
                  style="font-weight: bold"
                ></v-radio>
                <v-radio
                  label="Wet"
                  value="wet"
                  style="font-weight: bold"
                ></v-radio>
              </v-radio-group>

              <div
                v-if="
                  refraction.objective_refraction.retinoscopy.type === 'wet'
                "
                class="pl-8"
              >
                <label style="font-weight: lighter"
                  >Please select from below the given type:
                </label>
                <div style="width: 200px">
                  <select
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.objective_refraction.retinoscopy.wet_type
                    "
                  >
                    <option>Cyclogel</option>
                    <option>Cyclogel + Atropine</option>
                    <option>Atropine</option>
                    <option>Tropicamide</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div class="flex-container">
                <div style="width: 30px">&nbsp;</div>
                <div class="group-header">Sphere</div>
                <div class="group-header">Cylinder</div>
                <div class="group-header">Axis</div>
              </div>
              <div class="flex-container">
                <div style="width: 30px; font-weight: bold">RE:</div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.objective_refraction.retinoscopy.right.sphere
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.objective_refraction.retinoscopy.right.cylinder
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.objective_refraction.retinoscopy.right.axis
                    "
                  />
                </div>
              </div>
              <div class="flex-container">
                <div style="width: 30px; font-weight: bold">LE:</div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.objective_refraction.retinoscopy.left.sphere
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.objective_refraction.retinoscopy.left.cylinder
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.objective_refraction.retinoscopy.left.axis
                    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- eye wear processing -->
    <div>
      <div>
        <div style="padding: 10px">
          <div style="margin-right: 20px">
            <span style="font-weight: bold; padding-left: 30px"
              >Optical Prescription</span
            >

            <div>
              <div class="flex-container">
                <div style="width: 30px">&nbsp;</div>
                <div class="group-header">Sphere</div>
                <div class="group-header">Cylinder</div>
                <div class="group-header">Axis</div>
                <div class="group-header">Near add</div>
                <div class="group-header">Prism Horizontal</div>
                <div class="group-header">Base direction</div>
                <div class="group-header">Prism Vertical</div>
                <div class="group-header">Base direction</div>
              </div>

              <div class="flex-container">
                <div style="width: 30px; font-weight: bold">RE:</div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.eyewear_prescription.right.sphere"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.eyewear_prescription.right.cylinder"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.eyewear_prescription.right.axis"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.eyewear_prescription.right.near_add"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.eyewear_prescription.right.prism_horizontal
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.eyewear_prescription.right
                        .horizontal_base_direction
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.eyewear_prescription.right.prism_vertical
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.eyewear_prescription.right
                        .vertical_base_direction
                    "
                  />
                </div>
              </div>

              <div class="flex-container">
                <div style="width: 30px; font-weight: bold">LE:</div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.eyewear_prescription.left.sphere"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.eyewear_prescription.left.cylinder"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.eyewear_prescription.left.axis"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.eyewear_prescription.left.near_add"
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.eyewear_prescription.left.prism_horizontal
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.eyewear_prescription.left
                        .horizontal_base_direction
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.eyewear_prescription.left.prism_vertical
                    "
                  />
                </div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="
                      refraction.eyewear_prescription.left
                        .vertical_base_direction
                    "
                  />
                </div>
              </div>

              <div class="flex-container">
                <div style="width: 30px; font-weight: bold">Ou:</div>
                <div class="group-header"><span style="width: 90%"></span></div>
                <div class="group-header"><span style="width: 90%"></span></div>
                <div class="group-header"><span style="width: 90%"></span></div>
                <div class="group-header">
                  <input
                    style="width: 90%"
                    @change="refraction.save()"
                    v-model="refraction.eyewear_prescription.ou.near_add"
                  />
                </div>
                <div class="group-header"><span style="width: 90%"></span></div>
                <div class="group-header"><span style="width: 90%"></span></div>
                <div class="group-header"><span style="width: 90%"></span></div>
                <div class="group-header"><span style="width: 90%"></span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <v-row>
      <v-col cols="12">
        <p class="green--text">All changes above are saved automatically</p>
      </v-col>
    </v-row>

    <div>

    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import Refraction from "@evaluation/libs/refraction/Refraction";
import OphthalmologistObj from "@evaluation/libs/Ophthalmologist/Ophthalmologist";

export default {


  data() {
  return {
    refraction: new Refraction(),
    ophthalmologistObj: new OphthalmologistObj(),
     prescriptionType: "internal", // Default to internal prescription
      prescriptionFile: null,
      uploadedFileName: null,
      saveSuccess: false,
       previousPrescriptions: []

  };
},
  watch: {
    getRefraction(val) {
      if (val.length > 0) {
        this.refraction.assemble(val[0]);
      }
    },

  },

  computed: {
  },

  methods: {
    handleFileUpload(event) {
      if (event) {
        this.prescriptionFile = event;
        this.uploadedFileName = event.name;
      } else {
        this.prescriptionFile = null;
        this.uploadedFileName = null;
      }
    },

    fetchPreviousUploadedOtherPrescription(id) {
  this.refraction.fetchPreviousUploads(id)
    .then(response => {
      if (response.data && response.data.length > 0) {
        this.previousPrescriptions = response.data; 
      } else {
        this.previousPrescriptions = []; 
      }
    })
    .catch(error => {
      console.error("Error fetching previous prescriptions:", error);
      this.previousPrescriptions = []; 
    });
},

    savePrescription() {
      if (!this.prescriptionFile) {
        alert("Please upload a prescription file first.");
        return;
      }

      // Store file and name in refraction object
      this.refraction.prescriptionFile = this.prescriptionFile;
      this.refraction.prescriptionFileName = this.uploadedFileName;

      this.refraction.savePrescription();
      // Success message
      this.saveSuccess = true;

    
    },
    async save() {
      let response = await this.ophthalmologistObj.saveEyewearPres(
        this.$route.params.visitId
      );

      if (response) {
        this.init();
      }
    },

    addSubjective() {
  this.refraction.subjective.data.push({
    right: {
      sphere: '',
      cylinder: '',
      axis: '',
      bcva: '',
      duochrome: null,
      near_add: '',
      prism_horizontal: '',
      horizontal_base_direction: '',
      prism_vertical: '',
      vertical_base_direction: '',
    },
    left: {
      sphere: '',
      cylinder: '',
      axis: '',
      bcva: '',
      duochrome: null,
      near_add: '',
      prism_horizontal: '',
      horizontal_base_direction: '',
      prism_vertical: '',
      vertical_base_direction: '',
    },
    ou: {
      duochrome: null,
    },
    by: null,
  });
    },

    init() {
    
    },
    async fetchRefractionData(){
 
               try {
                    const response =  await this.refraction.fetchRefractionData(this.$route.params.visitId);

                    
                    const data = response[0];

                    if (data) {
                        if (data.subjective?.data) {
                            this.refraction.subjective.data = data.subjective.data;
                          this.refraction.subjective.doctors_instructions = data.subjective?.doctors_instructions;
                        }
                        if(data.id)
                        {
                          this.refraction.id = data.id
                          this.fetchPreviousUploadedOtherPrescription(data.id)
                          
                        }
                        if(data.objective_refraction?.retinoscopy){

                          this.refraction.objective_refraction.retinoscopy = data.objective_refraction?.retinoscopy
                        }
                        if(data.eyewear_prescription){    
                          this.refraction.eyewear_prescription = data.eyewear_prescription
                        }

                        

                    }
                } catch (error) {
                    console.error("Error fetching refraction form data:", error);
                }

    },

    async fetchPrescribeEyewear(){
      try {
                    const response =  await this.ophthalmologistObj.fetchEyewearPres(this.$route.params.visitId);
                    
                  
                    const data = response;

                    if (data) {
                
                        if (data.eyewear_pres) {
                          
                          // this.ophthalmologistObj.eyewear_pres.right.pupillary_distance =data.eyewear_pres.right.pupillary_distance;
                            
                        }

                    

                    }
                } catch (error) {
                    console.error("Error fetching refraction form data:", error);
                }
    },


   
  },

  mounted() {
    this.refraction.visit_id = this.$route.params.visitId;
    this.fetchRefractionData()
    this.init();
    this.fetchPrescribeEyewear()
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
select {
  padding: 0 10px;
  margin: 3px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.inline-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

h6 {
  margin: 0;
}

.el-label {
  margin: 0 10px;
}

.flex-container {
  display: flex;
}

.group-header {
  font-weight: bold;
  width: 150px;
}
.group-header-iop {
  font-weight: bold;
  width: 150px;
  display: flex;
}
</style>
