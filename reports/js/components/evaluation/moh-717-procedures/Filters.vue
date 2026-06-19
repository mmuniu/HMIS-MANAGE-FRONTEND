<template>
  <v-card-text class="py-0 my-0">
      <v-row >
          <v-col cols="12" md="3" class="px-2">
              <v-autocomplete
                      :items="facilities.facilities"
                      outline
                      v-model="filters.facility_id"
                      color="blue-grey lighten-2"
                      label="Select Facility"
                      item-text="name"
                      clearable
                      @click:clear="facilityCleared"
                      item-value="id"
                      @input="facilitySelected"
              ></v-autocomplete>
          </v-col>
          <v-col md="2" class="px-2">
              <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
          </v-col>

          <v-col md="2" class="px-2">
              <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date" ></collabmed-date-time-picker>
          </v-col>
      </v-row>
      <v-row >
          <v-col>
              <v-btn @click="filter()" class="v-btn v-btn--small theme--light primary" color="success">filter</v-btn>
              <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
          </v-col>
      </v-row>
  </v-card-text>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import moment from 'moment';

export default {
  name: 'moh-717-procedures-filters',

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
      return '/api/reports/module/evaluation/moh-717-procedures';
    },

    ages() {
      return [
        { name: "Over 5", value: "o" },
        { name: "Under 5", value: "u" },
      ];
    },

  },

  data: () => ({
    loading: false,
    filename: 'Moh 717 Procedures',
    filters: {
      facility_id: null,
      ward_id: null,
      start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:mm"),
      end_date: moment(new Date()).format("YYYY-MM-DD HH:mm"),

    },
  }),

  methods: {

    ...mapActions([
      'setFacilities',
    ]),

    facilitySelected(id) {
      this.filters.facility_id = id;
    },

    facilityCleared() {
      this.filters.facility_id =null;
    },

    setStartDate(datetime) {
      this.filters.start_date = datetime;
    },

    setEndDate(datetime) {
      this.filters.end_date = datetime;
    },

    filter() {
      this.obj.filters = _.omitBy(this.filters, _.isNil);

      this.$emit('filter');
    },
  },

  mounted() {
    this.setFacilities();
    window.events.$on('STORE_SET_ACTION_LOADING', (loading) => {
      this.saveLoader = loading;
    });
  },
};
</script>
