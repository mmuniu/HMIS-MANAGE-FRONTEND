/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 29/08/2019
* Time: 16:10
*/

<template>
    <div class="">
        <v-row >
            <v-col cols="12" md="4">

                <local-product-search
                        label="This product in this system..."
                        @results="setLocalProduct"
                ></local-product-search>

            </v-col>

            <v-col cols="12" md="2">
                <p class="font-weight-bold title mt-3 text-center">--MATCHES--</p>
            </v-col>


            <v-col cols="12" md="4">
                <div v-if="selectedFacility.url">
                    <remote-product-search
                            label="... this product in remote facility"
                            :domain-url="selectedFacility.url"
                            @results="setRemoteProduct"
                    ></remote-product-search>
                </div>
                <div v-else>
                    Select a Sync Facility to Proceed
                </div>
            </v-col>
        </v-row>

        <v-row  class="matching-section">
            <v-col cols="12" md="4">
                <v-row  v-if="localProduct.id">
                    <v-col cols="10">
                        <p class="title">{{ localProduct.name }}</p>
                        <p class="caption grey--text">#{{ localProduct.id }}</p>
                    </v-col>
                    <v-col cols="2">
                        <v-btn small fab color="red" dark @click="removeLocalProduct()">
                            <v-icon>delete</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>

                <p v-else>
                    Select local product to Proceed
                </p>

            </v-col>

            <v-col cols="12" md="4" offset-md="1" class="border-left-1">
                <v-row  v-if="remoteProduct.id">
                    <v-col cols="10">
                        <p class="title">{{ remoteProduct.name }}</p>
                        <p class="caption grey--text">#{{ remoteProduct.id }}</p>
                    </v-col>
                    <v-col cols="2">
                        <v-btn small fab color="red" dark @click="removeRemoteProduct()">
                            <v-icon>delete</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>

                <p v-else>
                    Select remote product to Proceed
                </p>
            </v-col>

            <v-col cols="12" md="2" class="border-left-1">
                <v-btn color="primary"
                       large block
                       :loading="saveLoader"
                       :disabled="! remoteProduct.id || ! localProduct.id"
                       @click="save()"
                >
                    Match
                </v-btn>
            </v-col>

            <v-col cols="12" md="12">
                <div v-if="errors.any()">
                    <div v-html="errors.display()"></div>
                </div>
            </v-col>

        </v-row>
    </div>
</template>

<script>
import RemoteProductSearch from "./RemoteProductSearch";
import LocalProductSearch from "./LocalProductSearch";
import Order from "@sync/libs/inventory/Order";

export default {
    props: {
        selectedFacility: {
            required: true,
        },
    },

    components: {
        RemoteProductSearch,
        LocalProductSearch,
    },

    data() {
        return {
            obj: new Order(),
            localProduct: {},
            remoteProduct: {},
            saveLoader: false,
        };
    },

    computed: {
        submitted() {
            return this.obj.form.submitted;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },

        errors() {
            return this.obj.form.errors;
        },

        actionCompleted() {
            return this.obj.actionCompleted;
        },
    },

    watch: {
        submitted() {
            this.saveLoader = false;
        },

        contaminated(val) {
            this.saveLoader = false;
            if (val) {
                this.obj.form.errorDetected = false;
            }
        },

        actionCompleted(val) {
            if (val) {
                this.saveLoader = false;
                this.dialog = false;
                this.obj.saved = false;

                this.removeLocalProduct();
                this.removeRemoteProduct();

                this.$emit("saved", true);
            }
        },
    },

    methods: {
        setLocalProduct(product) {
            this.localProduct = {
                id: product.id,
                name: product.name,
            };
        },

        setRemoteProduct(product) {
            this.remoteProduct = {
                id: product.id,
                name: product.name,
            };
        },

        removeLocalProduct() {
            this.localProduct = {};
        },

        removeRemoteProduct() {
            this.remoteProduct = {};
        },

        save() {
            if (! this.localProduct.hasOwnProperty("id")) {
                flash({ message: "Please select a local product", alert: "error" });
                return;
            }

            if (! this.remoteProduct.hasOwnProperty("id")) {
                flash({ message: "Please select a remote product", alert: "error" });
                return;
            }

            const data = {
                sync_facility_id: this.selectedFacility.id,
                sync_facility_name: this.selectedFacility.name,
                sync_facility_url: this.selectedFacility.url,
                local_product_id: this.localProduct.id,
                local_product_name: this.localProduct.name,
                remote_product_id: this.remoteProduct.id,
                remote_product_name: this.remoteProduct.name,
            };

            const url = route("api.sync.inventory.action.store", ["product-matches", "persist"]).relative();

            this.saveLoader = true;
            this.obj.performAction(url, data);
        },
    },

    mounted() {
        //
    },
};
</script>

<style scoped lang="scss">
    .matching-section {
        border: 1px dashed #0a6ebd;

        .flex {
            padding: 1rem;
        }

        .border-left-1 {
            border-left: 1px solid #e3e3e3;
        }
    }
</style>
