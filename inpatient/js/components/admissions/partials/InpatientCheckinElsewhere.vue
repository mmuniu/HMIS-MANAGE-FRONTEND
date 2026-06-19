<template>
  <div>
    <p style="padding: 25px;">
      <!-- add a destination -->
      <v-btn class="small rounded text" @click="addDestination()">
        Checkin elsewhere
      </v-btn>
    </p>
    <reception-add-destination
        @changed="destinationAdded()"
        v-if="destinationVisit"
        @close="dialogAddDestination = false"
        :show="dialogAddDestination"
        :destination-visit="visit"
    ></reception-add-destination>
  </div>
</template>

<script>
import Visit from '@reception/libs/visits/Visit';

import AddDestination from '@reception/components/visits/partials/AddDestination';

export default {
    name: 'inpatient-checkin-elsewhere',

    props: ['visit_key', 'is-visit'], // Define the 'visit' prop here

    components: {
        'reception-add-destination': AddDestination,
    },

    data() {
        return {
            visitObj: new Visit(),
            dialogAddDestination: false,
            destinationVisit: null,
        };
    },
    computed: {
        visit() {
            const visit =this.visitObj.selectedVisit;

            return this.visitObj.selectedVisit;
        },
    },

    methods: {
        addDestination() {
            this.destinationVisit = this.visit;
            this.dialogAddDestination = true;
        },
        destinationAdded() {
            this.dialogAddDestination = false;
            this.destinationVisit = null;
            flash({
                message: 'Destination added successfully',
                alert: 'green',
            });
            window.location.reload();
        },

        initialize() {

            if (this.isVisit) {
                const vist = JSON.parse(this.isVisit);

                let vist_id = null;

                if (this.visit_key) {
                    vist_id = this.visit_key;
                } else {
                    if (this.$route.params.visitId) {
                        vist_id = this.$route.params.visitId;
                    } else {
                        vist_id = vist.id;
                    }
                }

               this.visitObj.find(vist_id);
            }
        },
    },
  async mounted() {
    this.initialize();
  },
};
</script>
