<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row>
                <v-col cols="12" md="2">
                    <div class="mx-2">
                        <v-autocomplete
                                outline clearable
                                persistent-hint
                                label="Requesting store"
                                :items="stores"
                                item-text="name"
                                item-value="id"
                                v-model="filters.requesting_store"
                        ></v-autocomplete>
                    </div>
                </v-col>

                <v-col cols="12" md="2">
                    <div class="mx-2">
                        <product-search @results="productSelected" @selectionCleared="productCleared" :un-clear-selected="true"></product-search>
                    </div>
                </v-col>

<!--                <v-col cols="12" md="2">-->
<!--                    <div class="mx-2">-->
<!--                        <users-search @results="userSelected" :leave-selected="true" @clearedSelected="userSelectionCleared"></users-search>-->
<!--                    </div>-->
<!--                </v-col>-->

                <v-col md="2">
                    <collabmed-date-time-picker @input="setStartDate" outline :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker @input="setEndDate" outline :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>

                <v-col>
                    <v-btn @click="filter()" large color="success">filter</v-btn>
                    <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import moment from 'moment';
import ProductSearch from '@inventory/components/ProductsSearch';
import _ from "lodash";

export default {
    components: {
        ProductSearch,
    },

    data() {
        return {
            filters: {
                start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:MM'),
                end_date: moment(new Date()).format('YYYY-MM-DD HH:MM'),
                requesting_store: this.$route.params.storeId,
                product_id: null,
                user_id: null,
            },
            stores: [],
            filename: 'Dipatches report'
        };
    },

    watch: {
        getStores({ data }) {
            this.stores = _.filter(data, (store) => {
                return store.id !== this.storeId;
            });
        },
    },

    computed: {
        ...mapGetters({
            users: 'getUsers',
            stockMovements: 'getStockMovement',
            getStores: 'getStores'
        }),

        url() {
            return '/api/inventory/dispatchesReport';
        },
    },

    methods: {
        ...mapActions([
            'setUsers', 'setStores'
        ]),

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },

        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        productSelected(product) {
            this.filters.product_id = product.id;
        },

        userSelected(user) {
            this.filters.user_id = user.id;
        },

        productCleared() {
            this.filters.product_id = null;
        },

        userSelectionCleared() {
            this.filters.user_id = null;
        },

        filter() {
            this.$emit('filtered', this.filters);
        },
    },

    mounted() {
        this.setUsers();
        this.setStores();
    },
};
</script>
