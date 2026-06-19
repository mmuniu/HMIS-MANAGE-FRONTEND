<template>
    <v-col cols="12" class="my-4" sm="6" lg="2" v-if="number">
        <base-material-stats-card
                color="success"
                icon="local_hospital"
                title="All customers"
                :value="number"
                sub-icon="mdi-calendar"
                sub-text="Last 24 Hours"
        />
    </v-col>
</template>
<script>
export default {
    props: ['patientCount'],

    data: () => ({
        number: null,
    }),

    created() {
        this.number = this.patientCount.toLocaleString();
    },
};
</script>
