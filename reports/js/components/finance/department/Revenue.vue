<template>
    <collabmed-loading v-if="loading==='false'"></collabmed-loading>
    <div v-else>
        <v-data-table
                :headers="headers"
                :items="doctorSummary"
                class="elevation-1"
                hide-default-footer
        >
            <template v-slot:item.department="{ item }">Doctor</template>
        </v-data-table>
        <v-data-table
                :headers="headers"
                :items="dentalSummary"
                class="elevation-1"
                hide-default-footer
        >
            <template v-slot:item.department="{ item }">Dental</template>
        </v-data-table>
        <v-data-table
                :headers="headers"
                :items="nursingSummary"
                class="elevation-1"
                hide-default-footer
        >
            <template v-slot:item.department="{ item }">Dental</template>
        </v-data-table>
        <v-data-table
                :headers="headers"
                :items="nursingSummary"
                class="elevation-1"
                hide-default-footer
        >
            <template v-slot:item.department="{ item }">Nursing</template>
        </v-data-table>
        <v-data-table
                :headers="headers"
                :items="opticalSummary"
                class="elevation-1"
                hide-default-footer
        >
            <template v-slot:item.department="{ item }">Optical</template>
        </v-data-table>
        <v-data-table
                :headers="headers"
                :items="radiologySummary"
                class="elevation-1"
                hide-default-footer
        >
            <template v-slot:item.department="{ item }">Radiology</template>
        </v-data-table>
        <v-data-table
                :headers="headers"
                :items="pharmacySummary"
                class="elevation-1"
                hide-default-footer
        >
            <template v-slot:item.department="{ item }">Pharmacy</template>
        </v-data-table>
        <v-data-table
                :headers="headers"
                :items="labSummary"
                class="elevation-1"
                hide-default-footer
        >
            <template v-slot:item.department="{ item }">Laboratory</template>
        </v-data-table>
    </div>
</template>
<script>
export default {
    data() {
        return {
            loading: "false",
            headers: [
                { text: "Department", align: "left", sortable: false, value: "department" },
                { text: "Cash Revenue", value: "cash" },
                { text: "Insurance Revenue", value: "insurance" },
                { text: "Total", value: "grand" },
            ],
            doctorSummary: [],
            dentalSummary: [],
            nursingSummary: [],
            opticalSummary: [],
            radiologySummary: [],
            pharmacySummary: [],
            labSummary: [],
        };
    },
    methods: {
        async fetchData() {
            try {
                const res = await axios.get(route("api.reports.department.revenue.report"));

                this.doctorSummary.push(res.data.data.revenue.doctor.totals);
                this.dentalSummary.push(res.data.data.revenue.dental.totals);
                this.nursingSummary.push(res.data.data.revenue.nursing.totals);
                this.opticalSummary.push(res.data.data.revenue.optical.totals);
                this.radiologySummary.push(res.data.data.revenue.radiology.totals);
                this.pharmacySummary.push(res.data.data.revenue.pharmacy.totals);
                this.labSummary.push(res.data.data.revenue.laboratory.totals);

                if (res.data.data.revenue) {
                    this.loading = true;
                }
            } catch (error) {
                alert("issues fetching departmental revenue summary reports");
            }
        },
    },
    created() {
        this.fetchData();
    },
};
</script>
