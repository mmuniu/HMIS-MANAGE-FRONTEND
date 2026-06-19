<script>
import { Bar } from "vue-chartjs";
import { mapActions, mapGetters } from "vuex";

export default {

    extends: Bar,
    computed: {
        ...mapGetters({
            admissions: "getAdmissionPerWard",
        }),
    },
    watch: {
        admissions(val) {
            const Ward = [];
            const Admissions = [];
            if (val) {
                val.data.forEach((element) => {
                    Ward.push(element.ward);
                    Admissions.push(element.patients);
                });
                this.renderChart({
                    labels: Ward,
                    datasets: [{
                        label: "Admissions",
                        backgroundColor: "#3498DB",
                        data: Admissions,
                    }],
                }, { responsive: true, maintainAspectRatio: false });
            } else {
                console.log("No data");
            }
        },
    },
    methods: {
        ...mapActions([
            "setAdmissionPerWard",
        ]),
    },
    created() {
        this.setAdmissionPerWard();
    },
};
</script>
