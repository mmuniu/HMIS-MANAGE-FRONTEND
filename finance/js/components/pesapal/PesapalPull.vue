<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="headline">Pesapal Pull Transactions</v-card-title>
      <v-card-text>
        <v-form ref="form">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field v-model="date_from" type="datetime-local" label="Start Date" :rules="[v => !!v || 'Start date is required']" dense outlined></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="date_to" type="datetime-local" label="End Date" :rules="[v => !!v || 'End date is required']" dense outlined></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="branch_name" label="Branch (optional)" dense outlined></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="d-flex align-center">
              <v-btn color="primary" :loading="loading" @click="pull">Pull Transactions</v-btn>
              <v-spacer></v-spacer>
              <div v-if="error" class="red--text">{{ error }}</div>
            </v-col>
          </v-row>
        </v-form>

        <v-divider class="my-4"></v-divider>

        <div v-if="results && results.length">
          <v-simple-table dense>
            <thead>
              <tr>
                <th v-for="col in columns" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in results" :key="idx">
                <td v-for="col in columns" :key="col">
                  <span v-if="!isObject(row[col])">{{ row[col] }}</span>
                  <pre v-else class="mb-0">{{ pretty(row[col]) }}</pre>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </div>
        <div v-else-if="loaded && !loading" class="grey--text">No results</div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PesapalPull',
  data() {
    return {
      date_from: '',
      date_to: '',
      branch_name: '',
      loading: false,
      loaded: false,
      error: null,
      results: [],
      columns: []
    }
  },
  methods: {
    validate() {
      if (!this.date_from || !this.date_to) {
        this.error = 'Please provide both start and end dates';
        return false;
      }
      if (new Date(this.date_to) < new Date(this.date_from)) {
        this.error = 'End date cannot be before start date';
        return false;
      }
      this.error = null;
      return true;
    },
    async pull() {
      if (!this.validate()) return;
      this.loading = true;
      this.loaded = false;
      this.error = null;
      try {
        const payload = {
          date_from: this.date_from.replace('T', ' ') + ':00',
          date_to: this.date_to.replace('T', ' ') + ':00',
          branch_name: this.branch_name
        };
        const { data } = await axios.post('/finance/pesapal/pull', payload, { headers: { 'Accept': 'application/json' } });
        // Expecting shape { success: true, data: [...] }
        const arr = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
        this.results = arr;
        this.columns = arr.length ? Object.keys(arr[0]) : [];
        this.loaded = true;
      } catch (e) {
        this.error = (e.response && (e.response.data?.message || e.response.statusText)) || e.message || 'Pull failed';
      } finally {
        this.loading = false;
      }
    },
    isObject(v) {
      return v && typeof v === 'object';
    },
    pretty(v) {
      try { return JSON.stringify(v, null, 2); } catch (e) { return String(v); }
    }
  }
}
</script>
