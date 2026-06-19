<template>
    <div>
        <v-row >
            <v-col cols="12">
                <v-card>
                    <v-card-title>
                        <v-btn small color="primary" @click="$router.go(-1)">back</v-btn>
                        <v-spacer></v-spacer>
                    </v-card-title>
                    <v-card-text>
                        <v-row >
                            <v-col cols="12" md="3">
                                <div class="mx-3">
                                    <suppliers-search @results="setSupplier" :placeholder="supplier_placeholder"></suppliers-search>
                                </div>
                            </v-col>

                            <v-col cols="12" md="3">
                                <div class="mx-3">
                                    <payment-modes-search @results="setMode" :placeholder="payment_mode_placeholder"></payment-modes-search>
                                </div>
                            </v-col>

                            <v-col cols="12" md="3">
                                <div class="mx-3">
                                    <payment-terms-search @results="setPaymentTerm" :placeholder="payment_term_placeholder"></payment-terms-search>
                                </div>
                            </v-col>

                            <v-col cols="12" md="3">
                                <div class="mx-3">
                                    <collabmed-date-time-picker outline @input="setDeliveryDate" :datetime="purchaseOrder.delivery_date" dateOnly label="Delivery Date"></collabmed-date-time-picker>
                                </div>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12">
                                <div class="mx-3">
                                    <v-divider class="mt-0"></v-divider>
                                </div>
                            </v-col>

                            <v-col cols="12" md="4" v-if="!external">
                                <div class="mx-3">
                                    <products-search @results="productSelected"></products-search>
                                </div>
                            </v-col>

                            <v-col cols="12" md="5" :class="!external ? 'pl-6' : 0 ">
                                <div class="mx-3">
                                    <v-textarea label="comment" v-model="purchaseOrder.comment"></v-textarea>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>


        <!-- list of selected products -->
        <v-row >
            <v-col v-if="purchaseOrder.details.length > 0" class="table-form small">
                <v-card>
                    <v-card-title v-if="purchaseOrder.details.length > 15">
                        Selected products
                        <v-spacer></v-spacer>
                        <v-text-field
                                v-model="search"
                                append-icon="search"
                                label="Search"
                                single-line
                                hide-details
                        ></v-text-field>
                    </v-card-title>
                    <v-data-table :headers="headers" :items="purchaseOrder.details" :search="search">
                        <template v-slot:item.pack_size="{ item }">
                            <span>
                                <v-text-field
                                        v-model="item.pack_size"
                                        solo
                                        flat
                                        type="number"
                                        min="1"
                                        @input="purchaseOrder.adjustCalculations(item)"
                                        single-line
                                        height="2"
                                        hide-details
                                ></v-text-field>
                           </span>
                        </template>

                        <template v-slot:item.packs="{ item }">
                            <span>
                                <v-text-field
                                        v-model="item.packs"
                                        solo
                                        flat
                                        type="number"
                                        @input="purchaseOrder.adjustCalculations(item)"
                                        min="1"
                                        single-line
                                        height="2"
                                        hide-details
                                ></v-text-field>
                           </span>
                        </template>

                        <template v-slot:item.pack_cost="{ item }">
                            <span>
                                    <v-text-field
                                            v-model="item.pack_cost"
                                            solo
                                            flat
                                            type="number"
                                            @input="purchaseOrder.adjustCalculations(item)"
                                            min="1"
                                            single-line
                                            height="2"
                                            hide-details
                                    ></v-text-field>
                               </span>
                        </template>

                        <template v-slot:item.actions="{ item }">
                            <v-btn icon color="red" text @click="purchaseOrder.removeItem(item)" small>
                                X
                            </v-btn>
                        </template>

                        <template v-slot:no-results>
                            <v-alert :value="true" color="error" icon="warning">
                                Your search for "{{ search }}" found no results.
                            </v-alert>
                        </template>

                        <template slot="footer">
                            <v-row  >
                                <v-col cols="8">
                                    <h2 class="mt-4 body-2 subheading grey-text text-darken-2 pl-3 ma-0">
                                        GRAND TOTAL: {{ purchaseOrder.getGrandTotal() }}
                                    </h2>
                                </v-col>
                                <v-col cols="4" class="text-right">
                                    <v-btn class="blue caption white--text" @click="save()" large>
                                        <span v-if="purchaseOrder.editing">Update purchase order</span>
                                        <span v-else>confirm purchase order</span>
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </template>
                    </v-data-table>
                </v-card>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { _ } from 'vue-underscore';
import PurchaseOrder from '@inventory/libs/purchase_orders/PurchaseOrder';
import ProductSearch from '@inventory/components/ProductsSearch';
import SuppliersSearch from '@inventory/components/searches/Suppliers';
import PaymentModesSearch from '@inventory/components/searches/PaymentModes';
import PaymentTermsSearch from '@inventory/components/searches/PaymentTerms';
import { mapGetters, mapActions } from 'vuex';

export default {
    name: 'purchase-orders-create',

    props: [
        'selectedProducts', 'external', 'storeId',
    ],

    components: {
        'products-search': ProductSearch,
        'suppliers-search': SuppliersSearch,
        'payment-modes-search': PaymentModesSearch,
        'payment-terms-search': PaymentTermsSearch,
    },

    data() {
        return {
            orderDialog: false,
            search: '',
            purchaseOrder: new PurchaseOrder(),
            headers: [
                { text: 'Name', value: 'name' },
                { text: 'Pack Size', value: 'pack_size' },
                { text: 'Packages', value: 'packs' },
                { text: 'Quantity', value: 'quantity' },
                { text: 'Package Cost  ', value: 'pack_cost' },
                { text: 'Previous unit cost  ', value: 'cost' },
                { text: 'Unit Cost  ', value: 'unit_cost' },
                { text: 'Total  ', value: 'total' },
                { text: 'Actions  ', value: 'actions' },
            ],
            payment_term_placeholder: '',
            payment_mode_placeholder: '',
            supplier_placeholder: '',
        };
    },

    watch: {
        selectedProducts(val) {
            if (val) {
                val.forEach((product) => {
                    this.productSelected(product);
                });
            }
        },

        purchaseOrders(val) {
            const order = val.data[0];

            this.payment_term_placeholder = order.payment_term;
            this.payment_mode_placeholder = order.payment_mode;
            this.supplier_placeholder = order.supplier.name;

            this.purchaseOrder.assemble(order);
        },
    },

    computed: {
        ...mapGetters({
            purchaseOrders: 'getPurchaseOrders',
        }),
    },

    methods: {
        ...mapActions([
            'setPurchaseOrders',
        ]),

        setSupplier(supplier) {
            this.purchaseOrder.supplier_id = supplier.id;
        },

        setMode(mode) {
            this.purchaseOrder.payment_mode_id = mode.id;
        },

        setPaymentTerm(term) {
            this.purchaseOrder.payment_term_id = term.id;
        },

        setDeliveryDate(date) {
            this.purchaseOrder.delivery_date = date;
        },

        async save() {
            const response = await this.purchaseOrder.save();

            if (!response.errors) {
                window.open('/inventory/purchase-orders', '_self');

                this.$emit('orderPlaced');
            }
        },

        productSelected(product, product_id = null) {
            const productId = product_id ? product_id : product.product_id ? product.product_id : product.id;

            const item ={
                name: product.name,
                pack_size: 1,
                packs: 1, // packages
                quantity: 1,
                pack_cost: 1,
                unit_cost: 1,
                cost: product.cost ? product.cost : 0,
                total: 1,
                product_id: productId
            };

            const check = _.find(this.purchaseOrder.details, item);

            if (check) {
                flash({
                    'message': 'product already in the list',
                    'alert': 'error',
                });
            } else {
                this.purchaseOrder.details.unshift(item);
            }
        },
    },

    mounted() {
        if (this.storeId) {
            this.purchaseOrder.store_id = this.storeId;
        }

        if (this.$route.query.edit && this.$route.query.order) {
            this.purchaseOrder.editing = true;
            this.purchaseOrder.purchase_order_id = this.$route.query.order;

            this.setPurchaseOrders({
                params: {
                    id: this.purchaseOrder.purchase_order_id,
                },
            });
        }

        if (this.selectedProducts != null) {
            if (this.selectedProducts.length > 0) {
                this.selectedProducts.forEach((product) => {
                    this.productSelected(product, product.product_id);
                });
            }
        }
    },
};
</script>

<style scoped>

</style>
