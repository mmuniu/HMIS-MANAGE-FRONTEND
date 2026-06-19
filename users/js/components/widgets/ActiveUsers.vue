<template>
    <v-col cols="12" class="my-4" sm="6" lg="2" v-if="number">
        <base-material-stats-card
                color="orange"
                icon="all_inclusive"
                title="Active users"
                :value="number"
                sub-icon="mdi-alert"
                sub-icon-color="red"
                sub-text="Get More Space..."
        />
    </v-col>
</template>
<script>
export default {
    props: ["active"],

    data: () => ({
        number: null,
    }),

    created() {
        this.number = this.active.toLocaleString();
    },
};
</script>
