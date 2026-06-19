/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-05-31
* Time: 21:11
*/

<template>
    <v-container fluid>
        <v-row >
            <v-col cols="12" md="3">
                <collabmed-loading v-if="!initialised">Loading Patient Info...</collabmed-loading>

                <reception-patient-info
                        v-else
                        :patient-id="admissionRequest.patient_id"
                >
                </reception-patient-info>
            </v-col>

            <v-col cols="12" md="9">
                <v-card class="ml-2">
                    <v-card-title primary-title>
                        <h2 class="title">Check In Details</h2>
                    </v-card-title>

                    <v-card-text>

                        <collabmed-loading v-if="!initialised"></collabmed-loading>

                        <div v-else>
                            <p><strong>Admission Type:</strong> {{ admissionRequest.admission_type_name }}</p>

                            <v-row class="px-3"  >
                                <v-col cols="12" md="6">
                                    <v-row >
                                        <v-col cols="3">
                                            <v-tooltip bottom v-if="msetting('inpatient.inpatient_no_prefix')">
                                                <template v-slot:activator="{ on }">
                                                    <v-btn flat style="min-width: 50px" v-on="on" class="pull-right pt-3">
                                                        {{ msetting('inpatient.inpatient_no_prefix') }}-
                                                    </v-btn>
                                                </template>
                                                <span>IP Number Prefix</span>
                                            </v-tooltip>
                                        </v-col>

                                        <v-col cols="6" v-if="!msetting('inpatient.auto_generate_inpatient_no')">
                                            <v-text-field
                                                    v-model="obj.admission.inpatient_no"
                                                    class="mr-2"
                                                    label="IP Number"
                                                    hint="Possible Format: #######/YY"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="3"  v-if="!msetting('inpatient.auto_generate_inpatient_no')">
                                            <v-tooltip bottom>
                                                <template v-slot:activator="{ on }">
                                                    <v-btn
                                                            color="primary"
                                                            style="min-width: 50px"
                                                            disabled
                                                            v-on="on"
                                                            slot="activator"
                                                            @click="generateIpNumber()"
                                                            :loading="generating"
                                                    >
                                                        <v-icon small>autorenew</v-icon>
                                                    </v-btn>
                                                </template>
                                                <span>Generate IP Number</span>
                                            </v-tooltip>
                                        </v-col>
                                    </v-row>

                                </v-col>

                                <v-col cols="12" md="6">
                                    <collabmed-date-time-picker
                                            label="Admission Date"
                                            outline
                                            :maxDate="today"
                                            @input="setAdmissionDate"
                                    ></collabmed-date-time-picker>
                                </v-col>

                                <v-col class="py-3" cols="12" md="12" ></v-col>

                                <v-col cols="12" md="6">
                                    <div v-if="! obj.admission.external_doctor">
                                        <div v-if="! obj.admission.doctor_id">
                                            <users-search
                                                    :roles-like="['doc']"
                                                    :label="'Admission Doctor'"
                                                    @results="setDoctor"
                                            ></users-search>
                                        </div>
                                        <p v-else class="pt-3 pl-3 border-bottom subheading">Doctor:</p>
                                    </div>
                                    <p v-else class="pt-3 pl-3 border-bottom subheading">External Doctor:</p>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <div v-if="obj.admission.doctor_id">
                                        <p class="pt-3 pl-3 border-bottom subheading">
                                            {{ obj.admission.doctor_name }}

                                            <v-btn small color="red" icon dark @click="unsetDoctor()">
                                                <v-icon small>delete</v-icon>
                                            </v-btn>
                                        </p>
                                    </div>

                                    <div v-else>
                                        <v-text-field
                                                v-model="obj.admission.external_doctor"
                                                class="mx-2"
                                                label="External Doctor"
                                                hide-details clearable
                                        ></v-text-field>
                                    </div>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-select
                                            v-model="obj.admission.ward_id"
                                            :items="wards"
                                            @change="updateBeds()"
                                            item-text="name"
                                            item-value="id"
                                            label="Select a Ward"
                                            hide-details
                                    ></v-select>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <div v-if="wardCashCharge" class="pl-3">
                                        <p class="font-weight-bold title">Ward Charges</p>
                                        <p>Cash Charge: <strong>{{ wardCashCharge | numberFormat }}</strong></p>
                                        <p>Insurance Charge: <strong>{{ wardInsuranceCharge | numberFormat }}</strong></p>
                                    </div>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-select
                                            v-model="obj.admission.bed_id"
                                            :disabled="! obj.admission.ward_id"
                                            :items="beds"
                                            item-text="name"
                                            item-value="id"
                                            label="Select a Bed"
                                            class="ml-2"
                                            hide-details
                                    ></v-select>

                                    <p v-if="overbookingAllowed"><em>Over-booking of beds has been allowed in the system</em></p>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-select
                                            v-model="obj.admission.charges"
                                            :disabled="! obj.admission.ward_id"
                                            :items="charges"
                                            item-text="name"
                                            item-value="id"
                                            label="Select Other Charge(s)"
                                            class="ml-2"
                                            hide-details multiple
                                    ></v-select>
                                </v-col>

                                <v-col cols="12" md="12">
                                    <v-alert :value="true" v-if="errors.any()" type="error" outline>
                                        <div v-html="errors.display()"></div>
                                    </v-alert>
                                </v-col>

                                <v-col cols="12" md="12">
                                    <v-btn block dark color="primary" class="mt-4" :loading="saveLoader" @click="save()">
                                        Admit Patient
                                        <v-icon class="pl-2">arrow_right_alt</v-icon>
                                    </v-btn>
                                </v-col>

                            </v-row>
                        </div>

                    </v-card-text>
                </v-card>
            </v-col>

        </v-row>


    </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import AdmissionRequest from '@inpatient/libs/admission-requests/AdmissionRequest';
import Admission from '@inpatient/libs/admissions/Admission';
import moment from 'moment';

export default {
    props: {
        admissionRequestId: {
            required: true,
        },
    },

    data() {
        return {
            admissionRequestObj: new AdmissionRequest(),
            obj: new Admission(),
            wards: null,
            saveLoader: false,
            beds: [],
            charges: [],
            wardCashCharge: null,
            wardInsuranceCharge: null,
            today: moment(new Date()).format('YYYY-MM-DD HH:MM:ss'),
            overbookingAllowed: false,
            generating: false,
        };
    },

    computed: {
        ...mapGetters([
            'getWards',
        ]),

        admissionRequest() {
            return this.admissionRequestObj.selected;
        },

        initialised() {
            return this.wards && this.admissionRequest;
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

        generatedIpNuber() {
            return this.obj.generatedIpNuber;
        },
    },

    watch: {
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

        saved(val) {
            if (val) {
                this.saveLoader = false;
                this.dialog = false;

                window.location = route('inpatient.admissions.index').relative();
            }
        },

        admissionRequest(val) {
            if (val) {
                this.obj.admission.admission_request_id = val.id;
                this.obj.admission.visit_id = val.visit_id;
                this.obj.admission.inpatient_no = val.visit.patient.inpatient_no;
                this.obj.admission.patient_id = val.visit.patient.id;
            }
        },

        getWards(val) {
            if (val) {
                this.wards = this.getWards.data;
            }
        },

        generatedIpNuber(val) {
            this.generating = false;
            if (val) {
                this.obj.admission.inpatient_no = val;
            }
        },
    },

    methods: {
        ...mapActions([
            'setWards',
        ]),

        initialise() {
            this.admissionRequestObj.find(this.admissionRequestId);

            this.setWards({
                params: {
                    login_facility_filter: 1,
                },
            });

            this.obj.admission.admission_date = this.today;

            this.overbookingAllowed = this.$options.methods.msetting('inpatient.allow_overbooking_of_wards') == 1;
        },

        updateBeds() {
            const ward = _.find(this.wards, { id: this.obj.admission.ward_id });

            this.wardCashCharge = ward.cash_cost;
            this.wardInsuranceCharge = ward.insurance_cost;

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

            // auto select the first available bed
            /*const firstAvailableBed = _.find(this.beds, { disabled: false });
            firstAvailableBed ? this.obj.admission.bed_id = firstAvailableBed.id : null;*/

            this.charges = _.map(ward.charges, (item) => {
                let name = item.name + ' - Kshs. ' + item.cost;
                item.type == 'recurring' ? name += ' [RECURRING]' : '';

                return {
                    id: item.id,
                    name: name,
                };
            });
        },

        setDoctor(doctor) {
            this.obj.admission.doctor_id = doctor.id;
            this.obj.admission.doctor_name = doctor.full_name;
        },

        unsetDoctor() {
            this.obj.admission.doctor_id = null;
            this.obj.admission.doctor_name = null;
        },

        generateIpNumber() {
            this.generating = true;
            this.obj.generateInpatientNumber();
        },

        setAdmissionDate(datetime) {
            this.obj.admission.admission_date = datetime;
        },

        save() {
            this.saveLoader = true;
            this.obj.save();
        },

    },

    mounted() {
        this.initialise();
    },
};
</script>

<style scoped lang="scss">

</style>
