<template>
    <v-card flat>
        <v-card-text class="pt-4 my-0">
            <v-row  >
                <v-col md="2" class="px-2">
                    <users-search
                            @results="setCashier"
                            leaveSelected
                            @clearedSelected="clearedCashier()"
                    ></users-search>
                </v-col>

                <v-col cols="12" md="2" class="px-2">
                    <v-text-field outline v-model="filters.receipt" label="Receipt"></v-text-field>
                </v-col>

                <v-col md="2" class="px-2">
                    <collabmed-date-time-picker outline @input="setStartDate"
                                                :datetime="filters.start_date"
                                                label="Start date">
                    </collabmed-date-time-picker>
                </v-col>

                <v-col md="2" class="px-2">
                    <collabmed-date-time-picker small outline @input="setEndDate"
                                                :datetime="filters.end_date"
                                                label="End date">
                    </collabmed-date-time-picker>
                </v-col>

                <v-col md="2" class="px-2">
                    <v-btn small color="success" @click="filter()">Filter</v-btn>
                </v-col>
            </v-row>
        </v-card-text>

        <v-data-table
                :headers="headers"
                :items="creditNotes.data"
                hide-default-footer
                class="elevation-1"
        >
            <template v-slot:item.status="{ item }">
                <v-chip small>{{ item.status }}</v-chip>
            </template>

            <template v-slot:item.actions="{ item }">
                <v-btn small color="teal" :disabled="item.details.length < 0"
                       @click="showDetails(item)">
                    activities
                </v-btn>
                <v-btn small color="primary"
                       :disabled="item.status === 'Completed'"
                       @click="initializeRefund(item)">
                    refund
                </v-btn>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-btn small color="success" v-on="on"
                               :disabled="item.status === 'Completed'"
                               @click="initializeTransferToAccount(item)">To account</v-btn>
                    </template>
                    <span>Transfer amount to patient's account</span>
                </v-tooltip>
            </template>
            <template v-slot:footer>
                <v-row>
                    <v-col cols="12" class="text-center">
                        <collabmed-paginator  :meta="creditNotes.meta" @change="navigate"></collabmed-paginator>
                    </v-col>
                </v-row>
            </template>
        </v-data-table>


        <!-- refund dailog-->
        <v-dialog v-model="refundDialog" persistent max-width="800" >
            <v-card>
                <v-card-title class="headline primary">
                    <span class="white--text">Issue back the amount to the patient/customer</span>
                    <v-btn icon dark @click.native="refundDialog = false" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <v-text-field v-model="creditNote.refund.amount" outline label="Amount" required></v-text-field>

                    <v-textarea v-model="creditNote.refund.note" outline label="Notes"></v-textarea>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="success" small @click="refundCustomer()">save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <!-- transfer to patient account-->
        <v-dialog v-model="transferToAccountDialog" persistent max-width="800" >
            <v-card>
                <v-card-title class="headline primary">
                    <span class="white--text">Transfer this amount to patient account</span>
                    <v-btn icon dark @click.native="transferToAccountDialog = false" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <v-text-field v-model="creditNote.toAccount.amount" outline label="Amount" required></v-text-field>

                    <v-textarea v-model="creditNote.toAccount.note" outline label="Notes"></v-textarea>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="success" small @click="transferToPatientAccount()">save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <!-- view activities on the credit note-->
        <v-dialog v-model="viewActivitiesDialog" max-width="700" >
            <v-card v-if="activities">
                <v-card-title class="headline primary">
                    <span class="white--text">Activity log on the raised credit note no: # </span>
                    <v-btn icon dark @click.native="viewActivitiesDialog = false" absolute right>
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <v-row  class="mx-2">
                        <v-col class="mx-3" cols="12" v-for="(item) in activities" :key="item.id">
                            <v-card-actions>
                                <h4>{{ item.user }}</h4>
                                <v-spacer></v-spacer>
                                <h5>Ksh. {{ item.amount }}</h5>
                            </v-card-actions>
                            <span class="text--primary">{{ item.date }}</span>
                            <li class="caption">
                                {{ item.note }}
                            </li>
                            <v-divider></v-divider>
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="viewActivitiesDialog = false" right>
                        close
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>
<script>
import moment from 'moment';
import { mapGetters, mapActions } from 'vuex';
import CreditNote from '@finance/libs/payments/CreditNotes';

export default {
    data: () => ({
        creditNote: new CreditNote(),
        refundDialog: false,
        transferToAccountDialog: false,
        viewActivitiesDialog: false,
        activities: null,
        filters: {
            start_date: moment(new Date()).startOf('month').format('YYYY-MM-DD HH:MM'),
            end_date: moment(new Date()).format('YYYY-MM-DD HH:MM'),
            cashier_id: null,
            receipt: null,
        },
        headers: [
            { text: 'Customer', value: 'customer' },
            { text: 'Receipt', value: 'receipt' },
            { text: 'Amount', value: 'amount' },
            { text: 'Status', value: 'status' },
            { text: 'Settled', value: 'settled' },
            { text: 'Issued By', value: 'issued_by' },
            { text: 'Date', value: 'date' },
            { text: 'Actions', value: 'actions' },
        ],
    }),

    methods: {
        ...mapActions([
            'setCreditNotes',
        ]),

        clearedCashier() {
            this.filters.user_id = null;
        },

        setStartDate(datetime) {
            this.filters.start_date = datetime;
        },

        setEndDate(datetime) {
            this.filters.end_date = datetime;
        },

        setCashier(cashier) {
            this.filters.cashier_id = cashier.id;
        },

        navigate(page) {
            this.setCreditNotes({
                page: page,
            });
        },

        filter() {
            this.setCreditNotes({
                params: _.omitBy(this.filters, _.isNil),
            });
        },

        initializeRefund(item) {
            this.refundDialog = true;
            this.creditNote.refund.credit_note_id = item.id;
            this.creditNote.refund.amount = item.balance;
            this.creditNote.refund.balance = item.balance;
        },

        initializeTransferToAccount(item) {
            this.transferToAccountDialog = true;
            this.creditNote.toAccount.credit_note_id = item.id;
            this.creditNote.toAccount.amount = item.balance;
            this.creditNote.toAccount.balance = item.balance;
        },

        refundCustomer() {
            const self = this;

            this.creditNote.refundClient().then((response) => {
                self.refundDialog = false;
                self.setCreditNotes();
            });
        },

        showDetails(item) {
            this.viewActivitiesDialog = true;
            this.activities = item.details;
        },

        transferToPatientAccount() {
            const self = this;

            this.creditNote.transferAmountToPatientAccount().then((response) => {
                self.transferToAccountDialog = false;
                self.setCreditNotes();
            });
        },
    },

    computed: {
        ...mapGetters({
            creditNotes: 'getCreditNotes',
        }),
    },

    mounted() {
        this.setCreditNotes();
    },
};
</script>
