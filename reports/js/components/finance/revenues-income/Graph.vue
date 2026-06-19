<script>
import { Bar } from "vue-chartjs";

export default {
    extends: Bar,

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
                    // {
                    //     label: 'Quantities',
                    //     backgroundColor: '#12c44c',
                    //     data: quantities
                    // },
                    {
                        label: "Amount",
                        backgroundColor: "red",
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
