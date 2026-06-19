<template>
  <v-card-text class="py-0 my-0">
    <v-row >
      <v-col cols="8" md="3" class="px-2">
        <v-autocomplete :items="roles.roles"
                        @change="selectSchemes($event)"
                        item-text="name" return-object
                        clearable
                        @click:clear="roleCleared()"
                        v-model="user_role"
                        label="User Role" outline
        ></v-autocomplete>
      </v-col>
      <v-col class="px-2" md="2">
        <v-select :items="paymentStatus"
                  item-value="value"
                  label="Status"
                  clearable
                  item-text="name"
                  v-model="filters.status"></v-select>
      </v-col>
      <v-col class="px-2" md="3" >
        <collabmed-date-time-picker dateOnly outline  v-model="filters.start_date" label="Start date"></collabmed-date-time-picker>
      </v-col>
      <v-col class="px-2" md="3" >
        <collabmed-date-time-picker dateOnly outline v-model="filters.end_date" label="End date"></collabmed-date-time-picker>
      </v-col>
    </v-row>

    <v-row >
      <v-col class="px-2" md="5" >
        <v-btn large color="primary" @click="filter">Filter</v-btn>
        <v-btn large color="purple" class="white--text" @click="clearFilters">Clear</v-btn>
        <download-to-excel :filters="filters"
                           :url="url"
                           :filename="filename">
        </download-to-excel>

        <v-btn large color="success" v-if="uploadExcel" class="white--text" @click="initiateUpload">Upload Excel</v-btn>
      </v-col>
    </v-row>
  </v-card-text>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
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
    paymentStatus: [
      { name: 'All', value: 2 },
      { name: 'Active', value: 1 },
      { name: 'Inactive', value: 0 },
    ],
    insuranceSchemes: [],
    user_role: null,
    filters: {
      status: null,
      role: null,
      start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
      end_date: moment(new Date()).endOf('day').format("YYYY-MM-DD HH:MM"),
    },
    filename: 'User Roles data'
  }),

  computed: {
    ...mapGetters({
      roles: 'getRoles',
    }),
    url() {
      return "/api/users/users";
    },
  },

  methods: {
    ...mapActions({
      fetchRoles: 'setRoles',
    }),
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

  mounted() {
    this.fetchRoles();
  },
};
</script>
