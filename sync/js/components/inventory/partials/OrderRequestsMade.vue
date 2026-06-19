/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 23/09/2019
* Time: 18:52
*/

<template>
    <div>

        <v-card>
            <v-card-title>
                <h3 class="title">Orders Previously Made</h3>

                <v-spacer></v-spacer>

                <v-btn dark color="green" small round @click="initialise">
                    <v-icon class="pr-2">cached</v-icon>
                    Refresh
                </v-btn>
            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="! initialised"></collabmed-loading>

                <div v-else>

                    <div v-if="list && list.data">

                        <v-data-table
                                :headers="list.headers"
                                :items="list.data"
                                :loading="saveLoader"
                                :search="searchLocal"
                        >
                            <template v-slot:item.requesting_facility_name="{ item }">
                                <p>{{ item.requesting_facility_name }}</p>
                                <span class="grey--text">{{ item.requesting_facility_name }}</span>
                            </template>
                            <template v-slot:item.user_name="{ item }">
                                <p>{{ item.user_name }}</p>
                                <span class="grey--text">#{{ item.user_id }}</span>
                            </template>
                            <template v-slot:item.created_at="{ item }">
                                <p>{{ item.created_at }}</p>
                                <span>{{ item.created_at_w3c | moment('from') }}</span>
                            </template>
                            <template v-slot:item.delivery_date="{ item }">
                                <p>{{ item.delivery_date }}</p>
                                <span>{{ item.delivery_date_w3c | moment('from') }}</span>
                            </template>
                            <template v-slot:item.actions="{ item }">
                                <v-btn dark color="primary" @click="viewDetails(item)">
                                    <v-icon>assignment</v-icon>
                                    Details
                                </v-btn>
                            </template>
                        </v-data-table>

                        <!-- pagination -->
                        <collabmed-paginator :meta="meta" @change="navigate"></collabmed-paginator>

                    </div>

                    <v-alert type="info" :value="true" outline v-else>
                        No Orders Made Yet
                    </v-alert>
                </div>
            </v-card-text>
        </v-card>

        <v-dialog v-model="dialog" max-width="60%" persistent>
            <v-card v-if="selected">
                <v-card-title primary-title class="blue white--text">
                    <div>
                        <p class="headline"></p>
                    </div>

                    <v-spacer></v-spacer>

                    <v-btn fab color="transparent" dark small @click="close()">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>

                    <div v-if="selected.details">

                        <v-data-table
                                :headers="headers"
                                :items="selected.details"
                                disable-initial-sort
                        >
                            <template v-slot:item.product_name="{ item }">
                                #{{ item.product_id }}
                                <p class="grey--text">{{ item.product_name }}</p>
                            </template>
                            <template v-slot:item.quantity="{ item }">
                                {{ item.quantity | numberFormatInt }}
                            </template>
                        </v-data-table>

                    </div>

                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue" flat @click="close()">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>

export default {
    props: {
        obj: {
            required: true,
            type: Object,
        },

        selectedFacilityUrl: {
            required: true,
            type: String,
        },

        requestingFacilityIdentifier: {
            required: true,
            type: String,
        },
    },

    data() {
        return {
            decoratorKey: "make-order",
            searchLocal: "",
            saveLoader: false,
            dialog: false,
            selected: null,
            headers: [
                { text: "Product", value: "product_name" },
                { text: "Quantity Requested", value: "quantity" },
            ],
        };
    },

    computed: {
        list() {
            return this.obj.actionData;
        },

        meta() {
            return this.list.meta;
        },

        links() {
            return this.list.links;
        },

        initialised() {
            return this.list;
        },

        submitted() {
            return this.obj.form.submitted;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },
    },

    watch: {
        submitted(val) {
            if (val) {
                this.saveLoader = false;
            }
        },

        contaminated(val) {
            this.saveLoader = false;
        },
    },

    methods: {
        initialise() {
            if (! this.requestingFacilityIdentifier) {
                flash({ message: "Current Facility Identifier not set!" });
                return;
            }

            const data = {
                requesting_facility_identifier: this.requestingFacilityIdentifier,
            };

            this.saveLoader = true;
            this.obj.performActionOnRemote(this.constructUrl(), data);
        },

        constructUrl() {
            let url = this.selectedFacilityUrl;
            url = this.validateDomainUrl(url);
            url = this.buildUrl(url);

            return url;
        },

        validateDomainUrl(url) {
            if (url.substr(-1) != "/") {
                url += "/";
            }
            return url;
        },

        buildUrl(url) {
            url += `api/sync/client-guard/inventory/${this.decoratorKey}/action/ordersMade`;
            return url;
        },

        navigate(page) {
            let url = this.constructUrl();
            url += `?page=${page}`;

            this.saveLoader = true;
            this.obj.performActionOnRemote(url, data);
        },

        viewDetails(order) {
            this.selected = order;
            this.dialog = true;
        },

        close() {
            this.selected = null;
            this.dialog = false;
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>

<style scoped lang="scss">

</style>
