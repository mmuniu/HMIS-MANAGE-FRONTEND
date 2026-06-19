<template>
    <div>
        <collabmed-loading v-if="!results"></collabmed-loading>

        <v-card>
            <div>
                <v-btn color="success" rounded small @click="openAll()">Open all</v-btn>
                <v-btn color="success" rounded small @click="closeAll()">Close</v-btn>
            </div>

            <div class="px-3 pt-2">
                <h6 class="grey--text">Note: the system will pick the last result but you can check another result as the result </h6>
            </div>

            <v-alert class="py-2" :value="true" icon="info" color="info" v-if="results.length < 1">
                Seems like there are no tests here
            </v-alert>

            <v-expansion-panels v-model="panel" multipe>
                <v-expansion-panel v-for="(investigation, test_name) in results" :key="test_name">
                    <v-expansion-panel-header>
                        <h5 class="font-weight-black"> {{ test_name }} </h5>
                    </v-expansion-panel-header>

                    <v-expansion-panel-content>
                        <v-card class="py-3 px-5">
                            <div v-for="(titleGroup, title) in investigation" :key="title">

                                <v-row >
                                    <v-col>
                                        <h6 class="font-weight-black" v-if="title != 'null'">{{ title }}</h6>
                                    </v-col>
                                </v-row>

                                <br/>

                                <v-row  v-for="(subtest, sub_test_name) in titleGroup" :key="sub_test_name">
                                    <v-col md="4" class="px-3">
                                        {{ sub_test_name }}
                                    </v-col>

                                    <v-col md="5" class="px-3">
                                        <v-row v-for="(subtest_result, index) in subtest" :key="subtest_result.id">

                                            <v-col md="8">
                                                <v-text-field v-model="subtest_result.result" solo></v-text-field>
                                            </v-col>

                                            <v-col md="4" class="pl-2" v-if="index < subtest.length - 1">
                                                <v-checkbox
                                                        v-model="subtest_result.use_as_result"
                                                        label="Use this"
                                                ></v-checkbox>
                                            </v-col>

                                        </v-row>
                                    </v-col>
                                </v-row>

                            </div>

                            <v-btn color="primary" small @click="investigationResult.saveMachineResult(investigation)">save</v-btn>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import InvestigationResults from '@evaluation/libs/investigation_results/InvestigationResults.js';

export default {
    data: () => ({
        panel: [],
        investigationResult: new InvestigationResults(),
    }),

    computed: {
        ...mapGetters({
            results: 'getMachineResults',
        }),
    },

    methods: {
        ...mapActions([
            'setMachineResults',
        ]),

        openAll() {
            this.panel = [...Object.keys(this.results)].map((_)=> true);
        },

        closeAll() {
            this.panel = [];
        },
    },

    mounted() {
        this.panel = 0;
        this.setMachineResults({
            params: {
                visit_id: this.$route.params.visitId,
            },
        });
    },
};
</script>
