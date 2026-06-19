<template>
    <v-row justify="center">
        <v-dialog v-model="dialog" persistent max-width="950">
            <template v-slot:activator="{ on }">
                <v-btn color="primary" dark v-on="on">Add extra items to visit bills</v-btn>
            </template>
            <v-card>
                <v-card-title class="headline primary">
                    <span class="white--text">Add extra items to patient visit bills</span>
                    <v-btn icon dark @click.native="closeDialog()" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-card-title>
                        <v-spacer></v-spacer>
                        <procedure-search @results="procedureSelected" :scheme-id="schemeId" ></procedure-search>
                    </v-card-title>

                    <v-card-text>
                        <template>
                            <v-data-table
                                    :headers="headers"
                                    :items="items"
                                    class="elevation-1"
                            >
                                <template v-slot:item.quantity="{ item }">
                                    <input
                                            type="number"
                                            style="border: 1px solid black"
                                            v-model="item.quantity"
                                             @input="updateAmount(item)"
                                    />
                                </template>
                                    <template v-slot:item.amount="{ item }">
                                        {{ item.amount }}
                                    </template>

                                <template v-slot:item.actions="{ item }">
                                    <v-btn small icon>
                                        <v-icon small color="error" @click="removeSelection(item)">delete</v-icon>
                                    </v-btn>
                                </template>
                            </v-data-table>
                        </template>
                    </v-card-text>

                    <v-row >
                        <v-col class="px-3" cols="12" >
                            <v-btn color="primary" @click.once="addItems()">Add</v-btn>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-row>
</template>
<script>
    import ProcedureSearch from '@evaluation/components/procedures/ProcedureSearch';
    import Invoice from '@finance/libs/invoices/Invoice';

    export default {
        components: {
            ProcedureSearch,
        },
        props: {
        schemeId: {
            default: null,
        },
    },


        data() {
            return {
                dialog: false,
                items: [],
                invoice: new Invoice(),
                headers: [
                    { text: 'Service', value: 'name' },
                    { text: 'Price', value: 'price' },
                    { text: 'Quantity', value: 'quantity' },
                    { text: 'Amount', value: 'amount' },
                    { text: 'Action', value: 'actions' },
                ],
            };
        },

        methods: {
            closeDialog() {
                this.dialog = false;
            },

            addItems() {
                const data = {
                    items: this.items,
                    visit_id: this.$route.query.visit_id,
                    scheme_id: this.schemeId,
                };

                this.invoice.addItemsToInvoice(data);
            },

            procedureSelected(selected) {
                this.items.push({
                    name: selected.name,
                    quantity: 1,
                    price: selected.insurance_charge,
                    procedure_id: selected.id,
                    amount: selected.insurance_charge,
                    type: selected.categoryObj.name,
                });
            },

            removeSelection(item) {
                this.items.splice(this.items.indexOf(item), 1);
            },

            updateAmount(item) {

                if (item.quantity < 1 || isNaN(item.quantity)) {
                    item.quantity = 1;
                }
                item.amount = item.quantity * item.price;
            }
        },
    };
</script>
