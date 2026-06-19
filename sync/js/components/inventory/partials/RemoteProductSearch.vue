/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-07-11
* Time: 15:04
*/
<template>
    <v-autocomplete outline clearable
                    :label="label"
                    class="mb-4"
                    :items="products"
                    item-text="name"
                    v-model="product"
                    hide-no-data
                    return-object
                    @change="selectItem()"
                    :search-input.sync="search"
                    :loading="loading"
                    :hint="placeholder"
    >
        <template slot="item" slot-scope="{ item }">
            <v-list-tile-content>
                <v-list-tile-title class="caption" v-text="item.name"></v-list-tile-title>
            </v-list-tile-content>
        </template>
    </v-autocomplete>
</template>

<script>
import _ from "lodash";
import Order from "@sync/libs/inventory/Order";

export default {
    name: "sync-remote-products-search",

    props: {
        domainUrl: {
            required: true,
            type: String,
        },

        decoratorKey: {
            default: "products",
        },

        label: {
            type: String,
            default: "Search and select product from selected facility",
        },
    },

    data() {
        return {
            obj: new Order(),
            product: null,
            search: "",
            loading: false,
            placeholder: "",
        };
    },

    computed: {
        products() {
            if (this.obj.products.hasOwnProperty("data")) {
                return this.obj.products.data;
            }

            return this.obj.products;
        },

        submitted() {
            return this.obj.form.submitted;
        },
    },

    watch: {
        search(term) {
            if (term && term.length > 2 && this.product === null) {
                this.placeholder = "";
                this.searchProducts(term);
            } else if (term) {
                this.placeholder = "Enter " + (3 - term.length) + " more characters";
            }
        },

        submitted(val) {
            this.loading = false;
        },
    },

    methods: {

        searchProducts: _.debounce(function search(search) {
            this.loading = true;

            let url = this.domainUrl;
            url = this.validateDomainUrl(url);
            url = this.buildUrl(url);
            url += `?search=${search}&no_pagination=true`;

            this.obj.searchProduct(url);
        }, 700),

        validateDomainUrl(url) {
            if (url.substr(-1) != "/") {
                url += "/";
            }
            return url;
        },

        buildUrl(url) {
            url += `api/sync/client-guard/inventory/${this.decoratorKey}`;
            return url;
        },

        selectItem() {
            this.$emit("results", this.product);
            this.obj.products = [];
            this.product = null;
        },
    },
};
</script>
