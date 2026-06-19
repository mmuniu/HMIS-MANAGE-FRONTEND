<template>
  <v-dialog v-model="showModal" max-width="600px" persistent>
    <v-card>
      <v-card-title class="headline">Make Payment</v-card-title>
      <v-card-text>
        <v-alert v-if="areOtherPaymentsDisabled" type="info" dense outlined class="mb-2">
          Total payable has been met by Cash. Other payment modes are disabled.
        </v-alert>
        <v-expansion-panels v-model="selectedPanelsInternal" class="mt-4" multiple>
          <v-expansion-panel
              v-for="(mode) in paymentModes"
              :key="mode.name"
              v-show="shouldRenderPanel(mode)"
              :disabled="mode.name !== 'cash' && areOtherPaymentsDisabled"
          >
            <v-expansion-panel-header>
              <h5>{{ mode.label }}</h5>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <!-- Cash Form -->
              <div v-if="mode.name === 'cash'">
                <v-row>
                  <v-col>
                    <v-text-field
                        label="Amount Received (KES)"
                        v-model="custom_payment.cash.received_amount"
                        type="number"
                        @input="onCashInput"
                        :hint="`Total Payable: ${formatCurrency(totals.totalPayable)}`"
                        persistent-hint
                    />
                    <div v-if="clampNotice.cash" class="caption red--text mt-1">{{ clampNotice.cash }}</div>
                  </v-col>
                </v-row>
                <v-row v-if="custom_payment.cash.received_amount > 0">
                  <v-col>
                    <v-alert
                        :type="custom_payment.cash.change_amount > 0 ? 'info' : 'success'"
                        dense
                        outlined
                    >
                      <strong>Change Due:</strong> {{ formatCurrency(custom_payment.cash.change_amount) }}
                    </v-alert>
                  </v-col>
                </v-row>
              </div>

              <!-- M-pesa Form -->
              <div v-else-if="mode.name === 'mpesa'">
                <v-row>
                  <v-col>
                    <v-text-field label="Mpesa number" v-model="custom_payment.mpesa.mobile_number" type="text"/>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field
                        label="Amount"
                        v-model="custom_payment.mpesa.amount"
                        type="number"
                        :max="remainingFor('mpesa')"
                        @input="onClampPaymentAmount('mpesa')"
                    />
                    <div v-if="clampNotice.mpesa" class="caption red--text mt-1">{{ clampNotice.mpesa }}</div>
                  </v-col>
                </v-row>
                <v-btn color="primary" @click="requestPayment('mpesa')">
                  <v-progress-circular
                      indeterminate
                      v-if="mpesa_loading"
                      :size="10"
                      :width="2"
                      color="primary"
                  ></v-progress-circular>
                  Prompt for Payment
                </v-btn>
                <div class="mt-1">
                  <em class="note-text">(this sends a prompt to customers phone)</em>
                </div>
                <div class="my-2">OR</div>

                <!-- Recent Offline M-Pesa payments fetch -->
                <div class="mt-4">
                  <v-btn small color="info" :loading="recentMpesaLoading" @click="fetchRecentMpesaPayments" :disabled="recentMpesaLoading">
                    <v-icon left>fa-refresh</v-icon>
                    Get Recent Mpesa Payments
                  </v-btn>
                  <v-alert v-if="recentMpesaError" type="error" dense outlined class="mt-2">{{ recentMpesaError }}</v-alert>

                  <div v-if="recentMpesa.length > 0" class="mt-2">
                    <h6>Recent Payments:</h6>
                    <div class="scrollable-div">

                    <v-list dense>
                      <v-list-item v-for="(item, index) in recentMpesa" :key="index">
                        <v-list-item-content>
                          <v-list-item-title>{{ item.reference }}</v-list-item-title>
                          <v-list-item-subtitle>
                            {{ formatCurrency(item.amount) }} - {{ item.transaction_time }}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-btn x-small color="success" @click="useRecentMpesaPayment(item)">Use</v-btn>
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                      </div>
                  </div>
                </div>

                <!-- Manual M-Pesa Code Entry -->
                <div class="mt-4">
                  <v-row>
                    <v-col>
                      <v-text-field
                          label="Mpesa Transaction Code"
                          v-model="custom_payment.mpesa.code"
                          type="text"
                          :disabled="true"
                          :append-icon="custom_payment.mpesa.code ? 'check_circle' : ''"
                          :color="custom_payment.mpesa.code ? 'success' : ''"
                          hint="Transaction code will be auto-filled"
                          persistent-hint
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-text-field
                          label="Amount"
                          v-model="custom_payment.mpesa.amount"
                          type="number"
                          :max="remainingFor('mpesa')"
                          @input="onClampPaymentAmount('mpesa')"
                      />
                      <div v-if="clampNotice.mpesa" class="caption red--text mt-1">{{ clampNotice.mpesa }}</div>
                    </v-col>
                  </v-row>
                </div>
              </div>

              <!-- Loyalty Points Form -->
              <div v-else-if="mode.name === 'loyalty'">
                <v-row>
                  <v-col offset-md="1" class="mx-4">
                    <div>
                      <strong>Available Points:</strong>
                      <v-chip small outlined color="success">{{ custom_payment.loyalty.available }}</v-chip>
                    </div>
                    <div class="mt-2">
                      <strong>Rate:</strong>
                      <v-chip small outlined color="primary">KES {{ Number(custom_payment.loyalty.rate || 0).toFixed(2) }} per point</v-chip>
                    </div>
                  </v-col>
                </v-row>

                <v-row class="mt-4">
                  <v-col offset-md="1" md="8" class="mx-4">
                    <v-text-field
                        label="Points to Redeem"
                        v-model.number="custom_payment.loyalty.points"
                        type="number"
                        :max="custom_payment.loyalty.available"
                        :min="0"
                        @input="onLoyaltyInput"
                    />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col offset-md="1" md="8" class="mx-4">
                    <v-text-field
                        label="Value to Apply (KES)"
                        v-model.number="custom_payment.loyalty.value"
                        type="number"
                        readonly
                        hint="Automatically calculated from points"
                        persistent-hint
                    />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col offset-md="1" md="8" class="mx-4">
                    <v-btn color="primary" @click="processLoyaltyRedemption" :disabled="!custom_payment.loyalty.points || custom_payment.loyalty.points <= 0">
                      Apply Loyalty Points
                    </v-btn>
                  </v-col>
                </v-row>
              </div>

              <!-- Pesapal Form -->
              <div v-else-if="mode.name === 'pesapal'">
                <v-row>
                  <v-col>
                    <v-text-field
                        label="Amount"
                        v-model="custom_payment.pesapal.amount"
                        type="number"
                        :max="remainingFor('pesapal')"
                        @input="onClampPaymentAmount('pesapal')"
                    />
                    <div v-if="clampNotice.pesapal" class="caption red--text mt-1">{{ clampNotice.pesapal }}</div>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field
                        label="Pesapal Transaction Code"
                        v-model="custom_payment.pesapal.code"
                        type="text"
                        :disabled="true"
                        :append-icon="custom_payment.pesapal.code ? 'check_circle' : ''"
                        :color="custom_payment.pesapal.code ? 'success' : ''"
                        hint="Transaction code will be auto-filled from Pesapal response"
                        persistent-hint
                    />
                  </v-col>
                </v-row>
                <v-btn color="primary" @click="requestPayment('pesapal')" :disabled="pesapal_loading">
                  <v-progress-circular
                      indeterminate
                      v-if="pesapal_loading"
                      :size="10"
                      :width="2"
                      color="primary"
                  ></v-progress-circular>
                  Request Pesapal Payment
                </v-btn>
              </div>

              <!-- Gift Card Form -->
              <div v-else-if="mode.name === 'giftcard'">
                <v-row>
                  <v-col offset-md="1" class="mx-4">
                    <span>Current Gift-Card balance:
                      <v-chip small outlined color="success" v-if="giftCardAccount">{{ giftCardAccount.balance }}</v-chip>
                    </span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col offset-md="1" class="mx-4">
                    <a @click="toggleGiftCardInput()">can't scan code</a>
                  </v-col>
                </v-row>
                <v-row v-if="showGiftCardInput">
                  <v-col offset-md="1" md="6" class="mx-4">
                    <v-text-field
                        :value="manualGiftCardCode"
                        label="Enter Gift Card Code"
                        type="text"
                        placeholder="Enter gift card code"
                        @input="$emit('update:manualGiftCardCode', $event)"
                        @keyup.enter="fetchGiftCardDetails(manualGiftCardCode)"
                    />
                  </v-col>
                  <v-col offset-md="1" md="3" class="mx-4">
                    <v-btn color="primary" @click="fetchGiftCardDetails(manualGiftCardCode)">Fetch</v-btn>
                  </v-col>
                </v-row>
                <v-row class="mt-4" v-if="giftCardAccount">
                  <v-col offset-md="1" md="8" class="mx-4">
                    <v-text-field
                        label="Amount"
                        :disabled="giftCardAccount.balance < 1"
                        :max="Math.min(giftCardAccount.balance, remainingFor('giftcard'))"
                        v-model="custom_payment.gift_card.amount"
                        type="number"
                        placeholder="Enter gift card amount"
                        @input="onClampPaymentAmount('giftcard')"
                    />
                    <div v-if="clampNotice.giftcard" class="caption red--text mt-1">{{ clampNotice.giftcard }}</div>
                  </v-col>
                </v-row>
              </div>

              <!-- Voucher Form -->
              <div v-else-if="mode.name === 'voucher'">
                <v-row>
                  <v-col offset-md="1" class="mx-4">
                    <span>Current Voucher balance:
                      <v-chip small outlined color="success" v-if="voucherAccount">{{ voucherAccount.balance }}</v-chip>
                    </span>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col offset-md="1" class="mx-4">
                    <a @click="toggleVoucherInput()">can't scan code</a>
                  </v-col>
                </v-row>
                <v-row v-if="showVoucherInput">
                  <v-col offset-md="1" md="6" class="mx-4">
                    <v-text-field
                        :value="manualVoucherCode"
                        label="Enter Voucher Code"
                        type="text"
                        placeholder="Enter voucher code"
                        @input="$emit('update:manualVoucherCode', $event)"
                        @keyup.enter="fetchVoucher(manualVoucherCode)"
                    />
                  </v-col>
                  <v-col offset-md="1" md="3" class="mx-4">
                    <v-btn color="primary" @click="fetchVoucher(manualVoucherCode)">Fetch</v-btn>
                  </v-col>
                </v-row>
                <v-row class="mt-4" v-if="voucherAccount && voucherAccount.balance > 0 && voucherAccount.status == 'active'">
                  <v-col offset-md="1" md="8" class="mx-4">
                    <v-btn color="primary" @click="requestPayment('voucher')"
                           :disabled="voucher_loading || voucherAccount.balance > 0 && voucherAccount.balance < custom_payment.voucher.amount || custom_payment.voucher.amount == 0 || voucherAccount.times_used >= 1">
                      <v-progress-circular
                          indeterminate
                          v-if="voucher_loading"
                          :size="10"
                          :width="2"
                          color="primary"
                      ></v-progress-circular>
                      Use Voucher ({{ formatCurrency(voucherAccount.balance) }})
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- Payment Summary -->
        <v-divider class="my-4"></v-divider>
        <div class="mt-2">
          <v-row>
            <v-col cols="6" class="py-1">
              <div class="subtitle-2 grey--text">Total Payable</div>
            </v-col>
            <v-col cols="6" class="py-1 text-right">
              <div class="subtitle-2 font-weight-medium">{{ formatCurrency(totals.totalPayable) }}</div>
            </v-col>
          </v-row>
          <v-row v-if="totals.discount && totals.discount > 0">
            <v-col cols="6" class="py-1">
              <div class="subtitle-2 grey--text">Total Discount</div>
            </v-col>
            <v-col cols="6" class="py-1 text-right">
              <div class="subtitle-2 font-weight-medium">{{ formatCurrency(totals.discount) }}</div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6" class="py-1">
              <div class="subtitle-2 grey--text">Total Paid</div>
            </v-col>
            <v-col cols="6" class="py-1 text-right">
              <div class="subtitle-2 font-weight-medium">{{ formatCurrency(getTotalPaidAmount()) }}</div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6" class="py-1">
              <div class="subtitle-2 grey--text">Balance</div>
            </v-col>
            <v-col cols="6" class="py-1 text-right">
              <div class="subtitle-2 font-weight-medium" :class="getBalanceClass()">{{ formatCurrency(getRemainingBalance()) }}</div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6" class="py-1">
              <div class="subtitle-2 grey--text">Change</div>
            </v-col>
            <v-col cols="6" class="py-1 text-right">
              <div class="subtitle-2 font-weight-medium">{{ formatCurrency(getChangeAmount()) }}</div>
            </v-col>
          </v-row>
          <v-row v-if="getTotalPointsSummary()">
            <v-col cols="12" class="py-1">
              <v-alert dense outlined type="info" class="mb-0">{{ getTotalPointsSummary() }}</v-alert>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="onCancelPaymentModal">Cancel</v-btn>
        <v-btn
            color="success"
            @click="processMultiplePayments"
            :disabled="!canProcessPayment()"
            :loading="paymentProcessing"
        >
          <v-icon left>fa-check</v-icon>
          Process Payment
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'PaymentModal',
  props: {
    showModal: {
      type: Boolean,
      default: false
    },
    totals: {
      type: Object,
      default: () => ({})
    },
    custom_payment: {
      type: Object,
      default: () => ({})
    },
    paymentModes: {
      type: Array,
      default: () => []
    },
    selectedPaymentPanel: {
      type: [Number, Array],
      default: 0
    },
    clampNotice: {
      type: Object,
      default: () => ({})
    },
    areOtherPaymentsDisabled: {
      type: Boolean,
      default: false
    },
    // Loading states
    mpesa_loading: {
      type: Boolean,
      default: false
    },
    pesapal_loading: {
      type: Boolean,
      default: false
    },
    voucher_loading: {
      type: Boolean,
      default: false
    },
    paymentProcessing: {
      type: Boolean,
      default: false
    },
    recentMpesaLoading: {
      type: Boolean,
      default: false
    },
    recentMpesaError: {
      type: String,
      default: ''
    },
    recentMpesa: {
      type: Array,
      default: () => []
    },
    giftCardAccount: {
      type: Object,
      default: () => null
    },
    voucherAccount: {
      type: Object,
      default: () => null
    },
    showGiftCardInput: {
      type: Boolean,
      default: false
    },
    showVoucherInput: {
      type: Boolean,
      default: false
    },
    manualGiftCardCode: {
      type: String,
      default: ''
    },
    manualVoucherCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // Local data for internal state
      selectedPanelsInternal: [],
      debounceTimers: {
        cash: null,
        mpesa: null,
        pesapal: null,
        giftcard: null,
        loyalty: null
      }
    }
  },
  created() {
    this.initSelectedPanels();
  },
  beforeDestroy() {
    // Clear any pending timeouts to avoid memory leaks
    try {
      Object.keys(this.debounceTimers || {}).forEach(k => {
        if (this.debounceTimers[k]) clearTimeout(this.debounceTimers[k]);
      });
    } catch (e) { /* no-op */ }
  },
  watch: {
    selectedPaymentPanel(val) {
      // Sync from parent prop to internal state without forcing collapses
      const norm = this.normalizePanels(val);
      try {
        const a = JSON.stringify(this.selectedPanelsInternal);
        const b = JSON.stringify(norm);
        if (a !== b) {
          this.selectedPanelsInternal = norm;
        }
      } catch (e) {
        this.selectedPanelsInternal = norm;
      }
    },
    selectedPanelsInternal(val) {
      // Emit for optional .sync compatibility (non-breaking)
      this.$emit('update:selectedPaymentPanel', val);
    }
  },
  methods: {
    normalizePanels(input) {
      if (Array.isArray(input)) return input.slice();
      if (typeof input === 'number') return [input];
      return [];
    },
    initSelectedPanels() {
      this.selectedPanelsInternal = this.normalizePanels(this.selectedPaymentPanel);
      // Ensure at least the first panel is open if none selected and modes exist
      if ((!this.selectedPanelsInternal || this.selectedPanelsInternal.length === 0) && Array.isArray(this.paymentModes) && this.paymentModes.length > 0) {
        this.selectedPanelsInternal = [0];
      }
    },
    // Event handlers that will be emitted to parent
    onCancelPaymentModal() {
      this.$emit('cancel-payment-modal');
    },

    processMultiplePayments() {
      this.$emit('process-multiple-payments');
    },

    calculateCashChange() {
      this.$emit('calculate-cash-change');
    },

    clampPaymentAmount(mode) {
      this.$emit('clamp-payment-amount', mode);
    },

    // Debounced wrappers
    onCashInput() {
      if (this.debounceTimers.cash) clearTimeout(this.debounceTimers.cash);
      this.debounceTimers.cash = setTimeout(() => {
        this.calculateCashChange();
      }, 250);
    },

    onClampPaymentAmount(mode) {
      const key = mode;
      if (this.debounceTimers[key]) clearTimeout(this.debounceTimers[key]);
      this.debounceTimers[key] = setTimeout(() => {
        this.clampPaymentAmount(mode);
      }, 250);
    },

    onLoyaltyInput() {
      if (this.debounceTimers.loyalty) clearTimeout(this.debounceTimers.loyalty);
      this.debounceTimers.loyalty = setTimeout(() => {
        this.updateLoyaltyValue();
      }, 250);
    },

    // Methods below are used directly in this component's template and must return values.
    // We delegate to parent methods when available to preserve existing business logic.
    remainingFor(mode) {
      try {
        if (this.$parent && typeof this.$parent.remainingFor === 'function') {
          return this.$parent.remainingFor(mode);
        }
      } catch (e) { /* no-op */ }
      // Emit for legacy listeners and return undefined as a safe fallback (no max restriction)
      this.$emit('remaining-for', mode);
      return undefined;
    },

    requestPayment(type) {
      this.$emit('request-payment', type);
    },

    fetchRecentMpesaPayments() {
      this.$emit('fetch-recent-mpesa-payments');
    },

    useRecentMpesaPayment(item) {
      this.$emit('use-recent-mpesa-payment', item);
    },

    updateLoyaltyValue() {
      this.$emit('update-loyalty-value');
    },

    processLoyaltyRedemption() {
      this.$emit('process-loyalty-redemption');
    },

    toggleGiftCardInput() {
      this.$emit('toggle-gift-card-input');
    },

    toggleVoucherInput() {
      this.$emit('toggle-voucher-input');
    },

    fetchGiftCardDetails(code) {
      this.$emit('fetch-gift-card-details', code);
    },

    fetchVoucher(code) {
      this.$emit('fetch-voucher', code);
    },

    reset() {
      this.selectedPanelsInternal = [0];
    },

    shouldRenderPanel(mode) {
      try {
        if (this.$parent && typeof this.$parent.shouldRenderPanel === 'function') {
          return this.$parent.shouldRenderPanel(mode);
        }
      } catch (e) { /* no-op */ }
      // Fallback: render active modes by default
      return !!(mode && (mode.active === undefined || mode.active));
    },

    canProcessPayment() {
      try {
        if (this.$parent && typeof this.$parent.canProcessPayment === 'function') {
          return this.$parent.canProcessPayment();
        }
      } catch (e) { /* no-op */ }
      // Fallback: disabled (safer default) until parent provides logic
      this.$emit('can-process-payment');
      return false;
    },

    formatCurrency(amount) {
      try {
        if (this.$parent && typeof this.$parent.formatCurrency === 'function') {
          return this.$parent.formatCurrency(amount);
        }
      } catch (e) { /* no-op */ }
      // Simple local formatter as a fallback
      const num = Number(amount || 0);
      return `KES ${num.toFixed(2)}`;
    },

    // Delegates to parent to get remaining balance; fallback computes conservatively
    getRemainingBalance() {
      try {
        if (this.$parent && typeof this.$parent.getRemainingBalance === 'function') {
          return this.$parent.getRemainingBalance();
        }
      } catch (e) { /* no-op */ }
      const payable = Number(this.totals?.totalPayable || 0);
      const paid = Number(this.getTotalPaidAmount() || 0);
      return Math.max(0, payable - paid);
    },

    // Calculate change amount locally to ensure overpayments are handled correctly
    getChangeAmount() {
      const payable = Number(this.totals?.totalPayable || 0);
      const paid = Number(this.getTotalPaidAmount() || 0);
      const change = Math.max(0, paid - payable);
      return change;
    },

    // Delegates to parent to get total paid; also computes robust local sum and returns the greater
    getTotalPaidAmount() {
      const cp = this.custom_payment || {};
      const safeNum = v => Number(v || 0);
      const values = [];
      // Cash uses received_amount if present, else amount (allows overpay to reflect here)
      if (cp.cash) {
        values.push(safeNum(cp.cash.received_amount != null ? cp.cash.received_amount : cp.cash.amount));
      }
      // Only count mpesa/pesapal once the code exists (confirms the payment)
      if (cp.mpesa) values.push(cp.mpesa.code ? safeNum(cp.mpesa.amount) : 0);
      if (cp.pesapal) values.push(cp.pesapal.code ? safeNum(cp.pesapal.amount) : 0);
      if (cp.card) values.push(safeNum(cp.card.amount));
      if (cp.cheque) values.push(safeNum(cp.cheque.amount));
      if (cp.voucher) values.push(safeNum(cp.voucher.amount));
      if (cp.gift_card) values.push(safeNum(cp.gift_card.amount));
      if (cp.giftcard) values.push(safeNum(cp.giftcard.amount));
      if (cp.loyalty) values.push(safeNum(cp.loyalty.value || cp.loyalty.amount));
      const localPaid = values.reduce((a, b) => a + b, 0);
      try {
        if (this.$parent && typeof this.$parent.calculateTotalPaidAmount === 'function') {
          const parentPaid = Number(this.$parent.calculateTotalPaidAmount() || 0);
          return Math.max(parentPaid, localPaid);
        }
      } catch (e) { /* no-op */ }
      return localPaid;
    },

    // Delegates to parent balance class if available
    getBalanceClass() {
      try {
        if (this.$parent && typeof this.$parent.getBalanceClass === 'function') {
          return this.$parent.getBalanceClass();
        }
      } catch (e) { /* no-op */ }
      return '';
    },

    // Build a readable total points summary; delegate to parent if available
    getTotalPointsSummary() {
      try {
        if (this.$parent && typeof this.$parent.getTotalPointsSummary === 'function') {
          return this.$parent.getTotalPointsSummary();
        }
      } catch (e) { /* no-op */ }
      const loyalty = this.custom_payment && this.custom_payment.loyalty ? this.custom_payment.loyalty : null;
      if (!loyalty) return '';
      const available = Number(loyalty.available || 0);
      const rate = Number(loyalty.rate || 0);
      const points = Number(loyalty.points || 0);
      const value = Number((loyalty.value != null ? loyalty.value : points * rate) || 0);
      if (available <= 0 && points <= 0) return '';
      const parts = [];
      if (!isNaN(available) && available > 0) {
        const availValue = rate > 0 ? (available * rate) : 0;
        parts.push(`Available: ${available} pts${rate > 0 ? ` (${this.formatCurrency(availValue)})` : ''}`);
      }
      if (!isNaN(points) && points > 0) {
        parts.push(`To Redeem: ${points} pts${value > 0 ? ` (${this.formatCurrency(value)})` : ''}`);
      }
      return parts.join(' • ');
    }
  }
}
</script>

<style scoped>
.note-text {
  font-size: 0.8em;
  color: #666;
}
.scrollable-div {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
}

</style>
