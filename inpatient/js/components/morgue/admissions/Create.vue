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
                                  <v-autocomplete label="Received By" :items="users"
                                  item-text="username" item-value="id" outline
                                  v-model="admissionObj.admission_data.received_by"
                                  persistent-hint                   >
                                </v-autocomplete>

                                </div>
                            </v-col>





                            <v-col cols="6">
                                <div  class="mx-2">
                                    <collabmed-date-time-picker
                                    v-model="admissionObj.admission_data.admission_date"
                                        label="Admission Date"
                                        outline
                                        :maxDate="today"
                                        @change="setAdmissionDate"
                                    ></collabmed-date-time-picker>
                                </div>
                            </v-col>


                            <v-col cols="6">
                                <div  class="mx-2">
                                    <collabmed-date-time-picker
                                    v-model="admissionObj.admission_data.date_of_death"
                                        label="Date of Death"
                                        outline
                                        :maxDate="today"
                                        @change="setAdmissionDate"
                                    ></collabmed-date-time-picker>
                                </div>
                            </v-col>



                            <v-col cols="6">
                                <div  class="mx-2">
                                    <v-text-field v-model="admissionObj.admission_data.OB_Number_of_BID"
                                                  label="OB Number of BID" outlined
                                    ></v-text-field>
                                </div>
                            </v-col>

                            <v-col cols="6">
                                <div  class="mx-2">
                                    <v-text-field v-model="admissionObj.admission_data.place_of_death"
                                                  label="Place of Death" outlined
                                    ></v-text-field>
                                </div>
                            </v-col>

                            <v-col cols="6">

                                  <div  class="mx-2">
                                    <v-select
                                        v-model="admissionObj.admission_data.type_of_death"
                                        :items="typeofdeath"
                                        label="Select a Type of Death"
                                        item-value="value"
                                        item-text="name"
                                        outlined
                                        hide-details
                                    ></v-select>
                                </div>

                            </v-col>

                            <v-col cols="6">
                                <div  class="mx-2">
                                    <v-text-field v-model="admissionObj.admission_data.cause_of_death"
                                                  label="Cause of Death" outlined
                                    ></v-text-field>
                                </div>
                            </v-col>

                            <v-col cols="6">
                                <div  class="mx-2">
                                    <v-text-field v-model="admissionObj.admission_data.referred_from"
                                                  label="Referred From" outlined
                                    ></v-text-field>
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
                                        :items="fridges"
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
            fridges: null,
            admissionRequest: null,
            admissionObj: new Admission(),
            admissionRequestObj: new AdmissionRequest(),
            typeofdeath: [
        { value: 'clinical', name: 'Clinical' },
        { value: 'forensic', name: 'Forensic' }
      ],
            users: [],
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
          // console.log("datetime");
            this.admissionObj.admission_data.admission_date = datetime;
        },

        async fetchFridges() {
            try {
                const fridges = await fetch('/api/morgue/setup/get/morgue/fridges'); // Wait for the fetchPatients function to resolve
                const data = await fridges.json();
                this.fridges = data;

                // console.log(this.fridges);

                return data;

                // Display the list of patients or perform any other actions with the data
            } catch (error) {
                console.error('Failed to fetch patients:', error);
                // Handle the error
            }
      },

        setReceivedBy (val) {
            this.admissionObj.admission_data.received_by = val.id;
        },

        updateCabinets () {
            this.admissionObj.admission_data.fridge = this.selectedFridge.name;

            const index = this.fridges.indexOf(this.selectedFridge);


            this.cabinets = this.fridges[index].cabinets;
        },

        initialise() {
            this.admissionRequestObj.find(this.admissionRequestId);
        }
    },

   async mounted () {
        this.setFridgesCabinets();
        this.fetchFridges();
        this.admissionRequest = this.admissionRequestInst;
        this.admissionObj.admission_data.visit_id = this.admissionRequestInst.visit_id;

        // Extract the selected item IDs from this.splitBill.selected
// const selectedIds = this.splitBill.selected.map(item => item.id);

        // Make the POST request with the selected item IDs in the body
        const response = await fetch('/api/users/all/users', {
      method: 'GET', // Specify the request method
      headers: {
        'Content-Type': 'application/json', // Specify the content type if necessary
        // Add other headers if needed (e.g., Authorization)
      },
    });

        // Check if the response is successful
        if (!response.ok) {
      console.log(`HTTP error! status: ${response.status}`);
    }

        // Parse the response JSON data
        const data = await response.json();
        this.users = data.map(user => ({
          id: user.id,
          username: user.username
        }));
    console.log('Fetched users:', this.users);


    }
}
</script>
