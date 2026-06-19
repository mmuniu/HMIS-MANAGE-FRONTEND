<template>
  <v-autocomplete
          v-model="selected"
          :loading="loading"
          :items="procedures_data"
          :search-input.sync="search"
          @input="procedureSelected()"
          color="black"
          class="black--text"
          item-text="name"
          :placeholder="placeholder"
          item-value="id"
          flat clearable
          @click:clear="procedureSelectionCleared()"
          hide-no-data no-filter outline hide-details
          :label="label"
          return-object
  ></v-autocomplete>



</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import Procedure from '@evaluation/libs/procedures/Procedure';

export default {
  props: {
      label: {
          type: String,
          default: 'Search for procedure',
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
        type: Array
      }
  },

  data: () => ({
      loading: false,
      search: null,
      selected: null,
      procedures_data: [],
      placeholder: '',
  }),

  computed: {
      ...mapGetters({
          // procedures: 'getProcedures',
      }),
  },

  watch: {
      procedures(val) {
          this.procedures_data = val.data;
      },

      pre_selected() {
          this.selected = this.pre_selected ? this.pre_selected : null;
          this.placeholder = this.pre_selected ? this.pre_selected.name : null;
      },

     async search(val) {
          if (val != null && val.length > 3 || !this.selected) {
            console.log(val);
            const url = '/api/evaluation/get/pos/procedures';

            const data = {categories: this.categories, search: val};
              const response = await fetch(url, {
              method: 'POST', // *GET, POST, PUT, DELETE, etc.
              headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: JSON.stringify(data) // body data type must match "Content-Type" header

            });
            if (!response.ok) {
              throw new Error('Failed to fetch data');
          }


            const procedures = await response.json();
            console.log(procedures);
            this.procedures_data = procedures;

              this.performSearch();
          } else {
              this.placeholder = this.selected ? this.selected.name : null;
          }
      },

      getProcedures({ data }) {
          _.each(data, (procedure, index) => {
              this.procedures_data.push({
                  name: `${procedure.name} - (Cash: ${procedure.cash_charge}, Insurance: ${procedure.insurance_charge})`,
                  value: procedure.id,
              });
          });
      },
  },

  methods: {
      ...mapActions({
          fetchProcedures: 'setProcedures',
      }),

      getIcon() {
          return this.loading ? 'bubble_chart' : '';
      },

      procedureSelected() {
          this.$emit('results', this.selected);
      },

      procedureSelectionCleared() {
          this.$emit('cleared');
      },

      async procedureWhoseCategories(categories) {
        // parses JSON response into native JavaScript objects


      },

      performSearch: _.debounce(function() {
          this.loading = true;
          this.fetchProcedures({
              params: {
                  search_procedure: true,
                  search: this.search,
                  scheme_id: this.schemeId,
                  non_clinical: this.non_clinical,
                  active_only: this.active_only,
              },
          });
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
      this.procedureWhoseCategories(this.categories);
      var allProcedures = [];

      const url = '/api/evaluation/get/pos/procedures';

          console.log(this.categories);

              const data = {categories: this.categories};
              const response = await fetch(url, {
              method: 'POST', // *GET, POST, PUT, DELETE, etc.
              headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: JSON.stringify(data) // body data type must match "Content-Type" header

            });
            if (!response.ok) {
              throw new Error('Failed to fetch data');
          }
            
            const procedures = await response.json();
            console.log(procedures);
            this.procedures_data = procedures;

  },
};
</script>
