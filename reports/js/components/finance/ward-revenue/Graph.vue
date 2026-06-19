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
            const ward = [];
            const total_admission_cost = [];
            const total_prescriptions = [];
            const total_investigations = [];
            const total_consumable = [];
            const total_charges = [];
            this.graphData.forEach( (data) =>{
                total_admission_cost.push(parseFloat(data.total_admission_cost.replace(/,/g, "")));
                total_prescriptions.push(parseFloat(data.total_prescriptions.replace(/,/g, "")));
                total_investigations.push(parseFloat(data.total_investigations.replace(/,/g, "")));
                total_consumable.push(parseFloat(data.total_consumable.replace(/,/g, "")));
                total_charges.push(parseFloat(data.total_charges.replace(/,/g, "")));
                ward.push(data.ward);
            });
            this.renderChart({
                labels: ward,
                datasets: [
                    {
                        label: "Total Admissions",
                        backgroundColor: "#3498DB",
                        data: total_admission_cost,
                    },
                    {
                        label: "Total Prescriptions",
                        backgroundColor: "#E74C3C",
                        data: total_prescriptions,
                    },
                    {
                        label: "Total Investigations",
                        backgroundColor: "#7D3C98",
                        data: total_investigations,
                    },
                    {
                        label: "Total Consumable",
                        backgroundColor: "#F4D03F",
                        data: total_consumable,
                    },
                    {
                        label: "Total Charges",
                        backgroundColor: "#229954",
                        data: total_charges,
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
