<script setup lang="ts">
import { computed } from 'vue';


/*Chart*/
const chartOptions = computed(() => {
    return {
        chart: {
            type: 'area',
            height: 80,
            fontFamily: `inherit`,
            toolbar: {
                show: false
            },
            sparkline: {
                enabled: true
            },
            group: 'sparklines'
        },
        colors: ['rgba(var(--v-theme-secondary))'],
        stroke: {
            curve: 'smooth',
            width: 2
        },
        fill: {
                   type: 'solid',
                   colors: ['rgba(var(--v-theme-secondary),0.08)'],
                   opacity: 0.05
               },
        markers: {
            size: 0
        },
        tooltip: {
            theme: 'dark',
            x: {
                show: false
            }
        }
    };
});
const Chart = [
    {
        name: '',
        data: [30, 25, 35, 20, 30, 40]
    }
];
</script>
<template>
    <v-card elevation="10" >
        <v-card-item>
            <p class="text-subtitle-1 textSecondary">Customers</p>
            <h4 class="text-h4 my-2">36,358</h4>
            <div>
                <v-avatar class="bg-lighterror" size="20">
                    <ArrowDownRightIcon size="15" class="text-error" />
                </v-avatar>
                <span class="text-body-1 ml-2 textSecondary">+9%</span>
            </div>
        </v-card-item>
        <ClientOnly><apexchart class="" type="area" height="80" :options="chartOptions" :series="Chart"> </apexchart></ClientOnly>
    </v-card>
</template>
