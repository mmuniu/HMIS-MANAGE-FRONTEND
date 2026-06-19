
<script>
import { Line } from 'vue-chartjs';
import { _ } from 'vue-underscore';

export default {

    extends: Line,

    props: [
        'results', 'label',
    ],

    data: () => ({
        values: null,
        testDates: null,
    }),

    watch: {
        results() {
            this.values = _.map(this.results, function(test) {
                return parseFloat(test.result);
            });

            this.testDates = _.map(this.results, function(test) {
                return test.date;
            });
        },

        values(val) {
            if (this.values && this.testDates) {
                this.renderChart({
                    labels: this.testDates,
                    datasets: [{
                        label: this.label,
                        color: 'purple',
                        data: val,
                    }],
                }, { responsive: true, maintainAspectRatio: false });
            }
        },
    },

    mounted() {
        this.values = _.map(this.results, function(test) {
            return parseFloat(test.result);
        });

        this.testDates = _.map(this.results, function(test) {
            return test.date;
        });
    },
};
</script>
