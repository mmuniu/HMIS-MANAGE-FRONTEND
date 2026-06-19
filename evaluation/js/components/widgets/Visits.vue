<template>
    <v-col cols="12" class="my-4" sm="6" lg="2"  v-if="number">
        <base-material-stats-card
                color="info"
                icon="flash_auto"
                :title="title"
                :value="number"
                sub-icon="mdi-clock"
                sub-text="Just Updated"
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
            return this.covidEnabled ? 'Total screenings ' : 'Total Visits';
        },
    },

    created() {
        this.number = this.visitCount.toLocaleString();
    },
};
</script>
