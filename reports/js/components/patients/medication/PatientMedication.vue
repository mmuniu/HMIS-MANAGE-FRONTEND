<template>
    <v-card>

        <v-card-title>

            <h3>Patient Medication</h3>

        </v-card-title>

        <v-card-text>

            <medication-filter/>

            <collabmed-loading v-if="loading"></collabmed-loading>

            <div v-else>
                <div v-if="medication && medication.data">
                    <v-data-table
                            :headers="headers"
                            :items="medication.data"
                            class="elevation-1"
                            hide-default-footer
                    >
                        <template v-slot:item.medication="{ item }">
                            <span  v-for="drug in item.prescriptions" :key="drug.id">
                                <span>{{ drug ? drug + ' , ' : 'N/A' }}</span>
                            </span>
                        </template>
                    </v-data-table>
                    <div v-if="medication.links" class="text-center">
                        <v-btn icon @click="navigate(medication.links.prev)" color="success">
                            <v-icon>chevron_left</v-icon>
                        </v-btn>
                        <strong>
                            {{ medication.meta.current_page }}
                        </strong>
                        <v-btn icon @click="navigate(medication.links.next)" color="success">
                            <v-icon>chevron_right</v-icon>
                        </v-btn>
                    </div>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import MedicationFilter from "@reports/components/patients/medication/filters/MedicationFilter";
export default {
    name: "reports-patient-medication",
    data() {
        return {
            loading: false,
            headers: [
                { text: "Patient", sortable: false, width: "20%", value: "full_name" },
                { text: "Medication", sortable: "false", value: "medication" },
                { text: "User", sortable: "false", value: "doctor" },
                { text: "Date", sortable: "false", value: "visit_date" },
            ],
            medication: null,
        };
    },
    components: {
        "medication-filter": MedicationFilter,
    },
    computed: {
        ...mapGetters([
            "getPatientMedication",
        ]),
    },
    watch: {
        getPatientMedication(medication) {
            this.medication = medication;
        },
    },
    methods: {
        ...mapActions([
            "setPatientMedication",
        ]),
        navigate(url) {
            if (url) {
                const page = url.substring(url.indexOf("page=")).split("page=")[1];
                this.setPatientMedication({ page });
            }
        },
    },
    mounted() {
        this.setPatientMedication({
            page: 1,
        });
    },
    created() {
        window.events.$on("STORE_SET_ACTION_LOADING", (val) => {
            this.loading = val;
        });
    },
};
</script>
