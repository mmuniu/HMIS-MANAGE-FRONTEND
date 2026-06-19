<template>
    <div>
        <v-card>
            <v-card-title class="py-2">
                <h4>Patient Medication</h4>
            </v-card-title>

            <patient-medication-filters :obj="obj" @filter="performFilter" />

            <collabmed-floating-loader v-if="saveLoader" />

            <div>
                <v-data-table hide-default-footer :headers="summaryHeaders" :items="list.summary"
                    class="elevation-1">
                    <template v-slot:item.label="{ item }">
                        {{ item.label }}
                    </template>
                    <template v-slot:item.value="{ item }">
                        {{ item.value }}
                    </template>
                </v-data-table>

            </div>

            <div>
                <v-data-table hide-default-footer :headers="list.headers" :items="list.data" class="elevation-1">
                    <template v-slot:item.diagnosis="{ item }">
                        <span v-if="item.diagnoses && item.diagnoses.length">
                            {{ item.diagnoses.filter(Boolean).join(', ') }}
                        </span>
                        <span v-else>No diagnosis</span>
                    </template>

                    <template v-slot:item.medications="{ item }">
                        <span v-if="item.prescriptions && item.prescriptions.length">
                            {{ item.prescriptions.join(', ') }}
                        </span>
                        <span v-else>No prescriptions</span>
                    </template>
                </v-data-table>

                <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
            </div>
        </v-card>
    </div>
</template>

<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";

export default {
    title: "Patient Medication Report",

    mixins: [reportsMixin],

    components: {
        "patient-medication-filters": Filter,
    },

    data: () => ({
        module: "evaluation",
        decoratorKey: "patients-medication",
        summaryHeaders: [
            { text: "Label", value: "label" },
            { text: "Value", value: "value" },
        ],
    }),
    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>