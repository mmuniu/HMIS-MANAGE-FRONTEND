<template>
  <v-col cols="12" class="my-4" sm="6" lg="2" >
    <base-material-stats-card
        color="red"
        icon="cancel"
        :title="title"
        :value="number"
        sub-icon="mdi-cash"
        sub-text="Waivers This Week"
    />
  </v-col>
</template>
<script>
export default {
  props: ['thisWeekWaivers'],

  data: () => ({
    number: null,
    title: null,
  }),

  computed: {

  },

  created() {
    this.title='Waivers this week';
    this.number = this.thisWeekWaivers.toString();
  },
};
</script>
