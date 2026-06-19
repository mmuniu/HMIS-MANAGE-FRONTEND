<template>
  <div>
    <v-card  flat>
      <v-divider class="my-0"></v-divider>
      <!--        <v-card>-->
      <v-card-title height="23">
        <h4>Cashier Collections</h4>
      </v-card-title>

      <cashier-report-filter :obj="obj" @filter="performFilter"></cashier-report-filter>

      <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

      <div>
        <div class="mx-5">
          <v-alert :value="true"
                   color="success"
                   outlined>
            <p>Cash: {{ list.cash }}</p>
            <p>Mpesa: {{ list.mpesa }}</p>
            <p>Card: {{ list.card }}</p>
            <p>Cheque: {{ list.cheque }}</p>
          </v-alert>
        </div>
        <hr />
        <v-spacer></v-spacer>

        <v-data-table
            hide-default-footer
            :headers="list.headers"
            :items="list.data"
            class="elevation-1">
          <template v-slot:item.actions="{ item }">
            <v-btn small color="primary" @click="viewDetails(item)">view more</v-btn>

          </template>
          <template v-slot:footer>
            Total Amount: <strong>{{ list.total }}</strong>
          </template>
        </v-data-table>
        <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
      </div>
    </v-card>
  </div>
</template>
<script>
import { reportsMixin } from '@reports/libs/reportsMixin';
import Filter from './Filters';

export default {
  title: 'Cashier Collections Report',

  mixins: [
    reportsMixin,
  ],

  components: {
    'cashier-report-filter': Filter,
  },

  data: () => ({
    module: 'finance',
    decoratorKey: 'cashier-collections',
    aggregate: false,
  }),

  methods: {
    navigate(page) {
      this.get(page, this.obj.filters);
    },
    viewDetails(item) {
      window.open(`/finance/evaluation/payment_details/${item.id}`, '_blank');
    },
  },
};
</script>
