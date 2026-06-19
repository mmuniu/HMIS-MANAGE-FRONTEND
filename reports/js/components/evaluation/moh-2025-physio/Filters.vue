<template>
  <v-card class="pa-0 mb-5" color="transparent" flat>
    <v-card-text class="py-0 my-0">
      <v-row class="align-center">
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
            <collabmed-year-picker @input="setYear" v-model="filters.selectedYear" label="Select Year" />
          </div>
        </v-col>

        <v-col cols="12" md="3" class="px-2 d-flex align-center">
          <v-btn @click="filter" class="v-btn theme--light primary mr-2" color="success">
            Filter
          </v-btn>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="12" class="d-flex align-center flex-wrap">
          <download-to-excel :filters="processedFilters" :url="url" :filename="filename" class="me-2">
          </download-to-excel>

          <download-to-pdf :headers="obj.reportData?.headers" :data="obj.reportData?.data" :filename="filename"
            class="me-2" v-if="obj.reportData">
          </download-to-pdf>

          <download-to-csv :headers="obj.reportData?.headers" :data="obj.reportData?.data" :filename="filename"
            v-if="obj.reportData">
          </download-to-csv>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import _ from "lodash";

export default {
  name: "Physiotheraphy-report",

  props: {
    obj: {
      required: true,
      type: Object,
    },
  },

  data() {
    return {
      filename: "Physiotheraphy report",
      filters: {
        facility_id: null,
        selectedYear: null,
      },
    };
  },

  computed: {
    ...mapGetters({
      facilities: "getFacilities",
    }),

    url() {
      return "/api/reports/module/evaluation/moh-2025-physio";
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
        value === undefined
      );
    }
  },

  methods: {
    ...mapActions([
      "setFacilities",
    ]),

    facilityCleared() {
      this.filters.facility_id = null;
    },

    facilitySelected(facility) {
      this.filters.facility_id = facility;
    },

    setYear(year) {
      this.filters.selectedYear = year;
    },

    filter() {
      this.obj.filters = this.processedFilters;
      this.$emit("filter");
    },
  },

  mounted() {
    this.setFacilities();
  },
};
</script>