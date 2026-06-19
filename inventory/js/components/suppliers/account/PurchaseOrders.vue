<template>
    <div>
        <v-card-title class="subheading grey-text text-darken-2">
            <h4>Purchase Orders</h4>
            <v-spacer></v-spacer>
            <v-btn class="purple white--text" @click="newPurchaseOrder()">New Purchase Order</v-btn>
        </v-card-title>

        <purchase-orders-list :supplier_id="supplier_id"></purchase-orders-list>
    </div>
</template>
<script>
import PurchaseOrdersList from "@inventory/components/purchase_orders/partials/PurchaseOrdersList.vue";

export default {
    props: [
        "supplier_id",
    ],

    components: {
        PurchaseOrdersList,
    },

    methods: {
        newPurchaseOrder() {
            window.location.href = "/inventory/purchase-orders/create";
        },
    },
};
</script>
