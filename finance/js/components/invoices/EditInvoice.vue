<template>
    <v-dialog
            transition="dialog-bottom-transition"
            persistent
            v-model="dialog"
            max-width="900"
    >
        <template v-slot:default="dialog">
            <v-card flat>
                <v-toolbar color="primary" dark>
                    Edit invoice details
                    <v-spacer/>
                    <v-btn text @click="closeDialog">
                        Close
                    </v-btn>
                </v-toolbar>

                <v-card-text>

                    <collabmed-loading v-if="!invoice"></collabmed-loading>

                    <div v-else>

                        <v-row>
                            <v-col cols="4">
                                <v-text-field v-model="invData.patient_name"
                                              label="Patient Name">
                                </v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field v-model="invData.patient_no"
                                              label="Patient no">
                                </v-text-field>
                            </v-col>
                            <v-col cols="4">
                                <v-text-field v-model="invData.policy_no"
                                              label="Policy No">
                                </v-text-field>
                            </v-col>


                            <v-col cols="3">
                                <v-text-field v-model="invData.invoice_no"
                                              label="Invoice no">
                                </v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <collabmed-date-time-picker
                                        @input="setInvoiceDate"
                                        dateOnly
                                        :datetime="invData.invoice_date"
                                        label="Invoice date">
                                </collabmed-date-time-picker>
                            </v-col>
                        </v-row>

                        <v-data-table
                                :headers="headers"
                                :items="invoice.invoice_items"
                                flat
                                class="elevation-1"
                                disable-pagination
                                hide-default-footer
                        >
                            <template v-slot:item.price="{ item }">
                                <input
                                        type="number"
                                        style="border: 1px solid black"
                                        v-model="item.price"
                                        @change="saveUpdate(item)"
                                />
                            </template>
                            <template v-slot:item.amount="{ item }">
                                <input
                                        type="number"
                                        style="border: 1px solid black"
                                        v-model="item.amount"
                                        @change="saveUpdate(item)"
                                />
                            </template>
                            <template v-slot:item.units="{ item }">
                                <input
                                        type="number"
                                        style="border: 1px solid black"
                                        v-model="item.units"
                                        @change="saveUpdate(item)"
                                />
                            </template>
                            <template v-slot:item.actions="{ item }">
                                <v-btn small
                                       icon
                                       color="error"
                                       @click="deleteItemFromInvoice(item)"
                                       class="white--text" >
                                   <v-icon small>delete</v-icon>
                                </v-btn>
                            </template>
                        </v-data-table>
                    </div>


                    <div>
                        <v-row v-for="(item, index) in invData.items" :key="index">
                            <v-col cols="5">
                                <v-text-field v-model="item.item_name"
                                              label="Item name"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="2">
                                <v-select
                                        label="Item type"
                                        :items="[
                                           'investigation',
                                            'prescription',
                                            'consumable',
                                            'Admission + Daily charges',
                                            'Ward charge',
                                            'rebate',
                                            'copay'
                                      ]"
                                        v-model="item.item_type">
                                </v-select>
                            </v-col>
                            <v-col cols="1">
                                <v-text-field v-model="item.price"
                                              label="price"
                                              @input="updateTotals(index)"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="1">
                                <v-text-field v-model="item.units"
                                              label="Units"
                                              @input="updateTotals(index)"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="1">
                                <v-text-field v-model="item.amount"
                                              readonly
                                              label="Amount"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="1">
                                <v-btn icon small color="error" @click="removeItem(index)">
                                    <v-icon small>
                                        delete
                                    </v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>

                        <div class="mt-4">
                            <v-btn small color="primary" @click="addItem()">
                                add item
                            </v-btn>

                            <v-btn small color="primary" @click="saveAddedItems()" v-if="invData.items.length > 0">
                                save added items
                            </v-btn>
                        </div>
                    </div>


                    <div>
                        <v-row>
                            <v-col cols="4">
                                <v-text-field
                                        v-model="amount"
                                        label="Total amount"
                                        @change="saveUpdate({
                                            invoice_id: invoice.id,
                                            amount: amount,
                                            inv_edit: true
                                        })"
                                >
                                </v-text-field>
                            </v-col>
                        </v-row>
                    </div>

                </v-card-text>

                <v-card-actions class="justify-end">

                    <v-btn color="primary"
                           @click="updateInvoiceData()">
                        save
                    </v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import Invoice from '@finance/libs/invoices/Invoice';

    export default {
        props: [
            'invoiceId', 'showEditDialog'
        ],

        data () {
            return {
                dialog: false,
                invoice: null,
                invObj: new Invoice(),
                amount: 0,
                headers: [
                    { text: 'Item', value: 'item_name' },
                    { text: 'Price', value: 'price' },
                    { text: 'Units', value: 'units' },
                    { text: 'Amount', value: 'amount' },
                    { text: 'actions', value: 'actions' },
                ],
                invData: {
                    patient_name: null,
                    patient_no: null,
                    policy_no: null,
                    invoice_no: null,
                    invoice_date: '',
                    items: [
                    ]
                }
            }
        },

        watch: {
            getViewInvoice(val) {
                this.invoice = val;
                if(val) {
                    this.invData.patient_name = val.patient_name;
                    this.invData.patient_no = val.patient_no;
                    this.invData.policy_no = val.policy_no;
                    this.invData.invoice_no = val.invoice_no;
                }
                this.amount = val.amount
            },

            invoiceId (val) {
                this.invoice = null;
                this.init();
            },

            showEditDialog(val) {
                this.dialog = val;
            }
        },

        computed: {
            ...mapGetters([
                'getViewInvoice'
            ])
        },

        methods: {
            ...mapActions([
                'setViewInvoice'
            ]),

            addItem() {
                this.invData.items.push({
                    item_name: null,
                    item_type: null,
                    units: null,
                    price: null,
                    amount: null
                });
            },

            setInvoiceDate (date) {
                this.invData.invoice_date = date;
            },

            async updateInvoiceData(){
                let response = await this.invObj.updateInvoiceData(this.invData, this.invoiceId);

                if(response) {
                    this.invData.patient_name = null;
                    this.invData.patient_no = null;
                    this.invData.policy_no = null;
                    this.invData.invoice_no = null;
                    this.invData.items = [];

                    this.closeDialog();
                }
            },

            updateTotals(index) {

                let item = this.invData.items[index];

                if(item.price !== null && item.units !== null) {

                    item.amount = item.price * item.units;
                }
            },

            removeItem(index) {
                this.invData.items.splice(index, 1);
            },

            closeDialog() {
                this.dialog = false;
                this.$emit('inv-edit-dialog-closed');
            },

            async saveEdits(item) {
                let response = await this.invObj.saveEdits(item);
            },

            async saveUpdate(item) {
                let response = await this.invObj.saveEdits(item);
            },

            async saveAddedItems() {
                let response = await this.invObj.saveAddedItems(this.invData.items, this.invoiceId);

                if(response) {
                    this.invData.items = [];

                    this.init();
                }
            },

            async deleteItemFromInvoice(item) {
                let response = await this.invObj.deleteItem(item);

                if(response) {
                    let index = this.invoice.invoice_items.indexOf(item);

                    this.invoice.invoice_items.splice(index, 1);
                }
            },

            init() {
                this.setViewInvoice({
                    params: {
                        invoice_id: this.invoiceId
                    }
                })
            }
        },

        mounted() {
            this.init();
            this.dialog = this.showEditDialog;
        }
    }
</script>
