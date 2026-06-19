/**
* Created by PhpStorm.
* User: lexxyungcarter
* Date: 2019-04-23
* Time: 19:23
*/

<template>
    <v-dialog v-model="dialog" width="50%" persistent>

        <v-card>
            <v-card-title class="headline  white--text primary" primary-title height="5changeMode0">
                Deposit to patient account

                <v-spacer></v-spacer>

                <v-btn icon dark @click.native="close" absolute right>
                    <v-icon>close</v-icon>
                </v-btn>
            </v-card-title>

            <v-card-text  class="px-2">
                <v-btn small color="primary" @click="changeMode('cash')">Cash</v-btn>
                <v-btn small color="primary" @click="changeMode('insurance')">Insurance Cover</v-btn>
                <v-container fluid v-if="payment_mode == 'cash'">

                    <v-row >
                        <v-col>

                            <v-expansion-panels>
                                <v-expansion-panel>
                                    <v-expansion-panel-header>
                                        <div>Cash</div>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <v-card flat class="pa-4" color="grey lighten-2">
                                            <v-text-field
                                                    type="number"
                                                    min="1"
                                                    v-model="payment.cash.amount"
                                                    label="Amount"
                                                    hide-details
                                            ></v-text-field>
                                        </v-card>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>

                                <v-expansion-panel>
                                    <v-expansion-panel-header>
                                        <div>M Pesa</div>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <v-card flat class="pa-4" color="grey lighten-2">
                                            <v-text-field
                                                    type="text"
                                                    class="mt-1"
                                                    v-model="payment.mpesa.code"
                                                    label="Mpesa Code"
                                                    hide-details
                                            ></v-text-field>

                                            <v-text-field
                                                    type="number"
                                                    min="1"
                                                    class="mt-1"
                                                    v-model="payment.mpesa.amount"
                                                    label="Amount"
                                                    hide-details
                                            ></v-text-field>
                                        </v-card>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>

                                <v-expansion-panel>
                                    <v-expansion-panel-header>
                                        <div>Cheque</div>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <v-card flat color="grey lighten-2" class="pa-4">
                                            <v-row >
                                                <v-col md="6" cols="12">
                                                    <v-text-field
                                                            type="text"
                                                            class="ma-1"
                                                            v-model="payment.cheque.name"
                                                            label="Name"
                                                            hide-details
                                                    ></v-text-field>
                                                    <v-select
                                                            :items="banks.data"
                                                            label="Bank"
                                                            v-model="payment.cheque.bank"
                                                            item-text="name"
                                                            item-value="id"
                                                    ></v-select>
                                                    <v-text-field
                                                            type="text"
                                                            class="ma-1"
                                                            v-model="payment.cheque.number"
                                                            label="Cheque Number"
                                                            hide-details
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col md="6" cols="12">

                                                    <v-text-field
                                                            type="number"
                                                            min="1"
                                                            class="ma-1"
                                                            v-model="payment.cheque.amount"
                                                            label="Amount"
                                                            hide-details
                                                    ></v-text-field>

                                                    <collabmed-date-time-picker dateOnly  @input="setExpiry" :datetime="payment.cheque.expiry" label="Date "></collabmed-date-time-picker>

                                                </v-col>
                                            </v-row>
                                        </v-card>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>

                                <v-expansion-panel>
                                    <v-expansion-panel-header>
                                        <div>Credit Card</div>
                                    </v-expansion-panel-header>
                                    <v-expansion-panel-content>
                                        <v-card flat color="grey lighten-2" class="pa-4">
                                            <v-row >
                                                <v-col md="6" cols="12">
                                                    <v-select
                                                            :items="cardTypes"
                                                            label="Card Type"
                                                            v-model="payment.card.type"
                                                            item-text="text"
                                                            item-value="value"
                                                    ></v-select>
                                                    <v-text-field
                                                            type="text"
                                                            class="mx-1"
                                                            v-model="payment.card.name"
                                                            label="Name"
                                                            hide-details
                                                    ></v-text-field>
                                                    <v-text-field
                                                            type="text"
                                                            class="mx-1"
                                                            v-model="payment.card.number"
                                                            label="Card Number"
                                                            hide-details
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col md="6" cols="12">

                                                    <collabmed-date-time-picker dateOnly  @input="setCardValidity" :datetime="payment.card.valid_thru" label="Expiry "></collabmed-date-time-picker>

                                                    <v-text-field
                                                            type="number"
                                                            min="1"
                                                            class="mx-1"
                                                            v-model="payment.card.amount"
                                                            label="Amount"
                                                            hide-details
                                                    ></v-text-field>
                                                </v-col>
                                            </v-row>
                                        </v-card>
                                    </v-expansion-panel-content>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </v-col>
                    </v-row>asda
                </v-container>
                <v-container fluid v-if="payment_mode == 'insurance'">


<v-row >
                      <v-col>
                          <v-select
                                  :items="schemes"
                                  v-model="payment.insurance.scheme"
                                  label='Patient insurance scheme'
                                  item-text="name"
                                  item-value="id"
                          ></v-select>

                          <v-text-field
                                  type="number"
                                  min="1"
                                  v-model="payment.insurance.amount"
                                  :disabled="!payment.insurance.scheme"
                                  class="mt-1"
                                  label="Maximum amount allowed by Insurance"
                                  hide-details
                          ></v-text-field>
                      </v-col>
                  </v-row>
                </v-container>

                <v-container fluid v-if="payment_mode == 'insurandfce'">


                </v-container>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions>
                <v-btn class="primary" color="blue" :dark="!loading" :loading="loading" :disabled="loading" @click="deposit()">
                    Save details
                </v-btn>

                <v-btn color="primary" @click="close">
                    Close
                </v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import Payment from "@finance/libs/payments/Payment";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        show: {
            type: Boolean,
            required: true,
        },

        patientId: {
            required: true,
        },

        visitId: {
            required: true,
        }
    },

    data() {
        return {
            loading: false,
            payment_mode: "cash",
            dialog: false,
            expiry: null,
            payment: new Payment(),
            schemes:[],
            cardTypes: [
                { text: "Master Card", value: "1" },
                { text: "Visa", value: "2" },
                { text: "Discover", value: "3" },
            ],
            patient: null,
        };
    },

    computed: {
        ...mapGetters({
            banks: "getBanks",
            patients: 'getPatients'
        }),
    },

    watch: {
        show(val) {
            this.dialog = val;

            this.setPatients({
                params: {
                    patient_id: this.patientId
                }
            })
        },

        patients (val) {

            this.patient = val[0];

        },
    },

    methods: {
        ...mapActions([
            "setBanks", 'setPatients'
        ]),

        close() {
            this.dialog = false;
            this.$emit("close");
        },

        async fetchData() {
          try {
            this.saveLoader = true; // Show loader while fetching data
            const url = '/api/evaluation/visit/details';
            const send_data =
            {
              visit_id : this.visitId
            }


            const response = await fetch(url, {
                              method: 'POST', // *GET, POST, PUT, DELETE, etc.
                              headers: {
                                'Content-Type': 'application/json'
                                // 'Content-Type': 'application/x-www-form-urlencoded',
                              },
                              body: JSON.stringify(send_data) // body data type must match "Content-Type" header
                            });
            const data = await response.json();
            console.log(data);
            // Append the received data to the list.data array
            this.schemes = data; // Assuming data is an array
          } catch (error) {
            console.error('Error fetching data:', error);
          } finally {
            this.saveLoader = false; // Hide loader after data is fetched
          }
        },


        async deposit() {
            this.loading = true;
            this.payment.patient_id = this.patientId;
            this.payment.visitId = this.visitId;
            this.payment.forInpatient = true;
            await this.payment.recordPayment();
            this.$emit("accountDataChanged");
            this.loading = false;
        },

        setCardValidity: function(datetime) {
            this.payment.card.valid_thru = datetime;
        },


        setExpiry: function(datetime) {
            this.payment.cheque.expiry = datetime;
        },

        changeMode(val) {

            this.payment_mode = val;
        },
    },

    mounted() {


        this.dialog = this.show;

        this.setBanks();
        this.fetchData();
    },
};
</script>
