<template>
    <div>
        <collabmed-loading v-if="!investigations"></collabmed-loading>
        <v-data-table  text
                       v-else
                       :headers="headers"
                       disable-pagination
                       hide-default-footer
                       :items="investigations.data"
        >
            <template  v-slot:item.results="{ item }">
                <div v-if="!item.cancelled">
                    <v-tooltip bottom v-if="item.has_results">
                        <template v-slot:activator="{ on }" >
                            <v-btn text icon v-on="on" color="primary" dark @click="viewResults(item)">
                                <v-icon>mail</v-icon>
                            </v-btn>
                        </template>
                        <span>View Results</span>
                    </v-tooltip>

                    <v-tooltip bottom v-else>
                        <template v-slot:activator="{ on }" >
                            <v-icon v-on="on" color="red" dark>clear</v-icon>
                        </template>
                        <span>Pending</span>
                    </v-tooltip>
                </div>
                <div v-else>
                    <v-chip small color="grey">cancelled</v-chip>
                    <br/>
                    <span class="grey--text text--darken-1 caption" v-text="item.cancel_text"></span>
                </div>
            </template>
            <template v-slot:footer>
                <collabmed-paginator :meta="investigations.meta" @change="updateData"></collabmed-paginator>
            </template>
        </v-data-table>
    </div>
</template>
<script>

export default {
    props: [
        'patientId', 'docSide',
    ],

    data: () => ({
        page: 1,
        withResults: null,
        investigations: null,
        headers: [
            { text: 'Name', value: 'procedure_name' },
            { text: 'Category', value: 'category' },
            { text: 'Price', value: 'price' },
            { text: 'Qty', value: 'quantity' },
            { text: 'Amount', value: 'amount' },
            { text: 'Reason', value: 'reasons' },
            { text: 'Results', value: 'results' },
            { text: 'Date', value: 'created_at' },
        ],
    }),

    methods: {
        viewResults(investigation) {
            this.withResults = investigation;
            this.dialog = true;
        },

        updateData(page) {
            this.page = page;
            this.getData(page);
        },

        getData() {
            const params = {
                page: this.page,
                type_category: 'investigations',
                doc_side: this.docSide ? true : false,
            };

            this.$http.get(`/api/reception/patients/${this.patientId}/portal/investigations`, { params: params })
                .then((response) => {
                    if (response.data) {
                        this.investigations = response.data;
                    } else {
                        flash({ message: 'Unable to fetch data, try again later', alert: 'error' });
                    }
                });
        },
    },

    mounted() {
        this.getData();
    },
};
</script>
