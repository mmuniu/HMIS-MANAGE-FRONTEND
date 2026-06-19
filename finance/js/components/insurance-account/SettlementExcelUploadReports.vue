<template>
    <div>
        <div>
            <v-row>
                <v-col class="px-2" cols="12" sm="2">
                    <v-autocomplete :items="insurances.companies"
                                    item-text="name"
                                    item-value="id"
                                    clearable
                                    @click:clear="companyCleared()"
                                    v-model="filters.company_id"
                                    label="Insurance Company"
                    ></v-autocomplete>
                </v-col>

                <v-col class="px-2" cols="12" sm="2">
                    <v-text-field label="Cheque Number." v-model="filters.cheque_number"></v-text-field>
                </v-col>

                <v-col class="px-2" cols="12" sm="2">
                    <v-text-field label="Invoice No." v-model="filters.invoice_no"></v-text-field>
                </v-col>
                <v-col class="px-2" md="2" >
                    <collabmed-date-time-picker dateOnly outline  v-model="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>
                <v-col class="px-2" md="2" >
                    <collabmed-date-time-picker dateOnly outline v-model="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>

                <v-col class="px-2" md="2" >
                    <v-btn large color="primary" @click="filter">Filter</v-btn>
                    <v-btn large color="purple" class="white--text" @click="clearFilters">Clear</v-btn>
                </v-col>
            </v-row>
        </div>
        <div>
            <collabmed-loading v-if="!reports.data"></collabmed-loading>

           <div v-else>
               <v-data-table
                       :items="reports.data.data"
                       hide-default-footer
                       disable-pagination
                       :headers="headers">
               </v-data-table>

               <collabmed-paginator v-if="reports.meta" :meta="reports.meta" @change="navigate" />
           </div>
        </div>
    </div>
</template>
<script>
    import { mapActions, mapGetters } from 'vuex';

    export default {
        data: () => ({
            page: 1,
            filters: {
                company_id: null,
                invoice_no: null,
                cheque_number: null,
                start_date: null,
                end_date: null
            },
            headers: [
                { text: 'Cheque Number', value: 'cheque_number' },
                { text: 'Date', value: 'updated_at' },
                { text: 'Process State', value: 'status' },
                { text: 'Invoice no', value: 'invoice_no' },
                { text: 'Message', value: 'message' },
            ]
        }),

        computed: {
            ...mapGetters({
                reports: 'getSettlementExcelUploadReports',
                insurances: 'getInsurances',
            }),
        },

        methods: {
            ...mapActions({
                fetchReports: 'setSettlementExcelUploadReports',
                fetchInsurances: 'setInsurances',
            }),

            navigate(page) {
                this.page = page;

                this.initialize();
            },

            companyCleared() {
                this.filters.company_id = null;
            },

            initialize() {
                this.fetchReports({
                    page: this.page,
                    params: _.omitBy(this.filters, _.isNil),
                });
            },

            filter() {
                this.initialize();
            },

            clearFilters() {
                this.filters.start_date = '';
                this.filters.end_date = '';
                this.filters.company_id = null;
                this.filters.invoice_no = null;
                this.initialize();
            }
        },

        mounted() {
            this.fetchInsurances();
            this.initialize();
        },
    };
</script>
