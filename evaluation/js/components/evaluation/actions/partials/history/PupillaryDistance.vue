<template>
    <div class="ma-3">
      <h4>Pupillary Distance History</h4>
      <v-row class="mt-3">
        <v-col cols="12" sm="12">
          <v-row>
            <v-col>
              <div>
                <v-text-field
                  :value="formattedPupillaryDistance.right"
                  dense
                  readonly
                  label="Pupillary Distance (50-80 mm)"
                ></v-text-field>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>
  </template>
  
  <script>
  export default {
    name: "PupillaryDistanceHistory",
    props: {
      items: {
        type: Object,
        required: true
      }
    },
    computed: {
      formattedPupillaryDistance() {
        return {
          right: this.items?.right?.pupillary_distance ?? "-",
          left: this.items?.left?.pupillary_distance ?? "-"
        };
      }
    }
  };
  </script>
  