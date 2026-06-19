/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-07-08
* Time: 16:07
*/

<template>
    <div>
        <v-card>
            <v-card-title>
                <div>
                    <h3 class="title">Incoming Facility Order Requests</h3>
                    <p>View incoming requests from other facilities</p>
                </div>

                <v-spacer></v-spacer>

                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn small dark color="green" @click="fetch(1, true)" v-on="on">
                            <v-icon class="mr-2">cached</v-icon> Refresh
                        </v-btn>
                    </template>
                    <span>Refresh After an Update</span>
                </v-tooltip>
            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="!initialised || loading"></collabmed-loading>

                <div v-else>

                    <v-data-table :headers="headers"
                                  :items="list.data"
                                  :loading="saveLoader"
                                  no-data-text="No orders made yet"
                                  hide-default-footer
                    >
                        <template v-slot:item.requesting_facility_name="{ item }">
                            {{ item.requesting_facility_identifier }}
                            <p class="grey--text">{{ item.requesting_facility_name }}</p>
                        </template>
                        <template v-slot:item.user_name="{ item }">
                            <p class="grey--text">{{ item.user_name }}</p>
                        </template>
                        <tempalate v-slot:item.created_at="{ item }">
                            {{ item.created_at }}
                            <p class="grey--text" v-if="item.created_at_w3c">{{ item.created_at_w3c | moment('from') }}</p>
                        </tempalate>
                        <template v-slot:item.delivery_date="{ item }">
                            {{ item.delivery_date }}
                            <p class="grey--text" v-if="item.delivery_date_w3c">{{ item.delivery_date_w3c | moment('from') }}</p>
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <v-btn small
                                   @click="preview(item)"
                                   class="white--text"
                                   :outlined="item.dispatches.length > 0"
                                   :class="[ item.dispatches.length > 0 ? 'purple white--text' : 'blue white--text' ]"
                            >
                                <v-icon small>assignment</v-icon>
                                Details
                            </v-btn>

                            <v-btn v-if="item.dispatches.length > 0" class="white--text" small color="green">
                                <v-icon>done</v-icon>
                                Dispatched
                            </v-btn>

                            <v-btn v-else small  color="red" class="white--text">
                                <v-icon>cancel</v-icon>
                                Cancel Order
                            </v-btn>
                        </template>

                        <template slot="footer">
                            <collabmed-paginator :meta="meta" @change="navigate"></collabmed-paginator>
                        </template>
                    </v-data-table>

                </div>
            </v-card-text>
        </v-card>

        <!--order details-->
        <v-dialog v-model="dialog" max-width="75%" persistent>
            <v-card>
                <v-card-title primary-title class="blue white--text">
                    <div v-if="orderSelected">
                        <h3 class="title">Order #{{ orderSelected.id }} Details</h3>
                        <p class="subheading">Order placed by {{ orderSelected.user_name }} (#{{ orderSelected.user_id }})</p>
                    </div>

                    <v-spacer></v-spacer>

                    <v-btn fab color="transparent" dark small @click="close()">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <p>All Dispatches <strong class="red--text">SHOULD</strong> be made from the Main Store</p>

                    <div v-if="orderSelected">
                        <order-details
                            :obj="obj"
                            :order="orderSelected"
                            :stores="stores"
                            @close="close"
                        ></order-details>
                    </div>
                    <v-alert v-else :value="true" type="warning">
                        No Order Selected
                    </v-alert>
                </v-card-text>

                <v-card-actions>
                    <v-btn dark outlined color="orange" @click="close" :loading="saveLoader">Close</v-btn>
                </v-card-actions>
            </v-card>

        </v-dialog>

    </div>
</template>

<script>
import { ordersMixin } from "@sync/libs/inventory/ordersMixin";
import OrderDetails from "./partials/OrderDetails";
import { mapActions, mapGetters } from "vuex";

export default {
    mixins: [
        ordersMixin,
    ],

    components: {
        OrderDetails,
    },

    data() {
        return {
            decoratorKey: "incoming",
            orderSelected: null,
            dialog: false,
            stores: null,
            loading: false,
        };
    },

    computed: {
        ...mapGetters([
            "getStores",
        ]),

        initialised() {
            return this.list;
        },

        list() {
            return this.obj.orders;
        },

        headers() {
            return this.list.headers;
        },

        meta() {
            return this.list.meta;
        },

        links() {
            return this.list.links;
        },

        actionCompleted() {
            return this.obj.actionCompleted;
        },
    },

    watch: {
        getStores(val) {
            if (val) {
                this.stores = _.filter(val.data, (item) => {
                    return item.name.toLowerCase().split(" ").includes("main");
                });
            }
        },

        actionCompleted(val) {
            if (val) {
                // this.close()
                this.fetch();
            }
        },
    },

    methods: {
        ...mapActions([
            "setStores",
        ]),

        initialise() {
            this.fetch();

            this.setStores();
        },

        async fetch(page = null, update_sync = false) {
            this.saveLoader = true;
            this.loading = true;

            const sloppy_page_query = update_sync ? page + "&update_sync=true" : page;

            const response = await this.obj.get(this.decoratorKey, sloppy_page_query);

            if (response) {
                this.loading = false;
            }
        },

        navigate(page) {
            this.fetch(page);
        },

        preview(order) {
            this.orderSelected = order;
            this.dialog = true;
        },

        close() {
            this.orderSelected = null;
            this.dialog = false;
        },
    },

    mounted() {
        //
    },
};
</script>

<style scoped lang="scss">

</style>
