<template>
    <v-row  class="pa-2">
      <v-col cols="5">
        <div class="ml-4">
          <v-radio-group row v-model="type">
            <v-radio v-for="(category, index) in categories" :label="category.name" :value="category" :key="index"></v-radio>
          </v-radio-group>
        </div>
      </v-col>
      <div  v-if="loadingPayment" class="dialog-payment">
        <v-card>
          <v-card-title class="blue darken-4 text-h5 white--text">
            <span>Waiting for payment..</span>
            <v-spacer/>
            <v-icon class="white--text" @click="closeLoadingPayment()">close</v-icon>
          </v-card-title>
          <v-card-text>
            <collabmed-loading></collabmed-loading>
          </v-card-text>
        </v-card>
      </div>
      <div v-if="show_wallet_notification" class="payment_modal">
        <v-card>
          <v-card-title class="text-h5 primary payment-notification" >{{ card_title }}</v-card-title>
          <v-col md="6" style="max-width: 100% !important" v-if="initiateTopup">
            <v-row >
              <v-col  offset-md="1" class="mx-4">
                <v-text-field label="Mpesa number"  type="text"  v-model="procedure.mobile_number"></v-text-field>
              </v-col>
            </v-row>
            <v-row >
              <v-col offset-md="1" class="mx-4">
                <v-text-field label="Amount" outline type="number"  v-model="procedure.amount" ></v-text-field>
              </v-col>
            </v-row>
          </v-col>
          <v-card-text v-else class="py-4">
            {{wallet_message }}
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary darken-1" @click="initiateTopUpPayment(procedure)"><i v-if="showTopupLoader" class="fa fa-spinner fa-spin"></i> {{ card_action }}</v-btn>
            <v-btn color="error darken-1" @click="closeWalletNotification()">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </div>
  
      <v-col cols="4" offset="3">
        <v-autocomplete clearable hide-details solo flat
                        return-object large outlined
                        prepend-inner-icon="search"
                        placeholder="Search for a procedure"
                        :items="procedure.search.results"
                        item-text="name"  item-value="id"
                        v-model="cart.item"
                        hide-no-data
                        no-filter
                        :disabled="!procedure.type"
                        :loading="procedure.search.loading"
                        :search-input.sync="procedure.search.term"
        >
          <template v-slot:item="{ item }">
            <v-list-item-avatar color="cyan" size="42" class="text-h5 font-weight-light white--text">
              <span class="subheading">{{ item.name.substring(0, 2) }}</span>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="text-caption">
                <span>{{ item.name }}</span> <br/>
              </v-list-item-title>
              <v-list-item-subtitle>
                <span class="text-caption blue--text font-weight-bold" v-if="item.exclusion_price">Exclusion Price: {{ item.exclusion_price }} </span>
                <span class="text-caption">Cash: {{ item.cash_charge }}</span>
                <span class="text-caption">Ins: {{ item.insurance_charge }}</span>
              </v-list-item-subtitle>
              <v-list-item-subtitle v-if="item.service_excluded">
                <span class="text-caption red--text">Procedure not covered by patient scheme</span>
              </v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-autocomplete>
      </v-col>
  
      <v-col cols="12" class="table-form">
        <v-data-table
            flat
            :headers="headers"
            :items="cart.items"
            disable-pagination
            hide-default-footer
        >
          <template v-slot:item.name="{ item }">
            <span>{{ item.name }}</span> <br/>
            <span v-if="item.requires_preauth" class="primary--text">Requires preauth</span>
          </template>
          <template v-slot:item.quantity="{ item }">
            <v-text-field type="number"
                          v-model="item.quantity"
                          solo flat
                          @input="cart.calculateItemTotal(item.procedure)">
            </v-text-field>
          </template>
          <template v-slot:item.price="{ item }">
            <v-text-field v-if="(msetting('evaluation.enable_editing_of_procedure_prices_when_doc_requesting') || item.variable_pricing) && can('evaluation.edit-procedure-prices')"
                          type="number"
                          v-model="item.price"
                          solo flat
                          @input="cart.calculateItemTotal(item.procedure)"
            >
            </v-text-field>
            <span v-else>{{ item.price }}</span>
          </template>
          <template v-slot:item.reason="{ item }">
            <v-textarea
                v-model="item.reasons"
                solo
                flat>
            </v-textarea>
          </template>
          <template v-slot:item.performing_doctor="{ item }">
  
            <v-autocomplete
                v-model="item.performing_doctor"
                :items="doctors"
                item-text="full_name"
                item-value="id"
                label="Performing Doctor"
                solo
                flat
                autocomplete
                hide-no-data
  
            ></v-autocomplete>
  
          </template>
          <template v-slot:item.date_performed="{ item }">
            <collabmed-date-time-picker
                outline dateOnly
                v-model="item.date_performed"
                label="Date performed">
            </collabmed-date-time-picker>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-btn text icon color="red" @click="cart.removeItem(item.procedure)" small>
              <v-icon small>delete</v-icon>
            </v-btn>
  
            <!-- consumables dialog -->
            <v-dialog v-model="item.consumablesDialog" persistent max-width="800">
              <template v-slot:activator="{ on }">
                <v-btn :color="item.consumables.length < 1 ? 'warning' : 'primary'"
                       small
                       dark
                       v-on="on"
                       :disabled="item.consumables.length < 1" >Consumables</v-btn>
              </template>
              <v-card>
                <v-card-title class="text-h5 primary">Procedure consumables</v-card-title>
                <v-card-text>
                  <v-data-table :headers="consumablesHeaders" :items="item.consumables" hide-default-footer disable-pagination>
                    <template v-slot:item.name="{ item }">
                      <span :style="{'color': item.units > item.store_quantity ? 'red' : '' }">{{ item.name }}</span>
                      <div v-if="item.units > item.store_quantity">
                        <span style="font-size: 11px; font-style: italic">Please update the stock & re-order the procedure again</span>
                      </div>
                    </template>
  
                    <template v-slot:item.units="{ item }" >
                      <input
                          type="number"
                          step="1"
                          class="form-control table-input"
                          :min="1"
                          v-model="item.units"
                      />
                    </template>
  
                  </v-data-table>
                </v-card-text>
                <v-card-actions>
                  <v-spacer/>
                  <v-btn color="primary darken-1" @click="item.consumablesDialog = false">close</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </template>
  
          <template slot="footer">
            <v-row >
              <v-col class="pt-3 xs-8">
                <span class="grey--text text-darken-2 font-weight-bold">Total: {{ this.cart.total }}</span><br/>
                <span class="red--text" v-if="cart.consumable_states">Some required procedure items /
                                    drugs are either out of stock or less than required. (Highlighted in orange)</span>
              </v-col>
              <v-col>
                <v-autocomplete
                    v-model="procedure.store_id"
                    label="Choose store"
                    class="px-3"
                    outline
                    :items="filteredList"
                    item-value="id" item-text="name"
                ></v-autocomplete>
              </v-col>
              <v-col class="text-right xs-4">
                <v-btn class="error" @click="checkout()"
                       :loading="saveLoader" :disabled="saveLoader" :dark="!saveLoader">Request items</v-btn>
              </v-col>
            </v-row>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </template>
  
  <script>
  import { mapGetters, mapActions } from 'vuex';
  import Procedure from '@evaluation/libs/procedures/Procedure';
  import ProcedureCart from '@evaluation/libs/procedures/ProcedureCart';
  import Visit from '@reception/libs/visits/Visit';
  import { _ } from 'vue-underscore';
  
  export default {
    props: [
      'items', 'domain', 'visit_identifier', 'destination', 'admission_id','visit_id','operation_id'
    ],
  
  
  
    data() {
      return {
        type: null,
        categories: [],
        procedure: new Procedure(),
        cart: new ProcedureCart(),
        visitObj: new Visit(),
        saveLoader: false,
        wallet_number: null,
        wallet_amount: null,
        show_wallet_notification: false,
        card_action: 'Top-up',
        card_title: 'Payment Notification',
        show_wallet_message: false,
        initiateTopup: false,
        wallet_message: '',
        loadingPayment: false,
        showTopupLoader: false,
        doctors:[],
        searchQuery: '', // Variable to store search query
        headers: [
          { text: 'Procedure name', value: 'name' },
          { text: 'Price', value: 'price' },
          { text: 'Qty', value: 'quantity' },
          { text: 'Reason for investigation', value: 'reason' },
          { text: 'Performing Doctor', value: 'performing_doctor' },
          { text: 'Date performed', value: 'date_performed' },
          { text: 'Action', value: 'actions' },
        ],
        consumablesHeaders: [
          { text: 'Product name', sortable: false, value: 'name' },
          { text: 'Quantity', sortable: false, value: 'units' },
        ],
      };
    },
  
    computed: {
      ...mapGetters([
        'getProcedureCategories', 'getStores',
      ]),
  
      term() {
        return this.procedure.search.term;
      },
  
      filteredList() {
        return _.filter(this.getStores.data, (item) => {
          const perm = `inventory.${item.name}-Store`;
          if (this.$options.methods.can(perm) || this.storesSettings) {
            return item;
          }
        });
      },
  
      item() {
        return this.cart.item;
      },
  
      submitted() {
        return this.procedure.form.submitted;
      },
  
      visit() {
        const visit =this.visitObj.selectedVisit;
  
        if (visit && this.msetting('finance.wallet_integrated')) {
          const patient_id = this.visitObj.selectedVisit.patient_id;
  
          this.visitObj.fetchPatientWalletNumber(patient_id)
              .then((response) => {
                this.wallet_number = response;
              })
              .catch((error) => {
                console.error('Error fetching wallet number:', error);
              });
          this.visitObj.fetchPatientWalletBalance(patient_id)
              .then((response) => {
                this.wallet_amount = response;
              })
              .catch((error) => {
                console.error('Error fetching wallet balance:', error);
              });
        }
  
        return this.visitObj.selectedVisit;
      },
    },
  
    watch: {
      term(value) {
        if (value) {
          let schemeId = null;
  
          if (this.visit && this.visit.patient_scheme) {
            schemeId = this.visit.patient_scheme.scheme_id;
          }
  
          if (value.length > 2) {
            this.procedure.index(schemeId);
          } else {
            this.procedure.search.reset();
          }
        }
      },
  
      categories(val) {
        if (val.length === 1) {
          this.type = val[0];
        }
      },
  
      getProcedureCategories({ categories }) {
        _.each(categories, (category) => {
          if (this.items.includes(category.name)) {
            this.categories.push(category);
          }
        });
      },
  
      type(value) {
        if (value) {
  
          this.procedure.type = value.name;
          this.procedure.destinations.push(value.name);
        }
      },
  
      item(value) {
        if (value) {
          this.cart.addItem(value, this.getProcedureType(), this.visit);
  
          this.procedure.search.results = [];
          this.procedure.search.term = false;
        }
      },
  
      submitted(value) {
        if (value) {
          this.saveLoader = false;
          this.procedure.form.submitted = false;
          this.type = null;
          this.cart.reset();
          this.resetOrderedProcedures();
        }
      },
    },
  
    methods: {
      ...mapActions([
        'setProcedureCategories', 'setInvestigations', 'setStores',
      ]),
  
      resetOrderedProcedures() {
        this.setInvestigations({
          params: {
            visit_id: this.$route.params.visitId ? this.$route.params.visitId : this.visit_identifier,
          },
        });
  
  
        // check for scheme capitation status
        window.events.$emit('check-capitation', 'From OrderProcedures.vue');
      },
  
      closeWalletNotification() {
        this.show_wallet_message =false;
        this.show_wallet_notification =false;
        window.location.reload();
      },
      closeLoadingPayment() {
        this.loadingPayment = false;
        this.show_wallet_message =false;
        this.show_wallet_notification= false;
        window.location.reload();
      },
      async initiateTopUpPayment() {
        this.initiateTopup= true;
        this.card_action = 'Initiate';
        this.showTopupLoader = true;
  
        this.card_title = 'Initiate Payment';
        this.procedure.wallet_number = this.wallet_number;
        this.procedure.total_amount= this.cart.total;
        this.procedure.patient_id = this.visitObj.selectedVisit.patient_id;
        // console.log(this.procedure);
        const payment_response = await this.procedure.requestClientPayment(this.procedure);
        if (payment_response.message ==='Request sent successfully. Waiting for processing') {
          this.show_wallet_notification= false;
  
          this.loadingPayment =true;
          this.processWalletPayment();
        }
      },
  
      processWalletPayment() {
        setTimeout(() => {
          this.loadingPayment = false;
          this.showTopupLoader = false;
          window.location.reload();
        }, 30000);
      },
      async checkout() {
        if (this.cart.consumable_states ? window.confirm('Some required consumables or drugs are less than required. Are you sure you still want to order the procedure?') : true) {
          if (this.cart.items === 0) {
            flash({
              alert: 'red',
              message: 'Sorry! You have not selected any items',
            });
  
            return;
          }
  
          if (this.cart.total === 0 && !this.msetting('evaluation.enable_ordering_procedures_without_price')) {
            flash({
              alert: 'red',
              message: 'Sorry! Items you have selected have not been charged. (total price is less than or equal to zero)',
            });
  
            return;
          }
  
          this.saveLoader = true;
  
  
          // if wallet has been enabled add amount and number to cart
          if (this.msetting('finance.wallet_integrated')) {
            this.cart.wallet_number = this.wallet_number;
            this.cart.wallet_balance = this.wallet_number;
          }
          
          this.procedure.visit = this.visit_id;
          this.procedure.user = this.user_id;
          this.procedure.operation_id = this.operation_id
  
          const response = await this.procedure.orderTheaterInvestigations(this.cart,
              this.$route.params.visitId ? this.$route.params.visitId : this.visit_identifier,
              this.user_id,this.operation_id,this.procedure.store_id,this.type.name);
  
          if (response) {
            if (this.msetting('finance.wallet_integrated') && response.message === 'Kindly advise patient to top up their wallet before final point of receipt') {
              this.show_wallet_notification = true;
              this.wallet_message ='Kindly advise patient to top up their wallet before final point of receipt';
            } else {
              window.location.reload();
            }
            this.resetOrderedProcedures();
            this.cart.consumable_states = false;
          }
        }
      },
  
      getProcedureType() {
        const type = this.type.name;
  
        if (type === 'Doctor') {
          return 'treatment';
        }
  
        if (type === 'Nursing') {
          return 'nursing';
        }
  
        if (type === 'Radiology') {
          return 'radiology';
        }
  
        if (type === 'Ultrasound') {
          return 'ultrasound';
        }
  
        if (type === 'Lab') {
  
          return 'laboratory';
        }
  
        return 'diagnosis';
      },
  
      initialize() {
        this.setStores();
  
  
  
        this.setProcedureCategories();
  
        const visit = this.$route.params.visitId ? this.$route.params.visitId : this.visit_identifier;
  
        this.visitObj.find(visit);
  
        if (this.admission_id) {
          this.cart.admission_id = this.admission_id;
        }
      },
    },
  
  
    searchDoctors() {
  
    },
    onDoctorSelected() {
      // Handle selection if needed
    },
  
    async mounted()  {
      this.initialize();
      try {
        const response = await fetch('/api/users/get/doctors');
  
  
  
        const data =  await response.json();
        this.doctors = data; // Assuming the API response is an array of objects with "id" and "name" properties
  
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    },
  
    created() {
  
  
    }
  
  
  };
  </script>
  <style lang="scss">
  .v-input--selection-controls.v-input .v-label {
    top: 4px;
  }
  
  .table-form {
  
    .v-text-field.v-text-field--solo .v-input__control {
      margin-top: 7px;
      min-height: 40px;
    }
  
    .v-text-field.v-text-field--enclosed .v-input__slot, .v-text-field.v-text-field--enclosed .v-text-field__details {
      border: 1px solid #ddd;
      min-width: 150px;
    }
  
    .v-text-field.v-text-field--enclosed .v-text-field__details {
      display: none;
    }
  
  }
  </style>
  