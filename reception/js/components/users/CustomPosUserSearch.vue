
<template>
  <div class="custom-pos-user-search">
    <v-autocomplete
      v-model="selectedUser"
      :items="safeItems"
      :loading="loading"
      :dark="!!dark"
      :background-color="backgroundColor || undefined"
      item-text="full_name"
      item-value="id"
      label="Search staff"
      dense
      clearable
      hide-details
      return-object
      no-filter
      cache-items
      :search-input.sync="search"
      :no-data-text="loading ? 'Loading staff...' : (search && search.length >= minChars ? 'No matching staff' : `Type at least ${minChars} characters`)"
      @change="onSelectionChange"
      @focus="onFocus"
    >
      <template #item="{ item }">
        <div class="d-flex align-center" style="width:100%">
          <v-icon left small class="mr-2">mdi-account</v-icon>
          <div class="mr-2" style="font-weight: 500;">
            {{ item.full_name || item.name || ('User #' + item.id) }}
          </div>
          <div v-if="item.username" class="grey--text text--darken-1">@{{ item.username }}</div>
        </div>
      </template>

      <template #selection="{ item }">
        <div class="d-flex align-center">
          <v-icon left small class="mr-1">mdi-account</v-icon>
          <span>{{ item.full_name || item.name || ('User #' + item.id) }}</span>
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
  name: 'CustomPosUserSearch',
  props: {
    // Parent passes :clear-signal to trigger clearing the selection (number increments)
    clearSignal: {
      type: [Number, String],
      default: 0
    },
    // Cosmetic passthroughs to match parent usage
    dark: {
      type: [Boolean, String],
      default: false
    },
    backgroundColor: {
      type: String,
      default: ''
    },
    // Minimum characters before firing a remote search
    minChars: {
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      loading: false,
      error: null,
      items: [],             // normalized list of users
      selectedUser: null,    // v-model for v-autocomplete (return-object)
      search: '',            // bound to v-autocomplete search
      searchDebounce: null   // timer id
    };
  },
  computed: {
    // Always return an array to avoid items=null causing length errors in Vuetify
    safeItems() {
      return Array.isArray(this.items) ? this.items : [];
    }
  },
  watch: {
    // Allow parent to clear selection by bumping the clear signal
    clearSignal() {
      this.selectionCleared();
    },
    // Remote filtering on search (only when query length >= minChars)
    search(val) {
      try {
        if (this.searchDebounce) clearTimeout(this.searchDebounce);
        const q = (val || '').trim();
        if (q.length < this.minChars) {
          // Clear the list when not enough characters
          this.items = [];
          return;
        }
        // Debounce remote calls slightly
        this.searchDebounce = setTimeout(() => {
          this.fetchUsers(q);
        }, 250);
      } catch (e) {
        // no-op
      }
    }
  },
  methods: {
    onFocus() {
      // Do not preload; wait until user types enough characters
    },

    normalizeUsersArray(json) {
      // Accept several common shapes and extract an array
      if (!json) return [];
      if (Array.isArray(json)) return json;
      if (Array.isArray(json.data)) return json.data;
      if (json.data && Array.isArray(json.data.data)) return json.data.data;
      if (Array.isArray(json.items)) return json.items;
      return [];
    },

    normalizeUser(u) {
      return {
        id: u.id,
        full_name: u.full_name || u.name || u.username || (u.profile && u.profile.full_name) || `User #${u.id}`,
        username: u.username || (u.profile && u.profile.username) || '',
        name: u.name || '',
        raw: u
      };
    },

    async fetchUsers(term) {
      this.loading = true;
      this.error = null;
      try {
        const q = (term || '').trim();
        // Guard: only search when enough characters are typed
        if (q.length < this.minChars) {
          this.items = [];
          this.loading = false;
          return;
        }

        const resp = await window.axios.get('/api/users', { params: { search: q, no_pagination: true } });
        const data = (resp && resp.data) || [];
        const list = this.normalizeUsersArray(data);

        this.items = (list || []).map(this.normalizeUser);
      } catch (e) {
        this.items = [];
        const msg =
          (e && e.response && (e.response.data?.message || e.response.data?.error)) ||
          e?.message ||
          'Failed to load staff list';
        this.error = msg;
      } finally {
        this.loading = false;
      }
    },

    onSelectionChange(value) {
      // With return-object enabled, value is the selected item object
      const user = value && typeof value === 'object'
        ? value
        : (this.safeItems.find(u => Number(u.id) === Number(value)) || null);

      const payload = user
        ? { id: user.id, full_name: user.full_name || user.name, username: user.username, raw: user.raw || user }
        : null;

      this.$emit('userSelected', payload);
    },

    selectionCleared() {
      this.selectedUser = null;
      this.search = '';
      this.$emit('userSelected', null);
    },

    // Expose a method parent may call via $refs.userSearch.refreshSearch()
    refreshSearch() {
      this.selectionCleared();
    }
  },
  mounted() {
    // Do not preload; live search only on typing
  }
};
</script>

<style scoped>
.custom-pos-user-search {
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
