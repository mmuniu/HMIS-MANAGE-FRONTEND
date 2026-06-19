<template>
    <v-card v-if="initialised">
        <v-card-title>
            <h2 class="subheading my-0 py-0">Make an internal order</h2>
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
                                    label="Dispatching store"
                                    :items="stores"
                                    item-text="name"
                                    item-value="id"
                                    v-model="order.dispatching_store"
                                    :error="errors.has('dispatching_store')"
                                    :hint="errors.get('dispatching_store')"
                                    @change="storeChanged()"
                            ></v-autocomplete>
                        </div>
                    </v-col>

                    <v-col cols="12" md="4">
                        <div class="mx-3">
                            <v-menu
                                    ref="delivery"
                                    :close-on-content-click="false"
                                    v-model="order.meta.delivery_date"
                                    :return-value.sync="order.delivery_date"
                                    transition="scale-transition"
                                    min-width="290px"
                            >
                               <template v-slot:activator="{ on }">
                                   <v-text-field
                                           v-on="on"
                                           flat outline
                                           v-model="order.delivery_date"
                                           label="Delivery date"
                                           readonly :error="errors.has('delivery_date')"
                                           :hint="errors.get('delivery_date')"
                                           persistent-hint @change="errors.clear('delivery_date')"
                                   ></v-text-field>
                               </template>

                                <v-date-picker v-model="order.delivery_date" scrollable>
                                    <v-spacer></v-spacer>
                                    <v-btn flat color="primary" @click="order.meta.delivery_date = false">Cancel</v-btn>
                                    <v-btn flat color="primary" @click="$refs.delivery.save(order.delivery_date)">OK</v-btn>
                                </v-date-picker>
                            </v-menu>
                        </div>
                    </v-col>

                    <v-col cols="12" md="4">
                        <div class="mx-3">
                            <store-products-search
                                    v-if="order.dispatching_store"
                                    :storeId="order.dispatching_store"
                                    @results="addItemToCart"
                                    unDisableOutOfStock
                            ></store-products-search>
                        </div>
                    </v-col>
                </v-row>

                <v-row >
                    <v-col cols="12" class="table-form small">
                        <v-data-table :headers="order.meta.headers"
                                      :items="order.items"
                                      no-data-text="No items added yet"
                                      hide-default-footer
                        >
                            <template v-slot:item.quantity="{ item }">
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
                                            @click="order.removeFromCart(item)"
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
                                            Make an order
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
</template>

<script>
import _ from 'lodash';
import { mapActions, mapGetters } from 'vuex';
import InternalOrder from '@inventory/libs/stores/InternalOrder';
import StoreProductSearch from '@inventory/components/StoreProductsSearch';

export default {
    name: 'InternalOrdersCreate',

    props: [
        'userId',
    ],

    components: {
        'store-products-search': StoreProductSearch,
    },

    data() {
        return {
            order: new InternalOrder(),
            stores: null,
            loading: false,
        };
    },

    watch: {
        getStores({ data }) {
            this.stores = _.filter(data, (store) => {
                return store.id !== this.storeId;
            });
        },

        submitted(value) {
            if (value) {
                this.loading = false;
                this.order.form.submitted = false;
                this.setInternalOrders({
                    params: {
                        requesting_store: this.storeId,
                    },
                });
            }
        },

        contaminated(value) {
            if (value) {
                this.loading = false;
                this.order.form.errorDetected = false;
            }
        },
    },

    computed: {
        ...mapGetters([
            'getStores', 'getStoreProducts',
        ]),

        storeId() {
            return parseInt(this.$route.params.storeId);
        },

        initialised() {
            return this.stores;
        },

        errors() {
            return this.order.form.errors;
        },

        submitted() {
            return this.order.form.submitted;
        },

        contaminated() {
            return this.order.form.errorDetected;
        },
    },

    methods: {
        ...mapActions([
            'setStores', 'setStoreProducts', 'setInternalOrders',
        ]),

        storeChanged() {
            this.validateStoreState();
            this.errors.clear('dispatching_store');
            this.order.items = [];
        },

        validateStoreState() {
            const vm = this;
            const store = _.find(this.stores, function(store) {
                return store.id === vm.order.dispatching_store;
            });

            if (store.stock_taking) {
                flash({
                    message: store.name + ' has an active stock take',
                    alert: 'error',
                });
                vm.order.dispatching_store = null;
            }
        },

        initialise() {
            this.setStores();
            this.order.ordered_by = this.userId;
            this.order.requesting_store = this.storeId;
        },

        addItemToCart(product) {
            this.order.addToCart(product);

            // if (!this.order.dispatching_store) {
            //     flash ({
            //         message: "Please select a store first",
            //         alert: "red"
            //     });
            //     return;
            // }
            // this.order.meta.selectedProduct = product;
            // this.setStoreProducts({
            //     params: {
            //         store_id: this.order.dispatching_store,
            //         product_id: product.id
            //     }
            // });
        },

        save() {
            if (!this.loading) {
                this.loading = true;
                this.order.store(this.storeId);
            }
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>
