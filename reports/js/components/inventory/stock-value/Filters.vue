<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row  >

                <v-col md="3" class="px-2">
                    <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="3" class="px-2">
                    <collabmed-date-time-picker small outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>
            </v-row>
            <v-row >
                <v-col>
                    <v-btn small color="success" @click="filter()">Filter</v-btn>
                    <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>
<script>
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
    name: "stock-value-filters",

    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    data() {
        // Try to get saved filters from localStorage
        const savedFilters = localStorage.getItem('stock-value-filters');
        const defaultFilters = {
            start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
            end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
            // user: '',
            // s_id: '',
            // item: ''
        };

        return {
            loading: false,
            search: "",
            filename: "Cashier Collections Report",
            filters: savedFilters ? JSON.parse(savedFilters) : defaultFilters,
        };
    },

    // components: {
    //     "suppliers-search": require("@inventory/components/searches/Suppliers"),
    //     "item-search": require("@inventory/components/ProductsSearch"),
    // },

    computed: {
        url() {
            return "/api/reports/module/inventory/stock-value";
        },

    },

    methods: {
        // setSupplier(data){
        //     this.filters.s_id = data.id;
        // },

        // clearedSupplier(){
        //     this.filters.s_id = null
        // },

        // setItem(data){
        //     this.filters.item = data.id;
        // },

        // clearedItem(){
        //     this.filters.item = null
        // },

        setStartDate(datetime) {
            this.filters.start_date = datetime;
            this.saveFiltersToLocalStorage();
        },

        setEndDate(datetime) {
            this.filters.end_date = datetime;
            this.saveFiltersToLocalStorage();
        },

        saveFiltersToLocalStorage() {
            localStorage.setItem('stock-value-filters', JSON.stringify(this.filters));
        },

        // setUser(user){
        //     this.filters.user = user.id;
        // },
        //a
        // clearedUser(){
        //     this.filters.user = null;
        // },

        startDownload() {
            this.loading = true;
        },

        finishDownload() {
            this.loading = false;
        },

        filter() {
            this.obj.filters = _.omitBy(this.filters, _.isNil);
            this.saveFiltersToLocalStorage();

            this.$emit("filter");
        },
    },

    mounted() {
        window.events.$on("STORE_SET_ACTION_LOADING", (val) => {
            this.loading = val;
        });
    },
};
</script>
