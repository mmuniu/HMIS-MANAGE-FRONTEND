<template>
  <v-autocomplete
      v-model="selected"
      :loading="loading"
      :items="parent_procedures.data"
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
      type: Object
    }
  },

  data: () => ({
    loading: false,
    search: null,
    selected: null,
    parent_procedures_data: [],
    placeholder: '',
  }),

  computed: {
    ...mapGetters({
      parent_procedures: 'getParentProcedures',
    }),
  },

  watch: {
    parent_procedures(val) {
      this.parent_procedures_data = val.data;
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

    parent_procedures({ data }) {
      _.each(data, (procedure, index) => {
        this.parent_procedures_data.push({
          name: `${procedure.name} - (Cash: ${procedure.cash_charge}, Insurance: ${procedure.insurance_charge})`,
          value: procedure.id,
        });
      });
    },
  },

  methods: {
    ...mapActions({
      fetchProcedures: 'setParentProcedures'
    }),

    getIcon() {
      return this.loading ? 'bubble_chart' : '';
    },

    procedureSelected() {
      this.$emit('parent_results', this.selected);
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
  },
};
</script>
