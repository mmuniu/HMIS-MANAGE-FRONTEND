<template>
    <div>
        <v-card flat>
            <collabmed-loading v-if="!initialised"></collabmed-loading>

            <div v-else>
                <v-container fluid class="mx-5">
                    <div v-if="!nonPatient">
                        <v-row >
                            <v-col md="5">
                                <v-switch
                                    v-model="walkin.new_patient"
                                    @change="walkin.patient = null"
                                    label="Check if it is a new patient"
                                ></v-switch>
                            </v-col>
                            <v-col class="mx-1" md="5" v-if="!walkin.new_patient">
                                <patient-search @patientSelected="patientSelected"></patient-search>
                            </v-col>
                        </v-row>

                        <v-row  v-if="walkin.new_patient">
                            <v-col md="4">
                                <v-text-field class="mx-1"
                                              label="First name"
                                              outline
                                              v-model="walkin.patient_data.first_name">
                                </v-text-field>
                            </v-col>
                            <v-col md="4">
                                <v-text-field class="mx-1" label="Middle name"
                                              outline v-model="walkin.patient_data.middle_name">
                                </v-text-field>
                            </v-col>
                            <v-col md="4">
                                <v-text-field class="mx-1" label="Last name"
                                              outline
                                              v-model="walkin.patient_data.last_name">
                                </v-text-field>
                            </v-col>
                            <v-col md="4">
                                <v-text-field class="mx-1" label="Age"
                                              outline
                                              v-model="walkin.patient_data.age">
                                </v-text-field>
                            </v-col>
                            <v-col md="4">
                                <v-select class="mx-1" outline label="Age in"
                                          v-model="walkin.patient_data.age_in"
                                          :items="configurations.age_in"
                                          item-text="item_name"
                                          item-value="item_name">
                                </v-select>
                            </v-col>
                            <v-col md="4">
                                <v-text-field class="mx-1"
                                              label="Mobile"
                                              outline
                                              v-model="walkin.patient_data.mobile">
                                </v-text-field>
                            </v-col>
                        </v-row>
                    </div>
                    <div v-else>
                        <v-row >
                            <v-col md="3">
                                <v-switch
                                    v-model="walkin.customer_data.is_staff"
                                    label="Check if customer is staff/employee"
                                ></v-switch>
                            </v-col>
                            <v-col class="px-1" md="5" v-if="walkin.customer_data.is_staff">
                                <users-search
                                    @results="staffSelected" label="Search for user"
                                    :search-input.sync="search"
                                    outline
                                    leaveSelected
                                ></users-search>
                            </v-col>
                            <v-col class="px-1" md="3" v-if="!walkin.customer_data.is_staff">
                                <v-text-field class="px-1" label="Customer name/idenfifier"
                                              outline v-model="walkin.customer_data.customer_identifier">
                                </v-text-field>
                            </v-col>
                            <v-col class="px-1" md="3" v-if="!walkin.customer_data.is_staff">
                                <v-text-field class="px-1"
                                              label="Mobile"
                                              outline
                                              v-model="walkin.customer_data.mobile">
                                </v-text-field>
                            </v-col>
                            <v-col class="px-1" md="3" v-if="!walkin.customer_data.is_staff">
                                <v-text-field class="px-1"
                                              label="Email"
                                              outline
                                              v-model="walkin.customer_data.email">
                                </v-text-field>
                            </v-col>
                        </v-row>
                    </div>

                    <v-divider></v-divider>

                    <v-row >
                        <v-col class="mx-1" md="3" ><p class="font-weight-bold">Service</p></v-col>
                        <v-col class="mx-1" md="1" ><p class="font-weight-bold">Units</p></v-col>
                        <v-col class="mx-1" md="1" ><p class="font-weight-bold">Initial Price</p></v-col>
                        <v-col class="mx-1" md="2" ><p class="font-weight-bold">Selling Price</p></v-col>
                        <v-col class="mx-1" md="1" ><p class="font-weight-bold">Total</p></v-col>
                        <v-col class="mx-1" md="2" ><p class="font-weight-bold">Comments</p></v-col>
                        <v-col class="mx-1" md="1" ><p class="font-weight-bold">Actions</p></v-col>
                    </v-row>

                    <v-row v-for="(service, index) in walkin.selected_services" :key="service.id">
                        <v-row  v-if="walkin.selected_services">
                            <v-col class="mx-1" md="3" >
                                <procedure-search :non_clinical="nonPatient ? true : false"
                                                  active_only
                                                  label="Search for service"
                                                  v-if="!service.name"
                                                  @results="selected => procedureSelected(index, selected)" >
                                </procedure-search>

                                <h5 v-else>{{ service.name }}</h5>
                                <!--<v-switch
                                        v-model="service.on_credit"
                                        v-if="service.name && nonPatient"
                                        label="Check if item/service on credit"
                                ></v-switch>-->
                            </v-col>
                            <v-col class="mx-1" md="1" >
                                <v-text-field label="Units" :disabled="!service.name"
                                              outline value="1" v-model="service.units"
                                              @input="walkin.updateTotalCost()">
                                </v-text-field>
                            </v-col>
                            <v-col class="mx-1" md="1" >
                                <v-text-field label="Initial Price"
                                              disabled
                                              v-model="service.initial_price"
                                              outline>
                                </v-text-field>
                            </v-col>
                            <v-col class="mx-1" md="2" >
                                <v-text-field label="Selling Price"
                                              :disabled="!service.name"
                                              outline v-model="service.price"
                                              @input="walkin.updateTotalCost()">
                                </v-text-field>
                            </v-col>
                            <v-col class="mx-1" md="1" >
                                <v-text-field label="Total Price"
                                              disabled
                                              outline
                                              :value="service.price * service.units">
                                </v-text-field>
                            </v-col>
                            <v-col class="mx-1" md="2" >
                                <v-text-field label="Comments/Notes"
                                              :disabled="!service.name"
                                              outline
                                              v-model="service.comments">
                                </v-text-field>
                            </v-col>
                            <v-col class="mx-1" md="1" >
                                <v-btn  icon small color="error"
                                        @click="walkin.removeSelection(index)"
                                        :disabled="walkin.selected_services.length <= 1">
                                    <v-icon>delete</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-row>

                    <v-row >
                        <v-col cols="9">
                            <v-btn color="primary"
                                   @click="walkin.AddNewRow()">
                                <v-icon>add</v-icon>
                                Add new
                            </v-btn>
                            <v-btn color="success" v-if="!walkin.loading" @click="requestService()">Save</v-btn>
                            <v-btn color="teal"
                                   v-if="!walkin.loading"
                                   @click="requestService(1)">
                                Save and receive payment
                            </v-btn>
                            <v-progress-circular
                                :width="3"
                                v-else
                                class="ml-4"
                                color="black"
                                indeterminate
                            ></v-progress-circular>
                        </v-col>
                        <v-col>
                            <span class="subheading font-weight-black">Total Cost:  {{ walkin.total_cost }}</span>
                        </v-col>
                    </v-row>
                    <collabmed-floating-loader v-if="walkin.loading"></collabmed-floating-loader>
                </v-container>
            </div>
        </v-card>


        <div style="margin-top: 10px">
            <walkin-service-sales :nonPatient="nonPatient"></walkin-service-sales>
        </div>
    </div>
</template>

<script>
import ProcedureSearch from '@evaluation/components/procedures/ProcedureSearch';
import PatientSearch from '@reception/components/patients/PatientSearch.vue';
import Walkin from '@evaluation/libs/walkin/Walkin';
import SettingsOptions from '@settings/libs/SettingsOptions';
import WalkinServiceSales from './Sales';
import { mapActions } from 'vuex';

export default {
    props: [
        'nonPatient',
    ],

    components: {
        ProcedureSearch,
        PatientSearch,
        WalkinServiceSales,
    },

    data: () => ({
        walkin: new Walkin(),
        options: new SettingsOptions(),
    }),

    computed: {
        initialised() {
            return true;
        },

        configurations() {
            return this.options.configurations;
        },
    },

    methods: {
        ...mapActions([
            'setServiceSales',
        ]),

        patientSelected(patient) {
            this.walkin.patient_id = patient.id;
        },

        procedureSelected(index, selected) {
            if (this.nonPatient) {
                if (selected.category > 16) {
                    this.walkin.procedureSelected(index, selected);
                } else {
                    flash({
                        message: 'Cannot select a clinical service on this point of sale',
                        alert: 'error',
                    });
                }
            } else {
                if (selected.category <= 16) {
                    this.walkin.procedureSelected(index, selected);
                } else {
                    flash({
                        message: 'Cannot select a non-clinical service on this point of sale',
                        alert: 'error',
                    });
                }
            }
        },

        staffSelected(user) {
            this.walkin.customer_data.staff_id = user.id;
            this.walkin.customer_data.mobile = user.mobile;
        },

        initializeResults() {
            this.setServiceSales({
                params: {
                    type: this.nonPatient ? 'non_patient' : 'patient',
                },
            });
        },

        async requestService(andProcessPayment) {
            if (this.walkin.selected_services) {
                const response = await this.walkin.save(andProcessPayment);

                if (response) {
                    this.initializeResults();
                }
            } else {
                flash({
                    message: 'Sorry, unable to process request',
                    alert: 'error',
                });
            }
        },
    },

    mounted() {
        this.options.config([
            'age_in',
        ]);
        this.walkin.non_patient = this.nonPatient;
    },
};
</script>
