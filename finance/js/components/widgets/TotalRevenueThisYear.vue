<template>
  <v-col cols="12" class="my-4" sm="6" lg="2" >
    <base-material-stats-card
        color="green"
        icon="fa-bank"
        :title="title"
        :value="number"
        sub-icon="briefcase"
        sub-text="Revenue this year"
    />
  </v-col>
</template>
<script>
export default {
  props: ['thisYearRevenue'],

  data: () => ({
    number: null,
    title: null,
  }),

  computed: {

  },

  created() {
    this.title='Revenue this year';
    this.number = this.thisYearRevenue.toString();
  },
};
</script>
