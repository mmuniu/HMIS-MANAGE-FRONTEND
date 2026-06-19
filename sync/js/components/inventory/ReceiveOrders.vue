/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 27/08/2019
* Time: 02:10
*/

<template>
    <div>

        <v-card>
            <v-card-title>
                <div>
                    <h3 class="title">Receive Order</h3>
                    <p>View Dispatched Orders from other facilities ready for processing</p>
                </div>

                <v-spacer></v-spacer>

                <v-btn v-if="selectedFacility && selectedFacilityUrl" color="green" :loading="saveLoader" small dark outline @click="fetch()">
                    <v-icon class="mr-2">cached</v-icon>
                    Refresh
                </v-btn>

                <v-tooltip top>
                    <v-btn color="purple" small outline slot="activator">
                        <span v-if="currentFacilityIdentifier">{{ currentFacilityIdentifier }}</span>
                        <span v-else>NOT SET!</span>
                    </v-btn>
                    <span>Current Facility Identifier</span>
                </v-tooltip>

            </v-card-title>

            <v-card-text>
                <collabmed-loading v-if="! initialised"></collabmed-loading>

                <div v-else>

                    <v-row >
                        <v-col cols="12" sm="6">
                            <v-select
                                    v-model="selectedFacility"
                                    :items="facilities"
                                    label="Select a Facility First"
                                    item-value="identifier" item-text="name"
                                    return-object
                                    class="ml-2"
                            >
                            </v-select>
                        </v-col>

                        <v-col cols="12" sm="6">
                            <div class="text-center">

                                <div v-if="authorizing">
                                    Authorizing...
                                    <v-progress-circular
                                            indeterminate
                                            color="primary"
                                    ></v-progress-circular>
                                </div>
                            </div>
                        </v-col>
                    </v-row>

                    <div v-if="selectedFacility && selectedFacilityUrl">

                        <v-divider inset></v-divider>

                        <div v-if="list && list.data">

                            <v-data-table :headers="headers"
                                          :items="list.data"
                                          :loading="saveLoader"
                                          no-data-text="No orders dispatched yet"
                                          hide-default-footer
                                          disable-initial-sort
                            >
                                <template v-slot:item.order_details="{ item }">
                                    <div v-if="props.item.detail">
                                        <span>{{ props.item.detail.product_name }}</span>
                                        <span class="grey--text">{{ props.item.detail.product_id }}</span>
                                        <br/>
                                        <span>Requested Quantity: <span class="grey--text">{{ props.item.detail.quantity }}</span></span>
                                    </div>
                                </template>
                                <template v-slot:item.user_name="{ item }">
                                    <p v-if="props.item.user_name">{{ props.item.user_name }}</p>
                                    <p v-else>#{{ props.item.user_id }}</p>
                                </template>
                                <template v-slot:item.created_at="{ item }">
                                    {{ props.item.created_at }}
                                    <p class="grey--text" v-if="props.item.created_at_w3c">{{ props.item.created_at_w3c | moment('from') }}</p>
                                </template>
                                <template v-slot:item.actions="{ item }">
                                    <div v-if="props.item.is_received">
                                        Received by: <span class="font-weight-bold">{{ props.item.received_by_name }}</span>
                                    </div>

                                    <div v-else>
                                        <v-btn small dark color="green" @click="receiveDispatch(props.item)">
                                            <v-icon>done</v-icon>
                                            Receive
                                        </v-btn>

                                        <v-btn small outline color="red" @click="rejectDispatch(props.item)">
                                            <v-icon>cancel</v-icon>
                                            Reject
                                        </v-btn>
                                    </div>
                                </template>

                                <template slot="footer">
                                    <collabmed-paginator :meta="meta" @change="navigate"></collabmed-paginator>
                                </template>

                            </v-data-table>

                        </div>

                        <v-alert v-else type="info" outline :value="true">
                            No Records Found
                        </v-alert>

                    </div>
                </div>

            </v-card-text>
        </v-card>

        <v-dialog v-model="dialog.receive" max-width="500px" persistent>
            <v-card v-if="selectedDispatch">
                <v-card-title primary-title class="blue white--text">
                    <div>
                        <p class="headline">Receive Dispatch #{{ selectedDispatch.id }}</p>
                    </div>

                    <v-spacer></v-spacer>

                    <v-btn fab color="transparent" dark small @click="close()">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>

                    <table class="table table-striped">
                        <tbody>
                            <tr>
                                <td class="font-weight-bold">Quantity:</td>
                                <td>{{ selectedDispatch.quantity }}</td>
                            </tr>
                        </tbody>
                    </table>

                    <v-select
                            v-model="obj.receiveOrders.store_id"
                            :items="stores"
                            label="Select Receiving Store"
                            item-text="name"
                            item-value="id"
                    ></v-select>

                </v-card-text>

                <v-card-actions>
                    <v-btn color="blue" flat @click="close()">Close</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" dark @click="save()">Receive Dispatch</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>
import { ordersMixin } from "@sync/libs/inventory/ordersMixin";
import { mapActions, mapGetters } from "vuex";

export default {
    mixins: [
        ordersMixin,
    ],

    data() {
        return {
            decoratorKey: "receive-orders",
            orderSelected: null,
            dialog: {
                receive: false,
                reject: false,
            },
            stores: null,
            modal: false,
            selectedFacility: null,
            selectedFacilityUrl: null,
            selectedDispatch: null,
        };
    },

    computed: {
        ...mapGetters([
            "getStores",
        ]),

        initialised() {
            return this.stores && this.facilities;
        },

        user() {
            return this.userObj.selected;
        },

        list() {
            return this.obj.actionData;
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

        actionAsyncCompleted() {
            return this.obj.actionAsyncCompleted;
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
                this.close();
            }
        },

        actionAsyncCompleted(val) {
            if (val) {
                this.fetch();
                this.close();
            }
        },

        selectedFacility(val) {
            this.saveLoader = true;
            this.selectedFacilityUrl = null;
            this.obj.receiveOrders.items = [];

            if (val.token) {
                this.facilityObj.getAccessToken(val);
            } else {
                flash({ alert: "warning", message: "No access token set for the facility. No action shall proceed" });
                this.facilityObj.authorizing = false;
            }
        },

        hasAuthorized(val) {
            this.saveLoader = false;

            if (val) {
                if (this.selectedFacility) {
                    this.selectedFacilityUrl = this.selectedFacility.url;
                }

                this.obj.receiveOrders.items = [];

                this.facilityObj.hasAuthorized = false;

                // fetch orders now
                this.fetch();
            }
        },
    },

    methods: {
        ...mapActions([
            "setStores",
        ]),

        initialise() {
            this.setSyncFacilities();
            this.setStores();
            this.getConfig();
        },

        fetch(page = null) {
            let url = this.selectedFacilityUrl;
            url = this.validateDomainUrl(url);
            url = this.buildUrl(url, "data");

            this.saveLoader = true;
            this.obj.performActionOnRemote(url, page);
        },

        validateDomainUrl(url) {
            if (url.substr(-1) != "/") {
                url += "/";
            }
            return url;
        },

        buildUrl(url, action) {
            url += `api/sync/client-guard/inventory/${this.decoratorKey}/action/${action}`;
            return url;
        },

        navigate(page) {
            this.fetch(page);
        },

        preview(order) {
            this.orderSelected = order;
            this.dialog = true;
        },

        close() {
            this.dialog.receive = false;
            this.dialog.reject = false;
            this.selectedDispatch = null;
        },

        receiveDispatch(dispatch) {
            this.selectedDispatch = dispatch;
            this.dialog.receive = true;
        },

        rejectDispatch(dispatch) {
            this.selectedDispatch = dispatch;
            this.dialog.reject = true;
        },

        save() {
            if (! this.obj.receiveOrders.store_id) {
                flash({ message: "Please select a store to proceed", alert: "error" });
                return;
            }

            if (! this.selectedDispatch.detail) {
                flash({ message: "The dispatch has no detail! Item is, therefore, unreceivable", alert: "error" });
                return;
            }

            this.obj.receiveOrders.items.push({
                id: this.selectedDispatch.id,
                order_id: this.selectedDispatch.order_id,
                remote_product_id: this.selectedDispatch.detail.product_id,
                quantity: this.selectedDispatch.quantity,
            });

            const url = route("api.sync.inventory.action.store", ["receive-orders", "receiveOrder"]).relative();
            const data = this.obj.receiveOrders;
            data.facility = this.selectedFacility;
            data.facility_access_token = this.facilityObj.visa();

            this.saveLoader = true;
            this.obj.performActionAsync(url, data);
        },
    },

    mounted() {
        //
    },
};
</script>

<style scoped lang="scss">

</style>
