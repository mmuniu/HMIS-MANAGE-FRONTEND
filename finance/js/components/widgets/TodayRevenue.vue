<template>
  <v-col cols="12" class="my-4" sm="6" lg="2" >
    <base-material-stats-card
        color="green"
        icon="payment"
        :title="title"
        :value="number"
        sub-icon="briefcase"
        sub-text="Revenue Today"
    />
  </v-col>
</template>
<script>
export default {
    props: ['todayRevenue'],

    data: () => ({
        number: null,
      title:null,
    }),

    computed: {

    },

    created() {
      this.title='Revenue today';
        this.number = this.todayRevenue.toString();
    },
};
</script>
