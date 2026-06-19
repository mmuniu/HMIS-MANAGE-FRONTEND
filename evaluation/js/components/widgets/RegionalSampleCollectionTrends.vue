<template>
    <v-col cols="12">
        <collabmed-loading v-if="!regionalSampleCollectionsChart"></collabmed-loading>

        <base-material-chart-card
                v-else
                :data="regionalSampleCollectionsChart.data"
                :options="regionalSampleCollectionsChart.options"
                :responsive-options="regionalSampleCollectionsChart.responsiveOptions"
                color="#26C6DA"
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
                Regional sample collections
            </h4>

            <p class="d-inline-flex font-weight-light ml-2 my-0">
                Number of sample collections from the different regions within the month
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
    name: 'RegionalSampleCollectionTrends',

    data() {
        return {
            regionalSampleCollectionsChart: null,
        };
    },

    computed: {
        ...mapGetters({
            sampleCollections: 'getRegionalCollections',
        }),
    },

    watch: {
        sampleCollections(val) {
            this.regionalSampleCollectionsChart = {
                data: {
                    labels: val.labels,
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
            'setRegionalCollections',
        ]),
    },

    created() {
        this.setRegionalCollections();
    },
};
</script>
