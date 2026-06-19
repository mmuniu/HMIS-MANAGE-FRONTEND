<template>
    <v-card flat style="margin-left: -15px;width: 102%;">
        <v-card-actions class="subheading grey--text text--darken-3">
            <v-btn :to="backToAnalytics" icon small>
                <v-icon>arrow_back</v-icon>
            </v-btn>

            <v-spacer/>
            <span>Stock Value</span>

            <v-spacer/>
        </v-card-actions>

        <v-divider class="my-0"></v-divider>

        <v-card-text>
            <collabmed-loading v-if="storeProducts.data.length < 1"></collabmed-loading>

            <v-data-table
                    :headers="headers"
                    v-else
                    hide-default-footer
                    :items="storeProducts.data"
                    class="elevation-1"
            >
                <template slot="footer" v-if="storeProducts.links">
                    <v-card-actions>
                        <span> Total records count: {{ storeProducts.meta.total }}</span>
                        <v-spacer></v-spacer>
                        <v-pagination
                                v-model="page"
                                :length="storeProducts.meta.last_page"
                                circle
                                :total-visible="8"
                        ></v-pagination>
                        <v-spacer></v-spacer>
                        <v-btn icon @click="navigate(storeProducts.links.prev)">
                            <v-icon>chevron_left</v-icon>
                        </v-btn>

                        <v-btn icon @click="navigate(storeProducts.links.next)">
                            <v-icon>chevron_right</v-icon>
                        </v-btn>
                    </v-card-actions>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapGetters, mapActions } from "vuex";

export default {
    data: () => ({
        page: 1,
        headers: [
            { text: "Product", value: "name" },
            { text: "Quantity", value: "Quantity" },
            { text: "Cost", value: "cost" },
            { text: "Total", value: "total" },
        ],
    }),

    computed: {
        ...mapGetters({
            storeProducts: "getStoreProducts",
        }),

        backToAnalytics() {
            const storeId = this.$route.params.storeId;
            return `/inventory/stores/${storeId}/store-reports`;
        },
    },


    watch: {
        page(value) {
            this.setStoreProducts({
                page: value,
                params: {
                    store_id: this.$route.params.storeId,
                },
            });
        },
    },

    methods: {
        ...mapActions([
            "setStoreProducts",
        ]),

        navigate(url) {
            if (url) {
                const page = url.substring(url.indexOf("page=")).split("page=")[1];
                this.page = toNumber(page);

                this.setStoreProducts({
                    page: page,
                    params: {
                        store_id: this.$route.params.storeId,
                    },
                });
            }
        },
    },

    mounted() {
        this.setStoreProducts({
            params: {
                store_id: this.$route.params.storeId,
            },
        });
    },
};
</script>
