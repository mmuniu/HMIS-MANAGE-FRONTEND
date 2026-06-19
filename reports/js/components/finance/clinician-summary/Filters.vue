
<template>
    <v-card class="pa-0" color="transparent" flat>
        <v-card-text class="py-0 my-0">
            <v-row  >
                <v-col cols="12" md="3">
                    <div class="mx-2">
                        <v-autocomplete
                                :items="facilities.facilities"
                                outline
                                v-model="filters.facility_id"
                                color="blue-grey lighten-2"
                                label="Select Facility"
                                item-text="name"
                                clearable
                                @click:clear="facilityCleared"
                                item-value="id"
                                @input="facilitySelected"
                        ></v-autocomplete>
                    </div>
                </v-col>



                <v-col cols="12" md="3">
                    <div class="mx-2">
                        <v-autocomplete
                                v-model="filters.doctor"
                                :items="all_doctors.data"
                                :search-input.sync="search"
                                outline
                                hide-no-data
                                hide-selected
                                item-text="name"
                                clearable
                                @clear:clear="doctorCleared"
                                item-value="id"
                                label="Select Doctor"
                        ></v-autocomplete>
                    </div>
                </v-col>

                <v-col md="2">
                  <!--dropdown-->
                  <v-select
                          :items="treatmentLocations"
                          label="Treatment Locations"
                          item-text="name"
                          @change="changeLocation()"
                          item-value="id"
                          v-if="treatmentLocations"
                          v-model="filters.treatment_location_id"
                          outline
                  ></v-select>
              </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
                </v-col>

                <v-col md="2">
                    <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
                </v-col>

            </v-row>
            <v-row  >

                <v-col>
                    <v-btn @click="filter()" class="v-btn v-btn--small theme--light primary" color="success">filter</v-btn>
                    <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
                   <!-- New Button to Open Modal -->
                   <v-btn @click="openModal" class="v-btn v-btn--small theme--light" color="primary">Assign User</v-btn>

                  </v-col>
            </v-row>
        </v-card-text>
            <!-- Modal Dialog -->
    <v-dialog v-model="showModal" persistent max-width="600px">
      <v-card>
          <v-card-title class="headline">Assign User Modal</v-card-title>

          <v-card-text>
              <!-- Content inside the modal -->
              <v-form>

                  <v-row  >
                    <v-col cols="12" md="3">
                        <div class="mx-2">


                            <v-autocomplete
                                    :items="performedByArray"
                                    outline
                                    v-model="assignUser.userSelected"
                                    color="blue-grey lighten-2"
                                    label="Select User to Assign Procedure to User"
                                    item-text="username"
                                    clearable
                                    @click:clear="performedByArray"
                                    item-value="id"
                                    @input="facilitySelected"
                            ></v-autocomplete>
                        </div>
                    </v-col>

                    <v-col cols="12" md="3">
                        <div class="mx-2">
                          <v-autocomplete
                          :items="patientsToBeSelected"
                          outline
                          v-model="assignUser.patientSelected"
                          color="blue-grey lighten-2"
                          label="Select Patients"
                          item-text="name"
                          clearable
                          @click:clear="facilityCleared"
                          item-value="id"
                          @input="facilitySelected"
                          @change="onPatientChange"
                      ></v-autocomplete>

                        </div>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="3">

                        <div class="mx-2">
                            <v-autocomplete
                                    :items="investigationsSelected"
                                    outline
                                    v-model="assignUser.investigationSelected"
                                    color="blue-grey lighten-2"
                                    label="Select Procedure Performed"
                                    item-text="procedure_name"
                                    clearable
                                    @click:clear="facilityCleared"
                                    item-value="id"
                                    @input="facilitySelected"
                            ></v-autocomplete>
                        </div>
                    </v-col>
                    </v-row>

              </v-form>

          </v-card-text>

          <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="submitModalData">Submit</v-btn>
              <v-btn color="blue darken-1" text @click="closeModal">Close</v-btn>
          </v-card-actions>
      </v-card>
  </v-dialog>
    </v-card>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import _ from "lodash";
import moment from "moment";

export default {
    props: {
        obj: {
            required: true,
            type: Object,
        },
    },

    data() {
        return {
            filename: "Clinician Report",
            loading: false,
            showModal: false,
            search: "",
            filters: {
                start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
                end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
                doctor: "",
                facility_id: null,
                treatment_location_id: null
            },
            treatmentLocations: [],
            performedByArray: [],
            patientsToBeSelected: [],
            investigationsSelected: [],
            assignUser : {
              userSelected : null,
              patientSelected : null,
              investigationSelected: null
            }

        };
    },

    watch: {
        getUsers(newValue, oldValue) {

        },
    },

    computed: {
        ...mapGetters({
            all_doctors: "getUsers",
            facilities: "getFacilities",
        }),

        url() {

            return "/api/reports/module/finance/clinician-summary";
        },
    },

    methods: {
        ...mapActions([
            "setUsers", "setFacilities",
        ]),


        onPatientChange()
        {
            this.getInvestigation(this.assignUser.patientSelected);
        },

    // Function to submit modal form data
        async submitModalData() {
          const postData = {

            userSelected: this.assignUser.userSelected,
            patientSelected : this.assignUser.patientSelected,
            investigationSelected: this.assignUser.investigationSelected
            // Add any other form data you want to send
          };



          try {
            const response = await fetch('/api/evaluation/assign/user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(postData),
            });

            if (!response.ok) {
              throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            flash(responseData)


            // Optional: Handle success response, such as closing the modal
            this.closeModal();
          } catch (error) {
            console.error('Error:', error);
            // Handle error case
          }
        },

        async fetchAllUsers()
        {
          try {
                  this.loading = true;
                  const response = await fetch('/api/users/all/users'); // Update with your API endpoint
                  if (!response.ok) {
                    throw new Error(`API call failed: ${response.statusText}`);
                  }
                  const data = await response.json();
                  this.performedByArray = data;

                } catch (error) {
                  console.error('Error fetching procedure tag titles:', error);
                } finally {
                  this.loading = false;
                }
        },

        async getInvestigation(patient_id)
        {
          try {

                  this.loading = true;
                  const response = await fetch('/api/evaluation/all/patient/investigations/'+patient_id); // Update with your API endpoint
                  if (!response.ok) {
                    throw new Error(`API call failed: ${response.statusText}`);
                  }
                  const data = await response.json();

                  this.investigationsSelected = data[0];


                } catch (error) {
                  console.error('Error fetching procedure tag titles:', error);
                } finally {
                  this.loading = false;
                }
        },


        async getTreatmentLocations()
        {
                try {
                  this.loading = true;
                  const response = await fetch('/api/evaluation/treatment-locations'); // Update with your API endpoint
                  if (!response.ok) {
                    throw new Error(`API call failed: ${response.statusText}`);
                  }
                  const data = await response.json();
                  this.treatmentLocations = data;


                } catch (error) {
                  console.error('Error fetching procedure tag titles:', error);
                } finally {
                  this.loading = false;
                }
        },
        async getPatients()
        {
                try {
                  this.loading = true;
                  const response = await fetch('/api/evaluation/all/patients'); // Update with your API endpoint
                  if (!response.ok) {
                    throw new Error(`API call failed: ${response.statusText}`);
                  }
                  const data = await response.json();
                  this.patientsToBeSelected = data;


                } catch (error) {
                  console.error('Error fetching procedure tag titles:', error);
                } finally {
                  this.loading = false;
                }
        },

        facilitySelected(facility) {
            this.filters.facility_id = facility;
        },

        facilityCleared() {
            this.filters.facility_id = null;
        },

        doctorCleared() {
            this.filters.doctor = null;
        },

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },
        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },
        openModal() {
          window.open('/reports/module/finance/assign-user', '_blank');
        },
        unassignedConsultation() {
          window.open('/reports/module/finance/assign-user?tag=consultation', '_blank');
        },
        unassignedDoctorFees() {
          window.open('/reports/module/finance/assign-user?tag=doctor', '_blank');
        },
        // Function to handle closing the modal
        closeModal() {
          this.showModal = false;
        },

        changeLocation() {
            // return window.location = `${this.changeLocationUrl}?location=${this.treatment_location}&facility=${this.facilityId}`;
        },


        filter() {
            this.obj.filters = _.omitBy(this.filters, _.isNil);


            this.$emit("filter");
        },
    },

    mounted() {
        this.setUsers({
            page: 2,
            params: {
                role: "doctor",
            },
        });
        this.setFacilities();

        this.getTreatmentLocations();
        this.fetchAllUsers();
        this.getPatients();
    },
};
</script>
