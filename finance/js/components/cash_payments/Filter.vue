<template>
  <v-card-text class="py-0 my-0">
    <v-row >
      <v-col class="px-2" md="3" >
        <collabmed-date-time-picker dateOnly outline  v-model="filters.start_date" label="Start date"></collabmed-date-time-picker>
      </v-col>
      <v-col class="px-2" md="3" >
        <collabmed-date-time-picker dateOnly outline v-model="filters.end_date" label="End date"></collabmed-date-time-picker>
      </v-col>
      <v-spacer></v-spacer>
      <v-col class="px-2" md="5" >
        <v-btn large color="primary" @click="filter">Filter</v-btn>
        <v-btn large color="purple" class="white--text" @click="clearFilters">Clear</v-btn>
      </v-col>
    </v-row>

  </v-card-text>
</template>
<script>
import moment from "moment";

export default {
  props: {
    user: {
      type: Boolean,
      default: false,
    },
    uploadExcel: {
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    requestType: 'get',
    user_role: null,
    filters: {
      start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
      end_date: moment(new Date()).endOf('day').format("YYYY-MM-DD HH:MM"),
    },
  }),

  methods: {
    selectSchemes(role) {
      if (role) {
        this.filters.role = role.name;
      }
    },
    roleCleared() {
      this.filters.role = null;
      this.filters.status = null;
    },

    filter() {
      this.$emit('filtered', _.omitBy(this.filters, _.isNil));
    },

    clearFilters() {
      this.$emit('clearFilters');
    },

    initiateUpload() {
      this.$emit('initiateUpload');
    },
  },

};
</script>
