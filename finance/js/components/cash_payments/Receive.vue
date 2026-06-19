<style scoped>
.v-data-table__checkbox v-simple-checkbox{
  display:none;
}
</style>
<template>
  <transition name="slide">
    <v-container fluid>
      <v-row >
        <v-col cols="12" md="6">

          <!-- bills ordered by visits-->
          <div>
            <collabmed-loading v-if="! initialised" classes="py-5 white">Loading Bills...</collabmed-loading>

            <div v-else>

              <v-expansion-panels v-model="panel">
                <v-expansion-panel  v-for="(visitBills, index) in visitsBills" :key="index + index">
                  <v-expansion-panel-header v-if="visitBills.bills.length > 0">
                    <v-card-actions>
                      <h5> {{ visitBills.date }} - {{ visitBills.clinic }} </h5>
                      <v-spacer></v-spacer>
                      <span>#{{ visitBills.visit }}</span>
                    </v-card-actions>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-card flat v-if="visitBills.bills.length > 0" >
                      <v-data-table
                          v-model="payment.selected"
                          ref="dataTable"
                          :items="visitBills.bills"
                          :headers="computedHeaders"
                          :hide-default-header="true"
                          show-select=""
                          hide-default-footer
                          disable-pagination
                          item-key="item_id"
                          class="elevation-1q"
                      >
                        <template v-slot:header="{ props }">
                          <!-- Custom header slot -->
                          <tr>
                            <th></th> <!-- Empty cell to replace the checkbox column -->
                            <th v-for="(header, index) in headersWithoutCheckbox" :key="index">
                              {{ header.text }}
                            </th>
                          </tr>
                        </template>
                        <template v-slot:item.data-table-select="{ item }">
                          <v-checkbox
                              v-if="item.type === 'prescription' && item.processed && item.amount > 0"
                              v-model="item.selected"
                              @click="onRowClick(item, item.selected)"
                          ></v-checkbox>
                          <v-checkbox
                              v-else-if="item.type !== 'prescription' && item.amount > 0"
                              v-model="item.selected"
                              @click="onRowClick(item, item.selected)"
                          ></v-checkbox>
                          <v-checkbox
                              v-else
                              disabled
                          ></v-checkbox>
                        </template>
                      </v-data-table>

                   <!--  <v-btn small color="primary" @click="printVisitBills(visitBills.visit)" >print bills</v-btn>-->
                    </v-card>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="6">

          <!-- process payments here-->
          <cash-payment-form :payment="payment"
                             using-select-mode
                             :patient-account="account"
                             :wallet_integrated="wallet_integrated"
                             :patient-id="patientId">
          </cash-payment-form>
        </v-col>

      </v-row>

      <collabmed-floating-loader v-if="payment.processing_payment"></collabmed-floating-loader>
    </v-container>
  </transition>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { _ } from 'vue-underscore';
import Payment from '@finance/libs/payments/Payment';
import CashPaymentForm from '@finance/components/cash_payments/partials/CashPaymentForm';

export default {
  props: {
    patientId: {
      default: null,
    },
    staffId: {
      type: [String, Number],
      default: null,
    },
    corporateId: {
      type: [String, Number],
      default: null,
    },
    wallet_integrated: null,
  },

  components: {
    CashPaymentForm,
  },

  data: () => ({
    panel: 0,
    payment: new Payment(),
    billRaised: 0,
    account: null,
    totalAmount: null,
    visitsBills: null,
    dataValidated: false,
    currentStaffId: null,
    currentCorporateId: null,
    headers: [
      { text: 'name', value: 'name', sortable: false },
      { text: 'type', value: 'type', sortable: false },
      { text: 'price', value: 'amount', sortable: false },
    ],
    headersWithoutCheckbox: [],

    selectAll: false,

  }),

  computed: {
    ...mapGetters([
      'getPatientBills',
    ]),
    allSelected: {
      get() {
        // Check if visitsBills is defined and has the necessary structure
        if (this.visitsBills && this.visitsBills.bills) {
          return this.visitsBills.bills.length > 0 && this.visitsBills.bills.every(item => item.selected);
        }
        return false; // Return false if visitsBills is not properly initialized
      },
      set(value) {
        if (this.visitsBills && this.visitsBills.bills) {
          this.visitsBills.bills.forEach(item => {
            if (!item.disabled) {
              item.selected = value;
            }
          });
        }
      }
    },

    computedHeaders() {
      // Copy the existing headers array
      const headers = [...this.headers];

      // Remove the checkbox column if it exists

      const checkboxIndex = headers.findIndex(header => header.value === 'data-table-select');
      if (checkboxIndex !== -1) {
        headers.splice(checkboxIndex, 1);
      }


      return headers;
    },
    selectedData() {
      return this.payment.selected.filter((item) => !item.disabled);
    },
    initialised() {
      return this.visitsBills;
    },
  },

  watch: {
    staffId: {
      immediate: true,
      handler(newVal) {
        if (newVal !== this.currentStaffId) {
          this.currentStaffId = newVal;
          this.fetchBills();
        }
      }
    },
    corporateId: {
      immediate: true,
      handler(newVal) {
        if (newVal !== this.currentCorporateId) {
          this.currentCorporateId = newVal;
          this.fetchBills();
        }
      }
    },
    allSelected(value) {
      this.selectAll = value;
    },

    selectedData() {
      this.payment.totalCostOfSelectedItems();
    },

    getPatientBills(val) {
      if (val) {
        this.visitsBills = val.data;
        this.account = val.account;
        this.payment.patientAccount.balance = val.account?.balance || 0;
        this.payment.mpesa.mobile_number = val.account?.mobile || '';
        this.payment.mpesa.msisdn = val.account?.mobile || '';
      }
    },
  },

  methods: {
    ...mapActions([
      'setPatientBills',
      'setPaymentModes',
      'setPaymentTransactions',
    ]),

    printVisitBills(visit_id) {
      window.open(`/finance/invoices/pending/action/view/print?visit_id=${visit_id}&paper_size=thermal`, '_blank');
    },
    isItemDisabled(item) {
      // Disable the item if its 'processed' property is false
      return !item.processed;
    },

    onRowClick(item, selected) {
      this.disableRowClick = true;

      if (!selected) {
        // If checkbox is unchecked, remove the item from the selected items array
        const index = this.payment.selected.findIndex((selectedItem) => selectedItem === item);
        if (index !== -1) {
          this.payment.selected.splice(index, 1);
        }
      } else {
        // If checkbox is checked, add the item to the selected items array
        this.payment.selected.push(item);
      }
    },

  },

  methods: {
    ...mapActions([
      'setPatientBills',
      'setPaymentModes',
      'setPaymentTransactions',
    ]),

    fetchBills() {
      const params = {};
      
      if (this.patientId) {
        params.patient_id = this.patientId;
      }
      
      if (this.staffId) {
        params.staff_id = this.staffId;
      }
      
      if (this.corporateId) {
        params.corporate_id = this.corporateId;
      }

      this.setPatientBills({ params });
    },

    printVisitBills(visit_id) {
      window.open(`/finance/invoices/pending/action/view/print?visit_id=${visit_id}&paper_size=thermal`, '_blank');
    },
    
    isItemDisabled(item) {
      // Disable the item if its 'processed' property is false
      return !item.processed;
    },

    onRowClick(item, selected) {
      this.disableRowClick = true;

      if (!selected) {
        // If checkbox is unchecked, remove the item from the selected items array
        const index = this.payment.selected.findIndex((selectedItem) => selectedItem === item);
        if (index !== -1) {
          this.payment.selected.splice(index, 1);
        }
      } else {
        // If checkbox is checked, add the item to the selected items array
        this.payment.selected.push(item);
      }
    },
  },

  mounted() {
    this.payment.patient_id = this.patientId;
    this.fetchBills();
    this.headersWithoutCheckbox = this.headers.filter(header => header.value !== 'checkbox');
  },
};
</script>

