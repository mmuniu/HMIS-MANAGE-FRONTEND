<template>
  <v-col cols="12" class="my-4" sm="6" lg="2" >
    <base-material-stats-card
        color="primary"
        icon="monetization_on"
        :title="title"
        :value="number"
        sub-icon="payment"
        sub-text="Revenue This Month"
    />
  </v-col>
</template>
<script>
export default {
  props: ['thisMonthRevenue'],

  data: () => ({
    number: null,
    title: null,
  }),

  computed: {

  },

  created() {
    this.title='Revenue this month';
    this.number = this.thisMonthRevenue.toString();
  },
};
</script>
