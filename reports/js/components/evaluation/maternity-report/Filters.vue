<template>
  <div>
    <v-card style="padding-bottom: 20px">
      <v-card-text class="py-0 my-0">
        <v-row>
          <v-col md="4" class="px-2">
            <v-select
                v-model="selectedYear"
                :items="years"
                @input="setDate"
                label="Select Year"
                outlined
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn @click="filter()" class="v-btn v-btn--small theme--light primary" color="success">filter</v-btn>

            <v-btn color="primary" class="ma-3" @click="exportToExcel()">
              Export to Excel
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import moment from 'moment';

export default {
  name: 'maternity-report-filters',

  props: {
    obj: {
      required: true,
      type: Object,
    },
  },

  computed: {
    ...mapGetters({
      facilities: 'getFacilities',
    }),
    url() {
      return '/api/reports/module/evaluation/maternity-report';
    }
  },

  data: () => ({
    loading: false,
    filename: 'Maternity Report',
    selectedYear: null,
    years: Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i),
    filters: {
      date: null
    },
    lab_tests: [],
  }),

  methods: {
    ...mapActions([
      'setFacilities',
    ]),
    setDate(datetime) {
      this.filters.date = datetime;
    },

    filter() {
      this.obj.filters = _.omitBy(this.filters, _.isNil);
      this.$emit('filter');
    },
    exportToExcel(){
      this.$emit('export')
    }
  },

  mounted() {
    this.setFacilities();

    window.events.$on('STORE_SET_ACTION_LOADING', (loading) => {
      this.saveLoader = loading;
    });
  },
};
</script>
