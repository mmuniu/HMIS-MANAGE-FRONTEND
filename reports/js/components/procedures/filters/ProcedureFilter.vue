<template>
    <v-container fluid>
        <v-row >
            <div class="d-flex">
                <v-col md="2">
                    <evaluation-procedure-search label="Procedure" @results="procedureSelected"></evaluation-procedure-search>
                </v-col>
                &nbsp;
                <v-col md="2">
                    <evaluation-procedure-search label="Procedure" @results="procedureSelected"></evaluation-procedure-search>
                </v-col>
                &nbsp;
                <v-col md="2">
                    <users-search @results="setCashier"></users-search>
                </v-col>
                &nbsp;
                <v-col md="2">
                    <v-select
                            :items="filters.items"
                            label="Age Range"
                            outline
                    ></v-select>
                </v-col>
                &nbsp;
                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>
                &nbsp;
                <v-col md="2">
                    <collabmed-date-time-picker small outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>
            </div>
            <v-col class="mr-3">
                <v-btn small color="success" @click="filterContent()">Filter</v-btn>
                <download-excel
                        class="v-btn v-btn--small theme--light primary small"
                        :fetch  = "fetchData"
                        :before-generate = "startDownload"
                        :before-finish = "finishDownload"
                        name="cash_summary_report.xls"
                >
                    Excel
                </download-excel>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import moment from "moment";
import { mapActions, mapGetters } from "vuex";

export default {
    name: "procedure-filters",
    data: () => ({
        filters: {
            start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
            end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
            user_id: null,
            items: ["Under", "Over"],
        },

    }),
    computed: {
        ...mapGetters({
            all_cashiers: "getCashPayments",
        }),
    },
    methods: {
        ...mapActions([
            "setCashPayments",
        ]),

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },

        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        setCashier(cashier) {
            // console.log(cashier.id);
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

        filterContent() {
            this.setCashPayments({
                params: this.filters,
            });
        },
        exportContent() {
            window.location = `cash?params=params&export=true&start_date=${this.start_date}&end_date=${this.end_date}`;
        },
        mounted() {
            this.filterContent();
        },
    },
};
</script>
