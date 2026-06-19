/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-05-27
* Time: 1:26am
*/

<template>

  <v-card flat class="my-2">
    <v-container fluid>
      <v-row  class="inpatient-inner-nav">
        <v-col cols="3" sm="2" md="2"
               v-for="(item, index) in nav"
               :key="index"
        >

          <router-link
              v-if="item.vue_router"
              :to="item.route"
              tag="div"
              class="link pointer font-weight-thin elevation-1"
              exact-active-class="link-selected"
          >
            <span v-html="item.title"></span>
          </router-link>

          <div v-else
               class="link font-weight-thin elevation-1 pointer"
               :class="[ item.slug == active ? 'link-selected' : '' ]"
               @click="usher(item.route)"
          >
            <span v-html="item.title"></span>
          </div>

        </v-col>
      </v-row>
    </v-container>
  </v-card>

</template>

<script>

export default {
  props: {
    visitId: {
      required: true,
    },

    wardId: {
      default: '',
    },

    active: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      nav: [], // Initialize nav as an empty array

    };
  },

  methods: {
    usher(link) {
      return window.location = link;
    },
  },

  mounted() {

    axios.get(`/api/inpatient/ward-actions/${this.wardId}`)
        .then((response) => {
          // Extract display names from the response data
          const displayNames = response.data;

          // Filter the nav array to include only objects whose title exists in displayNames
          this.nav = [
            { vue_router: false, slug: 'doctors', title: 'Doctors', route: route('inpatient.evaluations.index', [this.visitId, 'doctors']).relative() },
            { vue_router: false, slug: 'nurses', title: 'Nurses', route: route('inpatient.evaluations.index', [this.visitId, 'nurses']).relative() },
            { vue_router: false, slug: 'prescriptions', title: 'Prescriptions', route: route('inpatient.evaluations.index', [this.visitId, 'prescriptions']).relative() },
            { vue_router: false, slug: 'partograph', title: 'Partograph', route: route('inpatient.evaluations.index', [this.visitId, 'partograph']).relative() },
            { vue_router: false, slug: 'report-on-labour', title: 'Report on Labour', route: route('inpatient.evaluations.index', [this.visitId, 'report-on-labour']).relative() },
            { vue_router: false, slug: 'patient-vitals', title: 'Patient Vitals', route: route('inpatient.evaluations.index', [this.visitId, 'patient-vitals']).relative() },
            { vue_router: false, slug: 'blood-pressure', title: 'Blood Pressure', route: route('inpatient.evaluations.index', [this.visitId, 'blood-pressure']).relative() },
            { vue_router: false, slug: 'temperature', title: 'Temperature', route: route('inpatient.evaluations.index', [this.visitId, 'temperature']).relative() },
            { vue_router: false, slug: 'investigations', title: 'Investigations', route: route('inpatient.evaluations.index', [this.visitId, 'investigations']).relative() },
            { vue_router: false, slug: 'procedures', title: 'Procedures', route: route('inpatient.evaluations.index', [this.visitId, 'procedures']).relative() },
            { vue_router: false, slug: 'blood-transfusion', title: 'Blood Transfusion', route: route('inpatient.evaluations.index', [this.visitId, 'blood-transfusion']).relative() },
            { vue_router: false, slug: 'fluid-balance', title: 'Fluid Balance', route: route('inpatient.evaluations.index', [this.visitId, 'fluid-balance']).relative() },
            { vue_router: false, slug: 'feeding', title: 'Feeding', route: route('inpatient.evaluations.index', [this.visitId, 'feeding']).relative() },
            { vue_router: false, slug: 'care-plan', title: 'Care Plan', route: route('inpatient.evaluations.index', [this.visitId, 'care-plan']).relative() },
            { vue_router: false, slug: 'consumables', title: 'Consumables', route: route('inpatient.evaluations.index', [this.visitId, 'consumables']).relative() },
            { vue_router: false, slug: 'history', title: 'Patient History', route: route('inpatient.evaluations.index', [this.visitId, 'history']).relative() },
            { vue_router: false, slug: 'inpatient-history', title: 'Inpatient History', route: route('inpatient.evaluations.index', [this.visitId, 'inpatient-history']).relative() },
            { vue_router: false, slug: 'daily-charges', title: 'Daily Charges', route: route('inpatient.evaluations.index', [this.visitId, 'daily-charges']).relative() },
            { vue_router: false, slug: 'daily-charge-sheet', title: 'Daily Charge Sheet', route: route('inpatient.evaluations.index', [this.visitId, 'daily-charge-sheet']).relative() },
            { vue_router: false, slug: 'book-to-theatre', title: 'Book To Theatre', route: route('inpatient.evaluations.index', [this.visitId, 'book-to-theatre']).relative() },
            // { vue_router: false, slug: "Grouped charge-sheet", title: "Charge Sheet", route: route("inpatient.evaluations.index", [this.visitId, "charge-sheet"]).relative() },
            { vue_router: false, slug: 'discharge', title: 'Discharge', route: route('inpatient.evaluations.index', [this.visitId, 'discharge']).relative() },
          ].filter((item) => displayNames.includes(item.title));
        })
        .catch((error) => {
          // Handle error
          console.error('Error fetching ward actions:', error);
        });
  },
};
</script>

<style lang="scss">
.pointer {
  cursor: pointer;
}

.inpatient-inner-nav {

  .link {
    font-size: 1.2em;
    padding: 0.8em 0.5em ;
    transition: all .3s ease-in-out;
    text-align: left;
    cursor: pointer;
    background-color: #fff;
    text-align: center;
  }
  .link:hover {
    background-color: rgba(222, 222, 222, 0.5);
    transition: all .3s ease-in-out;
  }
  .link-selected {
    background-color: #d4d4d4;
    transition: all .3s ease-in-out;
  }
}

@media only screen and (min-width: 767px) {
  .users-inner-nav {
    //margin-left: 200px !important;
  }
}

@media only screen and (max-width: 767px) {
  .users-inner-nav {
    .link {
      padding: 0.5em;
    }
  }
}
</style>
