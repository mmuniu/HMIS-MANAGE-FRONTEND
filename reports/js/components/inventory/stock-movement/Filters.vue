<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row  >
                <v-col cols="12" md="3">
                    <div class="mx-2">
                        <v-autocomplete
                                outline clearable
                                label="Store"
                                :items="stores.data"
                                item-text="name"
                                item-value="id"
                                v-model="filters.store_id"
                        ></v-autocomplete>
                    </div>
                </v-col>

                <v-col cols="12" md="2">
                    <div class="mx-2">
                        <product-search @results="productSelected" @selectionCleared="productCleared" :un-clear-selected="true"></product-search>
                    </div>
                </v-col>

                <v-col cols="12" md="3">
                    <div class="mx-2">
                        <users-search @results="userSelected" leaveSelected label="User"></users-search>
                    </div>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>

                <v-col>
                    <v-btn @click="filter()" small color="success">filter</v-btn>
                    <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
                </v-col>

                <collabmed-floating-loader v-if="loading"></collabmed-floating-loader>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import { mapActions, mapGetters } from "vuex";
import ProductSearch from "@inventory/components/ProductsSearch";

export default {
    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    components: {
        ProductSearch,
    },

    data() {
        return {
            loading: false,
            search: "",
            filename: "Stock movement report",
            filters: {
                start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
                end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
                store_id: null,
                product_id: null,
                user_id: null,
                filter: true,
            },
        };
    },

    computed: {
        url() {
            return "/api/reports/module/inventory/stock-movement";
        },

        ...mapGetters({
            stores: "getStores",
        }),
    },

    methods: {
        ...mapActions([
            "setStores",
        ]),

        productSelected(product) {
            this.filters.product_id = product.id;
        },
        productCleared() {
            // Reset the product ID in the filters when selection is cleared
            this.filters.product_id = null;
        },
        
        userSelected(user) {
            this.filters.user_id = user.id;
        },

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },
        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        filter() {
            this.obj.filters = _.omitBy(this.filters, _.isNil);

            this.$emit("filter");
        },
    },

    mounted() {
        this.setStores();
    },
};
</script>
