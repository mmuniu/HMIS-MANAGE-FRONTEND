<template>
  <v-card class="pa-0" color="transparent" flat>
      <v-card-text class="py-0 my-0">
          <v-row>
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

              <v-col md="2">
                  <v-autocomplete
                      :items="treatmentLocations"
                      label="Treatment Locations"
                      item-text="name"
                      @change="changeLocation()"
                      item-value="id"
                      v-if="treatmentLocations"
                      v-model="filters.treatment_location_id"
                      outline
                  ></v-autocomplete>
              </v-col>

              <!-- Doctors Dropdown -->
              <v-col md="2">
                  <v-autocomplete
                      :items="performingDoctorOptions"
                      label="Select Doctor"
                      item-text="text"
                      item-value="value"
                      v-model="filters.doctor_id"
                      outline
                  ></v-autocomplete>
              </v-col>

              <!-- Users Dropdown -->
              <v-col md="2">
                  <v-autocomplete
                      :items="performedByArray"
                      label="Select User"
                      item-text="full_name"
                      item-value="id"
                      v-model="filters.userSelected"
                      outline
                  ></v-autocomplete>
              </v-col>


                  <!-- Criteria Dropdown -->
                  <v-col md="2">
                    <v-autocomplete
                        :items="criteriaOptions"
                        label="Select Category Option"
                        item-text="text"
                        item-value="value"
                        v-model="filters.criteria"
                        outline
                    ></v-autocomplete>
                </v-col>
                <!-- Status Dropdown -->
                <v-col md="2">
                    <v-autocomplete
                        :items="assignStatusOptions"
                        label="Select Assign Status Option"
                        item-text="text"
                        item-value="value"
                        v-model="filters.assignStatus"
                        outline
                    ></v-autocomplete>
                </v-col>

              <!-- Procedures Dropdown -->
              <v-col md="2">
                  <v-autocomplete
                      :items="procedureSelected"
                      label="Select Procedure"
                      item-text="name"
                      item-value="id"
                      v-model="filters.investigationSelected"
                      outline
                  ></v-autocomplete>
              </v-col>


              <v-col md="2">
                  <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
              </v-col>

              <v-col md="2">
                  <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
              </v-col>
          </v-row>

          <v-row>
              <v-col>
                  <v-btn @click="filter()" class="v-btn v-btn--small theme--light primary" color="success">Filter</v-btn>
                  <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
              </v-col>
          </v-row>
      </v-card-text>
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
            criteriaOptions:[
                        {text: 'Procedure', value: 'procedure'},
                        {text: 'Lab Procedures', value: 'lab'},
                        {text: 'Doctor Procedures', value: 'doctor'},
                        {text: 'Radiology Procedures', value: 'radiology'},
                        {text: 'Consultation Procedures', value: 'consultations'}
                ],
            assignStatusOptions: [
              {text: 'Unassigned', value: 'unassigned'},
              {text: 'Assigned', value: 'procedure'},
            ],
            filters: {
                start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
                end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
                doctor_id: null,
                facility_id: null,
                treatment_location_id: null,
                userSelected: null,
                investigationSelected : null,
                criteria: null,
                assignStatus: null
                        },
            treatmentLocations: [],
            performedByArray: [],
            patientsToBeSelected: [],
            investigationsSelected: [],
            procedureSelected : [],
            performingDoctorOptions: [],
            assignUser : {
              userSelected : null,
              patientSelected : null,
              investigationSelected: null,

            }

        };
    },

    watch: {
        getUsers(newValue, oldValue) {
            console.log(newValue, oldValue);
        },
    },

    computed: {
        ...mapGetters({
            all_doctors: "getUsers",
            facilities: "getFacilities",
        }),

        url() {
            return "/api/reports/module/finance/assign-user";
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
                  console.error('Error fetching users titles:', error);
                } finally {
                  this.loading = false;
                }
        },

        async fetchPerformingDoctors() {
          try {
              const response = await fetch('/api/users/get/doctors'); // Your API endpoint
              if (!response.ok) {
                  throw new Error(`API call failed: ${response.statusText}`);
              }
              const doctors = await response.json();
              this.performingDoctorOptions = doctors.map((doctor) => ({
                  text: doctor.profile.full_name, // You can adjust this based on the actual response structure
                  value: doctor.id,
              }));
          } catch (error) {
              console.error('Error fetching doctors:', error);

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
        async getInvestigations()
        {
                try {
                  this.loading = true;
                  const response = await fetch('/api/evaluation/all/procedures/'); // Update with your API endpoint
                  if (!response.ok) {
                    throw new Error(`API call failed: ${response.statusText}`);
                  }
                  const data = await response.json();
                  this.procedureSelected = data;


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
          window.open('/reports/module/finance/assign-users', '_blank');
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
        this.getInvestigations();
        this.getTreatmentLocations();
        this.fetchAllUsers();
        this.fetchPerformingDoctors();
        this.getPatients();
    },
};
</script>
