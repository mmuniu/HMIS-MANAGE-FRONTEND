<template>
  <div v-if="!initialised"></div>
  <div v-else>
    <form @submit.prevent="!ageGroupData ? saveAgeGroup() : updateAgeGroup()">
      <v-row >
        <v-col cols="12" md="3">
          <div class="mx-3">
            <v-text-field label="Lower value" v-model="ageGroup.lower_value" :error="errors.has('name')" outline
                          :hint="errors.get('name')" persistent-hint @keyup="errors.clear('name')"></v-text-field>
          </div>
        </v-col>
        <v-col cols="12" md="3" v-if="configurations">
          <div class="mx-3">
            <v-select label="Age in" :items="configurations.age_in" item-text="item_name" item-value="item_name"
                      v-model="ageGroup.lower_in" outline></v-select>
          </div>
        </v-col>

        <v-col cols="12" md="3">
          <div class="mx-3">
            <v-text-field label="Upper value" v-model="ageGroup.upper_value" :error="errors.has('name')" outline
                          :hint="errors.get('name')" persistent-hint @keyup="errors.clear('name')"></v-text-field>
          </div>
        </v-col>

        <v-col cols="12" md="3" v-if="configurations">
          <div class="mx-3">
            <v-select label="Age in" :items="configurations.age_in" item-text="item_name" item-value="item_name"
                      v-model="ageGroup.upper_in" outline
            ></v-select>
          </div>
        </v-col>


      </v-row>
      <v-row>
        <v-col offset-md="10" cols="12" >
          <div>
            <v-btn v-if="!ageGroupData" small type="submit" class="blue lighten-1" color="blue" large
                   :dark="!loader" :loading="loader" :disabled="loader">
              Save
            </v-btn>

            <v-btn v-else type="submit" class="blue lighten-1" color="blue" large
                   :dark="!loader" :loading="loader" :disabled="loader">
              update
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </form>
  </div>
</template>
<script>
import AgeGroup from '@evaluation/libs/setup/age_groups/AgeGroup';
import SettingsOptions from '@settings/libs/SettingsOptions';
import { mapGetters, mapActions } from 'vuex';

export default {
  props: [
    'ageGroupData',
  ],

  data: () => ({
    ageGroup: new AgeGroup(),
    loader: false,
    options: new SettingsOptions(),
  }),

  watch: {
    contaminated(value) {
      if (value) {
        this.loader = false;
        this.ageGroup.form.errorDetected = false;
      }
    },

    submitted(value) {
      if (value) {
        this.loader = false;
        this.ageGroup.form.submitted = false;
      }
    },

    ageGroupData: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.ageGroup.id = newValue.id;
          this.ageGroup.lower_value = this.stripNonNumeric(newValue.lower_value);
          this.ageGroup.lower_in = newValue.lower_in;
          this.ageGroup.upper_value = this.stripNonNumeric(newValue.upper_value);
          this.ageGroup.upper_in = newValue.upper_in;


          // Force update the v-select components
          this.$nextTick(() => {
            this.ageGroup.lower_in = newValue.lower_in;
            this.ageGroup.upper_in = newValue.upper_in;
          });

        }
      }
    }
  },

  computed: {
    errors() {
      return this.ageGroup.form.errors;
    },

    configurations() {
      return this.options.configurations;
    },

    submitted() {
      return this.ageGroup.form.submitted;
    },

    initialised() {
      return this.options;
    },

    contaminated() {
      return this.ageGroup.form.errorDetected;
    },
  },

  methods: {
    ...mapActions([
      'setAgeGroups',
    ]),

    saveAgeGroup() {
      this.loader = true;
      this.ageGroup.save();
      this.setAgeGroups();
      this.loader = false;
    },
    stripNonNumeric(value) {
      return value.replace(/\D/g, '');
    },

    updateAgeGroup() {
      this.loader = true;
      this.ageGroup.update(this.ageGroup);
      this.setAgeGroups();
      this.loader = false;
    },
  },

  mounted() {
    this.options.config([
      'age_in',
    ]);
  },
};
</script>
