<template>
  <v-card class="pa-0 pt-3" flat>
      <v-card-text class="py-0 my-0">
          <v-row >
              <v-col cols="12" md="3" class="px-2">
                  <v-autocomplete
                          :items="facilities.facilities"
                          outline
                          v-model="filters.facility_id"
                          color="blue-grey lighten-2"
                          label="Select Facility"
                          item-text="name"
                          @input="filtersInfo()"
                          clearable
                          @click:clear="facilityCleared"
                          item-value="id"
                  ></v-autocomplete>
              </v-col>

              <v-col md="2">
                <v-autocomplete
                    :items="performedByArray"
                    label="Select User"
                    item-text="full_name"
                    item-value="id"
                    v-model="filters.user"
                    outline
                ></v-autocomplete>
            </v-col>
              <v-col md="2">
                <v-autocomplete
                    :items="paymentType"
                    label="Select Payment Type"
                    item-text="text"
                    item-value="value"
                    v-model="filters.type"
                    outline
                ></v-autocomplete>
            </v-col>


              <v-col md="2" class="px-2">
                  <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
              </v-col>

              <v-col md="2" class="px-2">
                  <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
              </v-col>
          </v-row>
          <v-row >
              <v-col>
                  <v-btn @click="filter()" small color="success">filter</v-btn>
                  <download-to-excel :filters="filters" :url="url" :filename="filename"></download-to-excel>
              </v-col>
          </v-row>
      </v-card-text>
  </v-card>
</template>
<script>
import moment from "moment";
import { mapActions, mapGetters } from "vuex";

export default {
  title: "Cash Receipts summary",

  props: {
      obj: {
          required: true,
          type: Object,
      },
  },

  data: () => ({
      filename: "Cash Receipts Summary",
      insuranceSchemes: [],
      performedByArray: [],
      paymentType:[
  {text: 'Cash Payment', value: 'cash'},
  {text: 'Invoice Payment', value: 'invoice'},
  {text: 'Deposit Payment', value: 'deposit'},
  {text: 'Mpesa Payment', value: 'mpesa'},
  {text: 'Pesapal Payment', value: 'pesa_pal'}
],
      filters_info: null,
      filters: {
          start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
          end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
          facility_id: null,
          user: null,
          type: null
      },
  }),

  computed: {
      ...mapGetters({
          facilities: "getFacilities",
      }),

      url() {
          return "/api/reports/module/finance/cash-receipts-reports";
      },
  },

  methods: {
      ...mapActions([
          "setFacilities",
      ]),


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

      filtersInfo() {
          const filters_data = _.omitBy(this.filters, _.isNil);

          const filtersInfo = {};

          const self = this;

          _.map(filters_data, function(val, key) {
              if (key === "facility_id") {
                  _.map(self.facilities.facilities, (item) => {
                      if (item.id === val) {
                          filtersInfo["facility"] = item.name;
                      }
                  });
              } else {
                  filtersInfo[key.replace("_", " ")] = val;
              }
          });

          this.filters_info = filtersInfo;
      },

      facilityCleared() {
          this.filters.facility_id = null;
      },

      schemeCleared() {
          this.filters.scheme_id = null;
      },

      setStartDate(datetime) {
          this.filters.start_date = datetime;
      },
      setEndDate(datetime) {
          this.filters.end_date = datetime;
      },

      filter() {
          this.obj.filters = _.omitBy(this.filters, _.isNil);
          console.log(this.obj.filters)

          this.$emit("filter");
      },
  },

  mounted() {
      this.setFacilities();
      this.fetchAllUsers();
  },
};
</script>
