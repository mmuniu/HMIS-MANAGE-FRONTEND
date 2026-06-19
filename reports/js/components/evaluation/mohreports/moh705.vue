<template>
  <div>

      <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

      <v-card>
          <v-card-title height="23">
              <h4>Moh 705</h4>
          </v-card-title>

          <diagnosis-filters :obj="obj" @filter="performFilter"></diagnosis-filters>

              <v-data-table hide-default-footer :headers="list.headers" :items="list.data" class="elevation-1">
                  <template v-slot:item.patient_name="{ item }">{{ item.full_name }}</template>
                  <template v-slot:item.residence="{ item }">{{ item.town }}</template>

                  <template v-slot:item.diagnosis="{ item }">
                          <span v-for="(diagnosis, index) in item.diagnosis" :key="index"> {{ diagnosis ? diagnosis : 'none' }}
                              <span v-if="item.diagnosis.length > 0"></span>
                          </span>
                  </template>
                  <template v-slot:item.bp_systolic="{ item }">{{ item.systolic ? item.systolic : 'none'}}</template>
                  <template  v-slot:item.bp_diastolic="{ item }">{{ item.diastolic ? item.diastolic : 'none'}}</template>
                  <template v-slot:item.bp_status="{ item }">{{ item.flag}}</template>
                  <template v-slot:item.procedures="{ item }">
                          <span v-if="item.investigations.length > 0">
                               <span v-for="(investigation, index) in item.investigations" :key="index">
                                  {{ investigation ? investigation : 'none' }} |
                              </span>
                          </span>

                  </template>
                  <template v-slot:item.medications="{ item }">
                          <span v-if="item.prescriptions.length > 0">
                              <span  v-for="(prescription, index) in item.prescriptions" :key="index">
                                  {{ prescription ? prescription: 'none' }} |
                              </span>
                          </span>

                  </template>
              </v-data-table>

          <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
      </v-card>
  </div>

</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filters from "./Filters";

export default {
  title: "Patient 204A ",

  mixins: [
      reportsMixin,
  ],

  components: {
      "diagnosis-filters": Filters,
  },

  data: () => ({
      decoratorKey: "patients-diagnoses",
      module: "evaluation",
  }),

  methods: {
      navigate(page) {
          this.get(page, this.obj.filters);
      },
  },
};
</script>
