<template>
    <v-card>
        <v-card-title height="23">
            <h4>All Discharges</h4>
        </v-card-title>
        <div class="mb-3 mr-3">
            <v-row >
                <v-col></v-col>
                <v-col class="mr-2" md="4" cols="12" >
                    <patients-search @patientSelected="patientSelected" label="Search patient" outline></patients-search>
                </v-col>
            </v-row>
        </div>
        <collabmed-floating-loader v-if="!discharges.data"></collabmed-floating-loader>
        <template>
            <v-data-table
                    hide-default-footer
                    :headers="headers"
                    disable-pagination
                    :items="discharges.data"
                    class="elevation-1"
            >
                <template v-slot:item.options="{ item }">
                    <v-menu transition="slide-y-transition" bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn class="primary" small color="primary" dark v-on="on">
                                Print outs
                            </v-btn>
                        </template>
                        <v-list>
<!--                            <v-list-item>
                                <v-btn small color="#E3F2FD" @click="printChargeSheet(item)">
                                    <i class="fa fa-print"></i>&nbsp;Print Charge Sheet
                                </v-btn>
                            </v-list-item>-->
                            <v-list-item>
                                <v-btn small color="#BBDEFB" @click="printCheckoutForm(item)">
                                    <i class="fa fa-print"></i>&nbsp;Print checkout form
                                </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn small color="#90CAF9" @click="printDailyChargeSheet(item)">
                                    <i class="fa fa-print"></i>&nbsp;Print daily charge sheet
                                </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn small color="#90CAF9" @click="summarisedChargesheet(item)">
                                    <i class="fa fa-print"></i>&nbsp;Summarised Chargesheet
                                </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn small color="#42A5F5" @click="printDischargeSummary(item)">
                                    <i class="fa fa-print"></i>&nbsp;Print Discharge Summary
                                </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn small color="#1E88E5" @click="printDischargePrescriptions(item)">
                                    <i class="fa fa-print"></i>&nbsp;Print Discharge Prescriptions
                                </v-btn>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <v-menu transition="slide-y-transition" bottom>
                        <template v-slot:activator="{ on }">
                            <v-btn class="primary" small color="primary" dark v-on="on">
                                Org Print outs
                            </v-btn>
                        </template>
                        <v-list>
<!--                            <v-list-item>
                                <v-btn small color="#E3F2FD" @click="printChargeSheet(item, true)">
                                    <i class="fa fa-print"></i>&nbsp;Print Charge Sheet
                                </v-btn>
                            </v-list-item>-->
                            <v-list-item>
                                <v-btn small color="#BBDEFB" @click="printCheckoutForm(item, true)">
                                    <i class="fa fa-print"></i>&nbsp;Print checkout form
                                </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn small color="#90CAF9" @click="printDailyChargeSheet(item, true)">
                                    <i class="fa fa-print"></i>&nbsp;Print daily charge sheet
                                </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn small color="#90CAF9" @click="summarisedChargesheet(item, true)">
                                    <i class="fa fa-print"></i>&nbsp;Summarised Chargesheet
                                </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn small color="#42A5F5" @click="printDischargeSummary(item, true)">
                                    <i class="fa fa-print"></i>&nbsp;Print Discharge Summary
                                </v-btn>
                            </v-list-item>
                            <v-list-item>
                                <v-btn small color="#1E88E5" @click="printDischargePrescriptions(item, true)">
                                    <i class="fa fa-print"></i>&nbsp;Print Discharge Prescriptions
                                </v-btn>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <v-btn small color="purple" @click="exportChargesheettoExcel(item)">
                        <i class="fa fa-print"></i>&nbsp;Export Chargesheet to Excel
                    </v-btn>
                    <v-btn small color="primary" v-if="msetting('inpatient.allow_edit_of_discharged_patients_chargesheets')" @click="updateChargesheet(item)">
                        <i class="fa fa-print"></i>&nbsp;Update Chargesheet
                    </v-btn>
                </template>
            </v-data-table>
            <collabmed-paginator v-if="discharges.meta" :meta="discharges.meta" @change="navigate" />
        </template>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import PatientSearch from '@reception/components/patients/PatientSearch.vue';

export default {
    saveLoader: false,

    name: 'discharges',

    props: {
        morgue: {
            default: false,
        }
    },

    data: () => ({
        headers: [
            { text: 'Patient Name', value: 'patient_name' },
            { text: 'IP No.', value: 'ip_number' },
            { text: 'Type', value: 'type' },
            { text: 'Date', value: 'date' },
            { text: 'Options', value: 'options', sortable: false },
        ],
    }),

    computed: {

        ...mapGetters({
            discharges: 'getPatientDischarges',
        }),

    },

    components: {
        'patients-search': PatientSearch,
    },

    methods: {

        printDischargePrescriptions(patient, use_org = false) {

            let url = `discharge-requests/visit/${patient.visit_id}/print/prescriptions?discharge=true`;

            if(use_org) {
                url = url + `&use_org=true`
            }

            window.open(url, '_blank');
        },

        printDischargeSummary(patient, use_org = false) {
            let url = `discharge-requests/visit/${patient.visit_id}/print/summary?stream=true`;

            if(use_org) {
                url = url + `&use_org=true`
            }

            window.open(url, '_blank');
        },

        printChargeSheet(patient, use_org = false) {
            let url = `discharge-requests/visit/${patient.visit_id}/print/chargesheet`;

            if(use_org) {
                url = url + `&use_org=true`
            }

            window.open(url, '_blank');
        },

        printDailyChargeSheet(patient, use_org = false) {
            let url = `discharge-requests/visit/${patient.visit_id}/print/daily-chargesheet`;

            if(use_org) {
                url = url + `&use_org=true`
            }

            window.open(url, '_blank');
        },

        printCheckoutForm(patient, use_org = false) {
            let url = `/inpatient/discharges/print-checkout-form/${patient.visit_id}`;

            if(use_org) {
                url = url + `&use_org=true`
            }

            window.open(url, '_blank');
        },

        summarisedChargesheet(patient, use_org = false) {
            let url = `discharge/invoice/${patient.visit_id}`;

            if(use_org) {
                url = url + `&use_org=true`
            }

            window.open(url, '_blank');
        },

        exportChargesheettoExcel(patient) {
            window.open(`/inpatient/evaluations/${patient.visit_id}/charge-sheet/action/exportToExcel/no-callback`, '_blank');
        },

        updateChargesheet(patient) {
            window.open(`/inpatient/chargesheet/visit/${patient.visit_id}/edit/daily`, '_blank');
        },

        navigate(page) {
            this.setPatientDischarges({
                page,
            });
        },

        patientSelected(patient) {
            const parameters = {
                patient_id: patient.id,
                type: 'inpatient',
            };

            if(this.morgue) {
                parameters.morgue = true;
            }

            this.setPatientDischarges({
                params: parameters,
            });
        },

        ...mapActions([
            'setPatientDischarges',
        ]),
    },

    created() {
        const parameters = {};

        if(this.morgue) {
            parameters.morgue = true;
        }

        this.setPatientDischarges({
            params: parameters,
        });

        window.events.$on('STORE_SET_ACTION_LOADING', (loading) => {
            this.saveLoader = loading;
        });
    },

};
</script>
