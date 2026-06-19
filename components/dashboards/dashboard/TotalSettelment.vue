<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';


/* Chart */
const chartOptions = computed(() => {
    return {
        chart: {
            fontFamily: 'inherit',
            type: 'line',
            height: 315,
            toolbar: { show: !1 }
        },
        legend: { show: !1 },
        dataLabels: { enabled: !1 },
        stroke: {
            curve: 'smooth',
            show: !0,
            width: 2,
            colors: ['rgba(var(--v-theme-primary))']
        },
        xaxis: {
            categories: ['1W', '', '3W', '', '5W', '6W', '7W', '8W', '9W', '', '11W', '', '13W', '', '15W'],
            axisBorder: { show: !1 },
            axisTicks: { show: !1 },
            tickAmount: 6,
            labels: {
                rotate: 0,
                rotateAlways: !0,
                style: { fontSize: '10px', colors: '#adb0bb', fontWeight: '600' }
            }
        },
        yaxis: {
            show: false,
            tickAmount: 3
        },
        tooltip: {
            theme: 'dark'
        },
        colors: ['rgba(var(--v-theme-primary))'],
        grid: {
            borderColor: 'rgba(var(--v-theme-primary),0.2)',
            strokeDashArray: 4,
            yaxis: { show: false }
        },
        markers: {
            strokeColor: ['rgba(var(--v-theme-primary))'],
            strokeWidth: 3
        }
    };
});
const barChart = {
    series: [
        {
            name: 'settlements',
            data: [40, 40, 80, 80, 30, 30, 10, 10, 30, 30, 100, 100, 20, 20, 140, 140]
        }
    ]
};
</script>
<template>
    <v-card elevation="10" class="bg-lightprimary overflow-hidden">
        <v-card-item>
            <div class="d-flex gap-3 align-center">
                <v-avatar size="48" class="rounded-md bg-surface">
                    <Icon icon="solar:box-linear" class="text-primary" height="25" />
                </v-avatar>
                <div>
                    <span class="textPrimary">Total settlements</span>
                    <h3 class="text-h3 heading font-weight-bold">$122,580</h3>
                </div>
            </div>
            <ClientOnly><apexchart class="mt-5" type="line" height="315" :options="chartOptions" :series="barChart.series"> </apexchart></ClientOnly>
            <div>
                <div class="d-flex justify-space-evenly gap-4">
                    <div class="pe-8">
                        <p class="textPrimary mb-1">Total balance</p>
                        <h3 class="text-h3 heading">$122,580</h3>
                    </div>
                    <div class="ps-8">
                        <p class="textPrimary mb-1">Withdrawals</p>
                        <h3 class="text-h3 heading">$31,640</h3>
                    </div>
                </div>
            </div>
        </v-card-item>
    </v-card>
</template>
