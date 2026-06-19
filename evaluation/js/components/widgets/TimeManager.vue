<template>
  <v-col cols="12" class="my-4">

    <collabmed-loading v-if="!visitData || !visitData.visits_data"></collabmed-loading>

    <base-material-card v-else
                        class="px-5 py-3"
    >
      <v-card-title class="grey darken-5 white--text" style="margin-top: -50px; border-radius: 8px; box-shadow: 4px 0px 10px 3px #d4d2d2">
        <div class="text-h4 font-weight-bold">
          Patient Queue management
        </div>
      </v-card-title>
      <v-card-text>

        <v-row class="tex-right my-4">
          <v-btn v-for="(value, name) in destinations"
                 @click="filterQueue(name)"
                 :key="name" small
                 :class="name === queue ? 'grey darken-5' : ''"
                 class="mx-2"
          >
            {{ name }}
            <span class="ml-1"
                  style="padding: 3px 4px; background: chocolate; border-radius: 100%;">
                            {{ value }}
                         </span>
          </v-btn>
        </v-row>

        <v-data-table
            :headers="headers"
            :items-per-page="5"
            :item-class="applyRowColor"
            :items="visitData.visits_data">

          <template v-slot:item.status="{ item }">
            <v-chip
                v-if="item.status"
                class="ma-2 pink white--text"
                x-small
            >
              Checked out
            </v-chip>
            <v-chip
                v-else
                class="ma-2 primary white--text"
                x-small
            >
              In treatment
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn small color="success"
                   :disabled="item.visit.emergency === 1"
                   rounded
                   @click="emergencyConsult(item.visit)"
            >
              Emergency consult
            </v-btn>
          </template>
        </v-data-table>

      </v-card-text>
    </base-material-card>

    <reception-visits-emergency-consult
        v-if="emergencyConsultVisit"
        @close="closeEmergencyConsult()"
        :show="emergencyConsultDialog"
        :visit-obj="emergencyConsultVisit"
    ></reception-visits-emergency-consult>
  </v-col>
</template>
<script>
import { mapActions } from 'vuex';
import EmergencyConsult from '@reception/components/visits/partials/EmergencyConsult';

export default {
  components: {
    'reception-visits-emergency-consult': EmergencyConsult,
  },

  data() {
    return {
      emergencyConsultVisit: null,
      emergencyConsultDialog: false,
      headers: [
        { text: 'Patient', value: 'patient' },
        { text: 'Arrival time', value: 'arrival_time' },
        { text: 'Time at each destination', value: 'destinations' },
        { text: 'Time at facility', value: 'facility_time' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions' },
      ],
      queue: 'All stations',
      destinations: null,
      visitData: [],
    };
  },

  computed: {

  },

  watch: {
    visitData(val) {
      if (!this.destinations) {
        this.destinations = val.destinations;
      }
    },
  },

  methods: {

    itemRowBackground: function(item) {
      return item.visit.emergency === 1 ? 'pink lighten-4' : '';
    },

    getColor(colorCode) {
      switch (colorCode) {
        case 1:
          return 'green lighten-4'; // Routine - green
        case 2:
          return 'yellow lighten-4'; // Urgent - yellow
        case 3:
          return 'orange lighten-4'; // Very urgent - orange
        case 4:
          return 'pink lighten-4'; // Emergency - pink
        default:
          return 'white'; // Default to white if color code is not recognized
      }
    },
    applyRowColor(item) {
      return this.getColor(item.color_code) ;
    },
    emergencyConsult(visit) {
      this.emergencyConsultVisit = visit;
      this.emergencyConsultDialog = true;
    },

    closeEmergencyConsult() {
      this.emergencyConsultDialog = false;
      this.emergencyConsultVisit = null;
      this.destinations = null;
    },

    filterQueue(queue) {
      this.queue = queue;
    },
  },

  mounted() {
    axios.get('/api/evaluation/timeManager?page=1')
        .then((response) => {
          // Assign the fetched data directly to visitData
          this.visitData = response.data;
        })
        .catch((error) => {
          console.error('Error fetching visitData:', error);
        });
  },
};
</script>
