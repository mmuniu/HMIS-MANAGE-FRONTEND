<template>
  <v-card class="pa-0" color="transparent" flat>
    <v-card-text class="py-0 my-0">
      <v-row>
        <v-col cols="12" md="3">
          <div class="mx-2">
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
          </div>
        </v-col>

        <v-col cols="12" md="2">
          <div class="mx-2">
            <v-select
              :items="ages"
              item-value="value"
              item-text="name"
              label="Over / Under"
              v-model="filters.age"
              outline
            ></v-select>
          </div>
        </v-col>

        <v-col cols="12" md="2">
          <div class="mx-2">
            <collabmed-year-month-picker @input="handleDateChange" ref="datePicker" v-model="filters.selectedYearMonth" />
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-btn
            @click="filter"
            class="v-btn v-btn--small theme--light primary mr-2"
            color="success"
            >Filter</v-btn
          >
          <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
          <download-to-pdf :headers="obj.reportData.headers" :data="obj.reportData.data" :filename="filename"></download-to-pdf>
          <download-to-csv :headers="obj.reportData.headers" :data="obj.reportData.data" :filename="filename"></download-to-csv>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import _ from "lodash";
import moment from "moment";

export default {
  props: {
    obj: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      loading: false,
      filename: "Lab Malaria Test Report",
      pre: {
        facility: "all facilities",
        age: "all age",
      },
      filters: {
        start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:mm'),
        end_date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
        age: null,
        facility_id: "",
        selectedYearMonth: null, 
      },
    };
  },
  computed: {
    ...mapGetters({
      facilities: "getFacilities",
    }),
    ages() {
      return [
        { name: "All Age", value: null },
        { name: "Over 5", value: "o" },
        { name: "Under 5", value: "u" },
      ];
    },

    url() {
      return "/api/reports/module/evaluation/lab-malaria-test";
    },

    monthRange() {
      if (!this.filters.selectedYearMonth) return null;

      const [year, month] = this.filters.selectedYearMonth.split('-').map(Number);

      // Start date (first day of month at 00:00:00)
      const startDate = new Date(year, month - 1, 1);

      // End date (last day of month at 23:59:59.999)
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      return {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      };
    },
  },

  methods: {
    ...mapActions([
      "setFacilities",
    ]),

    facilityCleared() {
      this.filters.facility_id = null;
    },

    facilitySelected(facility) {
      const self = this;
      this.filters.facility_id = facility;

      this.facilities.facilities.forEach(function (value) {
        if (value.id === self.filters.facility_id) {
          self.pre.facility = value.name;
        }
      });
    },

    handleDateChange(date) {
      const [year, month] = date.split('-').map(Number);

      if (year && month) {
        this.filters.start_date = moment({ year, month: month - 1 }).startOf('month').format('YYYY-MM-DD');
        this.filters.end_date = moment({ year, month: month - 1 }).endOf('month').format('YYYY-MM-DD');
      }
    },

    filter() {
      const filtersCopy = _.cloneDeep(this.filters);

      if (this.monthRange) {
        filtersCopy.start_date = this.monthRange.start_date;
        filtersCopy.end_date = this.monthRange.end_date;
      }

      this.obj.filters = _.omitBy(filtersCopy, _.isNil);

      this.$emit("filter");
    },
  },

  mounted() {
    this.setFacilities();
  },
};
</script>
