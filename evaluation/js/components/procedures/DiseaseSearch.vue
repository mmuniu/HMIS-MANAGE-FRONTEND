<template>
  <v-autocomplete
          v-model="selected"
          :loading="loading"
          :items="diseases"
          :search-input.sync="search"
          @input="diseaseSelected()"
          color="black"
          class="black--text"
          item-text="disease"
          :placeholder="placeholder"
          item-value="id"
          flat clearable
          @click:clear="diseaseSelectionCleared()"
          hide-no-data no-filter outline hide-details
          :label="label"
          return-object
  ></v-autocomplete>



</template>
<script>
import { mapGetters, mapActions } from 'vuex';


export default {
  props: {
      label: {
          type: String,
          default: 'Search for a disease',
      },
      pre_selected: {
          type: Object,
          default: null,
      },
      non_clinical: {
          type: Boolean,
          default: false,
      },
      schemeId: {
          default: null,
      },
      active_only: {
          default: false,
          type: Boolean
      },
      categories: {
        type: Object
      }
  },

  data: () => ({
      loading: false,
      search: null,
      selected: null,
      diseases_data: [],
      placeholder: '',
      diseases: []
  }),

  computed: {
      ...mapGetters({
          // diseases: 'getDisease',
      }),
  },

  watch: {
      diseases(val) {
          this.diseases_data = val.data;
      },

      pre_selected() {
          this.selected = this.pre_selected ? this.pre_selected : null;
          this.placeholder = this.pre_selected ? this.pre_selected.name : null;
      },

      search(val) {
          if (val != null && val.length > 3 || !this.selected) {
              this.performSearch();
          } else {
              this.placeholder = this.selected ? this.selected.name : null;
          }
      },

      getDisease({ data }) {
          _.each(data, (disease, index) => {
              this.diseases_data.push({
                  name: `${disease.name}`,
                  value: disease.id,
              });
          });
      },
  },

  methods: {
      ...mapActions({
          // fetchDisease: 'setDisease',
      }),

      getIcon() {
          return this.loading ? 'bubble_chart' : '';
      },

      diseaseSelected() {
        // console.log(this.selected.id);
          this.$emit('results', this.selected);
      },

      diseaseSelectionCleared() {
          this.$emit('cleared');
      },

      async diseaseWhoseCategories(categories) {
        // parses JSON response into native JavaScript objects


      },

      performSearch: _.debounce(function() {
          this.loading = true;
          // this.fetchDisease({
          //     params: {
          //         search_disease: true,
          //         search: this.search,
          //         scheme_id: this.schemeId,
          //         non_clinical: this.non_clinical,
          //         active_only: this.active_only,
          //     },
          // });
      }, 1000),

      snitchy() {
          this.selected = this.pre_selected ? this.pre_selected : null;
          this.placeholder = this.pre_selected ? this.pre_selected.name : null;
      },
  },

  async mounted() {

      window.events.$on('STORE_SET_ACTION_LOADING', (val) => {
          this.loading = val;
      });
      this.snitchy();
      this.diseaseWhoseCategories(this.categories);
      var allDisease = [];


      const response = await fetch('/api/evaluation/get/idsr/diseases');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    this.diseases = data;
    console.log(this.diseases);

  },
};
</script>
