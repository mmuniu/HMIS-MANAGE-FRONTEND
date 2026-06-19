<template>
    <div v-if="initialised">
        <v-btn color="blue" dark @click.stop="drawer = !drawer" v-if="purchaseOrder.goods_received.length > 0">
            View and print Goods received notes
        </v-btn>


        <v-navigation-drawer v-model="drawer" absolute temporary width="400" right class="mt-5">
            <v-list class="pa-1 mt-4">
                <h4 class="text-center font-weight-bolder">All raised grns</h4>
            </v-list>

            <v-row  v-if="purchaseOrder.goods_received" class="mx-2">
                <v-col class="mx-3" cols="12" v-for="(item, index) in purchaseOrder.goods_received" :key="item.id">
                    <h4>{{ item.user.full_name }}</h4>
                    <span class="text--primary">{{ item.date }}</span>

                    <br/>
                    <p>
                        <span style="font-weight: bold">Comment: </span>

                        <v-btn style="float: right" color="primary" small @click="printGrn(item.id, purchaseOrder.id)">print grn</v-btn>
                    </p>

                    <br/>
                    <span>{{ item.comment }}</span>
                    <v-divider
                            style="margin: 5px"
                            v-if="index + 1 < purchaseOrder.goods_received.length"
                    ></v-divider>
                </v-col>
            </v-row>
        </v-navigation-drawer>
    </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            drawer: null,
        };
    },

    computed: {
        ...mapGetters([
            "getPurchaseOrders",
        ]),

        purchaseOrder() {
            if (this.getPurchaseOrders) {
                return _.head(this.getPurchaseOrders.data);
            } else {
                return null;
            }
        },

        initialised() {
            return this.purchaseOrder ? true : false;
        },
    },

    methods: {
        ...mapActions([
            "setPurchaseOrders",
        ]),

        printGrn(grnId, purchaseOrdeId) {
            window.open("/inventory/goods-received-notes/" + purchaseOrdeId + "/print/" + grnId, "_blank");
        },
    },
};
</script>
