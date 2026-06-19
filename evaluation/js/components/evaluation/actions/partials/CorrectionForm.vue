<template>

  <div>
    <v-row>
      <v-col cols="12" sm="5">
              <v-row>
                <v-col>

                  <h6 class="text-center">Right</h6>

                  <div>
                    <v-select
                        :items="['Glass', 'Plastic']"
                        v-model="ophthalmologistObj.eyewear_pres.right.lens_type"
                        dense
                        label="Lens type">
                    </v-select>
                  </div>
                  <div>
                    <v-select
                        v-model="ophthalmologistObj.eyewear_pres.right.bifocal_type"
                        dense
                        :items="['Progressive', 'Disegment', 'Single vision', 'Bifocal']"
                        label="Type of bifocal">
                    </v-select>
                  </div>
                  <div>
                    <v-text-field
                        v-model="ophthalmologistObj.eyewear_pres.right.segment_height"
                        dense
                        label="Segment height (12 and 14)">
                    </v-text-field>
                  </div>
                  <div>
                    <v-text-field
                        v-model="ophthalmologistObj.eyewear_pres.right.pupillary_distance"
                        dense
                        label="Pupillary distance (50 and 80) mm"">
                    </v-text-field>
                  </div>
                  <div>
                    <v-select
                        v-model="ophthalmologistObj.eyewear_pres.right.tint"
                        dense
                        :items="['White', 'Grey', 'Brown', 'Other']"
                        label="Tint">
                    </v-select>
                  </div>
                </v-col>
                <v-col>
                  <h6 class="text-center">Left</h6>

                  <div>
                    <v-select
                        v-model="ophthalmologistObj.eyewear_pres.left.lens_type"
                        dense
                        :items="['Glass', 'Plastic']"
                        label="Lens type">
                    </v-select>
                  </div>
                  <div>
                    <v-select
                        v-model="ophthalmologistObj.eyewear_pres.left.bifocal_type"
                        dense
                        :items="['Progressive', 'Disegment', 'Single vision', 'Bifocal']"
                        label="Type of bifocal">
                    </v-select>
                  </div>
                  <div>
                    <v-text-field
                        v-model="ophthalmologistObj.eyewear_pres.left.segment_height"
                        dense
                        min="12"
                        max="14"
                        type="number"
                        label="Segment height (12 and 14)">
                    </v-text-field>
                  </div>
                  <div>
                    <v-text-field
                        v-model="ophthalmologistObj.eyewear_pres.left.pupillary_distance"
                        dense
                        min="50"
                        max="80"
                        type="number"
                        label="Pupillary distance (50 and 80) mm">
                    </v-text-field>
                  </div>
                  <div>
                    <v-select
                        v-model="ophthalmologistObj.eyewear_pres.left.tint"
                        dense
                        :items="['White', 'Grey', 'Brown', 'Other']"
                        label="Tint">
                    </v-select>
                  </div>
                </v-col>
              </v-row>
            </v-col>
      <v-divider
          class="mx-4"
          vertical
      ></v-divider>
      <v-col cols="12" sm="5">
              <v-row>
                <v-col>

                  <h6 class="text-center">Right</h6>

                  <div>
                    <v-select
                        :items="['Glass', 'Plastic']"
                        v-model="ophthalmologistObj.eyewear_pres.right.lens_type"
                        dense
                        label="Lens type">
                    </v-select>
                  </div>
                  <div>
                    <v-select
                        v-model="ophthalmologistObj.eyewear_pres.right.bifocal_type"
                        dense
                        :items="['Progressive', 'Disegment', 'Single vision', 'Bifocal']"
                        label="Type of bifocal">
                    </v-select>
                  </div>
                  <div>
                    <v-text-field
                        v-model="ophthalmologistObj.eyewear_pres.right.segment_height"
                        dense
                        label="Segment height (12 and 14)">
                    </v-text-field>
                  </div>
                  <div>
                    <v-text-field
                        v-model="ophthalmologistObj.eyewear_pres.right.pupillary_distance"
                        dense
                        label="Pupillary distance (50 and 80) mm"">
                    </v-text-field>
                  </div>
                  <div>
                    <v-select
                        v-model="ophthalmologistObj.eyewear_pres.right.tint"
                        dense
                        :items="['White', 'Grey', 'Brown', 'Other']"
                        label="Tint">
                    </v-select>
                  </div>
                </v-col>
                <v-col>
                  <h6 class="text-center">Left</h6>

                  <div>
                    <v-select
                        v-model="ophthalmologistObj.eyewear_pres.left.lens_type"
                        dense
                        :items="['Glass', 'Plastic']"
                        label="Lens type">
                    </v-select>
                  </div>
                  <div>
                    <v-select
                        v-model="ophthalmologistObj.eyewear_pres.left.bifocal_type"
                        dense
                        :items="['Progressive', 'Disegment', 'Single vision', 'Bifocal']"
                        label="Type of bifocal">
                    </v-select>
                  </div>
                  <div>
                    <v-text-field
                        v-model="ophthalmologistObj.eyewear_pres.left.segment_height"
                        dense
                        min="12"
                        max="14"
                        type="number"
                        label="Segment height (12 and 14)">
                    </v-text-field>
                  </div>
                  <div>
                    <v-text-field
                        v-model="ophthalmologistObj.eyewear_pres.left.pupillary_distance"
                        dense
                        min="50"
                        max="80"
                        type="number"
                        label="Pupillary distance (50 and 80) mm">
                    </v-text-field>
                  </div>
                  <div>
                    <v-select
                        v-model="ophthalmologistObj.eyewear_pres.left.tint"
                        dense
                        :items="['White', 'Grey', 'Brown', 'Other']"
                        label="Tint">
                    </v-select>
                  </div>
                </v-col>
              </v-row>
            </v-col>

    </v-row>
  </div>

</template>

<script>
import { mapActions, mapGetters } from "vuex";
import OphthalmologistObj from "@evaluation/libs/Ophthalmologist/Ophthalmologist";

export default {
  name: "CorrectionForm",
  data: () => ({
    ophthalmologistObj: new OphthalmologistObj(),
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

</style>