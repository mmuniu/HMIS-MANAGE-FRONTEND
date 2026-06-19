<template>
    <v-card flat>
       <v-card-text>

           <!--  filters  -->
           <div class="mb-5">
               <v-row>
                   <v-col md="2">
                       <v-select
                            v-model="filters.status"
                            label="Booking status"
                            :items="[
                                'All', 'Pending', 'Cancelled', 'Approved', 'Rejected', 'Booked', 'Expired', 'Completed'
                            ]"
                        >
                       </v-select>
                    </v-col>
                    <v-col md="2">
                        <collabmed-date-time-picker
                            outline
                            dateOnly
                            v-model="filters.start_date"
                            label="Start date">
                        </collabmed-date-time-picker>
                    </v-col>

                    <v-col md="2">
                        <collabmed-date-time-picker
                            outline
                            v-model="filters.end_date"
                            dateOnly
                            label="End date">
                        </collabmed-date-time-picker>
                    </v-col>
                    <v-col md="2">
                        <v-btn small color="primary" class="mt-3" @click="filter()">
                            filter
                        </v-btn>
                    </v-col>
               </v-row>
           </div>

           <collabmed-loading v-if="!bookings.data"></collabmed-loading>

            <div v-else>
               <v-data-table
                    :headers="headers"
                    :items="bookings.data"
                    hide-default-footer
                    disable-pagination
                    disable-filtering
                >
                    <template v-slot:item.actions="{ item }">
                        <v-btn small
                            color="info"
                            v-if="can('theatre.bookings.authorize-procedure')"
                            @click="authorize(item)">
                            Authorize
                        </v-btn>
                        <v-btn small
                            v-if="can('theatre.bookings.collect-deposit')"
                            @click="deposit(item)"
                            color="success">
                            Deposit
                        </v-btn>
                        <v-btn
                            small
                            :href="`/theatre/booking/${item.id}/schedule/create`"
                            v-if="can('theatre.schedule.store')"
                            color="primary">
                            Schedule
                        </v-btn>
                        <!-- <v-btn
                            small
                            v-if="can('theatre.bookings-reject')"
                            color="error">
                            Reject
                        </v-btn>
                        <v-btn small color="info">Info</v-btn> -->
                    </template>
                </v-data-table>
            </div>



            <!--    authorize modal -->
            <authorize
                :show="dialog"
                :item-id="selected.id"
                :required-amount="selected.deposit"
                @save="saveAuthorization"
                v-if="selected"
                @close="close">
            </authorize>


            <!-- payment modal -->
            <payment :show="paymentDialog"
                 :patient-id="selected.patient.id"
                 v-if="selected"
                 :visit-id="selected.visit_id"
                 @accountDataChanged="accountDetailsChange"
                 @close="close">
        </payment>
       </v-card-text>
    </v-card>
</template>
<script>
import moment from 'moment';
import _ from "lodash";
import { mapActions, mapGetters } from "vuex";
import Authorize from "@inpatient/components/admission-requests/partials/Authorize";
import Payment from "@inpatient/components/admission-requests/partials/Payment";
import Booking from "@theatre/libs/bookings/Booking";

export default {

    components: {
        Authorize, Payment
    },

    data () {
        return {
            dialog: false,
            selected: null,
            bookingObj: new Booking(),
            paymentDialog: false,
            filters: {
                status: null,
                start_date:  moment(new Date()).startOf('month').format('YYYY-MM-DD HH:MM'),
                end_date: moment(new Date()).endOf('day').format('YYYY-MM-DD HH:MM'),
            },
            headers: [
                { text: 'patient', value: 'patient_name' },
                { text: 'Requested By', value: 'requester' },
                { text: 'Reason', value: 'reason' },
                { text: 'Date', value: 'booked_on' },
                { text: 'Status', value: 'status' },
                { text: 'Authorized', value: 'amount' },
                { text: 'Actions', value: 'actions' },
            ]
        }
    },

    computed: {
        ...mapGetters({
            bookings: 'getBookings'
        })
    },

    methods: {
        ...mapActions([
            'setBookings'
        ]),

        authorize (booking) {
            this.selected = booking
            this.dialog = true;
        },

        async saveAuthorization(data) {
            await this.bookingObj.authorize(data);
            this.dialog = false;
            this.init();
        },

        close() {
            this.selected = null;
            this.paymentDialog = false;
            this.dialog = false;
        },

        deposit (booking) {
            this.selected = booking;
            this.paymentDialog = true;
        },

        accountDetailsChange() {
            this.close();
            this.init();
        },

        filter () {
            this.init();
        },

        init () {
            this.setBookings({
                params: _.omitBy(this.filters, _.isNil)
            });
        }
    },

    mounted () {
      console.log('sdasdasd');
        this.init();
    }
}
</script>

