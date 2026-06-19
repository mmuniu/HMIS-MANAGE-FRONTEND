<template>
    <v-col cols="12" class="mt-3 mb-6">
        <collabmed-loading v-if="!chartData"></collabmed-loading>

        <div v-else>
            <GChart
                    type="ColumnChart"
                    :data="chartData"
                    :options="chartOptions"
            />
        </div>
    </v-col>
</template>
<script>

    import { GChart } from "vue-google-charts";

    export default {
        props: ['data'],

        components: {
            GChart
        },

        data: () => ({
            number: null,
            chartData: null,
            chartOptions: {
                chart: {
                    title: 'Sub county graph',
                    subtitle: null,
                }
            }
        }),

        computed: {
            title() {
                return 'Total positive Cases';
            },
        },

        mounted() {
            if(this.data) {
                this.chartData = this.data.chartData;
            }
        },
    };
</script>
