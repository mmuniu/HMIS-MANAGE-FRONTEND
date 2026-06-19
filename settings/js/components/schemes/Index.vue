<template>
  <v-card flat>
    <collabmed-floating-loader v-if="schemes.length < 0"></collabmed-floating-loader>

    <!-- list of schemes -->
    <v-card flat v-else>
      <v-card-title>
        <v-btn small color="primary" @click="addNewScheme()">Add new</v-btn>
        <v-spacer></v-spacer>
        <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
        ></v-text-field>
      </v-card-title>
      <template>
        <v-data-table
            :headers="headers"
            :items="schemes.data"
            :search="search"
            class="elevation-1"
        >
          <template v-slot:item.status="{ item }">
            <v-chip small color="success" outlined v-if="item.status">Active</v-chip>
            <v-chip small color="error" outlined v-else>Inactive</v-chip>
          </template>
          <template v-slot:item.items="{ item }">
            <v-btn outlined color="primary" small class="pr-2" @click="viewExclusionsAndPricing(item, 'procedures')">Procedures </v-btn>
            <v-btn outlined color="primary" small class="pr-2" @click="viewExclusionsAndPricing(item, 'products')">Products </v-btn>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn small color="primary" @click="updateSchemeInfo(item)">Edit</v-btn>
            <v-btn small color="error" class="white--text" v-if="item.status" @click="scheme.changeStatus(item.id)">inactivate</v-btn>
            <v-btn small color="teal" class="white--text" v-else @click="scheme.changeStatus(item.id)">activate</v-btn>
          </template>
        </v-data-table>
      </template>
    </v-card>


    <!-- create new scheme -->
    <v-dialog v-model="dialog" persistent max-width="900" >
      <v-card>
        <v-card-title class="text-h5 primary">
          <span class="white--text"> <span v-if="!editing">Add New</span> <span v-else>Edit</span> Scheme</span>
          <v-btn icon dark @click.native="closeDialog()" absolute right>
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-row  >
            <v-col class="px4" md="4">
              <v-autocomplete :items="insurances.companies"
                              class="px-3"
                              :disabled="editing"
                              item-text="name" item-value="id"
                              v-model="scheme.scheme_data.company"
                              label="Company" outlined
              ></v-autocomplete>
            </v-col>
            <v-col class="px4" md="4">
              <v-text-field
                  class="px-3"
                  outlined flat
                  label="Scheme name"
                  v-model="scheme.scheme_data.name"
                  persistent-hint>
              </v-text-field>
            </v-col>
            <v-col class="px4" md="4">
              <v-autocomplete :items="scheme_types"
                              class="px-3"
                              item-text="text" item-value="value"
                              label="Scheme Type"
                              v-model="scheme.scheme_data.type_id"
                              outlined
              ></v-autocomplete>
            </v-col>
          </v-row>
          <v-row  >
            <v-col class="px4" md="4">
              <v-text-field
                  class="px-3"
                  outlined flat
                  v-model="scheme.scheme_data.amount"
                  :label="scheme.scheme_data.type_id === 4 ? 'Capitation Amount' : 'Amount'"
                  :disabled="scheme.scheme_data.type_id === 1 || !scheme.scheme_data.type_id"
                  persistent-hint>
              </v-text-field>
            </v-col>
            <v-col class="px4" md="4" v-if="scheme.scheme_data.type_id === 4 || scheme.scheme_data.type_id === 6">
              <v-text-field
                  class="px-3"
                  outlined flat
                  v-model="scheme.scheme_data.capitation_copay_amount"
                  label="Copay Amount"
                  persistent-hint>
              </v-text-field>
            </v-col>
            <v-col class="px4" md="4">
              <v-text-field
                  class="px-3"
                  outlined flat
                  label="Attention"
                  v-model="scheme.scheme_data.attention"
                  persistent-hint>
              </v-text-field>
            </v-col>

            <v-col class="px4" md="4">
              <v-text-field
                  class="px-3"
                  outlined flat
                  label="Procurring officer name"
                  v-model="scheme.scheme_data.procuring_officer_name"
                  persistent-hint>
              </v-text-field>
            </v-col>
            <v-col class="px4" md="4">
              <collabmed-date-time-picker
                  outlined class="px-3"
                  dateOnly  @input="setEffectiveDate"
                  :datetime="scheme.scheme_data.effective_date"
                  label="Effective date ">
              </collabmed-date-time-picker>
            </v-col>

            <v-col class="px4" md="4">
              <collabmed-date-time-picker outlined class="px-3"
                                          dateOnly  @input="setExpiryDate"
                                          :datetime="scheme.scheme_data.expiry_date"
                                          label="Expiry date ">
              </collabmed-date-time-picker>
            </v-col>

            <v-col class="px4" md="4">
              <v-switch
                  label="Smart enabled"
                  v-model="scheme.scheme_data.smart_enabled"
              ></v-switch>
            </v-col>
            <v-col class="px4" md="4">
              <v-switch
                  label="Age restricted"
                  v-model="scheme.scheme_data.age_restricted"
              ></v-switch>
            </v-col>
            <v-col v-if="scheme.scheme_data.age_restricted === true" class="px4" md="4">
              <vue-slider
                  v-model="ageRange"
                  :min="1"
                  :max="100"
                  :interval="1"
                  :tooltip="'always'"
                  :tooltip-position="'top'"
                  :tooltip-formatter="formatAge"
              ></vue-slider>
            </v-col>

            <v-col v-if="showAgeSlide" class="px4" md="4">
              <vue-slider
                  v-model="ageRange"
                  :min="1"
                  :max="100"
                  :interval="1"
                  :tooltip="'always'"
                  :tooltip-position="'top'"
                  :tooltip-formatter="formatAgeRangeTooltip"
              ></vue-slider>
            </v-col>


            <v-col class="px4" md="4">
              <v-switch
                  label="Gender restricted"
                  v-model="scheme.scheme_data.gender_restricted"
              >
              </v-switch>
            </v-col>
            <v-col class="px4" v-if="scheme.scheme_data.gender_restricted === true" md="4">
              <v-autocomplete :items="gender"
                              class="px-3"
                              item-text="text" item-value="value"
                              label="Gender"
                              v-model="scheme.scheme_data.gender"
                              outlined
              ></v-autocomplete>
            </v-col>
          </v-row>
          <v-row>
          </v-row>
          <v-row>
            <v-col class="px4" md="4">
              <v-switch
                  label="Policy Number Compulsory"
                  v-model="scheme.scheme_data.policy_number_compulsory"
              ></v-switch>
            </v-col>
          </v-row>

          <v-row >
            <v-col cols="12">
              <v-btn small color="success" v-if="!editing" @click="save()">save</v-btn>
              <v-btn small color="success" @click="updateSchemeData()" v-else>update</v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Scheme from '@settings/libs/schemes/Scheme';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

export default {
  components: {
    VueSlider,
  },
  data: () => ({
    search: '',
    dialog: false,
    scheme: new Scheme(),

    showAgeSlide: false,
    ageRange: [1, 100], // Initialize age range

    rowsPerPageItems: [10, 20, 30,
      {
        text: '$vuetify.dataIterator.rowsPerPageAll',
        value: -1,
      }],
    pagination: {
      rowsPerPage: 10,
    },
    headers: [
      { text: 'Name', value: 'name' },
      { text: 'company', value: 'company_name' },
      { text: 'Type', value: 'type_name' },
      { text: 'Status', value: 'status' },
      { text: 'Drugs & Procedure Exclusions', value: 'items', sortable: false },
      { text: 'Actions', value: 'actions', sortable: false },

    ],
    editing: false,
    scheme_types: [
      { text: 'Full', value: 1 },
      { text: 'Capitation', value: 2 },
      { text: 'Copay', value: 3 },
      { text: 'Capitation with copay', value: 4 },
      { text: 'Average Cost', value: 5 },
      { text: 'Average Cost with copay', value: 6 },
    ],
    gender: [
      { text: 'Male', value: 'male' },
      { text: 'Female', value: 'female' },

    ],
  }),

  computed: {
    ...mapGetters({
      schemes: 'getSchemes',
      insurances: 'getInsurances',
    }),
    ageRangeString() {
      // Serialize ageRange array to a string
      return this.ageRange.join('-');
    },
    showAgeSlider() {
      return this.scheme.scheme_data.age_restricted && this.scheme.age_range;
    },
  },
  watch: {
    ageRangeString(newValue) {
      // Update age_restricted property with the serialized age range
      this.scheme.scheme_data.age_range = newValue;
    },

  },


  methods: {
    ...mapActions([
      'setSchemes', 'setInsurances',
    ]),
    formatAge(value) {
      return value + ' years';
    },
    formatAgeRangeTooltip(val, index) {
      if (index === 0) {
        return `${val}`;
      } else {
        return `${val}`;
      }
    },

    setEffectiveDate(date) {
      this.scheme.scheme_data.effective_date = date;
    },
    setExpiryDate(date) {
      this.scheme.scheme_data.expiry_date = date;
    },

    addNewScheme() {
      this.dialog = true;
    },

    closeDialog() {
      this.dialog = false;
      this.scheme.resetSchemeInfo();
      this.editing = false;
      this.showAgeSlide = false;
      this.ageRange = [1, 100];// Initialize age range
    },

    save() {
      const self = this;

      this.performChecks();

      this.scheme.saveScheme().then((response) => {
        self.dialog = false;
        self.setSchemes();
      });
    },


    performChecks() {
      if (this.scheme.scheme_data.type_id > 1) {
        if (this.scheme.scheme_data.amount === null) {
          return response({
            message: 'Please specify the amount',
            alert: 'error',
          });
        }
      }
    },

    updateSchemeData() {
      const self = this;

      this.performChecks();

      this.scheme.updateScheme().then((response) => {
        self.dialog = false;
        self.setSchemes();
      });
    },

    updateSchemeInfo(scheme) {
      this.editing = true;
      this.scheme.scheme_data.scheme_id = scheme.id;
      this.scheme.scheme_data.company = scheme.company.id;
      this.scheme.scheme_data.name = scheme.name;
      this.scheme.scheme_data.type_id = scheme.type_id;
      this.scheme.scheme_data.amount = scheme.amount;
      this.scheme.scheme_data.attention = scheme.attention;
      // this.scheme.scheme_data.effective_date = scheme.effective_date;
      // this.scheme.scheme_data.expiry_date = scheme.expiry_date;
      this.scheme.scheme_data.smart_enabled = scheme.smart_enabled;
      this.scheme.scheme_data.age_range = scheme.age_range;
      // Set age range and showAgeSlide only if scheme.age_range has values
      if (scheme.age_range && scheme.age_range.trim() !== '') {
        this.ageRange = scheme.age_range.split('-').map(Number);
        this.showAgeSlide = true;
        this.scheme.scheme_data.age_restricted = true;
      } else {
        this.showAgeSlide = false;
      }

      this.scheme.scheme_data.age_restricted = scheme.age_restricted;
      this.scheme.scheme_data.gender_restricted = scheme.gender_restricted;
      this.scheme.scheme_data.gender = scheme.gender;
      if (scheme.gender && scheme.gender.trim() !== '') {
        this.scheme.scheme_data.gender_restricted = true;
      }
      this.scheme.scheme_data.policy_number_compulsory = scheme.policy_number_compulsory;
      this.dialog = true;
    },

    viewExclusionsAndPrices(scheme) {
      window.open(route('settings.exclusions.index', scheme.id), '_self');
    },

    viewExclusionsAndPricing(scheme, type) {
      window.open(route('settings.exclusions-and-pricing.index', scheme.id) + '?type=' + type, '_self');
    },
  },

  mounted() {
    this.setSchemes();
    this.setInsurances();
  },
};
</script>
