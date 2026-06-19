<template>
    <div>
       <div v-if="purchaseOrder.data">
           <activity-logs resource-type="purchase-orders"
                          :resource-id="purchaseOrderId"
                          :activities="approvals">
           </activity-logs>
       </div>

        <v-card flat>
            <collabmed-loading v-if="!purchaseOrder.data"></collabmed-loading>

            <v-card-text v-else>

                <v-data-table :headers="headers"
                              :items="purchaseOrderDetails"
                              no-data-text="No products added yet"
                >
                    <template v-slot:item.name="{ item }">
                        <span v-if="item.product">{{ item.product.name }} </span>
                    </template>

                    <template v-slot:item.quantity="{ item }">
                        <span>
                            <v-text-field
                                    solo
                                    flat
                                    type="number"
                                    @change="logEdit(item, $event)"
                                    min="1"
                                    style="border: 1px solid #d6d6d6; margin: 5px 0"
                                    v-model="item.quantity"
                                    single-line
                                    height="2"
                                    hide-details
                            ></v-text-field>
                       </span>
                    </template>

                    <template v-slot:item.unit_cost="{ item }">

                        <v-text-field
                                solo
                                flat
                                type="number"
                                @change="logPriceChange(item, $event)"
                                min="1"
                                style="border: 1px solid #d6d6d6; margin: 5px 0"
                                v-model="item.unit_cost"
                                single-line
                                height="2"
                                hide-details
                        ></v-text-field>
                    </template>

                    <template v-slot:item.total="{ item }">
                        {{ (item.unit_cost * item.quantity) | numberFormat }}
                    </template>

                    <template v-slot:item.actions="{ item }">
                        <!--v-if="!item.trashed"-->
                        <v-btn  icon small color="red" @click="removeItem(item)">
                            <v-icon>cancel</v-icon>
                        </v-btn>
                        <!-- <v-btn v-else icon small color="prirmary" flat @click="undoDelete(item)">
                             <v-icon>undo</v-icon>
                         </v-btn>-->
                    </template>
                </v-data-table>

                <v-row>
                    <v-col>
                        <div  v-if="purchaseOrder">
                            <h4>Comments:</h4>

                            {{ purchaseOrder.data[0].comment }}
                        </div>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col cols="6a">
                        <finance-cash-outs :resource-id="purchaseOrder.data[0].id"
                                           :resource="purchaseOrder.data[0].cash_out"
                                           money-for="purchase-order"
                                           @recorded="cashRecorded"></finance-cash-outs>
                    </v-col>
                    <v-col>
                        <v-dialog v-model="dialog" persistent
                                  v-if="purchaseOrder.data[0].status == 'Pending' || purchaseOrder.data[0].status == 'Partially approved'"
                                  max-width="40%" >

                            <template v-slot:activator="{ on }">
                                <v-btn color="primary"
                                       :disabled="!canApproveLpo(purchaseOrder)"
                                       v-on="on">Approve Lpo</v-btn>
                            </template>

                            <v-card v-if="canApproveLpo(purchaseOrder)">
                                <v-card-title class="headline primary">Approve purchase order</v-card-title>
                                <v-card-text>
                                    A brief summary of the reasons as to the actions carried out on the purchase order
                                    <v-textarea
                                            v-model="lpoApproval.comment"
                                            flat
                                            outline
                                            label="Comments"
                                            color="purple"
                                            hide-details
                                    ></v-textarea>

                                    <v-switch
                                            v-model="lpoApproval.mark_as_approved"
                                            label="Mark the purchase order as approved"
                                    ></v-switch>
                                </v-card-text>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="error darken-1" @click="dialog = false">Cancel</v-btn>
                                    <v-btn color="primary darken-1" @click="approveLpo()">Submit</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>


                        <v-dialog v-model="rejectDialog" persistent
                                  v-if="purchaseOrder.data[0].status == 'Pending' || purchaseOrder.data[0].status == 'Partially approved'"
                                  max-width="40%">
                            <template v-slot:activator="{ on }">
                                <v-btn color="error" :disabled="!canApproveLpo(purchaseOrder)" v-on="on">reject</v-btn>
                            </template>
                            <v-card v-if="canApproveLpo(purchaseOrder)">
                                <v-card-title class="headline error">Reject purchase order</v-card-title>
                                <v-card-text>
                                    A brief summary of the reasons as to the actions carried out on the purchase order
                                    <v-textarea
                                            v-model="lpoApproval.comment"
                                            flat
                                            outline
                                            label="Comments"
                                            color="purple"
                                            hide-details
                                    ></v-textarea>
                                </v-card-text>

                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="error darken-1" @click="rejectDialog = false">Cancel</v-btn>
                                    <v-btn color="primary darken-1" @click="rejectLpo()">Submit</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>
                    </v-col>

                    <v-col class="text-right mr-5">
                        <span class="mr-2">
                            <code>Grand Total</code>
                            <span class="body-2 font-weight-medium ml-2">{{ getTotal()  | numberFormat }}</span>
                        </span>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Order from '@inventory/libs/purchase_orders/PurchaseOrder';
import ActivityLogs from '@inventory/components/ActivityLogs';

export default {
    props: [
        'purchaseId',
    ],

    components: {
        'activity-logs': ActivityLogs,
    },

    data: () => ({
        order: new Order(),
        dialog: false,
        issueMoneyDialog: false,
        rejectDialog: false,
        lpoApproval: {
            actionLogs: [],
            comment: null,
            mark_as_approved: false,
            removed: [],
        },
        headers: [
            { text: 'Product name', value: 'name', sortable: false },
            { text: 'Pack size', value: 'pack_size', sortable: false },
            { text: 'Packages', value: 'quantity', sortable: false },
            { text: 'Unit cost', value: 'unit_cost', sortable: false },
            { text: 'Total', value: 'total', sortable: false },
            { text: 'Actions', value: 'actions', sortable: false },
        ],
    }),

    computed: {
        ...mapGetters({
            purchaseOrder: 'getPurchaseOrders',
        }),

        purchaseOrderDetails() {
            return this.purchaseOrder.data[0].details;
        },

        approvals() {
            return this.purchaseOrder.data[0].approvals;
        },

        purchaseOrderId() {
            return JSON.parse(this.purchaseId);
        },
    },

    methods: {
        ...mapActions([
            'setPurchaseOrders',
        ]),

        canApproveLpo(purchaseOrder) {
            if(this.msetting('inventory.can_approve_own_order')) {
                return true;
            } else {
                return  purchaseOrder.data[0].current_user != purchaseOrder.data[0].user.id
            }
        },

        removeItem(item) {
            const message = 'Removed '+ item.product.name + ' from the purchase order';

            this.pushAction(message, item.product.id, item.quantity, item.id);

            this.lpoApproval.removed.push(item.id);

            this.purchaseOrderDetails.splice(_.indexOf(this.purchaseOrderDetails, item), 1);
        },

        pushAction(message, product_id, quantity_approved = null, id, unit_cost = null) {
            if (this.lpoApproval.actionLogs.some((log) => log.product_id === product_id)) {
                this.lpoApproval.actionLogs.forEach((log) => {
                    if (log.product_id === product_id) {
                        log.message = message;
                        log.quantity_approved = quantity_approved;
                        log.id = id;
                        log.unit_cost = unit_cost;
                    }
                });
            } else {
                this.lpoApproval.actionLogs.push({
                    product_id: product_id,
                    message: message,
                    quantity_approved: quantity_approved,
                    id: id,
                    unit_cost: unit_cost,
                });
            }

            this.getTotal();
        },

        getTotal() {
            let total = 0;

            _.map(this.purchaseOrderDetails, (item) => {
                total += (item.unit_cost * item.quantity);
            });

            return total;
        },

        logEdit(item, event) {
            const message = 'Changed quantities for ' + item.product.name + ' from ' + item.requested + ' to ' + event;

            this.pushAction(message, item.product.id, item.quantity, item.id);
        },

        logPriceChange(item, event) {
            const message = 'Changed unit cost for ' + item.product.name + ' from ' + item.initial_unit_cost + ' to ' + event;

            this.pushAction(message, item.product.id, item.quantity, item.id, item.unit_cost);
        },

        async approveLpo() {
            this.formLoader = true;

            const response = await this.order.approveLpo(this.purchaseOrderId, this.lpoApproval);

            if (response) {
                this.dialog = false;
                window.open('/inventory/purchase-orders', '_self');
            }
        },

        async rejectLpo() {
            this.formLoader = true;

            const response = await this.order.rejectLpo(this.purchaseOrderId, this.lpoApproval);

            if (response) {
                this.rejectDialog = false;
                window.open('/inventory/purchase-orders', '_self');
            }
        },

        fetchLpo() {
            this.setPurchaseOrders({
                params: {
                    id: this.purchaseOrderId,
                },
            });
        },

        cashRecorded() {
            this.fetchLpo();
        },
    },

    mounted() {
        this.fetchLpo();
    },
};
</script>
<style lang="scss">
    .table-form{
        .v-text-field.v-text-field--solo .v-input__control {
            margin-top: 7px;
            min-height: 40px;
        }

        .v-text-field.v-text-field--enclosed .v-input__slot, .v-text-field.v-text-field--enclosed .v-text-field__details {
            border: 1px solid #ddd;
            width: 150px;
        }

        .v-text-field.v-text-field--enclosed .v-text-field__details {
            display: none;
        }
    }
</style>
