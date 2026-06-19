<template>
    <v-col cols="12" class="my-4" sm="6" lg="2" v-if="number">
        <base-material-stats-card
                color="primary"
                icon="flash_off"
                :title="title"
                :value="number"
                sub-icon="mdi-calendar"
                sub-text="Last 24 Hours"
        />
    </v-col>
</template>
<script>
export default {
    props: ['visitCount', 'covidEnabled'],

    data: () => ({
        number: null,
    }),

    computed: {
        title() {
            return this.covidEnabled ? 'Screenings this month' : 'Visits this month';
        },
    },

    created() {
        this.number = this.visitCount.toLocaleString();
    },
};
</script>
