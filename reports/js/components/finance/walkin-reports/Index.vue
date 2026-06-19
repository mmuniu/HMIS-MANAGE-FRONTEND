<template>
  <div>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
      <v-card-title class="headline primary white--text">
        <span>Walkin Registers</span>
        <v-spacer></v-spacer>
        <span class="subtitle-1">View detailed report for previous payments</span>
      </v-card-title>

      <v-card-text>
        <!-- Filter Form -->
        <v-form @submit.prevent="filterData" class="my-4">
          <v-row align="center">
            <!-- Cashier Selection -->
            <v-col cols="12" sm="4">
              <v-select
                v-model="filters.cashier"
                :items="cashiers"
                item-text="name"
                item-value="id"
                label="Cashier"
                outlined
                dense
                clearable
                :loading="loadingCashiers"
              >
                <template v-slot:prepend-item>
                  <v-list-item ripple @click="filters.cashier = null">
                    <v-list-item-content>
                      <v-list-item-title>All Cashiers</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-divider class="mt-2"></v-divider>
                </template>
              </v-select>
            </v-col>

            <!-- Start Date -->
            <v-col cols="12" sm="4">
              <collabmed-date-time-picker dateOnly outline v-model="filters.startDate" label="Start date"></collabmed-date-time-picker>
            </v-col>

            <!-- End Date -->
            <v-col cols="12" sm="4">
              <collabmed-date-time-picker dateOnly outline v-model="filters.endDate" label="End date"></collabmed-date-time-picker>
            </v-col>
          </v-row>

          <!-- Action Buttons -->
          <v-row class="mt-2">
            <v-col cols="12" class="d-flex justify-end">
              <v-btn
                color="primary"
                class="mr-2"
                @click="filterData"
                :loading="loading"
              >
                <v-icon left>mdi-filter</v-icon>
                Filter
              </v-btn>
              <v-btn
                color="success"
                class="mr-2"
                @click="exportToExcel"
                :loading="exporting"
              >
                <v-icon left>mdi-file-excel</v-icon>
                Excel
              </v-btn>
              <v-btn
                color="info"
                :href="graphUrl"
                target="_blank"
              >
                <v-icon left>mdi-chart-line</v-icon>
                Graph
              </v-btn>
            </v-col>
          </v-row>
        </v-form>

        <!-- Data Table -->
        <v-data-table
          :headers="headers"
          :items="walkinData"
          :loading="loading"
          :server-items-length="totalItems"
          :options.sync="options"
          :footer-props="{
            'items-per-page-options': [10, 25, 50, 100],
          }"
          class="elevation-1"
        >
          <!-- Receipt Number -->
          <template v-slot:item.receipt="{ item }">
            {{ item.receipt }}
          </template>

          <!-- Patient Name -->
          <template v-slot:item.patient_name="{ item }">
            {{ item.patient_name }}
          </template>

          <!-- Amount -->
          <template v-slot:item.amount="{ item }">
            {{ formatCurrency(item.amount) }}
          </template>

          <!-- Cashier -->
          <template v-slot:item.cashier="{ item }">
            {{ item.cashier }}
          </template>

          <!-- Date -->
          <template v-slot:item.created_at="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'walkin-report',
  title: "walkin",

  data() {
    return {
      initialised: false,
      loading: false,
      exporting: false,
      loadingCashiers: false,
      walkinData: [],
      totalItems: 0,
      cashiers: [],
      startDateMenu: false,
      endDateMenu: false,

      // Table options for pagination
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: ['created_at'],
        sortDesc: [true],
      },

      // Filter values
      filters: {
        cashier: null,
        startDate: null,
        endDate: null,
      },

      // Table headers
      headers: [
        { text: 'Receipt No.', value: 'receipt', sortable: true },
        { text: 'Patient Name', value: 'patient_name', sortable: true },
        { text: 'Amount', value: 'amount', sortable: true },
        { text: 'Cashier', value: 'cashier', sortable: true },
        { text: 'Date', value: 'created_at', sortable: true },
      ],
    };
  },

  computed: {
    // URL for the graph view
    graphUrl() {
      return '/reports/payments/cash/graph';
    },

    // Formatted query parameters for API requests
    queryParams() {
      const params = {
        page: this.options.page,
        per_page: this.options.itemsPerPage,
        sort_by: this.options.sortBy[0] || 'created_at',
        sort_desc: this.options.sortDesc[0] ? 1 : 0,
      };

      if (this.filters.cashier) {
        params['self[user]'] = this.filters.cashier;
      }

      if (this.filters.startDate) {
        params['dates[start]'] = `${this.filters.startDate} 00:00:00`;
      }

      if (this.filters.endDate) {
        params['dates[end]'] = `${this.filters.endDate} 23:59:59`;
      }

      return params;
    },
  },

  watch: {
    // Watch for changes in table options (pagination, sorting)
    options: {
      handler() {
        this.fetchData();
      },
      deep: true,
    },
  },

  methods: {
    // Initialize component
    async initialize() {
      await Promise.all([
        this.fetchCashiers(),
        this.fetchData(),
      ]);
      this.initialised = true;
    },

    // Fetch cashiers for dropdown
    async fetchCashiers() {
      this.loadingCashiers = true;
      try {
        const response = await axios.get('/api/reports/cashiers');
        this.cashiers = response.data;
      } catch (error) {
        console.error('Error fetching cashiers:', error);
      } finally {
        this.loadingCashiers = false;
      }
    },

    // Fetch walkin data with filters
    async fetchData() {
      this.loading = true;
      try {
        const response = await axios.get('/api/reports/walkin', {
          params: this.queryParams,
        });

        this.walkinData = response.data.data;
        this.totalItems = response.data.meta?.total || this.walkinData.length;
      } catch (error) {
        console.error('Error fetching walkin data:', error);
      } finally {
        this.loading = false;
      }
    },

    // Apply filters and fetch data
    filterData() {
      this.options.page = 1; // Reset to first page when filtering
      this.fetchData();
    },

    // Export data to Excel
    async exportToExcel() {
      this.exporting = true;
      try {
        // Add export parameter to query params
        const params = { ...this.queryParams, export: 'export' };

        // Make a POST request to the export endpoint
        const response = await axios.post('/api/reports/walkin', params, {
          responseType: 'blob', // Important for file download
        });

        // Create a download link and trigger it
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `walkin_report_${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error exporting data:', error);
      } finally {
        this.exporting = false;
      }
    },

    // Format currency values
    formatCurrency(value) {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
      }).format(value);
    },

    // Format date values
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        return format(parseISO(dateString), 'dd/MM/yyyy HH:mm');
      } catch (error) {
        return dateString;
      }
    },
  },

  mounted() {
    this.initialize();
  },
};
</script>

<style scoped>
.v-data-table {
  margin-top: 20px;
}

.v-card__title {
  padding: 16px;
}

.v-card__text {
  padding: 16px;
}
</style>
