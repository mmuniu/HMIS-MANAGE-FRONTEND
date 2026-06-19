<template>
  <collabmed-loading v-if="!initialised"></collabmed-loading>

  <form v-else @submit.prevent="save" class="long-form condensed">
    <v-container fluid class="pa-0">
      <v-row>
        <v-col class="hidden-sm-and-down" md="4">
          <h2 class="subheading ma-0 pa-0">General Tag Title Information</h2>
          <p class="body-2 py-2">Record general tag title information</p>
        </v-col>

        <v-col cols="12" md="8">
          <v-card>
            <v-card-title>
              <h2 class="subheading ma-0 pa-0">General Details</h2>
            </v-card-title>

            <v-divider class="ma-0"></v-divider>

            <v-card-text>
              <v-row>
                <v-col cols="12" md="2">
                  <label class="subheading">Procedure Tag Title</label>
                </v-col>
                <v-col cols="12" md="4">
                  <v-col cols="12" md="4">
                    <v-autocomplete clearable hide-details solo flat
                    return-object large outlined
                    prepend-inner-icon="search"
                    label="Search for a procedure tag title"
                    :items="procedureTagTitles"
                    item-text="title"  item-value="id"
                    v-model="procedureTagObject.title"
                    hide-no-data
                    no-filter

                    :loading="procedure.search.loading"

                    ></v-autocomplete>


                  </v-col>
                  </v-col>


                <v-col cols="12" md="2">
                  <label class="subheading">Procedure Tag</label>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    outlined
                    solo
                    v-model="procedureTagObject.tag"
                    :error="errors.has('tag')"
                    :hint="errors.get('tag')"
                    persistent-hint

                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
            <!-- Button to open modal -->
            <v-row>

            </v-row>
      <v-row>
        <v-col class="text-right" cols="12" offset-md="10" md="2">
          <v-btn
            color="blue"
            @click="openModal"
            large
            block
          >Add Tag Title</v-btn>
        </v-col>
        <v-col class="text-right" cols="12" offset-md="10" md="2">
          <v-btn
            type="submit"
            color="blue"
            :loading="loading"
            @click="saveProcedureDetails()"
            dark
            large
            block
          >Save Procedure Tag Details</v-btn>
        </v-col>
      </v-row>
      <v-row>
        <!-- Modal with second form -->
  <v-dialog v-model="showModal" persistent max-width="600px">
    <v-card>
      <v-card-title class="headline">General Basic Tag Information</v-card-title>

      <v-card-text>
        <form @submit.prevent="saveSecondForm" class="long-form condensed">
          <v-container fluid class="pa-0">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  outlined
                  solo
                  v-model="procedureTagObject.title"
                  label="Procedure Tag Title"
                  :error="errors.has('title')"
                  :hint="errors.get('title')"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="saveTagTitle">Save</v-btn>
        <v-btn color="blue darken-1" text @click="closeModal">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
      </v-row>
    </v-container>
  </form>

</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Procedure from '@evaluation/libs/procedures/Procedure';
import ProcedureSearch from '@inventory/components/ProductsSearch';
import ProcedureTag from '@evaluation/libs/procedures/ProcedureTag'
import { _ } from 'vue-underscore';
import ProductsSearch from "@inventory/components/ProductsSearch";
// import CKEditor from '@ckeditor/ckeditor5-vue2';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default {
  name: 'procedure-form',

  props: {
    facilities: {
      required: true,
    },

    procedureId: {
      default: null,
      type: Number,
    },
  },

  components: {
    ProductsSearch,
    // "products-search": ProcedureSearch,
  },

  data() {
    return {
      procedure: new Procedure(),
      procedureTagObject: new ProcedureTag(),
      procedureTag: null,
      procedureTagTitles: [],
      categories: null,
      labTestCategories: null,
      labTestUnits: null,
      labTestSampleTypes: null,
      labTestAdditives: null,
      loading: false,
      term: '',
      result_option: null,
      procedures: [],
      showModal: false, // Modal visibility flag
      editor: ClassicEditor,

      headers: [
        {
          text: 'Product name',
          sortable: false,
          value: 'name',
        },

        {
          text: 'Quantity',
          sortable: false,
          value: 'units',
        },

        {
          text: 'Actions',
          sortable: false,
          value: 'actions',
        },
      ],
    };
  },

  watch: {
    term( term ) {
      if (term && term.length > 2 && !this.procedure.labs.parent) {
        this.searchProcedures(term);
      }
    },

    getProcedures({ data }) {
      this.procedures = data;
    },

    getProcedureCategories({ categories }) {
      this.categories = categories;
    },

    getLabTestCategories({ data }) {
      this.labTestCategories = data;
    },

    getLabTestUnits({ data }) {
      this.labTestUnits = data;
    },

    getLabTestSampleTypes({ data }) {
      this.labTestSampleTypes = data;
    },

    getLabTestAdditives({ data }) {
      this.labTestAdditives = data;
    },

    hasConsumables(value) {
      if (!value) {
        this.procedure.consumables = [];
      }
    },

    contaminated(value) {
      if (value) {
        this.loading = false;
        this.procedure.form.errorDetected = false;
      }
    },

    initialised() {
      this.updateFormDetails();
    },

    submitted(value) {
      if (value) {
        this.loading = false;
        this.procedure.form.submitted = false;
      }
    },
  },

  computed: {
    ...mapGetters([
      'getProcedureCategories', 'getProcedures', 'getLabTestCategories', 'getLabTestUnits', 'getLabTestSampleTypes',
      'getLabTestAdditives',
    ]),

    hasConsumables() {
      return this.procedure.meta.hasConsumables;
    },

    isLab() {
      return this.procedure.meta.isLab;
    },

    errors() {
      return this.procedure.form.errors;
    },

    submitted() {
      return this.procedure.form.submitted;
    },

    contaminated() {
      return this.procedure.form.errorDetected;
    },

    initialised() {
      return this.categories && this.labTestCategories && this.labTestUnits && this.labTestSampleTypes && this.labTestAdditives;
    },
  },

  methods: {
    ...mapActions([
      'setProcedureCategories', 'setProcedures', 'setLabTestCategories', 'setLabTestUnits', 'setLabTestSampleTypes',
      'setLabTestAdditives',
    ]),

    openModal() {
      this.showModal = true; // Show the modal when the button is clicked
    },
    closeModal() {
      this.showModal = false; // Hide the modal
    },

    saveTagTitle(){
      this.procedureTagObject.storeTitle();
    },

    pushOption() {
      if (this.result_option) {
        this.procedure.meta.lab_result_options.push(this.result_option);
        this.result_option = null;
      }
    },

    async procedureTitles() {
      const url = '/api/evaluation/procedure/tag/title'
    try {
      const response = await fetch(url, {
        method: 'GET', // or 'POST' depending on your requirement
        headers: {
          'Content-Type': 'application/json',
          // You can include any authorization headers if required
          // 'Authorization': 'Bearer YOUR_TOKEN',
        },
      });

      // Check if the response is OK (status code 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the JSON response
      const data = await response.json();

      this.procedureTagTitles = data
      console.log('Data fetched:', this.procedureTagTitles);
      return data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error; // Rethrow the error if you want to handle it later
    }
  },




    removeItem(option) {
      this.procedure.meta.lab_result_options.splice( this.procedure.meta.lab_result_options.indexOf(option), 1);
    },

    updateFormDetails() {
      if (this.procedureId && this.procedures) {
        this.procedure.assemble(this.procedures[0]);
        this.procedure.procedure_id = this.procedureId;
        this.procedure.consumables = _.map(this.procedures[0]['consumables'], function(value, key) {
          return _.pick(value, 'item', 'name', 'units', 'store');
        });
        this.procedure.meta.category = this.categories[this.procedures[0].category - 1];

        if (this.procedures[0]['labs'].length > 0) {
          if (this.labTestSampleTypes[this.procedures[0]['labs'][0]['lab_sample_type']]) {
            this.procedure.labs.lab_sample_type = this.labTestSampleTypes[this.procedures[0]['labs'][0]['lab_sample_type'].id];
          }
        }
      }
    },

    initialise() {
      if (this.procedureId) {
        this.setProcedures({
          params: {
            id: this.procedureId,
          },
        });
      }
      this.setProcedureCategories();
      this.setLabTestCategories();
      this.setLabTestUnits();
      this.setLabTestSampleTypes();
      this.setLabTestAdditives();
    },

    searchProcedures: _.debounce(function search(search) {
      this.setProcedures({ search });
    }, 700),

    selectProcedure() {
      this.errors.clear('category');

      const selected = this.procedure.meta.category;

      if (selected.hasOwnProperty('name')) {
        if (selected.name === 'Lab' || selected.name === 'Radiology') {
          this.procedure.meta.isLab = true;
        }
        this.procedure.category = selected.id;
      }
    },

    addConsumable(product) {
      this.procedure.consumables.unshift({
        item: product.id,
        name: product.name,
        units: 1,
      });
    },

    removeConsumable(product) {
      this.procedure.consumables.splice(
          this.procedure.consumables.indexOf(product), 1,
      );
    },

    transformPrices() {
      const facilities = JSON.parse(this.facilities);

      if (!this.$route.path === '/evaluation/procedures/create') {
        facilities.forEach((facility_id) => {
          this.procedure.prices.push({
            facility_id,
            cash_charge: this.procedure.meta.pricing.cash_charge,
            insurance_charge: this.procedure.meta.pricing.insurance_charge,
            precharge: this.procedure.meta.pricing.precharge,
          });
        });
      }
    },

    saveProcedureDetails() {
      if (this.loading === false) {
        this.loading = true;
        this.procedureTagObject.store();
        this.loading === false;
      }

    },

    updateProcedureDetails() {
      if (this.loading === false) {
        this.loading = true;
        this.procedure.updateDetails();
      }
    },

    save() {
      this.transformPrices();
      if (this.procedure.procedure_id) {
        this.updateProcedureDetails();
      } else {
        this.saveProcedureDetails();
      }
    },
  },

  mounted() {
    this.initialise();
    this.procedureTitles();
  },
};
</script>

<style lang="scss">
.long-form {
  .v-input--selection-controls.v-input .v-label {
    top: 4px;
  }
}
</style>
