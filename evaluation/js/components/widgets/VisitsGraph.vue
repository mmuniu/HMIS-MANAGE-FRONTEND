
<template>
    <v-col cols="12" class="my-4" lg="6">
        <collabmed-loading v-if="!visitsTrendChart"></collabmed-loading>

        <base-material-chart-card v-else
                                  :data="visitsTrendChart.data"
                                  :options="visitsTrendChart.options"
                                  color="#6A1B9A"
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
                Departmental visits
            </h4>

            <p class="d-inline-flex font-weight-light ml-2 my-0">
                total number of visits in each department within the month
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
    name: 'departmental-visits',

    data() {
        return {
            visitsTrendChart: null,
        };
    },

    computed: {
        ...mapGetters({
            visits: 'getDepartmentalVisits',
        }),
    },

    watch: {
        visits(val) {
            this.visitsTrendChart = {
                data: {
                    labels: val.labels,
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
            'setDepartmentalVisits',
        ]),
    },

    created() {
        this.setDepartmentalVisits({
            params: {
                graph: true,
            },
        });
    },
};
</script>


<!--<template>
    <v-col cols="12" class="my-4" lg="6">
        <collabmed-loading v-if="!visitsTrendChart"></collabmed-loading>

        <base-material-chart-card
                v-else
                :data="visitsTrendChart.data"
                :options="visitsTrendChart.options"
                :responsive-options="visitsTrendChart.responsiveOptions"
                color="#6A1B9A"
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
                Departmental visits
            </h4>

            <p class="d-inline-flex font-weight-light ml-2 my-0">
                total number of visits in each department within the month
            </p>

            <template v-slot:actions>
                <v-icon class="mr-1"
                        small>
                    watch_later
                </v-icon>
                <span class="caption grey&#45;&#45;text font-weight-light">updated 10 minutes ago</span>
            </template>
        </base-material-chart-card>
    </v-col>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

export default {
    name: "DepartmentalVisits",

    data() {
        return {
            visitsTrendChart: null,
        };
    },

    computed: {
        ...mapGetters({
            visits: "getDepartmentalVisits",
        }),
    },

    watch: {
        visits(val) {
            this.visitsTrendChart = {
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
                    ["screen and (max-width: 640px)", {
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
            "setDepartmentalVisits",
        ]),
    },

    created() {
        this.setDepartmentalVisits({
            params: {
                graph: true,
            },
        });
    },
};
</script>-->
