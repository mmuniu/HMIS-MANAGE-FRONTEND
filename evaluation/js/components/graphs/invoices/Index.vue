<script>
import { mapActions, mapGetters } from 'vuex';
import { Line } from 'vue-chartjs';

export default {
    extends: Line,

    computed: {
        ...mapGetters({
            visits: 'getInvoice',
        }),
    },

    watch: {
        visits(val) {
            const Years = [];
            const Months = [];
            const Department = [];
            const Labels = [];
            // let Prices = [];
            const Invoices = [];
            if (val) {
                val.forEach((element) => {
                    // Years.push(element.year);
                    // console.log(element.month, element.visits, element.year);
                    Invoices.push(element.invoice);
                    Years.push(element.year);
                    Months.push(element.month);
                });
                this.renderChart({
                    labels: Months,
                    datasets: [{
                        label: 'Invoices generated per month',
                        backgroundColor: '#BFC332',
                        data: Invoices,
                    }],
                }, { responsive: true, maintainAspectRatio: false });
            } else {
                console.log('No data');
            }
        },
    },

    methods: {
        ...mapActions([
            'setInvoice',
        ]),
    },
    created() {
        // console.log(window.localStorage.getItem('immigrant'));
        if (window.localStorage.getItem('immigrant')) {
            this.setInvoice();
        }
    },
};
</script>
