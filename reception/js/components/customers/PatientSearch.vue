<template>

  <v-autocomplete
  v-model="selected"
  :loading="loading"
  :solo-inverted="soloed"
  :items="patient_data"
  :search-input.sync="search"
  @change="patientSelected()"
  hint="Unique name"
  :prepend-inner-icon="prepend"
  color="black"
  class="black--text"
  item-text="full_name"
  item-value="id"
  flat clearablet5rr
  @click:clear="selectionCleared"
  hide-no-data
  no-filter
  :outline="outline"
  hide-details
  :label="label"
  return-object
></v-autocomplete>
<!-- :placeholder="placeholder" -->
</template>
<script>
import _ from 'lodash';
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        outline: {
            type: Boolean,
            default: true,
        },
        soloed: {
            type: Boolean,
            default: false,
        },
        morgue: {
          type: Boolean, // Adjust the type as needed
          default: false // Set a default value if needed
        },
        label: {
            type: String,
            default: 'Search patient',
        },
        placeholder: {
            type: String,
            default: 'Search for a Patient',
        },
        prepend: {
            default: null,
        },
    },

    data: () => ({

        search: null,
        selected: null,
        patient_data: [],
        loading: false,
    }),

    computed: {
        ...mapGetters({
            patients: 'getPatients',
        }),
    },

    watch: {
        patients(val) {

            this.patient_data = _.sortBy(val.data, 'full_name');
        },

        search(val) {
            if (val != null && val.length > 3) {
                // this.performSearch();
                this.fetchPatients();
            } else {
                this.placeholder = `Enter ${3-1} more characters to search`;
            }
        },
    },

    methods: {
        ...mapActions({
            fetchPatient: 'setPatients',
        }),

        getIcon() {
            return this.loading ? 'bubble_chart' : '';
        },

        patientSelected() {

            this.$emit('patientSelected', this.selected);
            this.$emit('input', this.selected);
        },

        selectionCleared() {
            this.$emit('selectionCleared');
        },

        performSearch: _.debounce(function() {
            this.loading = true;
            this.fetchPatient({
                params: {
                    search: this.search,
                    shallow: true,
                },
            });
        }, 1000),

        async fetchPatients() {

        try {
          this.loading = true;

          // Make API call to fetch patients based on search input
          const response = await fetch(`/api/reception/search/patients/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ search: this.search, morgue:this.morgue })
            });
            const data = await response.json();



          this.patient_data = data[0]; // Assuming your API returns an array of patient data
        } catch (error) {
          console.error('Error fetching patients:', error);
        } finally {
          this.loading = false;
        }

    }
    },

    /* created() {
            window.events.$on("STORE_SET_ACTION_LOADING", (val) => {
                this.loading = val;
            });
        },*/
};
</script>
