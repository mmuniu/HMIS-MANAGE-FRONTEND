<template>
    <v-col cols="12" class="my-4" sm="6" lg="2" v-if="number">
        <base-material-stats-card
                color="purple"
                icon="flash_on"
                :title="title"
                :value="number"
                sub-icon="mdi-tag"
                sub-text="Tracked from Google Analytics"
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
            return this.covidEnabled ? 'Screenings today' : 'Visits today';
        },
    },

    created() {
        this.number = this.visitCount.toLocaleString();
    },
};
</script>
