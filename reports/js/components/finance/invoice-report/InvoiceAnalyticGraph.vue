<template>
  <v-card class="pa-0 pt-3" flat>
    <v-card-text class="py-0 my-0">
      <v-row>
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

        <v-col md="2" class="px-2">
          <collabmed-date-time-picker outline @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
        </v-col>

        <v-col md="2" class="px-2">
          <collabmed-date-time-picker outline @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn @click="filter()" small color="success">Analyze</v-btn>

        </v-col>
      </v-row>
      <v-row>
        <v-col>

          <collabmed-loading v-if="!InvoiceAnalysisChart"></collabmed-loading>

          <base-material-chart-card
          v-else
          :data="InvoiceAnalysisChart.data"
          :options="InvoiceAnalysisChart.options"
          :responsive-options="InvoiceAnalysisChart.responsiveOptions"
          color="#E91E63"
          hover-reveal
          type="Bar"
      >
        <template v-slot:reveal-actions>
          <v-tooltip bottom>
            <template v-slot:activator="{ attrs, on }">
              <v-btn v-bind="attrs"
                     color="info"
                     icon
                     v-on="on">
                <v-icon color="info">
                  mdi-refresh
                </v-icon>
              </v-btn>
            </template>
            <span>Refresh</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template v-slot:activator="{ attrs, on }">
              <v-btn v-bind="attrs"
                     light
                     icon
                     v-on="on">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Change Date</span>
          </v-tooltip>
        </template>

        <h4 class="card-title font-weight-light ml-2">
          Monthly {{ covidEnabled ? 'Screenings' : 'visits' }} trend
        </h4>

        <p class="d-inline-flex font-weight-light ml-2 my-0">
          total number of visits in each of the last 12 months
        </p>

        <template v-slot:actions>
          <v-icon class="mr-1"
                  small>
            watch_later
          </v-icon>
          <span class="caption grey--text font-weight-light">updated 10 minutes ago</span>
        </template>
      </base-material-chart-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import moment from "moment";
import { mapActions, mapGetters } from "vuex";

export default {
  title: "Invoice summary",

  props: {
    obj: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    filename: "Invoice Summary",
    insuranceSchemes: [],
    filters_info: null,
    filters: {
      start_date: moment(new Date()).startOf("month").format("YYYY-MM-DD HH:MM"),
      end_date: moment(new Date()).format("YYYY-MM-DD HH:MM"),
      facility_id: null,
    },
    InvoiceAnalysisChart: null,

  }),

  watch: {
    visits(val) {
      this.InvoiceAnalysisChart = {
        data: {
          labels: val.months,
          series: [
            val.values,
          ],
        },
        options: {
          axisX: {
            showGrid: false,
          },
          low: 0,
          high: Math.max.apply(null, val.values),
          chartPadding: {
            top: 0,
            right: 5,
            bottom: 0,
            left: 0,
          },
        },
        responsiveOptions: [
          ['screen and (max-width: 640px)', {
            seriesBarDistance: 5,
            axisX: {
              labelInterpolationFnc: function(value) {
                return value[0];
              },
            },
          }],
        ],
      };
    },
  },

  computed: {
    ...mapGetters({
      facilities: "getFacilities",
    }),

    url() {
      return "/api/reports/module/finance/invoice-report";
    },
  },

  methods: {
    ...mapActions([
      "setFacilities",
    ]),

    filtersInfo() {
      const filters_data = _.omitBy(this.filters, _.isNil);

      const filtersInfo = {};

      const self = this;

      _.map(filters_data, function (val, key) {
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

    analyze()
    {
    const url = "/api/finance/invoices";
      fetch(url)
        .then(response => response.json())
        .then(data => {
          // handle the data
          console.log(data);
        })
        .catch(error => {
          // handle the error
          console.error(error);
        });

    },

    filter() {
      this.obj.filters = _.omitBy(this.filters, _.isNil);

      this.analyze();

      this.$emit("filter");
    },
  },

  mounted() {
    this.setFacilities();

  },
};
</script>
