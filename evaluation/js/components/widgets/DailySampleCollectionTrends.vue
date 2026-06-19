<template>
    <v-col cols="12" class="my-4" lg="4">
        <collabmed-loading v-if="!dailyCollectionsTrendChart"></collabmed-loading>

        <base-material-chart-card v-else
                                  :data="dailyCollectionsTrendChart.data"
                                  :options="dailyCollectionsTrendChart.options"
                                  color="#FF6D00"
                                  hover-reveal
                                  type="Line"
        >
            <template v-slot:reveal-actions>
                <v-tooltip bottom>
                    <template v-slot:activator="{ attrs, on }">
                        <v-btn v-bind="attrs"
                               color="info"
                               icon
                               v-on="on">
                            <v-icon color="info">
                                mdi-refresh
                            </v-icon>
                        </v-btn>
                    </template>
                    <span>Refresh</span>
                </v-tooltip>

                <v-tooltip bottom>
                    <template v-slot:activator="{ attrs, on }">
                        <v-btn v-bind="attrs"
                               light
                               icon
                               v-on="on">
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                    </template>
                    <span>Change Date</span>
                </v-tooltip>
            </template>

            <h4 class="card-title font-weight-light mt-2 ml-2">
                Daily sample collections trend
            </h4>

            <p class="d-inline-flex font-weight-light ml-2 my-0">
                Sample collections trend for the last 7 days.
            </p>

            <template v-slot:actions>
                <v-icon
                        class="mr-1"
                        small
                >
                    mdi-clock-outline
                </v-icon>
                <span class="caption grey--text font-weight-light">updated 4 minutes ago</span>
            </template>
        </base-material-chart-card>
    </v-col>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    name: 'DailySampleCollectionsTrend',

    data() {
        return {
            dailyCollectionsTrendChart: null,
        };
    },

    computed: {
        ...mapGetters({
            dailyCollections: 'getDailyCollections',
        }),
    },

    watch: {
        dailyCollections(val) {
            this.dailyCollectionsTrendChart = {
                data: {
                    labels: val.days,
                    series: [
                        val.values,
                    ],
                },
                options: {
                    lineSmooth: this.$chartist.Interpolation.cardinal({
                        tension: 0,
                    }),
                    low: 0,
                    high: Math.max.apply(null, val.values),
                    chartPadding: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    },
                },
            };
        },
    },

    methods: {
        ...mapActions([
            'setDailyCollections',
        ]),
    },

    created() {
        this.setDailyCollections();
    },
};
</script>
