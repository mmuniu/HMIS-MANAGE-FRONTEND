<script>
import { mapActions, mapGetters } from 'vuex';
import { Line } from 'vue-chartjs';

export default {
    extends: Line,

    computed: {
        ...mapGetters({
            visits: 'getDepartmentalVisits',
        }),
    },

    watch: {
        visits(val) {
            const Departments = [];
            const Visits = [];
            if (val) {
                val.data.forEach((element) => {
                    Departments.push(element.type);
                    Visits.push(element.visits);
                });
                this.renderChart({
                    labels: Departments,
                    datasets: [{
                        label: 'Visits',
                        backgroundColor: '#3498DB',
                        data: Visits,
                    }],
                }, { responsive: true, maintainAspectRatio: false });
            } else {
                console.log('No data');
            }
        },
    },

    methods: {
        ...mapActions([
            'setDepartmentalVisits',
        ]),
    },
    created() {
        if (window.localStorage.getItem('immigrant')) {
            this.setDepartmentalVisits();
        }
    },
};
</script>
