<template>
  <v-col cols="12" class="my-4" sm="6" lg="2" >
    <base-material-stats-card
        color="orange"
        icon="money"
        :title="title"
        :value="number"
        sub-icon="payment"
        sub-text="Revenue This Week"
    />
  </v-col>
</template>
<script>
export default {
  props: ['thisWeekRevenue'],

  data: () => ({
    number: null,
    title: null,
  }),

  computed: {

  },

  created() {
    this.title='Revenue this week';
    this.number = this.thisWeekRevenue.toString();
  },
};
</script>
