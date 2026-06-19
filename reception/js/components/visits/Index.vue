<template>
  <collabmed-loading v-if="!visits"></collabmed-loading>

  <v-card v-else>
    <v-card-title class="subheading grey-text text-darken-2">
      <h2 class="body-2 ma-0 pa-0">Patient visits listing</h2>
    </v-card-title>

    <v-divider class="my-0"></v-divider>

    <v-card-text>

      <!-- Change destination modal -->
      <reception-change-destination @changed="destinationChanged()"
                                    :destination="destination" :destinations="destinations">
      </reception-change-destination>

      <!-- Change payment mode (applies to cases where visit created at least 30 minutes before now -->
      <!--            <reception-change-mode :visit="selectedVisit" :dialogState="changeModeDialog"></reception-change-mode>-->

      <!-- add destination modal -->
      <!-- <reception-add-destination @changed="destinationAdded()"
                                  v-if="destinationVisit"
                                  @close="dialogAddDestination = false"
                                  :show="dialogAddDestination"
                                  :destination-visit="destinationVisit"
       >
       </reception-add-destination>-->

      <div class="mb-3">
        <v-row >

          <v-col class="px-2" md="2" cols="12" >
            <collabmed-date-time-picker outlined @input="setStartDate" :datetime="filters.start_date" label="Start date"></collabmed-date-time-picker>
          </v-col>

          <v-col class="px-2" md="2" cols="12" >
            <collabmed-date-time-picker outlined @input="setEndDate" :datetime="filters.end_date" label="End date"></collabmed-date-time-picker>
          </v-col>

          <v-col class="px-2" md="2" cols="12" >
            <v-btn small color="success" @click="filter">filter</v-btn>
          </v-col>

          <v-col></v-col>

          <v-col class="px-2" md="4" cols="12" >
            <reception-patient-search @patientSelected="patientSelected" label="Search patient" outlined></reception-patient-search>
          </v-col>
        </v-row>
      </div>


      <v-data-table
          :headers="visits.headers"
          :items="visits.data"
          :loading="saveLoader"
          :search="searchHere"
          class="mb-3"
          flat
          hide-default-footer
      >

        <template v-slot:item.patient_name="{ item }"  class="blue--text text--lighten-2 pt-3">
          <a :href="`/reception/patients/${item.id}/basic`">{{ item.patient_name }}</a><br/>
          <span class="green--text body-3">Ticket #:{{ item.id }}</span> <br/>
          <!--<span v-if="item.unique_visit_key" class="pink&#45;&#45;text caption">Key:  {{ item.unique_visit_key }}</span>-->
        </template>

        <template v-slot:item.destinations="{ item }"  class="pt-3">
          <span class="body-3 black--text text--lighten-1">{{ item.queued_at | ucwords }}</span>
          <p class="body-3 grey--text text--darken-1">Facility: {{ item.facility_name | ucwords }}</p>
        </template>

        <template v-slot:item.date="{ item }">
          <span class="body-3 black--text text--lighten-1"> {{ item.created_at }}</span>
          <p class="body-3 grey--text text--darken-1" v-if="item.purpose_of_visit">
            Purpose: {{ item.purpose_of_visit }}
          </p>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn small color="primary" dark @click="editVisit(item)">
            update visit
          </v-btn>
          <v-btn small color="orange" dark :href="`/reception/visit-receipt/${item.id}`" target="_blank">
            print ticket
          </v-btn>

          <v-btn small color="teal" dark @click="changeDestination(item.destinations)">
            Change Destination
          </v-btn>

          <!--<v-btn small color="green" dark @click="changePaymentMode(item)">
              Change Mode
          </v-btn>-->

          <v-btn small color="purple" dark :href="`/evaluation/visit/${item.id}/destination/doctor/history`">
            Review
          </v-btn>

          <v-btn small color="error" dark @click="cancelCheckin(item)">
            Cancel checkin
          </v-btn>
        </template>


        <template slot="footer" v-if="visits.links">
          <v-row  class="py-2 pb-2">
            <v-col cols="8" class="mt-3 ml-3">
              Showing {{ visits.meta.from }} to {{ visits.meta.to }} of {{ visits.meta.total }} records
              <!-- Total records: {{ visits.meta.total }} -->
            </v-col>

            <v-col cols="3" class="text-right">
              <v-btn :disabled="visits.meta.current_page <= 1" icon @click="navigate(visits.links.prev)">
                <v-icon>chevron_left</v-icon>
              </v-btn>

              <v-btn :disabled="visits.meta.current_page === visits.meta.last_page" icon @click="navigate(visits.links.next)">
                <v-icon>chevron_right</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </v-data-table>
    </v-card-text>

  </v-card>

</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Visit from '@reception/libs/visits/Visit';
import moment from 'moment';
import ChangeDestination from './partials/ChangeDestination';
import PatientSearch from '../patients/PatientSearch';

export default {
  props: [
    'params',
  ],

  components: {
    'reception-change-destination': ChangeDestination,
    'reception-patient-search': PatientSearch,
  },

  data() {
    return {
      visits: null,
      search: '',
      searchHere: '',
      destinations: null,
      destinationVisit: null,
      destination: false,
      saveLoader: false,
      dialogAddDestination: false,
      checkout: false,
      mode: false,
      patientVisit: new Visit(),
      selectedVisit: {},
      changeModeDialog: 0,
      page: 1,
      filters: {
        start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:mm'),
        end_date: moment(new Date()).add(1, 'minute').format('YYYY-MM-DD HH:mm'),


      },
      filteredDestinations: []
    };
  },

  watch: {
    async getVisits(visits) {
      this.visits = visits;

      const response = await fetch('/api/settings/get/morgue/settings');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
      // console.log(data.id);

        // Create an array to hold all destinations
  let allDestinations = [];
  let filteredDestinations = [];
  let counter = 0;
  // console.log(Object.keys(this.visits.data))
      visits.data.forEach((visit, visit_index) => {

        if (Array.isArray(visit.destinations) && visit.destinations.length > 0 && visit.destinations[0]?.destination_id !== null)
        {
              if(visit.destinations[0]['destination_id'] !== data.id)
            {

              this.filteredDestinations[counter] = visits.data[visit_index];
              counter ++;
              // console.log(filteredDestinations[visit_index])


            }


        }


        allDestinations = allDestinations.concat(visit.destinations);
    // Assuming `visit.destinations` is an array, concatenate it with `allDestinations`

    // console.log(counter);

  });



  console.log(this.filteredDestinations);
  console.log(this.visits.data);

    },

    search(term, old) {
      if (term.length > 3 && term.length > old.length) {
        this.performSearch(term);
        this.label = 'Search Patients...';
      } else if (term.length > 0 && term.length <= 3) {
        this.label = 'Enter ' + (4 - term.length) + ' more characters';
      } else {
        this.label = 'Search Patients...';
      }

      if (term.length == 0) {
        this.fetchVisits();
      }
    },
  },

  computed: {
    ...mapGetters([
      'getVisits',
    ]),
  },

  methods: {
    ...mapActions([
      'setVisits',
    ]),

    navigate(url) {
      if (url) {
        const page = url.substring(url.indexOf('page=')).split('page=')[1];
        this.setVisits({
          page,
          params: { ...this.filters, ...JSON.parse(this.params) },
        });
      }
    },

    setStartDate(datetime) {
      this.filters.start_date = datetime;
    },

    setEndDate(datetime) {
      this.filters.end_date = datetime;
    },

    filter() {
      this.setVisits({
        params: { ...this.filters, ...JSON.parse(this.params) },
      });
    },

    changePaymentMode(item) {
      this.selectedVisit = item;
      this.changeModeDialog += 1;
    },

    editVisit(visit) {

      window.open(`/reception/patient/${visit.patient.id}/visits/${visit.id}`, '_self');
    },

    patientSelected(patient) {
      this.setVisits({
        params: {
          patient_id: patient.id,
        },
      });
    },

    addDestination(visit) {
      this.destinationVisit = visit;
      this.dialogAddDestination = true;
    },

    changeDestination(destinations) {
      this.destination = true;
      this.destinations = JSON.stringify(destinations);
    },

    async cancelCheckin(visit) {
      const response = await this.patientVisit.cancelCheckin(visit.id);

      if (response) {
        this.initialize();
      }
    },

    destinationChanged() {
      this.destination = false;
      flash({
        'message': 'Destination changed successfully',
        'alert': 'green',
      });
      this.setVisits();
    },

    destinationAdded() {
      this.dialogAddDestination = false;
      this.destinationVisit = null;
      flash({
        'message': 'Destination added successfully',
        'alert': 'green',
      });
      this.setVisits();
    },

    performSearch: _.debounce(function(term) {
      flash({ alert: 'info', message: 'Coming Soon' });
    }, 500),

    initialize() {
      const params = JSON.parse(this.params);

      this.setVisits({
        params,
      });
    },

    fetchVisits: _.debounce(function(page = 1) {
      flash({ alert: 'info', message: 'Coming Soon' });
    }, 500),
  },

  async mounted() {
    this.initialize();
    // console.log(this.visits);



    // console.log(data);



    this.setVisits({
      params: { ...this.filters, ...JSON.parse(this.params) },
    });
  },

  created() {
    window.events.$on('STORE_SET_ACTION_LOADING', (loading) => {
      this.saveLoader = loading;
    });
  },
};
</script>

<style scoped>

</style>
