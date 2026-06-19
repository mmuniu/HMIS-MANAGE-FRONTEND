
<script>
import { Bar } from 'vue-chartjs';
import { mapActions, mapGetters } from 'vuex';

export default {

    extends: Bar,

    computed: {
        ...mapGetters({
            visits: 'getVisitTrends',
        }),
    },

    watch: {
        visits(val) {
            this.renderChart({
                labels: val.months,
                datasets: [{
                    label: '',
                    backgroundColor: '#3498DB',
                    data: val.values,
                }],
            }, { responsive: true, maintainAspectRatio: false });
        },
    },

    methods: {
        ...mapActions([
            'setVisitTrends',
        ]),
    },

    created() {
        this.setVisitTrends();
    },
};
</script>
