<template>
    <div>
        <collabmed-loading v-if="!analytics.data"></collabmed-loading>

        <div v-else>
            <div v-for="(analytic, index) in analytics.data" :key="index">
                <v-card-title style="font-size: 15px; font-weight: bold;" class="grey--text">
                    <h3>{{ analytic.name }}</h3>
                    <v-spacer></v-spacer>
                    <span class="text-right">Total: {{ analytic.value.total }}</span>
                </v-card-title>

                <v-row>
                    <v-col v-for="(analysis, index) in analytic.value.data" :key="index">
                        <p style="text-decoration: underline">{{ analysis.time }}</p>
                        <p>No. of records: {{ analysis.no_of_records }}</p>
                        <p>Total Amount: {{ analysis.amount }}</p>
                    </v-col>
                </v-row>
            </div>
        </div>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {

    props: {
        insurance: {
            type: Object,
            required: true,
        },
    },

    computed: {
        ...mapGetters({
            analytics: 'getInsCompanyAnalytics',
        }),
    },

    methods: {
        ...mapActions([
            'setInsCompanyAnalytics',
        ]),

        initialize() {
            this.setInsCompanyAnalytics({
                params: {
                    insurance_id: this.insurance.id,
                },
            });
        },
    },

    mounted() {
        this.initialize();
    },
};
</script>
