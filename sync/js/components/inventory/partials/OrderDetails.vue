/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-07-15
* Time: 15:28
*/

<template>
    <div class="px-2">

        <v-row>
            <v-col cols="12" md="7">

                <v-row >
                    <v-col cols="12" md="8">
                        <v-select
                                v-model="obj.dispatch.store_id"
                                :items="stores"
                                label="Select Store"
                                item-text="name"
                                item-value="id"
                        ></v-select>
                    </v-col>

                    <v-col cols="12" md="4">
                        <v-tooltip top>
                            <template v-slot:activator="{ on }">
                                <v-btn dark small color="blue" @click="checkStock" :loading="saveLoader" v-on="on">
                                    <v-icon class="mr-2">compare_arrows</v-icon>
                                    Check Stock
                                </v-btn>
                            </template>
                            <span>Check Current Stock Levels for the Products</span>
                        </v-tooltip>

                    </v-col>
                </v-row>
            </v-col>

            <v-col cols="12" md="5">
                <v-text-field
                        v-model="search"
                        label="Search Table"
                        prepend-inner-icon="search"
                ></v-text-field>
            </v-col>
        </v-row>

        <div v-if="proceed">
            <v-data-table
                    :headers="headers"
                    :items="order.details"
                    :search="search"
                    v-model="selected"
                    item-key="id"
                    hide-default-footer
                    show-select
            >
                <template v-slot:item.product_name="{ item }">
                    #{{ item.product_id }}
                    <p class="grey--text">{{ item.product_name }}</p>
                </template>
                <template v-slot:item.quantity="{ item }" class="text-center">
                    {{ item.quantity | numberFormatInt }}
                </template>
                <template v-slot:item.stock="{ item }" class="text-center">
                    <span v-if="actionData">{{ getProductStock(item) | numberFormatInt }}</span>
                    <span v-else>N/A</span>
                </template>
                <template v-slot:item.dispatched="{ item }" class="text-center">
                    <p v-if="item.dispatch">
                        {{ item.dispatch.quantity }}
                        <br/>
                        <small>By: {{ item.dispatch.user_name }}</small>
                    </p>
                    <p v-else> - </p>
                </template>
                <template v-slot:item.dispatch="{ item }">
                    <v-text-field
                            v-model="obj.dispatch.items[item.id].quantity"
                            :label="`Quantity`"
                            type="number"
                            :max="obj.dispatch.items[item.id].max"
                            :min="0"
                    ></v-text-field>
                </template>

                <template slot="footer">
                    <div>
                        <v-alert v-if="errors.any()" :value="true" type="error">
                            <div v-html="errors.display()"></div>
                        </v-alert>
                    </div>

                    <div>
                        <p class="pull-left font-weight-bold">
                            {{ selected.length }} items selected

                            <span class="ml-3 font-weight-normal">
                                    Dispatched orders will not be re-dispatched even when selected!
                                </span>
                        </p>

                        <v-btn dark color="green" class="pull-right" :loading="saveLoader" @click="dispatch">
                            Dispatch
                            <v-icon>arrow_right_alt</v-icon>
                        </v-btn>
                    </div>
                </template>

            </v-data-table>
        </div>

    </div>
</template>

<script>

export default {
    props: {
        obj: {
            type: Object,
            required: true,
        },

        order: {
            required: true,
        },

        stores: {
            required: true,
        },
    },

    data() {
        return {
            headers: [
                { text: "Product", value: "product_name" },
                { text: "Quantity Requested", value: "quantity" },
                { text: "Current Stock", value: "stock" },
                { text: "Dispatched", value: "dispatched" },
                { text: "Dispatch", value: "dispatch" },
            ],
            selected: [],
            search: "",
            proceed: false,
            saveLoader: false,
        };
    },

    computed: {
        actionData() {
            return this.obj.actionData;
        },

        submitted() {
            return this.obj.form.submitted;
        },

        errors() {
            return this.obj.form.errors;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },

        actionCompleted() {
            return this.obj.actionCompleted;
        },
    },

    watch: {
        submitted(val) {
            this.saveLoader = false;
        },

        contaminated(val) {
            this.saveLoader = false;
        },

        actionCompleted(val) {
            if (val) {
                // this.close()
            }
        },
    },

    methods: {
        checkStock() {
            if (! this.obj.dispatch.store_id) {
                flash({ message: "Please Select a Store to Proceed", alert: "error" });
                return;
            }

            const url = route("api.sync.inventory.action.no-callback", ["incoming", "checkStock"]).relative();
            const data = {
                order_id: this.order.id,
                store_id: this.obj.dispatch.store_id,
            };

            this.saveLoader = true;
            this.obj.performAction(url, data);
        },

        getProductStock(detail) {
            const found = _.find(this.actionData, { product_id: detail.product_id });

            if (found && found.product) {
                // update max
                const found2 = _.find(this.obj.dispatch.items, { product_id: detail.product_id });

                if (found2) {
                    if (found2.quantity > found.product.quantity) {
                        found2.quantity = found.product.quantity;
                        found2.max = found.product.quantity;
                    }
                }

                return found.product.quantity;
            }

            return 0;
        },

        dispatch() {
            if (this.selected.length < 1) {
                flash({ message: "Please select products to process", alert: "error" });
                return;
            }

            if (! this.obj.dispatch.store_id) {
                flash({ message: "Please select a store to proceed", alert: "error" });
                return;
            }

            // filter only the selected
            const dispatch = [];

            _.each(this.selected, (item) => {
                const found = _.find(this.obj.dispatch.items, (it) => {
                    if (it) {
                        return it.product_id == item.product_id;
                    }

                    return false;
                });

                if (found) {
                    dispatch.push(found);
                }
            });

            // post data
            const data = {
                order_id: this.order.id,
                store_id: this.obj.dispatch.store_id,
                items: dispatch,
            };
            const url = route("api.sync.inventory.action.store", ["incoming", "dispatch"]).relative();

            this.saveLoader = true;
            this.obj.performAction(url, data);
        },

        close() {
            this.$emit("close", true);
        },
    },

    mounted() {
        _.each(this.order.details, (item) => {
            this.obj.dispatch.items[item.id] = {};
            this.obj.dispatch.items[item.id].id = item.id;
            this.obj.dispatch.items[item.id].quantity = item.quantity;
            this.obj.dispatch.items[item.id].product_id = item.product_id;
            this.obj.dispatch.items[item.id].max = item.quantity;
        });

        this.proceed = true;
    },
};
</script>

<style scoped lang="scss">

</style>
