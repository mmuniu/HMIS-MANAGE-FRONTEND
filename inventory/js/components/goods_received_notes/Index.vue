<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <div v-else>
        <v-card>
            <v-card-text>
<v-data-table
        :headers="headers"
        :items="grns.data"
        class="elevation-1"
        :items-per-page="15"
>
    <template v-slot:item.actions="{ item }">
        <v-btn
                color="cyan"
                class="caption"
                dark
                small
                @click="printGrn(item)"
        >
            Print grn
        </v-btn>
        <v-btn small color="purple" class="white--text" @click="attachInvoice(item.id)">Attach invoice</v-btn>
    </template>

    <template slot="footer" v-if="grns.links">
        <td colspan="100%">
            <v-row  class="py-2 pb-2">
                <v-col cols="8" class="mt-3 ml-3">
                    Total records: {{ grns.meta.total }}
                </v-col>

                <v-col cols="3" class="text-right">
                    <v-btn icon @click="navigate(grns.links.prev)">
                        <v-icon>chevron_left</v-icon>
                    </v-btn>

                    <v-btn icon @click="navigate(grns.links.next)">
                        <v-icon>chevron_right</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
        </td>
    </template>
</v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
    name: "grns-index",

    props: [
        "userId",
    ],

    data() {
        return {
            grns: null,
            headers: [
                { text: "User", value: "user.name" },
                { text: "Order number", value: "purchase_order_id" },
                { text: "Supplier", value: "supplier.name" },
                { text: "Date", value: "date" },
                { text: "Invoice status", value: "invoice_status" },
                { text: "Actions", value: "actions" },
            ],
        };
    },

    watch: {
        getGoodsReceivedNotes(grns) {
            this.grns = grns;
        },
    },

    computed: {
        ...mapGetters([
            "getGoodsReceivedNotes",
        ]),

        initialised() {
            return this.grns;
        },
    },

    methods: {
        ...mapActions([
            "setGoodsReceivedNotes",
        ]),

        printGrn(item) {
            window.open("/inventory/goods-received-notes/" + item.purchase_order_id + "/print/" + item.id, "_blank");
        },

        attachInvoice(grnId) {
            window.open(route("inventory.goods-received-notes.attach_invoice", grnId ), "_blank");
        },

        viewInvoice(purchaseOrderId) {
            window.open("/inventory/purchase-orders/" + purchaseOrderId + "/view-invoice", "_blank");
        },

        navigate(url) {
            if (url) {
                const page = url.substring(url.indexOf("page=")).split("page=")[1];

                this.setGoodsReceivedNotes({
                    page: page,
                    // params: this.parameters
                });
            }
        },
    },

    mounted() {
        const invoice_id = this.$route.query.invoice_id;

        this.setGoodsReceivedNotes({
            params: {
                invoice_id,
            },
        });
    },
};
</script>
