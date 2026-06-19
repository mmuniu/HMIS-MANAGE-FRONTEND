<script>
import { Bar } from 'vue-chartjs';
import axios from 'axios';

export default {
    extends: Bar,
    methods: {
        facilityVisits() {
            axios.get(route('api.finance.visits.facility'))
                .then((res) => {
                    const Facility = [];
                    const Visits = [];
                    res.data.data.forEach((element) => {
                        const split_facility_name = element.facility.split('-');
                        Facility.push(split_facility_name);
                        Visits.push(element.visits);
                    });
                    this.renderChart({
                        labels: Facility,
                        datasets: [{
                            label: 'Visits',
                            backgroundColor: '#3498DB',
                            data: Visits,
                        }],
                    }, { responsive: true, maintainAspectRatio: false });
                })
                .catch((err) => {
                    console.log(err);
                });
        },
    },
    created() {
        this.facilityVisits();
    },
};
</script>
