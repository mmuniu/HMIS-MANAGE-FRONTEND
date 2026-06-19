
<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title>
            <v-btn color="primary" small @click="beginStockTake()" v-if="stock_take.status != 'active'">Initiate stock take</v-btn>
            <v-btn color="primary" small disabled v-else>Stock take initiated</v-btn>
            <v-spacer></v-spacer>
            <v-btn small color="primary" @click="downloadExcel()">Store products excel list</v-btn>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-row >
                <v-col md="6">
                    <span class="grey--text px-4">The system will automatically save the figures</span> <br/>
                </v-col>
                <v-col class="px-3" md="5" >
                    <store-products-search :takingStocks="takingStocks" :disabled="stock_take.status != 'active' ? true : false" :storeId="storeId" @results="productSelected"></store-products-search>
                </v-col>
            </v-row>

            <v-data-table :headers="headers" v-if="stockTake.stocks_taken.length > 0" :items="stockTake.stocks_taken" class="mb-3" hide-default-footer flat>
                <template v-slot:item.new_quantity="{ item }" style="width: 10%">
                    <v-text-field
                            v-model="item.new_quantity"
                            style="border: 1px solid black"
                            class="text-center"
                            solo
                            flat
                            @change="stockTake.autoSaveItem(storeId, stockTakeId, item)"
                            type="number"
                            min="1"
                            single-line
                            height="2"
                            hide-details
                    ></v-text-field>
                </template>
                <template v-slot:item.actions="{ item }" style="width: 10%">
                    <v-btn icon color="error" flat @click="removeItemFromList(item)">x</v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import StockTake from "@inventory/libs/stores/StockTake";
import StoreProductSearch from "@inventory/components/StoreProductsSearch";

export default {
    name: "take-stocks",

    props: [
        "userId",
    ],

    components: {
        "store-products-search": StoreProductSearch,
    },

    data() {
        return {
            stockTake: new StockTake(),
            stock_take: null,
            takingStocks: true,
            headers: [
                { text: "Product", value: "name" },
                { text: "previous Quantity", value: "previous_quantity" },
                { text: "New quantity", value: "new_quantity" },
                { text: "Actions", value: "actions" },
            ],
        };
    },

    watch: {
        getStockTake(val) {
            return this.stock_take = val.data[0];
        },
    },

    computed: {
        ...mapGetters([
            "getStockTake",
        ]),

        storeId() {
            return this.$route.params.storeId;
        },

        stockTakeId() {
            return this.$route.params.stockTakeId;
        },

        initialised() {
            return this.stock_take;
        },
    },

    methods: {
        ...mapActions([
            "setStockTake",
        ]),

        downloadExcel() {
            return window.location = "/inventory/stores/" + this.storeId + "/products/download";
        },

        removeItemFromList(item) {
            this.stockTake.stocks_taken.splice(this.stockTake.stocks_taken.indexOf(item), 1);
        },

        productSelected(product) {
            const item = {
                name: product.name,
                user_id: this.userId,
                product_id: product.product_id,
                previous_quantity: product.quantity,
                new_quantity: 0,
                stock_take_id: this.stockTakeId,
            };

            const check = _.find(this.stockTake.stocks_taken, (item) => item.name === product.name);

            if (check) {
                flash({
                    "message": "product already in the list",
                    "alert": "error",
                });
            } else {
                this.stockTake.stocks_taken.unshift(item);
            }
        },

        beginStockTake() {
            this.stockTake.beginStockTake(this.stock_take);
            this.initialise();
            window.location.reload();
        },

        initialise() {
            this.setStockTake({
                params: {
                    store_id: this.storeId,
                    id: this.stockTakeId,
                },
            });
        },
    },

    created() {
        this.initialise();
    },
};
</script>
