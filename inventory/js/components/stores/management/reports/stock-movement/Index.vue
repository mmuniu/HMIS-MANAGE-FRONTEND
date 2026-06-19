<template>
    <v-card flat style="margin-left: -15px;width: 102%;">
        <v-card-actions  class="subheading grey--text text--darken-3">
            <v-btn   :to="backToAnalytics" icon small>
                <v-icon>arrow_back</v-icon>
            </v-btn>

            <v-spacer/>
            <span>Stock Movement</span>

            <v-spacer/>
        </v-card-actions>

        <v-divider class="my-0"></v-divider>

        <v-card-text>

            <StockMovementFilters @stockMovementsFiltered="stocksMovementFiltered"></StockMovementFilters>

            <collabmed-loading v-if="stockMovements.length < 1"></collabmed-loading>

            <v-data-table
                    :headers="headers"
                    v-else
                    disable-pagination
                    hide-default-footer
                    :items="stockMovements.data"
                    class="elevation-1"
            >
                <template slot="footer" v-if="stockMovements.links">
                    <v-card-actions>
                        <span> Total records count: {{ stockMovements.meta.total }}</span>
                        <v-spacer></v-spacer>
                        <v-pagination
                                v-model="page"
                                :length="stockMovements.meta.last_page"
                                circle
                                :total-visible="8"
                        ></v-pagination>
                        <v-spacer></v-spacer>
                        <v-btn icon @click="navigate(stockMovements.links.prev)">
                            <v-icon>chevron_left</v-icon>
                        </v-btn>

                        <v-btn icon @click="navigate(stockMovements.links.next)">
                            <v-icon>chevron_right</v-icon>
                        </v-btn>
                    </v-card-actions>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import Filters from './Filters';

export default {
    components: {
        'StockMovementFilters': Filters,
    },

    data: () => ({
        page: 1,
        initialised: false,
        headers: [
            { text: 'Store', value: 'store' },
            { text: 'Action', value: 'action' },
            { text: 'Product', value: 'product' },
            { text: 'Type', value: 'type' },
            { text: 'quantity', value: 'quantity' },
            { text: 'Opening stock', value: 'opening' },
            { text: 'Closing Stock', value: 'closing' },
            { text: 'User', value: 'user' },
            { text: 'Date', value: 'date' },
        ],
        params: null,
    }),

    computed: {
        ...mapGetters({
            stockMovements: 'getStockMovement',
        }),

        backToAnalytics() {
            const storeId = this.$route.params.storeId;
            return `/inventory/stores/${storeId}/store-reports`;
        },
    },

    watch: {
        page(value) {
            this.page = value;

            this.initialize();
        },
    },

    methods: {
        ...mapActions([
            'setStockMovement',
        ]),

        navigate(url) {
            if (url) {
                const page = url.substring(url.indexOf('page=')).split('page=')[1];

                this.page = toNumber(page);

                this.initialize();
            }
        },

        stocksMovementFiltered(params) {
            this.params = _.omitBy(params, _.isNil);

            this.page = 1;

            this.initialize();
        },

        initialize() {
            const self = this;

            this.setStockMovement({
                page: self.page,
                params: self.params,
            });
        },
    },

    mounted() {
        this.setStockMovement({
            params: {
                store_id: this.$route.params.storeId,
            },
        });
    },
};
</script>
