<template>
  <div>
      <collabmed-floating-loader v-if="list.length < 1 || obj.form.loading"></collabmed-floating-loader>

      <!-- Clinician Investigation Form -->
      <v-card>
          <v-card-title height="23">
              <h4>Assign User Form</h4>
          </v-card-title>

          <v-form @submit.prevent="submitForm">
              <!-- Investigation Autocomplete -->
              <v-col cols="4" md="3">
                <div class="mx-2">
                  <v-text-field
                  v-model="assignUser.procedure_name_selected"
                  label="Procedure Performed"
                  readonly
                  outline
                ></v-text-field>
              </div>
              </v-col>

              <!-- User Autocomplete -->
              <v-autocomplete
              :items="performedByArray"
              outline
              v-model="assignUser.userSelected"
              color="blue-grey lighten-2"
              label="Select User to Assign Procedure to User"
              item-text="full_name"
              clearable
              @click:clear="performedByArray"
              item-value="id"
              @input="performedByArray"
                ></v-autocomplete>

              <!-- Submit Button -->
              <v-btn color="primary" type="submit">Submit</v-btn>
          </v-form>
      </v-card>
  </div>
</template>

<script>
import { reportsMixin } from "@reports/libs/reportsMixin";

export default {
  mixins: [reportsMixin],

  data: () => ({
    performedByArray: [],
      patientsToBeSelected: [],
      investigationsSelected: [],
      showModal: false,
      assignUser : {
        userSelected : null,
        patientSelected : null,
        investigationSelected: null,
        procedure_name_selected: null
      },
      loadingInvestigations: false,
      loadingUsers: false,
      module: "finance",
      decoratorKey: "assign-user",
      filename: "Assign User",
      report_title: "Assign User Form",

  }),

  methods: {
      // Fetch list of investigations for autocomplete
    async  fetchInvestigations() {
            try {
            this.loading = true;
            const response = await fetch(`/api/evaluation/all/patient/investigations`); // Update with your API endpoint
            if (!response.ok) {
              throw new Error(`API call failed: ${response.statusText}`);
            }
            const data = await response.json();

            this.investigationsSelected = data[0];
          } catch (error) {
            console.error('Error fetching investigations:', error);
          } finally {
            this.loading = false;
          }
      },

      // Fetch list of users for autocomplete
    async  fetchUsers() {
            try {
            this.loading = true;
            const response = await fetch('/api/users/all/users'); // Update with your API endpoint
            if (!response.ok) {
              throw new Error(`API call failed: ${response.statusText}`);
            }
            const data = await response.json();
            console.log(data);
            this.performedByArray = data;
          } catch (error) {
            console.error('Error fetching users:', error);
          } finally {
            this.loading = false;
          }
      },

      // Handle form submission
     async submitForm() {
          const postData = {

            userSelected: this.assignUser.userSelected,
            patientSelected : this.assignUser.patientSelected,
            investigationSelected: this.assignUser.investigationSelected
            // Add any other form data you want to send
          };

          console.log(postData);

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
            console.log('Success:', responseData);

            // Optional: Handle success response, such as closing the modal
            this.closeModal();
          } catch (error) {
            console.error('Error:', error);
            // Handle error case
          }
        },

        getIdFromURL() {
      const params = new URLSearchParams(window.location.search);
      this.assignUser.investigationSelected = params.get('id');
      this.assignUser.procedure_name_selected = params.get('procedure');
      console.log('ID from URL:', this.id); // Log the id to check
    },
  },

  mounted() {
      this.fetchInvestigations();
      this.fetchUsers();
      this.getIdFromURL();
  },
};
</script>

<style scoped>
/* Add custom styles if necessary */
</style>
