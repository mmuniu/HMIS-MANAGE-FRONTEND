<template>
  <v-col cols="12" class="my-4" lg="6">
    <collabmed-loading v-if="loading"></collabmed-loading>

    <div v-else>
      <v-row>
        <v-col cols="12" sm="6" lg="4">
          <base-material-stats-card
            color="primary"
            icon="shopping_basket"
            :title="'Basket Value Today'"
            :value="formatMoney(values.day)"
            sub-icon="payment"
            sub-text="Basket Value"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="4">
          <base-material-stats-card
            color="success"
            icon="shopping_basket"
            :title="'Basket Value This Week'"
            :value="formatMoney(values.week)"
            sub-icon="payment"
            sub-text="Basket Value"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="4">
          <base-material-stats-card
            color="warning"
            icon="shopping_basket"
            :title="'Basket Value This Month'"
            :value="formatMoney(values.month)"
            sub-icon="payment"
            sub-text="Basket Value"
          />
        </v-col>
      </v-row>
    </div>

    <v-alert v-if="error" type="error" outlined dense class="mt-2">
      {{ error }}
    </v-alert>
  </v-col>
</template>

<script>
export default {
  name: 'BasketValuePerMonth',
  props: {
    // Optional: API endpoint to fetch basket values for day/week/month
    apiUrl: { type: String, default: null },
    // Optional: Directly provide values if no API is used (preferred approach, like revenue widgets)
    basketValueToday: { type: [Number, String], default: null },
    basketValueThisWeek: { type: [Number, String], default: null },
    basketValueThisMonth: { type: [Number, String], default: null },
    // Aliases to align with revenue-style props, if backend supplies similarly named fields
    todayRevenue: { type: [Number, String], default: null },
    thisWeekRevenue: { type: [Number, String], default: null },
    thisMonthRevenue: { type: [Number, String], default: null },
  },
  data() {
    return {
      loading: true,
      error: null,
      lastUpdated: 'just now',
      values: {
        day: 0,
        week: 0,
        month: 0,
      },
    };
  },
  methods: {
    toNum(v) {
      const n = typeof v === 'string' ? parseFloat(v) : v;
      return Number.isFinite(n) ? n : 0;
    },
    formatMoney(v) {
      const n = this.toNum(v);
      try {
        return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
      } catch (e) {
        return n.toFixed(2);
      }
    },
    formatTime() {
      const now = new Date();
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    // Compute Basket Value as: sum(Quantity_i * UnitPrice_i) - Discounts + Taxes + AdditionalCharges
    computeBasketFromPeriod(period = {}) {
      if (period == null) return 0;

      // If API already returns a computed total, prefer it
      if (period.total != null) return this.toNum(period.total);
      if (typeof period === 'number' || typeof period === 'string') return this.toNum(period);

      const items = Array.isArray(period.items) ? period.items : (Array.isArray(period.lines) ? period.lines : []);

      let base = 0;
      for (const it of items) {
        const qty = this.toNum(it.quantity ?? it.qty ?? it.Quantity ?? it.Qty);
        const unit = this.toNum(it.unit_price ?? it.price ?? it.UnitPrice ?? it['Unit Price']);
        base += qty * unit;
      }

      const discounts = this.toNum(period.discounts ?? period.discount ?? 0);
      const taxes = this.toNum(period.taxes ?? period.tax ?? 0);
      const additional = this.toNum(period.additional_charges ?? period.additional ?? period.charges ?? 0);

      return base - discounts + taxes + additional;
    },
    extractValues(data) {
      let day, week, month;

      const periods = data && data.periods ? data.periods : null;
      const src = periods || data || {};

      day = src.day ?? src.today;
      week = src.week ?? src.this_week;
      month = src.month ?? src.this_month;

      const values = {
        day: this.computeBasketFromPeriod(day),
        week: this.computeBasketFromPeriod(week),
        month: this.computeBasketFromPeriod(month),
      };

      // If everything computed to zero and there are hints of arrays, try fallback
      if (!values.day && Array.isArray(data?.today)) values.day = this.computeBasketFromPeriod({ items: data.today });
      if (!values.week && Array.isArray(data?.this_week)) values.week = this.computeBasketFromPeriod({ items: data.this_week });
      if (!values.month && Array.isArray(data?.this_month)) values.month = this.computeBasketFromPeriod({ items: data.this_month });

      return values;
    },
    async fetchData() {
      if (!this.apiUrl) {
        // Use provided props instead of API (follow revenue widgets pattern)
        const dayProp = this.basketValueToday ?? this.todayRevenue;
        const weekProp = this.basketValueThisWeek ?? this.thisWeekRevenue;
        const monthProp = this.basketValueThisMonth ?? this.thisMonthRevenue;
        this.values.day = this.toNum(dayProp);
        this.values.week = this.toNum(weekProp);
        this.values.month = this.toNum(monthProp);
        this.lastUpdated = `at ${this.formatTime()}`;
        this.loading = false;
        return;
      }

      try {
        this.loading = true;
        this.error = null;
        const url = new URL(this.apiUrl, window.location.origin);
        const { data } = await window.axios.get(url.toString());

        const vals = this.extractValues(data || {});
        this.values = vals;
        this.lastUpdated = `at ${this.formatTime()}`;
      } catch (e) {
        this.error = 'Failed to load basket value data';
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

