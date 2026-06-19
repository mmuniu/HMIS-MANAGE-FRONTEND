<template>
    <v-card flat>

        <v-card-title>
            <filters @filtered="filterData"
                     @clearFilters="clearFilters"
                     account
                     upload-excel
                     @initiateUpload="initiateUpload">
            </filters>
        </v-card-title>

        <v-card v-if="filters.company" flat>
            <v-card-title>
                <h4 class="px-2">Cheque Details</h4>
            </v-card-title>
            <v-card-text class="px-4">
                <v-row >
                    <v-col class="px-3" md="2" cols="12">
                        <v-text-field v-model="dispatch_data.cheque.name"
                                      label="Name">
                        </v-text-field>
                    </v-col>
                    <v-col class="px-3" md="2" cols="12">
                        <collabmed-date-time-picker
                                dateOnly
                                v-model="dispatch_data.cheque.date"
                                label="Cheque date">
                        </collabmed-date-time-picker>
                    </v-col>
                    <v-col class="px-3" md="2" cols="12">
                        <v-text-field v-model="dispatch_data.cheque.amount"
                                      outlined
                                      type="number"
                                      label="Amount">
                        </v-text-field>
                    </v-col>
                    <v-col class="px-3" md="2" cols="12">
                        <v-autocomplete
                                v-model="dispatch_data.cheque.bank"
                                v-if="banks.data"
                                :items="banks.data"
                                chips
                                label="Select bank"
                                item-text="name"
                                item-value="id"
                        >
                        </v-autocomplete>
                    </v-col>
                    <v-col class="px-3" md="2" cols="12">
                        <v-text-field v-model="dispatch_data.cheque.number"
                                      label="Number">
                        </v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <v-card-text>

            <collabmed-loading v-if="!invoices.data || loading"></collabmed-loading>

            <v-data-table
                    :headers="headers"
                    :items="invoices.data"
                    v-else
                    disable-pagination
                    hide-default-footer
                    v-model="dispatch_data.selectedInvoices"
                    show-select
                    flat
            >
                <template v-slot:item.invoice_no="{ item }">
                    <a @click="viewInvoice(item.invoice_id)"><span>Invoice no: {{ item.invoice_no }}</span></a> <br/>
                    <span v-if="item.claim_no">Claim no: {{ item.claim_no }}</span>
                </template>

                <template v-slot:item.balance="{ item }">
                    <v-chip small outlined v-if="parseFloat(item.balance) >= 1" color="error">
                        {{ item.balance }} <!--{{ parseStringToNumber(item.amount) - item.to_pay }}-->
                    </v-chip>
                    <v-chip v-else color="success" small outlined>settled</v-chip>
                </template>

                <template v-slot:item.to_pay="{ item }">
                    <input
                            type="number"
                            style="width: 80%"
                            @click="updateTotals()"
                            :disabled="!selected"
                            v-model="item.to_pay"
                    />
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-menu transition="slide-y-transition" bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn small rounded color="primary" dark v-on="on">
                                Print
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-tile>
                                <v-btn small color="primary" @click="print(item.invoice_id, 'a4')">Print A4</v-btn>
                            </v-list-tile>
                            <v-list-tile>
                                <v-btn small color="primary" @click="print(item.invoice_id, 'a5')">Print A5</v-btn>
                            </v-list-tile>
                        </v-list>
                    </v-menu>
                </template>

                <template v-slot:footer>
                    <v-row>
                        <v-col class="text-center">
                            <collabmed-paginator v-if="invoices.meta" :meta="invoices.meta" @change="navigate" />
                        </v-col>
                    </v-row>
                </template>
            </v-data-table>


            <v-row  class="px-5 pt-3">
                <v-col md="3" cols="12">

                    <v-row >
                        <v-col>
                            <h4 class="grey--text">Filtered invoices status breakdown</h4>
                        </v-col>
                    </v-row>

                    <v-row >
                        <v-col><span>Total amount:</span></v-col>
                        <v-col class="text-right">
                            <span style="font-weight: bold">{{ invoicesInfo.total }}</span>
                        </v-col>
                    </v-row>

                    <v-row >
                        <v-col><span>Paid amount:</span></v-col>
                        <v-col class="text-right"><span style="font-weight: bold">{{ invoicesInfo.paid }}</span></v-col>
                    </v-row>

                    <v-row >
                        <v-col><span>Balance: </span></v-col>
                        <v-col class="text-right"><span style="font-weight: bold">{{ invoicesInfo.balance }}</span></v-col>
                    </v-row>

                    <v-divider/>

                    <v-row >
                        <v-col><span>Selected:  </span></v-col>
                        <v-col class="text-right"><span style="font-weight: bold">{{ totalAmount | numberFormat }}</span></v-col>
                    </v-row>

                    <v-row >
                        <v-col><span>Cheque amount: </span> </v-col>
                        <v-col class="text-right"><span style="font-weight: bold">{{ dispatch_data.cheque.amount | numberFormat }}</span></v-col>
                    </v-row>
                </v-col>
            </v-row>

            <v-row   v-if="invoices.data" class="py-3">
                <v-col md="8" cols="12">
                    <v-btn small color="success" disabled v-if="!filters.company">
                        Select the insurance company first
                    </v-btn>

                    <v-btn small color="success" disabled
                           v-if="filters.company && !dispatch_data.cheque.bank && !dispatch_data.cheque.amount"
                    >
                        Please key in the cheque details
                    </v-btn>

                    <v-btn small color="success"
                           v-if="filters.company && dispatch_data.cheque.bank && dispatch_data.cheque && dispatch_data.selectedInvoices.length > 0"
                           @click="processPaymentForSelectedItems()">
                        Process payment for selected invoices
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-text>


        <!-- upload an excel with the listed payments-->
        <v-dialog v-model="uploadExcelDialog" persistent max-width="800" >
            <v-card>
                <v-card-title class="headline primary">
                    <h4 class="font-weight-bold white--text">Excel upload</h4>
                    <v-btn icon light @click.native="closeDialog()" absolute right>
                        <v-icon color="white">close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <v-card flat>

                        <v-card flat>
                            <v-card-title>
                                <h4 class="px-2">Cheque Details</h4>
                            </v-card-title>
                            <v-card-text class="px-4">
                                <v-row >
                                    <v-col class="px-3" md="6" cols="12">
                                        <v-autocomplete :items="insurances.companies"
                                                        @change="selectSchemes($event)"
                                                        item-text="name"
                                                        item-value="id"
                                                        clearable
                                                        @click:clear="companyCleared()"
                                                        v-model="invoice.excel.company_id"
                                                        label="Insurance Company" outlined
                                        ></v-autocomplete>
                                    </v-col>
                                    <v-col class="px-3" md="6" cols="12">
                                        <v-text-field v-model="invoice.excel.cheque.name"
                                                      outlined
                                                      required
                                                      label="Name">
                                        </v-text-field>
                                    </v-col>
                                    <v-col class="px-3" md="6" cols="12">
                                        <collabmed-date-time-picker
                                                outlined
                                                dateOnly
                                                v-model="invoice.excel.cheque.date"
                                                label="Cheque date">
                                        </collabmed-date-time-picker>
                                    </v-col>
                                    <v-col class="px-3" md="6" cols="12">
                                        <v-text-field v-model="invoice.excel.cheque.amount"
                                                      outlined
                                                      required
                                                      type="number"
                                                      label="Amount">
                                        </v-text-field>
                                    </v-col>
                                    <v-col class="px-3" md="6" cols="12">
                                        <v-autocomplete
                                                v-model="invoice.excel.cheque.bank"
                                                v-if="banks.data"
                                                :items="banks.data"
                                                outlined
                                                required
                                                chips
                                                label="Select bank"
                                                item-text="name"
                                                item-value="id"
                                        >
                                        </v-autocomplete>
                                    </v-col>
                                    <v-col class="px-3" md="6" cols="12">
                                        <v-text-field v-model="invoice.excel.cheque.number"
                                                      outlined
                                                      required
                                                      label="Number">
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>

                        <br/>

                        <v-card-title>
                            <div class="body-2 ma-0 pa-0 grey--text">
                                <span class="px-2">1.) To ensure smooth and complete upload, format your excel in the format shown </span> <br/>
                                <span class="px-2">2.) Also do ensure that the invoices you are settling are from the same company (As the cheque)</span> <br/>
                                <span class="px-2">3.) Ensure your excel document doesn't contain any calculations like totals etc</span> <br/>
                                <span class="px-2">4.) And finally ensure the excel is indeed in the specified format: </span> <br/>
                                <span class="px-2">5.) The first row will contain the titles and the data follows after. </span> <br/>
                                <span class="px-2">6.) The claim no only applies to NHIF thus it is optional to other insurance companies. </span> <br/>
                                <span class="px-2">7.) Column order <span style="font-weight: bold">SHOULD</span> be as specified below, whether the column has data or not </span> <br/>
                            </div>

                            <v-row >
                                <v-col><span style="font-weight: bold; font-size: 12px">Invoice no <sup class="grey--text">*</sup> </span></v-col>
                                <v-col><span style="font-weight: bold; font-size: 12px">Insurance Company <sup class="grey--text">*</sup> </span></v-col>
                                <v-col><span style="font-weight: bold; font-size: 12px">Insurance Scheme <sup class="grey--text">*</sup> </span></v-col>
                                <v-col><span style="font-weight: bold; font-size: 12px">Amount <sup class="grey--text">*</sup> </span></v-col>
                                <v-col><span style="font-weight: bold; font-size: 12px">Claim no <sup class="grey--text">*</sup> </span></v-col>
                            </v-row>
                        </v-card-title>

                        <v-card-text>
                            <div class="mx-3">
                                <v-row >
                                    <v-col>
                                        <input type="file" id="file" ref="file" v-on:change="onChangeFileUpload()"/>
                                    </v-col>
                                    <v-col>
                                        <v-btn small color="primary" :disabled="loading" @click="uploadExcel()">
                                            <v-progress-circular
                                                    indeterminate
                                                    v-if="loading"
                                                    :size="10"
                                                    :width="2"
                                                    color="primary"
                                            ></v-progress-circular>
                                            upload
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Filters from './partials/Filters';
import Invoice from '@finance/libs/invoices/Invoice';
import { _ } from 'vue-underscore';

export default {
    name: 'Dispatched',

    components: {
        Filters,
    },

    props: [
        'company', 'account',
    ],

    data: () => ({
        page: 1,
        filters: {},
        loading: false,
        uploadExcelDialog: false,
        totalAmount: 0,
        selected: [],
        dispatch_data: {
            insurance: null,
            selectedInvoices: [],
            cheque: {
                name: null,
                date: null,
                amount: null,
                bank: null,
                number: null,
            },
        },
        invoice: new Invoice(),
        invoicesInfo: {
            total: 0.00,
            paid: 0.00,
            balance: 0.00
        },
        headers: [
            { text: 'Invoice', value: 'invoice_no' },
            { text: 'Dispatch date', value: 'dispatch_date' },
            { text: 'Company', value: 'company' },
            { text: 'Scheme', value: 'scheme' },
            { text: 'Amount', value: 'amount' },
            { text: 'Amount paid', value: 'amount_paid' },
            { text: 'Balance', value: 'balance' },
            { text: 'To pay', value: 'to_pay' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    computed: {
        ...mapGetters({
            invoices: 'getInsuranceInvoices',
            banks: 'getBanks',
            insurances: 'getInsurances',
        }),

        selectedInvoices() {
            return this.dispatch_data.selectedInvoices;
        },
    },

    methods: {
        ...mapActions({
            fetchInvoices: 'setInsuranceInvoices',
            fetchBanks: 'setBanks',
            fetchInsurances: 'setInsurances',
        }),

        CalculateTotalAmount() {
            if (this.dispatch_data.selectedInvoices.length > 0) {
                let total = 0;

                _.each(this.dispatch_data.selectedInvoices, (invoice) => {
                    total += parseInt(invoice.to_pay);
                });

                return total;
            } else {
                return 0;
            }
        },

        parseStringToNumber(yournumber) {
            return parseFloat(yournumber.replace(/,/g, ''));
        },

        print(invoice_id, paper_size) {
            window.open(`/finance/invoices/billed/print?invoice_id=${invoice_id}&paper_size=${paper_size}`);
        },

        viewInvoice(invoice_id) {
            window.open(`/finance/invoice/view/${invoice_id}/show`);
        },

        filterData(filters) {
            this.filters = filters;

            this.initialize();
        },

        navigate(page) {
            this.page = page;
        },

        async processPaymentForSelectedItems() {
            this.loading = true;

            this.dispatch_data.insurance = this.filters.company;

            const response = await this.invoice.processInsurancePayment(this.dispatch_data);

            if (response) {
                this.loading = false;
                this.initialize();

                this.dispatch_data.selectedInvoices = [];

                this.updateTotals()

                this.dispatch_data.cheque.amount = null;
                this.dispatch_data.cheque.name = null;
                this.dispatch_data.cheque.bank = null;
                this.dispatch_data.cheque.number = null;
                this.dispatch_data.cheque.date = null;
            }
        },

        clearFilters() {
            this.filters = {};

            this.initialize();
        },

        async initialize() {
            if(this.page <= 1) {
                this.loading = true;
            }

            if (this.account && this.company) {
                this.filters.company = this.company.id;
            }

            const parameters = this.filters;

            parameters.type = 'insurance-payment';

            await this.fetchInvoices({
                page: this.page,
                params: parameters,
            });
        },

        updateTotals() {
            this.totalAmount = this.CalculateTotalAmount();
        },

        /* excel upload */
        initiateUpload() {
            this.uploadExcelDialog = true;
        },

        selectSchemes(scheme) {

        },

        closeDialog() {
            this.uploadExcelDialog = false;
        },

        onChangeFileUpload() {
            this.invoice.excel.file = this.$refs.file.files[0];
        },

        async uploadExcel() {

            if(!this.invoice.excel.cheque.number || !this.invoice.excel.cheque.bank || !this.invoice.excel.cheque.amount) {
                flash({
                    message: "Please ensure you provide the cheque number, bank and amount",
                    alert: 'error'
                })
            } else {
                const self = this;

                this.loading = true;

                const response = await this.invoice.uploadExcel();

                if (response) {
                    self.loading = false;

                    this.closeDialog();
                }
            }
        },

    },

    watch: {
        invoices(val) {
            this.loading = false;

            if (this.page <= 1 ) {
                this.invoicesInfo.total = val.total_invoices_amount;
                this.invoicesInfo.paid = val.paid_amount;
                this.invoicesInfo.balance = val.total_balance;
            }
        },

        selectedInvoices() {
            this.updateTotals();
        },

        page() {
            this.initialize();
        },
    },

    mounted() {
        this.fetchBanks();
        this.fetchInsurances();
        this.initialize();
    },
};
</script>
<style scoped>
    input[type=number] {
        padding: 7px 15px;
        margin: 3px 0;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }

    .headers {
        font-size: 16px;
        font-weight: bold;
    }
    .display-inline {
        display: inline-block;
        padding-left: 20px;
        padding: 7px 7px;
        margin: 3px 0;
    }
</style>
