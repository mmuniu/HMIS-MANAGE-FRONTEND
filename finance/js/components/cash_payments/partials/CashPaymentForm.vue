<template>
  <div>

    <v-card flat class="ml-2">

      <v-expansion-panels v-model="panel2">
        <v-expansion-panel>
          <v-expansion-panel-header>
            <h5 class="text-capitalize"> Discounts </h5>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row  class="mx-5 pt-2" v-if="msetting('finance.enable_discounts_for_cash_payers')">
              <v-col md="5" offset-md="1">
                <v-text-field outline label="Amount to pay: " v-model="payment.discounted_amount"
                              @input="payment.discountedAmountChanged(totalCost)"
                ></v-text-field>
              </v-col>
              <v-col md="5" offset-md="1">
                <v-text-field type="number"

                              :max="0"
                              :min="100" label="Percentage discount: " v-model="payment.percentage_discount"
                              @input="payment.percentageDiscountChanged(totalCost)"
                ></v-text-field>
              </v-col>
              <v-col md="5" offset-md="1">
                <v-text-field outline label="Reason For Discount: " v-model="payment.reason_for_discount"
                              @input="payment.reasonForDiscount()"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel v-for="(mode, index) in paymentModes" :key="index + index" v-if="shouldRenderPanel(mode)">
          <v-expansion-panel-header v-if="mode.active">
            <h5 class="text-capitalize"> {{ mode.name }} </h5>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-card flat  v-if="mode.active">

              <!-- cash payment -->
              <div class="mx-2" v-if="mode.name == 'cash' && msetting('finance.enable_cash')">
                <v-row >
                  <v-col md="6" offset-md="1" class="mx-4">
                    <v-text-field label="Amount" outline v-model="payment.cash.amount" type="number" @input="handleInput"></v-text-field>
                  </v-col>
                </v-row>
              </div>

              <!-- mpesa manual entry payment -->
              <div class="mx-2" v-if="mode.name == 'm pesa manual entry' && msetting('finance.mpesa_non_integrated')">
                <v-row>
                  <v-col md="6">
                    <v-row >
                      <v-col offset-md="1" class="mx-4" v-if="msetting('finance.mpesa_non_integrated')">
                        <v-text-field label="Transaction code:" v-model="payment.mpesa.code" type="text" @input="payment.calculateTotal()"></v-text-field>
                      </v-col>

                    </v-row>
                    <v-row >
                      <v-col offset-md="1" class="mx-4" v-if="msetting('finance.mpesa_non_integrated')">
                        <v-text-field label="Amount" outline v-model="payment.mpesa.amount" type="number" @input="payment.calculateTotal()"></v-text-field>
                      </v-col>

                    </v-row>
                    <v-row v-if="payment.mpesa.code">
                      <v-col style="font-size: 13px;">
                        <span>Code: </span> <span style="font-weight: bold">{{ payment.mpesa.code }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>

                <v-row v-if="payment.mpesa.transactions.length > 0">
                  <v-col>
                    <v-chip @click:close="removeTransaction(index, transaction)" class="ma-2"
                            close
                            v-for="(transaction, index) in payment.mpesa.transactions" :key="transaction.id">
                      <span>{{ transaction.mobile_number }}</span> <span class="mx-3"> :
                                                            </span><strong>{{ transaction.amount }}</strong>
                      <br/><br/>
                      <span class="mx-2">{{ transaction.name }}</span>
                    </v-chip>
                  </v-col>
                </v-row>
                <v-row  v-if="payment.mpesa.transactions.length > 0">
                  <v-col>
                    Total amount: {{ payment.mpesa.amount }}
                  </v-col>
                </v-row>
              </div>
              <!-- end mpesa manual entry payment -->

              <!-- mpesa payment -->
              <div class="mx-2" v-if="mode.name == 'm pesa' && msetting('finance.mpesa_integrated')">
                <v-row>
                  <v-col md="6">
                    <v-row >
                      <v-col offset-md="1" class="mx-4" v-if="msetting('finance.mpesa_integrated')">
                        <v-text-field label="Transaction code:" v-model="payment.mpesa.code" type="text" @input="payment.calculateTotal()"></v-text-field>
                      </v-col>
                      <v-col v-else offset-md="1" class="mx-4">
                        <v-text-field label="Mpesa number" v-model="payment.mpesa.mobile_number" type="text"></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row >
                      <v-col offset-md="1" class="mx-4" v-if="!msetting('finance.mpesa_integrated')">
                        <v-text-field label="Amount" outline v-model="payment.mpesa.amount" type="number" @input="payment.calculateTotal()"></v-text-field>
                      </v-col>
                      <v-col offset-md="1" class="mx-4" v-else>
                        <v-text-field label="Amount" outline v-model="payment.mpesa.amount_to_pay" type="number" @input="payment.calculateTotal()"></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row v-if="payment.mpesa.code">
                      <v-col style="font-size: 13px;">
                        <span>Code: </span> <span style="font-weight: bold">{{ payment.mpesa.code }}</span>
                      </v-col>
                    </v-row>

                    <v-row v-if="msetting('finance.mpesa_integrated')">
                      <v-col>
                        <v-btn small color="primary" outlined rounded @click="requestPayment('mpesa')">Request payment</v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col md="6" v-if="msetting('finance.mpesa_integrated')" style="border-left: 1px solid grey;">
                    <v-row>
                      <v-col offset-md="1" class="mx-4">
                        <v-text-field label="Mpesa number" v-model="payment.mpesa.msisdn" type="text"></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-btn small color="primary" outlined rounded @click="fetchPayment('mpesa', null, payment.mpesa.msisdn)">Fetch payment</v-btn>

                        <br/>

                        <div>
                          Use this section to fetch already made payments,
                          either directly or previously unused payments.
                        </div>

                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>

                <v-row v-if="payment.mpesa.transactions.length > 0">
                  <v-col>
                    <v-chip @click:close="removeTransaction(index, transaction)" class="ma-2"
                            close
                            v-for="(transaction, index) in payment.mpesa.transactions" :key="transaction.id">
                      <span>{{ transaction.mobile_number }}</span> <span class="mx-3"> :
                                                            </span><strong>{{ transaction.amount }}</strong>
                      <br/><br/>
                      <span class="mx-2">{{ transaction.name }}</span>
                    </v-chip>
                  </v-col>
                </v-row>
                <v-row  v-if="payment.mpesa.transactions.length > 0">
                  <v-col>
                    Total amount: {{ payment.mpesa.amount }}
                  </v-col>
                </v-row>
              </div>


              <!-- cheque card payment-->
              <div class="mx-2" v-if="mode.name == 'cheque'  && msetting('finance.enable_cheque')">
                <v-row >
                  <v-col md="4" offset-md="1" class="mx-4">
                    <v-text-field outline label="Name" v-model="payment.cheque.name" type="text" @input="payment.calculateTotal()"></v-text-field>
                  </v-col>

                  <v-col md="4" offset-md="1" class="mx-4">
                    <v-text-field outline label="Bank" v-model="payment.cheque.bank" type="text" @input="payment.calculateTotal()"></v-text-field>
                  </v-col>
                </v-row>
                <v-row >
                  <v-col md="4" offset-md="1" class="mx-4">
                    <v-text-field outline label="Date" v-model="payment.cheque.date" type="text" @input="payment.calculateTotal()"></v-text-field>
                  </v-col>

                  <v-col md="4" offset-md="1" class="mx-4">
                    <v-text-field outline label="Branch" v-model="payment.cheque.branch" type="text" @input="payment.calculateTotal()"></v-text-field>
                  </v-col>
                </v-row>
                <v-row >
                  <v-col md="4" offset-md="1" class="mx-4">
                    <v-text-field outline label="Amount" v-model="payment.cheque.amount" type="text" @input="payment.calculateTotal()"></v-text-field>
                  </v-col>

                  <v-col md="4" offset-md="1" class="mx-4">
                    <v-text-field outline label="Cheque number" v-model="payment.cheque.number" type="number" @input="payment.calculateTotal()"></v-text-field>
                  </v-col>
                </v-row>
              </div>

              <!-- credit card -->
              <div class="mx-2" v-if="mode.name == 'credit card'">
                <v-row >
                  <v-col md="4" offset-md="1" class="mx-4">
                    <v-text-field outline label="Card type" v-model="payment.card.type" type="text" @input="payment.calculateTotal()"></v-text-field>
                  </v-col>

                  <v-col  md="4" offset-md="1" class="mx-4">
                    <v-text-field outline label="Expiry" v-model="payment.card.valid_thru" @input="payment.calculateTotal()"></v-text-field>
                  </v-col>
                </v-row>
                <v-row >
                  <v-col  md="4" offset-md="1" class="mx-4">
                    <v-text-field outline label="Name" v-model="payment.card.name" type="text" @input="payment.calculateTotal()"></v-text-field>
                  </v-col>

                  <v-col  md="4" offset-md="1" class="mx-4">
                    <v-text-field outline label="Amount" v-model="payment.card.amount" type="number" @input="payment.calculateTotal()"></v-text-field>
                  </v-col>
                </v-row>
                <v-row >
                  <v-col  md="9" offset-md="1" class="mx-4">
                    <v-text-field mask="credit-card" outline label="Card no:" v-model="payment.card.number" type="text" @input="payment.calculateTotal()"></v-text-field>
                  </v-col>
                </v-row>
              </div>

              <!-- customer account -->
              <div class="mx-2" v-if="mode.name == 'customer account'">
                <v-row >
                  <v-col offset-md="1" class="mx-4">
                    <span>Current account balance:  <v-chip small outlined color="success" v-if="account">{{ account.formatted_balance }}</v-chip> </span>
                  </v-col>
                </v-row>

                <v-row  class="mt-4" v-if="account">
                  <v-col offset-md="1" md="8" class="mx-4">
                    <v-text-field  label="Amount"
                                   :disabled="account.balance < 1"
                                   :max="account.balance"
                                   v-model="payment.patientAccount.amount"
                                   type="number"
                                   @input="payment.calculateTotal()"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </div>

              <!-- jambo pay payment-->
              <div class="mx-2" v-if="mode.name == 'jambo pay'">
                <span class="caption">Please note that, incase the patient has uncleared raised bill, we'll just add extra bills to it</span> <br/>

                <div class="my-3">Total selected bill:
                  <span v-if="payment.selected.length > 0" class="mx-3" style="font-weight: bold; font-size: 15px">Ksh. {{ payment.total_cost }}</span>
                </div>

                <v-btn small color="primary" @click="raiseBill()" :disabled="!payment.selected.length > 0">post</v-btn>
              </div>


              <!-- Wallet  account when available balance is greater than bill -->
              <div class="mx-2" v-if="mode.name === 'wallet'  && msetting('finance.wallet_integrated') && availableBalance >=  parseFloat(payment.total_cost) - parseFloat(payment.paid_amount) ">
                <v-row >
                  <b v-if="payment && availableBalance !== null">
                    <span><v-chip small outlined color="success" >{{ formattedAvailableBalance }}</v-chip> </span>
                    <v-btn small color="primary"
                           outlined rounded @click="refreshWalletBalance()"><i  class="fa fa-sign-in"></i>Refresh</v-btn>
                  </b>
                </v-row>

                <v-row  class="mt-4" >
                  <v-col offset-md="1" md="8" class="mx-4">
                    <v-text-field  label="Amount"
                                   :disabled="availableBalance < 1"
                                   :max="availableBalance"
                                   v-model="payment.wallet.wallet_account_amount"
                                   type="number"
                                   @input="payment.calculateTotalWallet()"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </div>

              <div class="mx-2" v-else-if="mode.name === 'wallet' && msetting('finance.wallet_integrated') && availableBalance < parseFloat(payment.total_cost) - parseFloat(payment.paid_amount)">
                <v-row >
                  <b v-if="payment && availableBalance !== null">
                    <span><v-chip small outlined color="success" >{{ formattedAvailableBalance }}</v-chip> </span>
                    <v-btn small color="primary"
                           outlined rounded @click="refreshWalletBalance()"><i  class="fa fa-sign-in"></i>Refresh</v-btn>
                  </b>
                </v-row>
                <v-row>
                  <v-col md="6">
                    <v-row >
                      <v-col  offset-md="1" class="mx-4">
                        <v-text-field label="Mpesa number" v-model="payment.wallet.mobile_number" type="text"></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row >
                      <v-col offset-md="1" class="mx-4">
                        <v-text-field label="Amount" outline v-model="payment.wallet.amount_to_pay" type="number" @input="payment.calculateTotalWallet()"></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row v-if="payment.wallet.code">
                      <v-col style="font-size: 13px;">
                        <span>Code: </span> <span style="font-weight: bold">{{ payment.wallet.code }}</span>
                      </v-col>
                    </v-row>

                    <v-row >
                      <v-col>
                        <v-btn small color="primary" outlined rounded @click="requestWalletPayment('finsprint')">Request payment</v-btn>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col md="6" style="border-left: 1px solid grey;">
                    <v-row>
                      <v-col offset-md="1" class="mx-4">
                        <v-text-field label="Mpesa number" v-model="payment.wallet.msisdn" type="text"></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-btn small color="primary" outlined rounded @click="fetchWalletPayment('mpesa', null, payment.mpesa.msisdn)">Fetch payment</v-btn>
                        <br/>
                        <div>
                          Use this section to fetch already made payments,
                          either directly or previously unused payments.
                        </div>

                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>

                <v-row v-if="payment.mpesa.transactions.length > 0">
                  <v-col>
                    <v-chip @click:close="removeTransaction(index, transaction)" class="ma-2"
                            close
                            v-for="(transaction, index) in payment.mpesa.transactions" :key="transaction.id">
                      <span>{{ transaction.mobile_number }}</span> <span class="mx-3"> :
                                                            </span><strong>{{ transaction.amount }}</strong>
                      <br/><br/>
                      <span class="mx-2">{{ transaction.name }}</span>
                    </v-chip>
                  </v-col>
                </v-row>
                <v-row  v-if="payment.mpesa.transactions.length > 0">
                  <v-col>
                    Total amount: {{ payment.mpesa.amount }}
                  </v-col>
                </v-row>
              </div>
            </v-card>
          </v-expansion-panel-content>
        </v-expansion-panel>

      </v-expansion-panels>

      <v-card-title>
                    <span style="font-weight: bold; font-size: 15px" v-if="payment.total_cost > payment.paid_amount || totalCost > payment.paid_amount">
                        Balance: {{ parseFloat(payment.total_cost) - parseFloat(payment.paid_amount) }}
                    </span>
        <span style="font-weight: bold; font-size: 16px" v-if="payment.total_cost <= payment.paid_amount || totalCost <= payment.paid_amount ">
                             Change: {{ amount_change }}
                    </span>

        <v-spacer></v-spacer>

        <v-btn small color="success"
               v-if="payment.internal_payment"
               :disabled="checkAbilityToSave(payment)"
               @click="savePayment()">
          <span v-if="!payment.loading">save</span>
          <v-progress-circular
              v-else
              :size="10"
              :width="2"
              color="blue"
              indeterminate
          ></v-progress-circular>
        </v-btn>
        <v-btn small color="success" v-else  @click="verify_dialog = true">verify payment</v-btn>
      </v-card-title>

      <div class="text-right" v-if="UsingSelectMode">
        <span v-if="payment.paid_amount > payment.total_cost" class="grey--text caption">Please give back the change for you to save, </span>
      </div>
    </v-card>

    <v-dialog v-model="paymentCheckDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="blue darken-4 headline white--text">
          <span>Waiting for payment..</span>
          <v-spacer/>
          <v-icon class="white--text" @click="paymentCheckDialog = false">close</v-icon>
        </v-card-title>

        <v-card-text>
          <collabmed-loading></collabmed-loading>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialog" persistent max-width="500">
      <v-card>
        <v-card-title class="blue darken-4 headline white--text">
          <span>Patients bill id:</span>
        </v-card-title>
        <v-card-text>
          <div>
            To pay bills on jambopay:
            <ul>
              <li>Go to jambopay: either through ussd, mobile app or web portal</li>
              <li>Select pay hospital bill and enter this key: </li>
              <li>That is it, now wait for jambopay to do its magic. </li>
            </ul>
          </div>
          <div class="text-center">
            <h3>Key: {{ billKey }}</h3>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" @click="dialog = false">Okay</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <v-dialog v-model="verify_dialog" persistent max-width="500">
      <v-card>
        <v-card-title class="blue darken-4 headline white--text">
          <span>Patients bill id:</span>
        </v-card-title>
        <v-card-text>
          <v-text-field outline label="Bill verification code:" v-model="payment.verification_code"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" @click="verifyExternalPayment()">verify</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { mapActions } from 'vuex';
import Payment from '@finance/libs/payments/Payment';

export default {
  props: {
    payment: {
      type: Object,
      default: () => new Payment(),
    },

    investigations: {
      default: null
    },
    prescriptions: {
      default: null
    },

    patientId: {
      required: true
    },


    totalCost: {
      default: null
    },

    UsingSelectMode: {
      default: false
    },

    postTo: {
      type: String,
      default: null
    },

    /* pass in  any extra data for your own processing once submitted */
    paymentData: {
      default: null
    },

    patientAccount: {
      default: null,
    },
    totalInvoiceAmount: {
      type: Number,
      default: null,
    },
  },

  data: () => ({
    panel2: 1,
    account: null,
    dialog: false,
    billKey: null,
    verify_dialog: false,
    paymentCheckDialog: false,
    availableBalance: null,
    walletAccountNumber:null,
    intervalId: null,
    totalCost: null

  }),

  computed: {
    paymentModes() {
      if (!this.msetting('finance.enable_jambo_pay')) {
        return [
          { name: 'cash', active: 1, external_payment: 0 },
          { name: 'm pesa manual entry', active: 1, external_payment: 0 },
          { name: 'm pesa', active: 1, external_payment: 0 },
          { name: 'cheque', active: 1, external_payment: 0 },
          { name: 'credit card', active: 1, external_payment: 0 },
          { name: 'customer account', active: 1, external_payment: 0 },
          { name: 'wallet', active: 1, external_payment: 0 },
        ];
      } else {
        return [
          { name: 'jambo pay', active: 1, external_payment: 1 },
        ];
      }
    },
    amount_change() {


      const totalCost = parseFloat(this.payment.total_cost);
      const paidAmount = parseFloat(this.payment.paid_amount);
      return ( paidAmount - totalCost - this.totalInvoiceAmount).toFixed(2); // Round to 2 decimal places

    },
    formattedAvailableBalance() {
      // console.log("avail")
      return `Available Balance: ${ this.availableBalance }`;
    },
  },

  methods: {
    ...mapActions([
      'setPatientBills',
      'setPaymentModes',
      'setPaymentTransactions',
    ]),

    handleInput() {
      this.payment.calculateTotal(); // Calculate total if needed
      this.checkAbilityToSave(this.payment); // Check if the save button should be enabled
    },
    // this.selectedData.length < 1 ||
    checkAbilityToSave(payment) {


      // const total =   this.payment.calculateTotal();


      if(parseFloat(this.totalCost) == 0 || this.payment.paid_amount == 0) {
        return true;
      }
      else if (this.payment.paid_amount < parseFloat(this.totalCost)){
        return true;
        // return true;
      }
      else
      {
        if(this.payment.paid_amount == parseFloat(this.totalCost)) {
          return false;
        }
      }
      // else {
      //     if(parseFloat(this.payment.paid_amount) == parseFloat(this.totalCost)) {

      //       return false;
      //     }
      //     else{
      //        return true
      //     }

      // }




      // return true;
      if(parseFloat(this.payment.total_cost) == 0 ){
        return true;
      }
      else if ((payment.paid_amount < parseFloat(this.payment.total_cost)
      )) {
        return true;
      }

      // }
      else if(payment.percentage_discount >0)

      {

        return false;
      }
      else {
        if(payment.paid_amount == parseFloat(this.payment.total_cost)) {
          return false;
        }
      }
      return true;
    },

    shouldRenderPanel(mode){
      if (mode.name === 'cash' && this.msetting('finance.enable_cash')) {
        return true;
      } else if (mode.name === 'wallet' && this.msetting('finance.wallet_integrated')) {
        return true;
      } else if (mode.name === 'm pesa' && this.msetting('finance.mpesa_integrated')) {
        return true;
      } else if (mode.name === 'credit card' && this.msetting('finance.enable_card')) {
        return true;
      } else if (mode.name === 'customer account' && this.msetting('finance.enable_patient_account')) {
        return true;
      } else if (mode.name === 'cheque' && this.msetting('finance.enable_cheque')) {
        return true;
      } else if (mode.name === 'jambo pay' && this.msetting('finance.enable_jambo_pay')) {
        return true;
      }  else if (mode.name === 'm pesa manual entry' && this.msetting('finance.mpesa_non_integrated')) {
        return true;
      }else{
        return false;
      }
    },
    raiseBill() {
      const data = {
        bills: this.payment.selected,
        amount_to_pay: this.payment.total_cost,
        total_amount: this.payment.totalAmount,
        balance: 0,
        patient: this.patientId,
        mode: 'jambo pay',
      };

      this.payment.raiseBill(data).then((response) => {
        this.billKey = response;
        this.dialog = true;
        this.payment.internal_payment = false;
      });
    },

    verifyExternalPayment() {
      this.payment.verifyPayment().then((response) => {
        this.verify_dialog = false;
      });
    },

    async requestPayment(type) {
      const response = await this.payment.requestClientPayment(type);

      if (response.transaction_id) {
        this.initiatePaymentChecks(type, response.transaction_id);
      }
    },

    async requestWalletPayment(type){
      const response = await this.payment.requestClientPayment(type);

      if (response.transaction_id) {
        this.initiatePaymentChecks(type, response.transaction_id);
        this.startUpdatingBalance();

      }
    },

    initiatePaymentChecks(type, transaction_id) {
      this.paymentCheckDialog = true;

      if (this.paymentCheckDialog) {
        setTimeout(() => {
          const check = setInterval(async () => {
            if (!this.paymentCheckDialog) {
              clearInterval(check);
              this.stopUpdatingBalance();

            }

            if (this.payment.mpesa !== null && this.payment.mpesa.mobile_number !== null && this.payment.mpesa.mobile_number !== '') {
              await this.fetchPayment(type, transaction_id, this.payment.mpesa.mobile_number);
            } else {

              await this.fetchPayment(type, transaction_id, this.payment.wallet.mobile_number);
            }

            this.fetchWalletPaymentFinal();

          }, 3000);
        }, 5000);
      }
    },

    removeTransaction(index, transaction) {
      this.payment.mpesa.transactions.splice(index, 1);

      this.payment.mpesa.amount -= transaction.amount;

      this.payment.calculateTotal();
    },

    fetchWalletPaymentFinal() {
      setTimeout(() => {
        this.paymentCheckDialog = false;
      }, 15000); // Change the timeout to 15 seconds (15000 milliseconds)
    },

    async fetchPayment(type, transaction_id, number) {
      const response = await this.payment.fetchTransaction(transaction_id, number);

      if (response) {
        const response_data = response.data[0];

        if (response_data.ref_no) {
          this.payment.mpesa.code = response_data.ref_no;
          this.paymentCheckDialog = false;
        }
      }
    },

    async fetchActualBalance(patientId) {

      try {
        return await this.payment.fetchPatientActualWalletBalance(patientId);
      } catch (error) {
        // console.error("Error fetching patient wallet balance:", error);
        throw error; // Propagate the error if needed
      }
    },
    async refreshWalletBalance(){
      this.availableBalance =  await this.fetchActualBalance(this.patientId);
    },
    stopUpdatingBalance() {
      // Clear the interval when needed (e.g., when the component is destroyed)
      clearInterval(this.intervalId);
    },
    async savePayment() {
      const url = this.postTo ?? null;
      // console.log(JSON.parse(this.paymentData))
      // Check if discounted_amount or percentage_discount is set
      if (this.msetting('finance.wallet_integrated')) {

        //fetch existing patient wallet account if response is success proceed with attaching wallet  number
        // const existingWalletPatientResponse = await this.payment.fetchExistingPatientWalletAccount(this.patientId)

        if(this.payment.wallet.wallet_account_amount || this.payment.wallet.mobile_number || this.payment.wallet.wallet_number){


          this.payment.wallet.wallet_number = await this.payment.fetchPatientWalletAccount(this.patientId)
          this.payment.wallet.wallet_available_balance = this.availableBalance
        }




      }
      // console.log("wallet number")

      const parsedPaymentData = this.paymentData ? JSON.parse(this.paymentData) : {};
      this.paymentData = {
        invoice_id: parsedPaymentData['invoice_id'] || null,
        discounted_amount: this.payment.discounted_amount || 0,
        percentage_discount: this.payment.percentage_discount || 0,
        investigations: this.investigations || null,
        prescriptions: this.prescriptions || null,
        patientId: this.patientId,
        staff_id: this.$route.query.staff_id || null,
        corporate_id: this.$route.query.corporate_id || null
      };

      // Check if wallet is integrated
      if (this.msetting('finance.wallet_integrated')) {
        this.paymentData.wallet_account_amount_set = this.payment.wallet_account_amount || 0;
        this.paymentData.wallet_no = this.payment.wallet.wallet_number || null;
      }
      // Check if wallet is integrated

      this.payment.recordPayment(url, this.paymentData).then((response) => {
        if (!this.paymentData.staff_id && !this.paymentData.corporate_id) {
          this.setPatientBills({
            params: {
              patient_id: this.patientId,
            },
          });
        }
      });
    },
  },

  created() {
    // Call refreshWalletBalance when the component is created
    if (this.msetting('finance.wallet_integrated')) {

      this.refreshWalletBalance();

    }
  },
  beforeDestroy() {
    // Stop updating the balance when the component is about to be destroyed
    if (this.msetting('finance.wallet_integrated')) {

      this.stopUpdatingBalance();
    }
  },
  watch: {
    patientAccount () {
      if(typeof  this.patientAccount === 'string') {
        this.account = this.patientAccount ? JSON.parse(this.patientAccount) : null;
      } else {
        this.account = this.patientAccount;
      }
    }
  },

  async mounted() {
    if (!this.payment) {
      this.payment = new Payment();
    }

    if (this.msetting('finance.wallet_integrated')) {

      this.availableBalance = await this.fetchActualBalance(this.patientId);
      this.payment.wallet.wallet_number = await this.payment.fetchPatientWalletAccount(this.patientId)
      this.payment.wallet.wallet_available_balance = this.availableBalance

    }
    if (typeof this.patientAccount === 'string') {
      this.account = this.patientAccount ? JSON.parse(this.patientAccount) : null;
    } else {
      this.account = this.patientAccount;
    }
  }
}
</script>
