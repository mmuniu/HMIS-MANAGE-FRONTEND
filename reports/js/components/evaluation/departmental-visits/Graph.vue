<script>
import { Line } from "vue-chartjs";

export default {
    extends: Line,

    props: {
        graphData: {
            type: Array,
        },
    },

    watch: {
        graphData() {
            const type = [];
            const visits = [];
            this.graphData.forEach( (data) =>{
                visits.push(data.visits);
                type.push(data.type);
            });
            this.renderChart({
                labels: type,
                datasets: [
                    {
                        label: "Visits",
                        backgroundColor: "#3498DB",
                        data: visits,
                    },
                ],
                options: {
                    scales: {
                        yAxes: [{
                            stacked: true,
                        }],
                        xAxes: [{
                            stacked: true,
                        }],
                    },
                    legend: {
                        display: true,
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                },
            });
        },
    },
};
</script>
