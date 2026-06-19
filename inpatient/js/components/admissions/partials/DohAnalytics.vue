<template>
  <div style="padding: 15px 43px;">
    <doh_chart :data="dohData" :partograph_options="doh_options" type="line" />
  </div>
</template>

<script>
import doh_chart from './DohChart.vue';
export default {
  components: {

    doh_chart, // Register the Chart component
  },
  props: {
    report_on_labour: [],
    partograph_data: [],
  },
  data: function() {
    // Sort the partograph_data array based on the created_at property
    const sortedData = this.partograph_data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    console.log(sortedData);
    const labels = [];
    const dohData = [];
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
      const formattedTimestamp = timestamp.getHours();
      if (dataPoint.doh !== null) {
        dohData.push({ x: formattedTimestamp, y: dataPoint.doh,created_at: dataPoint.created_at });
      }
    }

    const cervixData = [];
    const cervixStartDate = new Date(sortedData[0].created_at); // Start date from the first data point
    startDate.setHours(0, 0, 0, 0); // Set hours to 00:00:00
    const cervixEndDate = new Date(startDate); // End date as start date + 24 hours
    endDate.setDate(startDate.getDate() + 1);

    for (let i = cervixStartDate.getTime(); i < cervixEndDate.getTime(); i += 3600 * 1000) {
      const timestamp = new Date(i);
      labels.push(timestamp.toISOString());
    }

    for (const dataPoint of sortedData) {
      const timestamp = new Date(dataPoint.created_at);
      const formattedTimestamp = timestamp.getHours();
      if (dataPoint.cervix !== null) {
        cervixData.push({ x: formattedTimestamp, y: dataPoint.cervix , created_at: dataPoint.created_at,
        });
      }
    }
    return {
      doh_options: {
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
            },
            ticks: {
              beginAtZero: false,
              min: 0,
              max: 10,
              stepSize: 1,
            },
          }],
          xAxes: [
            {
              type: 'linear', // Use linear scale for x-axis
              ticks: {
                stepSize: 1,
                min: 0, // Minimum value for x-axis
                max: 24, // Maximum value for x-axis
                fontColor: 'rgba(0, 0, 0, 0)', // Make the font color transparent

              },
              gridLines: {
                display: true, // Show grid lines
                color: 'rgba(0, 0, 0, 0.1)', // Color of the grid lines
              },
            },
          ],
        },
      },
      dohData: {
        datasets: [
          {
            data: [{ x: 0, y: 4 }, { x: 12, y: 10 }], // Start at y=4 and end at y=8 after 4 steps
            fill: false,
            borderColor: 'black',
            tension: 0,
            pointStyle: 'circle',
            pointRadius: 0,
            label: 'Alert',
          },
          {
            data: [{ x: 8, y: 4 }, { x: 20, y: 10 }],
            fill: false,
            borderColor: 'rgb(0, 0, 0)',
            tension: 0,
            pointStyle: 'cross',
            pointRadius: 0,
            label: 'Action',

          },
          {
            label: 'Descent of Head Plot "0"',
            data: dohData,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0,
            pointStyle: 'circle',
            pointRadius: 5,
          },
          {
            label: 'Cervix',
            data: cervixData,
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0,
            pointStyle: 'cross',
            pointRadius: 5,
          },
        ],
      },
    };
  },
  methods: {},
  mounted() {
    console.log(this.dohData);
  },
};
</script>
