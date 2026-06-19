<template>
  <v-dialog v-model="dialog" persistent max-width="500">
    <v-card>
      <v-card-title class="subheading grey--text text--darken-4">
        Color code this visit

        <v-spacer></v-spacer>

        <v-btn icon color="red" small @click="close()">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider class="my-0"></v-divider>

      <v-card-text>

        <collabmed-loading v-if="!visit"></collabmed-loading>

        <div v-else style="padding:5px">
          <div  style="font-size: 15px; font-weight: bold">Patient Name: {{ visitObj.patient_name }}</div>
          <div class="form-group">
            <input type="radio" id="routine" value="1" v-model="visitObj.color_code" @change="updateColorCode(1)">
            <label for="normal">Routine</label>
          </div>

          <div class="form-group">
            <input type="radio" id="urgent" value="2" v-model="visitObj.color_code" @change="updateColorCode(2)">
            <label for="critical">Urgent</label>
          </div>
          <div class="form-group">
            <input type="radio" id="very_urgent" value="3" v-model="visitObj.color_code" @change="updateColorCode(3)">
            <label for="other"> Very urgent </label>
          </div>

          <div class="form-group">
            <input type="radio" id="emergency" value="4" v-model="visitObj.color_code" @change="updateColorCode(4)">
            <label for="other"> Emergency </label>
          </div>

        </div>

      </v-card-text>

      <v-card-actions>
        <v-btn small color="primary" @click="save()">
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import Visit from "@reception/libs/visits/Visit";

export default {
  props: [
    'show', 'visitId', 'visitObj'
  ],

  data () {
    return {
      dialog: false,
      visit: null,
      visit_id: null,
      patient: null,
      visitObject: new Visit(),
    }
  },

  computed: {
    ...mapGetters([
      'getVisits'
    ])
  },

  watch: {
    show(val) {
      if (val) {
        this.dialog = true;
      }
    },

    getVisits (val) {
      this.visit = val.data[0];
      this.visit_id = val.data[0].id;
    }
  },

  methods: {
    ...mapActions([
      'setVisits'
    ]),

    close () {
      this.dialog = false;
      this.$emit('close');
    },

    async save () {
      const response = await this.visitObject.markColorCode(this.visit_id, this.visitObj.color_code);
      this.close();
    },
    updateColorCode(code) {
      this.visitObj.color_code = code;
    },

    init() {
      this.setVisits({
        params: {
          id: this.visitId
        }
      });
      this.dialog = true;
    }
  },

  mounted () {
    if(this.visitObj) {
      this.visit = this.visitObj;
      this.visit_id = this.visitObj.id;
      this.patient = this.visitObj.patient;
      this.dialog = true;
    } else {
      this.init();
    }
  }
}
</script>
