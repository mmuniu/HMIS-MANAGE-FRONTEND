<template>
    <v-container fluid>
        <v-row>

            <v-col class="px-2" cols="12" sm="2" >
                <v-autocomplete v-model="filters.scheme"
                                :disabled="insuranceSchemes.length < 1"
                                :items="insuranceSchemes"
                                clearable
                                @click:clear="schemeCleared()"
                                item-text="full_name" item-value="id"
                                label="Insurance Schemes" outline
                ></v-autocomplete>
            </v-col>

            <v-col class="px-2" md="2" >
                <collabmed-date-time-picker dateOnly outline  v-model="filters.start_date" label="Start date"></collabmed-date-time-picker>
            </v-col>

            <v-col class="px-2" md="2" >
                <collabmed-date-time-picker dateOnly outline v-model="filters.end_date" label="End date"></collabmed-date-time-picker>
            </v-col>

            <v-col class="px-2" md="2" v-if="filterPayment">
                <v-select :items="paymentStatus"
                          item-value="value"
                          label="Status"
                          clearable
                          item-text="name"
                          v-model="filters.payment_state"></v-select>
            </v-col>

            <v-col class="px-2" md="2" v-if="filterPayment">
                <v-text-field v-model="filters.invoice_no" label="Invoice"></v-text-field>
            </v-col>

            <v-col class="px-2" md="3">
                <v-btn large color="primary" @click="filter">Filter</v-btn>
                <v-btn large color="purple" class="white--text" @click="clearFilters">Clear</v-btn>
                <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>

export default {
    props: {
        patient: {
            type: Boolean,
            default: false,
        },
        uploadExcel: {
            type: Boolean,
            default: false,
        },

        filterPayment: {
            type: Boolean,
            default: false,
        },

        filename: {
            type: String,
            default: 'excel',
        },

        url: {
            type: String,
            required: true,
        },

        company: {
            type: Object,
            required: true,
        },
    },

    data: () => ({
        insuranceSchemes: [],
        insurance_company: null,
        paymentStatus: [
            { name: 'Paid', value: 'paid' },
            { name: 'Unpaid', value: 'unpaid' },
            { name: 'Partially paid', value: 'partially_paid' },
            { name: 'Dispatched', value: 'dispatched' },
            { name: 'Un-Dispatched', value: 'undispatched' },
        ],
        filters: {
            scheme: null,
            payment_state: null,
            start_date: null,
            end_date: null,
            invoice_no: null
        },
    }),

    methods: {
        schemeCleared() {
            this.filters.scheme = null;
        },

        selectSchemes(company) {
            if (company) {
                this.insuranceSchemes = company.schemes;
                this.filters.company = company.id;
            }
        },

        filter() {
            this.$emit('filtered', _.omitBy(this.filters, _.isNil));
        },

        clearFilters() {
            this.$emit('clearFilters');
        },
    },

    mounted() {
        this.insuranceSchemes = this.company.schemes;
    },
};
</script>
