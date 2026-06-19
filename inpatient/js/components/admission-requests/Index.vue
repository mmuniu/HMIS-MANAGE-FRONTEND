<template>

    <div>

        <v-card flat>
            <v-card-title>
                <v-tooltip bottom>
                    <v-btn icon dark small color="green" slot="activator" @click="initialise()">
                        <v-icon>cached</v-icon>
                    </v-btn>
                    <span>Refresh Table After Committing an Action</span>
                </v-tooltip>

                <h2 class="subheading font-weight-thin text-capitalize">
                    The Patient List: All the patients awaiting admission
                </h2>

                <v-spacer></v-spacer>

                <v-text-field
                        v-model="search"
                        append-icon="search"
                        label="Search loaded results"
                        hide-details
                ></v-text-field>

            </v-card-title>

            <v-card-text>

                <collabmed-loading v-if="!initialised"></collabmed-loading>

                <div v-else>

                    <div v-if="list && list.data">

                        <v-data-table
                                :headers="headers"
                                :items="list.data"
                                :search="search"
                                :loading="saveLoader"
                                class="mb-3"
                                disable-pagination
                                flat hide-default-footer
                        >
                            <template v-slot:item.actions="{ item }" style="min-width: 300px;">
                                <v-btn small
                                       color="pink"
                                       @click="authorize(item)"
                                       :dark="!item.authorization.status"
                                       :disabled="item.authorization.status"
                                       :loading="saveLoader"
                                >
                                    Authorize
                                </v-btn>

                                <v-btn dark small
                                       color="green"
                                       class="deposit"
                                       :value="item"
                                       @click="makePayment(item)"
                                       :loading="saveLoader"
                                >
                                    Payment Mode
                                </v-btn>

                                <v-btn small
                                       color="blue"
                                       :href="admit(item)"
                                       :dark="item.can_admit"
                                       :disabled="!item.can_admit"
                                       :loading="saveLoader"
                                >
                                    Admit
                                </v-btn>

                                <v-btn dark small
                                       color="red"
                                       @click="cancelRequest(item)"
                                       :loading="saveLoader"
                                >
                                    Cancel
                                </v-btn>

                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-btn dark small
                                               color="orange"
                                               v-on="on"
                                               :href="print(item)"
                                               target="_blank"
                                               :loading="saveLoader"
                                        >
                                            Print
                                        </v-btn>
                                    </template>
                                    <span>Print admission request form</span>
                                </v-tooltip>
                            </template>

                            <template v-slot:footer v-if="links">
                                <v-row  class="py-2 pb-2">
                                    <v-col cols="8" class="mt-3 ml-3">
                                        Showing {{ meta.from }} to {{ meta.to }} of {{ meta.total }} records
                                    </v-col>

                                    <v-col cols="3" class="text-right">
                                        <v-btn icon @click="navigate('p')">
                                            <v-icon>chevron_left</v-icon>
                                        </v-btn>

                                        <v-btn icon @click="navigate('n')">
                                            <v-icon>chevron_right</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </template>

                            <v-alert slot="no-results" :value="true" color="error" icon="warning">
                                Your search for "{{ search }}" found no results.
                            </v-alert>
                        </v-data-table>
                    </div>

                    <v-alert v-else :value="true" type="warning" outline>
                        No data was found
                    </v-alert>


                </div>

            </v-card-text>
        </v-card>

        <!--    authorize modal -->
        <authorize :show="dialog" :item="selected" v-if="selected" @close="close"></authorize>
        <payment :show="paymentDialog"
                 :patient-id="selected.patient_id"
                 v-if="selected"
                 :visit-id="selected.visit_id"
                 @accountDataChanged="accountDetailsChange"
                 @close="closePaymentDialog">
        </payment>

    </div>
</template>

<script>
import AdmissionRequest from "@inpatient/libs/admission-requests/AdmissionRequest";
import { mapActions, mapGetters } from "vuex";
import Authorize from "./partials/Authorize";
import Payment from "./partials/Payment";


export default {
    components: {
        Authorize, Payment,
    },

    props: [
       'morgue'
    ],

    data() {
        return {
            obj: new AdmissionRequest(),
            search: "",
            selected: null,
            saveLoader: false,
            dialog: false,
            paymentDialog: false,
            paymentInfo: null,
            page: 1,
            admissionList:[]

        };
    },

    computed: {
        ...mapGetters([
            "getAdmissionRequests",
        ]),

        list() {

            // console.log(this.getAdmissionRequests);
            return this.getAdmissionRequests;

        },

        meta() {
            return this.list.meta;
        },

        links() {
            return this.list.links;
        },

        headers() {
            return [
                {text : "patient Name", value:  'patient_name'},
                {text : "requesting facility", value:  'requested_facility_name'},
                {text : "Account Amount", value:  'account_amount'},
                {text : "Admission Type", value:  'admission_type_name'},
                {text : "Authorized Amount", value:  'authorization.amount'},
                {text : "Date", value:  'created_at'},
                {text : "Actions", value:  'actions'},
            ];
        },

        saved() {
            return this.obj.saved;
        },

        cancelled() {
            return this.obj.cancelled;
        },

        initialised() {
          // console.log(this.morgue)
          // if(!this.morgue)
          // {
            console.log(this.getAdmissionRequests);
            return this.getAdmissionRequests.data;
          // }
          // else
          // {
          //   console.log('this morgue');

          //   this.fetchAndDisplayPatients();


          // }

        },
    },

    watch: {
        saved(val) {
            if (val) {
                this.obj.saved = false;
                this.saveLoader = false;
                this.dialog = false;
                this.initialise();
            }
        },

        cancelled(val) {
            if (val) {
                this.list.data.splice(this.list.data.indexOf(this.selected), 1);

                this.selected = null;
                this.obj.cancelled = false;
                this.saveLoader = false;
            }
        },
    },

    methods: {
        ...mapActions([
            "setAdmissionRequests",
        ]),



        authorize(item) {
            this.selected = item;
            this.dialog = true;
        },

        async fetchAndDisplayPatients() {
        try {
            const patients = await fetch('/api/inpatient/get/admission-requests'); // Wait for the fetchPatients function to resolve
            const data = await patients.json();
            this.admissionList = data;

            // Display the list of patients or perform any other actions with the data
        } catch (error) {
            console.error('Failed to fetch patients:', error);
            // Handle the error
        }
    },

        makePayment(item) {
            this.paymentDialog = true;
            this.selected = item;
        },

        cancelRequest(item) {
            const self = this;

            if(confirm('Are you sure you want to cancel the admission request')) {
                this.obj.cancelRequest(item.id);
            }
        },

        admit(item) {
            return route("inpatient.admissions.create", item.id).relative();
        },

        print(item) {
            return route("inpatient.admission-requests.print", item.id).relative();
        },

        close() {
            this.selected = null;
            this.dialog = false;
        },

        accountDetailsChange() {
            this.initialise();
        },

        closePaymentDialog() {
            this.paymentDialog = false;
        },

        navigate(type) {

            let current_page = this.list.meta.current_page;

            if(type === 'p' && current_page > 1) {
                this.initialise(current_page - 1)
            } else {
                if(current_page <= this.list.meta.last_page) {
                    this.initialise(current_page + 1)
                }
            }
        },
        initialise(page) {

          const data = { page: page };
            if (this.morgue) {
                data.deceased = true;

            try {
                this.loading = true;
                const response =  fetch('/api/inpatient/admission-requests', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
                const responseData =  response.json();
                // Handle response data as needed
            } catch (error) {
                console.error('Error initializing admission requests:', error);
            } finally {
                this.loading = false;
            }
          }
          else
          {
            this.setAdmissionRequests();
          }
          //
          }

    },

    mounted() {
        this.initialise(1);
    },

    created() {
        window.events.$on("STORE_SET_ACTION_LOADING", (val) => {
            this.saveLoader = val;
        });
    },
};
</script>

<style scoped>

</style>
