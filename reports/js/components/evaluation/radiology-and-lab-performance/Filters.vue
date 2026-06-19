<template>
  <v-card class="pa-0 mb-5" color="transparent" flat>
    <v-card-text class="py-0 my-0">
      <v-row>
        <v-col cols="12" md="3">
          <div class="mx-2">
            <v-autocomplete :items="facilities.facilities" v-model="filters.facility_id" color="blue-grey lighten-2"
              label="Select Facility" item-text="name" item-value="id" clearable @click:clear="facilityCleared"
              @input="facilitySelected">
            </v-autocomplete>
          </div>
        </v-col>

        <v-col cols="12" md="3">
          <div class="mx-2">
            <v-autocomplete :items="departments" v-model="filters.departments" label="Select Departments"
              item-text="type" item-value="type" multiple clearable>
            </v-autocomplete>
          </div>
        </v-col>

        <v-col cols="12" md="3">
          <div class="mx-2">
            <collabmed-year-picker @input="handleYearInput" ref="yearPicker" v-model="filters.selectedYear" />
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-btn @click="filter" class="v-btn v-btn--small theme--light primary" color="success">
            Filter
          </v-btn>

          <collabmed-custom-report-export :data="obj.reportData.data" :fields="excelFieldsData"
            :name="`${obj.reportData.report_title}.xlsx`"
            :worksheet="obj.reportData.report_title"></collabmed-custom-report-export>

          <!-- <download-to-excel v-if="hasReportData" :filters="processedFilters" :url="url" :filename="filename" /> -->

          <download-to-pdf :headers="obj.reportData.headers" :data="obj.reportData.data"
            :filename="filename"></download-to-pdf>

          <download-to-csv :headers="obj.reportData.headers" :data="obj.reportData.data"
            :filename="filename"></download-to-csv>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import _ from "lodash";

export default {
  name: "radiology-and-lab-performance-filters",
  props: {
    obj: {
      required: true,
      type: Object,
    },
  },
  watch: {
    'obj.reportData.headers': function (newHeaders) {
      if (newHeaders) {
        this.excelFieldsData = newHeaders.reduce((acc, field) => {
          if (field.text && field.value) {
            acc[field.text] = field.value;
          }
          return acc;
        }, {});
      } else {
        this.excelFieldsData = {};
      }
    }
  },
  data() {
    return {
      filename: "Radiology Monthly Performance",
      departments: ["lab", "radiology"],
      filters: {
        facility_id: null,
        departments: [],
        selectedYear: null,
      },
      excelFieldsData: {}
    };
  },
  computed: {
    ...mapGetters({
      facilities: "getFacilities",
    }),
    url() {
      return "/api/reports/module/evaluation/radiology-and-lab-performance";
    },
    dateRange() {
      if (this.filters.selectedYear) {
        const year = parseInt(this.filters.selectedYear);
        if (!isNaN(year)) {
          const startDate = new Date(year, 0, 1);
          startDate.setHours(0, 0, 0, 0);

          const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

          return {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          };
        }
      }

      return null;
    },
    cleanFilters() {
      const baseFilters = {
        facility_id: this.filters.facility_id,
        departments: this.filters.departments.map(
          (dep) => dep.charAt(0).toUpperCase() + dep.slice(1).toLowerCase()
        ),
      };

      if (this.dateRange) {
        return { ...baseFilters, ...this.dateRange };
      }

      return _.omitBy(
        baseFilters,
        (value) =>
          value === null ||
          value === undefined ||
          (Array.isArray(value) && value.length === 0)
      );
    },
  },
  methods: {
    ...mapActions(["setFacilities"]),

    handleYearInput(year) {
      this.filters.selectedYear = year;
    },

    facilityCleared() {
      this.filters.facility_id = null;
    },

    facilitySelected(facility) {
      this.filters.facility_id = facility?.id ?? null;
    },

    filter() {
      this.obj.filters = this.cleanFilters;
      this.$emit("filter");
    },
  },

  mounted() {
    this.setFacilities();
  },
};
</script>
