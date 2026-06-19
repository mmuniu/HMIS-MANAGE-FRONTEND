<template>
    <v-card flat>

        <collabmed-loading v-if="!initialised"></collabmed-loading>

        <v-card-title v-else>

            <v-btn small color="primary" @click="$router.go(-1)">back</v-btn>

            <supplier-profile-details v-if="initialised"
                                      :supplier="purchaseOrder.supplier">
            </supplier-profile-details>

            <v-spacer></v-spacer>

            <v-text-field v-model="search"
                          append-icon="search"
                          class="mr-3"
                          label="Search"
                          single-line hide-details>
            </v-text-field>
        </v-card-title>

        <v-row v-if="initialised">
            <v-col cols="12" class="text-right mr-4">
                <v-dialog
                          v-model="order.dialog"
                          persistent max-width="40%"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn small class="mr-3"
                               color="primary"
                               :disabled="order.details.length < 1"
                               v-if="purchaseOrder.can_receive"
                               v-on="on">
                            Receive goods
                        </v-btn>
                    </template>
                    <v-card>
                        <v-card-title class="headline primary">Receive goods</v-card-title>
                        <v-card-text>
                            This will update the purchase order status as received and
                            adjust the store quantities accordingly.
                            <v-textarea
                                    v-model="order.comment"
                                    flat
                                    outline
                                    label="Comments"
                                    color="purple"
                                    hide-details
                            ></v-textarea>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error darken-1" @click="order.dialog = false">Cancel</v-btn>
                            <v-btn color="primary darken-1" @click.once="receiveSelectedItems()">Okay</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

               <!-- <v-btn small color="primary"
                       v-if="purchaseOrder.status === 'Received'"
                       @click="order.printGoodsReceived(purchaseOrder.id)"
                       class="white&#45;&#45;text mr-3">
                    Print Goods Received Note
                </v-btn>-->

                <v-btn small color="warning"
                       class="mr-3"
                       :disabled="purchaseOrder.status == 'Pending' || purchaseOrder.status == 'Partially approved'"
                       @click="order.printOrder(purchaseOrder.id)">
                    print Order
                </v-btn>
                <!--<v-btn small class="lime darken-2 white&#45;&#45;text mr-3"
                       @click="order.printRequisition(purchaseOrder.id)">
                    Print requisition
                </v-btn>-->
            </v-col>
        </v-row>


        <v-card-text>
            <collabmed-loading v-if="!initialised"></collabmed-loading>
            <v-data-table v-else  v-model="order.details"
                          :headers="headers"
                          item-key="id"
                          show-select
                          :items="purchaseOrder.details"
                          :search="search">
                    <template v-slot:item.delivered="{ item }">
                        <v-text-field
                                v-model="item.delivered"
                                solo
                                style="border: 1px solid rgba(0, 0, 0, 0.3); width: 120px"
                                flat
                                :disabled="checkValidity(item) || !order.details.includes(item)"
                                type="number"
                                @input="order.updateGoodsReceived(item)"
                                :min="1"
                                :max="item.receiving"
                                single-line
                                hide-details
                        ></v-text-field>
                    </template>
                    <template v-slot:item.bonus="{ item }">
                        <v-text-field
                                v-model="item.bonus"
                                solo
                                style="border: 1px solid rgba(0, 0, 0, 0.3); width: 120px;"
                                flat
                                :disabled="checkValidity(item) || !order.details.includes(item)"
                                type="number"
                                @input="order.updateGoodsReceived(item)"
                                :min="1"
                                single-line
                                hide-details
                        ></v-text-field>
                    </template>
                    <template v-slot:item.discount="{ item }">
                        <v-text-field
                                v-model="item.discount"
                                solo
                                style="border: 1px solid rgba(0, 0, 0, 0.3); width: 120px;"
                                flat
                                :disabled="checkValidity(item) || !order.details.includes(item)"
                                type="number"
                                @input="order.updateGoodsReceived(item)"
                                :min="1"
                                single-line
                                hide-details
                        ></v-text-field>
                    </template>

                    <template v-slot:item.tax="{ item }">
                        <v-text-field
                                v-model="item.tax"
                                solo
                                style="border: 1px solid rgba(0, 0, 0, 0.3); width: 120px;"
                                flat
                                :disabled="checkValidity(item) || !order.details.includes(item)"
                                type="number"
                                @input="order.updateGoodsReceived(item)"
                                :min="1"
                                single-line
                                hide-details
                        ></v-text-field>
                    </template>

                    <template v-slot:item.expiry_date="{ item }">
                        <collabmed-date-time-picker outlined
                                                    solo
                                                    @input="setExpiryDate(item, $event)"
                                                    :disabled="checkValidity(item) || !order.details.includes(item)"
                                                    hide-details
                                                    :datetime="item.expiry_date" dateOnly label="Expiry date">
                        </collabmed-date-time-picker>
                    </template>
                <template v-slot:no-results>
                    <v-alert :value="true" color="error" icon="warning">
                        Your search for "{{ search }}" found no results.
                    </v-alert>
                </template>

                <template slot="footer">
                    <td colspan="100%">
                        <v-row  class="py-2 pb-2">
                            <v-col cols="8" >
                                Total Cost:
                                <span v-if="purchaseOrder.status === 'Pending'">{{ order.getGrandTotal() }}</span>
                                <span v-if="purchaseOrder.status === 'Received'">{{ purchaseOrder.total }}</span>
                            </v-col>
                            <v-col cols="3" class="text-right">

                            </v-col>
                        </v-row>
                    </td>
                </template>
            </v-data-table>

            <!--<div v-if="purchaseOrder">
                <v-row v-if="purchaseOrder.status != 'Received' || purchaseOrder.status != 'Approved'">
                    <v-col cols="12" class="text-right">
                        <v-btn color="primary" :disabled="purchaseOrder.current_user == purchaseOrder.user.id" @click="approveLpo()">approve lpo</v-btn>
                    </v-col>
                </v-row>
            </div>-->
        </v-card-text>
    </v-card>
</template>
<script>
import { mapGetters, mapActions } from 'vuex';
import { _ } from 'vue-underscore';
import Order from '@inventory/libs/purchase_orders/PurchaseOrder';

export default {
    props: [
        'purchaseid',
    ],

    data: () => ({
        search: '',
        order: new Order(),
        headers: [
            { text: 'Product', value: 'product.name' },
            { text: 'Pack size', value: 'pack_size' },
            { text: 'Ordered Quantity', value: 'packs' },
            { text: 'Delivered', value: 'delivered' },
            { text: 'Bonus', value: 'bonus' },
            { text: 'Discount', value: 'discount' },
            { text: 'Tax', value: 'tax' },
            { text: 'Expiry date', value: 'expiry_date' },
            { text: 'Receiving', value: 'receiving' },
            { text: 'Unit cost', value: 'unit_cost' },
            { text: 'Price', value: 'price' },
        ],
    }),

    computed: {
        ...mapGetters([
            'getPurchaseOrders',
        ]),

        purchaseOrder() {
            if (this.getPurchaseOrders) {
                return _.head(this.getPurchaseOrders.data);
            } else {
                return null;
            }
        },

        purchaseOrderId() {
            return JSON.parse(this.purchaseid);
        },

        initialised() {
            const self = this;

            if (self.purchaseOrder) {
                self.order.store_id = this.purchaseOrder.store_id;

                return true;
            } else {
                return false;
            }
        },
    },

    methods: {
        ...mapActions([
            'setPurchaseOrders',
        ]),

        checkValidity(item) {
            if (item.received_quantity == item.packs) {
                return true;
            }
        },

        setExpiryDate(item, $event) {
            const index = this.order.details.indexOf(item);
            this.order.details[index].expiry_date = $event;
        },

        async approveLpo() {
            window.open(`/inventory/purchase-orders/${this.purchaseOrderId}/approve`, '_self');
        },

        async receiveSelectedItems() {
            const response = await this.order.receiveGoods();

            if (response) {
                /* this.setPurchaseOrders({
                    params: {
                        id: this.purchaseOrderId,
                    },
                });*/
                window.location.reload();
            }
        },
    },

    mounted() {
        this.order.purchase_order_id = this.purchaseOrderId;
        this.setPurchaseOrders({
            params: {
                id: this.purchaseOrderId,
            },
        });
    },
};
</script>
