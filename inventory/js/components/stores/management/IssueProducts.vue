<template>
    <div>
        <collabmed-loading v-if="!initialised"></collabmed-loading>

        <v-card v-else>
            <v-card-title>
                <h2 class="subheading my-0 py-0">Issue products to another store</h2>
            </v-card-title>

            <v-divider class="my-0"></v-divider>

            <v-card-text>
                <form @submit.prevent="save()">
                    <v-row  class="mt-2">
                        <v-col cols="12" md="4">
                            <div class="mx-3">
                                <v-autocomplete
                                        outline clearable
                                        persistent-hint
                                        label="Receiving Store"
                                        :items="stores.data"
                                        item-text="name"
                                        item-value="id"
                                        v-model="dispatch.unordered.store_id"
                                ></v-autocomplete>
                            </div>
                        </v-col>

                        <v-col cols="12" md="4">
                            <div class="mx-3">
                                <store-products-search
                                        :storeId="storeId"
                                        @results="addStoreProduct"
                                ></store-products-search>
                            </div>
                        </v-col>
                    </v-row>

                    <v-row >
                        <v-col cols="12" class="table-form small">
                            <v-data-table :headers="headers"
                                          :items="dispatch.unordered.products"
                                          no-data-text="No items added yet"
                                          hide-default-footer
                            >
                                <template v-slot:item.dispatching="{ item }">
                                    <v-text-field
                                            type="number"
                                            v-model="item.quantity"
                                            solo flat
                                            :max="item.stock"
                                            :min="1"
                                    ></v-text-field>
                                </template>
                                <template v-slot:item.actions="{ item }">
                                    <v-btn icon class="pink--text" flat>
                                        <v-icon class="pink--text" small
                                                @click="removeItem(item)"
                                        >
                                            delete
                                        </v-icon>
                                    </v-btn>
                                </template>

                                <template slot="footer">
                                    <v-row  class="mt-4">
                                        <v-col cols="12" md="3" offset-md="9" class="text-right">
                                            <v-btn
                                                    type="submit"
                                                    class="blue caption"
                                                    :dark="!loading"
                                                    :loading="loading"
                                                    :disabled="loading"
                                                    large
                                            >
                                                Issue out items
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </template>
                            </v-data-table>
                        </v-col>
                    </v-row>
                </form>


            </v-card-text>
        </v-card>

        <br/><br/>

        <v-card flat class="mt-2">
            <v-card-title>
                <h2 class="subheading my-0 py-0">Listing of issued out activities</h2>
            </v-card-title>

            <v-divider class="my-0"></v-divider>
            <v-card-text>
                <v-data-table
                        :headers="order_headers" :items="orders.data"
                        class="mb-3" flat hide-default-footer
                >
                    <template v-slot:item.status="{ item }">{{ item.received_status ? "Received" : "not received yet" }}</template>
                    <template v-slot:item.actions="{ item }">
                        <v-btn
                                :to="`/inventory/stores/${storeId}/order/${item.id}`"
                                class="caption mx-0"
                                color="blue"
                                small dark
                        >
                            View
                        </v-btn>
                    </template>

                    <template slot="footer" v-if="orders.links">
                        <v-row  class="pt-3">
                            <v-col cols="4" class="mt-3 ml-3">
                                Total records: {{ orders.meta.total }}
                            </v-col>

                            <v-col cols="8" class="text-right">
                                <v-pagination
                                        v-model="page"
                                        :length="orders.meta.last_page"
                                        circle
                                        :total-visible="8"
                                ></v-pagination>
                            </v-col>
                        </v-row>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Dispatch from '@inventory/libs/stores/dispatches/Dispatch';
import InternalOrder from '@inventory/libs/stores/InternalOrder';
import { _ } from 'vue-underscore';
import StoreProductSearch from '@inventory/components/StoreProductsSearch';

export default {
    components: {
        'store-products-search': StoreProductSearch,
    },

    data: () => ({
        page: 1,
        dispatch: new Dispatch(),
        order: new InternalOrder(),
        loading: false,
        headers: [
            { text: 'product', value: 'name' },
            { text: 'Stock', value: 'stock' },
            { text: 'Dispatching', value: 'dispatching' },
            { text: 'Actions', value: 'actions' },
        ],
        order_headers: [
            { text: 'Id', value: 'order_number' },
            { text: 'Issued by', value: 'dispatched_by' },
            { text: 'Dispatching store', value: 'dispatching_store' },
            { text: 'Receiving store', value: 'requesting_store' },
            { text: 'Date', value: 'created_at' },
            { text: 'Status', value: 'status' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    computed: {
        ...mapGetters({
            stores: 'getStores',
            orders: 'getInternalOrders',
        }),

        storeId() {
            return this.$route.params.storeId;
        },

        initialised() {
            return this.stores ? true : false;
        },
    },

    methods: {
        ...mapActions([
            'setStores', 'setInternalOrders',
        ]),

        addStoreProduct(item) {
            const itemExistsInCart = _.findWhere(this.dispatch.unordered.products, { product_id: item.product_id });

            if (itemExistsInCart) {
                flash({
                    message: 'Item already selected',
                    alert: 'warning',
                });
                return;
            }

            this.dispatch.unordered.products.unshift({
                product_id: item.product_id,
                name: item.name,
                stock: item.quantity,
                quantity: 1,
                store_product_id: item.id,
            });
        },

        async save() {
            if (!this.dispatch.unordered.store_id || this.dispatch.unordered.products.length < 1 || this.dispatch.unordered.store_id === this.storeId ) {
                flash({
                    message: 'Something is wrong, ensure store is selected, products and you are not issuing to this store',
                    alert: 'warning',
                });
            } else {
                const response = await this.dispatch.issueOutProducts(this.storeId);

                if (response) {
                    this.dispatch.unordered.products = [];
                    this.dispatch.unordered.store_id = null;
                }
            }
        },

        async cancelOrder(item) {
            await this.order.cancelInternalOrder(item, this.storeId);
            await this.initialise();
        },

        initialise() {
            this.setInternalOrders({
                params: {
                    dispatching_store_id: this.storeId,
                    issuing_out: 1,
                },
            });
        },

        removeItem(item) {
            this.dispatch.unordered.products.splice(this.dispatch.unordered.products.indexOf(item), 1);
        },
    },

    mounted() {
        this.setStores();
        this.initialise();
    },
};
</script>

