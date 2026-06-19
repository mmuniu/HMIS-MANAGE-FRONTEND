<template>
    <div>

        <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>

        <v-card>
            <v-card-title height="23">
                <h4>Patient Diagnoses</h4>
            </v-card-title>

            <diagnosis-filters :obj="obj" @filter="performFilter"></diagnosis-filters>

                <v-data-table hide-default-footer
                              :headers="list.headers"
                              :items="list.data"
                              class="elevation-1"
                >
                    <template v-slot:item.patient_name="{ item}">{{ item.full_name }}</template>
                    <template v-slot:item.diagnosis="{ item }">
                            <span v-for="(diagnosis, index) in item.diagnosis" :key="index">
                                {{ diagnosis ? diagnosis : 'none' }}
                                <span v-if="item.diagnosis.length > 0"></span>
                            </span>
                    </template>
                    <template v-slot:item.procedures="{ item }">
                            <span  v-if="item.investigations.length > 0">
                                <span v-for="(investigation, index) in item.investigations" :key="index">
                                 {{ investigation ? investigation : 'none' }} |
                                </span>
                            </span>
                    </template>
                </v-data-table>

            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
        </v-card>
    </div>

</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filters from "./Filters";

export default {
    title: "Patient Diagnosis Report ",

    mixins: [
        reportsMixin,
    ],

    components: {
        "diagnosis-filters": Filters,
    },

    data: () => ({
        decoratorKey: "procedure-diagnosis-analysis",
        module: "evaluation",
    }),

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },
    },
};
</script>
