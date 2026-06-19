<template>
  <div>
    <canvas :id="chart_id" width="800" height="400"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js';

export default {
  mounted() {
    this.drawChart();
  },
  props: {
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
      chart_id: `chart-id-${Math.random().toString(36).substr(2, 9)}`,
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
          scales: {
            ...this.partograph_options.scales,
            yAxes: [{
              ...this.partograph_options.scales?.yAxes?.[0],
              ticks: {
                ...this.partograph_options.scales?.yAxes?.[0]?.ticks,
                suggestedMin: 80, // Ensure y-axis starts from 80
                suggestedMax: 200, // Ensure y-axis ends at 200
                stepSize: 10,
              },
              scaleLabel: {
                ...this.partograph_options.scales?.yAxes?.[0]?.scaleLabel,
                display: false,
                labelString: '',
              },
            }],
            xAxes: [{
              ...this.partograph_options.scales?.xAxes?.[0],
              type: 'time',
              time: {
                unit: 'hour',
                displayFormats: {
                  hour: 'HH:mm',
                },
                tooltipFormat: 'HH:mm',
              },
              distribution: 'linear',
              gridLines: {
                display: true, // Display grid lines on the x-axis
              },
              ticks: {
                source: 'labels',
                min: '00:00',
                max: '24:00',
                fontColor: 'rgba(0, 0, 0, 0)', // Make the font color transparent

              },
            }],
          },
          tooltips: {
            enabled: true, // Enable tooltips
          },
          legend: {
            display: true, // Show legend
          },
        },
      });
    },
  },
};
</script>
