<template>
  <collabmed-loading v-if="actions.length <= 0"></collabmed-loading>
  <div v-else>
    <v-tabs
        class="tabs"
        centered
        grow
        height="60px"
        v-model="activeTab"
    >
      <v-tab v-for="(action, index) in actions"
             :key="index"
             class="item text-center"
             ripple
             :to="usher(action)"
             active-class="active"
             exact >
        {{ action.display_name }}
        <v-chip small v-if="action.has_state">
          {{ action.state }}
        </v-chip>
      </v-tab>
      <v-tab exact ripple v-if="capitation && capitation.capitation_reached">
                <span>
                    <v-alert :value="true" type="error" class="text-center">
                        Capitation level reached!
                    </v-alert>
                </span>ASA
      </v-tab>

      <v-tab exact ripple v-if="capitation">
        <v-alert :value="true" type="info" class="text-center mt-3" outlined dense>
          <strong>Ksh. {{ capitation.total | numberFormat  }} used so far </strong>
        </v-alert>
      </v-tab>
    </v-tabs>

    <div class="mt-4">
      <router-view :document_types="document_types" :patient_id="patient_id" :age="patient_age"></router-view>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Visit from '@reception/libs/visits/Visit';

export default {
  props: [
    'isVisit',
    'document_types',
    'patient_id',
    'patient_age'
  ],

  data() {
    return {
      activeTab: 'vitals',
      visitObj: new Visit,
      visit_id: null,
      visit_destination: null,
    };
  },

  computed: {
    ...mapGetters({
      actions: 'getTreatmentActions',
    }),

    active() {
      return window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
    },

    capitation() {
      return this.visitObj.capitationStatus;
    },
  },

  methods: {
    ...mapActions([
      'setTreatmentActions',
    ]),

    usher(action) {
      return `/evaluation/visit/${this.visit_id}/destination/${this.visit_destination}/${action.name}`;
    },

    goToPage(action) {
      const route = `/evaluation/visit/${this.visit_id}/destination/${this.visit_destination}/${action.name}`;
    },

    checkCapitation() {
      this.visitObj.checkCapitation(this.visit_id);
    },

    capitationIsReachedClass() {
      if (! this.capitation) {
        return 'info';
      }

      if (this.capitation.capitation_reached) {
        return 'error';
      }

      return 'info';
    },

    updateActions() {
      this.setTreatmentActions({
        params: {
          destination: this.visit_destination,
          visit_id: this.visit_id,
        },
      });
    },
  },



  mounted() {
    localStorage.setItem('age', this.patient_age);

    this.visit_id = JSON.parse(this.isVisit).id;
    this.visit_destination = window.location.href.split('/')[7];


    this.checkCapitation();
    this.updateActions();

    // Call the API to get bill so far on page load
    // this.getBillSoFar();

    window.events.$on('update-action-status', () => {
      this.updateActions();
    });

    if (this.actions[0]) {
      this.activeTab = this.actions[0].name;
    }

    window.events.$on('check-capitation', (message) => {
      this.checkCapitation();
    });
  },

  methods: {
    ...mapActions([
      'setTreatmentActions',
    ]),

    usher(action) {
      return `/evaluation/visit/${this.visit_id}/destination/${this.visit_destination}/${action.name}`;
    },

    goToPage(action) {
      const route = `/evaluation/visit/${this.visit_id}/destination/${this.visit_destination}/${action.name}`;
    },

    checkCapitation() {
      this.visitObj.checkCapitation(this.visit_id);
    },

    capitationIsReachedClass() {
      if (! this.capitation) {
        return 'info';
      }

      if (this.capitation.capitation_reached) {
        return 'error';
      }

      return 'info';
    },

    updateActions() {
      this.setTreatmentActions({
        params: {
          destination: this.visit_destination,
          visit_id: this.visit_id,
        },
      });
    },

    getBillSoFar() {
      fetch(`/api/finance/get/bill/so/far`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visit: this.visit_id }),
      })
        .then(response => response.json())
        .then(data => {
          // You can add code here to update the component state with the bill data if needed
        })
        .catch(error => {
          console.error('Error fetching bill so far:', error);
        });
    },
  },
};
</script>

<style lang="scss">
.v-tabs.evaluation {
  a {
    font-weight: 600;
    color: #5d5d5d;
  }

  .active {
    background-color: #cccccc;

    * {
      color: #231f1f !important;
      font-weight: 600;
    }
  }

  .item {
    &:hover {
      background-color: #f6f6f6;
    }
  }

  .v-tabs__icon--next, .v-tabs__icon--prev {
    font-size: 46px;
  }
}
</style>
