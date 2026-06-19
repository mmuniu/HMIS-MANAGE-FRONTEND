<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>
    <v-card flat v-else>
        <br/>
        <v-card-text class="ma-2">
            <v-row>
                <v-col class="pa-1">
                    <v-text-field
                            v-model="grn_note.invoice.number"
                            :disabled="note.invoice_status === 'Invoiced'"
                            outline
                            label="Invoice Number"
                    ></v-text-field>
                </v-col>
                <v-col class="pa-1">
                    <v-text-field
                            v-model="grn_note.invoice.amount"
                            outline
                            disabled
                            label="Invoice amount"
                    ></v-text-field>
                </v-col>
                <v-col class="pa-1">
                    <collabmed-date-time-picker
                            :disabled="note.invoice_status === 'Invoiced'"
                            outline @input="setInvoiceDate"
                            :datetime="invoice_date"
                            dateOnly
                            label="Invoice Date">
                    </collabmed-date-time-picker>
                </v-col>
                <v-col class="pa-1">
                    <collabmed-date-time-picker
                            :disabled="note.invoice_status === 'Invoiced'"
                            outline @input="setPaymentDueDate"
                            :datetime="payment_due_date" dateOnly
                            label="Payments Due on">
                    </collabmed-date-time-picker>
                </v-col>
                <v-col class="pa-1">
                    <v-text-field
                            v-model="grn_note.invoice.comments"
                            :disabled="note.invoice_status === 'Invoiced'"
                            label="Comments"
                            outline
                    ></v-text-field>
                </v-col>
                <v-col class="pa-1">
                    <input type="file"
                           :disabled="note.invoice_status === 'Invoiced'"
                           id="file" ref="file"
                           v-on:change="onChangeFileUpload()"/>
                </v-col>
                <v-col class="pa-1">
                    <v-btn color="primary"
                           v-if="note.invoice_status === 'Invoiced'"
                           disabled>
                        Invoice already attached
                    </v-btn>
                    <v-btn color="primary" v-else
                           :disabled="grn_note.invoice.amount <= 0"
                           @click="grn_note.attachInvoice(goods_received_id)">
                        attach
                    </v-btn>
                </v-col>
            </v-row>

            <v-data-table
                    :headers="headers" :items="note.details"
                    v-model="grn_note.selected"
                    show-select
                    class="mb-3" flat
                    :options.sync="tableOptions"
                    :footer-props="{
                      'items-per-page-options': [5, 10, 25, 50, 100]
                    }"
            >
                <template slot="header.data-table-select" v-if="note.invoice_status === 'Invoiced'">
                    <th>#</th>
                </template>

                <template v-slot:item.data-table-select="{ item }">
                    <v-checkbox
                            primary
                            :disabled="note.invoice_status === 'Invoiced'"
                            v-model="grn_note.selected"
                            :value="item"
                            hide-details
                    ></v-checkbox>
                </template>

                <template slot="footer">
                    <v-row  class="py-2 pb-2">
                        <v-col cols="8" class="mt-3 ml-3 font-weight-bold">
                            Total amount: {{ note.invoice_status === 'Invoiced' ? getInvoicesTotal() : grn_note.getTotalCost() | numberFormat }}
                        </v-col>
                    </v-row>
                </template>
            </v-data-table>

            <div v-if="grn_note.services">
                <div v-if="grn_note.services.length > 0">
                    <v-row
                            v-for="(service, index) in grn_note.services"
                            :key="service.index">
                        <v-col md="1" class="text-center">
                            {{ index + 1 }}
                        </v-col>
                        <v-col class="mr-2" md="5" >
                            <v-text-field
                                    v-model="service.name"
                                    label="Service"
                                    outline
                            ></v-text-field>
                        </v-col>
                        <v-col class="mx-2" md="3" >
                            <v-text-field
                                    v-model="service.amount"
                                    label="Amount"
                                    outline
                            ></v-text-field>
                        </v-col>
                        <v-col cols="1">
                            <v-btn small color="error" icon @click="grn_note.services.splice(index, 1)">
                                <v-icon small>delete</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </div>
            </div>

            <div v-if="note.invoices">
                <div v-if="note.invoices.length > 0" class="mx-4">
                    <h5> Service charges: </h5>
                    <v-row v-for="(service, index) in getServices()" :key="index">
                        <v-col cols="1">{{ index + 1 }}</v-col>
                        <v-col cols="3">{{ service.name }}</v-col>
                        <v-col cols="3">{{ service.amount | numberFormat }}</v-col>
                    </v-row>
                </div>
            </div>

            <v-row >
                <v-col>
                    <v-btn small v-if="note.invoice_status != 'Invoiced'"
                           color="primary"
                           @click="grn_note.addServiceCharge()">
                        Add service charges
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
<script>
import GoodsReceived from "@inventory/libs/goods_received_notes/GoodsReceivedNotes";
import { mapActions, mapGetters } from "vuex";

export default {
    props: [
        "goods_received_id",
    ],

    data: () => ({
        grn_note: new GoodsReceived(),
        headers: [
            { text: "Product", value: "product.name" },
            { text: "Pack size", value: "pack_size" },
            { text: "Ordered Quantity", value: "ordered_quantity" },
            { text: "Delivered Quantity", value: "received_quantity" },
            { text: "Bonus", value: "bonus" },
            { text: "Discount", value: "discount" },
            { text: "Tax", value: "tax" },
            { text: "Unit cost", value: "unit_cost" },
            { text: "Total cost", value: "receiving_price" },
        ],
        invoice_date: "",
        payment_due_date: "",
        tableOptions: {
            page: 1,
            itemsPerPage: 10,
            sortBy: [],
            sortDesc: [],
            groupBy: [],
            groupDesc: [],
            multiSort: false,
            mustSort: false,
        },
    }),

    computed: {
        ...mapGetters({
            note: "getGoodsReceived",
        }),

        initialised() {
            return this.note ? true : false;
        },
    },

    methods: {
        ...mapActions([
            "setGoodsReceived",
        ]),

        getInvoicesTotal() {
            return this.note.invoices.map((item) => item.amount).reduce((prev, next) => prev + next);
        },

        getServices() {
            const services = [];

            this.note.invoices.forEach((invoice) => {
                invoice.services.forEach((service) => services.push(service));
            });

            return services;
        },

        onChangeFileUpload() {
            this.grn_note.invoice.file = this.$refs.file.files[0];
        },

        setPaymentDueDate(datetime) {
            this.grn_note.invoice.due_date = datetime;
        },

        setInvoiceDate(datetime) {
            this.grn_note.invoice.invoice_date = datetime;
        },
    },

    mounted() {
        this.setGoodsReceived({
            params: {
                goods_received_id: this.goods_received_id,
            },
        });
    },
};
</script>
