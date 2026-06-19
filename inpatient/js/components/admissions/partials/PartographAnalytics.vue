<template>
  <div style="padding: 15px 43px; width: 100% !important">
    <div style="position:relative;" >
      <div style="position:absolute; top: 190px;
       left: -110px;">
        <span>Fetal</span>
        <span>Heart</span>
        <span>Rate</span>
      </div>
    </div>
    <Chart :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import Chart from './Chart.vue';

export default {
  components: {
    Chart,
  },
  props: {
    partograph_data: Array,
  },
  data() {
    const sortedData = this.partograph_data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const labels = [];
    const fhrData = [];
    const startDate = new Date(sortedData[0].created_at); // Start date from the first data point
    startDate.setHours(0, 0, 0, 0); // Set hours to 00:00:00
    const endDate = new Date(startDate); // End date as start date + 24 hours
    endDate.setDate(startDate.getDate() + 1);

    for (let i = startDate.getTime(); i < endDate.getTime(); i += 3600 * 1000) {
      const timestamp = new Date(i);
      labels.push(timestamp.toISOString());
    }

    for (const dataPoint of sortedData) {
      const timestamp = new Date(dataPoint.created_at);
      const formattedTimestamp = timestamp.toISOString();
      if (dataPoint.fhr !== null) {
        fhrData.push({ x: formattedTimestamp, y: dataPoint.fhr });
      }
    }

    return {
      chartOptions: {
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Fetal Heart Rate',
            },
            ticks: {
              min: 80,
              max: 200,
              stepSize: 10,
            },
          }],
          xAxes: [{
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
              display: true,
              drawOnChartArea: false, // Ensures gridlines are drawn on the tick marks
            },
            ticks: {
              source: 'data',
              min: startDate.toISOString(),
              max: endDate.toISOString(),
              autoSkip: false, // Prevent auto skipping of ticks
              fontColor: 'rgba(0, 0, 0, 0)', // Make the font color transparent

            },
          }],
        },
        tooltips: {
          callbacks: {
            title: function(tooltipItem, data) {
              const timestamp = new Date(data.labels[tooltipItem[0].index]);
              return `Time: ${timestamp.toLocaleTimeString()}`;
            },
            label: function(tooltipItem, data) {
              return `FHR: ${tooltipItem.value}`;
            },
          },
        },
      },
      chartData: {
        labels: labels,
        datasets: [{
          label: 'Fetal Heart Rate',
          data: fhrData,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.5,
        }],
      },
    };
  },
};
</script>
