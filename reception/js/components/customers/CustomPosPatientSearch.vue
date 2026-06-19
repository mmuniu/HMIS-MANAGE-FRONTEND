<template>
  <div class="d-flex align-items-center product-search-wrapper">

    <v-menu
        v-model="menu"
        :close-on-content-click="false"
        :nudge-width="200"
        offset-y
        transition="scale-transition"
        max-height="300"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
            v-model="search"
            v-bind="attrs"
            v-on="on"
            :loading="loading"
            :prepend-inner-icon="prepend"
            color="black"
            class="form-control search-input mr-2"
            :label="label"
            :placeholder="placeholder"
            clearable
            @click:clear="selectionCleared"
        />
      </template>

      <v-list>
        <v-list-item
            v-for="(patient, index) in patient_data"
            :key="index"
            @click="selectPatient(patient)"
        >
          <v-list-item-content>
            <v-list-item-title>{{ patient.full_name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
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
      default: 'Search for a  customer',
    },
    placeholder: {
      type: String,
      default: 'Search for a Customer',
    },
    prepend: {
      default: null,
    },
    // A numeric signal from the parent to programmatically clear selection
    clearSignal: {
      type: Number,
      default: 0,
    },
  },
  data: () => ({
    search: '',
    selected: null,
    patient_data: [],
    loading: false,
    menu: false,
  }),

  mounted() {
    // Listen for a clearSelection event emitted on this component instance
    if (this.$on) {
      this.$on('clearSelection', this.selectionCleared);
    }
  },
  beforeDestroy() {
    // Cleanup listener (Vue 2)
    if (this.$off) {
      this.$off('clearSelection', this.selectionCleared);
    }
  },

  methods: {
    ...mapActions({
      fetchPatient: 'setPatients',
    }),

    selectionCleared() {
      this.selected = null;
      this.search = '';
      this.$emit('selectionCleared');
    },

    async selectPatient(patient) {
      this.selected = patient;
      this.search = patient.full_name;
      this.menu = false;

      this.$emit('patientSelected', patient);
      this.$emit('input', patient);
    },

    performSearch: _.debounce(async function () {
      if (this.search && this.search.length > 3) {
        this.loading = true;
        try {
          const response = await fetch(`/api/reception/search/patients`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ search: this.search, morgue: this.morgue }),
          });
          const data = await response.json();
          this.patient_data = data[0];
          this.menu = true;
        } catch (e) {
          console.error(e);
        } finally {
          this.loading = false;
        }
      }
    }, 1000),
  },

  watch: {
    search(val) {
      this.performSearch();
    },
    clearSignal() {
      // Parent triggered clear; reset the selection and input
      this.selectionCleared();
    }
  },
};
</script>
<style scoped>
.product-search-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Remove Vuetify underline */
.search-input .v-input__control::before,
.search-input .v-input__control::after {
  border-bottom: none !important;
}

/* Make it look like a Bootstrap form-control */
.search-input .v-input__control {
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0 8px;
  height: 38px;
  background-color: #fff;
}

.search-input {
  margin: 0;
  padding: 0;
  flex: 1;
  min-width: 250px;
}

.search-input .v-input__slot {
  font-size: 14px;
}
</style>
