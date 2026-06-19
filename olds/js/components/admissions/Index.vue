/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-05-23
* Time: 14:56
*/

<template>
    <div>

        <v-card class="mt-3">
            <v-card-title class="info">
                <div>
                    <p class="subheading font-weight-thin text-capitalize">
                        Patient Admissions: All admitted patients in the hospital
                    </p>

                    <small class="black--text">
                        Key: <i class="fa fa-graduation-cap text-success"></i> = Awaiting Discharge
                    </small>
                </div>

                <v-spacer></v-spacer>

                <v-text-field
                        v-if="msetting('inpatient.browser_search_admissions')"
                        v-model="searchLocal"
                        append-icon="search"
                        label="Search from loaded results"
                        hide-details
                ></v-text-field>

                <patient-search v-else inpatient @patientSelected="patientSelected" label="Search for patient"></patient-search>
            </v-card-title>
            <v-card-text>
                <collabmed-loading v-if="!initialised"></collabmed-loading>

                <div v-else>

                    <div v-if="getAdmissions && getAdmissions.data">

                        <v-data-table
                                :headers="headers"
                                :items="getAdmissions.data"
                                :hide-default-footer="!msetting('inpatient.browser_search_admissions')"
                                :search="searchLocal"
                                :loading="saveLoader"
                                class="mb-3"
                                flat
                        >
                            <template v-slot:item.patient_name="{ item }">
                                <span>
                                    {{ item.patient_name }} <br/>

                                    <small>Insurance Scheme: {{ item.patient_scheme }}</small>
                                </span>
                            </template>

                            <template v-slot:item.ip_number="{ item }">
                                <span>{{ item.ip_number }}</span> <br>
                                <span>
                                        <small>{{ item.patient_number }}</small>
                                    </span> <br/>
                                <span>
                                        <small>{{ item.payment_mode }}</small>
                                    </span>

                            </template>

                            <template v-slot:item.doc_name="{ item }">
                                <span>{{ item.doc_name }}</span>
                                <span v-if="item.external_doctor">{{ item.external_doctor }} (External Doctor)</span>
                            </template>

                            <template v-slot:item.ward_name="{ item }">{{ item.ward_name }}</template>

                            <template v-slot:item.bed_number="{ item }">{{ item.bed_number }}</template>

                            <template v-slot:item.admitted_at_w3c="{ item }">
                                {{ item.admitted_at_w3c | moment('from') | ucwords }}
                                <br/>
                                <small class="grey--text">{{ item.admitted_at }}</small>
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <v-btn color="blue" dark :href="evaluate(item)" small>
                                    <v-icon small class="pr-2">fa fa-thermometer</v-icon>
                                    Evaluate
                                </v-btn>

                                <v-btn color="warning" v-if="!morgue" @click="editAdmissionDetails(item)" small>
                                    edit Adm. Details
                                </v-btn>

                                <v-btn color="purple" dark v-if="!morgue" @click="changeWards(item)" small :disabled="! wards">
                                    <v-icon small class="pr-2">compare_arrows</v-icon>
                                    Change Wards
                                </v-btn>

                                <v-menu transition="slide-y-transition" bottom v-if="!morgue">
                                    <template v-slot:activator="{ on }">
                                        <v-btn class="purple" small color="puruple" dark v-on="on">
                                            Print outs
                                        </v-btn>
                                    </template>
                                    <v-list>
                                        <v-list-item>
                                            <v-btn color="green"
                                                   dark
                                                   :href="printAdmissionRequestForm(item)"
                                                   small target="_blank"
                                                   v-if="item.admission_request_id">

                                                <v-icon small class="pr-2">print</v-icon>

                                                Adm. Req. Form
                                            </v-btn>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-btn color="primary"
                                                   dark
                                                   :href="printReservationForm(item)"
                                                   small target="_blank"
                                                   v-if="item.admission_request_id">

                                                <v-icon small class="pr-2">print</v-icon>

                                                Reservation form
                                            </v-btn>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </template>

                            <v-alert slot="no-results" :value="true" color="error" icon="warning">
                                Your search for "{{ searchLocal }}" found no results.
                            </v-alert>

                        </v-data-table>

                        <v-row  class="py-2 pb-2 grey lighten-2"
                                v-if="!msetting('inpatient.browser_search_admissions')">
                            <v-col cols="8" class="mt-3 ml-3">
                                Showing {{ meta.from }} to {{ meta.to }} of {{ meta.total }} records
                            </v-col>

                            <v-col cols="3" class="text-right">
                                <v-btn icon @click="navigate(links.prev)">
                                    <v-icon>chevron_left</v-icon>
                                </v-btn>

                                <v-btn icon @click="navigate(links.next)">
                                    <v-icon>chevron_right</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>

                    </div>
                </div>
            </v-card-text>
        </v-card>

        <div v-if="selected">
            <change-ward-modal
                    :show="dialog"
                    :obj="obj"
                    :item="selected"
                    :wards="wards"
                    @close="close"
                    @saved="initialise()"
            ></change-ward-modal>
        </div>

        <!-- edit admission details -->
        <v-dialog v-model="editAdmissionDetailsDialog" max-width="800">
            <v-card>
                <v-card-title class="headline primary white--text">
                    Edit Admission Details
                    <v-spacer></v-spacer>
                    <v-btn icon dark @click.native="closeEditAdmissionDetailsDailog()" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <v-container fluid>
                        <v-row >
                            <v-col cols="12" md="6">
                                <v-select
                                        v-model="obj.editAdmissionDetails.ward_id"
                                        :items="wards"
                                        @change="updateBeds()"
                                        item-text="name"
                                        item-value="id"
                                        outline
                                        label="Select a Ward"
                                        hide-details
                                ></v-select>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-select
                                        v-model="obj.editAdmissionDetails.bed_id"
                                        :disabled="!obj.editAdmissionDetails.ward_id"
                                        :items="beds"
                                        item-text="name"
                                        outline
                                        item-value="id"
                                        label="Select a Bed"
                                        class="ml-2"
                                        hide-details
                                ></v-select>

                                <p v-if="overbookingAllowed"><em>Over-booking of beds has been allowed in the system</em></p>
                            </v-col>
                        </v-row>
                        <v-row >
                            <v-col cols="3">
                                <v-subheader class="pl-1">Payment method</v-subheader>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group v-model="obj.editAdmissionDetails.payment_mode" row>
                                    <v-radio label="Cash" value="cash" class="mid-center"></v-radio>
                                    <v-radio label="Insurance" value="insurance" class="mid-center"></v-radio>
                                </v-radio-group>
                            </v-col>
                        </v-row>
                        <v-row >
                            <v-col cols="12">
                                <transition-group name="slide-fade">
                                    <v-row  key="insurance" v-if="obj.editAdmissionDetails.payment_mode == 'insurance'">
                                        <v-col cols="3">
                                            <v-subheader class="pl-1">Insurance scheme</v-subheader>
                                        </v-col>

                                        <v-col cols="9">
                                            <v-autocomplete
                                                    label="Patient scheme" outline
                                                    :items="schemes" item-text="schemes.full_name" item-value="id"
                                                    v-model="obj.editAdmissionDetails.insurance_scheme"
                                            >
                                                <template slot="item" slot-scope="{ item }">
                                                    <v-list-item-content>
                                                        <v-list-item-title class="caption">
                                                            {{ item.schemes.full_name }}
                                                        </v-list-item-title>
                                                        <v-list-item-subtitle>
                                                            <span class="caption grey--text"> {{  item.schemes.company.name }} </span>
                                                            <span class="pl-5 ml-5">
                                                    <small>Policy Number:   ( {{ item.policy_number }} )</small>
                                                </span>
                                                        </v-list-item-subtitle>
                                                    </v-list-item-content>
                                                </template>
                                            </v-autocomplete>
                                        </v-col>
                                    </v-row>
                                </transition-group>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="3">
                                Admission  date
                            </v-col>
                            <v-col cols="9">
                                <collabmed-date-time-picker dateOnly
                                                            outline
                                                            required
                                                            :placeholder="obj.editAdmissionDetails.admission_date"
                                                            v-model="obj.editAdmissionDetails.admission_date"
                                                            label="">

                                </collabmed-date-time-picker>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="success" :loading="loading" @click="submitEdittedDetails()">submit</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </div>
</template>

<script>
import Admission from '@inpatient/libs/admissions/Admission';
import { mapActions, mapGetters } from 'vuex';
import ChangeWardModal from './partials/ChangeWardModal';
import PatientSearch from '@reception/components/patients/PatientSearch';

export default {

    props: {
        morgue: {
            default: false
        }
    },

    components: {
        PatientSearch,
        ChangeWardModal,
    },

    data() {
        return {
            obj: new Admission(),
            schemes: [],
            selected: null,
            searchLocal: '',
            saveLoader: false,
            loading: false,
            dialog: false,
            filters: null,
            wards: null,
            beds: [],
            editAdmissionDetailsDialog: false,
            overbookingAllowed: false,
            headers: [
                { text: 'Patient name', value: 'patient_name' },
                { text: 'Ip no', value: 'ip_number' },
                { text: this.morgue ? 'Admitted by' : 'Admission doctor', value: 'doc_name' },
                { text: this.morgue ? 'Fridge' : 'Ward', value: this.morgue ? 'fridge' : 'ward_name' },
                { text: this.morgue ? 'Cabinet' : 'Bed number', value: this.morgue ? 'cabinet' :'bed_number' },
                { text: 'Admitted on', value: 'admitted_at_w3c' },
                { text: 'Actions', value: 'actions' },
            ],
        };
    },

    computed: {
        ...mapGetters([
            'getAdmissions', 'getWards',
        ]),

        meta() {
            return this.getAdmissions.meta;
        },

        links() {
            return this.getAdmissions.links;
        },

        initialised() {
            return this.getAdmissions;
        },

        saved() {
            return this.obj.saved;
        },

        submitted() {
            return this.obj.form.submitted;
        },

        contaminated() {
            return this.obj.form.errorDetected;
        },

        errors() {
            return this.obj.form.errors;
        },
    },

    watch: {
        getWards(val) {
            this.wards = val.data;
        },

        contaminated(val) {
            if (val) {
                this.saveLoader = false;
            }
        },

        submitted(val) {
            if (val) {
                this.saveLoader = false;
            }
        },
    },

    methods: {
        ...mapActions([
            'setAdmissions', 'setWards',
        ]),

        closeEditAdmissionDetailsDailog() {
            this.editAdmissionDetailsDialog = false;
        },

        updateBeds() {
            const ward = _.find(this.wards, { id: this.obj.editAdmissionDetails.ward_id });

            this.beds = _.map(ward.beds, (item) => {
                let name = 'Bed No. ' + item.number;
                ! item.is_available ? name += ' (Unavailable)' : '';

                let disabled = ! item.is_available;
                this.overbookingAllowed ? disabled = false : null;

                return {
                    name: name,
                    id: item.id,
                    disabled: disabled,
                };
            });
        },

        async submitEdittedDetails() {
            this.loading = true;

            const response = await this.obj.submitEdittedDetails();

            if (response) {
                this.editAdmissionDetailsDialog = false;

                this.loading = false;

                this.initialise();
            } else {
                this.loading = false;
            }
        },

        editAdmissionDetails(item) {
            this.obj.editAdmissionDetails.admission_date = item.admission_date;
            this.obj.editAdmissionDetails.payment_mode = item.payment_mode;
            this.obj.editAdmissionDetails.admission_id = item.id;
            this.schemes = item.set_schemes;
            this.editAdmissionDetailsDialog = true;
        },

        initialise() {
            this.setAdmissions({
                params: {
                    morgue: this.morgue ? this.morgue: 0
                }
            });
            this.setWards();
            this.dialog = false;
        },

        patientSelected(val) {
            this.setAdmissions({
                page: 1,
                params: {
                    'search': true,
                    'patient_id': val.id,
                },
            });
        },

        navigate(url) {
            if (url) {
                this.page = url.substring(url.indexOf('page=')).split('page=')[1];

                if (this.filters) {
                    this.setAdmissions({ page: this.page, params: this.filters });
                } else {
                    this.setAdmissions({ page: this.page });
                }
            }
        },

        evaluate(item) {
            if(this.morgue) {
                return route('morgue.evaluations.index', [item.visit_id, 'doctors']).relative();
            } else {
                return route('inpatient.evaluations.index', [item.visit_id, 'doctors']).relative();
            }
        },

        printAdmissionRequestForm(item) {
            return route('inpatient.admission-requests.print', item.admission_request_id).relative();
        },

        printReservationForm(item) {
            return route('inpatient.admissions.reservation-form.print', item.id).relative();
        },

        performSearch(filters) {
            this.filters = filters;
            this.setAdmissions({ params: filters });
        },

        reset() {
            this.setAdmissions({ page: 1 });
            this.filters = null;
        },

        changeWards(item) {
            this.selected = item;
            this.dialog = true;
        },

        close() {
            this.dialog = false;
            this.selected = null;
        },
    },

    mounted() {
        this.initialise();
    },

    created() {
        window.events.$on('STORE_SET_ACTION_LOADING', (val) => {
            this.saveLoader = val;
        });
    },
};
</script>

<style scoped lang="scss">
    .info {
        background-color: #d9edf7 !important;
    }
</style>
