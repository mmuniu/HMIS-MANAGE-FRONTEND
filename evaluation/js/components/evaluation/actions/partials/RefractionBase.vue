<template>
  <div>
    <!--        <div style="background: #f7f7f7; padding-top: 10px">-->
    <div style="background: #ffffff; padding-top: 10px">
      <div class="v-headers" style="font-weight: bold; padding-left: 30px">
        Visual Acuity
      </div>
      <v-row>
        <v-col cols="2">
          <v-row>
            <v-col cols="12" class="text-center">
              <h6>Unaided VA</h6>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">Right</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.unaided_va.right"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">Left</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.unaided_va.left"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">OU</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.unaided_va.ou"
                />
              </div>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="2">
          <v-row>
            <v-col cols="12" class="text-center">
              <h6>Aided Spectacles VA</h6>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">Right</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.aided_spectacles_va.right"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">Left</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.aided_spectacles_va.left"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">OU</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.aided_spectacles_va.ou"
                />
              </div>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="2">
          <v-row>
            <v-col cols="12" class="text-center">
              <h6>Aided Contact VA</h6>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">Right</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.aided_contact_va.right"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">Left</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.aided_contact_va.left"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">OU</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.aided_contact_va.ou"
                />
              </div>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="2">
          <v-row>
            <v-col cols="12" class="text-center">
              <h6>Unaided near VA</h6>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">Right</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.unaided_near_va.right"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">Left</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.unaided_near_va.left"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">OU</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.unaided_near_va.ou"
                />
              </div>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="2">
          <v-row>
            <v-col cols="12" class="text-center">
              <h6>Aided near VA</h6>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">Right</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.aided_near_va.right"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">Left</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.aided_near_va.left"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">OU</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.aided_near_va.ou"
                />
              </div>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="2">
          <v-row>
            <v-col cols="12" class="text-center">
              <h6>Aided spectacles+CI</h6>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">Right</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.pinhole_va.right"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">Left</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.pinhole_va.left"
                />
              </div>
            </v-col>
            <v-col cols="12">
              <div class="inline-wrapper">
                <p class="el-label">OU</p>
                <input
                  style="width: 60%;font-weight:bold"
                  @change="refraction.save()"
                  v-model="refraction.pinhole_va.ou"
                />
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>
    <hr />
    <div class="flex-container">
      <div style="margin-right: 20px">
        <div class="v-headers" style="font-weight: bold; padding-left: 30px">
          Autorefraction
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
                v-model="refraction.autorefraction.right.sphere"
              />
            </div>
            <div class="group-header">
              <input
                style="width: 90%"
                @change="refraction.save()"
                v-model="refraction.autorefraction.right.cylinder"
              />
            </div>
            <div class="group-header">
              <input
                style="width: 90%"
                @change="refraction.save()"
                v-model="refraction.autorefraction.right.axis"
              />
            </div>
          </div>
          <div class="flex-container">
            <div style="width: 30px; font-weight: bold">LE:</div>
            <div class="group-header">
              <input
                style="width: 90%"
                @change="refraction.save()"
                v-model="refraction.autorefraction.left.sphere"
              />
            </div>
            <div class="group-header">
              <input
                style="width: 90%"
                @change="refraction.save()"
                v-model="refraction.autorefraction.left.cylinder"
              />
            </div>
            <div class="group-header">
              <input
                style="width: 90%"
                @change="refraction.save()"
                v-model="refraction.autorefraction.left.axis"
              />
            </div>
          </div>
        </div>
      </div>
      <div style="margin-right: 20px">
        <div class="v-headers" style="font-weight: bold; padding-left: 30px">
          Present glasses
        </div>
        <div>
          <div class="flex-container">
            <div style="width: 30px">&nbsp;</div>
            <div class="group-header">Sphere</div>
            <div class="group-header">Cylinder</div>
            <div class="group-header">Axis</div>
            <div class="group-header">Near Add</div>
          </div>
          <div class="flex-container">
            <div style="width: 30px; font-weight: bold">RE:</div>
            <div class="group-header">
              <input
                style="width: 90%"
                @change="refraction.save()"
                v-model="refraction.present_glasses.right.sphere"
              />
            </div>
            <div class="group-header">
              <input
                style="width: 90%"
                @change="refraction.save()"
                v-model="refraction.present_glasses.right.cylinder"
              />
            </div>
            <div class="group-header">
              <input
                style="width: 90%"
                @change="refraction.save()"
                v-model="refraction.present_glasses.right.axis"
              />
            </div>
            <div class="group-header">
              <input
                style="width: 90%"
                @change="refraction.save()"
                v-model="refraction.present_glasses.right.near_add"
              />
            </div>
          </div>
          <div class="flex-container">
            <div style="width: 30px; font-weight: bold">LE:</div>
            <div class="group-header">
              <input
                style="width: 90%"
                @change="refraction.save()"
                v-model="refraction.present_glasses.left.sphere"
              />
            </div>
            <div class="group-header">
              <input
                style="width: 90%"
                @change="refraction.save()"
                v-model="refraction.present_glasses.left.cylinder"
              />
            </div>
            <div class="group-header">
              <input
                style="width: 90%"
                @change="refraction.save()"
                v-model="refraction.present_glasses.left.axis"
              />
            </div>
            <div class="group-header">
              <input
                style="width: 90%"
                @change="refraction.save()"
                v-model="refraction.present_glasses.left.near_add"
              />
            </div>
          </div>
        </div>
      </div>
      
    </div>
    <div class="flex-container">
      <div style="margin-right: 20px">
        <div class="v-headers" style="font-weight: bold; padding-left: 30px">
          Intra-Ocular Pressure - IOP
        </div>

        <div>
          <div class="flex-container">
            <div style="width: 30px">&nbsp;</div>
            <div class="group-header-iop">I-Care</div>
            <div class="group-header-iop">Air-Puff</div>
          </div>
          <div class="flex-container">
            <div style="width: 30px; font-weight: bold">RE:</div>
            <div class="group-header-iop">
              <input
                style="width: 60%;font-weight:bold"
                @change="refraction.save()"
                v-model="refraction.intra_ocular_pressure.right.i_care"
              />
              <span>mm/Hg</span>
            </div>
            <div class="group-header-iop">
              <input
                style="width: 60%;font-weight:bold"
                @change="refraction.save()"
                v-model="refraction.intra_ocular_pressure.right.air_puff"
              />
              <span>mm/Hg</span>
            </div>
          </div>
          <div class="flex-container">
            <div style="width: 30px; font-weight: bold">LE:</div>
            <div class="group-header-iop">
              <input
                style="width: 60%;font-weight:bold"
                @change="refraction.save()"
                v-model="refraction.intra_ocular_pressure.left.i_care"
              />
              <span>mm/Hg</span>
            </div>
            <div class="group-header-iop">
              <input
                style="width: 60%;font-weight:bold"
                @change="refraction.save()"
                v-model="refraction.intra_ocular_pressure.left.air_puff"
              />
              <span>mm/Hg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
      <div class="ma-3">
        <h4>Pupillary Distance</h4>
        <v-row class="mt-3">
          <v-col cols="6" sm="6">
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

    <v-col cols="12" v-if="showComponent('nurse_notes')">
      <v-textarea
        label="Nurse's notes"
        v-model="vital.nurse_notes"
        outline
        @change="vital.save()"
      ></v-textarea>
    </v-col>
  </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import Vital from "@evaluation/libs/vitals/Vital";
import Visit from "@reception/libs/visits/Visit";
import Refraction from "@evaluation/libs/refraction/Refraction";
import OphthalmologistObj from "@evaluation/libs/Ophthalmologist/Ophthalmologist";

export default {
  data: () => ({
    refraction: new Refraction(),
    ophthalmologistObj: new OphthalmologistObj(),

    vital: new Vital(),
    visitObj: new Visit(),
  }),

  watch: {
    getRefraction(val) {
      if (val.length > 0) {
        this.refraction.assemble(val[0]);2
      }
    },
    getPrescribeEyewear(val) {
      if (val && val.eyewear_processing.length > 0) {
        this.ophthalmologistObj.eyewear_pres = val.eyewear_processing[0];
      }
    },

    visit(value) {
      if (value) {
        const vitals = value.vitals;
        this.vital.populate(vitals);
      }
    },
  },

  computed: {

    visit() {
      return this.visitObj.selectedVisit;
    },
  },

  methods: {

    showComponent(component) {
      if (!this.msetting("evaluation.remove_" + component)) {
        if (this.vitalsToShow && this.vitalsToShow.length > 0) {
          return this.vitalsToShow.includes(component);
        } else {
          return true;
        }
      }
    },
    async fetchPrescribeEyewear(){
      try {
                    const response =  await this.ophthalmologistObj.fetchEyewearPres(this.$route.params.visitId);
                    
                  
                    const data = response;

                    if (data) {
                
                        if (data.eyewear_pres) {
                          
                          this.ophthalmologistObj.eyewear_pres.right.pupillary_distance =data.eyewear_pres.right.pupillary_distance;

                        }
                    }
                } catch (error) {
                    console.error("Error fetching refraction form data:", error);
                }
    },
    async fetchRefractionData() {
    try {
            
            // Assuming refraction.fetchRefractionData is an API call that takes params
                const response = await this.refraction.fetchRefractionData( this.$route.params.visitId ); 
           
         let data = response[0];

      if (data?.present_glasses) {

            // For the right eye (RE)
            if (data.present_glasses.right) {
                this.refraction.present_glasses.right.sphere = data.present_glasses.right.sphere;
                this.refraction.present_glasses.right.cylinder = data.present_glasses.right.cylinder;
                this.refraction.present_glasses.right.axis = data.present_glasses.right.axis;
                this.refraction.present_glasses.right.near_add = data.present_glasses.right.near_add;
            }
            
            // For the left eye (LE)
            if (data.present_glasses.left) {
                this.refraction.present_glasses.left.sphere = data.present_glasses.left.sphere;
                this.refraction.present_glasses.left.cylinder = data.present_glasses.left.cylinder;
                this.refraction.present_glasses.left.axis = data.present_glasses.left.axis;
                this.refraction.present_glasses.left.near_add = data.present_glasses.left.near_add;
            }
        }
         // Update Intra-Ocular Pressure (IOP) fields if present
         if (data?.intra_ocular_pressure) {
            // For the right eye (RE)
            if (data.intra_ocular_pressure.right) {
                this.refraction.intra_ocular_pressure.right.i_care = data.intra_ocular_pressure.right.i_care;
                this.refraction.intra_ocular_pressure.right.air_puff = data.intra_ocular_pressure.right.air_puff;
            }

            // For the left eye (LE)
            if (data.intra_ocular_pressure.left) {
                this.refraction.intra_ocular_pressure.left.i_care = data.intra_ocular_pressure.left.i_care;
                this.refraction.intra_ocular_pressure.left.air_puff = data.intra_ocular_pressure.left.air_puff;
            }
          }


           // Update Unaided VA values
        if (data?.unaided_va) {
            if (data.unaided_va.right !== null) {
                this.refraction.unaided_va.right = data.unaided_va.right;
            }
            if (data.unaided_va.left !== null) {
                this.refraction.unaided_va.left = data.unaided_va.left;
            }
            if (data.unaided_va.ou !== null) {
                this.refraction.unaided_va.ou = data.unaided_va.ou;
            }
        }


            // Update Aided Spectacles VA values
    if (data?.aided_spectacles_va) {
        if (data.aided_spectacles_va.right !== null) {
            this.refraction.aided_spectacles_va.right = data.aided_spectacles_va.right;
        }
        if (data.aided_spectacles_va.left !== null) {
            this.refraction.aided_spectacles_va.left = data.aided_spectacles_va.left;
        }
        if (data.aided_spectacles_va.ou !== null) {
            this.refraction.aided_spectacles_va.ou = data.aided_spectacles_va.ou;
        }
    }

      // Update Aided Contact VA values
      if (data?.aided_contact_va) {
        if (data.aided_contact_va.right !== null) {
            this.refraction.aided_contact_va.right = data.aided_contact_va.right;
        }
        if (data.aided_contact_va.left !== null) {
            this.refraction.aided_contact_va.left = data.aided_contact_va.left;
        }
        if (data.aided_contact_va.ou !== null) {
            this.refraction.aided_contact_va.ou = data.aided_contact_va.ou;
        }
    }

    if (data?.unaided_near_va) {
        if (data.unaided_near_va.right !== null) {
            this.refraction.unaided_near_va.right = data.unaided_near_va.right;
        }
        if (data.unaided_near_va.left !== null) {
            this.refraction.unaided_near_va.left = data.unaided_near_va.left;
        }
        if (data.unaided_near_va.ou !== null) {
            this.refraction.unaided_near_va.ou = data.unaided_near_va.ou;
        }
    }


    if (data?.aided_near_va) {
        if (data.aided_near_va.right !== null) {
            this.refraction.aided_near_va.right = data.aided_near_va.right;
        }
        if (data.aided_near_va.left !== null) {
            this.refraction.aided_near_va.left = data.aided_near_va.left;
        }
        if (data.aided_near_va.ou !== null) {
            this.refraction.aided_near_va.ou = data.aided_near_va.ou;
        }
    }

    if (data?.pinhole_va) {
        if (data.pinhole_va.right !== null) {
            this.refraction.pinhole_va.right = data.pinhole_va.right;
        }
        if (data.pinhole_va.left !== null) {
            this.refraction.pinhole_va.left = data.pinhole_va.left;
        }
        if (data.pinhole_va.ou !== null) {
            this.refraction.pinhole_va.ou = data.pinhole_va.ou;
        }
    }

     // Update Autorefraction values for Right Eye (RE)
     if (data?.autorefraction && data.autorefraction.right) {
        if (data.autorefraction.right.sphere !== null) {
            this.refraction.autorefraction.right.sphere = data.autorefraction.right.sphere;
        }
        if (data.autorefraction.right.cylinder !== null) {
            this.refraction.autorefraction.right.cylinder = data.autorefraction.right.cylinder;
        }
        if (data.autorefraction.right.axis !== null) {
            this.refraction.autorefraction.right.axis = data.autorefraction.right.axis;
        }
    }


    //Update Autorefraction values for Left Eye (LE)
      if(data?.autorefraction && data.autorefraction.left){
        if(data.autorefraction.left.sphere !== null){
          this.refraction.autorefraction.left.sphere = data.autorefraction.left.sphere;
        }
        if(data.autorefraction.left.cylinder !== null){
          this.refraction.autorefraction.left.cylinder = data.autorefraction.left.cylinder;

        }
        if(data.autorefraction.left.axis !== null){
          this.refraction.autorefraction.left.axis = data.autorefraction.left.axis;
        }

      } 
    // Update Nurse's Notes
    if (data?.nurse_notes !== null) {
        this.vital.nurse_notes = data?.nurse_notes;
    }

            } catch (error) {
            console.error('Error fetching refraction data:', error);
            }
    },

  },

  mounted() {
    this.vital.visit = this.$route.params.visitId;
    this.visitObj.find(this.vital.visit);
    this.refraction.visit_id = this.$route.params.visitId;
    this.fetchRefractionData();
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

.inline-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-weight:bold;
}

h6 {
  font-weight: bold;
  margin: 0;
  font-size: 15px;
}

.el-label {
  margin: 0 10px;
}

.flex-container {
  display: flex;
}

.group-header {
  font-weight: bold;
  width: 100px;
}
.group-header-iop {
  font-weight: bold;
  width: 150px;
  display: flex;
}

.v-headers {
  margin: 30px 0;
}
p {
  font-weight: bold;
}
</style>
