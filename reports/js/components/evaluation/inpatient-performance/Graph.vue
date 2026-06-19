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
            const total_patients = [];
            const investigations = [];
            const consumables = [];
            const prescriptions = [];
            this.graphData.forEach( (data) =>{
                total_patients.push(data.patients_admitted);
                ward.push(data.ward);
                investigations.push(data.investigations);
                consumables.push(data.consumables);
                prescriptions.push(data.prescriptions);
            });
            this.renderChart({
                labels: ward,
                datasets: [
                    {
                        label: "Investigations",
                        backgroundColor: "#12c44c",
                        data: investigations,
                    },
                    {
                        label: "Consumables",
                        backgroundColor: "#8E44AD",
                        data: consumables,
                    },
                    {
                        label: "Prescriptions",
                        backgroundColor: "#E74C3C",
                        data: prescriptions,
                    },
                    {
                        label: "Total Admitted",
                        backgroundColor: "#3498DB",
                        data: total_patients,
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
