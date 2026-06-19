<template>
  <div>
      <collabmed-floating-loader v-if="saveLoader"></collabmed-floating-loader>
      <v-card>
          <v-card-title height="23">
              <h4>Investigations List</h4>
          </v-card-title>

          <assign-user-filter :obj="obj"  @filter="performFilter"></assign-user-filter>

          <v-data-table
                  hide-default-footer
                  :headers="list.headers"
                  :items="list.data"
                  class="elevation-1"
          >
          <template v-slot:item.procedure_name="{ item }">
            <a @click="viewProcedures(item)">{{ item.procedure_name }}</a>
          </template>

          <template v-slot:item.performing_doctor="{ item }">
              <div v-if="item.performing_doctor">
                  {{ item.performing_doctor }}
              </div>
              <div v-else>
            <v-autocomplete
                  v-model="item.performing_doctor"
                  :items="performingDoctorOptions"
                  label="Select Doctor"
                  item-text="text"
                  item-value="value"
                  outlined
                  dense
                  @change="updatePerformingDoctor(item)"
          ></v-autocomplete>
              </div>
          </template>

          </v-data-table>
          <collabmed-paginator v-if="meta" :meta="meta" @change="navigate" />
      </v-card>
  </div>
</template>

<script>
import { reportsMixin } from "@reports/libs/reportsMixin";
import Filter from "./Filters";

export default {
  mixins: [
      reportsMixin,
  ],

  data() {
      return {
          module: "finance",
          decoratorKey: "assign-user",
          performingDoctorOptions: [],

      };
  },

  components: {
      "assign-user-filter": Filter,
  },

  methods: {
      navigate(page) {
          this.get(page, this.obj.filters);
      },

      viewProcedures(data){
          const filters = this.obj.filters;
          console.log(data);

          filters.mode = "procedures";
          filters.decoratorKey = "assign-user";
          filters.id = data['id'];
          filters.procedure = data['procedure_name'];

          let request_data = "?child=true&";
          _.map(filters, (item, key) => {
              request_data = request_data + key + "=" + item + "&";
          });

          console.log(request_data);
          window.open(`assign-user${request_data}`, "_blank");
      },

      updatePerformingDoctor(item) {
          console.log('Selected Doctor:', item.performing_doctor);

          const url = "/api/evaluation/assign/user";

          // Prepare the data to be sent in the request body
          const requestData = {
            userSelected: item.performing_doctor, // Doctor ID
              investigationSelected: item.id // Assuming `id` is the procedure ID in `item`
          };

          // Make the POST request
          fetch(url, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json"
              },
              body: JSON.stringify(requestData)
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error(`Request failed with status ${response.status}`);
              }
              return response.json();
          })
          .then(data => {
              flash(data)
              console.log(data);
                 // Update the performing doctor value in the data table
            // const updatedDoctor = data.performing_doctor; // The updated doctor's name or full name
            // this.item.performing_doctor = updatedDoctor; // Update the value in the specific
              // You can add additional code here if you need to handle the response
          })
          .catch(error => {
              console.error("Error assigning doctor:", error);
          });
      },

      // Fetch the list of doctors from the API
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
  },

  // Mounted lifecycle hook
  mounted() {
      this.fetchPerformingDoctors(); // Fetch doctors when the component is mounted
  },
};
</script>
