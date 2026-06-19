<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card-text v-else>

        <div>
            <filters @filter="filter" :statuses="purchaseOrders.statuses"></filters>
        </div>

        <v-data-table
                :headers="purchaseOrders.headers"
                :items="purchaseOrders.data"
                disable-pagination
                class="mb-3" flat hide-default-footer
        >
            <template v-slot:item.supplier="{ item }">
                <v-btn icon small @click="editOrder(item)" :disabled="item.status != 'Pending'">
                    <v-icon color="primary" small>edit</v-icon>
                </v-btn>
                {{ item.supplier.name }}
            </template>

            <template v-slot:item.payment_term="{ item }">
                {{ item.payment_term }}
            </template>

            <template v-slot:item.status="{ item }">
                <v-chip outlined class="white--text" color="purple" small>{{ item.status }}</v-chip>
            </template>

            <template v-slot:item.ordered_by="{ item }">
                {{ item.user?.full_name || '' }}
              </template>

            <template v-slot:item.actions="{ item }">
                <v-btn small color="primary"
                       :disabled="item.status == 'Pending' || item.status == 'Partially approved' || item.status == 'Rejected'"
                       @click="showPurchaseOrder(item.id)">receive</v-btn>
                <v-btn small color="warning"
                       :disabled="item.status == 'Pending' || item.status == 'Partially approved' || item.status == 'Rejected'"
                       @click="printLPO(item.id)">
                    print LPO
                </v-btn>
                <v-btn small color="purple" class="white--text" @click="approveLpo(item.id)">
                    {{ item.status == 'Approved' || item.status == 'Rejected' ? 'View' : 'Approve' }}
                </v-btn>
                <!--                    <v-btn small color="success" v-if="item.status === 'Received'" @click="printGRN(item.id)">print GRN</v-btn>-->
            </template>


            <template slot="footer" v-if="purchaseOrders.links">
                <v-row  class="py-2 pb-2">
                    <v-col class="text-center">
                        <collabmed-paginator v-if="purchaseOrders.meta" :meta="purchaseOrders.meta" @change="navigate"></collabmed-paginator>
                    </v-col>
                </v-row>
            </template>
        </v-data-table>
    </v-card-text>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Filters from './Filters';

export default {
    props: [
        'supplier_id',
    ],

    components: {
        Filters,
    },

    data: () => ({
        page: 1,
    }),

    computed: {
        ...mapGetters({
            purchaseOrders: 'getPurchaseOrders',
        }),

        initialised() {
            return this.purchaseOrders.data;
        },

        parameters() {
            if (this.supplier_id) {
                return {
                    supplier_id: this.supplier_id,
                };
            } else {
                return null;
            }
        },
    },

    methods: {
        ...mapActions([
            'setPurchaseOrders',
        ]),

        showAttachInvoice(item) {
            if (item.status ==='Received' && this.supplier_id && !item.invoice_attached) {
                return true;
            } else {
                return false;
            }
        },

        approveLpo(purchaseOrder) {
            window.location.href = '/inventory/purchase-orders/' + purchaseOrder + '/approve';
        },

        showPurchaseOrder(purchaseOrder) {
            window.location.href = '/inventory/purchase-orders/' + purchaseOrder;
        },

        printLPO(purchaseOrdeId) {
            window.open('/inventory/purchase-orders/' + purchaseOrdeId + '/print', '_blank');
        },

        printGRN(purchaseOrdeId) {
            window.open('/inventory/goods-received-notes/' + purchaseOrdeId + '/print', '_blank');
        },

        editOrder(item) {
            window.open('/inventory/purchase-orders/create?edit=true&order=' + item.id,'_self');
        },

        navigate(page) {
            this.page = page;
            this.fetchLpos();
        },

        filter(filters) {
            this.setPurchaseOrders({
                page: 1,
                params: filters,
            });
        },

        fetchLpos() {
            this.setPurchaseOrders({
                page: this.page,
                params: this.parameters,
            });
        },
    },

    mounted() {
        this.fetchLpos();
    },
};
</script>
