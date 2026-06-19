<template>
    <div>
        <collabmed-loading v-if="!initialised"></collabmed-loading>

        <div v-else>
            <!-- Include the invoices filter -->
            <invoices-filter @filtered="filterParams = $event"></invoices-filter>

            <v-card>
                <v-card-text>
                    <form @submit.prevent="submit()">
                        <v-data-table
                                v-model="invoicePayment.settlements"
                                :headers="headers"
                                :items="invoices.data"
                                class="mb-2"
                                flat
                                hide-default-footer
                                disable-initial-sort
                        >
                            <template v-slot:item.hash="{ item }">
                                <v-avatar
                                        v-if="item.balance < 1"
                                        :size="20"
                                >
                                    <img src="/img/checked.png" alt="tick">
                                </v-avatar>
                                <v-checkbox
                                        v-else
                                        v-model="selected"
                                        primary
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
                                        :disabled="!selected"
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

                            <template v-slot:item.actions="{ item }">
                                <v-btn
                                        :href="`/inventory/goods-received-notes?invoice_id=${item.id}`"
                                        color="cyan"
                                        class="caption"
                                        dark small
                                >
                                    View GRNs
                                </v-btn>
                            </template>

                            <template slot="footer" v-if="invoices.links">
                                <td colspan="100%">

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
                                </td>
                            </template>
                        </v-data-table>
                    </form>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import InvoicePayment from "@inventory/libs/invoice_payments/InvoicePayment";
import Invoice from "@inventory/libs/invoices/Invoice";

export default {
    name: "invoices-index",

    props: [
        "userId",
    ],

    components: {
        "invoices-filter": require("./partials/Filter"),
    },

    data() {
        return {
            invoicePayment: new InvoicePayment(),
            invoice: new Invoice(),
            filterParams: null,
            invoices: null,
            total_amount: null,
            headers: [
                { text: "#", value: "hash" },
                { text: "Number", value: "number" },
                { text: "Supplier", value: "supplier.name" },
                { text: "Total amount", value: "total_amount" },
                { text: "Settled", value: "settled" },
                { text: "Balance", value: "balance" },
                { text: "Amount", value: "amount" },
                { text: "Status", value: "status" },
                { text: "Date raised", value: "date_raised" },
                { text: "Actions", value: "actions" },
            ],
        };
    },

    watch: {
        getInvoices(invoices) {
            this.invoices = invoices;
        },

        submitted(value) {
            if (value) {
                this.invoicePayment.form.submitted = false;
                this.setInvoices({
                    page: 1,
                    params: this.params,
                });
            }
        },
    },

    computed: {
        ...mapGetters([
            "getInvoices",
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
            "setInvoices",
        ]),

        navigate(url) {
            if (url) {
                const page = url.substring(url.indexOf("page=")).split("page=")[1];
                this.setInvoices({
                    page,
                    params: this.filterParams,
                });
            }
        },

        submit() {
            this.invoicePayment.store();
        },
    },

    mounted() {
        this.setInvoices({
            page: 1,
            params: this.params,
        });
    },
};
</script>
