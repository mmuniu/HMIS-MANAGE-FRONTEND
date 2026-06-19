<template>
    <collabmed-loading v-if="!initialised"></collabmed-loading>

    <v-card v-else>
        <v-card-title class="text-bold grey--text text--darken-1">
            <v-card class="navio mb-4" flat>
                <v-btn-toggle flat>
                    <v-btn>
                        <span :class="[ $route.path == '/evaluation/deliveries/prepare' ?  'primary--text' : ''  ]" style="font-weight: bold">Prepare delivery</span>
                    </v-btn>
                    <v-btn @click="toScheduledDelivery()">
                        <span :class="[ $route.path != '/evaluation/deliveries/prepare' ?  'primary--text' : ''  ]" style="font-weight: bold">Queued delivery</span>
                    </v-btn>
                </v-btn-toggle>
            </v-card>
        </v-card-title>

        <v-card-text>
            <v-row v-resize="onResize">
                <v-row >
                    <v-spacer></v-spacer>
                    <v-col md="2" cols="12">
                        <procedure-search class="mx-3 mb-2" outline @results="procedureSelected"></procedure-search>
                    </v-col>
                    <v-col md="2" cols="12">
                        <patient-search class="mx-3  mb-2" outline @patientSelected="patientSelected"></patient-search>
                    </v-col>
                    <v-col md="2" cols="12">
                        <partner-institution-staff-search label="Referring doctor"
                                                          @results="referringDoctorSelected"
                                                          class="mx-3"
                                                          outline></partner-institution-staff-search>
                    </v-col>
                    <v-col md="2" cols="12">
                        <v-btn small color="primary" @click="filterResults()">Filter</v-btn>
                    </v-col>
                </v-row>

                <v-data-table :headers="headers"
                              :rows-per-page-items="[25]"
                              :items="results.data"
                              select-all
                              :hide-headers="isMobile"
                              :class="{mobile: isMobile}"
                              v-model="delivery.selected"
                >
                    <template slot="items" slot-scope="props">
                        <tr v-if="!isMobile">
                            <td>
                                <v-checkbox
                                        v-model="props.selected"
                                        primary
                                        hide-details
                                ></v-checkbox>
                            </td>
                            <td>{{ props.item.procedure }}</td>
                            <td>{{ props.item.patient }}</td>
                            <td>
                                <span v-if="props.item.referring_doctor">{{ props.item.referring_doctor }}</span>
                                <span v-else>Not specified</span>
                            </td>
                            <td>{{ props.item.status }}</td>
                            <td>{{ props.item.created_at }}</td>
                        </tr>
                        <tr v-else>
                            <td colspan="11">
                                <div class="flex-content">
                                    <div style="font-weight: bold" class="flex-item" data-label="Calories">{{ props.item.procedure }}</div>
                                    <div class="flex-item" data-label="Fat (g)">
                                        <span>Patient: {{ props.item.patient }} </span> <br/>
                                        <span>Doc: {{  props.item.referring_doctor}}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <v-checkbox
                                        v-model="props.selected"
                                        primary
                                        hide-details
                                ></v-checkbox>
                            </td>
                        </tr>
                    </template>

                    <template v-slot:footer>
                        <td :colspan="headers.length + 1">
                            <v-dialog v-model="dialog" persistent max-width="500">
                                <template v-slot:activator="{ on }">
                                    <v-btn small color="primary" :disabled="delivery.selected.length < 1" v-on="on">Queue</v-btn>
                                </template>
                                <v-card>
                                    <v-card-title class="headline primary">Create a new queue or add to exisiting</v-card-title>

                                    <v-card-text>

                                        <v-switch label="Add to an existing group" v-model="add_to_existing"></v-switch>

                                        <div v-if="!add_to_existing">
                                            <v-row  key="title">
                                                <v-col cols="3">
                                                    <v-subheader class="pl-1">Title </v-subheader>
                                                </v-col>

                                                <v-col cols="9">
                                                    <div class="mx-4">
                                                        <v-text-field label="Queue title" v-model="delivery.title"></v-text-field>
                                                    </div>
                                                </v-col>
                                            </v-row>
                                            <v-row  key="to">
                                                <v-col cols="3">
                                                    <v-subheader class="pl-1">Where to: </v-subheader>
                                                </v-col>

                                                <v-col cols="9">
                                                    <v-select
                                                            label="Select institution"
                                                            :items="partnerInstitutions.data"
                                                            item-text="name" item-value="id"
                                                            v-model="delivery.to"
                                                    ></v-select>
                                                </v-col>
                                            </v-row>
                                        </div>
                                        <div v-else>
                                            <v-row  key="to">
                                                <v-col cols="3">
                                                    <v-subheader class="pl-1">Search group by title</v-subheader>
                                                </v-col>

                                                <v-col cols="9">
                                                    <v-autocomplete
                                                            v-model="add_to"
                                                            :loading="loading"
                                                            :items="queued.data"
                                                            :search-input.sync="search_delivery_queue"
                                                            color="black"
                                                            class="black--text"
                                                            @input="groupSelected()"
                                                            item-text="title"
                                                            item-value="id"
                                                            flat clearable
                                                            hide-no-data no-filter outline hide-details
                                                            label="Search group by title"
                                                            return-object
                                                    ></v-autocomplete>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="error darken-1" @click="dialog = false">Cancel</v-btn>
                                        <v-btn color="primary darken-1" @click="queueResults()">Okay</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </td>
                    </template>
                </v-data-table>
            </v-row>
        </v-card-text>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import { _ } from 'vue-underscore';
import Delivery from '@evaluation/libs/delivery/Delivery';
import ProcedureSearch from '@evaluation/components/procedures/ProcedureSearch';
import PatientSearch from '@reception/components/patients/PatientSearch';

export default {
    components: { PatientSearch, ProcedureSearch },
    data: () => ({
        dialog: false,
        delivery: new Delivery(),
        search_delivery_queue: '',
        add_to: null,
        isMobile: false,
        add_to_existing: false,
        loading: false,
        filter: {
            procedure: null,
            patient: null,
            referring_doctor: null,
            queued: 0,
            status: 1,
        },
        headers: [
            { text: 'Procedure', value: 'procedure' },
            { text: 'Patient', value: 'patient' },
            { text: 'Referring Doctor', value: 'referring_doctor' },
            { text: 'Status', value: 'status' },
            { text: 'Date', value: '' },
        ],
    }),

    watch: {
        search_delivery_queue(val) {
            if (val != null && val.length > 3) {
                this.performSearch();
            } else {
                this.placeholder = this.selected ? this.selected.name : null;
            }
        },
    },

    computed: {
        ...mapGetters({
            results: 'getInvestigationResults',
            partnerInstitutions: 'getPartnerInstitutions',
            queued: 'getResultDeliveries',
        }),

        initialised() {
            return !!this.results && this.partnerInstitutions;
        },

        preparing() {
            return this.$route.path == '/evaluation/deliveries/prepare';
        },
    },

    methods: {
        ...mapActions([
            'setInvestigationResults', 'setPartnerInstitutions', 'setResultDeliveries',
        ]),

        groupSelected() {
            this.delivery.add_to = this.add_to.id;
        },

        filterResults() {
            const data = _.pick(this.filter, function(param) {
                if (param != null || param == 0) {
                    return param;
                }
            });

            this.setInvestigationResults({
                params: data,
            });
        },

        toScheduledDelivery() {
            window.location.href = '/evaluation/deliveries/queued';
        },

        procedureSelected(procedure) {
            this.filter.procedure = procedure.id;
        },

        patientSelected(patient) {
            this.filter.patient = patient.id;
        },

        performSearch: _.debounce(function() {
            this.loading = true;
            this.setResultDeliveries({
                params: {
                    search: this.search_delivery_queue,
                    no_signature: null,
                },
            });
        }, 1000),

        referringDoctorSelected(doctor) {
            this.filter.referring_doctor = doctor.id;
        },

        queueResults() {
            this.delivery.save();
        },

        onResize() {
            if (window.innerWidth < 769) {
                this.isMobile = true;
            } else {
                this.isMobile = false;
            }
        },
    },

    mounted() {
        this.setInvestigationResults({
            params: {
                status: 1,
                queued: 0,
            },
        });

        this.setPartnerInstitutions();
    },
};
</script>
