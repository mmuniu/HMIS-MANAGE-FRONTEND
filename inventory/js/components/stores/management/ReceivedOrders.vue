<template>
    <v-card v-if="initialised">
        <v-card-title>
            <h2 class="subheading my-0 py-0">Orders received from other stores</h2>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-row class="mx-2">
                <v-col cols="6">
                    <v-autocomplete
                            outline clearable
                            label="Store"
                            :items="getStores.data"
                            item-text="name"
                            item-value="id"
                            v-model="params.requesting_store"
                    ></v-autocomplete>
                </v-col>

                <v-col cols="3">
                    <v-switch label="show dispatched orders" v-model="params.order_dispatched"></v-switch>
                </v-col>

                <v-col cols="2">
                    <v-btn small color="primary" @click="filter()">filter</v-btn>
                    <v-btn small color="warning" @click="clearFilters()">clearFilters</v-btn>
                </v-col>
            </v-row>

            <v-data-table
                    :headers="orders.headers" :items="orders.data"
                    class="mb-3" flat hide-default-footer
            >
                <template v-slot:item.order_nuber="{ item }" :class="{ 'blue-grey lighten-3' : item.status === 'dispatched'}"
                          class="py-3">{{ item.order_number }}
                </template>
                <template v-slot:item.ordered_by="{ item }" :class="{ 'blue-grey lighten-3' : item.status === 'dispatched'}">
                    {{ item.ordered_by }}
                </template>
                <template v-slot:item.dispatching_store="{ item }" :class="{ 'blue-grey lighten-3' : item.status === 'dispatched'}">
                    {{ item.dispatching_store }}
                </template>
                <template v-slot:item.requesting_store="{ item }" :class="{ 'blue-grey lighten-3' : item.status === 'dispatched'}">
                    {{ item.requesting_store }}
                </template>
                <template v-slot:item.order_date="{ item }" :class="{ 'blue-grey lighten-3' : item.status === 'dispatched'}">
                    {{ item.created_at }}
                </template>
                <template v-slot:item.status="{ item }" :class="{ 'blue-grey lighten-3' : item.status === 'dispatched'}">
                    {{ item.status }}
                </template>
                <template v-slot:item.actions="{ item }" :class="{ 'blue-grey lighten-3' : item.status === 'dispatched'}">
                    <v-btn
                            :to="`/inventory/stores/${$route.params.storeId}/order/${item.id}/dispatch`"
                            class="caption mx-0"
                            :color="item.status === 'dispatched' ? 'primary' : 'success'"
                            small dark
                    >
                        {{ item.status === 'dispatched' ? "view" : 'dispatch' }}
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

                            <!--<v-btn icon @click="navigate(orders.links.prev)">
                                <v-icon>chevron_left</v-icon>
                            </v-btn>
                            <v-btn icon @click="navigate(orders.links.next)">
                                <v-icon>chevron_right</v-icon>
                            </v-btn>-->
                        </v-col>
                    </v-row>
                </template>
            </v-data-table>
        </v-card-text>

    </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    name: 'OrdersReceived',

    data() {
        return {
            orders: null,
            page: 1,
            params: {
                dispatching_store_id: this.$route.params.storeId,
                cancelled: 0,
            }
        };
    },

    watch: {
        getInternalOrders(orders) {
            this.orders = orders;
        },

        page(value) {
            this.setInternalOrders({
                page: value,
                params: this.params,
            });
        },
    },

    computed: {
        ...mapGetters([
            'getInternalOrders',
            'getStores',
        ]),

        initialised() {
            return this.orders;
        },
    },

    methods: {
        ...mapActions([
            'setInternalOrders', 'setStores',
        ]),

        filter() {
            this.initialise();
        },

        clearFilters() {
            this.initialise();
        },

        initialise() {
            if(this.params.order_dispatched) {
                this.params.order_dispatched = 1;
            }
            this.setInternalOrders({
                params: this.params,
            });
        },
    },

    mounted() {
        this.setStores();
        if (!this.msetting('inventory.show_dispatched_orders')) {
            this.params.order_dispatched = 0;
        }
        this.initialise();
    },
};
</script>
