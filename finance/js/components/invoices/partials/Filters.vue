<template>
    <v-container fluid>
        <v-row >
            <v-col class="px-2" cols="12" sm="3" v-if="!account">
                <v-autocomplete :items="insurances.companies"
                                @change="selectSchemes($event)"
                                item-text="name" return-object
                                clearable
                                @click:clear="companyCleared()"
                                v-model="insurance_company"
                                label="Insurance Company"
                ></v-autocomplete>
            </v-col>

            <v-col class="px-2" cols="12" sm="3" >
                <v-autocomplete v-model="filters.scheme"
                                :items="insuranceSchemes"
                                clearable
                                @click:clear="schemeCleared()"
                                item-text="full_name" item-value="id"
                                label="Insurance Schemes"
                ></v-autocomplete>
            </v-col>
            <v-col class="px-2" md="3" >
                <collabmed-date-time-picker dateOnly   v-model="filters.start_date" label="Start date"></collabmed-date-time-picker>
            </v-col>
            <v-col class="px-2" md="3" >
                <collabmed-date-time-picker dateOnly  v-model="filters.end_date" label="End date"></collabmed-date-time-picker>
            </v-col>
        </v-row>

        <v-row >
            <v-col class="px-2" cols="12" sm="3" v-if="patient">
                <v-select v-model="filters.queue"
                          :items="['Outpatient', 'Inpatient', 'Theatre', 'Dialysis']"
                          label="Queue"
                ></v-select>
            </v-col>

            <v-col class="px-2" cols="12" sm="3" v-if="patient">
                <v-text-field label="Patient No." placeholder="e.g. 4345" v-model="filters.patient_no" ></v-text-field>
            </v-col>

            <v-col class="px-2" md="3" v-if="patient">
                <patient-search @patientSelected="patientSelected" v-model="filters.search_patient" label="Patient name"></patient-search>
            </v-col>

            <v-col class="px-2" cols="12" sm="3">
                <v-text-field label="Invoice No." v-model="filters.invoice_no"></v-text-field>
            </v-col>
            <v-col class="px-2" cols="12" sm="3" v-if="patient">
                <v-select v-model="filters.status"
                          :items="['All', 'Billed', 'Dispatched']"
                          label="Status"
                ></v-select>
            </v-col>

            <v-col class="px-2" md="5" >
                <v-btn large color="primary" @click="filter">Filter</v-btn>
                <v-btn large color="purple" class="white--text" @click="clearFilters">Clear</v-btn>
                <v-btn large color="success" v-if="uploadExcel" class="white--text" @click="initiateUpload">Upload Excel</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import PatientSearch from '@reception/components/patients/PatientSearch';

export default {
    components: { PatientSearch },
    props: {
        patient: {
            type: Boolean,
            default: false,
        },
        uploadExcel: {
            type: Boolean,
            default: false,
        },
        account: {
            type: Boolean,
            default: false,
        },
    },

    data: () => ({
        insuranceSchemes: [],
        insurance_company: null,
        filters: {
            patient_no: null,
            patient_id_no: null,
            patient_name:null,
            queue: null,
            company: null,
            scheme: null,
            start_date: null,
            end_date: null,
            patient_id: null,
            invoice_no: null,
            search_patient:null
        },
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

        patientSelected(patient) {
            this.filters.patient_id = patient.id;
            this.filters.patient_name = patient.full_name
        },

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
