<template>
    <v-card flat class="mt-1 pa-4">
        <collabmed-loading v-if="!operation"></collabmed-loading>
        <v-row v-else>
            <v-col cols="4">
                <h3>Patient Info</h3>

                <div>
                    <div>Full Name: <span class="ml-3 font-weight-bold">{{ operation.patient.full_name }}</span> </div>
                    <div>IP number: <span class="ml-3 font-weight-bold">{{ operation.patient.ip_number }}</span> </div>
                    <div>Age: <span class="ml-3 font-weight-bold"> {{ operation.patient.age }}</span> </div>
                    <div>Visit ticket: <span class="ml-3 font-weight-bold"># {{ operation.patient.visit_ticket }}</span> </div>
                </div>
            </v-col>
            <v-col cols="4">
                <h3>Booking Info</h3>

                <div>
                    <div>Booked by: <span class="ml-3 font-weight-bold">{{ operation.booking.booked_by }}</span> </div>
                    <div>Reason: <span class="ml-3 font-weight-bold">{{ operation.booking.reason }}</span> </div>
                </div>
            </v-col>
            <v-col cols="4">
                <h3>Scheduling Info</h3>

                <div>
                    <div>Theatre: <span class="ml-3 font-weight-bold">{{ operation.schedule.theatre }}</span> </div>
                    <div>Start: <span class="ml-3 font-weight-bold">{{ operation.schedule.start }}</span> </div>
                    <div>End: <span class="ml-3 font-weight-bold">{{ operation.schedule.end }}</span> </div>
                </div>
            </v-col>
        </v-row>
    </v-card>
</template>
<script>
import { mapActions, mapGetters } from "vuex";

export default {
    computed: {
        ...mapGetters({
            operation: 'getOperations',
        }),
    },

    methods: {
        ...mapActions([
            'setOperations'
        ]),

        init () {
            this.setOperations({
                params: {
                    operation_id: this.$route.params.operationId
                }
            });
        }
    },

    mounted() {
        this.init();
    }
}
</script>
