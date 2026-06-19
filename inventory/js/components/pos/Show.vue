<template>
    <v-card flat>
        <collabmed-loading v-if="!initialised"></collabmed-loading>

        <div v-else>
            <v-card-title class="subheading grey-text text-darken-2">
                <v-btn icon small @click="navigateBack()">
                    <v-icon small color="blue">keyboard_backspace</v-icon>
                </v-btn>
                <h2 class="body-2 ma-0 pa-0">Items on the sale id: {{ this.sale.data.receipt }} </h2>
                <v-spacer></v-spacer>
                <h2 class="body-2 ma-0 pa-0">Served by: {{ sale.data.user.full_name }}</h2>
            </v-card-title>

            <template v-if="sale.data.details">
                <v-data-table
                        :headers="headers"
                        :items="sale.data.details.data"
                        class="elevation-1"
                >
                    <template v-slot:item.note="{ item }">
                        {{ item.prescription_note }}

                        <v-btn icon flat small>
                            <v-icon color="primary">print</v-icon>
                        </v-btn>
                    </template>

                    <template v-slot:footer>
                        <v-row >
                            <v-col cols="4">
                                <span>Total amount: </span><span class="font-weight-bold">
                                    Ksh. {{ sale.data.details.total }}
                                </span>
                            </v-col>
                            <v-col cols="3">
                                Customer name:  <span style="font-weight: bold">{{ sale.data.customer }}</span>
                            </v-col>
                            <v-col cols="5">
                                <v-btn small color="primary" v-if="can('inventory.make-pos-sales')" @click="pos.printBill(sale_id)">Print</v-btn>
                                <v-btn small color="primary" v-if="can('inventory.make-pos-sales')" @click="pos.printBillThermal(sale_id)">Print thermal</v-btn>
                                <v-btn small color="primary"
                                       :disabled="sale.data.status === 'paid' || sale.data.status === 'invoiced'"
                                       @click.once="processPayment()" v-if="can('inventory.receive-pos-payments')">Process payment</v-btn>
                            </v-col>
                        </v-row>
                    </template>
                </v-data-table>
            </template>
        </div>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Pos from '@inventory/libs/pos/Pos';

export default {
    props: [
        'sale_id',
    ],

    data: () => ({
        pos: new Pos(),
        headers: [
            { text: 'Product', value: 'product' },
            { text: 'Quantity', value: 'quantity' },
            { text: 'Price', value: 'price' },
            { text: 'Discount', value: 'discount' },
            { text: 'Round Up', value: 'round_up' },
            { text: 'Total', value: 'total' },
            { text: 'Note', value: 'note' },
        ],
    }),

    computed: {
        ...mapGetters({
            sale: 'getInventorySaleDetails',
        }),

        initialised() {
            return !!this.sale.data;
        },
    },

    watch: {
        sale(val) {
            if (val.data.station.is_pharmacy) {
                this.headers.push(
                    { text: 'Actions', value: '' },
                );
            }
        },
    },

    methods: {
        ...mapActions([
            'setInventorySaleDetails',
        ]),

        processPayment() {
            this.pos.processPayment(this.sale_id);
        },

        navigateBack() {
            window.history.go(-1);
        },
    },

    mounted() {
        this.setInventorySaleDetails({
            params: {
                sale_id: this.sale_id,
            },
        });
    },
};
</script>
