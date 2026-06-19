<template>
  <div>
    <canvas :id="chart_id" width="800" height="800" aria-label="chart" role="img"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js';

export default {
  mounted() {
    this.drawChart();
  },
  props: {
    type: {
      type: String,
      default: 'line',
    },
    data: {
      type: Object,
      default: () => ({}),
    },
    partograph_options: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      chart_id: `pulse-and-bp`,
    };
  },
  methods: {
    drawChart() {
      const ctx = document.getElementById(this.chart_id);
      new Chart(ctx, {
        type: 'line',
        data: this.data,
        options: {
          ...this.partograph_options,
          legend: {
            display: false, // Hide legend keys
          },
          scales: {
            ...this.partograph_options.scales,
            yAxes: [{
              ...this.partograph_options.scales?.yAxes?.[0],
              ticks: {
                ...this.partograph_options.scales?.yAxes?.[0]?.ticks,
                beginAtZero: false,
                min: 60,
                max: 180,
                stepSize: 10,
              },
            }],
            xAxes: [{
              ...this.partograph_options.scales?.xAxes?.[0],
              ticks: {
                ...this.partograph_options.scales?.xAxes?.[0]?.ticks,
                display: false,
              },
            }],
          },
          tooltips: {
            callbacks: {
              label: (tooltipItem, data) => {
                const datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
                const value = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                const createdAt = value.created_at || '';
                return `${datasetLabel}: ${createdAt}`;
              },
            },
          },
        },
      });
    },
  },
};
</script>

<style>
#pulse-and-bp {
  height:1070px;
  width:1070px;
}
</style>
