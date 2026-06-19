<template>
  <v-col cols="12" class="my-4" sm="6" lg="2" >
    <base-material-stats-card
        color="yellow"
        icon="close"
        :title="title"
        :value="number"
        sub-icon="mdi-cash"
        sub-text="Exemptions This Week"
    />
  </v-col>
</template>
<script>
export default {
    props: ['thisWeekExemptions'],

    data: () => ({
        number: null,
        title: null,
    }),

    computed: {

    },

    created() {
        this.title='Exemptions this week';
        this.number = this.thisWeekExemptions.toString();
    },
};
</script>
