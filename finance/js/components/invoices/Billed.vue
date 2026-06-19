<template>
    <v-card>

        <v-card-title>
            <filters @filtered="filterData" @clearFilters="clearFilters" patient></filters>
        </v-card-title>


        <!-- manual invoice-->
        <v-card-actions style="margin-top: -90px; float: right">
            <v-spacer/>
            <template>
                <v-row justify="space-around">
                    <v-col cols="auto">
                        <v-dialog
                                transition="dialog-bottom-transition"
                                max-width="1200"
                                v-model="manualInvDialog"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                        color="primary"
                                        v-bind="attrs"
                                        v-on="on"
                                >Manual Invoice</v-btn>
                            </template>

                            <template v-slot:default="manualInvDialog">

                                <manual-invoice @manualSaved="manualInvoiceSaved()"></manual-invoice>

                            </template>
                        </v-dialog>
                    </v-col>
                </v-row>
            </template>
        </v-card-actions>

        <v-card-text>

            <collabmed-loading v-if="!invoices.data || loading"></collabmed-loading>

            <div v-else>
                <v-data-table
                        :headers="headers1"
                        :items="invoices.data"
                        v-if="msetting('finance.select_all_invoices')"
                        :item-disabled="item=> item.status === 'Billed'"

                        show-select
                        @input="updateTotal()"
                        v-model="selectedInvoices"
                        class="elevation-1"
                        disable-pagination
                        hide-default-footer
                >
                    <template v-slot:item.hash="{ item }" v-if="!msetting('finance.select_all_invoices')">
                        <v-checkbox
                                v-model="selectedInvoices"
                                :value="item"
                                @input="updateTotal()"
                                :item-disabled="(item) => item.status === 'Dispatched' "
                                primary
                                hide-details
                        ></v-checkbox>
                    </template>

                    <template v-slot:item.invoice="{ item }">
                        <a :href="`/finance/invoice/view/${item.id}/show`" target="_blank">{{ item.invoice_no }}</a> <br/>

                        <span class="grey--text" style="font-size: 11px;">{{ item.date }}</span> <br/>
                        <v-chip @click="viewInvoice(item)"  v-if="!item.patient_signature" color="error" small> not signed</v-chip>
                        <v-chip  v-else color="success" small>signed</v-chip>
                    </template>

                    <template v-slot:item.patient_name="{ item }">
                        {{ item.patient_name }}<br/>
                        <span class="grey--text" style="font-size: 11px;"> {{ item.patient_no }}</span> <br/>
                        <span class="grey--text" style="font-size: 11px;">Id No: {{ item.patient_id_no }}</span> <br/>
                    </template>

                    <template v-slot:item.company="{ item }">
                        {{ item.company }} <br/>
                        <span class="grey--text" style="font-size: 11px;">{{ item.scheme }}</span>
                    </template>


                    <template v-slot:item.amount="{ item }">
                        <v-btn small color="purple"  class="white--text"
                               @click="viewBills(item)"
                        > {{ item.amount }} </v-btn>
                    </template>

                    <template v-slot:item.claim_no="{ item }">
                        <input
                                type="number"
                                style="width: 100%"
                                :disabled="item.status === 'Dispatched' || item.status === 'Paid'"
                                v-model="item.claim_no"
                                :min="1"
                        />
                    </template>

                    <template v-slot:item.balance="{ item }">
                        <v-btn small color="purple"  class="white--text"
                               @click="viewBills(item)"
                        > {{ item.balance }} </v-btn>
                    </template>

                    <template v-slot:item.status="{ item }">
                        <v-chip color="default" small>{{ item.status }}</v-chip>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <v-menu transition="slide-y-transition" bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn small  color="primary" dark v-on="on">
                                    Print
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item>
                                    <v-btn small color="primary" @click="print(item.id, 'a4')">Print A4</v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="print(item.id, 'a5')">Print A5</v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="printDailyInvoice(item.id, 'daily-invoice')">Print Daily Invoice</v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="print(item.id, 'thermal')">Print thermal</v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="printGrouped(item.id, 'thermal')">
                                        <v-icon class="pr-2">fa fa-print</v-icon> Print grouped invoice
                                    </v-btn>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                        <v-menu transition="slide-y-transition" bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn small  color="primary" dark v-on="on">
                                    Org. Prints
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item>
                                    <v-btn small color="primary" @click="print(item.id, 'a4', 1)">Print A4</v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="print(item.id, 'a5', 1)">Print A5</v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="print(item.id, 'thermal', 1)">Print thermal</v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="printGrouped(item.id, 'thermal', 1)">
                                        <v-icon class="pr-2">fa fa-print</v-icon> Print grouped invoice
                                    </v-btn>
                                </v-list-item>
                            </v-list>
                        </v-menu>

                        <v-btn small color="error"  v-if="!msetting('finance.disable_cancel_invoice_button')"    class="white--text"  @click="cancelInvoice(item.id)" >cancel</v-btn>
                    </template>
                </v-data-table>


                <!-- OOh to just help you in decoding this: -->
                <!-- minor difference one has ability to select al invoices plus non-fetched  the other doesn't -->
                <v-data-table
                        :headers="headers"
                        :items="invoices.data"
                           :item-disabled="item => item.status === 'Billed' "
                        v-else
                        show-select
                        item-key="invoice_no"
                        v-model="selectedInvoices"
                        class="elevation-1"
                        disable-pagination
                        hide-default-footer
                >
                    <template v-slot:item.invoice="{ item }">
                        <a :href="`/finance/invoice/view/${item.id}/show`" target="_blank">{{ item.invoice_no }}</a> <br/>

                        <span class="grey--text" style="font-size: 11px;">{{ item.date }}</span> <br/>
                        <v-chip @click="viewInvoice(item)"  v-if="!item.patient_signature" color="error" small> not signed</v-chip>
                        <v-chip  v-else color="success" small>signed</v-chip>
                    </template>

                    <template v-slot:item.patient_name="{ item }">
                        {{ item.patient_name }}<br/>
                        <span class="grey--text" style="font-size: 11px;"> {{ item.patient_no }}</span> <br/>
                        <span class="grey--text" style="font-size: 11px;">Id No: {{ item.patient_id_no }}</span> <br/>
                    </template>

                    <template v-slot:item.company="{ item }">
                        {{ item.company }} <br/>
                        <span class="grey--text" style="font-size: 11px;">{{ item.scheme }}</span>
                    </template>


                    <template v-slot:item.amount="{ item }">
                        <v-btn small color="purple"  class="white--text"
                               @click="viewBills(item)"
                        > {{ item.amount }} </v-btn>
                    </template>

                    <template v-slot:item.claim_no="{ item }">
                        <input
                                type="number"
                                style="width: 100%"
                                :disabled="item.status === 'Dispatched'"
                                v-model="item.claim_no"
                                :min="1"
                        />
                    </template>

                    <template v-slot:item.balance="{ item }">
                        <v-btn small color="purple"  class="white--text"
                               @click="viewBills(item)"
                        > {{ item.balance }} </v-btn>
                    </template>

                    <template v-slot:item.status="{ item }">
                        <v-chip color="default" small>{{ item.status }}</v-chip>
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <v-menu transition="slide-y-transition" bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn small  color="primary" dark v-on="on">
                                    Print
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item>
                                    <v-btn small color="primary" @click="print(item.id, 'a4')">Print A4</v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="print(item.id, 'a5')">Print A5</v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="print(item.id, 'thermal')">Print thermal</v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="printDailyInvoice(item.id, 'daily-invoice')">Print Daily Invoice</v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="printGrouped(item.id, 'a4')">
                                         Print grouped invoice
                                    </v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="printTotals(item.id, 'a4')">
                                        Print totals only
                                    </v-btn>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                        <v-menu transition="slide-y-transition" bottom>
                            <template v-slot:activator="{ on }">
                                <v-btn small  color="primary" dark v-on="on">
                                    Org. Prints
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item>
                                    <v-btn small color="primary" @click="print(item.id, 'a4', 1)">Print A4</v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="print(item.id, 'a5', 1)">Print A5</v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="print(item.id, 'thermal', 1)">Print thermal</v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="printGrouped(item.id, 'a4', 1)">
                                        Print grouped invoice
                                    </v-btn>
                                </v-list-item>
                                <v-list-item>
                                    <v-btn small color="primary" @click="printTotals(item.id, 'a4', 1)">
                                        Print totals only
                                    </v-btn>
                                </v-list-item>
                            </v-list>
                        </v-menu>

                        <v-btn small color="error" v-if="!msetting('finance.disable_cancel_invoice_button')" class="white--text" @click="cancelInvoice(item.id)" >cancel</v-btn>
                        <!-- <v-btn small color="purple" class="white--text" @click="editInvoice(item.id)" >edit</v-btn> -->
                    </template>
                </v-data-table>
            </div>
        </v-card-text>

        <v-card-text v-if="invoices.data">
            <v-row >
                <v-col md="2" cols="12">
                    <!-- Tooltip wraps the button when it is disabled due to different companies -->
                    <v-tooltip bottom v-if="selectedInvoices.length > 0 && !sameCompany">
                        <template v-slot:activator="{ on, attrs }">3ewa
                            <v-btn 
                                small 
                                color="success"
                                v-bind="attrs"
                                v-on="on"
                                @click.once="dispatchSelectedInvoices()"
                                :disabled="selectedInvoices.length < 1 || !sameCompany"
                            >
                                dispatch selected invoices
                            </v-btn>
                        </template>
                        <!-- Tooltip text -->
                        <span>Please select specific insurance schemes</span>
                    </v-tooltip>
                
                    <!-- Button without tooltip when it's not disabled -->
                    <v-btn 
                        v-else
                        small 
                        color="success"
                        @click.once="dispatchSelectedInvoices()"
                        :disabled="selectedInvoices.length < 1 || !sameCompany"
                    >
                        dispatch selected invoices
                    </v-btn>
                </v-col>
                

                <v-col md="10" cols="12" class="text-right pr-3">
                    <div v-if="selectedInvoices.length > 0">
                        <v-chip small color="default"
                                v-for="(invoice) in selectedInvoices"
                                :key="invoice.id"
                                @click:close="removeInvoiceFromSelection(invoice)"
                                close
                                class="mx-1">
                            <strong>{{  invoice.invoice_no }}</strong>&nbsp;
                            <span>({{  invoice.patient_name}})</span>
                        </v-chip>
                    </div>
                </v-col>
            </v-row>
            <v-row >
                <v-col class="text-center" v-if="invoices.meta">
                    <v-pagination
                            v-model="page"
                            :length="invoices.meta.last_page"
                            circle
                            total-visible="8"
                    ></v-pagination>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="12">
                    <span>
                        Total amount of selected invoices:
                        <span class="font-weight-bold">
                            {{ selected_invoices_details.total_amount | numberFormat }}
                        </span>
                    </span> <br/>
                    <span>
                        Total amount of selected invoices:
                        <span class="font-weight-bold">
                            {{ selected_invoices_details.total_balance | numberFormat }}
                        </span>
                    </span>
                </v-col>
            </v-row>
        </v-card-text>

        <edit-invoice
                v-if="editInvoiceData.dialog"
                @inv-edit-dialog-closed="closeEditDialog"
                :show-edit-dialog="editInvoiceData.dialog"
                :invoice-id="editInvoiceData.invoice_id">
        </edit-invoice>
    </v-card>
</template>
<script>
import Invoice from '@finance/libs/invoices/Invoice';
import ManualInvoice from "@finance/components/invoices/ManualInvoice";
import { mapActions, mapGetters } from 'vuex';
import Filters from './partials/Filters';
import { _ } from 'vue-underscore';
import EditInvoice from './EditInvoice'

export default {
    name: 'Billed',

    components: {
        Filters, EditInvoice, ManualInvoice
    },

    data: () => ({
        page: 1,
        hold: [],
        selectedInvoices: [],
        filters: {},
        loading: false,
        invoice: new Invoice(),
        manualInvDialog: false,
        editInvoiceData: {
          dialog: false,
          invoice_id: null
        },
        selected_invoices_details: {
            total_amount: 0,
            total_balance: 0
        },
        headers: [
            // { text: '#', value: 'hash' },
            { text: 'Invoice', value: 'invoice' },
            { text: 'Name', value: 'patient_name' },
            { text: 'Company', value: 'company' },
            { text: 'Amount', value: 'amount' },
            { text: 'e Tims No.', value: 'claim_no' },
            { text: 'Balance', value: 'balance' },
            { text: 'Status', value: 'status' },
            { text: 'Actions', value: 'actions' },
        ],
        headers1: [
            // { text: '#', value: 'hash' },
            { text: 'Invoice', value: 'invoice' },
            { text: 'Name', value: 'patient_name' },
            { text: 'Company', value: 'company' },
            { text: 'Amount', value: 'amount' },
            { text: 'e Tims No.', value: 'claim_no' },
            { text: 'Balance', value: 'balance' },
            { text: 'Status', value: 'status' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    computed: {
        ...mapGetters({
            invoices: 'getInsuranceInvoices',
        }),

        sameCompany() {
  if (this.selectedInvoices.length < 1) {
    return false; // Disable if no invoices are selected
  }

  // Extract the scheme/company of the first selected invoice
  const firstCompany = this.selectedInvoices[0].company;

 
  // Check if all selected invoices have the same company (scheme)
  const allSameCompany = this.selectedInvoices.every(invoice => invoice.company === firstCompany);

  
  // Return true if all are the same, false otherwise
  return allSameCompany;
}

    },

    methods: {
        ...mapActions({
            fetchInvoices: 'setInsuranceInvoices',
        }),

        manualInvoiceSaved() {
            this.manualInvDialog = false;
            this.initialize();
        },

        editInvoice(invoiceId) {
            this.editInvoiceData.invoice_id = invoiceId;
            this.editInvoiceData.dialog = true;
        },

        closeEditDialog() {
            this.editInvoiceData.dialog = false;
            this.initialize();
        },

        updateTotal() {
            let total  = 0;
            let balance = 0;

            this.selectedInvoices.map((val) => {
                total += Number(val.amount.replaceAll(/[,]/g, ''))
                balance += val.balance
            });

            this.selected_invoices_details.total_amount = total;
            this.selected_invoices_details.total_balance = balance;
        },

        viewInvoice(invoice) {
            window.open(`/finance/invoice/view/${invoice.id}/show`);
        },


        cancelInvoice(invoice_id) {
            window.open(`/finance/invoices/${invoice_id}/cancel`, '_self');
        },

        filterData(filters) {
            this.filters = filters;

            this.page = 1;

            this.initialize();
        },

        clearFilters() {
            this.filters = {};

            this.initialize();
        },

        print(invoice_id, paper_size, use_org = 0) {
            if (use_org) {
                window.open(`/finance/invoices/billed/print?invoice_id=${invoice_id}&paper_size=${paper_size}&use_org=true`);
            } else {
                window.open(`/finance/invoices/billed/print?invoice_id=${invoice_id}&paper_size=${paper_size}`);
            }
        },

        printDailyInvoice(invoice_id) {
            window.open(`/inpatient/discharge-requests/visit/${invoice_id}/print-daily-invoice/daily-invoice/`);
        },
        printGrouped(invoice_id, paper_size, use_org = 0) {
            if (use_org) {
                window.open(`/finance/invoices/billed/print?invoice_id=${invoice_id}&paper_size=${paper_size}&use_org=true&summarised=true`);
            } else {
                window.open(`/finance/invoices/billed/print?invoice_id=${invoice_id}&paper_size=${paper_size}&summarised=true`);
            }
        },

        printTotals(invoice_id, paper_size, use_org = 0) {
            if (use_org) {
                window.open(`/finance/invoices/billed/print?invoice_id=${invoice_id}&paper_size=${paper_size}&use_org=true&summarised=true&totals_only=1`);
            } else {
                window.open(`/finance/invoices/billed/print?invoice_id=${invoice_id}&paper_size=${paper_size}&summarised=true&totals_only=1`);
            }
        },

        async initialize() {
            this.loading = true;

            const parameters = this.filters;

            parameters.type = 'billed';

            await this.fetchInvoices({
                page: this.page,
                params: parameters,
            });
        },

        removeInvoiceFromSelection(invoice) {
            this.selectedInvoices = _.filter(this.selectedInvoices, (selectedInvoice) => selectedInvoice.id != invoice.id);
        },

        async dispatchSelectedInvoices() {
            const data = {
                bill: _.pluck(this.selectedInvoices, 'id'),
                claim_numbers: _.map(this.selectedInvoices, function(invoice) {
                    return { [invoice.id]: invoice.claim_no };
                }),
            };

            const response = await this.invoice.dispatchInvoices(data);

            if (response) {
                this.initialize();

                window.location.reload();
            }
        },
    },

    watch: {
        invoices() {
            this.loading = false;
        },

        selectedInvoices() {
            this.updateTotal();
        },

        page() {
            this.initialize();
        },
    },

    mounted() {
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
