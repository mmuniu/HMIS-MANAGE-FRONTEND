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
        props: ['current_admissions'],

        data: () => ({
            number: null,
        }),

        computed: {
            title() {
                return 'Current hospitalizations';
            },
        },

        created() {
            this.number = this.current_admissions.toLocaleString();
        },
    };
</script>
