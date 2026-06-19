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
            const amounts = [];
            const label = [];
            const quantities = [];
            this.graphData.forEach( (data) =>{
                amounts.push(parseFloat(data.amount.replace(/,/g, "")));
                quantities.push(Number(data.quantity));
                label.push(data.type);
            });
            this.renderChart({
                labels: label,
                datasets: [
                    {
                        label: "Cash Amount",
                        backgroundColor: "#2471A3",
                        data: amounts,
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
