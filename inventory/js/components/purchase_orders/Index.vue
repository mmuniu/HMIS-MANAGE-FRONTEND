<template>
    <div>
        <v-card>
            <v-card-title class="subheading grey-text text-darken-2">
                <h2 class="body-2 ma-0 pa-0">Made purchase orders</h2>
                <v-spacer></v-spacer>
<!--                <v-btn class="purple darken-4 white&#45;&#45;text" @click="newPurchaseOrder()">New Purchase Order</v-btn>-->
            </v-card-title>

            <v-divider class="my-0"></v-divider>

            <purchase-orders-list></purchase-orders-list>
        </v-card>
    </div>
</template>

<script>
import _ from 'lodash';
import { mapGetters, mapActions } from 'vuex';
import PurchaseOrdersList from '@inventory/components/purchase_orders/partials/PurchaseOrdersList.vue';


export default {
    name: 'purchase-orders-index',

    components: {
        PurchaseOrdersList,
    },

    data() {
        return {
            search: null,
            purchaseOrders: null,
        };
    },

    watch: {
        getPurchaseOrders(purchaseOrders) {
            this.purchaseOrders = purchaseOrders;
        },

        search(value) {
            if (!value) {
                this.purchaseOrders({ page: 1 });
                return;
            }

            if (value && value.length > 0) {
                this.purchaseOrders(value);
            }
        },
    },

    methods: {
        newPurchaseOrder() {
            window.location.href = '/inventory/purchase-orders/create';
        },

        navigate(url) {
            if (url) {
                const page = url.substring(url.indexOf('page=')).split('page=')[1];
                this.setPurchaseOrders({ page });
            }
        },
    },
};
</script>
