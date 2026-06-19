<template>
    <collabmed-loading v-if="!isRequisition"></collabmed-loading>

    <v-card v-else>
        <br/>
        <v-row  class="ma-2">
            <v-col md="3" class="mx-3">
                <suppliers-search @results="setSupplier"></suppliers-search>
            </v-col>

            <v-col md="2" class="mx-2">
                <payment-modes-search @results="setMode"></payment-modes-search>
            </v-col>

            <v-col md="3" class="mx-2">
                <payment-terms-search @results="setPaymentTerm"></payment-terms-search>
            </v-col>

            <v-col md="3" class="mx-2">
                <collabmed-date-time-picker outline @input="setDeliveryDate" :datetime="lpo.delivery_date" dateOnly label="Delivery Date"></collabmed-date-time-picker>
            </v-col>

        </v-row>
        <v-card-text class="table-form">


            <v-data-table :headers="headers" :items="isRequisition.details"
                          no-data-text="No products added yet" hide-default-footer
            >
                <template v-slot:item.total_quantity="{ item }">{{ item.quantity_requested * item.size }}</template>
                <template v-slot:item.cost="{ item }">
                    <v-text-field type="number" solo flat
                                  v-model="item.cost"
                                  @input="updateTotal()">
                    </v-text-field>
                </template>
                <template v-slot:item.total_cost="{ item }">
                    <span v-if="item.cost"> {{ parseInt(item.quantity_approved) * parseInt(item.cost) }}</span>
                </template>

                <template slot="footer">
                    <v-row  class="mt-4">
                        <v-col cols="12" md="6">
                                <span class="mr-2">
                                    <code>Requested by</code>
                                    <span class="body-2 font-weight-medium ml-2">{{ isRequisition.requestor.full_name }}</span>
                                </span>
                            <span class="mr-2" v-if="isRequisition.approver_id">
                                    <code>Approved by </code>
                                    <span class="body-2 font-weight-medium ml-2" v-if="isRequisition.approver">{{ isRequisition.approver.full_name }}</span>
                                </span>

                            <span class="mr-2">
                                    <code>Grand Total</code>
                                    <span class="body-2 font-weight-medium ml-2">{{ lpo.total }}</span>
                                </span>
                        </v-col>
                        <v-col cols="12" md="6" class="text-right">
                            <v-btn color="primary"
                                   :disabled="lpo.total <= 0 || !isNumber(lpo.total)"
                                   @click="generatePurchaseOrder()">
                                Generate purchase order
                            </v-btn>
                        </v-col>
                    </v-row>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
import Requisition from "@inventory/libs/requisitions/Requisition";
import SuppliersSearch from "@inventory/components/searches/Suppliers";
import PaymentModesSearch from "@inventory/components/searches/PaymentModes";
import PaymentTermsSearch from "@inventory/components/searches/PaymentTerms";

export default {
    props: [
        "requisition_id",
    ],

    components: {
        "suppliers-search": SuppliersSearch,
        "payment-modes-search": PaymentModesSearch,
        "payment-terms-search": PaymentTermsSearch,
    },

    data: () => ({
        requisition: new Requisition(),
        formLoader: false,
        headers: [
            { text: "Product name", value: "product.name", sortable: false },
            { text: "Package size", value: "size", sortable: false },
            { text: "Requested", value: "quantity_requested", sortable: false },
            { text: "Total Quantity", value: "total_quantity", sortable: false },
            { text: "Approved", value: "quantity_approved", sortable: false },
            { text: "Unit Cost", value: "cost", sortable: false },
            { text: "Total cost", value: "total_cost", sortable: false },
        ],
        lpo: {
            requisition_id: null,
            supplier_id: null,
            payment_mode_id: null,
            payment_term_id: null,
            delivery_date: "",
            details: [],
            total: 0,
        },
    }),

    computed: {
        isRequisition() {
            return this.requisition.isRequisition;
        },
    },

    methods: {
        initialize() {
            this.requisition.find(JSON.parse(this.requisition_id));
            this.lpo.requisition_id = this.requisition_id;
        },

        async generatePurchaseOrder() {
            if (this.lpo.supplier_id) {
                this.lpo.details = this.getLpoDetails();

                const response = await this.requisition.generatePurchaseOrder(this.lpo);

                if (response) {
                    window.open("/inventory/purchase-orders", "_self");
                }
            } else {
                flash({
                    message: "please select the supplier",
                    alert: "error",
                });
            }
        },

        isNumber(n) {
            return !isNaN(parseFloat(n)) && !isNaN(n - 0);
        },

        getLpoDetails() {
            return _.map(this.isRequisition.details, function(requisition) {
                if (requisition.cost) {
                    return {
                        product_id: requisition.product.id,
                        quantity: requisition.quantity_approved,
                        total: requisition.cost * requisition.quantity_approved,
                        pack_size: requisition.size,
                        packs: requisition.quantity_approved,
                        cost: requisition.cost,
                        unit_cost: requisition.cost,
                    };
                }
            });
        },

        updateTotal() {
            const vm = this;
            vm.lpo.total = 0;

            _.each(this.isRequisition.details, function(requisition) {
                if (_.has(requisition, "cost")) {
                    vm.lpo.total = parseInt(vm.lpo.total) + (parseInt(requisition.cost) * requisition.quantity_approved);
                }
            });
        },

        setSupplier(supplier) {
            this.lpo.supplier_id = supplier.id;
        },

        setMode(mode) {
            this.lpo.payment_mode_id = mode.id;
        },

        setPaymentTerm(term) {
            this.lpo.payment_term_id = term.id;
        },

        setDeliveryDate(date) {
            this.lpo.delivery_date = date;
        },
    },

    mounted() {
        this.initialize();
    },
};
</script>
