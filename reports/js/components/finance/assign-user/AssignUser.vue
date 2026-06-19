<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="px-4 py-4">
          <v-card-title>
            <h2 class="subheading ma-0 pa-0">Investigations List</h2>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="investigationsSelected"
              :items-per-page="10"
              class="elevation-1"
              :loading="loading"
            >
              <template v-slot:[`item.date_of_investigation`]="{ item }">
                {{ formatDate(item.date_of_investigation) }}
              </template>
              <template v-slot:[`item.procedure_name`]="{ item }">
                {{ item.procedure_name }}
              </template>
              <template v-slot:[`item.patient_name`]="{ item }">
                {{ item.patient_name }}
              </template>
              <template v-slot:[`item.performing_doctor`]="{ item }">
                {{ item.performing_doctor || 'N/A' }}
              </template>

              <!-- Slot for the "Assign User" button -->
              <template v-slot:item.actions="{ item }">
                <v-btn color="primary" @click="assignUserFxn(item)">
                  Assign User
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
          <v-dialog v-model="showModal" persistent max-width="600px">
            <v-card>
                <v-card-title class="headline">Assign User Modal</v-card-title>

                <v-card-text>
                    <!-- Content inside the modal -->
                    <v-form>

                        <v-row  >
                          <v-col cols="4" md="3">
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
                          </v-row>
                          <v-row>
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
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
export default {
  data() {
    return {
      investigations: [], // To store the fetched investigations data
      loading: true, // For showing loading state
      headers: [
        { text: "Date of Investigation", value: "created_at" },
        { text: "Procedure Name", value: "procedure_name" },
        { text: "Patient Name", value: "patient_name" },
        { text: "Performed By", value: "performing_doctor" },
        { text: "Actions", value: "actions", sortable: false } // Last column for the button
      ], // Table headers
      performedByArray: [],
      patientsToBeSelected: [],
      investigationsSelected: [],
      showModal: false,
      assignUser : {
        userSelected : null,
        patientSelected : null,
        investigationSelected: null,
        procedure_name_selected: null
      }
    };
  },
  methods: {
    // Function to fetch data from an API
    async fetchAllUsers() {
      try {
        this.loading = true;
        const response = await fetch('/api/users/all/users'); // Update with your API endpoint
        if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
        }
        const data = await response.json();
        this.performedByArray = data;
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        this.loading = false;
      }
    },

        openModal() {
              this.showModal = true;


        },
        // Function to handle closing the modal
        closeModal() {
          this.showModal = false;
        },


    async getInvestigation() {
      try {
        this.loading = true;
        const response = await fetch(`/api/evaluation/all/patient/investigations`); // Update with your API endpoint
        if (!response.ok) {
          throw new Error(`API call failed: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data);
        this.investigationsSelected = data[0];
      } catch (error) {
        console.error('Error fetching investigations:', error);
      } finally {
        this.loading = false;
      }
    },

      // Function to submit modal form data
      async submitModalData() {
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

    // Handler for the "Assign User" button
    assignUserFxn(item) {
      console.log('Assigning user for investigation:', item);
      this.assignUser.investigationSelected = item.id
      this.assignUser.procedure_name_selected = item.procedure_name
      this.showModal = true;
      // You can add modal opening logic or redirection here to handle user assignment
    },

    // Date formatter (optional)
    formatDate(date) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString(undefined, options);
    }
  },
  mounted() {
    // Fetch investigations data when the page loads
    this.getInvestigation();
    this.fetchAllUsers();
  }
};
</script>

<style scoped>
.v-card {
  margin-bottom: 20px;
}
</style>
