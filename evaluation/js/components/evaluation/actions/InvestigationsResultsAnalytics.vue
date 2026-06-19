<template>
    <v-card flat>
        <v-container fluid>

            <v-row  class="px-3 grey--text">
                <v-col md="11">
                    <ul>
                        <li>Search and select the required sub procedures
                            below</li>
                        <li>To remove any procedure from the list, just click the procedure on the selections </li>
                    </ul>
                </v-col>
                <v-col md="1">
                    <v-btn small color="primary" @click="printAnalytics()">print</v-btn>
                </v-col>
            </v-row>

            <v-row >
                <v-col md="6" cols="12">
                    <evaluation-procedure-search @results="procedureSelected"></evaluation-procedure-search>
                </v-col>
                <v-col class="px-3" md="2" >
                    <v-text-field v-model="filters.number_of_visits" type="number"
                                  outline placeholder="e.g. 5" label="Last no. of visits">
                    </v-text-field>
                </v-col>
                <v-col class="px-3" md="2" >
                    <v-btn small color="primary" @click="fetchData()">fetch</v-btn>
                </v-col>
            </v-row>

            <v-row  v-if="filters.procedures.length > 0" class="pt-2">
                <v-col>
                    <v-chip small color="primary" close
                            @click="removeProcedure(procedure)"
                            v-for="procedure in filters.procedures"
                            :key="procedure.id">{{ procedure.name }}</v-chip>
                </v-col>
            </v-row>

            <div v-if="analytics">
                <div  v-for="(data, test) in analytics" :key="test" class="pb-3">
                    <v-container fluid>
                        <h4 class="px-4 font-weight-black">{{ test }}</h4>

                        <v-row >
                            <v-col md="2" class="font-weight-bold text-left" style="font-size: 13px">Result</v-col>
                            <v-col md="2" class="font-weight-bold text-center" style="font-size: 13px">Flag</v-col>
                            <v-col md="2" class="font-weight-bold text-center" style="font-size: 13px">Reference ranges</v-col>
                            <v-col md="2" class="font-weight-bold text-center" style="font-size: 13px">Date</v-col>
                        </v-row>

                        <div v-for="sub_test in data" :key="sub_test.id">
                            <v-row  class="pb-2">
                                <v-col md="2" class="text-left">{{ sub_test.result }}</v-col>
                                <v-col md="2" class="text-center">{{ sub_test.flag }}</v-col>
                                <v-col md="2" class="text-center">
                                    <p style="padding: 0; margin: 0" v-for="(reference, index) in sub_test.reference_ranges"
                                       :key="reference + index">{{ reference.bio_reference }}</p>
                                </v-col>
                                <v-col md="2" class="text-center">{{ sub_test.date }}</v-col>
                            </v-row>
                        </div>


                        <br/><br/>

<!--                        <investigation-results-graph :results="data" :label="test"></investigation-results-graph>-->
                    </v-container>
                </div>
            </div>
        </v-container>
    </v-card>
</template>
<script>
import InvestigationResults from '@evaluation/libs/investigation_results/InvestigationResults';
// import InvestigationResultsGraph from "./partials/InvestigationResultsGraph";
import { _ } from 'vue-underscore';

export default {

    data: () => ({
        analytics: null,
        investigationResults: new InvestigationResults(),
        filters: {
            procedures: [],
            visit_id: null,
            number_of_visits: 5,
        },
    }),

    computed: {
        procedures() {
            return this.filters.procedures;
        },
    },

    methods: {

        procedureSelected(procedure) {
            this.filters.procedures.push({
                name: procedure.name,
                id: procedure.id,
            });
        },

        removeProcedure(procedure) {
            this.filters.procedures.splice(_.findIndex(this.filters.procedures, procedure), 1);
        },

        printAnalytics() {
            const data = JSON.stringify(this.filters);

            window.open(`/evaluation/investigation-results/print-analytics/?data=${data}`, '_blank');
        },

        async fetchData() {
            if (this.filters.number_of_visits) {
                if (this.filters.procedures.length > 0) {
                    const response = await this.investigationResults.fetchAnalytics(this.filters);

                    if (response) {
                        this.analytics = response;
                    }
                }
            } else {
                flash({
                    message: 'Please enter the last required number of visits',
                    alert: 'warning',
                });
            }
        },
    },

    mounted() {
        this.filters.visit_id = this.$route.params.visitId;
    },
};
</script>
