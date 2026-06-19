<template>
  <div>

      <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

      <v-card>
          <v-card-title height="23">
              <h4>Moh 717</h4>
          </v-card-title>

    <!-- "mobile","","","","","oxygen",'danger_signs', 'suspected_malaria_cases','TB_screening','duration_of_current_illness',
     'IMNCI_classifications_or_diagnosis', 'tracer_drugs_prescribed','all_other_treatement_prescibed', 'immunization_status_to_date', 'nutrition_and_diatetics', 'refereed_to','remarks' -->
          <filters :obj="obj" @filter="performFilter"></filters>

              <v-data-table hide-default-footer :headers="list.headers" :items="list.data" class="elevation-1">
                  <template v-slot:item.first_name="{ item }">{{ item.first_name }}</template>
                  <template v-slot:item.middle_name="{ item }">{{ item.middle_name }}</template>
                  <template v-slot:item.last_name="{ item }">{{ item.last_name }}</template>
                  <template v-slot:item.age="{ item }">{{ item.age }}</template>
                  <template v-slot:item.resident_county="{ item }">{{ item.resident_county }}</template>
                  <template v-slot:item.resident_sub_county="{ item }">{{ item.resident_sub_county }}</template>
                  <template v-slot:item.resident_village="{ item }">{{ item.resident_village }}</template>
                  <template v-slot:item.weight="{ item }">{{ item.weight }}</template>
                  <template v-slot:item.height="{ item }">{{ item.height }}</template>
                  <template v-slot:item.mobile="{ item }">{{ item.mobile }}</template>
                  <template v-slot:item.muac="{ item }">{{ item.muac }}</template>
                  <template v-slot:item.pulse="{ item }">{{ item.pulse }}</template>
                  <template v-slot:item.respiration="{ item }">{{ item.respiration }}</template>
                  <template v-slot:item.temperature="{ item }">{{ item.temperature }}</template>
                  <template v-slot:item.oxygen="{ item }">{{ item.oxygen }}</template>


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
      "filters": Filters,
  },

  data: () => ({
      decoratorKey: "Moh204",
      module: "evaluation",
  }),

  methods: {
      navigate(page) {
          this.get(page, this.obj.filters);
      },
  },
};
</script>
