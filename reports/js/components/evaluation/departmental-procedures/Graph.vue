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
            const total_procedures = [];
            this.graphData.forEach( (data) =>{
                total_procedures.push(Number(data.quantity));
                type.push(data.type);
            });
            this.renderChart({
                labels: type,
                datasets: [
                    {
                        label: "Total Procedures",
                        backgroundColor: "#3498DB",
                        data: total_procedures,
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
