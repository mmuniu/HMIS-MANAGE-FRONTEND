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
        <v-col cols="12" md="3">
          <div class="mx-2">
            <procedure-search
              @results="procedureSelected"
              @resultCleared="clearSelectedProcedure"
            ></procedure-search>
          </div>
        </v-col>
        <v-col cols="12" md="3">
          <div class="mx-2">
            <v-autocomplete
              :items="departments"
              outline
              v-model="filters.department"
              color="blue-grey lighten-2"
              label="Select Department"
              @input="departmentSelected"
              item-text="type"
              clearable
              @click:clear="departmentCleared"
              item-value="type"
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
        <v-col md="2">
          <collabmed-date-time-picker
            outline
            @input="setStartDate"
            :datetime="filters.start_date"
            label="Start date"
          ></collabmed-date-time-picker>
        </v-col>
        <v-col md="2">
          <collabmed-date-time-picker
            outline
            @input="setEndDate"
            :datetime="filters.end_date"
            label="End date"
          ></collabmed-date-time-picker>
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
            :filters="filters"
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
  name: "RadiologyFilter",
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
      filename: "Radiology Procedures Report",
      pre: {
        facility: "all facilities",
        department: "all departments",
        age: "all age"
      },
      allFacilities: [],
      allDepartments: [],
      filters: {
        start_date: moment().format("YYYY-MM-DD HH:mm"),
        end_date: moment().endOf("month").format("YYYY-MM-DD HH:mm"),
        age: "",
        procedure: "",
        department: "radiology",
        facility_id: "",
        admission_id: ""
      },
    };
  },
  watch: {
    all_departments({ data }) {
      for (let i = 0; i < data.department.length; i++) {
        this.allDepartments.push(data.department[i].name);
      }
    },
  },
  computed: {
    ...mapGetters({
      all_departments: "getDestinations",
      departments: "getRevenueDepartments",
      facilities: "getFacilities",
    }),
    patient() {
      return [
        { name: "Inpatient", value: 1 },
        { name: "Outpatient", value: null },
      ];
    },
    ages() {
      return [
        { name: "All Age", value: null },
        { name: "Over 5", value: "o" },
        { name: "Under 5", value: "u" },
      ];
    },
    url() {
      return "/api/reports/module/evaluation/radiology";
    },
  },
  methods: {
    ...mapActions([
      "setDestinations",
      "setFacilities",
      "setRevenueDepartments",
    ]),
    facilityCleared() {
      this.filters.facility_id = null;
    },
    departmentCleared() {
      this.filters.department = null;
    },
    facilitySelected(facility) {
      this.filters.facility_id = facility;
      for (let value of this.facilities.facilities) {
        if (value.id === facility) {
          this.pre.facility = value.name;
          break;
        }
      }
    },
    departmentSelected(department) {
      this.filters.department = department;
    },
    procedureSelected(procedure) {
      if (procedure) {
        this.filters.procedure = procedure.id;
      }
    },
    setStartDate(datetime) {
      this.filters.start_date = datetime;
    },
    setEndDate(datetime) {
      this.filters.end_date = datetime;
    },
    clearSelectedProcedure() {
      this.filters.procedure = null;
    },
    filter() {
      this.obj.filters = _.omitBy(this.filters, _.isNil);
      this.$emit("filter");
    },
  },
  mounted() {
    this.setDestinations();
    this.setFacilities();
    this.setRevenueDepartments();
  },
};
</script>
