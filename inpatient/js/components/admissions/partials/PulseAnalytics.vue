<template>
  <div style="padding: 15px 43px;">
    <pulse_chart :data="fhrData" :partograph_options="pulse_bp_options" type="line" />
  </div>
</template>

<script>
import pulse_chart from './PulseChart.vue';

export default {
  components: {
    pulse_chart,
  },
  props: {
    report_on_labour: Array,
    partograph_data: Array,
  },
  data() {
    const labels = [];

    const sortedData = this.partograph_data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const pulseData = [];
    const bpDystolicData = [];
    const bpSystolicData = [];

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
      if (dataPoint.bp_dystolic !== null) {
        bpDystolicData.push({ x: formattedTimestamp, y: dataPoint.bp_dystolic, created_at: dataPoint.created_at });
      }
    }

    const systolicStartDate = new Date(sortedData[0].created_at); // Start date from the first data point
    systolicStartDate.setHours(0, 0, 0, 0); // Set hours to 00:00:00
    const systolicEndDate = new Date(systolicStartDate); // End date as start date + 24 hours
    systolicEndDate.setDate(systolicStartDate.getDate() + 1);

    for (let i = systolicStartDate.getTime(); i < systolicEndDate.getTime(); i += 3600 * 1000) {
      const systolicTimestamp = new Date(i);
      labels.push(systolicTimestamp.toISOString());
    }

    for (const dataPoint of sortedData) {
      const systolicTimestamp = new Date(sortedData[0].created_at);
      const formattedTimestamp = systolicTimestamp.getHours();
      if (dataPoint.bp_systolic !== null) {
        bpSystolicData.push({ x: formattedTimestamp, y: dataPoint.bp_systolic, created_at: dataPoint.created_at,
        });
      }
    }


    const pulseStartDate = new Date(sortedData[0].created_at); // Start date from the first data point
    pulseStartDate.setHours(0, 0, 0, 0); // Set hours to 00:00:00
    const pulseEndDate = new Date(pulseStartDate); // End date as start date + 24 hours
    pulseEndDate.setDate(pulseStartDate.getDate() + 1);

    for (let i = pulseStartDate.getTime(); i < pulseEndDate.getTime(); i += 3600 * 1000) {
      const pulseTimestamp = new Date(i);
      labels.push(pulseTimestamp.toISOString());
    }

    for (const dataPoint of sortedData) {
      const pulseTimestamp = new Date(dataPoint.created_at);
      const formattedTimestamp = pulseTimestamp.getHours();
      if (dataPoint.bp_systolic !== null) {
        pulseData.push({ x: formattedTimestamp, y: dataPoint.pulse, created_at: dataPoint.created_at,
        });
      }
    }



    return {
      pulse_bp_options: {
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Pulse and BP',
            },
            ticks: {
              beginAtZero: false,
              min: 60,
              max: 180,
              stepSize: 10,
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
      fhrData: {
        labels: labels,
        datasets: [
          {
            label: 'Blood Pressure(systolic)',
            data: bpSystolicData,
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.5,
            pointStyle: 'circle',
            pointRadius: 3,
          },
          {
            label: 'Blood Pressure(diastolic)',
            data: bpDystolicData,
            fill: false,
            borderColor: 'rgb(255, 165, 0)',
            tension: 0.5,
            pointStyle: 'circle',
            pointRadius: 3,
          },
          {
            label: 'Pulse',
            data: pulseData,
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.5,
            pointStyle: 'cross',
            pointRadius: 3,
          },
        ],
      },
    };
  },
};
</script>
<style>

</style>
