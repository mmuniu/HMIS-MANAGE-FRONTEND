/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-07-08
* Time: 16:07
*/

<template>
    <div>
        <v-card class="px-3">
            <v-card-title>
                <div>
                    <h3 class="title">Create Order Requests</h3>
                </div>

                <v-spacer></v-spacer>

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

                        <v-row >
                            <v-col cols="12" md="12">
                                <h4 class="title mb-3">Order Details</h4>
                            </v-col>

                            <v-col cols="12" md="6">

                                <remote-product-search
                                        :domain-url="selectedFacilityUrl"
                                        @results="addProduct"
                                ></remote-product-search>

                            </v-col>

                            <v-col cols="12" md="4" offset-md="2">
                                <div class="mx-3">
                                    <v-menu
                                            ref="menu"
                                            v-model="menu"
                                            :close-on-content-click="false"
                                            :nudge-right="40"
                                            lazy
                                            transition="scale-transition"
                                            offset-y
                                            full-width
                                            max-width="290px"
                                            min-width="290px"
                                    >
                                        <template v-slot:activator="{ on }">
                                            <v-text-field
                                                    v-model="date"
                                                    label="Delivery Date"
                                                    prepend-icon="event"
                                                    readonly
                                                    v-on="on"
                                            ></v-text-field>
                                        </template>

                                        <v-date-picker
                                                v-model="date"
                                                scrollable
                                                :min="minDate"
                                                @input="menu = false"
                                        ></v-date-picker>
                                    </v-menu>
                                </div>
                            </v-col>

                        </v-row>

                        <v-data-table :headers="headers"
                                      :items="obj.orderRequest.items"
                                      no-data-text="No items added yet"
                                      hide-default-footer
                                      disable-initial-sort
                        >
                            <template v-slot:item.name="{ item }">
                                {{ item.product_name }}
                                <p class="grey--text"># {{ item.product_id }}</p>
                            </template>
                            <!--<td>{{ item.stock }}</td>-->
                            <template v-slot:item.matches_to="{ item }">
                                <div v-if="! item.fetched">
                                    <collabmed-loading type="epic-looping-rhombuses" :size="20">Fetching...</collabmed-loading>
                                </div>
                                <div v-else>
                                        <span v-if="item.local_product_id">
                                            <span>{{ item.local_product_name }}</span>
                                            <br/>
                                            <span class="grey--text">#{{ item.local_product_id }}</span>
                                        </span>

                                    <span v-else class="red--text">
                                            NO MATCH FOUND!
                                            <v-icon small>warning</v-icon>
                                        </span>
                                </div>
                            </template>
                            <template v-slot:item.quantity="{ item }">
                                <v-text-field
                                        type="number"
                                        v-model="item.quantity"
                                        flat
                                        :min="1"
                                ></v-text-field>
                            </template>
                            <template v-slot:item.actions="{ item }">
                                <v-btn icon class="pink--text">
                                    <v-icon class="pink--text" small
                                            @click="removeProduct(item)"
                                    >
                                        delete
                                    </v-icon>
                                </v-btn>
                            </template>

                            <template slot="footer">
                                <v-row  class="mt-4">
                                    <v-col cols="6" md="3">
                                        <v-btn outline color="red" @click="removeAllProducts()" :loading="saveLoader">
                                            Clear Cart
                                        </v-btn>
                                    </v-col>

                                    <v-col cols="6" md="3" offset-md="6" class="text-right">
                                        <v-btn
                                                type="submit"
                                                class="blue caption"
                                                :dark="!saveLoader"
                                                :loading="saveLoader"
                                                :disabled="saveLoader"
                                                large
                                                @click="save"
                                        >
                                            Make an order
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </template>
                        </v-data-table>

                        <v-alert v-if="errors.any()" :value="true" outline type="error">
                            <div v-html="errors.display()"></div>
                        </v-alert>

                    </div>

                    <v-alert v-else type="info" outline :value="true">
                        Please select a Facility to Proceed
                    </v-alert>

                </div>
            </v-card-text>
        </v-card>

        <order-requests-made
                v-if="selectedFacility && selectedFacilityUrl && currentFacilityIdentifier"
                :obj="obj"
                :selected-facility-url="selectedFacilityUrl"
                :requestingFacilityIdentifier="currentFacilityIdentifier"
                class="mt-4"
        ></order-requests-made>

    </div>
</template>

<script>
import { ordersMixin } from "@sync/libs/inventory/ordersMixin";
import RemoteProductSearch from "./partials/RemoteProductSearch";
import User from "@users/libs/users/User";
import OrderRequestsMade from "./partials/OrderRequestsMade";

export default {
    components: {
        RemoteProductSearch,
        OrderRequestsMade,
    },

    mixins: [
        ordersMixin,
    ],

    data() {
        return {
            userObj: new User(),
            selectedFacility: null,
            selectedFacilityUrl: null,
            date: new Date().toISOString().substr(0, 10),
            minDate: new Date().toISOString().substr(0, 10),
            menu: false,
            modal: false,
            headers: [
                { text: "Name", value: "name" },
                { text: "Matches To:", value: "matches_to" },
                { text: "Quantity", value: "quantity" },
                { text: "Actions", value: "actions" },
            ],
            decoratorKey: "make-order",
        };
    },

    computed: {
        initialised() {
            return this.facilities;
        },

        user() {
            return this.userObj.selected;
        },
    },

    watch: {
        selectedFacility(val) {
            this.saveLoader = true;
            this.selectedFacilityUrl = null;
            this.obj.orderRequest.items = [];

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

                this.obj.orderRequest.items = [];

                this.facilityObj.hasAuthorized = false;
            }
        },

    },

    methods: {
        initialise() {
            this.setSyncFacilities();
            this.getConfig();
            this.userObj.getLoggedInUser();
        },

        close() {
            this.dialog = false;
            this.dialogEdit = false;
            this.selected = {};
        },

        async addProduct(product) {
            const timestamp = new Date().getUTCMilliseconds();

            this.obj.orderRequest.items.push({
                uuid: timestamp,
                product_id: product.id,
                product_name: product.name,
                quantity: 1,
                local_product_id: null,
                local_product_name: null,
                fetched: false,
            });

            await this.searchMatch(product);


            const match = this.actionData.data;
            const found = _.find(this.obj.orderRequest.items, { uuid: timestamp });
            found.fetched = true;

            if (match) {
                found.local_product_id = match.local_product_id;
                found.local_product_name = match.local_product_name;
            }
        },

        async searchMatch(product) {
            const data = {
                sync_facility_id: this.selectedFacility.id,
                remote_product_id: product.id,
            };

            const url = route("sync.inventory.action.no-callback", ["product-matches", "getMatches"]).relative();

            await this.obj.performActionAsync(url, data);

            // console.log('actionData', this.actionData)
            return this.actionData;
        },

        removeProduct(product) {
            this.obj.orderRequest.items = _.filter(this.obj.orderRequest.items, (item) => {
                return item.uuid != product.uuid;
            });
        },

        removeAllProducts() {
            this.obj.orderRequest.items = [];
        },

        save() {
            if (! this.date) {
                flash({ alert: "info", message: "Please select a delivery date" });
                return;
            }

            if (this.obj.orderRequest.items.length < 1) {
                flash({ alert: "error", message: "Please select Products to proceed!" });
                return;
            }

            if (! this.validateAllProductsHaveBeenMatched()) {
                flash({ alert: "error", message: "One or more products have not been matched yet!" });
                return;
            }

            if (! this.selectedFacilityUrl) {
                flash({ alert: "error", message: "The Facility URL is not set!" });
                return;
            }

            if (! this.user) {
                flash({ alert: "error", message: "Your credentials could not be fetched. Please refresh page" });
                return;
            }

            this.addExtraRequestData();

            let url = this.selectedFacilityUrl;
            url = this.validateDomainUrl(url);
            url = this.buildUrl(url);

            this.saveLoader = true;
            this.obj.save(url);
        },

        validateDomainUrl(url) {
            if (url.substr(-1) != "/") {
                url += "/";
            }
            return url;
        },

        buildUrl(url) {
            url += `api/sync/client-guard/inventory/${this.decoratorKey}/action/persist`;
            return url;
        },

        addExtraRequestData() {
            this.obj.orderRequest.user_id = this.user.id;
            this.obj.orderRequest.user_name = this.user.name;
            this.obj.orderRequest.delivery_date = this.date;
            this.obj.orderRequest.requesting_facility_identifier = this.currentFacilityIdentifier;
            const found = _.find(this.facilities, { identifier: this.currentFacilityIdentifier });
            if (found) {
                this.obj.orderRequest.requesting_facility_name = found.name;
            }
        },

        validateAllProductsHaveBeenMatched() {
            let allMatched = true;

            _.each(this.obj.orderRequest.items, (item) => {
                if (! item.local_product_id) {
                    allMatched = false;
                }
            });

            return allMatched;
        },

    },

    mounted() {
        this.initialise();
    },
};
</script>

<style scoped lang="scss">

</style>
