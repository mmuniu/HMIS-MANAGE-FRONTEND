<template>
    <div>
        <v-card>
            <v-card-title height="23">
                <h4>Patient Medication</h4>
            </v-card-title>

            <patient-medication-filters :obj="obj" @filter="performFilter"></patient-medication-filters>
<!--                <collabmed-loading v-if="!list.data"></collabmed-loading>-->
            <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
            <div>
                <v-data-table
                        hide-default-footer
                        :headers="list.headers"
                        :items="list.data"
                        class="elevation-1">
                    <template v-slot:item.diagnosis="{ item }">
                        <span v-if="item.diagnoses">
                            <span  v-for="(diagnosis, index) in item.diagnoses" :key="index">
                                {{ diagnosis ? diagnosis + ', ' : 'No diagnosis records' }}
                            </span>
                        </span>
                        <span v-else>No diagnosis</span>
                    </template>
                    <template v-slot:item.medications="{ item }">
                        <span v-if="item.prescriptions">
                            <span  v-for="(prescription, index) in item.prescriptions" :key="index">
                                {{ prescription + ',  ' }}
                            </span>
                        </span>
                        <span v-else>
                            No prescriptions
                        </span>
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
    title: "Patient Medication Report ",

    mixins: [
        reportsMixin,
    ],

    components: {
        "patient-medication-filters": Filter,
    },

    data: () => ({
        module: "evaluation",
        decoratorKey: "patients-medication",
    }),

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>
