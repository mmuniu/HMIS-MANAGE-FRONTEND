<template>
    <div>
        <v-card class="px-3">

            <h4 class="px-4 pt-4">Patient Results analytics </h4>

            <v-card-title height="23">
                <patient-search outline @patientSelected="patientSelected"></patient-search>
                <v-spacer></v-spacer>
                <v-select
                        v-if="groups"
                        :items="groups"
                        @change="groupSelected"
                        v-model="selectedGroup"
                        item-text="name"
                        return-object
                        label="Outline style"
                        outline
                ></v-select>
                <v-spacer></v-spacer>
                <v-btn small color="primary" @click="printAnalytics()">print</v-btn>
            </v-card-title>

            <div>
                <v-container fluid>
                    <v-row  class="px-3 grey--text">
                        <v-col md="11">
                            <ul>
                                <li>Search and select the required sub procedures
                                    below</li>
                                <li>To remove any procedure from the list, just click the procedure on the selections </li>
                            </ul>
                        </v-col>
                    </v-row>

                    <v-row >
                        <v-col md="6" cols="12">
                            <evaluation-procedure-search @results="procedureSelected"></evaluation-procedure-search>
                        </v-col>
                        <v-col class="px-3" md="2" >
                            <v-text-field v-model="filters.number_of_visits" disabled type="number" outline placeholder="e.g. 5" label="Last no. of visits"></v-text-field>
                        </v-col>
                        <v-col class="px-3" md="2" >
                            <v-btn small color="primary" @click="fetchData()">fetch</v-btn>
                        </v-col>
                    </v-row>

                    <v-row  v-if="filters.procedures" class="pt-2">
                        <v-col>
                            <v-chip small color="primary" close @click="removeProcedure(procedure)" v-for="procedure in filters.procedures" :key="procedure.id">{{ procedure.name }}</v-chip>
                        </v-col>
                    </v-row>
                </v-container>

                <!-- display fetched data-->
                <v-container v-if="list.data" fluid>

                    <v-row >
                        <v-col class="text-left" v-for="header in list.headers" :key="header.text">
                            <h4>{{ header.text }}</h4>
                        </v-col>
                    </v-row>


                    <v-row  v-for="(data, index) in list.data" :key="index">

                        <v-col class="py-2"
                               :style="{ width: (100 /headers.length) + '%' }"
                               v-for="record in data"
                               :key="record">{{ record }}
                        </v-col>

                    </v-row>
                </v-container>

                <div v-for="{ data, test} in list.tests" :key="test">
                    {{ test }}
                </div>
            </div>
        </v-card>
    </div>
</template>
<script>
import PatientSearch from "@reception/components/patients/PatientSearch.vue";
import { reportsMixin } from "@reports/libs/reportsMixin";
import { mapActions, mapGetters } from "vuex";

export default {

    components: {
        PatientSearch,
    },

    mixins: [
        reportsMixin,
    ],

    data: () => ({
        test_results: null,
        module: "evaluation",
        selectedGroup: null,
        decoratorKey: "result-analytics",
        rowsPerPageItems: [10, 20, 30,
            {
                text: "$vuetify.dataIterator.rowsPerPageAll",
                value: -1,
            }],
        pagination: {
            rowsPerPage: 10,
        },
        filters: {
            procedures: [],
            patient_id: null,
            number_of_visits: 5,
        },
    }),

    computed: {
        ...mapGetters({
            groups: "getResultAnalyticsGroups",
        }),
    },

    methods: {
        ...mapActions({
            fetchGroups: "setResultAnalyticsGroups",
        }),

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

            window.open(`/reports/investigation-results/print-analytics/?data=${data}`, "_blank");
        },


        patientSelected(patient) {
            this.filters.patient_id = patient.id;
        },

        groupSelected() {
            this.filters.procedures = this.selectedGroup.procedures;
        },

        async fetchData() {
            if (this.filters.number_of_visits) {
                if (this.filters.procedures.length > 0) {
                    this.obj.filters = await _.omitBy(this.filters, _.isNil);

                    this.performFilter();
                }
            } else {
                flash({
                    message: "Please enter the last required number of visits",
                    alert: "warning",
                });
            }
        },
    },

    mounted() {
        this.fetchGroups();
    },
};
</script>
