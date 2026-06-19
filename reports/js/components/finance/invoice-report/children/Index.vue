<template>
    <v-card>
        <v-card-title height="23" class="pt-2 text-center">
            <h4>Cash Summary</h4>
        </v-card-title>

        <collabmed-floating-loader v-if="list.length < 1 || obj.form.loading"></collabmed-floating-loader>

        <v-alert
                :value="true"
                color="success"
                small
                outline
        >
            <strong>
                <small>Your selection is based on the following:</small>
                <h6 v-for="(key, value) in filterInfo" :key="key">
                    <span>{{ value + ': ' + key }}</span><br/>
                </h6>
            </strong>
        </v-alert>

        <div v-if="list.data">
            <v-card-title>
                <download-to-pdf :headers="filteredHeaders" :data="list.data" :filename="filename" :title="report_title"></download-to-pdf>
                <download-to-csv :headers="filteredHeaders" :data="list.data" :filename="filename"></download-to-csv>
                <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>
                <v-spacer></v-spacer>
            </v-card-title>

            <template v-if="list.data.length > 0">
                <v-data-table
                        :headers="revenue_info_headers"
                        :items="list.data"
                        class="elevation-1"
                        hide-default-footer
                        :search="localSearch"
                >
                    <v-row  class="py-2 pb-2">
                        <v-col cols="3" class="pt-3 pl-3">
                            Total Amount: <strong>{{ list.total_amount }}</strong>
                        </v-col>

                        <v-col cols="6" class="text-center">
                            <v-pagination
                                    v-model="page"
                                    :length="list.meta.last_page"
                                    circle
                                    :total-visible="totalVisible"
                            ></v-pagination>
                        </v-col>

                        <v-col cols="3" class="pt-3 pr-3 text-right">
                            Total records count: {{ list.meta.total }}
                        </v-col>
                    </v-row>
                </v-data-table>
            </template>
        </div>
    </v-card>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";


export default {
    mixins: [
        reportsMixin,
    ],

    props: {
        invoiceId: {
            type: [String, Number],
            required: true
        }
    },
    data: () => ({
        list: {
            data: [],
            total_amount: 0,
            meta: { last_page: 1, total: 0 }
        },
        page: 1,
        localSearch: "",
        totalVisible: 8,
        filename: "cash-summary-breakdown",
        report_title: "cash summary report",
        revenue_info_headers: [
            { text: "Patient", value: "patient" },
            { text: "service", value: "procedure" },
            { text: "quantity", value: "quantity" },
            { text: "amount", value: "amount" },
            { text: "Receipt/Invoice no", value: "receipt_or_invoice_no" },
        ],
        filterInfo: {},
        loading: false,
    }),

    computed: {
        filteredHeaders() {
            return this.revenue_info_headers;
        },
    },

    watch: {
        page(val) {
            this.fetchInvoiceData();
        },
    },

    created() {
        this.fetchInvoiceData();
    },

    methods: {
        async fetchInvoiceData() {
            this.loading = true;
            try {
                const response = await this.$http.post('/api/finance/dynamic-item-sent/by-invoice', {
                    invoice_id: this.invoiceId
                });
                this.list.data = response.data.data || [];
                // Optionally set total_amount and meta if your API returns them
                this.list.total_amount = response.data.total_amount || 0;
                this.list.meta = response.data.meta || { last_page: 1, total: this.list.data.length };
            } catch (e) {
                this.$toast && this.$toast.error('Failed to fetch invoice data');
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>
