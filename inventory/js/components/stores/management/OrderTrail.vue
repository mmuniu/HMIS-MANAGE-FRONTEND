<template>
    <v-card v-if="initialised" flat class="my-3">
        <v-card-title height="23">
            <h2 class="subheading my-0 py-0">View order details</h2>
            <v-spacer/>
            <v-btn small color="error" @click="undoCancel(getInternalOrders.data[0])">{{ getInternalOrders.data[0].status }}</v-btn>
        </v-card-title>

        <v-divider class="my-0"></v-divider>

        <v-data-table :headers="headers" :items="orderDetails.data">
            <template v-slot:item.status="{ item }">{{ item.items_received ? item.items_received : "not received yet" }}</template>
        </v-data-table>
        <br/>
    </v-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import InternalOrder from "@inventory/libs/stores/InternalOrder";

export default {
    name: "OrderTrail",

    data() {
        return {
            orderDetails: null,
            headers: [
                { text: "Product", value: "product.name" },
                { text: "Ordered", value: "ordered" },
                { text: "Dispatched", value: "dispatched" },
                { text: "Received", value: "received" },
            ],
            order: new InternalOrder(),
        };
    },

    watch: {
        getInternalOrders({ data }) {
            this.orderDetails = data[0].details;
        },
    },

    computed: {
        ...mapGetters([
            "getInternalOrders",
        ]),

        initialised() {
            return this.orderDetails;
        },

        orderId() {
            return this.$route.params.orderId;
        },
    },

    methods: {
        ...mapActions([
            "setInternalOrders",
        ]),

        initialisePage() {
            this.setInternalOrders({
                params: {
                    order_id: this.orderId,
                },
            });
        },

        undoCancel(order) {
            if (order.cancelled) {
                this.order.undoOrderCancel(order, this.$route.params.storeId);
            }
            this.initialisePage();
        },
    },

    mounted() {
        this.initialisePage();
    },
};


</script>

<style scoped>

</style>
