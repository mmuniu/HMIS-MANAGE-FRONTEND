<template>
  <v-card class="pa-0" color="transparent" flat>
    <v-card-text class="py-0 my-0">
      <v-row>
        <!-- Facility Filter -->
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

        <v-col cols="12" md="3">
          <div class="mx-2">
            <v-select
              :items="patient"
              item-value="value"
              item-text="name"
              label="Inpatient / Outpatient"
              v-model="filters.admission_id"
              outline
            ></v-select>
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
          <v-btn
            @click="filter"
            class="v-btn v-btn--small theme--light primary"
            color="success"
          >
            Filter
          </v-btn>

          <download-to-excel
            :filters="processedFilters"
            :url="url"
            :filename="filename"
          ></download-to-excel>
          <download-to-pdf
            :headers="obj.reportData.headers"
            :data="obj.reportData.data"
            :filename="filename"
          ></download-to-pdf>
          <download-to-csv
            :headers="obj.reportData.headers"
            :data="obj.reportData.data"
            :filename="filename"
          ></download-to-csv>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import _ from "lodash";
import moment from "moment";
import ProcedureSearch from "@evaluation/components/procedures/ProcedureSearch";

export default {
  name: "EvaluationFilter",
  props: {
    obj: {
      type: Object,
      required: true,
    },
  },
  components: {
    "procedure-search": ProcedureSearch,
  },
  data() {
    return {
      loading: false,
      filename: "Outpatient Evaluation Report",
      pre: {
        facility: "all facilities",
        department: "all departments",
        age: "all age"
      },
      filters: {
        selectedYear: moment().year(), 
        age: "",
        department: "radiology",
        facility_id: "",
        admission_id: null,
      },
    };
  },
  computed: {
    ...mapGetters({
      facilities: "getFacilities",
    }),
    patient() {
      return [
        { name: "Outpatient", value: null },
      ];
    },
    url() {
      return "/api/reports/module/evaluation/outpatient-evaluation";
    },
    processedFilters() {
      const baseFilters = {
        ...this.filters,
        department: this.filters.department,
      };

      if (this.filters.selectedYear) {
        const year = parseInt(this.filters.selectedYear);
        if (!isNaN(year)) {
          return {
            ...baseFilters,
            start_date: new Date(year, 0, 1).toISOString(),
            end_date: new Date(year, 11, 31, 23, 59, 59, 999).toISOString()
          };
        }
      }

      return _.omitBy(baseFilters, value => 
        value === null || 
        value === undefined ||
        value === "" ||
        (typeof value === 'object' && _.isEmpty(value))
      );
    }
  },
  methods: {
    ...mapActions([
      "setFacilities",
    ]),
    facilityCleared() {
      this.filters.facility_id = null;
      this.pre.facility = "all facilities";
    },
    facilitySelected(facility) {
      this.filters.facility_id = facility;
      const selectedFacility = this.facilities.facilities.find(f => f.id === facility);
      this.pre.facility = selectedFacility ? selectedFacility.name : "all facilities";
    },
    handleYearInput(year) {
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