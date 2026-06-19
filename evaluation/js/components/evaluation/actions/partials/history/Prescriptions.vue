<template>
    <div>
        <h5 class="headline" style="font-weight: bold; text-decoration: underline">Prescriptions</h5>

        <v-container fluid  v-if="list">
            <v-row >
                <v-col md="3"><p style="font-weight: bold">Name</p></v-col>
                <v-col md="3"><p style="font-weight: bold">Dosage</p></v-col>
                <v-col md="2"><p style="font-weight: bold">Date</p></v-col>
                <v-col md="2" class="text-center"><p style="font-weight: bold">Allow sub?</p></v-col>
                <v-col md="2" class="text-center"><p style="font-weight: bold">Other Information</p></v-col>
            </v-row>

            <v-row  v-for="item in list" :key="item.name" class="py-1">
                <v-col md="3">{{ item.drug_name | snakeCaseToSentenceCaseCapitalizeWords }}</v-col>
                <v-col md="3">{{ item.dosage }}</v-col>
                <v-col md="2">{{ item.created_at }}</v-col>
                <v-col md="2" class="text-center">
                    <v-icon v-if="item.allow_substitution" color="green"> fa fa-check</v-icon>
                    <v-icon v-else color="red">fa fa-times</v-icon>
                </v-col>
                <v-col md="2" class="text-center">
                    <v-chip v-if="item.admission_id" color="primary" text-color="white" small>Inpatient</v-chip>
                    <v-chip v-if="item.for_admission" color="secondary" text-color="white" small>For Admission</v-chip>
                    <v-chip v-if="item.for_discharge" color="red" text-color="white" small>For Discharge</v-chip>
                </v-col>
            </v-row>
        </v-container>

        <v-alert v-else :value="true" type="info">
            No data found
        </v-alert>

        <div v-if="list.length > 0" class="pull-right mt-2">
            <v-btn  color="primary" :href="prints.print_visit_prescriptions_a5_history_url" target="_blank">
                <v-icon class="pr-2">fa fa-print</v-icon> Print A5
            </v-btn>

            <v-btn color="orange" dark :href="prints.print_visit_prescriptions_thermal_history_url" target="_blank">
                <v-icon class="pr-2">fa fa-print</v-icon> Print Thermal
            </v-btn>
        </div>

    </div>

</template>

<script>
export default {
    props: ['items', 'prints'],

    data() {
        return {
            headers: [
                { text: 'Name', value: 'name' },
                { text: 'Dosage', value: 'dosage' },
                { text: 'Date', value: 'date' },
                { text: 'Allow Sub?', value: 'substitution' },
                { text: 'Other Information', value: 'info' },
            ],
        };
    },

    computed: {
        list() {
            return this.items;
        },
    },
};
</script>

<style scoped>
</style>
