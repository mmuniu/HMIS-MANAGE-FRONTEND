<template>
  <collabmed-loading v-if="!schedules"></collabmed-loading>
  <!-- <collabmed-loading v-if="!schedules"></collabmed-loading> -->

  <div class="panel panel-info" v-else>
    <div class="panel-heading">Theatre schedule</div>

    <div class="panel-body">
      <div class="mb-3">
        <v-col offset-md="6" md="6" cols="12">
          <v-row align="center" dense>


            <v-col cols="12" md="4">
              <v-text-field
                type="datetime-local"
                label="Start Date & Time"
                v-model="startDateTime"
                outlined
                dense
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="4" class="ml-md-4">
              <v-text-field
                type="datetime-local"
                label="End Date & Time"
                v-model="endDateTime"
                outlined
                dense
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="2" class="d-flex align-center">
              <v-btn color="primary" @click="filterByDate" class="mt-4">
                Filter
              </v-btn>
            </v-col>
            </v-row>
            <v-row align="center" dense>

                        <v-col cols="12" md="4">
              <v-text-field prepend-inner-icon="search" label="Search Theatre name/number or Patient Number..."
                v-model="search"
                outline single-line hide-details>
                <v-tooltip slot="append" bottom>
                  <v-icon slot="activator" color="primary" dark>info</v-icon>
                  <span>Enter 3 or more characters</span>
                </v-tooltip>
              </v-text-field>
            </v-col>
          </v-row>
        </v-col>
      </div>

      <div>
        <!-- Loading Spinner -->
        <collabmed-loading v-if="!schedules || !schedules.data"></collabmed-loading>

        <!-- Table -->
        <div v-else>
          <table class="custom-table">
            <thead>
              <tr>
                <th>Patient Number</th>
                <th>Patient Name</th>
                <th>Theatre Name</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Actions</th>
                <th>Ward/Theatre Check</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paginatedData" :key="item.id">
                <td>{{ item.patient?.number }}</td>
                <td>{{ item.patient?.full_name }}</td>
                <td>{{ item.theatre?.name }}</td>
                <td>{{ item.start_time }}</td>
                <td>{{ item.end_time }}</td>
                <td>
                  <v-btn
                    small
                    color="blue"
                    dark
                    :href="item.operation ? evaluateUrl(item.operation.id) : '#'"
                    v-if="item.booking && item.booking.status === 'booked'"
                  >
                    <v-icon small>fa fa-stethoscope</v-icon> &nbsp; Evaluate
                  </v-btn>

                  <v-btn
                    small
                    color="pink"
                    dark
                    :href="sendToTheatreUrl(item.id)"
                    v-if="item.booking.status === 'approved'"
                  >
                    Send to theatre &nbsp; <v-icon small right>fa fa-angle-right</v-icon>
                  </v-btn>

                  <v-btn
                    small
                    color="orange"
                    dark
                    target="_blank"
                    :href="printConsentFormUrl(item.id)"
                  >
                    <v-icon small>fa fa-print</v-icon> &nbsp; Patient Consent Form
                  </v-btn>
                </td>
                <td>
                  <v-btn
                    small
                    color="purple"
                    dark
                    v-if="!msetting('theatre.disable_nurse_wardcheck')"
                    target="_blank"
                    :href="nurseCheckUrl(item.booking_id)"
                  >
                    <v-icon small>fas fa-user-nurse</v-icon> &nbsp; Nurse Ward Check
                  </v-btn>

                  <v-btn
                    small
                    color="maroon"
                    dark
                    target="_blank"
                    :href="doctorCheckUrl(item.booking_id)"
                    v-if="!msetting('theatre.disable_doctor_wardcheck')"
                  >
                    Doctor Ward Check &nbsp; <v-icon small right>fa fa-angle-right</v-icon>
                  </v-btn>

                  <v-btn
                    small
                    color="blue"
                    dark
                    target="_blank"
                    :href="anaesthesistCheckUrl(item.booking_id)"

                  >
                    <v-icon small>fas fa-syringe</v-icon> &nbsp; Anaesthetist Checklist
                  </v-btn>


                  <v-btn
                    small
                    color="green"
                    dark
                    target="_blank"
                    :href="wardCheckPrintOut(item.booking_id)"
                    v-if="!msetting('theatre.disable_wardcheck_printout')"
                  >
                    <v-icon small>fa fa-print</v-icon> &nbsp; Ward Check Print Out
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="pagination-controls">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="pagination-button"
            >
              Previous
            </button>
            <span class="pagination-info">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="pagination-button"
            >
              Next
            </button>
          </div>

        </div>
      </div>



    </div>
  </div>
</template>


<style>
.custom-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.custom-table th, .custom-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.custom-table th {
  background-color: #f2f2f2;
}

.custom-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.custom-table tbody tr:hover {
  background-color: #e6f7ff;
}


.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination-button {
  padding: 8px 16px;
  font-size: 14px;
  color: #ffffff;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.pagination-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #333333;
}
</style>

<script>
import axios from "axios";
import { mapActions, mapGetters } from "vuex";

export default {
  props: [
    "evaluateRoute", "sendToTheatreRoute", "printConsentFormRoute", "NurseWardCheckRoute", "DoctorsWardCheckRoute", "AnaesthetistWardCheckRoute", "WardCheckOutPrintOut"
  ],

      data() {
        return {
          schedules: null,
          search: "",
          startDateTime: (function() {
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = '01';
            const formatted = `${year}-${month}-${day}T00:00`;
            return formatted;
          })(),
          endDateTime: (function() {
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            const day = now.getDate().toString().padStart(2, '0');
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
            return formatted;
          })(),
          currentPage: 1, // Current page number
          itemsPerPage: 10, // Number of items per page
        };
      },

  watch: {
    getSchedules(items) {
      this.schedules = items;
      //   console.log(this.schedules);

    },

    search(term, old) {
      if (term.length > 3 && term.length > old.length) {
        this.setSchedules({
          search: term,
        });
      }

      if (term.length == 0) {
        this.setSchedules({ page: 1 });
      }
    },
  },

  computed: {
    ...mapGetters([
      "getSchedules",
    ]),
    totalPages() {
      return Math.ceil(this.schedules.data.length / this.itemsPerPage);
    },
    // Slice data for the current page
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.schedules.data.slice(start, end);
    },

  },

  methods: {
    ...mapActions([
      "setSchedules",
    ]),
// Navigate to the previous page
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    // Navigate to the next page
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    navigate(url) {
      if (url) {
        const page = url.substring(url.indexOf("page=")).split("page=")[1];
        this.setSchedules({ page });
      }
    },

    async filterByDate() {
      try {
        const response = await axios.get("/api/theatre/schedules", {
          params: {
            startDateTime: this.startDateTime,
            endDateTime: this.endDateTime,
          },
        });
        this.schedules = response.data;
        this.currentPage = 1; // reset pagination
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    },

    printConsentFormUrl(id) {
      return `/print-consent-form/${id}`;
    },

    anaesthesistCheckUrl(bookingId) {
      return `/anaesthesist-check/${bookingId}`;
    },
    wardCheckPrintOut(bookingId) {
      return `/ward-check-print/${bookingId}`;
    },
    evaluateUrl(operation_id) {
      return this.evaluateRoute.replace(":operation_id", operation_id);
    },

    nurseCheckUrl(booking_id) {
      return this.NurseWardCheckRoute.replace(":booking", booking_id);
    },

    doctorCheckUrl(booking_id) {
      return this.DoctorsWardCheckRoute.replace(":booking", booking_id);
    },

    anaesthesistCheckUrl(booking_id) {
      return this.AnaesthetistWardCheckRoute.replace(":booking", booking_id);
    },

    wardCheckPrintOut(booking_id) {
      return this.WardCheckOutPrintOut.replace(":booking", booking_id);
    },

    fetchSchedules() {
      return this.theatreSchedule.fetchSchedules();
    },

    sendToTheatreUrl(schedule_id) {
      return this.sendToTheatreRoute.replace(":schedule_id", schedule_id);
    },

    printConsentFormUrl(schedule_id) {
      return this.printConsentFormRoute.replace(":schedule_id", schedule_id);
    },
  },

  mounted() {
    // alert('sdfsdf')
    // console.log(this.schedules);
    this.filterByDate();
  },
};
</script>
