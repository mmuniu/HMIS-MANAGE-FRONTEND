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

            <v-col md="9" cols="12" v-if="initialised">
                <v-card flat>
                    <v-card-text>

                        <p><strong>Admission Type:</strong> {{ admissionRequest.admission_type_name }}</p>

                        <div class="py-4 font-weight-bold">
                            Admit patient to morgue
                        </div>

                        <v-row class="m-4">
                            <v-col cols="12">
                                <div  class="mx-2">
                                    <v-text-field v-model="admissionObj.admission_data.body_form"
                                                  label="Body form" outlined
                                    ></v-text-field>
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <div  class="mx-2">
                                    <v-text-field v-model="admissionObj.admission_data.body_condition"
                                                  label="Condition of the body" outlined
                                    ></v-text-field>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div  class="mx-2">
                                    <v-text-field v-model="admissionObj.admission_data.received_by"
                                                  label="Received By" outlined
                                    ></v-text-field>
                                </div>
                            </v-col>
                            <v-col cols="6">
                                <div  class="mx-2">
                                    <collabmed-date-time-picker
                                        label="Admission Date"
                                        outline
                                        :maxDate="today"
                                        @input="setAdmissionDate"
                                    ></collabmed-date-time-picker>
                                </div>
                            </v-col>

                            <v-col cols="6">
                                <div  class="mx-2">
                                    <v-text-field v-model="admissionObj.admission_data.chief"
                                                  label="Chief" outlined
                                    ></v-text-field>
                                </div>
                            </v-col>

                            <v-col cols="6">
                                <div  class="mx-2">
                                    <v-text-field v-model="admissionObj.admission_data.sub_chief"
                                                  label="Sub Chief" outlined
                                    ></v-text-field>
                                </div>
                            </v-col>

                            <v-col cols="6">
                                <div  class="mx-2">
                                    <v-text-field v-model="admissionObj.admission_data.brought_by"
                                                  label="Brought by" outlined
                                    ></v-text-field>
                                </div>
                            </v-col>

                            <v-col cols="6">
                                <div  class="mx-2">
                                    <v-text-field v-model="admissionObj.admission_data.brought_by_mobile"
                                                  label="Brought by mobile" outlined
                                    ></v-text-field>
                                </div>
                            </v-col>

                            <v-col cols="6">
                                <div  class="mx-2">
                                    <v-select
                                        v-model="selectedFridge"
                                        :items="getFridgesCabinets"
                                        return-object
                                        item-text="name"
                                        label="Select a fridge"
                                        @change="updateCabinets(item)"
                                        outlined
                                        hide-details
                                    ></v-select>
                                </div>
                            </v-col>

                            <v-col cols="6" v-if="admissionObj.admission_data.fridge">
                                <div  class="mx-2">
                                    <v-select
                                        v-model="admissionObj.admission_data.cabinet"
                                        :items="cabinets"
                                        label="Select a cabinet"
                                        outlined
                                        hide-details
                                    ></v-select>
                                </div>
                            </v-col>

                            <v-col cols="12">
                                <div  class="mx-2">
                                    <v-textarea v-model="admissionObj.admission_data.comments"
                                                label="Comments" outlined
                                    ></v-textarea>
                                </div>
                            </v-col>

                            <v-col cols="12" md="12">
                                <v-btn block dark color="primary" class="mt-4" @click.once="admissionObj.save()">
                                    Save admission
                                    <v-icon class="pl-2">arrow_right_alt</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import AdmissionRequest from '@inpatient/libs/admission-requests/AdmissionRequest';
import Admission from "@morgue/libs/admissions/Admissions";
import moment from 'moment';
import { mapActions, mapGetters } from 'vuex';

export  default {
    props: {
        admissionRequestInst: {
            required: true
        },
    },

    data () {
        return {
            selectedFridge: null,
            cabinets: null,
            admissionRequest: null,
            admissionObj: new Admission(),
            admissionRequestObj: new AdmissionRequest(),
            today: moment(new Date()).format('YYYY-MM-DD HH:MM:ss'),
        }
    },

    computed: {
        ...mapGetters([
            'getFridgesCabinets'
        ]),

        initialised() {
            return this.admissionRequest;
        },
    },

    methods: {
        ...mapActions([
            'setFridgesCabinets'
        ]),

        setAdmissionDate(datetime) {
            this.admissionObj.admission_data.admission_date = datetime;
        },

        setReceivedBy (val) {
            this.admissionObj.admission_data.received_by = val.id;
        },

        updateCabinets () {
            this.admissionObj.admission_data.fridge = this.selectedFridge.name;

            const index = this.getFridgesCabinets.indexOf(this.selectedFridge);

            this.cabinets = this.getFridgesCabinets[index].cabinets;
        },

        initialise() {
            this.admissionRequestObj.find(this.admissionRequestId);
        }
    },

    mounted () {
        this.setFridgesCabinets();
        this.admissionRequest = this.admissionRequestInst;
        this.admissionObj.admission_data.visit_id = this.admissionRequestInst.visit_id;

    }
}
</script>
