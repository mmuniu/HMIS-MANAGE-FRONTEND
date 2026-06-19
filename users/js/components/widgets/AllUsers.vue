<template>
    <v-col cols="12" class="my-4" sm="6" lg="2" v-if="number">
        <base-material-stats-card
                color="pink"
                icon="group"
                title="All users"
                :value="number"
                sub-icon="mdi-calendar"
                sub-text="Last 24 Hours"
        />
    </v-col>
</template>
<script>
export default {
    props: ["userCount"],

    data: () => ({
        number: null,
    }),

    created() {
        this.number = this.userCount.toLocaleString();
    },
};
</script>
