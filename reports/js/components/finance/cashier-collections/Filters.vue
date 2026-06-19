<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row  >
                <v-col md="3" class="px-2">
                    <v-autocomplete
                            :items="facilities.facilities"
                            outline
                            v-model="filters.facility_id"
                            color="blue-grey lighten-2"
                            label="Select Facility"
                            item-text="name"
                            clearable
                            @click:clear="facilityCleared"
                            item-value="id"
                    ></v-autocomplete>
                </v-col>
                <v-col md="3" class="px-2">
                    <users-search
                            @results="setCashier"
                            leaveSelected
                            @clearedSelected="clearedCashier()"
                    ></users-search>
                </v-col>

                <v-col cols="12" md="2" class="px-2">
                    <v-autocomplete
                            :items="paymentModes"
                            outline
                            color="blue-grey lighten-2"
                            v-model="filters.payment_mode"
                            label="Payment mode"
                            item-text="text"
                            item-value="value"
                            clearable
                            @click:clear="paymentModeCleared()"
                    ></v-autocomplete>
                </v-col>

                <v-col md="2" class="px-2">
                    <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="2" class="px-2">
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
    name: "cashier-filters",

    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    data: () => ({
        loading: false,
        search: "",
        filename: "Cashier Collections Report",
        filters: {
            start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
            end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
            user_id: "",
            facility_id: "",
        },
    }),

    computed: {
        ...mapGetters({
            facilities: "getFacilities",
            users: "getUsers",
        }),

        url() {
            return "/api/reports/module/finance/cashier-collections";
        },

        paymentModes() {
            return [
                { text: "Cash", value: "cash" },
                { text: "Mpesa", value: "mpesa" },
                { text: "Credit card", value: "card" },
                { text: "Cheque", value: "cheque" },
            ];
        },
    },

    methods: {
        ...mapActions([
            "setFacilities", "setUsers",
        ]),

        paymentModeCleared() {
            this.filters.payment_mode = null;
        },

        clearedCashier() {
            this.filters.user_id = null;
        },

        facilityCleared() {
            this.filters.facility_id = null;
        },

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },

        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        setCashier(cashier) {
            this.filters.user_id = cashier.id;
        },

        async fetchData() {
            const params = _.omitBy(this.filters, _.isNil);

            try {
                const response = await axios.get(route("api.reports.payments.cash"), { params: params });

                this.loading = false;

                return response.data.data;
            } catch (error) {
                alert("Your search has crashed due to the large number of records fetched. Try and chunk the results");

                location.reload();

                this.loading = false;
            }
        },

        startDownload() {
            this.loading = true;
        },

        finishDownload() {
            this.loading = false;
        },

        filter() {
            this.obj.filters = _.omitBy(this.filters, _.isNil);

            this.$emit("filter");
        },
    },

    mounted() {
        this.setFacilities();
        this.setUsers();

        window.events.$on("STORE_SET_ACTION_LOADING", (val) => {
            this.loading = val;
        });
    },
};
</script>
