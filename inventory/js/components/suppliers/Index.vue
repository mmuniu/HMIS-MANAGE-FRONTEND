<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else class="mt-3">
        <br/>
        <v-toolbar flat color="white">
            <v-spacer></v-spacer>
            <suppliers-search @results="setSupplier"></suppliers-search>
        </v-toolbar>

        <v-card-text>
            <v-data-table
                    :headers="suppliers.data.original.headers"
                    :items="suppliers.data.original.data"
                    class="mb-3"
                    flat
            >
                <template v-slot:item.total="{ item }">
                    <span>{{ item.total | numberFormat }}</span>
                </template>
                <template v-slot:item.paid="{ item }">
                    <span>{{ item.paid | numberFormat }}</span>
                </template>
                <template v-slot:item.balance="{ item }">
                    <span>{{ item.balance | numberFormat }}</span>
                </template>

                <template v-slot:item.actions="{ item }">
                    <v-btn class="primary white--text"  @click="viewSupplierAccount(item.id)" small >Manage</v-btn>
                </template>
            </v-data-table>

            <div>
                <v-container v-if="suppliers.data">
                    <v-row  style="font-weight: bold" class="pb-4">
                        <v-col cols="12" md="4">
                            <span>Total amount: </span>
                            <span>{{ suppliers.total }}</span>
                        </v-col>
                        <v-col cols="12" md="4">
                            <span>Paid: </span>
                            <span>{{ suppliers.paid }}</span>
                        </v-col>
                        <v-col cols="12" md="4">
                            <span>Total Balance: </span>
                            <span>{{ suppliers.balance }}</span>
                        </v-col>
                    </v-row>
                </v-container>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import _ from "lodash";
import SupplierSearch from "@inventory/components/searches/Suppliers";

export default {
    name: "suppliers-index",

    components: {
        "suppliers-search": SupplierSearch,
    },

    data() {
        return {
            suppliers: null,
            report: [],
        };
    },

    watch: {
        getSuppliers( suppliers ) {
            this.suppliers = suppliers;
            /* this.report = _.map(suppliers.data, ({name, invoices}) => {
                    let balance = this.getInvoicesBalance(invoices);
                    return { name, balance };
                });*/
        },
    },

    computed: {
        ...mapGetters([
            "getSuppliers",
        ]),

        initialised() {
            return this.suppliers;
        },
    },

    methods: {
        ...mapActions([
            "setSuppliers",
        ]),

        setSupplier(supplier) {
            this.supplier = supplier.data;
        },

        /* getInvoicesBalance ({data}) {
                return _.sumBy(data, 'balance');
            },*/

        viewSupplierAccount(supplierId) {
            window.location.href = "/inventory/suppliers/" + supplierId + "/purchase-orders";
        },
    },

    mounted() {
        this.setSuppliers();
    },
};
</script>
