<template>
    <div>
        <collabmed-loading v-if="!initialised"></collabmed-loading>

        <div v-else>

           <!-- <v-expansion-panel dark>
                <v-expansion-panel-content>
                    <template v-slot:header>
                        <div>Click here to filter invoices</div>
                    </template>
                    <v-card>
                        <v-card-text>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                            sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>-->

            <v-container class="blue-grey lighten-4" fluid style="margin-top: 0">
                <v-row  v-if="getSupplierStatement">
                    <v-col class="text-center" v-for="statement in getSupplierStatement" :key="statement.text">
                        <a class="hove-over" @click="settleBill(statement)">
                            <span class="tooltiptext" v-if="statement.amount != 0.00">Settle bill</span>
                            <span class="font-weight-black"> {{ statement.text }}</span> <br/>
                            <span class="font-weight-black"> {{ statement.amount }}</span>
                        </a>
                    </v-col>
                </v-row>
            </v-container>
            <br/>
            <v-btn small color="primary" @click="printStatement()">Print statement</v-btn>
            <h4 style="float: right" v-if="invoicePayment.totalAmount() > 0"> Total Amount: {{ invoicePayment.totalAmount() }}</h4>
            <br/>

            <v-card-text>
                <v-row  >
                    <v-col cols="12" md="2">
                        <div class="mx-2">
                            <v-text-field label="Invoice number" outline v-model="filters.invoice_number"></v-text-field>
                        </div>
                    </v-col>

                    <v-col md="2">
                        <collabmed-date-time-picker outline dateOnly
                                                    @input="setStartDate"
                                                    :datetime="filters.start_date"
                                                    label="Start date">
                        </collabmed-date-time-picker>
                    </v-col>

                    <v-col md="2">
                        <collabmed-date-time-picker outline dateOnly
                                                    @input="setEndDate"
                                                    :datetime="filters.end_date"
                                                    label="End date">
                        </collabmed-date-time-picker>
                    </v-col>

                    <v-col>
                        <v-btn @click="filter()" large color="success">filter</v-btn>
                    </v-col>
                </v-row>
            </v-card-text>

            <form @submit.prevent="submit()">
                <v-data-table
                        v-model="invoicePayment.settlements"
                        :headers="headers"
                        :items="invoices.data"
                        class="mb-2"
                        flat
                        show-select
                        hide-default-footer
                >
                    <template slot="header.data-table-select">
                        <th>#</th>
                    </template>

                    <template v-slot:item.data-table-select="{ item }">
                        <v-avatar
                                v-if="item.balance < 1"
                                :size="20"
                        >
                            <img src="/img/checked.png" alt="tick">
                        </v-avatar>
                        <v-checkbox
                                v-else
                                primary
                                v-model="invoicePayment.settlements"
                                :value="item"
                                hide-details
                        ></v-checkbox>
                    </template>
                    <template v-slot:item.amount="{ item }">
                        <input
                                :id="item.id"
                                type="number"
                                step=".01"
                                class="form-control table-input"
                                :max="item.amount"
                                :min="0"
                                v-model="item.amount"
                                :disabled="!invoicePayment.settlements.includes(item)"
                        />
                    </template>

                    <template v-slot:item.status="{ item }">
                        <v-chip
                                :color="item.status === 'pending' ? 'error': 'success'"
                                dark small
                        >
                            {{ item.status }}
                        </v-chip>
                    </template>

                    <template v-slot:item.progress="{ item }">
                            <span v-if="item.status === 'pending'">
                                <span v-if="item.aging.alert === 'primary'">
                                    <v-progress-circular  :size="15"
                                                          :width="1"
                                                          color="success"
                                                          indeterminate>
                                    </v-progress-circular>
                                    <span class="primary--text">{{ item.aging.date_diff }} </span>
                                </span>
                                <span v-else>
                                    <v-progress-circular  :size="15"
                                                          :width="1"
                                                          color="red"
                                                          indeterminate>
                                    </v-progress-circular>
                                    <span class="error--text">{{ item.aging.date_diff }} </span>
                                </span>
                            </span>
                        <span v-else>
                                <span class="success--text">{{ item.aging.date_diff }} </span>
                            </span>
                    </template>
                    <template v-slot:item.actions="{ item }">
                        <v-btn
                                @click="viewDetails(item)"
                                v-if="item.invoice_type === 'Direct Order'"
                                color="primary"
                                class="caption"
                                dark small
                        >
                            View details
                        </v-btn>
                        <v-btn @click="viewGrn(item)"
                               color="purple"
                               v-if="item.invoice_type === 'Purchase Order'"
                               class="caption"
                               dark small
                        >
                            View GRN
                        </v-btn>
                    </template>

                    <template slot="footer" v-if="invoices.links">
                        <v-row  class="pt-3">
                            <v-col cols="8">
                                <v-btn
                                        class="caption"
                                        type="submit"
                                        color="success"
                                        large
                                        :dark="!disabled"
                                        :disabled="disabled"
                                        :loading="invoicePayment.form.loading"
                                >
                                    Settle Selected invoices
                                </v-btn>

                                Total invoices: {{ invoices.meta.total }}
                            </v-col>

                            <v-col cols="3" class="text-right">
                                <v-btn icon @click="navigate(invoices.links.prev)">
                                    <v-icon>chevron_left</v-icon>
                                </v-btn>
                                <v-btn icon @click="navigate(invoices.links.next)">
                                    <v-icon>chevron_right</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </template>
                </v-data-table>
            </form>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import InvoicePayment from "@inventory/libs/invoice_payments/InvoicePayment";
import Invoice from "@inventory/libs/invoices/Invoice";
import moment from "moment";

export default {
    name: "invoices-index",

    props: [
        "userId", "supplier_id",
    ],

    data() {
        return {
            page: 1,
            invoicePayment: new InvoicePayment(),
            invoice: new Invoice(),
            filterParams: null,
            invoices: null,
            headers: [
                { text: "Invoice no.", value: "number" },
                { text: "Supplier", value: "supplier.name" },
                { text: "Total Amount", value: "total_amount" },
                { text: "Settled", value: "settled" },
                { text: "Balance", value: "balance" },
                { text: "Amount", value: "amount" },
                { text: "Invoice type", value: "invoice_type" },
                { text: "status", value: "status" },
                { text: "Due date", value: "due_date" },
                { text: "#", value: "progress" },
                { text: "Actions", value: "actions" },
            ],
            filters: {
                start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
                end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
                invoice_number: null,
                type: "direct_order",
                supplier_id: this.supplier_id,
            },
        };
    },

    watch: {
        getInvoices(invoices) {
            this.invoices = invoices;
        },

        submitted(value) {
            if (value) {
                this.invoicePayment.form.submitted = false;
                this.initialise();
            }
        },

        page(value) {
            const params = _.omitBy(this.filters, _.isNil);

            this.setInvoices({
                page: value,
                params: params,
            });
        },
    },

    computed: {
        ...mapGetters([
            "getInvoices",
            "getSupplierStatement",
        ]),

        initialised() {
            return this.invoices;
        },

        disabled() {
            return this.invoicePayment.settlements.length === 0;
        },

        submitted() {
            return this.invoicePayment.form.submitted;
        },
    },

    methods: {
        ...mapActions([
            "setInvoices", "setSupplierStatement",
        ]),

        printStatement() {
            const default_flters = "?start_date=" + this.filters.start_date + "&end_date=" + this.filters.end_date + "&type=direct_order&supplier_id=" + this.supplier_id;

            const params = this.filters.invoice_number ? default_flters + "&invoice_number=" + this.filters.invoice_number : default_flters;

            window.open("/inventory/suppliers/" + this.supplier_id + "/print-statement" + params, "_blank");
        },

        viewGrn(item) {
            window.open(`/inventory/goods-received-note/${item.goods_received_note_id}/attach-invoice`, "_blank");
        },

        viewDetails(item) {
            window.open(`/inventory/goods-received-notes/${item.grns[0].id}`, "_blank");
        },

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },
        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        filter() {
            const params = _.omitBy(this.filters, _.isNil);

            this.setInvoices({ params: params });
        },

        viewInvoice(purchaseOrderId) {
            window.open("/inventory/purchase-orders/" + purchaseOrderId + "/view-invoice", "_blank");
        },

        navigate(url) {
            if (url) {
                const page = url.substring(url.indexOf("page=")).split("page=")[1];
                this.setInvoices({
                    page,
                    params: {
                        supplier_id: this.supplier_id,
                    },
                });
            }
        },

        submit() {
            this.invoicePayment.store();
        },

        settleBill(statement) {
            const confirmation = confirm("Are you sure you want to settle all the invoices within this bill amounting to : " + statement.amount);

            if (confirmation) {
                this.invoicePayment.settleGroupedBill(statement, this.supplier_id, this.userId);
            }
        },

        initialise() {
            const params = { supplier_id: this.supplier_id };
            this.setInvoices({
                page: 1,
                params,
            });
            this.setSupplierStatement({ params });
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>

<style scoped>
    .tooltiptext {
        visibility: hidden;
        width: 70px;
        background-color: grey;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        margin-top: 50px;
        padding: 3px 0;

        /* Position the tooltip */
        position: absolute;
        z-index: 1;
    }
    .hove-over:hover .tooltiptext {
        visibility: visible;
    }
</style>
