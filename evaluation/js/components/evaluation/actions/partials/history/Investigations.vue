<template>
    <div>
        <h5 class="headline " style="font-weight: bold; text-decoration: underline">Investigations</h5>

        <v-container fluid  v-if="list">
            <v-row >
                <v-col md="3"><p style="font-weight: bold">Name</p></v-col>
                <v-col md="2"><p style="font-weight: bold">Type</p></v-col>
                <v-col md="1"><p style="font-weight: bold">Quantity</p></v-col>
                <v-col md="2" class="text-center"><p style="font-weight: bold">By</p></v-col>
                <v-col md="2" class="text-center"><p style="font-weight: bold">Date</p></v-col>
                <v-col md="2" class="text-center"><p style="font-weight: bold">Results</p></v-col>
            </v-row>

            <v-row  v-for="item in list" :key="item.name" class="py-1">
                <v-col md="3">{{ item.procedure_name | snakeCaseToSentenceCaseCapitalizeWords }}</v-col>
                <v-col md="2">{{ item.type }}</v-col>
                <v-col md="1">{{ item.quantity }}</v-col>
                <v-col md="2">{{ item.user.full_name }}</v-col>
                <v-col md="2" class="text-center">{{ item.created_at }}</v-col>
                <v-col md="2" class="text-center">
                    <v-tooltip bottom v-if="item.has_results">
                        <v-btn flat icon slot="activator" color="primary" dark @click="viewResults(item)">
                            <v-icon>mail</v-icon>
                        </v-btn>
                        <span>View Results</span>
                    </v-tooltip>

                    <v-tooltip bottom v-else>
                        <v-icon slot="activator" color="red" dark>clear</v-icon>
                        <span>Pending</span>
                    </v-tooltip>
                </v-col>

            </v-row>
        </v-container>

        <v-alert v-else :value="true" type="info">
            No data found
        </v-alert>

        <!-- dialogue-->
        <results-modal v-if="dialog" :investigation="withResults" v-on:close="dialog = false"></results-modal>
    </div>

</template>

<script>
import ResultsModal from '../procedures/ResultsModal';

export default {
    components: {
        ResultsModal,
    },

    props: ['items'],

    data() {
        return {
            headers: [
                { text: 'Name', value: 'name' },
                { text: 'Type', value: 'type' },
                { text: 'Quantity', value: 'quantity' },
                { text: 'By', value: 'user' },
                { text: 'Date', value: 'date' },
                { text: 'Results', value: 'results' },
            ],
            withResults: null,
            dialog: false,
        };
    },

    computed: {
        list() {
            return this.items;
        },
    },

    methods: {
        viewResults(investigation) {
            this.withResults = investigation;
            this.dialog = true;
        },
    },
};
</script>

<style scoped>
</style>
