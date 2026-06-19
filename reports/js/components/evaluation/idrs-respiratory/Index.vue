<template>
  <v-card>
      <v-card-title height="23">
          <h4>Integrated Disease Surveillance and Response Indicators</h4>
          <v-spacer></v-spacer>
      </v-card-title>

      <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

      <idrs-filters :obj="obj" @filter="performFilter()"></idrs-filters>

      <v-data-table
              flat
              disable-pagination
              hide-default-footer
              :headers="list.headers"
              :items="list.data"
      >

      <!-- <template v-slot:item.action="{ item }"> -->
        <v-btn @click="insertSample(item)" color="primary">
          Insert Sample
        </v-btn>
      <!-- </template> -->
    </v-data-table>

      <v-row>
          <v-col cols="12" class="text-center">
              <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
          </v-col>
      </v-row>
  </v-card>
</template>
<script>
import { reportsMixin } from '@reports/libs/reportsMixin';
import Filters from './Filters';

export default {
  name: 'idrs-respiratory',

  mixins: [
      reportsMixin,
  ],

  components: {
    "idrs-filters": Filters,
  },

  data: () => ({
      module: 'evaluation',
      decoratorKey: 'idrs-respiratory',
  }),

  methods: {
    insertSample(item) {
      console.log('Insert Sample for', item);
      // Add your insert sample logic here
    },
  },

  async mounted() {


  // console.log(this.list.headers);


  },

};
</script>
