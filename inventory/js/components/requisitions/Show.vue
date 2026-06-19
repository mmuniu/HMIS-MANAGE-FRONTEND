<template>
    <div>
        <div v-if="isRequisition">
            <activity-logs resource-type="requisitions"
                           :resource-id="requisitionId"
                           :activities="isRequisition.approvals">
            </activity-logs>
        </div>

        <collabmed-loading v-if="!isRequisition"></collabmed-loading>

        <v-card v-else>
            <v-card-text class="table-form">
                <v-data-table :headers="headers" :items="isRequisition.details"
                              no-data-text="No products added yet"
                >
                    <template v-slot:item.name="{ item }" >
                        <span v-if="item.product">{{ item.product.name }} </span>
                    </template>
                    <template v-slot:item.total ="{ item }">{{ item.quantity_requested * item.size }}</template>
                    <template v-slot:item.approved="{ item }">
                        <span v-if="isRequisition.status === 'rejected' || item.quantity_approved === 0" class="red--text">rejected</span>
                        <span v-else>{{ item.quantity_approved }}</span>
                    </template>
                    <template v-slot:item.approve="{ item }">
                        <v-text-field type="number" solo flat
                                      :disabled="isRequisition.has_lpo || isRequisition.status === 'approved' || isRequisition.status === 'rejected'"
                                      value="item.quantity_requested"
                                      @change="logEdit(item, $event)"
                                      v-model="requisition.details[item.id].quantity_approved"
                        ></v-text-field>
                    </template>
                    <template v-slot:item.actions="{ item }">
                        <v-btn icon small color="red"
                               :disabled="isRequisition.has_lpo || isRequisition.status === 'approved' || isRequisition.status === 'rejected'"
                               text @click="removeItem(item, index)">x</v-btn>
                    </template>

                    <template slot="footer">
                        <v-row  class="mt-4">
                            <v-col cols="12" md="6">
                                <p>
                                    <code>Requested by</code>
                                    <span class="body-2 font-weight-medium ml-2">{{ isRequisition.requestor.full_name }}</span>
                                </p>
                                <p v-if="isRequisition.approver_id">
                                    <code>Approved by </code>
                                    <span class="body-2 font-weight-medium ml-2" v-if="isRequisition.approver">{{ isRequisition.approver.full_name }}</span>
                                </p>
                            </v-col>
                            <v-col cols="12" md="6" class="text-right">

                                <v-dialog v-model="dialog" persistent max-width="40%"
                                          v-if="!isRequisition.has_lpo && isRequisition.status != 'approved'">
                                    <template v-slot:activator="{ on }">
                                        <v-btn color="primary" v-on="on"
                                               :disabled="isRequisition.status === 'rejected' || isRequisition.current_user === isRequisition.requestor.id">
                                            Approve Requisition
                                        </v-btn>
                                    </template>
                                    <v-card v-if="isRequisition.current_user != isRequisition.requestor.id">
                                        <v-card-title class="headline primary">Approve Requisition</v-card-title>
                                        <v-card-text>
                                            A brief summary of the actions carried out on the requisition
                                            <v-textarea
                                                    v-model="form_data.comment"
                                                    flat
                                                    outline
                                                    label="Comments"
                                                    color="purple"
                                                    hide-details
                                            ></v-textarea>

                                            <v-switch
                                                    v-model="form_data.mark_as_approved"
                                                    label="Mark the requisition as approved"
                                            ></v-switch>
                                        </v-card-text>

                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="error darken-1" @click="dialog = false">Cancel</v-btn>
                                            <v-btn color="primary darken-1" @click="approve()">Submit</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>

                                <v-dialog v-model="rejection_dialog" persistent max-width="40%" v-if="!isRequisition.has_lpo && isRequisition.status != 'approved'">
                                    <template v-slot:activator="{ on }">
                                        <v-btn color="error" v-on="on" v-if="isRequisition.status != 'rejected'">Reject requisition</v-btn>
                                        <v-btn  disabled v-if="isRequisition.status === 'rejected'">Requisition rejected</v-btn>
                                    </template>
                                    <v-card>
                                        <v-card-title class="headline primary">Reject Requisition</v-card-title>
                                        <v-card-text>
                                            Reason for rejection
                                            <v-textarea
                                                    v-model="rejection_reason"
                                                    flat
                                                    outline
                                                    label="Rejection reason"
                                                    color="purple"
                                                    hide-details
                                            ></v-textarea>
                                        </v-card-text>

                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="error darken-1" @click="rejection_dialog = false">Cancel</v-btn>
                                            <v-btn color="primary darken-1" @click="rejectRequisition()">Submit</v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>

                                <v-btn color="cyan" small disabled v-if="isRequisition.has_lpo">Can't be edited, has lpo already</v-btn>
                                <v-btn :href="`/inventory/requisitions/${isRequisition.id}/purchase-order/create`"
                                       v-if="!isRequisition.has_lpo && isRequisition.status === 'approved'"
                                       class="success">Generate Purchase Order</v-btn>
                            </v-col>
                        </v-row>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Requisition from "@inventory/libs/requisitions/Requisition";
import ActivityLogs from "@inventory/components/ActivityLogs";

export default {
    props: [
        "requisitionId",
    ],

    components: {
        "activity-logs": ActivityLogs,
    },

    data() {
        return {
            requisition: new Requisition(),
            formLoader: false,
            dialog: false,
            rejection_dialog: false,
            headers: [
                { text: "Product name", value: "name", sortable: false },
                { text: "Package size", value: "size", sortable: false },
                { text: "Requested", value: "quantity_requested", sortable: false },
                { text: "Total", value: "total", sortable: false },
                { text: "Approved", value: "approved", sortable: false },
                { text: "Approve", value: "approve", sortable: false },
                { text: "Actions", value: "actions", sortable: false },
            ],
            actionLogs: {},
            rejection_reason: "",
            form_data: {
                actionLogs: [],
                comment: null,
                mark_as_approved: false,
                removed: [],
            },
        };
    },

    watch: {
        submitted() {
            this.formLoader = false;
        },
    },

    computed: {
        isRequisition() {
            return this.requisition.isRequisition;
        },

        submitted() {
            return this.requisition.form.submitted;
        },
    },

    methods: {
        async rejectRequisition() {
            const response = await this.requisition.rejectRequisition(this.rejection_reason);

            if (response) {
                window.open("/inventory/requisitions", "_self");
            }
        },

        /*
            * remove item from list
            * */
        removeItem(item, index) {
            const message = "Removed "+ item.product.name + " from the requisition";

            this.pushAction(message, item.product.id, item.quantity_approved, item.id);

            this.form_data.removed.push(item.id);

            this.isRequisition.details.splice(index, 1);
        },

        /*
            * add the activity to action logs
            * */
        pushAction(message, product_id, quantity_approved, id) {
            if (this.form_data.actionLogs.some((log) => log.product_id === product_id)) {
                this.form_data.actionLogs.forEach((log) => {
                    if (log.product_id === product_id) {
                        log.message = message;
                        log.quantity_approved = quantity_approved;
                        log.id = id;
                    }
                });
            } else {
                this.form_data.actionLogs.push({
                    product_id: product_id,
                    message: message,
                    quantity_approved: quantity_approved,
                    id: id,
                });
            }
        },

        /*
            * track changes to actionlogs
            * */
        logEdit(item, event) {
            const message = "Changed quantities for " + item.product.name + " from " + item.quantity_requested + " to " + event;

            this.pushAction(message, item.product.id, event, item.id);
        },

        async approve() {
            this.formLoader = true;

            const response = await this.requisition.approve(this.requisitionId, this.form_data);

            if (response) {
                this.dialog = false;
                window.open("/inventory/requisitions", "_self");
            }
        },

        initializePage() {
            this.requisition.find(JSON.parse(this.requisitionId));
        },
    },

    created() {
        this.initializePage();
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
