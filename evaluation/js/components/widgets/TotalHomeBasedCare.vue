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
        props: ['total_number'],

        data: () => ({
            number: null,
        }),

        computed: {
            title() {
                return 'Total Homed based care admissions';
            },
        },

        created() {
            this.number = this.total_number.toLocaleString();
        },
    };
</script>
