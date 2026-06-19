<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row  >
                <v-col cols="12" md="2">
                    <div class="mx-2">
                        <product-search @results="productSelected" @selectionCleared="productCleared" :un-clear-selected="true"></product-search>
                    </div>
                </v-col>

                <v-col cols="12" md="2">
                    <div class="mx-2">
                        <users-search @results="userSelected" :leave-selected="true" @clearedSelected="userSelectionCleared"></users-search>
                    </div>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker @input="setStartDate" outline :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker @input="setEndDate" outline :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>

                <v-col>
                    <v-btn @click="filter()" large color="success">filter</v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import moment from "moment";
import ProductSearch from "@inventory/components/ProductsSearch";

export default {
    components: {
        ProductSearch, 
    },

    data() {
        return {
            filters: {
                start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
                end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
                store_id: this.$route.params.storeId,
                product_id: null,
                user_id: null,
            },
        };
    },

    computed: {
        ...mapGetters({
            users: "getUsers",
            stockMovements: "getStockMovement",
        }),
    },

    methods: {
        ...mapActions([
            "setUsers",
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
            this.$emit("stockMovementsFiltered", this.filters);
        },
    },

    mounted() {
        this.setUsers();
    },
};
</script>
