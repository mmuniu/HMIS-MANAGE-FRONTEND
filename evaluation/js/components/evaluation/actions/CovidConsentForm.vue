<template>
    <v-card flat>
        <v-card-title>Covid Request form</v-card-title>
        <v-card-text>
            <collabmed-loading v-if="!patient"></collabmed-loading>
            <div v-else>
                <div>PATIENT ID/PASSPORT NO: <span class="ml-4 font-weight-bold">{{ patient.id_no }} </span></div>
                <div>PATIENT NAME: <span class="ml-4 font-weight-bold">{{ patient.full_name }} </span></div>
                <div>
                    <span>GENDER: <span class="ml-4 font-weight-bold">{{ patient.sex }} </span></span>
                    <span class="ml-10">DOB: <span class="ml-4 font-weight-bold">{{ patient.date_of_birth }} </span></span>
                    <span class="ml-10">NATIONALITY: <span class="ml-4 font-weight-bold">{{ patient.nationality }} </span></span>
                </div>
                <div>OCCUPATION: <span class="ml-4 font-weight-bold">{{ patient.occupation }} </span></div>
                <div>
                    <span>PHONE NO: <span class="ml-4 font-weight-bold">{{ patient.mobile }} </span></span>
                    <span>EMAIL ADDRESS:: <span class="ml-4 font-weight-bold">{{ patient.email }} </span></span>
                </div>


                <h5 class="font-weight-bold mt-6">PATIENT PHYSICAL ADDRESS:</h5>
                <div>COUNTY: <span class="ml-4 font-weight-bold">{{ patient.county }} </span></div>
                <div>TOWN: <span class="ml-4 font-weight-bold">{{ patient.town }} </span></div>
                <div>ESTATE: <span class="ml-4 font-weight-bold">{{ patient.village }} </span></div>
                <div>STREET: <span class="ml-4 font-weight-bold">{{ patient.village }} </span></div>

                <h5 class="font-weight-bold mt-6">REASON FOR TESTING:</h5>
                <v-row>
                    <v-col><v-switch label="General screening" v-model="covidConsentForm.testing_reason.general_screening"></v-switch></v-col>
                    <v-col><v-switch label="Outbound passenger" v-model="covidConsentForm.testing_reason.outbound_passenger"></v-switch></v-col>
                    <v-col><v-switch label="Health care worker" v-model="covidConsentForm.testing_reason.health_care_worker"></v-switch></v-col>
                    <v-col><v-switch label="Quarantined" v-model="covidConsentForm.testing_reason.quarantined"></v-switch></v-col>
                </v-row>
                <v-row>
                    <v-col><v-switch label="Recent travel" v-model="covidConsentForm.testing_reason.recent_travel"></v-switch></v-col>
                    <v-col><v-switch label="Hospitality staff" v-model="covidConsentForm.testing_reason.hospitality_staff"></v-switch></v-col>
                    <v-col><v-switch label="Truck driver" v-model="covidConsentForm.testing_reason.truck_driver"></v-switch></v-col>
                    <v-col><v-switch label="Contact with a known positive case" v-model="covidConsentForm.testing_reason.contact_with_positive"></v-switch></v-col>
                </v-row>

                <h5 class="font-weight-bold mt-6">TRAVEL DETAILS:</h5>
                <v-row>
                    <v-col><h6>COUNTRY:</h6></v-col>
                    <v-col><h6>DATE OF DEPARTURE:</h6></v-col>
                    <v-col><h6>TIME OF DEPARTURE:</h6></v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <input
                            type="text"
                            style="width: 60%"
                            v-model="covidConsentForm.travel.country"
                        />
                    </v-col>
                    <v-col>
                        <input
                            type="text"
                            style="width: 60%"
                            v-model="covidConsentForm.travel.date"
                        />
                    </v-col>
                    <v-col>
                        <input
                            type="text"
                            style="width: 60%"
                            v-model="covidConsentForm.travel.time"
                        />
                    </v-col>
                </v-row>

                <br/>
                <v-row>
                    <v-col><h6>SYMPTOMS:</h6></v-col>
                    <v-col><h6>DATE OF ONSET OF SYMPTOMS:</h6></v-col>
                </v-row>

                <v-row>
                   <v-col>
                       <div><v-switch label="Fever (^38 degrees C)" v-model="covidConsentForm.symptoms.fever"></v-switch></div>
                       <div><v-switch label="Cough" v-model="covidConsentForm.symptoms.cough"></v-switch></div>
                       <div><v-switch label="Sore Throat" v-model="covidConsentForm.symptoms.sore_throat"></v-switch></div>
                       <div><v-switch label="Shortness of breath" v-model="covidConsentForm.symptoms.shortness_of_breath"></v-switch> </div>
                   </v-col>
                   <v-col>
                       <div><v-switch label="Chills" v-model="covidConsentForm.symptoms.chills"></v-switch></div>
                       <div><v-switch label="Diarrhoea" v-model="covidConsentForm.symptoms.diarrhoea"></v-switch></div>
                       <div><v-switch label="Nausea/vomiting" v-model="covidConsentForm.symptoms.nausea"></v-switch></div>
                       <div>Other:
                           <input
                               type="text"
                               style="width: 60%"
                               v-model="covidConsentForm.symptoms.others"
                           />
                       </div>
                   </v-col>
                </v-row>

                <br/>
                <br/>

                <v-row>
                    <v-col>
                        <div>NEXT OF KIN: <span class="ml-4 font-weight-bold" v-if="patient.nok.length > 0">{{ patient.nok[patient.nok.length - 1].first_name  }} {{ patient.nok[patient.nok.length - 1].last_name }} </span></div>
                        <div>RELATIONSHIP:
                            <span class="ml-4 font-weight-bold"
                                                 v-if="patient.nok.length > 0 && configurations.relationship">
                                {{ getRelationship() }}
                            </span>
                        </div>
                        <div>NEXT OF KIN PHONE NO: <span class="ml-4 font-weight-bold"  v-if="patient.nok.length > 0">{{ patient.nok[patient.nok.length - 1].mobile }} </span></div>
                    </v-col>
                    <v-col>
                        <div>EMPLOYER NAME: <span class="ml-4 font-weight-bold">
                             <input
                                 type="text"
                                 style="width: 30%"
                                 v-model="covidConsentForm.employer.name"
                             />
                        </span></div>
                        <div>EMPLOYER CONTACT: <span class="ml-4 font-weight-bold">
                             <input
                                 type="text"
                                 style="width: 27%"
                                 v-model="covidConsentForm.employer.contact"
                             />
                        </span></div>
                        <div>EMPLOYER PHONE: <span class="ml-4 font-weight-bold">
                             <input
                                 type="text"
                                 style="width: 30%"
                                 v-model="covidConsentForm.employer.mobile"
                             />
                        </span></div>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <div style="margin-top: 10px; font-style: italic; font-size: 16px; color: grey;">
                            My signature indicates my understanding of, and my agreement to: comply with the terms of the legal declaration,
                            provide consent for the processing of personal information and the releasing of test results as documented on
                            this form. I give consent for tests and guarantee payment of any amount.
                        </div>
                    </v-col>
                </v-row>

                <v-row>
                    <v-col>
                        <signature @imageSaved="saveSignature"
                                   width="500px"
                                   instance="consent"
                                   :instance-id="$route.params.visitId"
                                   height="200px"></signature>
                    </v-col>
                    <v-col>
                        <img v-if="covidConsentForm.signature" :src="covidConsentForm.signature" width="200px" height="100px"/>
                    </v-col>
                </v-row>


              <div class="mt-6">
                  <v-btn small class="mt-4" color="success" @click="saveRecords()">save</v-btn>
                  <v-btn small class="mt-4" color="primary" @click="printConsentForm()">print form</v-btn>
              </div>

            </div>
        </v-card-text>
    </v-card>
</template>
<script>
    import { mapActions, mapGetters } from "vuex";
    import Visit from '@reception/libs/visits/Visit';
    import SettingsOptions from '@settings/libs/SettingsOptions';
    import Signature from "@finance/components/signatures/partials/Signature"
    import CovidConsentForm from "@evaluation/libs/CovidConsent/CovidConsentForm";

    export default {
        components: {
            Signature
        },

        data () {
            return {
                visitObj: new Visit(),
                options: new SettingsOptions(),
                covidConsentForm: new CovidConsentForm()
            }
        },

        computed: {
            ...mapGetters({
                covidConsent: 'getCovidConsent'
            }),

            patient () {
                if(this.visitObj.selectedVisit) {
                    return this.visitObj.selectedVisit.patient
                } else {
                    return null;
                }
            },

            configurations() {
                return this.options.configurations;
            },
        },

        watch: {
            covidConsent (val) {
                this.covidConsentForm.assemble(val.data);
            }
        },

        methods: {
            ...mapActions([
                'setCovidConsent'
            ]),

            getRelationship() {
                if(this.configurations.relationship) {
                    return this.configurations.relationship.find(x => x.id === this.patient.nok[this.patient.nok.length - 1].relationship_id).item_name
                } else {
                    return '';
                }
            },

            saveSignature(image) {
                this.covidConsentForm.signature = image;
            },

            async saveRecords () {
                const response = await this.covidConsentForm.save(this.$route.params.visitId);

                if(response) {
                    window.location.reload();
                }
            },

            printConsentForm () {
                window.open(`/evaluation/covid-consent-form/${this.$route.params.visitId}/print`, '_blank');
            },

            init() {
                this.options.config([
                    'relationship',
                ]);
                this.visitObj.find(this.$route.params.visitId);
            }
        },

        mounted () {
            this.init();
            /* remove the error messages sections <not validating here */
            document.querySelectorAll('.v-messages').forEach(e => e.remove());
            this.setCovidConsent({
                params: {
                    visit_id: this.$route.params.visitId
                }
            })
        }
    }
</script>
<style scoped>
    .v-input--selection-controls {
        margin-top: 0;
        padding-top: 0;
    }

    input[type=text] {
        padding: 7px 15px;
        margin: 3px 0;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }
</style>
