<template>
  <div>
    <div style="position:relative;">
      <div style="position:absolute; top: 330px; left: -110px;">
        <span>Cervix(cm)</span>
        <span>Plot "x"</span>
      </div>
      <div style="position:absolute;top: 430px; left: -110px; right: 110px;">
        <div style="display:flex;flex-direction:column">
          <span>Descent</span>
          <span>of Head </span>
          <span>Plot "0"</span>
        </div>
      </div>
    </div>
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
      const chart = new Chart(ctx, {
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
                beginAtZero: false,
                min: 0,
                max: 10,
                stepSize: 1,
              },
            }],
            xAxes: [{
              ...this.partograph_options.scales?.xAxes?.[0],
              ticks: {
                ...this.partograph_options.scales?.xAxes?.[0]?.ticks,
                min: 0,
                max: 24,
                stepSize: 1,
                callback: (value) => {
                  return `${value}:00`; // Format ticks as hours
                },
              },
              gridLines: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)',
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
          animation: {
            onComplete: () => {
              const chartInstance = chart;
              const { ctx } = chartInstance;
              ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, 'normal', Chart.defaults.global.defaultFontFamily);
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = 'black';
              chartInstance.data.datasets.forEach((dataset, i) => {
                if (dataset.label === 'Alert' || dataset.label === 'Action') {
                  const meta = chartInstance.getDatasetMeta(i);
                  meta.data.forEach((point, index) => {
                    if (index < meta.data.length - 1) {
                      const model = point._model;
                      const nextModel = meta.data[index + 1]._model;
                      const midX = (model.x + nextModel.x) / 2;
                      const midY = (model.y + nextModel.y) / 2;
                      const xOffset = 30;
                      const labelX = midX + xOffset;
                      const text = `${dataset.label}`;
                      ctx.fillText(text, labelX, midY);
                    }
                  });
                }
              });
            }
          }
        }
      });
    }
  },
};
</script>

<style>
.chart-id-0vytlb6kp {
  display: block;
  height: 1070px;
  width: 1070px;
}
</style>
