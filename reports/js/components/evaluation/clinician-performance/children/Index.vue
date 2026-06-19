<template>
    <div>
        <collabmed-floating-loader v-if="list.length < 1 || obj.form.loading"></collabmed-floating-loader>
        <v-card v-if="list.visits">
            <v-card-title height="23">
                <h4>Clinician Visits Summary</h4>
            </v-card-title>
<!--            <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>-->
            <download-to-pdf :headers="clinical_visits_headers" :data="list.visits" :filename="filename"></download-to-pdf>
            <download-to-csv :headers="clinical_visits_headers" :data="list.visits" :filename="filename"></download-to-csv>
            <div>
                <v-alert
                        :value="true"
                        color="success"
                        outlined
                >
                    Total Visits: {{ list.total_visits }}
                </v-alert>
            </div>

            <v-data-table
                    :headers="clinical_visits_headers"
                    :items="list.visits"
                    class="elevation-1"
            >
            </v-data-table>
<!--            <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />-->
        </v-card>

        <v-card v-if="list.procedure">
          <v-card-title height="23">
            <h4>Clinician Procedures Summary</h4>
          </v-card-title>

          <!-- Download buttons -->
          <download-to-pdf :headers="clinical_Procedure_headers" :data="list.procedure" :filename="filename"></download-to-pdf>
          <download-to-csv :headers="clinical_Procedure_headers" :data="list.procedure" :filename="filename"></download-to-csv>

          <!-- New Button to Open Modal -->
          <div class="text-right mb-4">
            <v-btn color="primary" @click="assignUser">
              Assign User
            </v-btn>
          </div>

          <!-- Alert -->
          <v-alert :value="true" color="success" outlined>
            Total Procedures: {{ list.total_procedure }}
          </v-alert>

          <!-- Data Table -->
          <v-data-table :headers="clinical_Procedure_headers" :items="list.procedure" class="elevation-1"></v-data-table>

          <!-- Pagination -->
          <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />

          <v-dialog v-model="isModalOpen" max-width="600px">
            <v-card>
              <v-card-title>
                <span class="headline">Assign a User</span>
              </v-card-title>

              <v-card-text>
                <v-form ref="assignUserForm" v-model="valid">
                  <!-- User dropdown -->
                   <v-row>
                  <v-autocomplete
                    v-model="selectedUser"
                    :items="users"
                    item-text="username"
                    item-value="id"
                    label="Select a User"
                    :loading="loading"
                    :disabled="loading"
                    error-messages="error"
                    required
                  ></v-autocomplete>
                </v-row>
                <v-row>
                  <v-autocomplete
                    v-model="investigations"
                    :items="autocomplete"
                    item-text="procedure"
                    item-value="id"
                    label="Select a Procedure"
                    :loading="loading"
                    :disabled="loading"
                    error-messages="error"
                    required
                  ></v-autocomplete>
                </v-row>
                </v-form>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeModal">
                  Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="submitForm">
                  Submit
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>


        </v-card>

        <v-card v-if="list.lab">
            <v-card-title height="23">
                <h4>Clinician Lab Summary</h4>
            </v-card-title>
<!--            <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>-->
            <download-to-pdf :headers="clinical_lab_headers" :data="list.lab" :filename="filename" ></download-to-pdf>
            <download-to-csv :headers="clinical_lab_headers" :data="list.lab" :filename="filename"></download-to-csv>
            <div class="mx-5">
                <v-alert
                        :value="true"
                        color="success"
                        outlined
                >
                    Total Lab Tests: {{ list.total_lab_test }}
                </v-alert>
            </div>

            <v-data-table
                    :headers="clinical_lab_headers"
                    :items="list.lab"
                    class="elevation-1"
            >
            </v-data-table>
        </v-card>
        <v-card v-if="list.radiology">
            <v-card-title height="23">
                <h4>Clinician Radiology Summary</h4>
            </v-card-title>
<!--            <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>-->
            <download-to-pdf :headers="clinical_radiology_headers" :data="list.radiology" :filename="filename" ></download-to-pdf>
            <download-to-csv :headers="clinical_radiology_headers" :data="list.radiology" :filename="filename"></download-to-csv>
            <div>
                <v-alert
                        :value="true"
                        color="success"
                        outlined
                >
                    Total Radiology : {{ list.total_radiology }}
                </v-alert>
            </div>

            <v-data-table
                    :headers="clinical_radiology_headers"
                    :items="list.radiology"
                    class="elevation-1"
            >
            </v-data-table>
        </v-card>
        <v-card v-if="list.prescriptions">
            <v-card-title height="23">
                <h4>Clinician Prescription Summary</h4>
            </v-card-title>
          <!--            <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>-->
            <download-to-pdf :headers="clinical_prescription_headers" :data="list.radiology" :filename="filename" ></download-to-pdf>
            <download-to-csv :headers="clinical_prescription_headers" :data="list.radiology" :filename="filename"></download-to-csv>
            <div>
                <v-alert
                        :value="true"
                        color="success"
                        outlined
                >
                    Total Prescriptions : {{ list.total_prescriptions }}
                </v-alert>
            </div>

            <v-data-table
                    :headers="clinical_prescription_headers"
                    :items="list.prescriptions"
                    class="elevation-1"
            >
            </v-data-table>
        </v-card>
        <v-card v-if="list.admissions">
            <v-card-title height="23">
                <h4>Clinician Admissions Summary</h4>
            </v-card-title>
                          <!--            <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>-->
            <download-to-pdf :headers="clinical_admissions_headers" :data="list.radiology" :filename="filename" ></download-to-pdf>
            <download-to-csv :headers="clinical_admissions_headers" :data="list.radiology" :filename="filename"></download-to-csv>
            <div>
                <v-alert
                        :value="true"
                        color="success"
                        outlined
                >
                    Total Admissions : {{ list.total_admissions }}
                </v-alert>
            </div>

            <v-data-table
                    :headers="clinical_admissions_headers"
                    :items="list.admissions"
                    class="elevation-1"
            >
            </v-data-table>
        </v-card>
        <v-card v-if="list.procedure">
            <v-card-title height="23">
                <h4>Clinician Consultations Summary</h4>
            </v-card-title>
                          <!--            <download-to-excel :filters="obj.filters" :url="url" :filename="filename"></download-to-excel>-->
            <download-to-pdf :headers="clinical_consultation_headers" :data="list.radiology" :filename="filename" ></download-to-pdf>
            <download-to-csv :headers="clinical_consultation_headers" :data="list.radiology" :filename="filename"></download-to-csv>
            <div>
                <v-alert
                        :value="true"
                        color="success"
                        outlined
                >
                    Total Consultations : {{ list.total_admissions }}
                </v-alert>
            </div>

            <v-data-table
                    :headers="clinical_consultation_headers"
                    :items="list.admissions"
                    class="elevation-1"
            >
            </v-data-table>
        </v-card>

    </div>
</template>
<script>
import { reportsMixin } from "@reports/libs/reportsMixin";

export default {

    mixins: [
        reportsMixin,
    ],

    data: () => ({
        module: "evaluation",
        decoratorKey: "clinician-performance",
        investigations: [],
        filename: "Clinician Performance",
        users: [], // Holds users fetched from the API
        selectedUser: null, // Holds the selected user from the dropdown
        // loading: false, // Loading state for API call
        isModalOpen: false, // Controls modal visibility
        rowsPerPageItems: [50, 75, 100,
            {
                text: "$vuetify.dataIterator.rowsPerPageAll",
                value: -1,
            }],
        pagination: {
            rowsPerPage: 25,
        },
        clinical_visits_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Procedure", "value": "procedure", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],
        clinical_Procedure_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Procedure", "value": "procedure", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],

        clinical_lab_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Lab Test", "value": "lab_procedure", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],

        clinical_radiology_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Radiology", "value": "radiology", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],

        clinical_prescription_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Prescription", "value": "prescription", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],
        clinical_admissions_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Ward", "value": "ward", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],
        clinical_consultation_headers: [
            { "text": "Name", "value": "name", "sortable": false },
            { "text": "Procedure", "value": "procedure", "sortable": false },
            { "text": "Patient", "value": "patient", "sortable": false },
            { "text": "Time", "value": "time", "sortable": false },
        ],
    }),

    methods: {
        navigate(page) {
            this.get(page, this.obj.filters);
        },

        assignUser() {
        console.log(this.isModalOpen)
        this.isModalOpen = true; // Show the modal
      },
        closeModal() {
        this.isModalOpen = false;
      },
        submitForm() {
        console.log("Lord Help")
      },

      async fetchInvestigations() {
      try {
        const response = await fetch('/api/evaluation/all/investigations/'); // API to get investigations
        this.investigations = await response.json()[0];
      } catch (error) {
        console.error("Error fetching investigations:", error);
      }
    },
    assignInvestigation() {
      // Logic to assign the selected investigation to the selected user
      console.log('Assigning', this.selectedInvestigation, 'to user', this.selectedUser);
    },

          // Method to fetch users from the API
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      console.log(this.list.procedure)

      try {
        // Fetch users from the API (replace 'your-api-endpoint' with actual API URL)
        const response = await fetch('/api/users/all/users');
        const data = await response.json();

        // Set the users data
        this.users = data;

        // You can log the response to check its structure
        console.log('Users fetched successfully:', data);
      } catch (err) {
        this.error = err.message || 'Failed to fetch users';
        console.error('Error fetching users:', err);
      } finally {
        this.loading = false;
      }
    }
    },


    watch: {
        page(val) {
            this.obj.filters = _.omitBy(this.$route.query, _.isNil);

            this.obj.performFilter(this.module, this.decoratorKey, val);
        },
    },

    created() {
        this.processing_child = true;

        this.obj.filters = _.omitBy(this.$route.query, _.isNil);

        this.obj.performFilter(this.module, this.decoratorKey);
    },

    mounted() {
    // Call fetchUsers once the component is mounted
    this.fetchUsers();
    this.fetchInvestigations();
  }

};
</script>
