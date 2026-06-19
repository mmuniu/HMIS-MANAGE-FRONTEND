<template>
  <v-card class="pa-0" color="transparent" flat>
    <v-card-text class="py-0 my-0">
      <v-row>
        <v-col cols="12" md="3">
          <div class="mx-2">
            <v-autocomplete :items="facilities.facilities" outline v-model="filters.facility_id"
              color="blue-grey lighten-2" label="Select Facility" item-text="name" clearable
              @click:clear="facilityCleared" item-value="id" @input="facilitySelected"></v-autocomplete>
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
          <v-btn @click="filter" class="v-btn v-btn--small theme--light primary mr-2" color="success">
            Filter
          </v-btn>

          <download-to-excel v-if="hasReportData" :filters="processedFilters" :url="url" :filename="filename" />
          <download-to-pdf v-if="hasReportData" :headers="obj.reportData.headers" :data="obj.reportData.data"
            :filename="filename" />
          <download-to-csv v-if="hasReportData" :headers="obj.reportData.headers" :data="obj.reportData.data"
            :filename="filename" />
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
      filename: "Ward Admissions Report",
      filters: {
        selectedYear: null,
        facility_id: null,
      },
      hasReportData: false,
    };
  },

  computed: {
    ...mapGetters({
      facilities: "getFacilities",
    }),

    url() {
      return "/api/reports/module/inpatient/ward-admissions";
    },

    processedFilters() {
      const baseFilters = {
        facility_id: this.filters.facility_id,
      };

      if (this.filters.selectedYear) {
        const year = parseInt(this.filters.selectedYear);
        if (!isNaN(year)) {
          const startDate = new Date(year, 0, 1);
          startDate.setHours(0, 0, 0, 0);

          const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

          return {
            ...baseFilters,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          };
        }
      }

      return _.omitBy(baseFilters, value =>
        value === null ||
        value === undefined ||
        value === ""
      );
    }
  },

  methods: {
    ...mapActions(["setFacilities"]),

    facilityCleared() {
      this.filters.facility_id = null;
    },

    facilitySelected(facility) {
      this.filters.facility_id = facility;
    },

    handleYearInput(year) {
      this.filters.selectedYear = year;
    },

    filter() {
      this.obj.filters = this.processedFilters;
      this.$emit("filter");
    },

    checkReportData() {
      this.hasReportData = !!(
        this.obj.reportData &&
        this.obj.reportData.data &&
        this.obj.reportData.data.length > 0
      );
    }
  },

  watch: {
    obj: {
      deep: true,
      handler() {
        this.checkReportData();
      },
    },
  },

  mounted() {
    this.setFacilities();
    this.checkReportData();
  },
};
</script>