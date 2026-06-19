<template>
    <div>
        <v-card>

            <v-expansion-panels focusable v-model="panel">
                <v-expansion-panel>
                    <v-expansion-panel-header>Click here to add a new contact</v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <v-card flat>
                            <v-card-text>
                                <v-row>
                                    <v-col cols="12">
                                        <h2 class="body-2 ma-0 pa-0 grey--text">
                                            *Types of Contact: <br/>
                                            <span class="px-2">1.) Working together in close proximity or sharing the same classroom environment with a nCoV patient</span> <br/>
                                            <span class="px-2">2.) Traveling together with a nCoV patient in any kind of conveyance</span> <br/>
                                            <span class="px-2">3.) Living in the same household as a nCoV patient</span> <br/>
                                            <span class="px-2">4.) Health care associated exposure, including providing direct care for nCoV patients, working with health care workers infected with novel coronavirus, visiting patients or staying in the same close
                            environment as a nCoV patient</span> <br/>
                                        </h2>
                                    </v-col>
                                </v-row>

                                <collabmed-loading v-if="!configurations"></collabmed-loading>

                                <v-container fluid  v-else>
                                    <v-row>
                                        <v-col  cols="3" class="px-3">
                                            <v-text-field label="First name" v-model="contactTracing.details.profile.first_name"></v-text-field>
                                        </v-col>

                                        <v-col  cols="3" class="px-3">
                                            <v-text-field label="Last name" v-model="contactTracing.details.profile.last_name"></v-text-field>
                                        </v-col>

                                        <v-col  cols="3" class="px-3">
                                            <v-text-field label="Id no." v-model="contactTracing.details.profile.id_no"></v-text-field>
                                        </v-col>

                                        <v-col  cols="3" class="px-3">
                                            <v-text-field label="Mobile" v-model="contactTracing.details.profile.mobile"></v-text-field>
                                        </v-col>

                                        <v-col  cols="3" class="px-3">
                                            <v-text-field label="Age" v-model="contactTracing.details.profile.age"></v-text-field>
                                        </v-col>

                                        <v-col  cols="3" class="px-3" v-if="configurations.age_in">
                                            <v-select label="Age in" v-if="configurations.age_in.length > 0" :items="configurations.age_in" item-text="item_name"
                                                      item-value="item_name"
                                                      v-model="contactTracing.details.profile.age_in"
                                            >
                                            </v-select>
                                        </v-col>

                                        <v-col cols="3">
                                            <div class="mx-3">
                                                <v-select label="Gender *"
                                                          :items="genders"
                                                          v-model="contactTracing.details.profile.sex"
                                                          outlined persistent-hint
                                                ></v-select>
                                            </div>
                                        </v-col>

                                        <v-col  cols="3" class="px-3">
                                            <v-text-field label="secondary mobile" v-model="contactTracing.details.profile.telephone"></v-text-field>
                                        </v-col>

                                        <v-col  cols="3" class="px-3">
                                            <v-text-field label="email" v-model="contactTracing.details.profile.email"></v-text-field>
                                        </v-col>

                                        <v-col  cols="3" class="px-3">
                                            <v-text-field label="Secondary email" v-model="contactTracing.details.profile.secondary_email"></v-text-field>
                                        </v-col>

                                        <v-col  cols="3" class="px-3">
                                            <v-text-field label="Town" v-model="contactTracing.details.profile.town"></v-text-field>
                                        </v-col>

                                        <v-col cols="3" >
                                            <div class="mx-3">
                                                <v-autocomplete
                                                        v-if="counties.length > 1"
                                                        :items="counties"
                                                        label="County of residence"
                                                        @input="fetchSubCounties()"
                                                        outlined
                                                        chips
                                                        deletable-chips
                                                        v-model="contactTracing.details.profile.resident_county">
                                                </v-autocomplete>
                                                <v-text-field v-else label="County of residence"
                                                              v-model="contactTracing.details.profile.resident_county"
                                                              outlined>
                                                </v-text-field>
                                            </div>
                                        </v-col>

                                        <v-col cols="3" >
                                            <div class="mx-3">
                                                <v-autocomplete
                                                        v-if="sub_counties.length > 1"
                                                        :items="sub_counties"
                                                        label="Sub county of residence"
                                                        outlined
                                                        item-text="sub_county"
                                                        item-value="sub_county"
                                                        chips
                                                        deletable-chips
                                                        v-model="contactTracing.details.profile.resident_sub_county">
                                                </v-autocomplete>
                                                <v-text-field v-else
                                                              label="Sub county of residence"
                                                              v-model="contactTracing.details.profile.resident_sub_county"
                                                              outlined>
                                                </v-text-field>
                                            </div>
                                        </v-col>

                                        <v-col cols="3" >
                                            <collabmed-date-time-picker label="Date of last contact"
                                                                        outline
                                                                        dateOnly
                                                                        v-model="contactTracing.details.date_of_last_contact">
                                            </collabmed-date-time-picker>
                                        </v-col>

                                        <v-col cols="3" >
                                            <v-select lable="Type of contact"
                                                      v-model="contactTracing.type_of_contact"
                                                      :items="['Type 1', 'Type 2', ' Type 3', 'Type 4']">
                                            </v-select>
                                        </v-col>

                                        <v-col cols="3" >
                                            <v-switch label="Is a health care worker"
                                                      v-model="contactTracing.details.is_health_care_worker">
                                            </v-switch>
                                        </v-col>

                                        <v-col cols="3" >
                                            <v-text-field label="Head of household"
                                                          v-model="contactTracing.details.head_of_household">
                                            </v-text-field>
                                        </v-col>

                                        <v-col cols="3" >
                                            <v-switch label="Patient has symptoms"
                                                      v-model="contactTracing.details.has_symptoms">
                                            </v-switch>
                                        </v-col>

                                        <v-col cols="3"  v-if="contactTracing.details.has_symptoms">
                                            <div class="mx-3">
                                                <v-combobox
                                                        outlined label="Symptoms"
                                                        :items="configurations.covid_symptoms"
                                                        hint="To enter non-existent symptom, press tab after typing the symptom"
                                                        persistent-hint
                                                        item-text="item_name"
                                                        :return-object="false"
                                                        item-value="item_name"
                                                        multiple chips
                                                        v-model="contactTracing.details.symptom_details"
                                                ></v-combobox>
                                            </div>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn v-if="!contactTracing.details.detail_id" color="primary darken-1" @click="saveDetails()">submit details</v-btn>
                                <v-btn v-else color="primary darken-1" @click="saveDetails()">Update details</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>

            <v-card-title>
                <h3 class="grey--text">Contact(s) listing</h3>
            </v-card-title>

            <collabmed-loading v-if="!details.data"></collabmed-loading>

            <v-data-table v-else :headers="headers" :items="details.data">
                <template v-slot:item.hash="{ item }">
                    <v-btn small color="primary" icon @click="editPatientData(item)">
                        <v-icon small>edit</v-icon>
                    </v-btn>
                </template>
                <template v-slot:item.actions="{ item }">
                    <evaluation-sample-collection-request-dialog  :patient="item.patient"></evaluation-sample-collection-request-dialog>
                    <v-btn small color="success" @click="setTargetTrace(item)">update trace</v-btn>
                </template>
            </v-data-table>

            <v-dialog v-model="status_dialog" persistent max-width="50%">
                <v-card>
                    <v-card-title class="headline grey darken-3 white--text">
                        Update contact trace status
                        <v-spacer></v-spacer>
                        <v-btn small color="red"
                               @click="status_dialog = false"
                               text
                               rounded
                               class="white--text"
                               fab style="font-weight: bold">x</v-btn>
                    </v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" class="px-3">
                                <div>
                                    <v-select label="Call Status"
                                              :items="['Called', 'Unreachable', 'Didn\'t pick', 'Not called yet', 'Incorrect number']"
                                              v-model="contactTracing.contact_trace_update.call_status"
                                    >
                                    </v-select>
                                </div>
                            </v-col>

                            <v-col cols="12" class="px-3">
                                <div>
                                    <v-select label="Trace Status"
                                              :items="['Traced', 'Untraceable']"
                                              v-model="contactTracing.contact_trace_update.tracking_status"
                                    >
                                    </v-select>
                                </div>
                            </v-col>

                            <v-col cols="12" class="px-3">
                                <v-switch label="Has travelled"
                                            v-model="contactTracing.contact_trace_update.has_travelled">
                                </v-switch>
                            </v-col>

                            <v-col cols="12" class="px-3" v-if="contactTracing.contact_trace_update.has_travelled">
                                <collabmed-date-time-picker label="Arrival date"
                                                            dateOnly
                                            v-model="contactTracing.contact_trace_update.arrival_date">
                                </collabmed-date-time-picker>
                            </v-col>

                            <v-col cols="12" class="px-3">
                                <v-textarea label="Comments"
                                            placeholder="more information about the trace state e.g. contact in traveled to webuye"
                                            outlined
                                            v-model="contactTracing.contact_trace_update.comments">
                                </v-textarea>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="updateTraceStatus">save</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-card>
    </div>
</template>
<script>
import ContactTracing from '@reception/libs/contact-tracing/ContactTracing';
import SettingsOptions from '@settings/libs/SettingsOptions';
import { mapActions, mapGetters } from 'vuex';

export default {
    props: [
        'contactId',
    ],

    data: () => ({
        dialog: false,
        status_dialog: false,
        panel: null,
        genders: [
            { text: 'Male', value: 'male' },
            { text: 'Female', value: 'female' },
        ],
        options: new SettingsOptions(),
        contactTracing: new ContactTracing(),
        headers: [
            { text: '#', value: 'hash' },
            { text: 'patient name', value: 'patient_name' },
            { text: 'Mobile', value: 'patient.mobile' },
            { text: 'Call Status', value: 'call_status' },
            { text: 'Tracking Status', value: 'tracking_status' },
            { text: 'Type of Contact', value: 'type_of_contact' },
            { text: 'Results', value: 'results' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    computed: {
        ...mapGetters({
            details: 'getContactTracingDetails',
            counties: 'getCounties',
            sub_counties: 'getSubCounties'
        }),

        configurations() {
            return this.options.configurations;
        },
    },

    methods: {
        ...mapActions([
            'setContactTracingDetails', 'setSubCounties', 'setCounties'
        ]),

        setTargetTrace(item) {
            this.status_dialog = true;
            this.contactTracing.contact_trace_update.has_travelled = item.has_travelled;
            this.contactTracing.contact_trace_update.arrival_date = item.arrival_date;
            this.contactTracing.contact_trace_update.call_status = item.call_status;
            this.contactTracing.contact_trace_update.tracking_status = item.tracking_status;
            this.contactTracing.contact_trace_update.contact_id = item.id;
            this.contactTracing.contact_trace_update.comments = item.comments;
        },

        async saveDetails() {
            this.contactTracing.details.contact_id = this.contactId;

            const response = await this.contactTracing.saveDetails();

            if (response) {
                this.initialize();
                this.panel = null;
            }
        },

        async updateTraceStatus() {
            this.contactTracing.details.contact_id = this.contactId;

            const response = await this.contactTracing.updateTraceStatus();

            if (response) {
                this.initialize();
                this.status_dialog = false;
            }
        },

        async fetchCountries() {

            this.contactTracing.details.nationality = 'Kenya';

            let response = await fetch('https://restcountries.eu/rest/v2/all?fields=name;capital');

            if(response) {
                this.countries = await response.json();
            }
        },

        fetchSubCounties () {
            this.getSubCounties = [];

            this.setSubCounties({
                params: {
                    county: this.contactTracing.details.profile.resident_county
                }
            });
        },

        editPatientData (contact) {
            this.contactTracing.assemble(contact);

            this.panel = 0;

            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        initialize() {
            this.setContactTracingDetails({
                params: {
                    contact_id: this.contactId,
                },
            });

            this.options.config([
                'relationship', 'age_in', 'covid_symptoms',
            ]);

            this.contactTracing.details.profile.resident_county = 'Kisii';

            this.fetchSubCounties();
            this.fetchCountries();
            this.setCounties();
        },
    },

    watch: {
        counties () {
            this.fetchSubCounties();
        }
    },

    mounted() {
        this.initialize();
    },
};
</script>
