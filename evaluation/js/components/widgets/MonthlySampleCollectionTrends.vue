<template>
    <v-col cols="12" class="my-4" lg="4">
        <collabmed-loading v-if="!monthlyCollectionsTrendChart"></collabmed-loading>

        <base-material-chart-card
                v-else
                :data="monthlyCollectionsTrendChart.data"
                :options="monthlyCollectionsTrendChart.options"
                :responsive-options="monthlyCollectionsTrendChart.responsiveOptions"
                color="#1B5E20"
                hover-reveal
                type="Bar"
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

            <h4 class="card-title font-weight-light ml-2">
                Monthly Sample collections trend
            </h4>

            <p class="d-inline-flex font-weight-light ml-2 my-0">
                Sample collections trend in the last 12 months
            </p>

            <template v-slot:actions>
                <v-icon class="mr-1"
                        small>
                    watch_later
                </v-icon>
                <span class="caption grey--text font-weight-light">updated 10 minutes ago</span>
            </template>
        </base-material-chart-card>
    </v-col>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    name: 'MonthlySampleCollectionsTrend',

    data() {
        return {
            monthlyCollectionsTrendChart: null,
        };
    },

    computed: {
        ...mapGetters({
            monthlyCollections: 'getMonthlyCollections',
        }),
    },

    watch: {
        monthlyCollections(val) {
            this.monthlyCollectionsTrendChart = {
                data: {
                    labels: val.months,
                    series: [
                        val.values,
                    ],
                },
                options: {
                    axisX: {
                        showGrid: false,
                    },
                    low: 0,
                    high: Math.max.apply(null, val.values),
                    chartPadding: {
                        top: 0,
                        right: 5,
                        bottom: 0,
                        left: 0,
                    },
                },
                responsiveOptions: [
                    ['screen and (max-width: 640px)', {
                        seriesBarDistance: 5,
                        axisX: {
                            labelInterpolationFnc: function(value) {
                                return value[0];
                            },
                        },
                    }],
                ],
            };
        },
    },

    methods: {
        ...mapActions([
            'setMonthlyCollections',
        ]),
    },

    created() {
        this.setMonthlyCollections();
    },
};
</script>
