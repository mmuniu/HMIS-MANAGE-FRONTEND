/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 27/08/2019
* Time: 03:49
*/

<template>
    <div>
        <v-card class="px-3">
            <v-card-title>
                <v-row >
                    <v-col cols="12" md="3">
                        <h3 class="title">Match Products</h3>
                    </v-col>

                    <v-col cols="2" md="2">
                        <collabmed-loading :size="30" v-if="authorizing">
                            Authorizing...
                        </collabmed-loading>
                    </v-col>

                    <v-col cols="12" md="7">
                        <collabmed-loading :size="20" v-if="! initialised"></collabmed-loading>

                        <div v-else>
                            <v-autocomplete
                                    v-model="selectedFacility"
                                    :items="facilities"
                                    label="Select a Sync Facility First"
                                    item-value="identifier" item-text="name"
                                    return-object
                                    class="ml-2"
                            >
                            </v-autocomplete>
                        </div>

                    </v-col>
                </v-row>
            </v-card-title>

            <v-card-text>

                <div v-if="selectedFacilityUrl">

                    <product-matching-form
                            :selected-facility="selectedFacility"
                            @saved="fetch()"
                    ></product-matching-form>

                </div>

                <v-alert v-else :value="true" type="info">
                    Select Sync Facility to Proceed with Matching new products
                </v-alert>

            </v-card-text>
        </v-card>

        <v-card class="px-3 mt-4">

            <v-card-title>
                <h4 class="title">Matched Products</h4>

                <v-spacer></v-spacer>

                <v-text-field v-model="search"
                              label="Search Table"
                              prepend-inner-icon="search"
                              hint="Local/Remote product name, user, facility"
                ></v-text-field>
            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="! initialised"></collabmed-loading>

                <div v-else>
                    <v-data-table :headers="list.headers"
                                  :items="list.data"
                                  :loading="saveLoader"
                                  :search="search"
                                  no-data-text="No product matches set yet"
                                  hide-default-footer
                    >
                        <template v-slot:item.facility_name="{ item }">
                            {{ item.sync_facility_id }}
                            <br/>
                            <small v-if="item.facility" class="caption grey--text">{{ item.facility.name}}</small>
                        </template>
                        <template v-slot:item.local_product_name="{ item }">
                            {{ item.local_product_name }}
                            <p class="caption grey--text">#{{ item.local_product_id }}</p>
                        </template>
                        <template v-slot:item.remote_product_name="{ item }">
                            {{ item.remote_product_name }}
                            <p class="caption grey--text">#{{ item.remote_product_id }}</p>
                        </template>
                        <template v-slot:item.user="{ item }">
                            <p v-if="item.user">{{ item.user.full_name }}</p>
                            <p v-else class="caption grey--text">#{{ item.user_id }}</p>
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <v-tooltip top>
                                <template v-slot:activator="{ on }">
                                    <v-btn v-on="on" dark icon small color="red" :loading="saveLoader" @click="deleteMatch(item)">
                                        <v-icon small>delete</v-icon>
                                    </v-btn>
                                </template>
                                <span>Delete Match</span>
                            </v-tooltip>
                        </template>
                    </v-data-table>
                </div>

            </v-card-text>
        </v-card>

    </div>
</template>

<script>
import { ordersMixin } from "@sync/libs/inventory/ordersMixin";
import ProductMatchingForm from "@sync/components/inventory/partials/ProductMatchingForm";

export default {
    mixins: [
        ordersMixin,
    ],

    components: {
        ProductMatchingForm,
    },

    data() {
        return {
            decoratorKey: "product-matches",
            selectedFacility: null,
            selectedFacilityUrl: null,
            search: "",
        };
    },

    computed: {
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

        authorizing() {
            return this.facilityObj.authorizing;
        },

        hasAuthorized() {
            return this.facilityObj.hasAuthorized;
        },

        accessToken() {
            return this.facilityObj.accessToken;
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

        actionCompleted(val) {
            if (val) {
                this.saveLoader = false;
                this.fetch();
            }
        },
    },

    methods: {
        initialise() {
            this.fetch();
            this.setSyncFacilities();
        },

        fetch(page = null) {
            this.saveLoader = true;
            this.obj.get(this.decoratorKey, page);
        },

        navigate(url) {
            if (url) {
                const page = url.substring(url.indexOf("page=")).split("page=")[1];

                this.fetch(page);
            }
        },

        deleteMatch(match) {
            this.$swal({
                title: "Delete This Match?",
                html: "Are you sure you want to delete this match?",
                animation: false,
                customClass: "animated fadeInUp",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes! Do It!",
            }).then((result) => {
                if (result.value) {
                    const data = {
                        id: match.id,
                    };

                    const url = route("api.sync.inventory.action.store", ["product-matches", "destroy"]).relative();

                    this.saveLoader = true;
                    return this.obj.performAction(url, data);
                }
            });
        },
    },

    mounted() {
        //
    },
};
</script>

<style scoped lang="scss">

</style>
