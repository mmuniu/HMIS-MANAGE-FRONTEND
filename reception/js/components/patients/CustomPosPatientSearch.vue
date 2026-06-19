<template>
  <div class="custom-pos-patient-search">
    <v-autocomplete
      v-model="selectedPatientId"
      :items="safeItems"
      :loading="loading"
      :dark="!!dark"
      :background-color="backgroundColor || undefined"
      item-text="full_name"
      item-value="id"
      label="Search customer"
      dense
      clearable
      hide-details
      :no-data-text="loading ? 'Loading customer...' : (search && search.length > 0 ? 'No matching customer' : 'Type to Search customers')"
      :search-input.sync="search"
      :filter="localFilter"
      @change="onSelectionChange"
    >
      <template #item="{ item }">
        <div class="d-flex align-center" style="width:100%">
          <v-icon left small class="mr-2">mdi-account</v-icon>
          <div class="mr-2" style="font-weight: 500;">{{ item.full_name || item.name || ('Customer #' + item.id) }}</div>
          <div v-if="item.identifier" class="grey--text text--darken-1">{{ item.identifier }}</div>
        </div>
      </template>
      <template #selection="{ item }">
        <div class="d-flex align-center">
          <v-icon left small class="mr-1">mdi-account</v-icon>
          <span>{{ item.full_name || item.name || ('Customer #' + item.id) }}</span>
        </div>
      </template>
    </v-autocomplete>

    <div v-if="error" class="error red--text text--darken-2 mt-1">
      {{ error }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomPosPatientSearch',
  props: {
    // Parent drives this with :clear-signal="patientClearSignal"
    clearSignal: {
      type: [Number, String],
      default: 0
    },
    // Cosmetic props to match parent usage
    dark: {
      type: [Boolean, String],
      default: false
    },
    backgroundColor: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      items: [],                // raw list
      selectedPatientId: null,  // v-model
      search: '',               // search text
      debounceTimer: null,
      // when true, fetchPatients will be prevented from sending requests
      preventRequests: false,
    };
  },
  computed: {
    // Always return an array to avoid null.length issues
    safeItems() {
      return Array.isArray(this.items) ? this.items : [];
    }
  },
  watch: {
    clearSignal() {
      // Parent requested a clear
      this.selectionCleared();
    },
    search(val) {
      try {
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = null;
        }
        const q = (val || '').trim();

        // If a patient is selected and user hasn't started a new query, avoid new requests.
        // Clearing the search (or typing) will disable this guard (see below).
        if (this.preventRequests && q.length < 1) {
          return;
        }

        // If user types anything new we should allow requests again
        if (q.length >= 1) {
          this.preventRequests = false;
        }

        if (q.length < 2) {
          // Reset suggestions for short queries
          this.items = [];
          return;
        }
        // Debounce fetch a bit
        this.debounceTimer = setTimeout(() => {
          this.fetchPatients(q);
        }, 250);
      } catch (e) {
        // best-effort
      }
    }
  },
  methods: {
    // Try to fetch patients from backend; safe fallback to empty list on failure
    async fetchPatients(term) {
      // prevent firing when a selection is active
      if (this.preventRequests) return;

      this.loading = true;
      this.error = null;
      try {
        if (!window.axios) {
          // If axios is not available, leave items empty (stub mode)
          this.items = [];
          return;
        }
        const resp = await window.axios.post('/api/reception/search/patients', {
          params: { search: term, no_pagination: true }
        });
        const json = (resp && resp.data) || [];
        let list = [];
        if (Array.isArray(json)) list = json;
        else if (Array.isArray(json.data)) list = json.data;
        else if (json && json.data && Array.isArray(json.data.data)) list = json.data.data;
        else if (Array.isArray(json.items)) list = json.items;
        else {
          const candidate = ['results', 'rows', 'patients'].map(k => json && json[k]).find(v => Array.isArray(v));
          list = candidate || [];
        }
        // Normalize payload: ensure id and full_name exist
        this.items = (list || []).map(p => ({
          id: p.id || p.patient_id || p.uid,
          full_name: p.full_name || p.name || (p.profile && p.profile.full_name) || `Customer #${p.id || p.patient_id || ''}`,
          identifier: p.identifier || p.patient_number || p.file_no || '',
          raw: p
        })).filter(p => p.id != null);
      } catch (e) {
        this.items = [];
        const msg = (e && e.response && (e.response.data?.message || e.response.data?.error)) || e?.message || 'Failed to load patients';
        this.error = msg;
      } finally {
        this.loading = false;
      }
    },
    // Local filter to allow client-side narrowing when items are present
    localFilter(item, queryText, itemText) {
      try {
        const text = (itemText || '').toString().toLowerCase();
        const ident = (item.identifier || '').toString().toLowerCase();
        const q = (queryText || '').toString().toLowerCase();
        if (!q) return true;
        return text.includes(q) || ident.includes(q);
      } catch (e) {
        return true;
      }
    },
    onSelectionChange(value) {
      // value is selected id
      const patient = this.safeItems.find(p => Number(p.id) === Number(value)) || null;
      const payload = patient
        ? { id: patient.id, full_name: patient.full_name, identifier: patient.identifier, raw: patient.raw || null }
        : null;

      // When a selection is made, prevent further backend requests until cleared.
      // Also cancel any pending debounce to avoid an immediate request.
      if (payload) {
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = null;
        }
        this.preventRequests = true;
      }

      this.$emit('patientSelected', payload);
    },
    // Called by parent via $refs.patientSearch.selectionCleared()
    selectionCleared() {
      this.selectedPatientId = null;
      this.search = '';
      // allow new requests again after explicit clear
      this.preventRequests = false;
      // Emit null to indicate no selected patient
      this.$emit('patientSelected', null);
    },
    // Called by parent via $refs.patientSearch.refreshSearch()
    refreshSearch() {
      // Clear and optionally re-fetch last term
      const last = this.search;
      this.selectionCleared();
      if (last && last.trim().length >= 2) {
        this.fetchPatients(last.trim());
      }
    }
  }
};
</script>

<style scoped>
.custom-pos-patient-search {
  width: 100%;
}

/* Keep label text visible on dark backgrounds as used by parent */
label.theme--dark {
  color: black !important;
}

.error {
  font-size: 12px;
}
</style>
