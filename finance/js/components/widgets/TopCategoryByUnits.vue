<template>
  <v-col cols="12" class="my-4" lg="6">
    <collabmed-loading v-if="loading"></collabmed-loading>

    <base-material-chart-card
      v-else
      :data="chart.data"
      :options="chart.options"
      color="success"
      hover-reveal
      type="Bar"
    >
      <template v-slot:reveal-actions>
        <v-row>
          <v-col cols="8">
            <h4 class="card-title font-weight-light mt-2 ml-2">
              {{ title }} - {{ monthLabel }} {{ selectedYear }}
            </h4>
          </v-col>
          <v-col cols="4" class="text-right">
            <v-row no-gutters>
              <v-col cols="5">
                <v-select
                  :items="years"
                  dense
                  outlined
                  hide-details
                  v-model="selectedYear"
                  style="max-width: 120px"
                  @change="fetchData"
                ></v-select>
              </v-col>
              <v-col cols="5">
                <v-select
                  :items="months"
                  dense
                  outlined
                  hide-details
                  v-model="selectedMonth"
                  item-text="text"
                  item-value="value"
                  style="max-width: 140px; margin-left: 8px;"
                  @change="fetchData"
                ></v-select>
              </v-col>
              <v-col cols="2">
                <v-text-field
                  v-model.number="limit"
                  type="number"
                  min="1"
                  max="20"
                  dense
                  outlined
                  hide-details
                  style="max-width: 80px; margin-left: 8px;"
                  @change="fetchData"
                  placeholder="Top N"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </template>

      <p class="d-inline-flex font-weight-bold ml-2 my-0">
        Top categories by total units (this month)
      </p>
      <div class="ml-2 mt-2 caption font-weight-bold">
        Categories:
        <span v-for="(label, i) in chart.data.labels" :key="i">
          {{ label }}({{ currency }}{{ Number(chart.data.series[0][i]).toLocaleString() }})<span v-if="i < chart.data.labels.length-1">, </span>
        </span>
      </div>

      <template v-slot:actions>
        <v-icon class="mr-1" small>mdi-clock-outline</v-icon>
        <span class="caption grey--text font-weight-light">
          updated {{ lastUpdated }}
        </span>
      </template>
    </base-material-chart-card>

    <v-alert v-if="error" type="error" outlined dense class="mt-2">
      {{ error }}
    </v-alert>
  </v-col>
</template>

<script>
export default {
  name: 'TopCategoryByUnits',
  props: {
    title: { type: String, default: 'Top Categories by Units' },
    apiUrl: { type: String, required: true },
    defaultYear: { type: Number, default: new Date().getFullYear() },
    defaultLimit: { type: Number, default: 5 },
  },
  data() {
    const now = new Date();
    return {
      loading: true,
      error: null,
      selectedYear: this.defaultYear,
      years: this.buildYears(),
      months: this.buildMonths(),
      selectedMonth: now.getMonth() + 1, // 1-12
      lastUpdated: 'just now',
      limit: this.defaultLimit,
      chart: {
        data: { labels: [], series: [[]] },
        options: {
          low: 0,
          high: 0,
          fullWidth: true,
          height: 190,
          seriesBarDistance: 10,
          axisX: {
            showGrid: false,
            offset: 60,
            labelInterpolationFnc: (value, index) => {
              const v = String(value || '');
              const labels = (this.chart && this.chart.data && Array.isArray(this.chart.data.labels)) ? this.chart.data.labels : [];
              const maxVisible = 6;
              const step = Math.max(1, Math.ceil(labels.length / maxVisible));
              if (index % step !== 0) return '';
              return v.length > 12 ? v.slice(0, 12) + '…' : v;
            },
          },
          axisY: {
            onlyInteger: true,
            offset: 45,
            labelInterpolationFnc: (value) => {
              const n = Number(value) || 0;
              if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
              if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
              return String(n);
            },
          },
          chartPadding: { top: 10, right: 10, bottom: 48, left: 10 },
        },
      },
    };
  },
  computed: {
    monthLabel() {
      const m = (this.months || []).find(x => x.value === this.selectedMonth);
      return m ? m.text : '';
    },
  },
  methods: {
    buildYears() {
      const current = new Date().getFullYear();
      const years = [];
      for (let y = current; y >= current - 5; y--) years.push(y);
      return years;
    },
    buildMonths() {
      return [
        { text: 'January', value: 1 },
        { text: 'February', value: 2 },
        { text: 'March', value: 3 },
        { text: 'April', value: 4 },
        { text: 'May', value: 5 },
        { text: 'June', value: 6 },
        { text: 'July', value: 7 },
        { text: 'August', value: 8 },
        { text: 'September', value: 9 },
        { text: 'October', value: 10 },
        { text: 'November', value: 11 },
        { text: 'December', value: 12 },
      ];
    },
    formatTime() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    async fetchData() {
      try {
        this.loading = true;
        this.error = null;
        const url = new URL(this.apiUrl, window.location.origin);
        url.searchParams.set('year', this.selectedYear);
        url.searchParams.set('month', this.selectedMonth);
        if (this.limit && this.limit > 0) url.searchParams.set('limit', this.limit);

        const { data } = await window.axios.get(url.toString());
        const values = Array.isArray(data.units) ? data.units : [];
        const labels = Array.isArray(data.labels) ? data.labels : [];
        const maxVal = values.length ? Math.max(...values) : 0;

        // Update chart data reactively
        this.chart.data.labels = labels;
        this.chart.data.series = [values];
        this.chart.options.high = maxVal === 0 ? 10 : Math.ceil(maxVal * 1.2);
        this.chart.options.low = 0;
        this.chart.options.fullWidth = true;
        this.chart.options.height = 190;
        const labelCount = labels.length;
        this.chart.options.seriesBarDistance = labelCount > 10 ? 6 : (labelCount > 7 ? 8 : 10);
        this.chart.options.axisX = {
          showGrid: false,
          offset: 60,
          labelInterpolationFnc: (value, index) => {
            const v = String(value || '');
            const labels = (this.chart && this.chart.data && Array.isArray(this.chart.data.labels)) ? this.chart.data.labels : [];
            const maxVisible = 6;
            const step = Math.max(1, Math.ceil(labels.length / maxVisible));
            if (index % step !== 0) return '';
            return v.length > 12 ? v.slice(0, 12) + '…' : v;
          },
        };
        this.chart.options.axisY = {
          onlyInteger: true,
          offset: 45,
          labelInterpolationFnc: (value) => {
            const n = Number(value) || 0;
            if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
            if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
            return String(n);
          },
        };
        this.chart.options.chartPadding = { top: 10, right: 10, bottom: 40, left: 10 };

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
  height: 190px !important;
}
</style>
