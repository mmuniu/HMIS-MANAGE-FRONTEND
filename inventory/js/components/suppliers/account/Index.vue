<template>
    <div>
        <v-card flat>
            <v-card-title>
                <supplier-profile-details :supplier="supplier"></supplier-profile-details>
                <v-spacer></v-spacer>
                <nav class="navio grey lighten-2 pr-5">
                    <v-btn-toggle flat>
                        <router-link tag="v-btn" v-for="(nav, index) in navigation" class="text-center"
                                     :key="index" :to="usher(nav)" exact active-class="active">
                            <a>{{ nav.name }}</a>
                        </router-link>
                    </v-btn-toggle>
                </nav>
            </v-card-title>

            <v-card-text v-if="supplier" style="padding: 0; margin: 0">
                <v-col cols="12">
                    <div class="px-3">
                        <transition name="slide">
                            <router-view :supplier_id="supplier.id"></router-view>
                        </transition>
                    </div>
                </v-col>
            </v-card-text>
        </v-card>
    </div>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
// import PurchaseOrders from "./PurchaseOrders";

export default {
    props: {
        supplierdata: {
            default: null,
        },
    },

    components: {
        // PurchaseOrders,
    },

    data: () => ({
        navigation: [
            { url: "purchase-orders", name: "purchase orders" },
            { url: "direct-orders", name: "Direct orders" },
            { url: "payments", name: "Payments" },
            { url: "summary", name: "Summary and analytics" },
            // { url: 'Statement', name: 'Statements' },
        ],
    }),

    computed: {
        ...mapGetters({
            invoices: "getInventoryInvoices",
        }),

        supplier() {
            return JSON.parse(this.supplierdata);
        },
    },

    methods: {
        ...mapActions([
            "setInventoryInvoices",
        ]),

        usher(nav) {
            const supplier_id = this.supplier.id;
            return `/inventory/suppliers/${supplier_id}/${nav.url}`;
        },
    },

    mounted() {

    },
};
</script>
