<template>
  <v-col cols="12" lg="6" class="my-4">
    <collabmed-loading v-if="loading"/>

    <base-material-stats-card v-else color="primary" hover-reveal icon="mdi-format-list-bulleted">
      <template v-slot:reveal-actions>
        <v-row>
          <v-col cols="6">
            <h4 class="card-title font-weight-bold mt-2 ml-2">
              {{ title }}
            </h4>
          </v-col>
          <v-col cols="6" class="text-right">
            <v-menu
              v-model="menuStart"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="start_date"
                  label="Start"
                  prepend-icon="mdi-calendar"
                  dense outlined hide-details style="max-width: 140px"
                  v-bind="attrs" v-on="on"
                />
              </template>
              <v-date-picker v-model="start_date" @input="menuStart = false; fetchData()" />
            </v-menu>

            <v-menu
              v-model="menuEnd"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="end_date"
                  label="End"
                  prepend-icon="mdi-calendar"
                  dense outlined hide-details style="max-width: 140px"
                  v-bind="attrs" v-on="on"
                />
              </template>
              <v-date-picker v-model="end_date" @input="menuEnd = false; fetchData()" />
            </v-menu>

            <v-select
              :items="limits"
              v-model="limit"
              label="Limit"
              dense outlined hide-details style="max-width: 100px"
              @change="fetchData"
            />

            <v-btn small color="primary" class="ml-2" @click="fetchData">
              <v-icon left small>mdi-refresh</v-icon> Refresh
            </v-btn>
          </v-col>
        </v-row>
      </template>

      <v-simple-table dense>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">#</th>
              <th class="text-left">Category</th>
              <th class="text-right">Units</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in rows" :key="row.category">
              <td>{{ index + 1 }}</td>
              <td>{{ row.category }}</td>
              <td class="text-right" >
                {{ row.units.toLocaleString() }}
                <v-progress-linear
                  :value="maxUnits > 0 ? (row.units / maxUnits) * 100 : 0"
                  height="4"
                  color="primary"
                  class="mt-1"
                />
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>

      <template v-slot:actions>
        <v-icon class="mr-1" small>mdi-clock-outline</v-icon>
        <span class="caption grey--text font-weight-light">
          updated {{ lastUpdated }}
        </span>
      </template>
    </base-material-stats-card>

    <v-alert v-if="error" type="error" outlined dense class="mt-2">
      {{ error }}
    </v-alert>
  </v-col>
</template>

<script>
export default {
  name: 'TopCategoriesByUnits',
  props: {
    apiUrl: { type: String, required: true },
    title: { type: String, default: 'Top Categories by Units' },
    defaultLimit: { type: Number, default: 10 },
    defaultStart: { type: String, default: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10) },
    defaultEnd: { type: String, default: () => new Date().toISOString().slice(0,10) },
  },
  data() {
    return {
      loading: true,
      error: null,
      rows: [],
      maxUnits: 0,
      lastUpdated: 'just now',
      start_date: this.defaultStart,
      end_date: this.defaultEnd,
      limit: this.defaultLimit,
      limits: [5, 10, 15, 20, 30, 50],
      menuStart: false,
      menuEnd: false,
    };
  },
  methods: {
    formatTime() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    async fetchData() {
      try {
        this.loading = true;
        this.error = null;
        const url = new URL(this.apiUrl, window.location.origin);
        url.searchParams.set('start_date', this.start_date);
        url.searchParams.set('end_date', this.end_date);
        url.searchParams.set('limit', this.limit);
        const { data } = await window.axios.get(url.toString());
        this.rows = Array.isArray(data.data) ? data.data : [];
        this.maxUnits = this.rows.length ? Math.max(...this.rows.map(r => Number(r.units) || 0)) : 0;
        this.lastUpdated = `at ${this.formatTime()}`;
      } catch (e) {
        this.error = 'Failed to load top categories data';
      } finally {
        this.loading = false;
      }
    },
  },
  created() {
    this.fetchData();
  },
};
</script>
<style>
.ct-square {
  max-height: 190px !important;
}
</style>


