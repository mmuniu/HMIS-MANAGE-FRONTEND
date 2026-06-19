<template>
    <collabmed-loading v-if="!summary"></collabmed-loading>
    <v-card v-else flat>
        <v-card-text>
            <v-row>
                <v-col md="3">
                    <span style="font-weight: bolder; font-size: 15px">Total Balance:  </span>
                    <span style="font-weight: bolder; font-size: 19px"> {{ summary.total_balance }}</span>
                </v-col>
                <v-col md="3">
                    <span style="font-weight: bolder; font-size: 15px">Amount paid:  </span>
                    <span style="font-weight: bolder; font-size: 19px"> {{ summary.amount_paid }}</span>
                </v-col>
                <v-col md="3">
                    <span style="font-weight: bolder; font-size: 15px">Account Balance:  </span>
                    <span style="font-weight: bolder; font-size: 19px"> {{ summary.account_balance }}</span>
                </v-col>
                <v-col md="3">
                    <span style="font-weight: bolder; font-size: 15px">Total Invoices:  </span>
                    <span style="font-weight: bolder; font-size: 19px"> {{ summary.total_invoices }}</span>
                </v-col>
                <v-col md="3">
                    <span style="font-weight: bolder; font-size: 15px">Settled Invoices:  </span>
                    <span style="font-weight: bolder; font-size: 19px"> {{ summary.settled_invoices }}</span>
                </v-col>
            </v-row>


            <v-card flat>
                <br/>
                <span style="font-size: 14px; text-decoration: underline; font-weight: bolder">List of all payouts to supplier</span>
                <v-card-text>
                    <v-data-table
                            :headers="headers" :items="summary.payments"
                            class="mb-3" flat
                    >
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";

export default {
    props: [
        "supplier_id",
    ],

    data: () => ({
        headers: [
            { text: "invoice", value: "invoice_id" },
            { text: "Amount", value: "amount" },
            { text: "User", value: "user" },
            { text: "Date", value: "date" },
        ],
    }),

    computed: {
        ...mapGetters({
            summary: "getSupplierSummary",
        }),
    },

    methods: {
        ...mapActions([
            "setSupplierSummary",
        ]),
    },

    mounted() {
        this.setSupplierSummary({
            params: {
                supplier_id: this.supplier_id,
            },
        });
    },
};
</script>
