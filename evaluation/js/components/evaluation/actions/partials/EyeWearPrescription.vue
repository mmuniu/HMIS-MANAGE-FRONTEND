<template>
    <div>
      <v-expansion-panels
          multiple
      >
        <!--     Correction Type      -->
        <v-expansion-panel>
          <v-expansion-panel-header>
            <v-row>
              <v-col cols="4">
                <div class="panel-header">
                  CORRECTION TYPE
                </div>
              </v-col>
            </v-row>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div>
            <div class="row"  style="margin-top: 25px;">
              <div class="col-6">
                <input type="checkbox" id="spectacles" value="spectacles" v-model="checkedNames">
                <label for="spectacles">Spectacles</label>
                <v-row style="padding-top: 25px;">
                  <v-col cols="12">
                    <v-row>
                      <h4>Lens</h4>
                      <v-col>

                        <h6 class="text-center">Right</h6>

                        <div>
                          <v-select
                              :items="['Prism and Sun wear','Single Vision','Bifocal','Progressive']"
                              v-model="ophthalmologistObj.correction_type.right.lens_type"
                              dense
                              label="Lens type">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type.right.lens_material"
                              dense
                              :items="['Glass','Plastic','Polycarbonate/Trirex']"
                              label="Lens Material">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type.right.lens_index"
                              dense
                              :items="['1.56','1.59','1.60','1.67','1.70']"
                              label="Index">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type.right.sun_sensors"
                              dense
                              :items="['Sun Sensors','Transitions']"
                              label="Photo Chromatic Aspect">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type.right.brands"
                              dense
                              :items="['Generic', 'Essilor', 'Zeiss', 'Kodak']"
                              label="Brand">
                          </v-select>
                        </div>
                        <div>
                          <v-text-field
                              v-model="ophthalmologistObj.correction_type.right.supplier"
                              dense
                              label="Supplier">
                          </v-text-field>
                        </div>
                      </v-col>
                      <v-col>
                        <h6 class="text-center">Left</h6>

                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type.left.lens_type"
                              dense
                              :items="['Prism and Sun wear','Single Vision','Bifocal','Progressive']"
                              label="Lens type">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type.left.lens_material"
                              dense
                              :items="['Glass','Plastic','Polycarbonate/Trirex']"
                              label="Lens Material">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type.left.lens_index"
                              dense
                              :items="['1.56','1.59','1.60','1.67','1.70']"
                              label="Index">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type.left.sun_sensors"
                              dense
                              :items="['Sun Sensors','Transitions']"
                              label="Photo Chromatic Aspect">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type.right.brands"
                              dense
                              :items="['Generic', 'Essilor', 'Zeiss', 'Kodak']"
                              label="Brand">
                          </v-select>
                        </div>
                        <div>
                          <v-text-field
                              v-model="ophthalmologistObj.correction_type.right.supplier"
                              dense
                              label="Supplier">
                          </v-text-field>
                        </div>
                      </v-col>
                    </v-row>
                    <br>
                    <br>
                    <v-row>
                      <h4>Frames</h4>
                      <v-col>

                        <h6 class="text-center">Right</h6>

                        <div>
                          <v-select
                              :items="['T-90','Metal','Plastic','Titanium']"
                              v-model="ophthalmologistObj.correction_type_frames.right.frame_material"
                              dense
                              label="Frame Material">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type_frames.right.frame_type"
                              dense
                              :items="['Rimmed','Rimless','Supra','Fused']"
                              label="Frame Type">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type_frames.right.model"
                              dense
                              :items="['Not Provided','Not Provided','Not Provided']"
                              label="Model">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type_frames.right.size"
                              dense
                              :items="['Not Provided','Not Provided']"
                              label="Size">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type_frames.right.brand"
                              dense
                              :items="['Generic', 'Essilor', 'Zeiss', 'Kodak']"
                              label="Brand">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type_frames.right.color"
                              dense
                              :items="['Not given','Not given']"
                              label="Color">
                          </v-select>
                        </div>

                      </v-col>
                      <v-col>
                        <h6 class="text-center">Left</h6>

                        <div>
                          <v-select
                              :items="['T-90','Metal','Plastic','Titanium']"
                              v-model="ophthalmologistObj.correction_type_frames.left.frame_material"
                              dense
                              label="Frame Material">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type_frames.left.frame_type"
                              dense
                              :items="['Rimmed','Rimless','Supra','Fused']"
                              label="Frame Type">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type_frames.left.model"
                              dense
                              :items="['Not Provided','Not Provided','Not Provided']"
                              label="Model">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type_frames.left.size"
                              dense
                              :items="['Not Provided','Not Provided']"
                              label="Size">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type_frames.left.brand"
                              dense
                              :items="['Generic', 'Essilor', 'Zeiss', 'Kodak']"
                              label="Brand">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type_frames.left.color"
                              dense
                              :items="['Not given','Not given']"
                              label="Color">
                          </v-select>
                        </div>
                      </v-col>
                    </v-row>

                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-btn small color="primary" @click="save()">
                      save
                    </v-btn>
                  </v-col>
                </v-row>


              </div>
              <div class="col-6">

                <input type="checkbox" id="lens" value="lens" v-model="checkedNames">
                <label for="lens">Contact Lens</label>
                <v-row style="padding-top: 25px;">
                  <v-col cols="12">
                    <v-row>
                      <v-col>
                        <h6 class="text-center">Right</h6>

                        <div>
                          <v-select
                              :items="['Prism and Sun wear','Single Vision','Bifocal','Progressive']"
                              v-model="ophthalmologistObj.correction_type.right.lens_type"
                              dense
                              label="Type of Contact">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type.right.brands"
                              dense
                              :items="['Generic', 'Essilor', 'Zeiss', 'Kodak']"
                              label="Brand">
                          </v-select>
                        </div>
                        <div>
                          <v-text-field
                              v-model="ophthalmologistObj.correction_type.right.supplier"
                              dense
                              label="Supplier">
                          </v-text-field>
                        </div>
                      </v-col>
                      <v-col>
                        <h6 class="text-center">Left</h6>

                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type.left.lens_type"
                              dense
                              :items="['Prism and Sun wear','Single Vision','Bifocal','Progressive']"
                              label="Type of Contact">
                          </v-select>
                        </div>
                        <div>
                          <v-select
                              v-model="ophthalmologistObj.correction_type.right.brands"
                              dense
                              :items="['Generic', 'Essilor', 'Zeiss', 'Kodak']"
                              label="Brand">
                          </v-select>
                        </div>
                        <div>
                          <v-text-field
                              v-model="ophthalmologistObj.correction_type.right.supplier"
                              dense
                              label="Supplier">
                          </v-text-field>
                        </div>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-btn small color="primary" @click="save()">
                      save
                    </v-btn>
                  </v-col>
                </v-row>


              </div>
                </div>

            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <!--     Optical Notes       -->
<!-- 
        <v-expansion-panel>
          <v-expansion-panel-header>
            <v-row>
              <v-col cols="4">
                <div class="panel-header">
                  OPTICAL NOTES
                </div>
              </v-col>
            </v-row>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div>

            </div>
          </v-expansion-panel-content>
        </v-expansion-panel> -->

      </v-expansion-panels>

    </div>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import OphthalmologistObj from "@evaluation/libs/Ophthalmologist/Ophthalmologist";

export default {
    data: () => ({
        ophthalmologistObj: new OphthalmologistObj(),
        checkedNames:''

    }),

    computed: {
        ...mapGetters([
            'getPrescribeEyewear'
        ])
    },

    methods: {
        ...mapActions([
            'setPrescribeEyewear'
        ]),

        async save() {
            let response = await this.ophthalmologistObj.saveEyewearPres(this.$route.params.visitId);

            if(response) {
                this.init()
            }
        },

        init() {
            this.setPrescribeEyewear({
                params: {
                    visit_id: this.$route.params.visitId
                }
            })
        }
    },

    mounted() {
        this.init();
    }
}
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

