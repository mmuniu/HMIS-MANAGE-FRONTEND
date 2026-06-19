<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>
    <div v-else>
        <div v-if="grn_note.invoice_status != 'No invoice attached'">
            <v-btn color="blue" dark @click.stop="drawer = !drawer" v-if="grn_note.invoices.length > 0">
                View invoices
            </v-btn>


            <v-navigation-drawer v-model="drawer" absolute temporary width="400" right class="mt-5">
                <v-list class="pa-1 mt-4">
                    <h4 class="text-center font-weight-bolder">All attached invoices to grn</h4>
                </v-list>

                <v-divider></v-divider>

                <v-list class="pa-1 mt-4">
                    <span class="title font-weight-bolder px-2">Total amount: {{ totalAmount()}}</span>
                </v-list>

                <v-divider></v-divider>

                <v-row  v-if="grn_note.invoices" class="mx-2">
                    <v-col class="mx-3" cols="12" v-for="(item, index) in grn_note.invoices" :key="item.id">
                        <v-btn style="float: right" color="primary" small @click="viewInvoice(item.id)">View attachment</v-btn>
                        <h6>Invoice Number: {{ item.number }} </h6>
                        <h6 >Invoice Amount: {{ item.amount }} </h6>
                        <h6>Date: {{ item.date}}</h6>

                        <p>
                            <span style="font-weight: bold">Comment: </span><br/>
                            <span>{{ item.comments }}</span>
                        </p>

                        <v-divider style="margin: 5px" v-if="index + 1 < grn_note.invoices.length"></v-divider>
                    </v-col>
                </v-row>
            </v-navigation-drawer>
        </div>
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
        ...mapGetters({
            grn_note: "getGoodsReceived",
        }),

        initialised() {
            return !!this.grn_note;
        },
    },

    methods: {
        viewInvoice(invoiceId) {
            window.open("/inventory/goods-received-notes/" + this.grn_note.id + "/view-invoice/" + invoiceId, "_blank");
        },

        totalAmount() {
            let total = 0;
            _.map(this.grn_note.invoices, function(invoice) {
                total = total + parseFloat(invoice.amount);
            });
            return Math.round(total * 100) / 100;
        },
    },
};
</script>
