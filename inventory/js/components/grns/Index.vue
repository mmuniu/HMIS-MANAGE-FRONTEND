<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <div v-else>
        <v-card>
            <v-card-title>
                <v-spacer></v-spacer>
                <suppliers-search @results="setSupplier"></suppliers-search>
                <v-text-field
                        v-model="invoice_id"
                        label="Invoice id"
                        outline
                        class="mx-3"
                        single-line
                        hide-details
                ></v-text-field>
                <v-btn color="primary" small @click="filterBySupplier()">Filter</v-btn>
            </v-card-title>
            <v-card-text>
                    <v-data-table
                            :headers="grns.headers"
                            :items="grns.data"
                            class="mb-2"
                            flat
                    >
                        <template v-slot:item.actions="{ item }">
                            <v-btn
                                    :href="`/inventory/goods-received-notes/${item.id}`"
                                    color="cyan"
                                    class="caption"
                                    dark
                            >
                                View Details
                            </v-btn>
                        </template>

                        <!--<template slot="footer" v-if="invoices.links">-->
                            <!--<td colspan="100%">-->
                                <!--<v-layout wrap row class="pt-3">-->
                                    <!--<v-flex xs8>-->
                                        <!--<v-btn-->
                                                <!--class="caption"-->
                                                <!--type="submit"-->
                                                <!--color="success"-->
                                                <!--large-->
                                                <!--:dark="!disabled"-->
                                                <!--:disabled="disabled"-->
                                                <!--:loading="invoicePayment.form.loading"-->
                                        <!--&gt;-->
                                            <!--Settle Selected invoices-->
                                        <!--</v-btn>-->
                                    <!--</v-flex>-->

                                    <!--<v-flex xs3 class="text-xs-right">-->
                                        <!--<v-btn icon @click="navigate(invoices.links.prev)">-->
                                            <!--<v-icon>chevron_left</v-icon>-->
                                        <!--</v-btn>-->
                                        <!--<v-btn icon @click="navigate(invoices.links.next)">-->
                                            <!--<v-icon>chevron_right</v-icon>-->
                                        <!--</v-btn>-->
                                    <!--</v-flex>-->
                                <!--</v-layout>-->
                            <!--</td>-->
                        <!--</template>-->
                    </v-data-table>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import SupplierSearch from "@inventory/components/searches/Suppliers";

export default {
    name: "grns-index",

    props: [
        "userId",
    ],

    components: {
        "suppliers-search": SupplierSearch,
    },

    data() {
        return {
            grns: null,
            invoice_id: null,
            supplier_id: null,
        };
    },

    watch: {
        getGoodsReceivedNotes(grns) {
            this.grns = grns;
        },
    },

    computed: {
        ...mapGetters({
            getGoodsReceivedNotes: "getGrns",
        }),

        initialised() {
            return this.grns;
        },
    },

    methods: {
        ...mapActions([
            "setGrns",
        ]),

        setSupplier(supplier) {
            this.supplier_id = supplier.id;
        },

        filterBySupplier(supplier) {
            const param = {
                supplier_id: this.supplier_id,
            };
            this.setGrns({
                params: {
                    supplier_id: this.supplier_id,
                    invoice_id: null,
                },
            });
        },
    },

    mounted() {
        this.setGrns({
            params: {
                invoice_id: null,
            },
        });
    },
};
</script>
