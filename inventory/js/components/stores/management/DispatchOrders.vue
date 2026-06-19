<template>
    <v-card v-if="initialised">
        <v-card-title>
            <h2 class="subheading my-0 py-0">Dispatch an order</h2>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <form @submit.prevent="save()">
                <v-data-table
                        :headers="headers" :items="order.details.data"
                        disable-pagination
                        class="mb-3" flat
                >
                    <template v-slot:item.name="{ item }" class="py-3">
                        {{ item.product.name }}
                        <span v-if="item.available <= 0" class="red--text">(out of stock)</span>
                    </template>
                    <template v-slot:item.dispatch="{ item }">
                        <input
                                type="number"
                                step=".01"
                                class="form-control table-input"
                                :max="checkDispatchable(item)"
                                :disabled = "item.dispatchable === 0 || item.dispatched > 0"
                                :min="0"
                                v-model="item.dispatchable"
                        />
                    </template>

                    <template slot="footer">
                        <v-row>
                            <v-col cols="12">
                                <v-btn
                                        class="caption mx-0 mt-4"
                                        type="submit"
                                        color="success"
                                        :dark="!loading"
                                        :disabled="loading"
                                        :loading="loading"
                                >
                                    Dispatch ordered items
                                </v-btn>
                            </v-col>
                        </v-row>
                    </template>
                </v-data-table>
            </form>
        </v-card-text>
    </v-card>
</template>

<script>
import _ from "lodash";
import { mapActions, mapGetters } from "vuex";
import Dispatch from "@inventory/libs/stores/dispatches/Dispatch";

export default {
    name: "DispatchOrders",

    data() {
        return {
            dispatch: new Dispatch(),
            order: null,
            loading: false,
            headers: [
                { text: "Item name", value: "name", sortable: false },
                { text: "Available", value: "available", sortable: false },
                { text: "Ordered", value: "ordered", sortable: false },
                { text: "Dispatched", value: "dispatched", sortable: false },
                { text: "Dispatch", value: "dispatch", sortable: false },
            ],
        };
    },

    watch: {
        getInternalOrders({ data }) {
            this.order = data[0];
        },

        submitted(value) {
            if (value) {
                this.initialise();
                this.loading = false;
                this.dispatch.form.submitted = false;
            }
        },
    },

    computed: {
        ...mapGetters([
            "getInternalOrders",
        ]),

        initialised() {
            return this.order;
        },

        submitted() {
            return this.dispatch.form.submitted;
        },

        storeId() {
            return this.$route.params.storeId;
        },
    },

    methods: {
        ...mapActions([
            "setInternalOrders",
        ]),

        checkDispatchable(item) {
            if (item.available < item.ordered) {
                return item.available;
            } else if (item.available > item.ordered) {
                return item.ordered;
            }
        },

        initialise() {
            this.setInternalOrders({
                params: {
                    order_id: this.$route.params.orderId,
                    store_id: this.$route.params.storeId,
                },
            });
        },

        save() {
            if (!this.loading) {
                this.loading = true;

                const filtered_set = _.filter(this.order.details.data, function(value) {
                    return value.dispatchable > 0 && value.dispatched <= 0;
                });

                if (filtered_set.length > 0) {
                    const data = _.map(filtered_set, function(value) {
                        return {
                            "order_detail_id": value.order_detail_id,
                            "dispatched_by": value.dispatched_by,
                            "dispatched": value.dispatchable,
                            "store_product_id": value.store_product_id,
                        };
                    });

                    this.dispatch.dispatch(this.storeId, data);
                } else {
                    flash({
                        message: "Every order item has been acted upon",
                        alert: "warning",
                    });
                    this.loading = false;
                }
            }
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>
