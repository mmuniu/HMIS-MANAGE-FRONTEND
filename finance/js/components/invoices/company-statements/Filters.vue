<template>
    <v-container fluid>
        <v-row >
            <v-col class="px-2" cols="12" sm="3" >
                <v-autocomplete :items="insurances.companies"
                                @change="selectSchemes($event)"
                                item-text="name" return-object
                                clearable
                                @click:clear="companyCleared()"
                                v-model="insurance_company"
                                label="Insurance Company" outline
                ></v-autocomplete>
            </v-col>

            <v-col class="px-2" cols="12" sm="3" >
                <v-autocomplete v-model="filters.scheme"
                                :disabled="insuranceSchemes.length < 1"
                                :items="insuranceSchemes"
                                clearable
                                @click:clear="schemeCleared()"
                                item-text="full_name" item-value="id"
                                label="Insurance Schemes" outline
                ></v-autocomplete>
            </v-col>
            <v-col class="px-2" md="3" >
                <collabmed-date-time-picker dateOnly outline  v-model="filters.start_date" label="Start date"></collabmed-date-time-picker>
            </v-col>
            <v-col class="px-2" md="3" >
                <collabmed-date-time-picker dateOnly outline v-model="filters.end_date" label="End date"></collabmed-date-time-picker>
            </v-col>
        </v-row>

        <v-row >
            <v-col class="px-2" md="5" >
                <v-btn large color="primary" @click="filter">Filter</v-btn>
                <v-btn large color="purple" class="white--text" @click="clearFilters">Clear</v-btn>
                <download-to-excel :filters="filters"
                                   :url="url"
                                   :filename="filename">
                </download-to-excel>
                <v-btn large color="success" v-if="uploadExcel" class="white--text" @click="initiateUpload">Upload Excel</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';

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
    },

    data: () => ({
        insuranceSchemes: [],
        insurance_company: null,
        filters: {
            company: null,
            scheme: null,
            start_date: null,
            end_date: null,
        },
        url: '/api/finance/insCompanies',
        filename: 'Insurance Companies data'
    }),

    computed: {
        ...mapGetters({
            insurances: 'getInsurances',
        }),
    },

    methods: {
        ...mapActions({
            fetchInsurances: 'setInsurances',
        }),

        companyCleared() {
            this.insuranceSchemes = [];
            this.filters.scheme = null;
            this.filters.company = null;
        },

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

        initiateUpload() {
            this.$emit('initiateUpload');
        },
    },

    mounted() {
        this.fetchInsurances();
    },
};
</script>
