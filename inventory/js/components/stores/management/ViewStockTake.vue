
<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title>
            <span class="subheading">A listing of stocks taken on stock take id: {{ stock_take.id }}</span>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" persistent max-width="40%">
                <template v-slot:activator="{ on }">
                    <v-btn v-if="stock_take.status === 'closed'" disabled>Closed</v-btn>
                    <v-btn v-if="stock_take.status === 'closing'" disabled>Closing</v-btn>
                    <v-btn small color="primary" v-on="on">Close stock take and adjust stocks</v-btn>
                </template>
                <v-card>
                    <v-card-title class="headline primary">Close stock take</v-card-title>
                    <v-card-text>
                        This will update current stock quantities with the new recorded quantities and close the stock.
                        <br/>

                        <v-textarea
                                v-model="stockTake.comment"
                                label="Comments"
                                outline
                        ></v-textarea>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="error darken-1" @click="dialog = false">Cancel</v-btn>
                        <v-btn color="primary darken-1" @click="closeStockTake()">Okay</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <v-data-table :headers="headers"
                          v-if="getStockTakeDetails"
                          :items="getStockTakeDetails.data"
                          class="mb-3"
                          hide-default-footer
                          flat>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import StockTake from "@inventory/libs/stores/StockTake";

export default {
    name: "view-stock-take",

    props: [
        "userId",
    ],

    data() {
        return {
            stockTake: new StockTake(),
            dialog: false,
            stock_take: null,
            headers: [
                { text: "Product", value: "product.name" },
                { text: "previous Quantity", value: "previous_quantity" },
                { text: "New quantity", value: "new_quantity" },
                { text: "Variance", value: "variance" },
                { text: "User", value: "user.name" },
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
            "getStockTakeDetails",
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
            "setStockTakeDetails",
        ]),

        closeStockTake() {
            this.stockTake.closeStockTake(this.storeId, this.stockTakeId);
            this.initialise();
            this.dialog = false;
        },

        initialise() {
            this.setStockTake({
                params: {
                    store_id: this.storeId,
                    id: this.stockTakeId,
                },
            });
            this.setStockTakeDetails({
                params: {
                    stock_take_id: this.stockTakeId,
                },
            });
        },
    },

    created() {
        this.initialise();
    },
};
</script>
