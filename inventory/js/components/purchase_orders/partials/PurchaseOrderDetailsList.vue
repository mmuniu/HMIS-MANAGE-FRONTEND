<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>
    <v-card-text v-else>
        <v-data-table
                :headers="headers" :items="goodsReceived.data"
                class="mb-3" flat hide-default-footer
        >
            <template slot="footer" v-if="goodsReceived.meta">
                <v-row  class="py-2 pb-2">
                    <v-col cols="8" class="mt-3 ml-3">
                        Total GRN cost: {{ goodsReceived.meta.total }}
                    </v-col>
                </v-row>
            </template>
        </v-data-table>
    </v-card-text>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
    props: [
        "purchase_order_id",
    ],

    computed: {
        ...mapGetters({
            goodsReceived: "getGoodsReceived",
        }),

        initialised() {
            return this.goodsReceived;
        },
    },

    methods: {
        ...mapActions([
            "setGoodsReceived",
        ]),

        printLPO() {
            window.open("/inventory/purchase-orders/" + this.purchase_order_id + "/print", "_blank");
        },

        printGRN() {
            window.open("/inventory/goods-received-notes/" + this.purchase_order_id + "/print", "_blank");
        },
    },

    mounted() {
        this.setGoodsReceived({
            page: 1,
            params: {
                purchase_order_id: this.purchase_order_id,
            },
        });
    },
};
</script>
