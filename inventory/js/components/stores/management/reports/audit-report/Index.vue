<template>
    <v-card flat style="margin-left: -15px;width: 102%;">
        <v-card-actions class="subheading grey--text text--darken-3">
            <v-btn @click="$router.go(-1)" icon small>
                <v-icon>arrow_back</v-icon>
            </v-btn>

            <v-spacer/>
            <span>Stock dispatch audit report</span>

            <v-spacer/>
        </v-card-actions>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <StockAuditReportFilters @filtered="filterResults"></StockAuditReportFilters>

            <collabmed-loading v-if="!initialised"></collabmed-loading>

            <div v-else>
                <v-data-table
                        :headers="headers"
                        :items="dispatches.data"
                        disable-pagination
                        hide-default-footer
                ></v-data-table>
                <v-row>
                    <v-col md="2">
                        <h6 class="grey--text">Total amount: {{ dispatches.total }}</h6>
                    </v-col>
                    <v-col class="text-center">
                        <collabmed-paginator v-if="dispatches.meta"
                                             :meta="dispatches.meta"
                                             @change="navigate">
                        </collabmed-paginator>
                    </v-col>
                </v-row>
            </div>
        </v-card-text>
    </v-card>
</template>
<script>
import Filters from './Filters';
import { mapGetters, mapActions } from 'vuex';
import Dispatch from '@inventory/libs/stores/dispatches/Dispatch';

export default {
    components: {
        'StockAuditReportFilters': Filters,
    },

    data: () => ({
        page: 1,
        dispatch: new Dispatch(),
        params: {},
        headers: [
            { text: 'Item', value: 'item_name' },
            { text: 'Ordered', value: 'ordered' },
            { text: 'Dispatched', value: 'dispatched' },
            { text: 'cost', value: 'cost' },
            { text: 'Total', value: 'total' },
            { text: 'Date', value: 'date' },
        ],
    }),

    computed: {
        ...mapGetters({
            dispatches: 'getDispatchesReport',
        }),

        initialised() {
            return this.dispatches.data;
        },
    },

    methods: {
        ...mapActions([
            'setDispatchesReport',
        ]),

        navigate(page) {
            this.page = page;

            this.initialize();
        },

        filterResults(params) {
            this.params = params;
            this.initialize();
        },

        initialize() {
            this.params.dispatching_store = this.$route.params.storeId;

            this.requestingStoreCheck();

            this.setDispatchesReport({
                page: this.page,
                params: this.params,
            });
        },

        requestingStoreCheck(){
            if(this.params.requesting_store === this.$route.params.storeId) {
                this.params.requesting_store = null;
            }
        }
    },

    mounted () {
        this.initialize();
    }
};
</script>
