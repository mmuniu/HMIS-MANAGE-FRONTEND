<template>
  <div class="pos-container">
    <!-- Shift Opening Modal -->
    <v-dialog v-model="shiftDialog" persistent max-width="500" overlay-color="rgba(0,0,0,0.4)" overlay-opacity="0.8">
      <v-card>
        <v-card-title class="primary white--text">Open Shift</v-card-title>
        <v-card-text>
          <v-text-field label="Opening cash balance" type="number"
                        v-model.number="shift.opening_balance"></v-text-field>
          <v-select
              :items="staff"
              item-text="full_name"
              item-value="id"
              label="Confirmed by"
              v-model="shift.confirmed_by_id"
              clearable
              :loading="staffLoading"
              :disabled="staffLoading"
              :rules="[v => !!v || 'Confirmed by is required']"
              dense
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" :loading="shiftLoading" @click="logoutUser">Logout</v-btn>
          <v-btn color="secondary" :loading="shiftLoading" @click="openAndPrintShift">Open & Print</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Shift Closing Modal -->
    <v-dialog v-model="closeShiftDialog" persistent max-width="500" overlay-color="rgba(0,0,0,0.4)"
              overlay-opacity="0.8">
      <v-card>
        <v-card-title class="primary white--text">Close Shift</v-card-title>
        <v-card-text>
          <v-text-field label="System closing balance" type="number" v-model.number="closeShift.system_closing_balance"
                        :disabled="true"></v-text-field>
          <v-text-field label="Cashier closing balance" type="number"
                        v-model.number="closeShift.cashier_closing_balance"
                        @input="computeClosingVariance"></v-text-field>
          <v-text-field label="Variance" type="number" v-model.number="closeShift.closing_variance"></v-text-field>
          <v-select
              :items="staff"
              item-text="full_name"
              item-value="id"
              label="Confirmed by"
              v-model="closeShift.close_confirmed_by_id"
              clearable
              :loading="staffLoading"
              :disabled="staffLoading"
              dense
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeShiftDialog=false">Cancel</v-btn>
          <v-btn color="error" :loading="shiftLoading" @click="closeAndPrintShift">Close & Print</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


     <!-- Create Invoice Dialog -->
  <v-dialog v-model="createInvoiceDialog" max-width="700" persistent>
    <v-card>
       <v-card-title class="d-flex align-center justify-space-between">
        <div>Create Invoice</div>
        <v-checkbox
          v-model="invoiceSelectAll"
          :label="'Select all (' + selectedItems.length + ')'"
          hide-details
          dense
          @change="toggleInvoiceSelectAll"
        ></v-checkbox>
      </v-card-title>
      <v-card-text>
        <v-list dense two-line v-if="selectedItems.length">
          <v-list-item v-for="(item, idx) in selectedItems" :key="item.id || idx">
             <v-list-item-action>
              <v-checkbox
                v-model="invoiceSelectedIds"
                :value="(item.id !== undefined ? item.id : (item.product_id !== undefined ? item.product_id : idx))"
                dense
                hide-details
              />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ idx + 1 }}. {{ item.product || item.name }}</v-list-item-title>
              <v-list-item-subtitle>
                Qty: {{ item.quantity }} • Price: {{ formatCurrency(item.price) }} • Subtotal:
                {{ formatCurrency((item.price || 0) * (item.quantity || 0)) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <div v-else class="text-center grey--text">No items in cart</div>

        <v-divider class="my-3"></v-divider>

        <div class="d-flex justify-space-between">
          <div><strong>Total:</strong> {{ formatCurrency(totals.totalPayable) }}</div>
          <div v-if="groupPos && groupPos.pos_data && groupPos.pos_data.customer_data && groupPos.pos_data.customer_data.staff_id">
            <strong>Staff:</strong>
            {{ (staff.find(s => Number(s.id) === Number(groupPos.pos_data.customer_data.staff_id)) || {}).full_name || 'Selected staff' }}
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="createInvoiceDialog = false">Cancel</v-btn>
        <v-btn color="primary" :loading="invoiceLoading" @click="createInvoice" :disabled="selectedItems.length === 0">
          Create Invoice
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

    <v-row>
      <!-- LEFT SIDE: POS Table -->
      <v-col cols="12" md="8">
        <v-card class="summary-card" color="primary" dark style="margin-bottom:15px">
          <v-card-text class="text-center py-3">
            <div class="text-subtitle-1 font-weight-bold mb-1">Total Payable</div>
            <div class="text-h5 font-weight-bold" style="font-size:3.5em !important;color:black !important">
              {{ formatCurrency(totals.totalPayable) }}
            </div>
            <div v-if="custom_payment.loyalty.points > 0" class="mt-2">
              <div class="text-caption text-white-50">After loyalty points redemption:</div>
              <div class="text-h6 font-weight-bold text-warning">
                {{ formatCurrency(Math.max(0, totals.totalPayable - custom_payment.loyalty.value)) }}
              </div>
              <div class="text-caption text-white-50">
                ({{ custom_payment.loyalty.points }} points = {{ formatCurrency(custom_payment.loyalty.value) }})
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card class="mb-4 pos-card" elevation="2" height="100vh" style="overflow-y: auto;">
          <v-card-title class="py-2 px-4 primary lighten-1 white--text d-flex align-center">
            <v-icon color="white" class="mr-2">fa-shopping-cart</v-icon>

            <div class="d-flex align-center flex-grow-1">
              <!-- Barcode Scanner -->
              <v-btn
                  icon
                  color="white"
                  class="mr-2"
                  @click="openProductSearchSettings"
                  title="Configure product search"
              >
                <v-icon>fa-barcode</v-icon>
              </v-btn>

              <div class="mx-2" style="width: 300px;">
                <v-menu
                    v-model="showInlineSearchMenu"
                    :close-on-content-click="false"
                    offset-y
                    transition="scale-transition"
                    max-height="300"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                        v-model="barcode"
                        v-on="on"
                        v-bind="attrs"
                        @input="onBarcodeInput"
                        @keyup.enter="handleBarcodeScan"
                        label="Product name/Scan barcode"
                        type="text"
                        outlined
                        dense
                        dark
                        hide-details
                    ></v-text-field>
                  </template>
                  <v-card v-if="autocompleteItems && autocompleteItems.length > 0" style="min-width: 340px;">
                    <v-list dense>
                      <v-list-item
                          v-for="(item, idx) in autocompleteItems"
                          :key="item.id || item.store_product_id || idx"
                          :disabled="isResultDisabled(item)"
                          @click="onInlineSelect(item)"
                      >
                        <v-list-item-content>
                          <v-list-item-title>{{ item.name }}</v-list-item-title>
                          <v-list-item-subtitle>
                            Qty: {{ Number(item.quantity) || 1 }} • Price: {{
                            formatCurrency((item.discount_price && item.discount_price > 0) ? item.discount_price : (item.price || item.cash_price || 0))
                            }}
                          </v-list-item-subtitle>
                          <v-list-item-subtitle v-if="isResultDisabled(item)" class="red--text">
                            Unavailable in selected store
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                    <v-progress-linear v-if="searchLoading" indeterminate color="primary"></v-progress-linear>
                  </v-card>
                </v-menu>
              </div>
            </div>


                        <!-- Customer / Staff Toggle + Search -->

                        <div class="d-flex align-center flex-grow-1" style="margin-top: 15px;margin-left: 70px;">

                          <v-radio-group v-model="isStaff" row class="mr-4">
                            <v-radio :label="'Customer'" :value="false"></v-radio>
                            <v-radio :label="'Staff'" :value="true"></v-radio>
                          </v-radio-group>

                          <v-icon color="white" class="mr-2" @click="openAddCustomerDialog" v-if="!isStaff">fa-user-plus</v-icon>



                          <!-- Patient search (default) -->
                          <div class="mx-2" style="width: 260px;" v-if="!isStaff">

                            <custom-pos-patient-search

                              ref="patientSearch"

                              @patientSelected="customerSelected"

                              :clear-signal="patientClearSignal"

                              dark

                              background-color="rgba(255, 255, 255, 0.1)"

                            ></custom-pos-patient-search>

                          </div>



                          <!-- User search when Staff is selected -->
                          <div class="mx-2" style="width: 260px;" v-else>

                            <custom-pos-user-search

                              ref="userSearch"

                              @userSelected="userSelected"

                              :clear-signal="userClearSignal"

                              dark

                              background-color="rgba(255, 255, 255, 0.1)"

                            ></custom-pos-user-search>

                          </div>


                          <!-- Inline Loyalty Display (only for customers) -->

                          <div v-if="!isStaff && selectedCustomerLoyalty.eligible" class="loyalty-banner ml-3">

                            <div class="d-flex align-center flex-wrap">

                              <v-chip small color="green darken-2" text-color="white" class="mr-2 mb-1">Loyalty</v-chip>

                              <v-chip small outlined color="green darken-1" class="mr-2 mb-1">Points: {{ selectedCustomerLoyalty.balance }}</v-chip>

                              <v-chip v-if="Number(custom_payment.loyalty.available || 0) > 0" small outlined color="green darken-1" class="mr-2 mb-1">

                                Available: {{ Number(custom_payment.loyalty.available || 0) }}

                              </v-chip>

                              <v-chip v-if="Number(custom_payment.loyalty.rate || 0) > 0" small outlined color="green darken-1" class="mr-2 mb-1">

                                Rate: {{ Number(custom_payment.loyalty.rate || 0).toFixed(2) }} per point

                              </v-chip>

                            </div>

                          </div>

                        </div>


          </v-card-title>
          <v-card-text class="pa-0">
            <v-data-table
                :headers="headers"
                :items="selectedItems"
                item-value="id"
                class="pos-table"
                disable-pagination
                hide-default-footer
                :no-data-text="'No items selected'"
            >
              <template #item.index="{ item, index }">
                <div class="d-flex align-items-center">
                  <div class="mr-2">{{ index + 1 }}</div>
                </div>
              </template>
              <template #item.product="{ item }">
                <div class="d-flex align-items-center">
                  <div class="font-weight-medium">
                    {{ item.product }}
                    <v-chip v-if="item.has_discount" x-small color="success" class="ml-1">Discount</v-chip>
                  </div>
                </div>
              </template>
              <template #item.photo_url="{ item }">
                <div class="d-flex justify-center">
                  <v-img
                      v-if="item.photo_url"
                      :src="'/'+item.photo_url"
                      max-width="50"
                      max-height="50"
                      contain
                      class="rounded"
                  ></v-img>
                  <v-img
                      v-else-if="item.photo"
                      :src="'/'+item.photo"
                      max-width="50"
                      max-height="50"
                      contain
                      class="rounded"
                  ></v-img>
                  <v-icon v-else color="grey">fa-image</v-icon>
                </div>
              </template>

              <template #item.quantity="{ item }">
                <div class="d-flex justify-center">
                  <v-text-field
                      v-model.number="item.quantity"
                      type="number"
                      min="1"
                      dense
                      hide-details
                      outlined
                      class="quantity-field"
                      style="max-width: 80px;"
                      @input="updateSubtotal(item)"
                  />
                </div>
              </template>

              <template #item.price="{ item }">
                <div class="text-center">{{ formatCurrency(item.price) }}</div>
              </template>

              <template #item.subtotal="{ item }">
                <div class="text-center font-weight-medium">{{ formatCurrency(item.quantity * item.price) }}</div>
              </template>

              <template #item.actions="{ item }">
                <div class="d-flex justify-center">
                  <v-btn icon color="error" @click="removeItem(item)" small>
                    <v-icon small>fa-times</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>

        <!-- Order Summary -->
        <v-card class="pos-card" elevation="2">
          <v-card-title class="py-2 px-4 primary lighten-1 white--text">
            <v-icon color="white" class="mr-2">fa-calculator</v-icon>
            <span>Order Summary</span>
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row dense>
              <v-col cols="12" sm="4" md="">
                <v-card class="summary-card" outlined>
                  <v-card-text class="text-center py-3">
                    <div class="text-subtitle-1 font-weight-medium mb-1">Subtotal</div>
                    <div class="text-h6 text-success">{{ formatCurrency(totals.subtotal) }}</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" sm="4" md="4">
                <v-card class="summary-card" outlined>
                  <v-card-text class="text-center py-3">
                    <div class="text-subtitle-1 font-weight-medium mb-1">Discount</div>
                    <v-text-field
                        v-model="totals.discount"
                        type="number"
                        dense
                        outlined
                        hide-details
                        class="discount-field"
                        @input="updateTotals"
                        prefix="KSH"
                    />
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" sm="4" md="6">
                <v-card class="summary-card" color="primary" dark>
                  <v-card-text class="text-center py-3">
                    <div class="text-subtitle-1 font-weight-bold mb-1">Total Payable</div>
                    <div class="text-h5 font-weight-bold" style="color:white">{{
                      formatCurrency(totals.totalPayable)
                      }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Clear Cart Button Row -->
            <v-row class="mt-2">
              <v-col cols="6" class="d-flex justify-end">
                <v-btn color="secondary" class="mr-2" @click="openCreateInvoiceDialog" v-if="isStaff">
                  <v-icon left>fa-file-invoice</v-icon>
                  Create Invoice
                </v-btn>
                </v-col>
              <v-col cols="6" class="d-flex justify-end">
                <v-btn
                    color="error"
                    @click="clearCurrentCart"
                    :disabled="selectedItems.length === 0"
                    title="Clear all items from cart"
                >
                  <v-icon left>fa-trash</v-icon>
                  Clear Cart
                </v-btn>
              </v-col>
            </v-row>

            <!-- Main Action Buttons Row -->
            <v-row class="mt-4">
              <v-col cols="12" class="d-flex justify-end">
                <!-- <v-btn
                    color="warning"
                    class="mr-2"
                    @click="holdCurrentSale"
                    :disabled="selectedItems.length === 0"
                    title="Put this sale on hold to serve the next customer"
                >
                  <v-icon left>fa-pause-circle</v-icon>
                  Hold
                </v-btn> -->

                <v-btn
                    color="secondary"
                    class="mr-4"
                    @click="openHeldSalesDialog"
                    title="View held sales"
                >
                  <v-icon left>fa-list</v-icon>
                  Held Sales
                  <v-chip v-if="heldSalesCount > 0" x-small class="ml-2" color="primary" text-color="white">
                    {{ heldSalesCount }}
                  </v-chip>
                </v-btn>

                <v-btn
                    color="success"
                    class="mr-2"
                    @click="submitOrder"
                    :disabled="selectedItems.length === 0 || hasZeroPriceItems || hasZeroLineTotalItems"
                >
                  <v-icon left>fa-paper-plane</v-icon>
                  Submit Order
                </v-btn>

                <v-btn
                    color="info"
                    @click="openCustomerDisplay"
                >
                  <v-icon left>fa-desktop</v-icon>
                  Customer Display
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- RIGHT SIDE: Product Grid -->
      <v-col cols="12" md="4">
        <v-card class="pos-card product-grid-card" height="140vh" elevation="2">
          <v-card-title class="py-2 px-4 primary lighten-1 white--text">
            <v-icon color="white" class="mr-2">fa-th</v-icon>
            <span>Products</span>
          </v-card-title>

          <v-card-text class="pa-3">
          <v-select
                v-model="selectedStoreId"
                :items="stores"
                item-text="name"
                item-value="id"
                label="Select Store"
                outlined
                dense
                class="mb-3"
                @change="loadProducts"
            ></v-select>

            <div class="product-container">
              <v-row dense>
                <v-col
                    v-for="product in sidebar_products"
                    :key="product.product_id"
                    cols="6"
                    sm="6"
                    md="6"
                    lg="6"
                    class="product-tile"
                >
                  <v-card
                      class="product-card"
                      elevation="1"
                      hover
                      :title="`${product.name} ${product.variation ? '- ' + product.variation : ''} (${product.sub_sku})`"
                      @click="selectProduct(product)"
                  >
                    <div
                        class="product-image"
                        :style="{
                        backgroundImage: `url(${productImage(product)})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize: 'contain'
                      }"
                    ></div>
                    <v-divider></v-divider>
                    <v-card-text class="product-details pa-2">
                      <div class="product-name text-truncate">
                        {{ product.name }}
                        <template v-if="product.variation">- {{ product.variation }}</template>
                      </div>
                      <div class="product-price primary--text">
                        KSH {{
                        (product.discount_price && product.discount_price > 0) ? product.discount_price : product.cash_price
                        }}
                        <v-chip v-if="product.discount_price && product.discount_price > 0" x-small color="success"
                                class="ml-1">Discount
                        </v-chip>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>

                <infinite-loading
                    class="infinite-loader-container"
                    @infinite="loadMoreProducts"
                    ref="infiniteLoader"
                    :identifier="page"
                    spinner="spiral"
                    :distance="100"
                    direction="bottom"
                    :scroll-parent="true"
                >
                  <template #no-more>
                    <p class="text-center my-2">No more products</p>
                  </template>
                  <template #no-results>
                    <p class="text-center my-2">No products found</p>
                  </template>
                </infinite-loading>
              </v-row>
            </div>
          </v-card-text>
        </v-card>

        <!-- Cash Pickup Modal -->
        <v-dialog v-model="pickupDialog" persistent max-width="500" overlay-color="rgba(0,0,0,0.4)"
                  overlay-opacity="0.8">
          <v-card>
            <v-card-title class="warning white--text">Cash Pickup</v-card-title>
            <v-card-text>
              <v-text-field label="Total cash" type="number" v-model.number="pickup.totalcash"></v-text-field>
              <v-select
                  :items="staff"
                  item-text="full_name"
                  item-value="id"
                  label="Cashier"
                  v-model="pickup.cashier_id"
                  clearable
                  :loading="staffLoading"
                  :disabled="staffLoading"
                  dense
              ></v-select>
              <v-select
                  :items="staff"
                  item-text="full_name"
                  item-value="id"
                  label="Personnel picking up"
                  v-model="pickup.picked_by_id"
                  clearable
                  :loading="staffLoading"
                  :disabled="staffLoading"
                  dense
              ></v-select>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="pickupDialog=false">Cancel</v-btn>
              <v-btn color="warning" :loading="shiftLoading" @click="pickupAndPrint">Pickup & Print</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>


      <!-- Reusable Payment Modal Component -->
      <PaymentModal
        ref="paymentModal"
        :showModal="showPaymentModal"
        :totals="totals"
        :custom_payment="custom_payment"
        :paymentModes="paymentModes"
        :selectedPaymentPanel="selectedPaymentPanel"
        :clampNotice="clampNotice"
        :areOtherPaymentsDisabled="areOtherPaymentsDisabled"
        :mpesa_loading="mpesa_loading"
        :pesapal_loading="pesapal_loading"
        :voucher_loading="voucher_loading"
        :paymentProcessing="paymentProcessing"
        :recentMpesaLoading="recentMpesaLoading"
        :recentMpesaError="recentMpesaError"
        :recentMpesa="recentMpesa"
        :giftCardAccount="giftCardAccount"
        :voucherAccount="voucherAccount"
        :showGiftCardInput="showGiftCardInput"
        :showVoucherInput="showVoucherInput"
        :manualGiftCardCode.sync="manualGiftCardCode"
        :manualVoucherCode.sync="manualVoucherCode"
        @cancel-payment-modal="onCancelPaymentModal"
        @process-multiple-payments="processMultiplePayments"
        @calculate-cash-change="calculateCashChange"
        @clamp-payment-amount="clampPaymentAmount"
        @remaining-for="remainingFor"
        @request-payment="requestPayment"
        @fetch-recent-mpesa-payments="fetchRecentMpesaPayments"
        @use-recent-mpesa-payment="useRecentMpesaPayment"
        @update-loyalty-value="updateLoyaltyValue"
        @process-loyalty-redemption="processLoyaltyRedemption"
        @toggle-gift-card-input="toggleGiftCardInput"
        @toggle-voucher-input="toggleVoucherInput"
        @fetch-gift-card-details="fetchGiftCardDetails"
        @fetch-voucher="fetchVoucher"
        @should-render-panel="shouldRenderPanel"
        @can-process-payment="canProcessPayment"
        @format-currency="formatCurrency"
      />

      <!--      payment check dialog-->
      <v-dialog v-model="paymentCheckDialog" max-width="600" persistent>
        <v-card>
          <v-card-title class="blue darken-4 headline white--text">
            <span>Waiting for payment..</span>
            <v-spacer/>
            <v-icon class="white--text" @click="paymentCheckDialog = false">close</v-icon>
          </v-card-title>

          <v-card-text>
            <v-alert v-if="areOtherPaymentsDisabled" type="info" dense outlined class="mb-2">
              Total payable has been met by Cash. Other payment modes are disabled.
            </v-alert>
            <v-expansion-panels v-model="selectedPaymentPanel" class="mt-4" multiple>
              <v-expansion-panel v-for="(mode) in paymentModes" :key="mode.name" v-if="shouldRenderPanel(mode)" :disabled="mode.name !== 'cash' && areOtherPaymentsDisabled">
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
                          @input="calculateCashChange"
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
                        <v-text-field label="Amount" v-model="custom_payment.mpesa.amount" type="number" :max="remainingFor('mpesa')" @input="clampPaymentAmount('mpesa')"/>
                        <div v-if="clampNotice.mpesa" class="caption red--text mt-1">{{ clampNotice.mpesa }}</div>
                      </v-col>
                    </v-row>
                    <v-btn color="primary" @click="requestPayment('mpesa')" >
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
                      <v-btn small color="info" :loading="recentMpesaLoading" @click="fetchRecentMpesaPayments"
                             :disabled="recentMpesaLoading">
                        <v-icon left>fa-refresh</v-icon>
                        Get Recent Mpesa Payments
                      </v-btn>
                      <v-alert v-if="recentMpesaError" type="error" dense outlined class="mt-2">{{
                        recentMpesaError
                        }}
                      </v-alert>

                      <v-card v-if="recentMpesa && recentMpesa.length" class="mt-3" outlined>
                        <v-card-title class="py-2">Recent M-PESA Transactions</v-card-title>
                        <v-card-text style="max-height: 220px; overflow-y: auto;">
                          <v-list dense>
                            <v-list-item v-for="item in recentMpesa" :key="item.id">
                              <v-list-item-content>
                                <v-list-item-title>
                                  • {{ formatCurrency(item.amount) }}
                                  <v-chip v-if="item.amount_matches" small color="green" text-color="white"
                                          class="ml-2">Amount matches
                                  </v-chip>
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                  Ref: {{ item.reference }} • {{
                                  formatDateTime(item.transaction_time ? item.transaction_time : (item.created_at || null))
                                  }}
                                </v-list-item-subtitle>
                              </v-list-item-content>
                              <v-list-item-action>
                                <v-btn x-small color="success" @click="useRecentMpesaPayment(item)">Use</v-btn>
                              </v-list-item-action>
                            </v-list-item>
                          </v-list>
                        </v-card-text>
                      </v-card>
                    </div>

                    <v-divider class="my-4"></v-divider>
                    <div>
                      <v-row>
                        <v-col>
                          <v-text-field
                              label="Mpesa Transaction Code"
                              v-model="custom_payment.mpesa.code"
                              type="text"
                              :disabled="true"
                              :append-icon="custom_payment.mpesa.code ? 'check_circle' : ''"
                              :color="custom_payment.mpesa.code ? 'success' : ''"
                              hint="Transaction code will be auto-filled from STK push"
                              persistent-hint
                          />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-text-field label="Amount" v-model="custom_payment.mpesa.amount" type="number" :max="remainingFor('mpesa')" @input="clampPaymentAmount('mpesa')"/>
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
                          <v-chip small outlined color="primary">KES
                            {{ Number(custom_payment.loyalty.rate || 0).toFixed(2) }} per point
                          </v-chip>
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
                            @input="updateLoyaltyValue"
                        />
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col offset-md="1" md="8" class="mx-4">
                        <v-text-field
                            label="Value to Apply (KES)"
                            :value="formatCurrency(custom_payment.loyalty.value)"
                            type="text"
                            readonly
                        />
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col offset-md="1" md="8" class="mx-4">
                        <v-alert type="success" dense outlined>
                          <div><strong>Points to Redeem:</strong> {{ custom_payment.loyalty.points || 0 }} points</div>
                          <div><strong>Amount Equivalent:</strong> {{ formatCurrency(custom_payment.loyalty.value || 0) }}</div>
                        </v-alert>
                      </v-col>
                    </v-row>

                    <v-row>
                      <v-col offset-md="1" md="8" class="mx-4">
                        <v-alert type="info" dense outlined>
                          <div><strong>Remaining to pay after redeeming:</strong></div>
                          <div class="text-h6">{{ formatCurrency(Math.max(0, totals.totalPayable - custom_payment.loyalty.value)) }}</div>
                        </v-alert>
                      </v-col>
                    </v-row>


                  </div>

                  <!-- Pesapal Form -->
                  <div v-else-if="mode.name === 'pesapal'">
                    <v-row>
                      <v-col>
                        <v-text-field label="Amount" v-model="custom_payment.pesapal.amount" type="number" :max="remainingFor('pesapal')" @input="clampPaymentAmount('pesapal')"/>
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
                    <v-row offset-md="1" class="mx-4">
                      <v-col>
                        <span>Current Gift-Card balance:  <v-chip small outlined color="success" v-if="giftCardAccount">{{
                            giftCardAccount.balance
                          }}</v-chip> </span>
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
                            v-model="manualGiftCardCode"

                            label="Enter Gift Card Code"
                            type="text"
                            outlined
                            dense
                        ></v-text-field>
                      </v-col>
                      <v-col md="3" class="d-flex align-center">
                        <v-btn color="primary" @click="fetchGiftCardDetails(manualGiftCardCode)"
                               :disabled="!manualGiftCardCode || gift_card_loading">
                          Fetch Gift Card
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-row class="mt-4" v-if="giftCardAccount">
                      <v-col offset-md="1" md="8" class="mx-4">
                        <v-text-field label="Amount"
                                      :disabled="giftCardAccount.balance < 1"
                                      :max="Math.min(giftCardAccount.balance, remainingFor('giftcard'))"
                                      v-model="custom_payment.gift_card.amount"
                                      type="number"
                                      placeholder="Enter gift card amount"
                                      @input="clampPaymentAmount('giftcard')"
                        ></v-text-field>
                        <div v-if="clampNotice.giftcard" class="caption red--text mt-1">{{ clampNotice.giftcard }}</div>
                      </v-col>
                    </v-row>
                    <v-row v-if="giftCardAccount && giftCardAccount.balance > 0">
                      <v-col offset-md="1" md="8" class="mx-4">
                        <!-- <v-btn color="primary" @click="requestPayment('giftcard')" :disabled="gift_card_loading && !custom_payment.gift_card.amount  && custom_payment.gift_card.amount >= giftCardAccount.balance && custom_payment.gift_card.amount == 0">
                          <v-progress-circular
                              indeterminate
                              v-if="gift_card_loading"

                              :size="10"
                              :width="2"
                              color="primary"
                          ></v-progress-circular>
                          Request Payment
                        </v-btn> -->
                      </v-col>
                    </v-row>
                  </div>
                  <!-- Voucher Form -->
                  <div v-if="mode.name === 'voucher'">
                    <v-row>
                      <v-col offset-md="1" class="mx-4">
                        <span>Current Voucher Balance:  <v-chip small outlined color="success"
                                                                v-if="voucherAccount && voucherAccount.balance">{{
                            voucherAccount.balance
                          }}</v-chip> </span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col offset-md="1" class="mx-4">
                        <a href="#" @click.prevent="toggleVoucherInput">can't scan code</a>
                      </v-col>
                    </v-row>
                    <v-row v-if="showVoucherInput && !voucherAccount"> ">
                      <v-col offset-md="1" md="6" class="mx-4">
                        <v-text-field
                            v-model="manualVoucherCode"
                            label="Enter Voucher Code"
                            type="text"
                            outlined
                            dense
                        ></v-text-field>
                      </v-col>
                      <!-- <v-col md="3" class="d-flex align-center">
                        <v-btn color="primary" @click="fetchVoucher(manualVoucherCode)"
                               :disabled="!manualVoucherCode || voucher_loading">
                          Fetch Voucher
                        </v-btn>
                      </v-col> -->
                    </v-row>

                    <v-row class="mt-4" v-if="voucherAccount">
                      <v-col offset-md="1" md="8" class="mx-4">
                        <v-text-field
                            label="Amount"
                            :disabled="voucherAccount.balance < 1"
                            :max="voucherAccount.balance"
                            :value="totals.totalPayable"
                            v-model="custom_payment.voucher.amount"
                            type="number"


                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row v-if="voucherAccount && voucherAccount.balance > 0 && voucherAccount.status == 'active'">
                      <v-col offset-md="1" md="8" class="mx-4">
                        <!-- <v-btn color="primary" @click="requestPayment('voucher')"
                               :disabled="voucher_loading || voucherAccount.balance > 0 && voucherAccount.balance < custom_payment.voucher.amount || custom_payment.voucher.amount == 0 || voucherAccount.times_used >= 1">
                          <v-progress-circular
                              indeterminate
                              v-if="voucher_loading"
                              :size="10"
                              :width="2"
                              color="primary"
                          ></v-progress-circular>
                          Request Payment
                        </v-btn> -->
                      </v-col>
                    </v-row>
                  </div>
                  <!-- DPO Payment Form    -->
                  <div v-else-if="mode.name === 'DPO'">
                    <v-row>
                      <v-col offset-md="1" class="mx-4">
                        <span>
                          Payment Method:
                          <v-chip small outlined color="primary">DPO</v-chip>
                        </span>
                      </v-col>
                    </v-row>

                    <!-- Payment Amount -->
                    <v-row class="mt-4">
                      <v-col offset-md="1" md="8" class="mx-4">
                        <v-text-field
                            label="Amount"
                            v-model="dpoPayment.amount"
                            type="number"
                            :value="totals.totalPayable"
                            :disabled="totals.totalPayable <= 0"
                            prefix="KSH"
                            readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <!-- Customer Email -->
                    <!-- <v-row>
                      <v-col offset-md="1" md="8" class="mx-4">
                        <v-text-field
                          label="Customer Email"
                          v-model="dpoPayment.customerEmail"
                          type="email"
                          :rules="[v => !!v || 'Email is required']"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                   Customer Phone -->

                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Payment Summary -->
            <v-card class="mt-4" outlined>
              <v-card-title class="py-2">
                <h6>Payment Summary</h6>
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <div class="text-subtitle-2">Total Payable:</div>
                    <div class="text-h6 text-primary">{{ formatCurrency(totals.totalPayable) }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-subtitle-2">Amount Paid:</div>
                    <div class="text-h6 text-success">{{ formatCurrency(calculateTotalPaidAmount()) }}</div>
                  </v-col>
                </v-row>

                <!-- Loyalty Points Information -->
                <v-row v-if="custom_payment.loyalty.points > 0">
                  <v-col cols="6">
                    <div class="text-subtitle-2">Points Redeemed:</div>
                    <div class="text-h6 text-warning">{{ custom_payment.loyalty.points }} points</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-subtitle-2">Points Value:</div>
                    <div class="text-h6 text-warning">{{ formatCurrency(custom_payment.loyalty.value) }}</div>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="6">
                    <div class="text-subtitle-2">Balance:</div>
                    <div class="text-h6" :class="getBalanceClass()">{{ formatCurrency(getRemainingBalance()) }}</div>
                  </v-col>
                  <v-col cols="6">
                    <div class="text-subtitle-2">Change:</div>
                    <div class="text-h6 text-info">{{ formatCurrency(getChangeAmount()) }}</div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

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
      <!-- End of mpesa payment modal -->
      <!--      payment check dialog-->
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

      <!--      end of payment check dialog-->


      <!-- Customer Facing POS Button -->
      <v-dialog v-model="showCustomerPosDialog" max-width="800" persistent>
        <v-card>
          <v-card-title class="headline primary white--text">
            <span>Customer Display</span>
            <v-spacer></v-spacer>
            <v-btn icon @click="openCustomerDisplay">
              <v-icon color="white">mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-0">
            <customer-facing-pos
                ref="customerDisplay"
                :key="customerDisplayKey"
                :selected-items="selectedItems"
                :totals="totals"
                :display-id="customerDisplayId"
            ></customer-facing-pos>
          </v-card-text>
        </v-card>
      </v-dialog>
      <!-- End of Customer Facing POS Dialog -->



      <!-- Add Customer Modal -->
      <v-dialog v-model="showAddCustomerDialog" max-width="480" persistent>
        <v-card>
          <v-card-title class="headline">Add Customer</v-card-title>

                    <v-card-text>

                      <!-- Customer profile information -->
                      <v-text-field label="First name" v-model="newCustomer.first_name" dense outlined></v-text-field>

                      <v-text-field label="Middle name" v-model="newCustomer.middle_name" dense outlined></v-text-field>

                      <v-text-field label="Last name" v-model="newCustomer.last_name" dense outlined></v-text-field>

                      <v-select class="mx-1" label="Gender" v-model="newCustomer.gender" :items="['Male', 'Female']" outlined></v-select>

                      <v-text-field label="Phone number" v-model="newCustomer.phone" dense outlined></v-text-field>

                      <v-text-field label="KRA PIN Number" v-model="newCustomer.kra_pin_number" dense outlined></v-text-field>

                    </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="showAddCustomerDialog = false" :disabled="newCustomerLoading">Cancel</v-btn>
            <v-btn color="primary" @click="saveNewCustomer" :loading="newCustomerLoading">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- End Add Customer Modal -->

      <!-- Held Sales Dialog -->
      <v-dialog v-model="heldSalesDialog" max-width="700">
        <v-card>
          <v-card-title class="headline">
            Held Sales
            <v-spacer></v-spacer>
            <v-btn icon @click="heldSalesDialog = false">
              <v-icon>close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <div v-if="heldSales.length === 0" class="text-center grey--text">No held sales.</div>
            <v-list two-line v-else>
              <v-list-item v-for="sale in heldSales" :key="sale.id">
                <v-list-item-content>
                  <v-list-item-title>
                    {{ sale.meta.customer_name || 'Walk-in Customer' }}
                    <span class="grey--text text--darken-1 ml-2">• {{
                        formatCurrency((sale.totals && sale.totals.totalPayable) || 0)
                      }}</span>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    Items: {{ (sale.items && sale.items.length) || 0 }} • Held at:
                    {{ new Date(sale.held_at).toLocaleString() }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn small color="success" class="mr-2" @click="resumeHeldSale(sale)">
                    <v-icon left>fa-play</v-icon>
                    Resume
                  </v-btn>
                  <v-btn small color="error" outlined @click="removeHeldSale(sale)">
                    <v-icon left>fa-trash</v-icon>
                    Remove
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-dialog>
      <!-- End Held Sales Dialog -->


    </v-row>
    <!-- Bottom section: two columns in one row -->
    <v-row class="mt-4">
      <!-- Left: Sales listing details -->
      <v-col cols="12" md="7">
        <!-- <v-card>
          <v-card-title class="py-2">Sales Listing Details</v-card-title>
          <v-card-text>
            <finance-cash-payments-listing :user_id="userId"></finance-cash-payments-listing>
          </v-card-text>
        </v-card> -->
      </v-col>
      <!-- Right: Current Shift card -->
      <v-col cols="12" md="5">
        <v-card>
          <v-card-title class="py-2 d-flex align-center">
            <span class="text-h6">Current Shift</span>
            <v-spacer></v-spacer>
         
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            
            <div class="mt-3">
              <v-btn color="warning" block @click="openPickupDialog" :disabled="!shiftOpen">Cash Pick Up</v-btn>
              <v-btn color="error" class="mt-2" block @click="openCloseShiftDialog" :disabled="!shiftOpen">Close Shift
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mt-4">
      <!-- Shift History Table -->
      <v-card class="mt-4" elevation="2">
        <v-card-title class="primary white--text">
          <v-icon color="white" class="mr-2">fa-history</v-icon>
          <span>Shift/Pickup History</span>
          <v-spacer></v-spacer>
          <v-text-field
              v-model="shiftHistorySearch"
              append-icon="mdi-magnify"
              label="Search"
              single-line
              hide-details
              clearable
              class="shift-history-search"
              @input="fetchShiftHistory()"
              @click:clear="fetchShiftHistory()"
          ></v-text-field>
        </v-card-title>
        <v-card-text>
          <v-data-table
              :headers="shiftHistoryHeaders"
              :items="shiftHistory"
              :loading="shiftHistoryLoading"
              :server-items-length="shiftHistoryTotalItems"
              :items-per-page.sync="shiftHistoryItemsPerPage"
              :page.sync="shiftHistoryPage"
              @update:page="handleShiftHistoryPageChange"
              @update:items-per-page="handleShiftHistoryItemsPerPageChange"
              :footer-props="{
              'items-per-page-options': [5, 10, 15, 25, 50],
              'show-current-page': true,
              'show-first-last-page': true
            }"
              class="elevation-1"
          >
            <template v-slot:item.amount="{ item }">
              <div class="text-right">
                {{ item.amount }}
              </div>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn
                  small
                  color="success"
                  class="mr-2"
                  @click="reprintShift(item)"
              >
                Reprint
              </v-btn>
            </template>


            <template v-slot:loading>
              <v-progress-linear
                  color="primary"
                  indeterminate
                  height="4"
              ></v-progress-linear>
            </template>

            <template v-slot:no-data>
              <div class="text-center py-4">
                <v-icon size="48" color="grey lighten-1">mdi-clock-outline</v-icon>
                <div class="subtitle-1 grey--text">No shift history found</div>
                <v-btn
                    color="primary"
                    small
                    class="mt-2"
                    @click="fetchShiftHistory"
                    :loading="shiftHistoryLoading"
                >
                  <v-icon left>mdi-refresh</v-icon>
                  Refresh
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
      <!-- End Shift History Table -->
    </v-row>
  </div>
</template>


<script>

import StoreProductSearch from "@inventory/components/StoreProductsSearch.vue";

import CustomStoreProductsSearch from "@inventory/components/CustomStoreProductsSearch.vue";

import SettingsOptions from '@settings/libs/SettingsOptions';

import GroupPos from "@evaluation/libs/groupPos/GroupPos";

import {mapActions, mapGetters} from "vuex";

import InfiniteLoading from 'vue-infinite-loading';

import SalesListingDetails from "@inventory/components/pos/partials/SalesListingDetails.vue";

import Payment from '@finance/libs/payments/Payment';

import CustomerFacingPos from "./CustomerFacingPos.vue";

import PaymentModal from "./PaymentModal.vue";
import CustomPosPatientSearch from "@reception/components/patients/CustomPosPatientSearch.vue";
import CustomPosUserSearch from "@reception/components/users/CustomPosUserSearch.vue";





export default {
  components: {

    SalesListingDetails,
    InfiniteLoading,

    StoreProductSearch,

    CustomStoreProductsSearch,

    CustomerFacingPos,


    PaymentModal,

    CustomPosPatientSearch,
    CustomPosUserSearch

  },

  props: [
    'posData', 'internal', 'userId'
  ],
  data() {
    return {
      // Shift history data
      shiftHistory: [],
      shiftHistoryLoading: false,
      shift_status_loading: false,
      shiftHistoryHeaders: [
        {text: 'Time', value: 'time'},
        {text: 'Type', value: 'type'},
        {text: 'Amount', value: 'amount', align: 'right'},
        {text: 'Confirmed By', value: 'confirmed_by'},
        {text: 'Actions', value: 'actions', sortable: false, align: 'center'},
      ],
      shiftHistoryPage: 1,
      shiftHistoryItemsPerPage: 10,
      shiftHistoryTotalItems: 0,
      shiftHistorySearch: '',
      sidebarColor: null,
      textColor: 'white',
      selectedItems: [],
      products: [],
      product: null,
      sidebar_products: [],
      station: null,
      groupPos: new GroupPos(),
      payment: new Payment(),
      visitId: null,
      showPaymentModal: false,
      selectedCustomerLoyalty: {eligible: false, balance: 0},
      patientClearSignal: 0,
      userClearSignal: 0,
      isStaff: false,
      isSubmitting: false,
      page: 1,
      loading: false,
      pesapal_loading: false,
      cash_loading: false,
      mpesa_loading: false,
      splitPayment: {
        rows: [
          {method: null, amount: 0}
        ],
        totalApplied: 0,
        remaining: 0,
        error: null,
        availableMethods: [
          {name: 'cash', label: 'Cash'},
          {name: 'mpesa', label: 'M-PESA'},
          {name: 'pesapal', label: 'Pesapal'},
          {name: 'card', label: 'Card'},
          {name: 'voucher', label: 'Voucher'},
          {name: 'giftcard', label: 'Gift Card'},
          {name: 'loyalty', label: 'Loyalty Points'},
          // add others here if enabled in your installation
        ],

      },
      // Recent offline Mpesa fetch state
      recentMpesa: [],
      recentMpesaLoading: false,
      recentMpesaError: null,
      // Notice messages when amounts are auto-adjusted to remaining payable
      clampNotice: {
        cash: '',
        mpesa: '',
        pesapal: '',
        card: '',
        cheque: '',
        voucher: '',
        giftcard: '',
        loyalty: ''
      },
        createInvoiceDialog: false,
        invoiceLoading: false,
        invoiceCreatedResponse: null,
      gift_card_loading: false,
      // Shift gating
      shiftOpen: false,
      shiftDialog: false,
      shiftLoading: false,
      shift: {opening_balance: 0, confirmed_by: '', confirmed_by_id: null},
      // Shift closing state
      closeShiftDialog: false,
      closeShift: {
        system_closing_balance: 0,
        cashier_closing_balance: 0,
        closing_variance: 0,
        close_confirmed_by_id: null,
        close_confirmed_by: '',
        mpesa_sales: 0,
        cash_sales: 0,
        card_sales: 0,
        cheque_sales: 0
      },
      // Cash pickup state
      pickupDialog: false,
      pickup: {totalcash: 0, cashier_id: null, picked_by_id: null},
      voucher_loading: false,
      // Guard to avoid duplicate notifications during payment polling
      paymentResultHandled: false,
      voucher_amount_high: false,
      perPage: 20,
      nextIndex: 0,
      socket: null,
      custom_payment: {
        cash: {
          amount: 0,
          received_amount: 0,
          change_amount: 0
        },
        mpesa: {
          code: '',
          mobile_number: '',
          amount: 0,
          amount_to_pay: 0,
        },
        pesapal: {
          email: '',
          amount: 0,
          mobile_number: '',
          transaction_id: null,
          code: ''
        },
        card: {
          type: '',
          number: '',
          name: '',
          valid_thru: '',
          amount: 0
        },
        cheque: {
          name: '',
          bank: '',
          date: '',
          branch: '',
          amount: 0,
          number: ''
        },
        voucher: {
          code: '',
          amount: 0
        },
        giftcard: {
          code: '',
          amount: 0
        },
        gift_card: {
          code: '',
          amount: 0
        },
        loyalty: {
          points: 0,
          amount: 0,
          available: 0,
          rate: 0,
          value: 0
        }
      },
      paymentProcessing: false,
      paymentModes: [
        {name: 'cash', label: 'Cash', active: true},
        {name: 'mpesa', label: 'M-PESA', active: true},
        {name: 'pesapal', label: 'Pesapal', active: true},
        {name: 'card', label: 'Credit Card', active: true},
        {name: 'cheque', label: 'Cheque', active: true},
        {name: 'voucher', label: 'Voucher', active: true},
        {name: 'giftcard', label: 'Gift Card', active: true},
        {name: 'loyalty', label: 'Loyalty Points', active: true}
      ],
      giftCardAccount: null,
      giftCardAmountValue: 0,
      voucherAccount: null,
      voucherAmountValue: 0,
      showVoucherInput: false,
      manualVoucherCode: '',
      showGiftCardInput: false,
      manualGiftCardCode: '',
      showPesapalIframe: false,
      pesapal_order_mobile_number: null,
      pesapal_data: null,
      // Reference to a pre-opened print window to avoid popup blockers in kiosk mode
      printWindowRef: null,
      selectedStoreId: null,
      stores: [],
      staff: [],
      staffLoading: false,
      // Current Shift card summary
      currentShiftCard: {
        cashier_name: '',
        opened_at: null,
        opening_balance: 0,
        confirmed_by: '',
        confirmed_by_id: null,
        total_sales: 0,
        cash_sales: 0,
        mpesa_sales: 0,
        card_sales: 0,
        total_pickups: 0,
        cash_at_hand: 0,
        cashier_closing_balance: 0,
        system_closing_balance: 0,
      },
      // Organization data for headers
      organization: {
        name: '',
        logo: '',
        address: '',
        phone: '',
        email: ''
      },
      barcode: '',
      scannedBarcode: '',
      // Inline name search support
      searchResults: [],
      selectedSearchIds: [],
      searchLoading: false,
      productSearchTerm: '',
      showInlineSearchMenu: false,
      // Autocomplete (live search) state
      autocompleteItems: [],
      selectedAutocomplete: [],
      // Inline search UX control
      autocompleteDebounce: null,
      invoiceSelectAll: false,
    invoiceSelectedIds: [],
      autocompleteRequestSeq: 0, // monotonically increases to invalidate stale responses
      selectionLocked: false, // set to true immediately after selecting a product to suppress further calls
      headers: [
        {
          text: '#',
          value: 'index',
          class: 'text-center',
          width: '5%',
        },
        {
          text: '',
          value: 'photo_url',
          class: 'text-center',
          width: '20%',
        },
        {
          text: 'Product',
          value: 'product',
          class: 'text-center',
          width: '35%',
        },
        {text: 'Qty', value: 'quantity', class: 'text-center', width: '30%'},
        {text: 'Price (Inc. Tax)', value: 'price', class: 'text-center', width: '25%'},
        {text: 'Subtotal', value: 'subtotal', class: 'text-center', width: '15%'},
        {text: 'Actions', value: 'actions', class: 'text-center', sortable: false, width: '5%'}
      ],
      totals: {
        subtotal: 0,
        discount: 0,
        tax: 0,
        totalPayable: 0,
      },
      selectedCustomerId: '',
      // Add Customer modal state
      showAddCustomerDialog: false,
      newCustomer: {first_name: '', middle_name: '', last_name: '', phone: '', kra_pin_number: '', gender: ''},
      newCustomerLoading: false,
      activeTab: 'sales-listing',
      paymentCheckDialog: false,
      waitingPanelsInternal: [0],
      actions: [
        {
          name: 'Sales Listing',
          url: 'sales-listing',
          internal: false,
          permission: 'inventory.receive-pos-payments',
        },
        {
          name: 'Sales details',
          url: 'sales-listing-details',
          internal: true,
          permission: 'inventory.receive-pos-payments'
        }
      ],

      options: new SettingsOptions(),

      customers: [
        {id: 1, name: 'Walk-in Customer', balance: 0},
        {id: 2, name: 'Jane Doe', balance: 45},
        {id: 3, name: 'John Smith', balance: -20},
      ],
      defaultLocation: true, // mock condition
      searchTerm: '',
      posSettings: {
        enable_weighing_scale: true
      },
      canAddCustomer: true,
      // paymentModes duplicated below; keeping the more detailed definition above
      // paymentModes: [
      //   {name: 'cash', label: 'Cash', active: true},
      //   {name: 'mpesa', label: 'Mpesa', active: true},
      //   {name: 'pesapal', label: 'Pesapal', active: true},
      //   {name: 'giftcard', label: 'Gift Card', active: true},
      //   {name: 'voucher', label: 'Voucher', active: true},
      //   {name: 'loyalty', label: 'Loyalty Points', active: true}
      // ],
      selectedPaymentPanel: 0,
      // Held sales state
      heldSalesDialog: false,
      heldSales: [],
      customerDisplayId: (function () {
        let id = localStorage.getItem("pos_device_id");
        if (!id) {
          id = "pos-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
          localStorage.setItem("pos_device_id", id);
        }
        return id;
      })(),
      customerDisplayKey: 0, // Used to force re-render of customer display
      showCustomerPosDialog: false,

    };
  },
  computed: {
    canApplyLoyalty() {
      const pts = Number(this.custom_payment.loyalty.points || 0);
      const rate = Number(this.custom_payment.loyalty.rate || 0);
      if (!rate || pts <= 0) return false;
      if (pts > Number(this.custom_payment.loyalty.available || 0)) return false;
      const value = pts * rate;
      return value >= 0 && value <= Number(this.totals.totalPayable || 0);
    },
    heldSalesCount() {
      return Array.isArray(this.heldSales) ? this.heldSales.length : 0;
    },
    // For v-autocomplete, use a consistent value field
    itemValueKey() {
      return 'id';
    },
    ...mapGetters([
      'getStoreProducts',
    ]),
    ...mapActions([
      'setStoreProducts',
    ]),
    initialized() {
      return this.options.configurations != null && this.station;
    },
    hasZeroPriceItems() {
      return this.selectedItems.some(item => Number(item.price || 0) === 0);
    },
    hasZeroLineTotalItems() {
      return this.selectedItems.some(item => {
        const lineTotal = item.quantity * item.price;
        return Number(lineTotal) === 0;
      });
    },
    areOtherPaymentsDisabled() {
      const payable = Number(this.totals?.totalPayable || 0);
      if (payable <= 0) return false;
      // Remaining before applying cash (i.e., what cash would need to cover)
      let remainingBeforeCash = 0;
      try {
        if (typeof this.remainingFor === 'function') {
          remainingBeforeCash = Number(this.remainingFor('cash') || 0);
        } else {
          // Fallback compute if remainingFor is unavailable
          const amounts = {
            mpesa: parseFloat(this.custom_payment?.mpesa?.amount || 0),
            pesapal: parseFloat(this.custom_payment?.pesapal?.amount || 0),
            card: parseFloat(this.custom_payment?.card?.amount || 0),
            cheque: parseFloat(this.custom_payment?.cheque?.amount || 0),
            voucher: parseFloat(this.custom_payment?.voucher?.amount || 0),
            giftcard: parseFloat(this.custom_payment?.gift_card?.amount || 0),
            loyalty: parseFloat((this.custom_payment?.loyalty && (this.custom_payment.loyalty.value || this.custom_payment.loyalty.amount)) || 0)
          };
          let others = 0;
          Object.keys(amounts).forEach(k => {
            others += amounts[k] || 0;
          });
          remainingBeforeCash = Math.max(0, payable - others);
        }
      } catch (e) {
        remainingBeforeCash = Math.max(0, payable);
      }

      const cashInput = Number(this.custom_payment?.cash?.amount || this.custom_payment?.cash?.received_amount || 0);
      const cashApplicable = Math.min(Math.max(0, cashInput), remainingBeforeCash);
      return (remainingBeforeCash - cashApplicable) <= 0;
    }
  },
  watch: {
    'totals.totalPayable': {
      handler() {
        this.recalculateSplitTotals();
      },
      immediate: true
    },

    internal(val) {
      this.posData.internal = val;
    },

    posData(val) {
      if (val) {
        this.station = JSON.parse(val);
        if (this.station.customer_type) {
          this.customerTypes = JSON.parse(this.station.customer_type);
        }
      }
    },
    productSearchTerm(val) {
      // Debounce-like simple guard: fetch only if not in dialog and term length >=2
      try {
        const term = (val || '').trim();
        if (term.length >= 2) {
          this.fetchAutocompleteItems(term);
        } else if (term.length === 0) {
          this.autocompleteItems = [];
        }
      } catch (e) {
        // no-op
      }
    },
    selectedItems: {
      handler() {
        this.updateTotals();
      },
      deep: true
    },
    areOtherPaymentsDisabled(val) {
      if (val) {
        this.selectedPaymentPanel = 0;
      }
    },

    getStoreProducts({data}) {
      this.loading = false;
      this.sidebar_products = data;
    },

    paymentCheckDialog(val) {
      if (val) {
        this.waitingPanelsInternal = [0];
      }

    },

    isStaff(val) {
      // Clear relevant selections and set type when toggling
      if (val) {
        // Switching to staff: clear patient selection and loyalty
        if (this.groupPos && this.groupPos.pos_data && this.groupPos.pos_data.customer_data) {
          this.groupPos.pos_data.customer_data.patient_id = null;
          this.groupPos.pos_data.customer_data.type = 'staff';
        }
        this.selectedCustomerLoyalty.eligible = false;
        this.selectedCustomerLoyalty.balance = 0;
        this.custom_payment.loyalty.available = 0;
        this.custom_payment.loyalty.rate = 0;
        this.custom_payment.loyalty.points = 0;
        this.custom_payment.loyalty.value = 0;
        this.custom_payment.loyalty.amount = 0;

        this.patientClearSignal++;
        if (this.$refs && this.$refs.patientSearch && typeof this.$refs.patientSearch.selectionCleared === 'function') {
          try {
            this.$refs.patientSearch.selectionCleared();
          } catch (e) {
          }
        }
      } else {
        // Switching to customer: clear staff selection
        if (this.groupPos && this.groupPos.pos_data && this.groupPos.pos_data.customer_data) {
          this.groupPos.pos_data.customer_data.staff_id = null;
          this.groupPos.pos_data.customer_data.type = 'existing_patient';
        }
        this.userClearSignal++;
        if (this.$refs && this.$refs.userSearch && typeof this.$refs.userSearch.selectionCleared === 'function') {
          try {
            this.$refs.userSearch.selectionCleared();
          } catch (e) {
          }
        }
      }
    }
  },

    // filepath:
  // ...existing code...
  methods: {
    // ...existing methods...

    isCorporatePayload(payload) {
      if (!payload) return false;
      const raw =  payload;
      return !!(raw.corporate_account || raw.corporate || raw.is_corporate || raw.isCorporate);
    },

    getCorporateIdFromPayload(payload) {
      if (!payload) return null;
      const raw = payload.raw || payload;
      return raw?.corporate_account?.id || raw?.corporate?.id || payload?.corporate_account_id || null;
    },

    openCreateInvoiceDialog() {
        // only for staff flow
        if (!this.isStaff) {
          this.$swal && this.$swal({ title: 'Not Staff', text: 'Switch to Staff to create an invoice for a staff member.', icon: 'warning' });
          return;
        }

        const staffId = this.groupPos?.pos_data?.customer_data?.staff_id || null;
        if (!staffId) {
          this.$swal && this.$swal({ title: 'No Staff Selected', text: 'Please select a staff member first.', icon: 'warning' });
          return;
        }

        if (!Array.isArray(this.selectedItems) || this.selectedItems.length === 0) {
          this.$swal && this.$swal({ title: 'Empty Cart', text: 'Add items to cart before creating an invoice.', icon: 'warning' });
          return;
        }
       this.invoiceSelectedIds = this.selectedItems.map((it, idx) => (it.id !== undefined ? it.id : (it.product_id !== undefined ? it.product_id : idx)));
       this.invoiceSelectAll = true;
        this.createInvoiceDialog = true;
      },
  async createInvoice() {
        const staffId = this.groupPos?.pos_data?.customer_data?.staff_id || null;
        if (!staffId) {
          this.$swal && this.$swal({ title: 'No Staff Selected', text: 'Please select a staff member first.', icon: 'warning' });
          return;
        }
        // derive items to invoice from user selection
        const chosen = (Array.isArray(this.selectedItems) ? this.selectedItems : []).filter((it, idx) => {
          const key = (it.id !== undefined ? it.id : (it.product_id !== undefined ? it.product_id : idx));
          return this.invoiceSelectedIds.includes(key);
        });
        if (!chosen.length) {
          this.$swal && this.$swal({ title: 'No items selected', text: 'Select at least one item to invoice.', icon: 'warning' });
          return;
        }



        try {
          this.invoiceLoading = true;

          // Build payload: minimal structure (backend may expect different fields — adjust if needed)
                   const payload = {
            items: chosen.map(it => ({
              id: it.id ,
              product_id: it.product_id ?? null,
              name: it.product ?? it.name,
              quantity: Number(it.quantity || 1),
              price: Number(it.price || 0)
            })),
            invoice_total:this.totals.subtotal,
            totals: this.totals,
            staff_id: staffId
          };

          const resp = await axios.post('/finance/cash/invoiced/action/store-invoice', payload);

          const data = resp && resp.data ? resp.data : {};
          if (data.data === "Action successfully completed") {
                  this.invoiceCreatedResponse = data;
                  this.createInvoiceDialog = false;

                  this.$swal && this.$swal({
                    title: 'Invoice Created',
                    text: 'Invoice created successfully',
                    icon: 'success'
                  });

                  // If backend returned a URL for printing or viewing, open it
                  const printUrl = data.url || data.redirect_url || (data.data && data.data.url);
                  if (printUrl) {
                    window.open(printUrl, '_blank');
                  }

                  // Clear cart and UI
                  this.selectedItems = [];
                  if (this.groupPos && typeof this.groupPos.clearItems === 'function') {
                    this.groupPos.clearItems();
                  } else if (this.groupPos && this.groupPos.pos_data) {
                    this.groupPos.pos_data.items = [];
                   this.groupPos.pos_data.drugs = [];

                  }

                  if (Array.isArray(this.selectedAutocomplete)) this.selectedAutocomplete = [];
                  if (Array.isArray(this.selectedSearchIds)) this.selectedSearchIds = [];

                  if (typeof this.clearCustomerAfterSale === 'function') {
                    this.clearCustomerAfterSale();
                  } else if (this.groupPos && this.groupPos.pos_data && this.groupPos.pos_data.customer_data) {
                    this.groupPos.pos_data.customer_data.type = null;
                  }

                  this.updateTotals();
                  await this.fetchShiftStatus();
                  this.reloadSalesDetails();

            } else {
              // Response did NOT match expected success
              const msg = data.message || 'Invoice not created successfully';
              this.$swal && this.$swal({ title: 'Error', text: msg, icon: 'error' });
            }

        } catch (e) {
          console.error('Create invoice failed', e);
          const msg = (e && e.response && (e.response.data?.message || e.response.data?.error)) || e.message || 'Failed to create invoice';
          this.$swal && this.$swal({ title: 'Error', text: msg, icon: 'error' });
        } finally {
          this.invoiceLoading = false;
                   this.invoiceSelectedIds = [];
         this.invoiceSelectAll = false;
        }
      },
    openAddCustomerDialog() {

      this.newCustomer = {
        first_name: '',
        middle_name: '',
        last_name: '',
        phone: '',
        kra_pin_number: '',
        gender: '',
        corporate: {
          kra_pin_certificate: '',
          procurement_officer_name: '',
          procurement_officer_phone: '',
          procurement_officer_email: '',
          credit_days: 0,
          credit_limit: 0
        }
      };

      this.showAddCustomerDialog = true;

    },

    toggleGiftCardInput() {
      this.showGiftCardInput = true;
    },
    async saveNewCustomer() {
      try {
        if (!this.newCustomer.first_name || !this.newCustomer.last_name || !this.newCustomer.phone || !this.newCustomer.gender) {
          if (this.$swal) {
            this.$swal({title: 'Missing info', text: 'First name, last name and phone are required.', icon: 'warning'});
          }
          return;
        }
        this.newCustomerLoading = true;
        const payload = {
          profile: {
            first_name: this.newCustomer.first_name,
            middle_name: this.newCustomer.middle_name,
            last_name: this.newCustomer.last_name,
            mobile: this.newCustomer.phone,
            kra_pin_number: this.newCustomer.kra_pin_number || null,
            sex: this.newCustomer.gender
          },
          // age: 1,
          // age_in: 'years'
        };
        const resp = await window.axios.post('/api/reception/patients', payload);
        const data = (resp && resp.data && (resp.data.data || resp.data)) || {};
        const customerId = data.id || data.patient_id || data.patient?.id || null;


        this.selectedCustomerId = customerId;


        try {
          await this.fetchLoyaltyInfo(patientId);
        } catch (e) { /* no-op */
        }
        this.showAddCustomerDialog = false;

        // Emit event with the new patient data
        this.$root.$emit('patient-created', {
          id: customerId,
          full_name: payload.profile.first_name + " " + payload.profile.middle_name + " " + payload.profile.last_name,
          ...data
        });

        if (this.$swal) {
          this.$swal({title: 'Success', text: 'Customer added successfully', icon: 'success'});
        }
      } catch (e) {
        console.error('Failed to add customer', e);
        const msg = (e && e.response && (e.response.data?.message || e.response.data?.error)) || e.message || 'Failed to add customer';
        if (this.$swal) {
          this.$swal({title: 'Error', text: msg, icon: 'error'});
        }
      } finally {
        this.newCustomerLoading = false;
      }
    },
        toggleInvoiceSelectAll(val) {
      if (val) {
        this.invoiceSelectedIds = this.selectedItems.map((it, idx) => (it.id !== undefined ? it.id : (it.product_id !== undefined ? it.product_id : idx)));
      } else {
        this.invoiceSelectedIds = [];
      }
    },
    addSplitRow() {
      this.splitPayment.rows.push({method: null, amount: 0});
      this.recalculateSplitTotals();
    },
    removeSplitRow(idx) {
      if (this.splitPayment.rows.length > 1) {
        this.splitPayment.rows.splice(idx, 1);
        this.recalculateSplitTotals();
      }
    },
    onSplitMethodChanged(idx) {
      // clear errors upon method change if any validation depends on it
      this.splitPayment.error = null;
    },
    recalculateSplitTotals() {
      const total = Number(this.totals?.totalPayable || 0);
      const applied = this.splitPayment.rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);
      this.splitPayment.totalApplied = applied;
      this.splitPayment.remaining = Number((total - applied).toFixed(2));
      this.splitPayment.error = null;
    },

    // Force-refresh the Current Shift card UI after status changes
    refreshCurrentShiftCard() {
      try {
        // Ensure derived fields are consistent
        const data = this.currentShiftCard || {};
        const totalSales = Number(data.total_sales || (Number(data.cash_sales || 0) + Number(data.mpesa_sales || 0) + Number(data.card_sales || 0)));
        const cashAtHand = Number(data.cash_at_hand || (Number(data.opening_balance || 0) + Number(data.cash_sales || 0) - Number(data.total_pickups || 0)));
        this.currentShiftCard.total_sales = totalSales;
        this.currentShiftCard.cash_at_hand = cashAtHand;

        // Nudge Vue reactivity for nested object updates
        this.currentShiftCard = {...this.currentShiftCard};
      } catch (e) { /* no-op */
      }
    },
    // Fetch shift history
    async fetchShiftHistory() {
      try {
        this.shiftHistoryLoading = true;
        // First, fetch shifts
        const shiftResponse = await this.$http.get('/api/reception/shift/history', {
          params: {
            page: this.shiftHistoryPage,
            per_page: this.shiftHistoryItemsPerPage,
            search: this.shiftHistorySearch,
            with_pickups: 1, // Request pickups to be included
          },
        });

        // Transform the data for display
        this.shiftHistory = [];

        // Process shifts and pickups
        if (shiftResponse.data && shiftResponse.data.data) {
          shiftResponse.data.data.forEach(shift => {
            // Add shift opening
            this.shiftHistory.push({
              id: shift.id,
              time: new Date(shift.opened_at).toLocaleString(),
              type: 'Shift Opened',
              amount: shift.opening_balance ? this.formatCurrency(shift.opening_balance) : 'N/A',
              confirmed_by: shift.confirmed_by || 'N/A',
              raw_amount: shift.opening_balance || 0,
              timestamp: new Date(shift.opened_at).getTime(),
              shift_id: shift.id,
              is_shift: true,
            });

            // Add pickups if they exist
            if (shift.pickups && shift.pickups.length > 0) {
              shift.pickups.forEach(pickup => {
                this.shiftHistory.push({
                  id: `pickup-${pickup.id}`,
                  time: new Date(pickup.pickup_time).toLocaleString(),
                  type: 'Cash Pickup',
                  amount: pickup.amount ? this.formatCurrency(pickup.amount) : 'N/A',
                  confirmed_by: pickup.confirmed_by || 'N/A',
                  raw_amount: pickup.amount || 0,
                  timestamp: new Date(pickup.pickup_time).getTime(),
                  shift_id: shift.id,
                  is_pickup: true,
                  pickup_data: pickup
                });
              });
            }

            // Add shift closing if exists
            if (shift.closed_at) {
              this.shiftHistory.push({
                id: `close-${shift.id}`,
                time: new Date(shift.closed_at).toLocaleString(),
                type: 'Shift Closed',
                amount: shift.cashier_closing_balance !== null ? this.formatCurrency(shift.cashier_closing_balance) : 'N/A',
                confirmed_by: shift.close_confirmed_by || 'N/A',
                raw_amount: shift.cashier_closing_balance || 0,
                timestamp: new Date(shift.closed_at).getTime(),
                shift_id: shift.id,
                is_shift: true,
              });
            }
          });
        }

        // Sort by timestamp (newest first)
        this.shiftHistory.sort((a, b) => b.timestamp - a.timestamp);

        this.shiftHistoryTotalItems = shiftResponse.data?.total || 0;
      } catch (error) {
        console.error('Error fetching shift history:', error);
      } finally {
        this.shiftHistoryLoading = false;
      }
    },

    // Handle page change for shift history pagination
    handleShiftHistoryPageChange(page) {
      this.shiftHistoryPage = page;
      this.fetchShiftHistory();
    },

    // Handle items per page change
    handleShiftHistoryItemsPerPageChange(itemsPerPage) {
      this.shiftHistoryItemsPerPage = itemsPerPage;
      this.shiftHistoryPage = 1; // Reset to first page
      this.fetchShiftHistory();
    },

    // Print shift report
    printShiftReport(shiftId) {
      window.open(`/reception/shift/${shiftId}/print`, '_blank');
    },
    // Reprint shift report
    // Reprint shift report
    async reprintShift(item) {
      try {
        if (item.type === 'Shift Closed') {
          // Fetch shift data for snapshot
          const resp = await axios.get(`/api/reception/shift/${item.shift_id}`);
          const shiftData = resp?.data?.data || {};

          const snapshot = {
            system_closing_balance: Number(shiftData.system_closing_balance || 0),
            cashier_closing_balance: Number(shiftData.cashier_closing_balance || 0),
            difference: Number(
                (shiftData.cashier_closing_balance || 0) - (shiftData.system_closing_balance || 0)
            ),
            total_cash_sales: Number(shiftData.total_cash || 0),
            total_mpesa_sales: Number(shiftData.total_mpesa || 0),
            total_card_sales: Number(shiftData.total_card || 0),
            total_cheque_sales: Number(shiftData.total_cheque || 0),
            total_pickups: Number(shiftData.pickups_total || 0),
            opening_balance: Number(shiftData.opening_balance || 0),
            close_confirmed_by: shiftData.confirmer_name
                || 'N/A',
            cashier_name: shiftData.cashier_name
                || 'N/A',
          };

          this.printShiftClosing(snapshot);

        } else {
          // Default: opening report
          await this.printShiftOpening(item.shift_id);
        }
      } catch (error) {
        console.error('Error reprinting shift:', error);

      }
    },

    formatDateTime(dt) {
      try {
        if (!dt) return '';
        const d = new Date(dt);
        if (isNaN(d.getTime())) return String(dt);
        return d.toLocaleString();
      } catch (e) {
        return String(dt || '');
      }
    },
    async fetchRecentMpesaPayments() {
      try {
        this.recentMpesaError = null;
        this.recentMpesaLoading = true;
        // Build params using total payable precedence for matching
        const params = {
          expected_total: Number(this.totals?.totalPayable || 0),
          since_minutes: 10,
          limit: 2000,
          tolerance: 0
        };
        const resp = await axios.get('/api/finance/mpesa/recent-payments', {params});
        if (resp && resp.data && resp.data.status === 'ok') {
          this.recentMpesa = Array.isArray(resp.data.data) ? resp.data.data : [];
        } else {
          this.recentMpesa = [];
          this.recentMpesaError = 'No recent M-PESA payments found';
        }
      } catch (e) {
        const msg = (e && e.response && (e.response.data?.message || e.response.data?.error)) || e.message || 'Failed to fetch recent payments';
        this.recentMpesaError = msg;
        this.recentMpesa = [];
      } finally {
        this.recentMpesaLoading = false;
      }
    },
    useRecentMpesaPayment(item) {
      try {
        if (!item) return;
        const remaining = Number(this.totals?.totalPayable || 0);
        const amt = Number(item.amount || 0);
        // auto-fill manual entry fields
        this.custom_payment.mpesa.code = item.reference || '';
        this.custom_payment.mpesa.amount = Math.min(amt, remaining);
        // Focus Save action remains with user as per manual entry flow
        // this.$toast && this.$toast.success && this.$toast.success('M-PESA transaction selected and filled. Review amount and click Save.');
      } catch (e) { /* no-op */
      }
    },
    async fetchShiftStatus() {
      try {
        this.shiftLoading = true;
        this.shift_status_loading = true;
        const resp = await axios.get('/api/reception/shift/status');
        const data = resp && resp.data ? resp.data : {};
        const isOpen = !!data.is_open_today;
        this.shiftOpen = isOpen;
        this.shiftDialog = !isOpen;
        if (isOpen) {
          this.shift.opening_balance = data.opening_balance || 0;
          this.shift.confirmed_by = data.confirmed_by || '';
          this.shift.confirmed_by_id = data.confirmed_by_id || null;
        }
        // preload closing info
        this.closeShift.system_closing_balance = Number(data.system_closing_balance || 0);
        this.closeShift.cashier_closing_balance = Number(data.cashier_closing_balance || 0);
        this.closeShift.closing_variance = Number(data.closing_variance || (this.closeShift.cashier_closing_balance - this.closeShift.system_closing_balance) || 0);
        this.closeShift.close_confirmed_by_id = data.close_confirmed_by_id || null;
        this.closeShift.close_confirmed_by = data.close_confirmed_by || null;
        this.closeShift.opening_balance = data.opening_balance || null;

        // Also store sales breakdown for printing
        this.closeShift.cash_sales = Number(data.cash_sales || 0);
        this.closeShift.mpesa_sales = Number(data.mpesa_sales || 0);
        this.closeShift.card_sales = Number(data.card_sales || 0);
        this.closeShift.total_sales = Number(
            data.total_sales ||
            (this.closeShift.cash_sales + this.closeShift.mpesa_sales + this.closeShift.card_sales)
        );
        this.closeShift.total_pickups = Number(data.pickups_total || 0);
        this.closeShift.cash_at_hand = Number(
            data.cash_at_hand ||
            (this.closeShift.opening_balance + this.closeShift.cash_sales - this.closeShift.total_pickups)
        );
        // Populate Current Shift card
        const staffRec = (this.staff || []).find(u => Number(u.id) === Number(this.userId));
        this.currentShiftCard.cashier_name = staffRec ? staffRec.full_name : '';
        this.currentShiftCard.opened_at = data.opened_at || null;
        this.currentShiftCard.opening_balance = Number(data.opening_balance || 0);
        this.currentShiftCard.confirmed_by = data.confirmed_by || '';
        this.currentShiftCard.confirmed_by_id = data.confirmed_by_id || null;
        this.currentShiftCard.cash_sales = Number(data.cash_sales || 0);
        this.currentShiftCard.mpesa_sales = Number(data.mpesa_sales || 0);
        this.currentShiftCard.card_sales = Number(data.card_sales || 0);
        this.currentShiftCard.total_sales = Number(data.total_sales || (this.currentShiftCard.cash_sales + this.currentShiftCard.mpesa_sales + this.currentShiftCard.card_sales));
        this.currentShiftCard.total_pickups = Number(data.pickups_total || 0);
        this.currentShiftCard.cash_at_hand = Number(data.cash_at_hand || (this.currentShiftCard.opening_balance + this.currentShiftCard.cash_sales - this.currentShiftCard.total_pickups));
        this.currentShiftCard.cashier_closing_balance = Number(data.cashier_closing_balance || 0);
        this.currentShiftCard.system_closing_balance = Number(data.system_closing_balance || 0);

      } catch (e) {
        // If status fails, default to blocking until manually opened
        this.shiftOpen = false;
        this.shift_status_loading = false;

        this.shiftDialog = true;
      } finally {
        this.shiftLoading = false;
        this.shift_status_loading = false;

      }
    },
    async refreshShiftUi() {
      // Reload shift history to reflect any new totals/pickups
      await this.fetchShiftHistory();
      // Fetch latest status and then refresh dependent UI sections
      this.refreshCurrentShiftCard();

    },
    async openShift() {
      try {
        if (Number(this.shift.opening_balance) < 0 || isNaN(Number(this.shift.opening_balance))) {
          alert('Enter a valid opening balance');
          return;
        }
        if (!this.shift.confirmed_by_id) {
          alert('Please select who confirmed opening the shift');
          return;
        }
        this.shiftLoading = true;
        const payload = {
          opening_balance: Number(this.shift.opening_balance || 0),
          confirmed_by: this.shift.confirmed_by || '',
          confirmed_by_id: this.shift.confirmed_by_id
        };
        const resp = await axios.post('/api/reception/shift/open', payload);
        if (resp && resp.data && (resp.status === 200 || resp.status === 201)) {
          this.shiftOpen = true;
          this.shiftDialog = false;
          // refresh current shift card
          await this.refreshShiftUi();
          // Optionally print after open
          // this.printShiftOpening();
        }
      } catch (e) {
        const msg = (e.response && e.response.data && (e.response.data.message || e.response.data.error)) || 'Failed to open shift';
        alert(msg);
      } finally {
        this.shiftLoading = false;
      }
    },
    async logoutUser() {
      try {
        this.shiftLoading = true;
        await axios.post(route("public.logout"));
        this.user = null;
        //send   a  request to clear the cart on customer facing pos..
        if (this.socket && this.customerDisplayId) {
          this.socket.emit('pos-clear-cart', {displayId: this.customerDisplayId});
        }
        alert("You have been logged out successfully.");
      } catch (e) {
        console.warn("Logout request failed, ignoring:", e);
      } finally {
        try {
          localStorage.removeItem("immigrant");
        } catch (e) {
        }
      }

      window.location.reload(true);

    },
    async openAndPrintShift() {
      try {
        await this.openShift();
        if (this.shiftOpen) {
          await this.printShiftOpening();
        }
      } catch (e) { /* no-op */
      }
    },
    async closeAndPrintShift() {

      try {
        const ok = await this.submitCloseShift();
        if (ok) {
          await this.fetchShiftStatus();
          // capture values before submit (in case state resets)
          const snapshot = {
            shift_id: this.currentShiftCard?.shift_id || this.closeShift.shift_id || 'N/A',
            cashier_name: this.closeShift.cashier_name || this.currentShiftCard?.cashier_name || '',
            system_closing_balance: Number(this.closeShift.system_closing_balance || 0),
            cashier_closing_balance: Number(this.closeShift.cashier_closing_balance || 0),
            difference: Number(
                (this.closeShift.cashier_closing_balance || 0) -
                (this.closeShift.system_closing_balance || 0)
            ),
            total_cash_sales: Number(this.closeShift.cash_sales || 0),
            total_mpesa_sales: Number(this.closeShift.mpesa_sales || 0),
            total_card_sales: Number(this.closeShift.card_sales || 0),
            total_cheque_sales: Number(this.closeShift.cheque_sales || 0),
            total_pickups: Number(this.closeShift.total_pickups || 0),
            close_confirmed_by: this.closeShift.close_confirmed_by || '',
            opening_balance: Number(this.closeShift.opening_balance || 0),

          };

          this.printShiftClosing(snapshot);
        }
      } catch (e) { /* no-op */
      }
    },
    printShiftClosing(snapshot) {
      try {
        const w = window.open('', 'shift-close', 'width=400,height=800');
        if (!w) return;

        const currentDate = new Date().toLocaleString();
        const shift = this.currentShiftCard;

        // Get the snapshot data or use current shift data
        const data = snapshot;
        const fmt = (n) => this.formatCurrency(Number(n || 0));

        const content = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Shift Closing</title>
            <style>
              @page { size: auto; margin: 5mm; }
              body { font-family: Arial, sans-serif; padding: 10px; font-size: 12px; }
              .header { text-align: center; margin-bottom: 10px; }
              .logo { max-width: 150px; max-height: 80px; margin-bottom: 5px; }
              .title { font-size: 16px; font-weight: bold; margin: 5px 0; }
              .subtitle { font-size: 12px; margin: 3px 0; }
              .divider { border-top: 1px dashed #000; margin: 10px 0; }
              .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
              .label { font-weight: bold; }
              .section { margin: 10px 0; }
              .section-title { font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #eee; padding-bottom: 3px; }
              .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
              .signature { width: 45%; text-align: center; }
              .signature-line { border-top: 1px solid #000; margin: 5px auto; width: 100%; }
              .center { text-align: center; }
              .footer { margin-top: 20px; font-size: 10px; text-align: center; }
              .red--text { color: red; }
            </style>
          </head>
          <body onload="window.print();">
            <div class="header">
              ${this.organization.receipt_logo ? `<img src="${this.organization.receipt_logo}" class="logo" alt="Company Logo">` : ''}
              <div class="title">SHIFT CLOSING REPORT</div>
              <div class="subtitle">${this.organization.name || 'ORGANIZATION'}</div>
              <div class="subtitle">${this.station?.name || 'POS TERMINAL'}</div>
              <div class="subtitle">${this.station?.location || ''}</div>
              ${this.organization.address ? `<div class="subtitle">${this.organization.address}</div>` : ''}
              ${this.organization.phone ? `<div class="subtitle">Tel: ${this.organization.phone}</div>` : ''}
            </div>

            <div class="divider"></div>

            <div class="row">
              <span class="label">Date/Time:</span>
              <span>${currentDate}</span>
            </div>

            <div class="row">
              <span class="label">Cashier:</span>
              <span>${data?.cashier_name || ''}</span>
            </div>

            <div class="divider"></div>

          <div class="section">
            <div class="section-title">BALANCES</div>
            <div class="row"><span>Opening Balance:</span><span>${fmt(data.opening_balance)}</span></div>
            <div class="row"><span>Cashier Closing Balance:</span><span>${fmt(data.cashier_closing_balance)}</span></div>
            <div class="row"><span>System Closing Balance:</span><span>${fmt(data.system_closing_balance)}</span></div>
                        <div class="row"><span>Difference:</span><span>${fmt(data.difference)}</span></div>

          </div>


            <div class="divider"></div>

            <div class="section">
              <div class="section-title">SALES SUMMARY</div>
              <div class="row">
                <span>Total Cash Sales:</span>
                <span>${this.formatCurrency(data.total_cash_sales)}</span>
              </div>
              <div class="row">
                <span>Total M-Pesa Sales:</span>
                <span>${this.formatCurrency(data.total_mpesa_sales)}</span>
              </div>
              <div class="row">
                <span>Total Card Sales:</span>
                <span>${this.formatCurrency(data.total_card_sales)}</span>
              </div>
              <div class="row">
                <span>Total Cheque Sales:</span>
                <span>${this.formatCurrency(data.total_cheque_sales)}</span>
              </div>
              <div class="row">
                <span>Total Cash Pickups:</span>
                <span>${this.formatCurrency(data.total_pickups)}</span>
              </div>
            </div>

            <div class="signature-section">
              <div class="signature">
                <div class="signature-line"></div>
                <div>Cashier:</div>
                <div>${data?.cashier_name || ''}</div>
                <div>${currentDate}</div>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <div>Confirmed By:</div>
                <div>${data?.close_confirmed_by || ''}</div>
                <div>${currentDate}</div>
              </div>
            </div>

            <div class="footer">
              <div>${this.organization.name || ''} - ${new Date().getFullYear()}</div>
            </div>
          </body>
          </html>
        `;

        w.document.open();
        w.document.write(content);
        w.document.close();
        w.focus();
      } catch (e) {
        console.error('Error printing shift closing:', e);

      }
    },

    async printShiftOpening(shiftId = null) {
      try {
        const w = window.open('', 'shift-open', 'width=400,height=800');
        if (!w) return;

        const currentDate = new Date().toLocaleString();
        await this.fetchShiftStatus()
        let shift = this.currentShiftCard || {};

        // Default values
        let cashierName = shift.cashier_name || 'N/A';
        let confirmerName = shift.confirmed_by || 'N/A';
        let openedAt = shift.opened_at ? new Date(shift.opened_at).toLocaleString() : currentDate;

        // If shiftId provided, fetch data
        if (shiftId) {
          try {
            const resp = await axios.get(`/api/reception/shift/${shiftId}`);
            if (resp?.data?.data) {
              const shiftData = resp.data.data;
              shift = {...shiftData};
              cashierName = shiftData.cashier_name || cashierName;
              confirmerName = shiftData.confirmer_name || shiftData.confirmed_by || confirmerName;
              openedAt = shiftData.opened_at ? new Date(shiftData.opened_at).toLocaleString() : openedAt;
            }
          } catch (e) {
            console.warn('Failed to fetch shift data, using current shift', e);
          }
        }

        const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shift Opening</title>
        <style>
          @page { size: auto; margin: 5mm; }
          body { font-family: Arial, sans-serif; padding: 10px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 10px; }
          .logo { max-width: 150px; max-height: 80px; margin-bottom: 5px; }
          .title { font-size: 16px; font-weight: bold; margin: 5px 0; }
          .subtitle { font-size: 12px; margin: 3px 0; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .label { font-weight: bold; }
          .section { margin: 10px 0; }
          .section-title { font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #eee; padding-bottom: 3px; }
          .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
          .signature { width: 45%; text-align: center; }
          .signature-line { border-top: 1px solid #000; margin: 5px auto; width: 100%; }
          .center { text-align: center; }
          .footer { margin-top: 20px; font-size: 10px; text-align: center; }
        </style>
      </head>
      <body onload="window.print();">
        <div class="header">
          ${this.organization.receipt_logo ? `<img src="${this.organization.receipt_logo}" class="logo" alt="Company Logo">` : ''}
          <div class="title">SHIFT OPENING REPORT</div>
          <div class="subtitle">${this.organization.name || 'ORGANIZATION'}</div>
          <div class="subtitle">${this.station?.name || 'POS TERMINAL'}</div>
          <div class="subtitle">${this.station?.location || ''}</div>
          ${this.organization.address ? `<div class="subtitle">${this.organization.address}</div>` : ''}
          ${this.organization.phone ? `<div class="subtitle">Tel: ${this.organization.phone}</div>` : ''}
        </div>

        <div class="divider"></div>

        <div class="row"><span class="label">Date/Time:</span><span>${currentDate}</span></div>
        <div class="row"><span class="label">Cashier:</span><span>${cashierName}</span></div>
        <div class="row"><span class="label">Opened At:</span><span>${openedAt}</span></div>

        <div class="divider"></div>

        <div class="section">
          <div class="section-title">OPENING BALANCE</div>
          <div class="row"><span>Opening Balance:</span><span>${this.formatCurrency(shift.opening_balance || 0)}</span></div>
        </div>

        <div class="divider"></div>

        <div class="section">
          <div class="section-title">SALES SUMMARY</div>
          <div class="row"><span>Total Cash Sales:</span><span>${this.formatCurrency(shift.total_cash_sales || 0)}</span></div>
          <div class="row"><span>Total M-Pesa Sales:</span><span>${this.formatCurrency(shift.total_mpesa_sales || 0)}</span></div>
          <div class="row"><span>Total Card Sales:</span><span>${this.formatCurrency(shift.total_card_sales || 0)}</span></div>
          <div class="row"><span>Total Cheque Sales:</span><span>${this.formatCurrency(shift.total_cheque_sales || 0)}</span></div>
          <div class="row"><span>Total Cash Pickups:</span><span>${this.formatCurrency(shift.total_pickups || 0)}</span></div>
        </div>

        <div class="signature-section">
          <div class="signature">
            <div class="signature-line"></div>
              <div>Cashier:</div>
            <div>${cashierName}</div>
            <div>${openedAt}</div>
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <div>Confirmed By:</div>
            <div>${confirmerName}</div>
            <div>${openedAt}</div>
          </div>
        </div>

        <div class="footer">
          <div>${this.organization.name || ''} - ${new Date().getFullYear()}</div>
        </div>
      </body>
      </html>
    `;

        w.document.open();
        w.document.write(content);
        w.document.close();
        w.focus();
      } catch (e) {
        console.error('Error printing shift opening:', e);

      }
    },

    onCancelPaymentModal() {
      try {
        // Reset all loading flags so any disabled buttons become enabled again
        this.loading = false;
        this.cash_loading = false;
        this.mpesa_loading = false;
        this.pesapal_loading = false;
        this.gift_card_loading = false;
        this.voucher_loading = false;
        this.paymentProcessing = false;
      } catch (e) {
        // no-op
      }
      // Finally close the modal
      this.showPaymentModal = false;
    },
    async fetchLoyaltyInfo(patientId) {
      try {
        // fetch available points
        const pointsResp = await window.axios.post('/api/finance/customer/points', {customer_id: patientId});
        const total = pointsResp?.data?.data?.total_points || 0;
        this.custom_payment.loyalty.available = Number(total) || 0;
      } catch (e) {
        console.warn('Failed to fetch customer points', e);
        this.custom_payment.loyalty.available = 0;
      }
      try {
        // fetch conversion rate
        const rateResp = await window.axios.get('/api/finance/points/rate');
        const rate = rateResp?.data?.data?.rate || 0;
        this.custom_payment.loyalty.rate = Number(rate) || 0;
      } catch (e) {
        console.warn('Failed to fetch loyalty rate', e);
        this.custom_payment.loyalty.rate = 0;
      }
      // Recompute value after fetching
      this.updateLoyaltyValue();
    },
    async fetchStaff() {
      this.staffLoading = true;
      try {
        const resp = await window.axios.get('/api/users/all/users');
        const list = (resp && resp.data && (resp.data.data || resp.data)) || [];
        // Normalize to have id and full_name
        this.staff = Array.isArray(list) ? list.map(u => ({
          id: u.id,
          full_name: u.full_name || u.name || u.username || (u.profile && u.profile.full_name) || `User #${u.id}`
        })) : [];
      } catch (e) {
        this.staff = [];
      } finally {
        this.staffLoading = false;
      }
    },
    async fetchOrganizationData() {
      try {
        const resp = await window.axios.get('/api/settings/organization-details');
        if (resp && resp.data && resp.data.status === 'success') {
          this.organization = {
            name: resp.data.data.name || '',
            logo: resp.data.data.logo || '',
            receipt_logo: resp.data.data.receipt_logo || '',
            address: resp.data.data.address || '',
            phone: resp.data.data.phone || '',
            email: resp.data.data.email || ''
          };
        }
       } catch (e) {
        console.warn('Failed to fetch organization data', e);
        // Set default values
        this.organization = {
          name: 'Organization',
          logo: '',
          receipt_logo: '',
          address: '',
          phone: '',
          email: ''
        };
      }
    },

    updateLoyaltyValue() {
      const pts = Math.max(0, Math.floor(Number(this.custom_payment.loyalty.points || 0)));
      const rate = Number(this.custom_payment.loyalty.rate || 0);
      const available = Number(this.custom_payment.loyalty.available || 0);
      let usePts = pts;
      if (usePts > available) usePts = available;
      if (rate > 0) {
        const maxByAmount = Math.floor(Number(this.totals.totalPayable || 0) / rate);
        if (usePts > maxByAmount) usePts = maxByAmount;
      }
      this.custom_payment.loyalty.points = usePts;
      this.custom_payment.loyalty.value = Number((usePts * rate).toFixed(2));
      this.custom_payment.loyalty.amount = this.custom_payment.loyalty.value;
    },
    reloadSalesDetails() {
      try {
        if (this.$refs && this.$refs.salesListing && typeof this.$refs.salesListing.init === 'function') {
          this.$refs.salesListing.init();
        }
      } catch (e) {
        console.warn('Failed to reload SalesListingDetails', e);
      }
    },
    // Clear selected customer and loyalty UI after a sale is fully processed
    clearCustomerAfterSale() {
      try {
        // Reset POS customer id (walk-in)
        if (this.groupPos && this.groupPos.pos_data && this.groupPos.pos_data.customer_data) {
          this.groupPos.pos_data.customer_data.patient_id = null;
          this.groupPos.pos_data.customer_data.type = null;
        }
        // Reset internal selected customer id tracker if any
        if (typeof this.selectedCustomerId !== 'undefined') {
          this.selectedCustomerId = '';
        }

        this.selectedCustomerLoyalty.eligible = false;
        this.selectedCustomerLoyalty.balance = 0;

        if (this.custom_payment && this.custom_payment.loyalty) {
          this.custom_payment.loyalty.available = 0;
          this.custom_payment.loyalty.rate = 0;
          this.custom_payment.loyalty.points = 0;
          this.custom_payment.loyalty.value = 0;
          this.custom_payment.loyalty.amount = 0;
        }

        // Notify child customer search to clear its selection

        this.patientClearSignal++;

        if (this.$refs && this.$refs.patientSearch && typeof this.$refs.patientSearch.refreshSearch === 'function') {

          try {
            this.$refs.patientSearch.refreshSearch();
          } catch (e) {
          }

        }
        // Clear selected user in user search
        if (this.groupPos && this.groupPos.pos_data && this.groupPos.pos_data.customer_data) {
          this.groupPos.pos_data.customer_data.staff_id = null;
        }
        this.userClearSignal++;
        if (this.$refs && this.$refs.userSearch && typeof this.$refs.userSearch.selectionCleared === 'function') {
          try {
            this.$refs.userSearch.selectionCleared();
          } catch (e) {
          }
        }


      } catch (e) {
        console.warn('Failed to clear customer after sale', e);
      }
    },





    getCsrfToken() {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta ? meta.getAttribute('content') : null;
    },
    isKioskMode() {
      try {
        if (typeof window !== 'undefined') {
          if (window.KIOSK_MODE === true) return true;
          try {
            if (localStorage.getItem('kiosk_mode') === '1') return true;
          } catch (e) {
          }
          if (window.matchMedia) {
            try {
              if (window.matchMedia('(display-mode: kiosk)').matches) return true;
            } catch (e) {
            }
            try {
              if (window.matchMedia('(display-mode: fullscreen)').matches) return true;
            } catch (e) {
            }
          }
          const ua = (navigator && navigator.userAgent) ? navigator.userAgent.toLowerCase() : '';
          if (ua.includes('kiosk')) return true;
        }
      } catch (e) {
      }
      return false;
    },
    async blobToBase64(blob) {
      const arrBuf = await blob.arrayBuffer();
      let bin = '';
      const bytes = new Uint8Array(arrBuf);
      for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    },
    async fetchThermalReceiptAsBase64(paymentId, invoice = false, firstPrint = true) {
      const url = this.$router ? this.$router.resolve({name: 'finance.evaluation.normal.rcpt.print'})?.href : null;
      // Fallback to hardcoded path if route helper unavailable in SPA
      const postUrl = url || '/finance/evaluation/print/receipt/thermal';
      const form = new FormData();
      form.append('payment', String(paymentId));
      form.append('paper_size', 'thermal');
      if (firstPrint) form.append('first_print', 'true');
      if (invoice) form.append('invoice', 'true');
      const headers = {'X-Requested-With': 'XMLHttpRequest'};
      const token = this.getCsrfToken();
      if (token) headers['X-CSRF-TOKEN'] = token;
      const resp = await axios.post(postUrl, form, {withCredentials: true, headers, responseType: 'blob'});
      const blob = resp.data;
      return await this.blobToBase64(blob);
    },


    initializeSocket() {
      if (!this.socket) {
        try {
          // Check if io is available in window object
          if (typeof window.io === 'undefined') {
            // Load Socket.IO client library dynamically if not available
            const script = document.createElement('script');
            script.src = '/js/socket.io.min.js';
            script.async = true;
            script.onload = () => {
              // Once loaded, initialize the socket
              this.socket = window.io('https://xanalife.afyanalytics.ai', {
                path: '/socket.io'
              });
              // this.socket = window.io(window.location.origin + ':3000');

              // Log connection status
              this.socket.on('connect', () => {
              });

              this.socket.on('request-pos-data', ({displayId}) => {
                if (!displayId) return;

                this.socket.emit('pos-data-update', {
                  selectedItems: this.selectedItems,
                  totals: this.totals

                });

                this.socket.emit(`pos-data-update-${displayId}`, {
                  selectedItems: this.selectedItems,
                  totals: this.totals,
                  displayId,
                });
              });

              this.socket.on('disconnect', () => {
                //console.log('Disconnected from WebSocket server');
              });

              // Emit initial data if needed
              this.emitPosData();
            };
            document.head.appendChild(script);
          } else {

            this.socket = window.io('https://xanalife.afyanalytics.ai:3000');

            // Log connection status
            this.socket.on('connect', () => {
              //console.log('Connected to WebSocket server');
            });

            this.socket.on('disconnect', () => {
              //console.log('Disconnected from WebSocket server');
            });
          }
        } catch (error) {
          console.error('Error initializing socket:', error);
        }
      }
    },
    nativeAutoPrintFromUrl(url) {
      return new Promise((resolve, reject) => {
        if (!url) return reject(new Error('Missing print URL'));

        // Remove old iframe if it exists
        let oldIframe = document.getElementById("print-iframe");
        if (oldIframe) oldIframe.remove();

        // Create a new iframe
        const iframe = document.createElement("iframe");
        iframe.id = "print-iframe";
        iframe.style.display = "none";
        iframe.src = `${url}${url.includes('?') ? '&' : '?'}auto_print=1`;

        // Attach load listener
        iframe.onload = () => {
          try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            resolve();
          } catch (err) {
            reject(err);
          } finally {
            // clean up to allow reprint later
            setTimeout(() => iframe.remove(), 3000);
          }
        };

        document.body.appendChild(iframe);
      });
    },
    async processSaleAndPrintReload(saleId, paymentId) {
      if (!saleId) return;
      try {
        const res = await this.groupPos.processPosSale(saleId, this.internal);

        const printUrl = res && res.data && res.data.url;
        if (!printUrl) return;
        try {
          await this.nativeAutoPrintFromUrl(printUrl);
          // After finishing a sale, clear loyalty display and deselect customer in search
          this.clearCustomerAfterSale()

          this.reloadSalesDetails();
        } catch (err) {
          console.warn('Err occurred while printing', err);
        } finally {

        }
      } catch (e) {
        console.warn('Failed to process POS sale', e);
      }
    },
    getImageUrl(url) {
      if (!url) return null;

      // If it's already a direct image link, return as is
      if (url.match(/\.(jpg|jpeg|png|gif)$/i)) return url;

      // Handle Imgur album or image links
      const imgurMatch = url.match(/imgur\.com\/(?:gallery|a)?\/?([a-zA-Z0-9]+)/);
      if (imgurMatch && imgurMatch[1]) {
        // Convert to direct image link (default to .jpg)
        return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
      }


      return null; // Can't process
    },
    handleBarcodeScan() {
      const value = (this.barcode || '').trim();
      if (value === '') {
        return;
      }
      this.scannedBarcode = value;

      console.log('dfsdfsdf');

      const giftCardModeIndex = this.paymentModes.findIndex(mode => mode.name === 'giftcard');
      const voucherModeIndex = this.paymentModes.findIndex(mode => mode.name === 'voucher');

      // If in gift card or voucher panels, respect those flows
      if (giftCardModeIndex !== -1 && this.selectedPaymentPanel === giftCardModeIndex) {
        console.log('Fetching gift card for code:');
        this.fetchGiftCardDetails(value);
        this.barcode = '';
        return;
      }
      if (voucherModeIndex !== -1 && this.selectedPaymentPanel === voucherModeIndex) {
        this.fetchVoucher(value);
        this.barcode = '';
        return;
      }

      // If looks like a barcode, fetch directly; otherwise search by name
      if (this.isLikelyBarcode(value)) {
        this.fetchProductByBarcode(value);
        this.barcode = '';
      } else {
        this.productSearchTerm = value;
        this.searchProductsByName(value);
      }
    },

    isLikelyBarcode(value) {
      // Heuristics: mostly digits (and optional hyphen), length >= 6
      const cleaned = String(value).trim();
      return (/^[0-9\-]+$/.test(cleaned) && cleaned.replace(/\D/g, '').length >= 4);
    },

    globalKeydownHandler(event) {
      const activeElement = document.activeElement;

      // Skip if user is typing in an input, textarea, or editable field
      if (
          activeElement &&
          (activeElement.tagName === 'INPUT' ||
              activeElement.tagName === 'TEXTAREA' ||
              activeElement.isContentEditable)
      ) {
        return;
      }

      // Clear timer if user keeps typing fast (barcode scanners type fast)
      if (this.barcodeTimer) {
        clearTimeout(this.barcodeTimer);
      }

      // If it's a printable character, accumulate it
      if (event.key.length === 1) {
        this.barcodeBuffer += event.key;
      }

      // If Enter is pressed, process barcode
      if (event.key === 'Enter') {
        if (this.barcodeBuffer.length > 0) {
          this.barcode = this.barcodeBuffer;
          this.scannedBarcode = this.barcodeBuffer;


          // Focus barcode input field (if needed)
          this.$nextTick(() => {
            const barcodeInput = this.$el.querySelector('div.mx-2 input[type="text"]');
            if (barcodeInput) {
              barcodeInput.focus();
            }
          });


          // Fetch product using scanned barcode
          if (this.barcode.includes('undefined')) {
            this.barcode = this.barcode.split('undefined')[1] || '';
          }


          // Alert scanned barcode properly
          // alert("scanned code: " + (this.barcode || ''));
          const giftCardModeIndex = this.paymentModes.findIndex(mode => mode.name === 'giftcard');
          const voucherModeIndex = this.paymentModes.findIndex(mode => mode.name === 'voucher');
          if (this.selectedPaymentPanel[0] === giftCardModeIndex) {
            // Fetch gift card details from backend-API by code
            // alert('scanned code2: ' + this.barcode.trim());

            this.fetchGiftCardDetails(this.barcode.trim());
          } else if (this.selectedPaymentPanel[0] === voucherModeIndex) {
            // Fetch voucher details from backend API by code
            this.fetchVoucher(this.barcode.trim());
          } else {
            // Decide whether it's a barcode or a typed name, mirroring handleBarcodeScan()
            const value = (this.barcode || '').trim();
            if (this.isLikelyBarcode(value)) {
              this.fetchProductByBarcode(value);
            } else {
              this.productSearchTerm = value;
              this.searchProductsByName(value);
            }
          }

          this.barcode = '';

          // this.fetchProductByBarcode(this.barcode.trim());


          // Clear buffer
          this.barcodeBuffer = '';
          this.barcode = '';
        }
      } else {
        // Clear buffer after 500ms idle time
        this.barcodeTimer = setTimeout(() => {
          this.barcodeBuffer = '';
        }, 500);
      }
    },


    async fetchProductByBarcode(barcode) {
      try {
        const resp = await axios.post('/api/inventory/single/store/products/search', {
          barcode,
          store_id: this.selectedStoreId
        }, {headers: {'Accept': 'application/json'}});
        const json = resp && resp.data ? resp.data : null;

        // Normalize response to a list of products
        let list = [];
        if (!json) {
          list = [];
        } else if (Array.isArray(json)) {
          list = json;
        } else if (json && Array.isArray(json.data)) {
          list = json.data;
        } else if (json && json.data && Array.isArray(json.data.data)) {
          list = json.data.data;
        } else if (json && Array.isArray(json.items)) {
          list = json.items;
        } else if (json.id || json.store_product_id) {
          list = [json]; // single object
        }

        if (!list || list.length === 0) {

          this.$swal({
            title: 'Product Not Found',
            text: `No product found with barcode: ${barcode}`,
            icon: 'warning',
            confirmButtonText: 'OK',
          });
          return;
        }

        if (list.length === 1) {
          this.addProduct(list[0]);
        } else {
          // Multiple matches: show inline dropdown instead of opening modal
          this.autocompleteItems = list.map(p => ({...p, id: p.id || p.store_product_id}));
          this.showInlineSearchMenu = true;
        }
      } catch (error) {
        console.error('Error fetching product by barcode:', error);
        this.$swal({
          title: 'Error',
          text: 'Failed to fetch product details. Product not in the current store. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    },

// New: search by name using same input (with multi-select dialog when multiple results)
    async searchProductsByName(term) {
      try {
        this.searchLoading = true;
        const params = {};
        if (this.selectedStoreId) params.store_id = this.selectedStoreId;
        params.no_pagination = true;
        params.search = term;

        // Use the same endpoint as Inventory search
        const resp = await axios.get('/api/inventory/storeProducts', {
          params,
          headers: {'Accept': 'application/json'}
        });

        const json = resp && resp.data ? resp.data : [];
        let list = [];
        if (Array.isArray(json)) {
          list = json;
        } else if (json && Array.isArray(json.data)) {
          list = json.data;
        } else if (json && json.data && Array.isArray(json.data.data)) {
          list = json.data.data;
        } else if (json && Array.isArray(json.items)) {
          list = json.items;
        } else {
          // Last resort: try to find first array in known keys
          const candidate = ['results', 'rows', 'products'].map(k => json && json[k]).find(v => Array.isArray(v));
          list = candidate || [];
        }

        // If no results, show a toast and stop
        if (!list || list.length === 0) {
          this.$swal({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: 'Product not found',
            text: `No products match "${term}"`,
            timer: 2500,
            showConfirmButton: false
          });
          this.searchResults = [];
          this.productSearchTerm = '';
          this.barcode = '';
          return;
        }

        // If exactly one, add immediately; if multiple, open multi-select dialog
        if (list.length === 1) {
          this.chooseSearchResult(list[0]);
        } else {
          // Multiple results: use inline dropdown, do not open multi-select modal
          this.autocompleteItems = list.map(p => ({...p, id: p.id || p.store_product_id}));
          this.showInlineSearchMenu = true;
        }
      } catch (e) {
        console.error('Name search failed', e);
        this.$swal({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Search error',
          text: 'Could not search products. Please try again.',
          timer: 3000,
          showConfirmButton: false
        });
      } finally {
        this.searchLoading = false;
        // Do not auto-close the dialog here; it stays open for multi-select when applicable
      }
    },

    triggerNameSearch() {
      const term = (this.productSearchTerm || '').trim();
      if (term.length < 2) return;
      this.searchProductsByName(term);
    },

    chooseSearchResult(item) {
      if (!item) return;
      if (item.disabled || Number(item.quantity) <= 0) {
        this.$swal({
          title: 'Out of stock',
          text: 'This product is currently unavailable in the selected store.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }
      this.addProduct(item);
      this.searchResults = [];
      this.productSearchTerm = '';
      this.barcode = '';
    },

// Toggle selection for a result item
    toggleSelectResult(item) {
      const id = item.id || item.store_product_id;
      if (!id) return;
      const idx = this.selectedSearchIds.indexOf(id);
      if (idx === -1) {
        if (!this.isResultDisabled(item)) this.selectedSearchIds.push(id);
      } else {
        this.selectedSearchIds.splice(idx, 1);
      }
    },

    isResultDisabled(item) {
      return !!(item.disabled || Number(item.quantity) <= 0);
    },

    addSelectedResultsToCart() {
      if (!Array.isArray(this.searchResults) || this.searchResults.length === 0) {
        return;
      }
      const byId = (p) => p.id || p.store_product_id;
      const chosen = this.searchResults.filter(p => this.selectedSearchIds.includes(byId(p)) && !this.isResultDisabled(p));
      if (chosen.length === 0) {
        this.$swal({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'No selectable items',
          text: 'Select available items to add to cart.',
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }
      chosen.forEach(p => this.addProduct(p));
      this.closeSearchResultsDialog();
    },

    closeSearchResultsDialog() {
      this.searchResults = [];
      this.selectedSearchIds = [];
      this.productSearchTerm = '';
      this.barcode = '';
    },

// When user selects from the live autocomplete, add to cart
    onAutocompleteChange(val) {
      // val is array of selected ids; we need to map them back to items
      try {
        const selectedIds = Array.isArray(val) ? val.slice() : [];
        if (selectedIds.length === 0) return;
        const byId = (p) => p.id || p.store_product_id;
        const chosen = this.autocompleteItems.filter(p => selectedIds.includes(byId(p)));
        if (chosen.length > 0) {
          chosen.forEach(p => this.addProduct(p));
        }
      } finally {
        // reset autocomplete selection and search term for next entry
        this.selectedAutocomplete = [];
        this.productSearchTerm = '';
      }
    },

// Fetch items for live autocomplete (name search)
    async fetchAutocompleteItems(term) {
      if (this.selectionLocked) return;
      const query = (term || '').trim();
      if (query.length < 2) {
        this.autocompleteItems = [];
        this.showInlineSearchMenu = false;
        return;
      }
      const seq = ++this.autocompleteRequestSeq;
      try {
        this.searchLoading = true;
        const params = {search: query, no_pagination: true};
        if (this.selectedStoreId) params.store_id = this.selectedStoreId;
        const resp = await axios.get('/api/inventory/storeProducts', {
          params,
          headers: {'Accept': 'application/json'}
        });
        // Discard if a newer request has started or selection was made
        if (seq !== this.autocompleteRequestSeq || this.selectionLocked) return;
        const json = resp && resp.data ? resp.data : [];
        let list = [];
        if (Array.isArray(json)) list = json;
        else if (json && Array.isArray(json.data)) list = json.data;
        else if (json && json.data && Array.isArray(json.data.data)) list = json.data.data;
        else if (json && Array.isArray(json.items)) list = json.items;
        else {
          const candidate = ['results', 'rows', 'products'].map(k => json && json[k]).find(v => Array.isArray(v));
          list = candidate || [];
        }
        // Normalize to ensure an 'id' field exists for v-autocomplete value binding
        this.autocompleteItems = list.map(p => ({...p, id: p.id || p.store_product_id}));
        this.showInlineSearchMenu = Array.isArray(this.autocompleteItems) && this.autocompleteItems.length > 0;
      } catch (e) {
        if (seq === this.autocompleteRequestSeq && !this.selectionLocked) {
          console.error('Autocomplete fetch failed', e);
          this.autocompleteItems = [];
          this.showInlineSearchMenu = false;
        }
      } finally {
        if (seq === this.autocompleteRequestSeq) {
          this.searchLoading = false;
        }
      }
    },

// Inline menu input handler: drives search based on the same barcode field
    onBarcodeInput(val) {
      try {
        if (this.selectionLocked) return; // suppress calls after selecting an item
        const v = typeof val === 'string' ? val : this.barcode;
        this.productSearchTerm = v;
        if (!this.selectedStoreId) {
          this.showInlineSearchMenu = false;
          return;
        }

        const query = (v || '').trim();
        // Debounce queries to avoid flicker and excessive API calls
        if (this.autocompleteDebounce) clearTimeout(this.autocompleteDebounce);
        if (query.length >= 2) {
          this.autocompleteDebounce = setTimeout(() => {
            // If selection got locked during debounce, stop
            if (this.selectionLocked) return;
            this.fetchAutocompleteItems(query);
          }, 200);
        } else {
          // Invalidate any in-flight responses and close the menu
          this.autocompleteRequestSeq++;
          this.autocompleteItems = [];
          this.showInlineSearchMenu = false;
        }
      } catch (e) {
        this.showInlineSearchMenu = false;
      }
    },

// Selection from inline dropdown: add with quantity forced to 1
    onInlineSelect(item) {
      if (!item || this.isResultDisabled(item)) return;
      // Lock selection to prevent further API calls and UI flicker
      this.selectionLocked = true;
      // Invalidate any in-flight autocomplete responses
      this.autocompleteRequestSeq++;
      if (this.autocompleteDebounce) {
        clearTimeout(this.autocompleteDebounce);
        this.autocompleteDebounce = null;
      }
      // Close menu and clear search artifacts before adding the product
      this.showInlineSearchMenu = false;
      this.autocompleteItems = [];
      // Add with qty=1
      this.addProductWithQtyOne(item);
      // Clear input without triggering search (guarded by selectionLocked)
      this.productSearchTerm = '';
      this.barcode = '';
      // Release lock on next user action (e.g., next input). A small timeout avoids race with any pending UI updates.
      this.$nextTick(() => {
        setTimeout(() => {
          this.selectionLocked = false;
        }, 100);
      });
    },

// Helper to add product but force quantity to 1 regardless of item.quantity
    addProductWithQtyOne(item) {
      const patched = {...(item || {}), quantity: 1};
      this.addProduct(patched);
    },

    toggleVoucherInput(){
      console.log('input');
      
      this.showVoucherInput = !this.showVoucherInput;
    },
    processLoyaltyRedemption() {

    },


    async fetchGiftCardDetails(code) {
      try {
        const resp = await axios.post('/api/finance/get/gift/card/', {code});
        const data = resp && resp.data ? resp.data : null;


        if (data) {
          this.giftCardAccount = data;
          const giftCardAmountValue = this.giftCardAccount.amount || this.giftCardAccount.balance || 0;
          this.custom_payment.gift_card.code = data.qr_code;
        } else {
          this.giftCardAccount = null;
          this.giftCardAmountValue = 0;
          this.$swal({
            title: 'Gift Card Not Found',
            text: `No gift card found with code: ${code}`,
            icon: 'warning',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        console.error('Error fetching gift card details:', error);
        this.giftCardAccount = null;
        this.giftCardAmountValue = 0;
        this.$swal({
          title: 'Error',
          text: 'Failed to fetch gift card details. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    },

    async fetchVoucher(code) {
      try {
        this.voucher_loading = true;
        const resp = await axios.post('/api/finance/get/voucher/', {code, amount: this.totals});
        const data = resp && resp.data ? resp.data : null;

        if (data) {

          this.voucher_loading = false;

          this.voucherAccount = data;

          console.log('voucher data', data);
          if (parseInt(this.voucherAccount.balance) > 0) {
            this.voucherAmountValue = this.voucherAccount.balance;
            this.custom_payment.voucher.amount = this.voucherAmountValue;
          } else {
            this.voucher_loading = false;
            this.$swal({
              title: data.heading || 'Voucher Issue',
              text: data.message || 'Voucher has zero balance',
              icon: 'warning',
              confirmButtonText: 'OK'
            });
          }

        } else {
          this.voucherAccount = null;
          this.voucherAmountValue = 0;
          this.$swal({
            title: 'Voucher Not Found',
            text: `No voucher found with code: ${code}`,
            icon: 'warning',
            confirmButtonText: 'OK'
          });
        }
      } catch (error) {
        console.error('Error fetching voucher details:', error);
        // this.voucherAccount = null;
        // this.voucherAmountValue = 0;
        this.$swal({
          title: 'Error',
          text: 'Failed to fetch voucher details. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    },
    formatCurrency(value) {
      const num = Number(value);
      return 'KSH ' + (isNaN(num) ? '0.00' : num.toFixed(2));
    },
    usher(action) {
      return `/evaluation/grouped-pos/${this.station.slug}/process/${action.url}`
    },
    pressing() {

    },
    getDeviceId() {
      let id = localStorage.getItem("pos_device_id");
      if (!id) {
        id = "pos-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
        localStorage.setItem("pos_device_id", id);
      }
      return id;
    },
    openCustomerDisplay() {
      // Toggle the customer display dialog
      this.customerDisplayId = this.getDeviceId();

      // Increment key to force re-render when reopening
      this.customerDisplayKey += 1;

      // Emit initial data
      this.$nextTick(() => {
        this.emitPosData();
      });
      const customerDisplayUrl = `/evaluation/grouped-pos/${this.station.slug}/customer-display?displayId=${this.customerDisplayId}`;
      window.open(customerDisplayUrl, '_blank');
    },

    initializeDisplaySockets() {
      // Initialize socket connection if not already done
      this.initializeSocket();

      // Emit initial data
      this.$nextTick(() => {
        this.emitPosData();
      });
    },


    emitPosData() {
      if (this.socket && this.customerDisplayId) {
        // Emit the selected items and totals to a namespaced channel
        this.socket.emit("pos-data-update", {
          selectedItems: this.selectedItems,
          totals: this.totals,
          displayId: this.customerDisplayId
        });

      }
    },
    // Add method to check order tracking ID
    async checkOrderTrackingId(orderTrackingId) {
      try {
        // Show the payment check dialog while checking
        this.paymentCheckDialog = true;

        // Call the API endpoint to check the payment status to pesapal side.
        const response = await axios.get(`/api/finance/check-order-tracking-id?pesapal_order_tracking_id=${orderTrackingId}`);


        if (response.data.status === 'success') {
          const transaction = response.data.transaction;
          this.pesapal_order_mobile_number = transaction.mobile_number;

          // If payment is complete, remove from localStorage and reload the page
          if (transaction.status === 1) {
            // Remove the order tracking ID and selected items from localStorage if they exist
            localStorage.removeItem('pesapal_order_tracking_id');
            localStorage.removeItem('pesapal_selected_items');
            this.paymentCheckDialog = false;

            this.$swal({
              title: 'Payment Successful',
              text: `Payment made via Pesapal was successful!`,
              icon: 'success',
              confirmButtonText: 'OK'
            });

            // Save the POS items to the backend bef++ore reloading
            await this.saveSelectedItemsToPos();
            // Set payment details in pos_data similar to cash but for pesapal
            this.groupPos.pos_data.payment_details = {
              payment_method: 'pesapal',
              amount: this.custom_payment?.pesapal?.amount || this.totals.totalPayable
            };
            const saleResult = await this.groupPos.saveSale(this.station.slug, true, this.internal);
            if (saleResult && saleResult.sale_id) {
              await this.processSaleAndPrintReload(saleResult.sale_id);
            }


            // window.location.reload();
          } else if (transaction.status === 0) {
            // If payment is still pending, start the payment check process
            this.initiatePaymentChecks('pesapal', transaction.id);
          } else {
            // If payment failed, remove from localStorage
            localStorage.removeItem('pesapal_order_tracking_id');
            this.paymentCheckDialog = false;
            this.$swal({
              title: 'Payment Failed',
              text: `Payment failed: ${transaction.transaction_status}`,
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        } else {
          // If check failed, remove from localStorage to prevent repeated checks
          localStorage.removeItem('pesapal_order_tracking_id');
          this.paymentCheckDialog = false;
          // alert('Failed to check payment status: ' + (response.data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error checking order tracking ID:', error);
        // If error occurred, remove from localStorage to prevent repeated checks
        localStorage.removeItem('pesapal_order_tracking_id');
        this.paymentCheckDialog = false;
        // alert('An error occurred while checking the payment status. Please try again.');
      }
    },
    updateTotals() {
      const subtotal = this.selectedItems.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      const discount = parseFloat(this.totals.discount) || 0;
      const tax = parseFloat(this.totals.tax) || 0;

      const discounted = subtotal - discount;
      const totalPayable = discounted + tax;

      this.totals.subtotal = subtotal;
      this.totals.totalPayable = totalPayable;

      // Emit the updated data via WebSocket instead of using localStorage
      this.emitPosData();
    },
    updateSubtotal(item) {
      // Use the price (which may be discount_price if available)

      if (item.bulk_pay_quantity > 0 && item.bulk_pay_quantity >= item.quantity) {
        item.price = item.bulk_price;
        item.subtotal = item.bulk_pay_quantity * item.bulk_price;

      } else {
        item.subtotal = item.quantity * item.price;
      }


      this.updateTotals(); // Recalculate totals
    },

    initiatePaymentChecks(type, transaction_id) {
      // Reset guard and clear any existing polling to avoid duplicate handling
      this.paymentResultHandled = false;
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      this.paymentCheckDialog = true;
      this.loading = false;
      this.mpesa_loading = false;

      this.showPaymentModal = false;
      if (this.paymentCheckDialog) {
        // Set a timeout to close the dialog after 2 minutes (120,000 ms) if no response
        const timeoutId = setTimeout(() => {
          if (this.paymentCheckDialog) {
            this.paymentCheckDialog = false;

            this.stopUpdatingBalance();
            // Show a message to the user that the payment check timed out and show again the payment dialog
            alert('Payment check timed out after 2 minutes. Please try again.');
            localStorage.removeItem('pesapal_order_tracking_id');
            this.showPaymentModal = true;

          }
        }, 60000);

        setTimeout(() => {
          this.intervalId = setInterval(async () => {
            if (!this.paymentCheckDialog) {
              clearInterval(this.intervalId);
              clearTimeout(timeoutId); // Clear the timeout if dialog is closed
              this.stopUpdatingBalance();
            }


            if (this.payment.mpesa !== null && this.custom_payment.mpesa.mobile_number !== null && this.custom_payment.mpesa.mobile_number !== '') {
              await this.fetchPayment(type, transaction_id, this.custom_payment.mpesa.mobile_number);
            } else if (this.pesapal_order_mobile_number !== null) {
              await this.fetchPayment(type, transaction_id, this.pesapal_order_mobile_number);
            } else {
              await this.fetchPayment(type, transaction_id, this.custom_payment.mpesa.mobile_number);

            }
          }, 3000);
        }, 5000);
      }
    },
    stopUpdatingBalance() {
      // Clear the interval when needed (e.g., when the component is destroyed)
      clearInterval(this.intervalId);
    },
    async fetchPayment(type, transaction_id, number) {
      // If already handled a result for this polling cycle, ignore further responses
      if (this.paymentResultHandled) {
        return;
      }
      const response = await this.payment.fetchTransaction(transaction_id, number);

      if (response) {
        const response_data = response.data[0];

        if (response_data.ref_no) {
          // Mark as handled and stop further polling before any UI actions
          this.paymentResultHandled = true;
          if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
          }
          this.stopUpdatingBalance();

          // Update the transaction code in the manual entry field
          this.custom_payment.mpesa.code = response_data.ref_no;
          this.payment.mpesa.code = response_data.ref_no;
          this.paymentCheckDialog = false;


          this.$swal({
            title: 'Successful payment',
            text: `Payment of KSH: ${response_data.paid_amount} made successfully via M-PESA`,
            icon: 'success',
            confirmButtonText: 'OK'
          });

          // Now clear POS data and UI after successful processing
          this.showPaymentModal = true;
          // Display the message to the user and stop the payment check dialog
          this.paymentCheckDialog = false;


        } else {

          if (response_data.description !== null) {
            // Mark as handled and stop further polling before any UI actions
            this.paymentResultHandled = true;
            if (this.intervalId) {
              clearInterval(this.intervalId);
              this.intervalId = null;
            }
            this.stopUpdatingBalance();
            this.$swal({
              title: 'Payment Pending',
              text: `Payment failed: ${response_data.description}`,
              icon: 'info',
              confirmButtonText: 'OK'
            });
            // Ensure dialogs are properly closed once
            this.paymentCheckDialog = false;
            this.showPaymentModal = false;
            return; // Stop execution here
          }

        }
      }
    },
    handleInput() {
      const total = this.totals.totalPayable;
      if (this.payment.mpesa.amount > total) {
        this.payment.mpesa.amount = total;
      }
    },

    calculateCashChange() {
      const received = parseFloat(this.custom_payment.cash?.received_amount) || 0;
      const payable = parseFloat(this.totals?.totalPayable) || 0;
      if (payable <= 0) {
        this.custom_payment.cash.change_amount = 0;
        this.custom_payment.cash.amount = 0;
        return;
      }
      // Determine remaining before applying cash (consider other modes first)
      let remainingBeforeCash = 0;
      try {
        if (typeof this.remainingFor === 'function') {
          remainingBeforeCash = Number(this.remainingFor('cash') || 0);
        } else {
          const amounts = {
            mpesa: parseFloat(this.custom_payment?.mpesa?.amount || 0),
            pesapal: parseFloat(this.custom_payment?.pesapal?.amount || 0),
            card: parseFloat(this.custom_payment?.card?.amount || 0),
            cheque: parseFloat(this.custom_payment?.cheque?.amount || 0),
            voucher: parseFloat(this.custom_payment?.voucher?.amount || 0),
            giftcard: parseFloat(this.custom_payment?.gift_card?.amount || 0),
            loyalty: parseFloat((this.custom_payment?.loyalty && (this.custom_payment.loyalty.value || this.custom_payment.loyalty.amount)) || 0)
          };
          let others = 0;
          Object.keys(amounts).forEach(k => {
            others += amounts[k] || 0;
          });
          remainingBeforeCash = Math.max(0, payable - others);
        }
      } catch (e) {
        remainingBeforeCash = Math.max(0, payable);
      }

      // Change is based on the amount of cash received minus the remaining payable before cash
      this.custom_payment.cash.change_amount = Math.max(0, received - remainingBeforeCash).toFixed(2);

      // The actual cash applied cannot exceed the remaining before cash
      const cashApplicable = Math.min(Math.max(0, received), remainingBeforeCash);
      this.custom_payment.cash.amount = cashApplicable;

      // Apply clamp logic for cash as well (keeps UI hints consistent)
      this.clampPaymentAmount('cash');
    },

    productImage(product) {
      if (product.photo_url) {
        return "/" + product.photo_url;
      } else if (product.photo) {
        return '/' + product.photo;
      }
      return product.photo;
    },
    async loadMoreProducts($state) {
      try {
        const response = await this.fetchProducts(this.page, this.perPage);

        if (response.length) {
          this.sidebar_products.push(...response);
          this.page++;
          $state.loaded(); // notify InfiniteLoader of success
        } else {
          this.allLoaded = true;
          $state.complete(); // notify InfiniteLoader there's nothing more
        }

      } catch (err) {
        console.error('Error loading products:', err);
        $state.complete();
      }
    },
    async fetchProducts(page, perPage) {
      // Replace it with real API logic
      const params = {
        store_id: this.selectedStoreId,
        pagination: true,
        page: page,
        per_page: perPage
      };
      const response = await this.groupPos.fetchProducts({params});
      //displaying only first 15 records on initial page load then user can toggle between categories e.t.c
      return response.data || [];
    },
    async loadProducts() {
      // Reset page counter when loading products for a new store
      this.page = 1;


      const params = {
        store_id: this.selectedStoreId,
        pagination: true,
        page: this.page,
        per_page: this.perPage
      };

      try {
        const response = await this.groupPos.fetchProducts({params});
        this.sidebar_products = response.data;

        // Reset the infinite loader if it exists
        if (this.$refs.infiniteLoader) {
          this.$refs.infiniteLoader.$emit('$InfiniteLoading:reset');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    },

    async saveSelectedItemsToPos() {
      // Store customer_data before clearing items
      const customerData = {...this.groupPos.pos_data.customer_data};


      // Clear existing items in groupPos
      this.groupPos.pos_data.items = [];


      // Add each item from selectedItems to groupPos
      this.selectedItems.forEach((item, index) => {
        // Add a new row for each item
        this.groupPos.addNewRow('item');

        // Create a product object that matches what groupPos.itemSelected expects
        const product = {
          id: item.id,
          name: item.name,
          cash_price: item.price,
          quantity: item.quantity,
          variation: item.variation,
          sub_sku: item.sub_sku,
          product_id: item.product_id,
          store_id: this.selectedStoreId,
          photo_url: item.photo_url,
          bulk_pay_quantity: item.bulk_pay_quantity,
          bulk_percentage_discount: item.bulk_percentage_discount,
          bulk_quantity_range: item.bulk_quantity_range,
          bulk_price: item.bulk_price
        };


        this.products.push(product);

        // Call groupPos.itemSelected with the current index and product
        this.groupPos.customPosItemSelected(index, product);
      });

      // Ensure customer_data is preserved
      this.groupPos.pos_data.customer_data = customerData;

      // Log customer data to verify it's set correctly
    },

    async requestPayment(type) {
      if (type === 'loyalty') {
        try {
          // Save the selected items to the POS first
          await this.saveSelectedItemsToPos();

          const rate = Number(this.custom_payment.loyalty.rate || 0);
          let points = Math.floor(Number(this.custom_payment.loyalty.points || 0));
          const available = Number(this.custom_payment.loyalty.available || 0);
          const total = Number(this.totals.totalPayable || 0);

          if (!rate || points <= 0) {
            this.$swal({
              title: 'Invalid',
              text: 'Please enter valid points and ensure rate is set.',
              icon: 'warning'
            });
            return;
          }
          if (points > available) points = available;
          const maxByAmount = Math.floor(total / rate);
          if (points > maxByAmount) points = maxByAmount;

          const value = points * rate;
          const net = Math.max(0, total - value);

          // Set payment details: we will complete remaining by cash automatically
          this.groupPos.pos_data.payment_details = {
            payment_method: 'cash',
            amount: net,
            received_amount: net,
            change_amount: 0,
            redeem_points: points
          };

          const saleResult = await this.groupPos.saveSale(this.station.slug, true, this.internal);
          if (saleResult && saleResult.sale_id) {
            await this.processSaleAndPrintReload(saleResult.sale_id);
          }

          this.$swal({title: 'Success', text: 'Loyalty redemption applied successfully.', icon: 'success'});
          await this.refreshShiftUi();
          this.reloadSalesDetails();
          this.showPaymentModal = false;
          this.selectedItems = [];
          if (this.groupPos && typeof this.groupPos.clearItems === 'function') {
            this.groupPos.clearItems();
          } else if (this.groupPos && this.groupPos.pos_data) {
            this.groupPos.pos_data.items = [];
          }
          this.nextIndex = 0;
          return;
        } catch (e) {
          console.error('Loyalty payment error', e);
          this.$swal({title: 'Error', text: 'Failed to apply loyalty redemption.', icon: 'error'});
          return;
        }
      }
      let data;
      this.loading = true;
      // Handle cash payment
      if (type === 'cash') {
        this.cash_loading = true;
        try {

          // Save the selected items to the POS
          await this.saveSelectedItemsToPos();
          // Set payment details in pos_data before saving
          this.groupPos.pos_data.payment_details = {
            payment_method: 'cash',
            amount: this.custom_payment.cash.amount, // This is the actual cash amount (total payable)
            received_amount: this.custom_payment.cash.received_amount, // Amount received from customer
            change_amount: this.custom_payment.cash.change_amount, // Change to be given back
            total_cash_payment: this.custom_payment.cash.received_amount // Total cash payment submitted
          };

          const saleResult = await this.groupPos.saveSale(this.station.slug, true, this.internal);
          // Redirect to print receipt
          if (saleResult && saleResult.sale_id) {
            await this.processSaleAndPrintReload(saleResult.sale_id);
          }


          this.$swal({
            title: 'Payment Successful',
            text: 'Cash payment has been processed successfully.',
            icon: 'success',
            confirmButtonText: 'OK'
          });

          await this.refreshShiftUi();
          this.reloadSalesDetails();
          // Close the payment modal
          this.showPaymentModal = false;
          // Clear the selected items and reset POS-cart after successful billing/printing
          this.selectedItems = [];
          if (this.groupPos && typeof this.groupPos.clearItems === 'function') {
            this.groupPos.clearItems();
          } else if (this.groupPos && this.groupPos.pos_data) {
            // Fallback: clear items array directly
            this.groupPos.pos_data.items = [];
          }
          // Reset index counter to avoid gaps after clearing cart
          this.nextIndex = 0;

          // Redirect to print receipt
          setTimeout(() => {
            // window.location.reload();
          }, 1500);

          this.cash_loading = false;
          return;
        } catch (error) {
          console.error('Error processing cash payment:', error);
          this.$swal({
            title: 'Error',
            text: 'Failed to process cash payment. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          this.cash_loading = false;
          return;
        }
      } else if (type === 'mpesa') {
        data = {
          mobile_number: this.custom_payment.mpesa.mobile_number,
          amount: this.custom_payment.mpesa.amount,
          type: 'mpesa'
        };
        this.mpesa_loading = true;
      } else if (type === 'mpesa_manual') {
        try {
          // Validate amount is not less than payable
          const payable = Number(this.totals.totalPayable || 0);
          const enteredAmount = Number(this.custom_payment.mpesa.amount || 0);
          if (enteredAmount < payable) {
            this.$swal && this.$swal({
              title: 'Invalid Amount',
              text: 'M-Pesa amount cannot be less than the total payable.',
              icon: 'warning'
            });
            this.loading = false;
            return;
          }
          // Save items to POS before finalizing sale
          await this.saveSelectedItemsToPos();
          const amount = enteredAmount || payable;
          const code = this.custom_payment.mpesa.code;
          const payload = {
            type: 'mpesa_manual',
            amount: amount,
            code: code,
            patient_id: this.groupPos?.pos_data?.customer_data?.patient_id || null
          };
          const response = await this.payment.requestCustomClientPayment(payload);
          if (response && (response.status === 'success' || response.alert === 'success')) {
            // Set payment details and finalize sale
            //Attach transaction id here so that we can now use it to track to evaluation payments
            this.groupPos.pos_data.payment_details = {
              payment_method: 'mpesa',
              amount: amount,
              code: code,
              transaction_id: response.transaction_id
            };
            const saleResult = await this.groupPos.saveSale(this.station.slug, true, this.internal);
            if (saleResult && saleResult.sale_id) {
              await this.processSaleAndPrintReload(saleResult.sale_id);
            }
            this.$swal({title: 'Payment Recorded', text: 'Manual M-Pesa entry saved successfully.', icon: 'success'});
            await this.refreshShiftUi();
            this.reloadSalesDetails();
            this.showPaymentModal = false;
            // Clear cart
            this.selectedItems = [];
            if (this.groupPos && typeof this.groupPos.clearItems === 'function') {
              this.groupPos.clearItems();
            } else if (this.groupPos && this.groupPos.pos_data) {
              this.groupPos.pos_data.items = [];
            }
            this.loading = false;

            return;
          } else {
            const msg = (response && response.message) ? response.message : 'Failed to save manual M-Pesa entry.';
            this.$swal({title: 'Error', text: msg, icon: 'error'});
            this.loading = false;
            return;
          }
        } catch (e) {
          console.error('Manual Mpesa error', e);
          this.$swal({title: 'Error', text: 'Failed to save manual M-Pesa entry.', icon: 'error'});
          this.loading = false;
          return;
        }
      } else if (type === 'pesapal') {
        // Use the generic client payment request flow for Pesapal
        this.pesapal_loading = true;

        // Save selected items to localStorage before initiating pesapal payment
        localStorage.setItem('pesapal_selected_items', JSON.stringify(this.selectedItems));

        data = {
          mobile_number: this.pesapal_order_mobile_number || this.custom_payment.pesapal.mobile_number,
          amount: Number(this.custom_payment.pesapal.amount || 0).toFixed(1),
          type: 'pesapal',
          patient_id: this.groupPos?.pos_data?.customer_data?.patient_id || null
        };
      } else if (type === 'giftcard') {
        await this.saveSelectedItemsToPos();
        data = {
          type: 'giftcard',
          amount: this.custom_payment.gift_card.amount,
          code: this.custom_payment.gift_card.code,
          items: this.products
        };
        this.gift_card_loading = true;

      } else if (type === 'voucher') {

        await this.saveSelectedItemsToPos();
        // Set payment details in pos_data before saving

        this.voucher_loading = true;
        data = {
          type: 'voucher',
          amount: this.custom_payment.voucher.amount,
          code: this.voucherAccount.code,
          items: this.products
        };

      }

      // For non-cash payments, proceed with the API call
      if (type !== 'cash') {

        const response = await this.payment.requestCustomClientPayment(data);
        if (type === 'pesapal' && response && response.status === 'success') {
          this.pesapal_loading = false;
          // Store the transaction ID and code for later processing

          if (response.raw.txntoken) {
            this.custom_payment.pesapal.code = response.raw.txntoken;
            this.custom_payment.pesapal.transaction_id = response.raw.txntoken;
          }


          // Show success message and wait for process payment button
          this.$swal({
            title: 'Payment Initiated',
            text: 'Pesapal payment has been initiated successfully. Please click "Process Payment" to finalize the transaction.',
            icon: 'success',
            confirmButtonText: 'OK'
          });

          // Keep the payment modal open so user can process the payment
          this.showPaymentModal = true;

        } else if (type === 'pesapal' && response && response.status === 'pending') {
          // Long-lived initiate: tell the user to complete payment on terminal
          this.pesapal_loading = false;
          this.loading = false;
          if (response.order_tracking_id) {
            localStorage.setItem('pesapal_order_tracking_id', response.order_tracking_id);
          }
          this.$swal({
            title: 'Processing on Terminal',
            text: 'Transaction sent to terminal. Please complete the payment on the terminal. We will update once it finishes.',
            icon: 'info',
            confirmButtonText: 'OK'
          });
          // Keep the payment modal open so user can retry or switch if needed
          this.showPaymentModal = true;
        } else if (type === 'voucher') {

          // Show success message
          const saleResult = await this.groupPos.saveSale(this.station.slug, true, this.internal);
          // Redirect to print receipt
          if (saleResult && saleResult.sale_id) {
            await this.processSaleAndPrintReload(saleResult.sale_id);
          }

          this.$swal({
            title: 'Payment Successful',
            text: 'Voucher payment has been processed successfully.',
            icon: 'success',
            confirmButtonText: 'OK'
          });

          this.manualVoucherCode = null;


          this.selectedItems = [];
          if (this.groupPos && typeof this.groupPos.clearItems === 'function') {
            this.groupPos.clearItems();
          } else if (this.groupPos && this.groupPos.pos_data) {
            this.groupPos.pos_data.items = [];
          }
          this.voucherAccount.balance = response.voucher_balance;
          this.voucherAccount.times_used = this.voucherAccount.times_used + 1;
          this.voucher_loading = false;


          await this.fetchShiftStatus();
          this.reloadSalesDetails();

        } else if (type === 'giftcard' && response.alert === 'success') {

          // Show success message
          this.$swal({
            title: 'Payment Successful',
            text: 'GiftCard payment has been processed successfully.',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.gift_card_loading = false;


          const saleResult = await this.groupPos.saveSale(this.station.slug, true, this.internal);
          // Redirect to print receipt
          if (saleResult && saleResult.sale_id) {
            await this.processSaleAndPrintReload(saleResult.sale_id);
          }


          await this.refreshShiftUi();
          this.reloadSalesDetails();

          this.selectedItems = [];
          if (this.groupPos && typeof this.groupPos.clearItems === 'function') {
            this.groupPos.clearItems();
          } else if (this.groupPos && this.groupPos.pos_data) {
            this.groupPos.pos_data.items = [];
          }


        } else if (response.transaction_id) {
          //here we initiated stk push and are waiting for callback resp...
          this.initiatePaymentChecks(type, response.transaction_id);
        } else if (type === 'pesapal' && response && response.raw && response.raw.responsecode) {
          // Handle long-running terminal response after user action
          const code = response.raw.responsecode;
          const desc = response.raw.responsedesc || '';
          const msg = response.raw.responsemsg || '';
          this.pesapal_loading = false;
          if (code === 'P0') {
            // Store transaction code from terminal response
            if (response.raw.txntoken) {
              this.custom_payment.pesapal.code = response.raw.txntoken;
              this.custom_payment.pesapal.transaction_id = response.transaction_id;
            }
            if (response.transaction_id) {
              this.custom_payment.pesapal.transaction_id = response.transaction_id;
            }

            // Show success message and wait for process payment button
            this.$swal({
              title: 'Payment Approved',
              text: 'Pesapal payment has been approved. Please click "Process Payment" to finalize the transaction.',
              icon: 'success',
              confirmButtonText: 'OK'
            });

            // Keep payment modal open so user can process the payment
            this.showPaymentModal = true;
          } else {
            // Declined or user cancel
            localStorage.removeItem('pesapal_order_tracking_id');
            this.$swal({title: 'Payment Not Completed', text: `${desc} ${msg}`.trim(), icon: 'warning'});
            // Keep payment modal open to retry
            this.showPaymentModal = true;
          }
        } else if (response.alert === 'error') {
          this.loading = false;
          this.pesapal_loading = false;
          this.mpesa_loading = false;

          // Display error message from description array if available
          if (response.description && Array.isArray(response.description) && response.description.length > 0) {
            this.$swal({
              title: 'Error',
              text: response.description[0],
              icon: 'error',
              confirmButtonText: 'OK'
            });
            this.loading = false;
            this.voucher_loading = false;
            this.gift_card_loading = false;
          }
        }
      }
    },


    customerSelected(customer) {
    console.log('Customer selected:', customer);
      if (!customer) return;

      this.groupPos.pos_data.customer_data.patient_id = customer.id;

      // Inline loyalty flags from search result when available

            const corpId = this.getCorporateIdFromPayload(customer);
      this.groupPos.pos_data.customer_data.corporate_account_id = corpId;
      // Optionally cache corporateAccount object if you fetch it elsewhere
      if (corpId && !this.corporateAccount) {
        this.corporateAccount = { id: corpId };
      }
      if (customer && (customer.points_eligible !== undefined || customer.points_balance !== undefined)) {

        this.selectedCustomerLoyalty.eligible = !!customer.points_eligible;

        this.selectedCustomerLoyalty.balance = Number(customer.points_balance || 0);

      } else {

        this.selectedCustomerLoyalty.eligible = false;

        this.selectedCustomerLoyalty.balance = 0;

      }

      // Also fetch current points/rate from backend as source of truth

      this.fetchLoyaltyInfo(customer.id);

    },

    userSelected(user) {
      if (!user) return;
      this.groupPos.pos_data.customer_data.staff_id = user.id;
    },
    submitOrder() {

      if (this.selectedItems.length === 0) return; // Don't submit if no selection for item and customer

      // Check for zero price items before allowing submission
      if (this.hasZeroPriceItems) {
        this.$swal({
          title: 'Cannot Submit Order',
          text: 'You cannot submit an order with items that have zero price. Please remove or update the price of these items.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      // Check for zero line total items before allowing submission
      if (this.hasZeroLineTotalItems) {
        this.$swal({
          title: 'Cannot Submit Order',
          text: 'You cannot submit an order with items that have zero line total (quantity × price = 0). Please remove or update these items.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }


      this.groupPos.pos_data.customer_data.type = this.isStaff ? 'staff' : 'existing_patient';


      if (!this.isStaff && this.groupPos.pos_data.customer_data.patient_id === null) {
        this.groupPos.pos_data.customer_data.patient_id = 276430;

      }


      // Reset all payment amounts to null - users must explicitly enter amounts
      // This ensures users only submit payment methods they consciously choose
      this.custom_payment.cash.amount = 0;
      this.custom_payment.cash.received_amount = 0;
      this.custom_payment.cash.change_amount = 0;

      this.custom_payment.mpesa.amount = null;
      this.custom_payment.pesapal.amount = null;
      this.custom_payment.gift_card.amount = null;
      this.custom_payment.voucher.amount = null;
      this.custom_payment.card.amount = null;
      this.custom_payment.cheque.amount = null;
      this.custom_payment.loyalty.amount = null;
      this.custom_payment.loyalty.points = 0;
      this.custom_payment.loyalty.value = 0;

      // Fetch loyalty information if a customer is selected
      if (this.selectedCustomerId) {
        this.fetchLoyaltyInfo(this.selectedCustomerId);
      }

      this.showPaymentModal = true; // Open modal
    },
    openProductSearchSettings() {
      alert('Open product search settings modal');
    },
    addProduct(item) {
      // Calculate the final price for validation
      const finalPrice = (item.discount_price && item.discount_price > 0) ? item.discount_price : (item.price || item.cash_price || 0);

      // Check if price is zero and show alert
      if (finalPrice === 0) {
        this.$swal({
          title: 'Cannot Add Product',
          text: 'You cannot bill a product with price zero. Please check the product price before adding to cart.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return; // Prevent adding the product
      }

      // Check if the product already exists in the selected items
      //  Since the product is stored as a name string, we need to compare with item.name
      const existingItem = this.selectedItems.find(i =>
          (i.product === item.name) ||
          (i.name === item.name && i.sub_sku === item.sub_sku)
      );

      if (existingItem) {
        existingItem.quantity += 1;
        // Update subtotal after changing quantity
        this.updateSubtotal(existingItem);
      } else {

        // Not using uniqueId here, but keeping for consistency
        // const uniqueId = Date.now() + Math.random(); // Ensures uniqueness

        // Make sure we have a valid index for the item
        this.groupPos.addNewRow('item');
        const index = this.nextIndex++;
        this.groupPos.itemSelected(index, item);


        const newItem = {
          id: item.store_product_id ?? item.id,
          product_id: item.id,
          product: item.name,
          quantity: item.quantity ? item.quantity : 1,
          price: finalPrice,
          name: item.name,
          variation: item.variation,
          sub_sku: item.sub_sku,
          has_discount: (item.discount_price && item.discount_price > 0),
          staff: null,
          store_id: this.selectedStoreId,
          photo_url: item.photo_url,
          photo: item.photo,
          bulk_pay_quantity: item.bulk_pay_quantity,
          bulk_percentage_discount: item.bulk_percentage_discount,
          bulk_quantity_range: item.bulk_quantity_range,
          bulk_price: item.bulk_price

        };


        this.selectedItems.push(newItem);

        // Update totals after adding new item
        this.updateTotals();
      }
    },
    addItem() {
      this.selectedItems.push({
        id: Math.floor(Date.now()),
        product: null,
        quantity: 1,
        price: 0,
        staff: null
      });
      // Update totals after adding new-item
      this.updateTotals();
    },
    removeItem(item) {
      this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
    },
    selectProduct(product) {
      // Calculate the final price for validation
      const finalPrice = (product.discount_price && product.discount_price > 0) ? product.discount_price : (product.price || product.cash_price || 0);

      // Check if price is zero and show alert
      if (finalPrice === 0) {
        this.$swal({
          title: 'Cannot Add Product',
          text: 'You cannot bill a product with price zero. Please check the product price before adding to cart.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return; // Prevent adding the product
      }

      // Check if the product already exists in the selected items
      // Since product is stored as a name string, we need to compare with product.name
      // We can also use sub_sku as a more reliable unique identifier if available
      const existingItem = this.selectedItems.find(i =>
          (i.product === product.name && i.sub_sku === product.sub_sku) ||
          (i.name === product.name && i.sub_sku === product.sub_sku)
      );

      if (existingItem) {
        // If product already exists, just increase the quantity
        existingItem.quantity += 1;
        // Update subtotal after changing quantity
        this.updateSubtotal(existingItem);
      } else {
        // Make sure we have a valid index for the item
        this.groupPos.addNewRow('item');

        // Call groupPos.itemSelected with the current index
        const index = this.nextIndex++;
        this.groupPos.itemSelected(index, product);

        // If product doesn't exist, add it as a new item
        // Use product's original ID if available, otherwise use an integer timestamp
        const uniqueId = product.id || Math.floor(Date.now());
        const item = {
          id: uniqueId,
          product: product.name,
          quantity: 1,
          price: finalPrice,
          name: product.name,
          variation: product.variation,
          sub_sku: product.sub_sku,
          has_discount: (product.discount_price && product.discount_price > 0),
          staff: null,
          photo_url: product.photo_url,
          photo: product.photo,
          bulk_pay_quantity: product.bulk_pay_quantity,
          bulk_percentage_discount: product.bulk_percentage_discount,
          bulk_quantity_range: product.bulk_quantity_range,
          bulk_price: product.bulk_price

        };
        this.selectedItems.push(item);
        // Update totals after adding new item
        this.updateTotals();
      }
    },
    async pickupAndPrint() {
      // capture details before API call
      const details = {
        amount: Number(this.pickup.totalcash || 0),
        cashier_id: this.pickup.cashier_id,
        picked_by_id: this.pickup.picked_by_id
      };
      try {
        const ok = await this.submitPickup();
        if (ok) {
          this.printPickupReceipt(details);
        }
      } catch (e) { /* no-op */
      }
    },
    printPickupReceipt(details) {
      try {
        const d = details || {};
        const w = window.open('', 'pickup', 'width=400,height=600');
        if (!w) return;
        const now = new Date();
        const cashierName = (this.staff || []).find(u => Number(u.id) === Number(d.cashier_id))?.full_name || '';
        const pickedByName = (this.staff || []).find(u => Number(u.id) === Number(d.picked_by_id))?.full_name || '';

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cash Pickup Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 15px; font-size: 12px; line-height: 1.4; }
            .header { text-align: center; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .title { font-size: 16px; font-weight: bold; margin: 8px 0 5px; }
            .subtitle { font-size: 12px; margin: 2px 0; color: #555; }
            .divider { border-top: 1px dashed #000; margin: 12px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
            .label { font-weight: bold; }
            .company-logo { max-width: 150px; max-height: 80px; margin: 0 auto 10px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="header">
            ${this.organization.receipt_logo ? `<img src="${this.organization.receipt_logo}" class="company-logo" alt="Company Logo">` : ''}
            <div class="title">CASH PICKUP RECEIPT</div>
            <div class="subtitle">${this.organization.name || 'ORGANIZATION'}</div>
            <div class="subtitle">${this.station?.name || 'POS TERMINAL'}</div>
            <div class="subtitle">${this.station?.location || ''}</div>
            ${this.organization.address ? `<div class="subtitle">${this.organization.address}</div>` : ''}
            ${this.organization.phone ? `<div class="subtitle">Tel: ${this.organization.phone}</div>` : ''}
          </div>

          <div class="divider"></div>

          <div class="row"><span class="label">Date/Time:</span><span>${now.toLocaleString()}</span></div>
          <div class="row"><span class="label">Amount:</span><span><b>${this.formatCurrency(Number(d.amount || 0))}</b></span></div>
          <div class="row"><span class="label">Cashier:</span><span>${cashierName}</span></div>
          <div class="row"><span class="label">Picked By:</span><span>${pickedByName}</span></div>
        </body>
        </html>`;

        w.document.write(html);
        w.document.close();
        w.focus();
        w.print();
      } catch (e) { /* no-op */
      }
    },
    openCloseShiftDialog() {
      // ensure we have latest system figure
      this.fetchShiftStatus().finally(() => {
        this.closeShiftDialog = true;
      });
    },
    computeClosingVariance() {
      const sys = Number(this.closeShift.system_closing_balance || 0);
      const cas = Number(this.closeShift.cashier_closing_balance || 0);
      this.closeShift.closing_variance = cas - sys;
    },
    async submitCloseShift() {
      try {
        this.shiftLoading = true;
        const payload = {
          system_closing_balance: Number(this.closeShift.system_closing_balance || 0),
          cashier_closing_balance: Number(this.closeShift.cashier_closing_balance || 0),
          closing_variance: Number(this.closeShift.closing_variance || 0),
          close_confirmed_by_id: this.closeShift.close_confirmed_by_id || null,
          close_confirmed_by: this.closeShift.close_confirmed_by || ''
        };
        const resp = await axios.post('/api/reception/shift/close', payload);

        if (resp && resp.data) {
          this.closeShiftDialog = false;
          // this.$toast && this.$toast.success && this.$toast.success('Shift closed successfully');
          // refresh status
          // await this.refreshShiftUi();
          return true;
        }
      } catch (e) {
        const msg = (e && e.response && (e.response.data?.message || e.response.data?.error)) || e.message || 'Failed to close shift';
        alert(msg);
        return false;
      } finally {
        this.shiftLoading = false;
      }
      return false;
    },
    openPickupDialog() {
      // prepare defaults
      if (!this.pickup.cashier_id) {
        this.pickup.cashier_id = this.userId ? Number(this.userId) : null;
      }
      this.pickupDialog = true;
    },
    async submitPickup() {
      try {
        const amt = Number(this.pickup.totalcash || 0);
        if (isNaN(amt) || amt <= 0) {
          this.$swal({title: 'Invalid Amount', text: 'Enter a valid amount', icon: 'error'});
          return false;
        }
        if (!this.pickup.cashier_id || !this.pickup.picked_by_id) {
          this.$swal({title: 'Missing Information', text: 'Select cashier and personnel picking up', icon: 'error'});
          return false;
        }
        this.shiftLoading = true;
        const payload = {
          totalcash: amt,
          cashier_id: this.pickup.cashier_id,
          picked_by_id: this.pickup.picked_by_id,
        };
        const resp = await axios.post('/api/reception/shift/pickup', payload);
        if (resp && resp.data) {
          this.pickupDialog = false;
          alert('Cash pickup recorded');
          // Refresh status to reflect deduction
          await this.fetchShiftStatus();
          // reset
          this.pickup = {totalcash: 0, cashier_id: this.userId ? Number(this.userId) : null, picked_by_id: null};
          return true;
        }
      } catch (e) {
        const msg = (e && e.response && (e.response.data?.message || e.response.data?.error)) || e.message || 'Failed to record cash pickup';
        alert(msg);
        return false;
      } finally {
        this.shiftLoading = false;
      }
      return false;
    },

    printCurrentShift() {
      try {
        const data = this.currentShiftCard || {};
        const w = window.open('', 'current-shift', 'width=500,height=800');
        if (!w) return;

        const nl = (v) => (v === null || v === undefined ? '' : v);
        const fmt = (n) => this.formatCurrency(Number(n || 0));
        const opened = this.formatDateTime(nl(data.opened_at));
        const cashierName = nl(data.cashier_name);
        const confirmerName = nl(data.confirmed_by);

        const content = `
      <!DOCTYPE html>
      <html>

      <head>
        <title>Current Shift</title>
        <style>
          @page { size: auto; margin: 5mm; }
          body { font-family: Arial, sans-serif; padding: 10px; font-size: 12px; }
          .header { text-align: center; margin-bottom: 10px; }
          .logo { max-width: 150px; max-height: 80px; margin-bottom: 5px; }
          .title { font-size: 16px; font-weight: bold; margin: 5px 0; }
          .subtitle { font-size: 12px; margin: 3px 0; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .label { font-weight: bold; }
          .section { margin: 10px 0; }
          .section-title { font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #eee; padding-bottom: 3px; }
          .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
          .signature { width: 45%; text-align: center; }
          .signature-line { border-top: 1px solid #000; margin: 5px auto; width: 100%; }
          .footer { margin-top: 20px; font-size: 10px; text-align: center; }
        </style>
      </head>
      <body onload="window.print();">
        <div class="header">
          ${this.organization.receipt_logo ? `<img src="${this.organization.receipt_logo}" class="logo" alt="Company Logo">` : ''}
          <div class="title">CURRENT SHIFT REPORT</div>
          <div class="subtitle">${this.organization.name || 'ORGANIZATION'}</div>
          <div class="subtitle">${this.station?.name || 'POS TERMINAL'}</div>
          <div class="subtitle">${this.station?.location || ''}</div>
          ${this.organization.address ? `<div class="subtitle">${this.organization.address}</div>` : ''}
          ${this.organization.phone ? `<div class="subtitle">Tel: ${this.organization.phone}</div>` : ''}
        </div>

        <div class="divider"></div>

        <div class="row"><span class="label">Cashier:</span><span>${cashierName}</span></div>
        <div class="row"><span class="label">Shift Start:</span><span>${opened}</span></div>
        ${confirmerName ? `<div class="row"><span class="label">Confirmed By:</span><span>${confirmerName}</span></div>` : ''}

        <div class="divider"></div>

        <div class="section">
          <div class="section-title">BALANCES</div>
          <div class="row"><span>Opening Balance:</span><span>${fmt(data.opening_balance)}</span></div>
          <div class="row"><span>Cashier Closing Balance:</span><span>${fmt(data.cashier_closing_balance)}</span></div>
          <div class="row"><span>System Closing Balance:</span><span>${fmt(data.system_closing_balance)}</span></div>
        </div>

        <div class="section">
          <div class="section-title">SALES SUMMARY</div>
          <div class="row"><span>Total Sales (All):</span><span>${fmt(data.total_sales)}</span></div>
          <div class="row"><span>Cash Sales:</span><span>${fmt(data.cash_sales)}</span></div>
          <div class="row"><span>M-Pesa Sales:</span><span>${fmt(data.mpesa_sales)}</span></div>
          <div class="row"><span>Card Sales:</span><span>${fmt(data.card_sales)}</span></div>
          <div class="row"><span>Total Pickups:</span><span>${fmt(data.total_pickups)}</span></div>
          <div class="row"><span>Cash at Hand:</span><span>${fmt(data.cash_at_hand)}</span></div>
        </div>

        <div class="signature-section">
          <div class="signature">
            <div class="signature-line"></div>
             <div>Cashier:</div>
            <div>${cashierName}</div>
            <div>${opened}</div>
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <div>Confirmed By</div>
            <div>${confirmerName || ''}</div>
          </div>
        </div>

        <div class="footer">
          Printed at ${new Date().toLocaleString()}<br>
          ${this.organization.name || ''} - ${new Date().getFullYear()}
        </div>
      </body>
      </html>
    `;

        w.document.open();
        w.document.write(content);
        w.document.close();
        w.focus();
      } catch (e) {
        console.error('Error printing current shift:', e);
      }
    },

    async fetchStores() {
      try {
        // Reset page counter
        this.page = 1;

        this.stores = await this.groupPos.fetchStores();

        if (this.stores.length > 0) {
          // Select the first store by default
          this.selectedStoreId = this.stores[0].id;
          this.station.store_id = this.selectedStoreId;

          // Fetch products for the selected store with pagination
          const params = {
            store_id: this.station.store_id,
            pagination: true,
            page: this.page,
            per_page: this.perPage
          };

          const response = await this.groupPos.fetchProducts({params});

          // Show initial products
          this.sidebar_products = response.data;

          // Reset the infinite loader if it exists
          this.$nextTick(() => {
            if (this.$refs.infiniteLoader) {
              this.$refs.infiniteLoader.$emit('$InfiniteLoading:reset');
            }
          });
        }
      } catch (error) {
        console.error('Error fetching stores or products:', error);
      }
    },

    init() {
      this.setupDefaultCustomerType();
    },
    setupDefaultCustomerType() {
      if (this.station && this.customerTypes) {
        this.groupPos.pos_data.customer_data.type = this.customerTypes[0];
      } else {
        this.groupPos.pos_data.customer_data.type = 'walkin';
      }
    },

    loadHeldSales() {
      try {
        const key = this.heldStorageKey();
        const raw = localStorage.getItem(key);
        this.heldSales = raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.warn('Failed to load held sales', e);
        this.heldSales = [];
      }
    },
    saveHeldSales() {
      try {
        const key = this.heldStorageKey();
        localStorage.setItem(key, JSON.stringify(this.heldSales || []));
      } catch (e) {
        console.warn('Failed to save held sales', e);
      }
    },
    heldStorageKey() {
      const slug = (this.station && this.station.slug) ? this.station.slug : 'default';
      return `pos_held_sales_${slug}`;
    },

    clearCurrentCart() {
      // Clear visual cart
      this.selectedItems = [];
      this.totals = {subtotal: 0, discount: 0, tax: 0, totalPayable: 0};

      // Clear customer selection and loyalty
      this.clearCustomerAfterSale();

      // Optionally clear underlying groupPos items buffer (safe since we rebuild from selectedItems when paying)
      if (this.groupPos) {
        if (typeof this.groupPos.clearItems === 'function') {
          try {
            this.groupPos.clearItems();
          } catch (e) {
          }
        } else if (this.groupPos.pos_data) {
          this.groupPos.pos_data.items = [];
        }
      }
    },

    // Reset loyalty banner and selected patient search after finishing a sale
    resetCustomerSelectionAndLoyalty() {
      try {
        // Clear inline loyalty display flags
        if (this.selectedCustomerLoyalty) {
          this.selectedCustomerLoyalty.eligible = false;
          this.selectedCustomerLoyalty.balance = 0;
        }
        // Clear loyalty payment state
        if (this.custom_payment && this.custom_payment.loyalty) {
          this.custom_payment.loyalty.available = 0;
          this.custom_payment.loyalty.rate = 0;
          this.custom_payment.loyalty.points = 0;
          this.custom_payment.loyalty.value = 0;
          this.custom_payment.loyalty.amount = 0;
        }
        // Clear selected patient in pos_data
        if (this.groupPos && this.groupPos.pos_data && this.groupPos.pos_data.customer_data) {
          this.groupPos.pos_data.customer_data.patient_id = null;
        }
        // Ask the search component to clear its selection/input via prop signal
        this.patientClearSignal++;
      } catch (e) {
        // No-op: best-effort cleanup
        console.warn('Failed to reset customer/loyalty state', e);
      }
    },

    // Multiple payment mode methods
    shouldRenderPanel(mode) {
      return mode.active;
    },

    // Enhanced payment validation methods (matching CustomCreate.vue)
    calculateTotalPaidAmount() {
      let total = 0;
      total += parseFloat(this.custom_payment.cash.amount || 0);

      // Only include M-Pesa amount if code is provided
      const mpesaCode = (this.custom_payment.mpesa.code || '').trim();
      if (mpesaCode) {
        total += parseFloat(this.custom_payment.mpesa.amount || 0);
      }

      // Only include Pesapal amount if code is provided
      const pesapalCode = (this.custom_payment.pesapal.code || '').trim();
      if (pesapalCode) {
        total += parseFloat(this.custom_payment.pesapal.amount || 0);
      }

      total += parseFloat(this.custom_payment.card?.amount || 0);
      total += parseFloat(this.custom_payment.cheque?.amount || 0);
      total += parseFloat(this.custom_payment.voucher?.amount || 0);
      total += parseFloat(this.custom_payment.gift_card?.amount || 0);
      // For loyalty prefer value if present
      total += parseFloat((this.custom_payment.loyalty && (this.custom_payment.loyalty.value || this.custom_payment.loyalty.amount)) || 0);
      return total;
    },

    // Sum of all other payments excluding a given mode
    remainingFor(mode) {
      const payable = Number(this.totals?.totalPayable || 0);
      const amounts = {
        cash: parseFloat(this.custom_payment.cash?.amount || 0),
        mpesa: parseFloat(this.custom_payment.mpesa?.amount || 0),
        pesapal: parseFloat(this.custom_payment.pesapal?.amount || 0),
        card: parseFloat(this.custom_payment.card?.amount || 0),
        cheque: parseFloat(this.custom_payment.cheque?.amount || 0),
        voucher: parseFloat(this.custom_payment.voucher?.amount || 0),
        giftcard: parseFloat(this.custom_payment.gift_card?.amount || 0),
        loyalty: parseFloat((this.custom_payment.loyalty && (this.custom_payment.loyalty.value || this.custom_payment.loyalty.amount)) || 0)
      };
      let others = 0;
      Object.keys(amounts).forEach(k => {
        if (k !== mode) others += amounts[k] || 0;
      });
      return Math.max(0, payable - others);
    },

    // Clamp a specific payment amount to remaining balance for that mode
    clampPaymentAmount(mode) {
      try {
        const max = this.remainingFor(mode);
        const totalPayable = Number(this.totals?.totalPayable || 0);
        if (!this.custom_payment[mode]) return;

        let val = parseFloat(this.custom_payment[mode].amount || 0);
        if (isNaN(val) || val < 0) val = 0;

        // Check if this amount was previously auto-adjusted and user is now manually entering a value
        const wasAutoAdjusted = this.clampNotice && this.clampNotice[mode] &&
            this.clampNotice[mode].includes('Amount adjusted to remaining payable');

        // If user manually enters an amount after auto-adjustment, reset to full payable for this method
        if (wasAutoAdjusted && val > 0 && val !== max) {
          // Reset to full payable amount for this payment method
          val = totalPayable;
        } else if (val > max) {
          // Normal clamp to maximum remaining
          val = max;
        }

        // Assign the value
        this.custom_payment[mode].amount = val;

        // Update clamp notice for all payment methods
        if (this.clampNotice) {
          if (val === max && max < totalPayable) {
            this.clampNotice[mode] = `Amount adjusted to remaining payable (${this.formatCurrency(max)})`;
          } else if (val === totalPayable && wasAutoAdjusted) {
            this.clampNotice[mode] = `Amount reset to full payable (${this.formatCurrency(totalPayable)})`;
          } else {
            this.clampNotice[mode] = '';
          }
        }
      } catch (e) {
        /* no-op */
      }
    },

    getRemainingBalance() {
      const totalPayable = parseFloat(this.totals.totalPayable || 0);
      const totalPaid = this.calculateTotalPaidAmount();
      return Math.max(0, totalPayable - totalPaid);
    },

    getChangeAmount() {
      const totalPayable = parseFloat(this.totals.totalPayable || 0);
      const totalPaid = this.calculateTotalPaidAmount();
      return Math.max(0, totalPaid - totalPayable);
    },

    getBalanceClass() {
      const balance = this.getRemainingBalance();
      if (balance === 0) return 'text-success';
      if (balance > 0) return 'text-warning';
      return 'text-error';
    },

    canProcessPayment() {
      const totalPayable = parseFloat(this.totals.totalPayable || 0);
      const totalPaid = this.calculateTotalPaidAmount();

      // must not underpay and must have some payment
      if (totalPaid < totalPayable || totalPaid <= 0) {
        return false;
      }

      // Allow overpayment for cash (customer can pay more and receive change)
      // For non-cash payments, ensure they don't exceed payable amount
      const cashAmount = parseFloat(this.custom_payment.cash.received_amount || 0);
      const nonCashPaid = totalPaid - cashAmount;

      // If there's non-cash payment, it shouldn't exceed the payable amount
      if (nonCashPaid > totalPayable) {
        return false;
      }

      // M-Pesa validation: if amount is set, code must be provided
      const mpesaAmount = parseFloat(this.custom_payment.mpesa.amount || 0);
      if (mpesaAmount > 0) {
        const mpesaCode = (this.custom_payment.mpesa.code || '').trim();
        if (!mpesaCode) {
          return false;
        }
      }

      // Pesapal validation: if amount is set, code must be provided
      const pesapalAmount = parseFloat(this.custom_payment.pesapal.amount || 0);
      if (pesapalAmount > 0) {
        const pesapalCode = (this.custom_payment.pesapal.code || '').trim();
        if (!pesapalCode) {
          return false;
        }
      }

      // All validations passed
      return true;
    },

    async processMultiplePayments() {
      if (!this.canProcessPayment()) {
        this.$swal({
          title: 'Invalid Payment',
          text: 'Payment amount must be at least equal to total payable. Non-cash payments cannot exceed the total payable amount.',
          icon: 'error'
        });
        return;
      }

      this.paymentProcessing = true;

      try {
        // Save the POS items to the backend first
        await this.saveSelectedItemsToPos();

        // Set payment details for multiple modes
        this.groupPos.pos_data.payment_details = {
          payment_method: 'multiple',
          total_amount: this.totals.totalPayable,
          cash_amount: parseFloat(this.custom_payment.cash.amount || 0), // Actual cash amount used
          cash_received_amount: parseFloat(this.custom_payment.cash.received_amount || 0), // Total cash received from customer
          change_amount: parseFloat(this.custom_payment.cash.change_amount || 0), // Change to be given back
          mpesa_amount: parseFloat(this.custom_payment.mpesa.amount || 0),
          pesapal_amount: parseFloat(this.custom_payment.pesapal.amount || 0),
          card_amount: parseFloat(this.custom_payment.card.amount || 0),
          cheque_amount: parseFloat(this.custom_payment.cheque.amount || 0),
          voucher_amount: parseFloat(this.custom_payment.voucher.amount || 0),
          giftcard_amount: parseFloat(this.custom_payment.gift_card.amount || 0),
          loyalty_amount: parseFloat(this.custom_payment.loyalty.amount || 0),
          discount_amount:parseFloat(this.totals.discount || null),
          // Include specific payment details
          cash: this.custom_payment.cash,
          mpesa: this.custom_payment.mpesa,
          pesapal: this.custom_payment.pesapal,
          card: this.custom_payment.card,
          cheque: this.custom_payment.cheque,
          voucher: this.voucherAccount,
          giftcard: this.custom_payment.gift_card,
          loyalty: this.custom_payment.loyalty
        };

          if (!this.groupPos.pos_data.customer_data.corporate_account_id) {
           this.groupPos.pos_data.customer_data.corporate_account_id = this.getCorporateIdFromPayload(this.groupPos.pos_data.customer_data) || (this.corporateAccount && this.corporateAccount.id) || null;
         }
        const saleResult = await this.groupPos.saveSale(this.station.slug, true, this.internal);

        if (saleResult && saleResult.sale_id) {
          this.$swal({title: 'Payment Successful', text: 'Payment processed successfully!', icon: 'success'});
          this.showPaymentModal = false;
          this.clearCurrentCart();
          this.manualVoucherCode = null;
          this.manualGiftCardCode = null;


          this.showGiftCardInput = false;
          this.showVoucherInput = false;
          this.giftCardAccount = null;
          this.recentMpesa = [];
          this.recentMpesaError = '';

          this.resetPaymentForm();
          if (this.$refs.paymentModal) {
            this.$refs.paymentModal.reset();
          }

          // Enable auto-print for both single and multiple payment modes
          // if (this.isMultiplePaymentModeActive()) {
          // For multiple payment modes, also auto-print like single payment mode
          await this.processSaleAndPrintReload(saleResult.sale_id, saleResult.payment_id);

        } else {
          throw new Error('Failed to process payment');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        this.$toast.error('Failed to process payment: ' + error.message);
      } finally {
        this.paymentProcessing = false;
      }
    },

    resetPaymentForm() {
      this.custom_payment = {
        cash: {amount: 0, received_amount: 0, change_amount: 0},
        mpesa: {code: '', mobile_number: '', amount: 0, amount_to_pay: 0},
        pesapal: {email: '', amount: 0, mobile_number: '', transaction_id: null, code: ''},
        card: {type: '', number: '', name: '', valid_thru: '', amount: 0},
        cheque: {name: '', bank: '', date: '', branch: '', amount: 0, number: ''},
        voucher: {code: '', amount: 0},
        giftcard: {code: '', amount: 0},
        gift_card: {code: '', amount: 0},
        loyalty: {points: 0, amount: 0, available: 0, rate: 0, value: 0}
      };
    },

    isMultiplePaymentModeActive() {
      // Check if more than one payment mode has an amount > 0
      let activePaymentModes = 0;

      if (parseFloat(this.custom_payment.cash.amount || 0) > 0) activePaymentModes++;
      if (parseFloat(this.custom_payment.mpesa.amount || 0) > 0) activePaymentModes++;
      if (parseFloat(this.custom_payment.pesapal.amount || 0) > 0) activePaymentModes++;
      if (parseFloat(this.custom_payment.card.amount || 0) > 0) activePaymentModes++;
      if (parseFloat(this.custom_payment.cheque.amount || 0) > 0) activePaymentModes++;
      if (parseFloat(this.custom_payment.voucher.amount || 0) > 0) activePaymentModes++;
      if (parseFloat(this.custom_payment.gift_card.amount || 0) > 0) activePaymentModes++;
      if (parseFloat(this.custom_payment.loyalty.amount || 0) > 0) activePaymentModes++;

      return activePaymentModes > 1;
    },


    holdCurrentSale() {
      if (!Array.isArray(this.selectedItems) || this.selectedItems.length === 0) return;

      const id = Date.now();
      const cloneItems = JSON.parse(JSON.stringify(this.selectedItems));
      const cloneTotals = JSON.parse(JSON.stringify(this.totals));

      const meta = {
        customer_id: (this.groupPos && this.groupPos.pos_data && this.groupPos.pos_data.customer_data)
            ? this.groupPos.pos_data.customer_data.patient_id || null : null,
        customer_name: null, // not always available; can be enhanced if name is present in UI
        store_id: this.selectedStoreId || (this.station && this.station.store_id) || null,
        station_slug: (this.station && this.station.slug) || null,
      };

      const held = {
        id,
        items: cloneItems,
        totals: cloneTotals,
        meta,
        held_at: new Date().toISOString(),
      };

      this.loadHeldSales();
      this.heldSales.push(held);
      this.saveHeldSales();

      // Clear current cart so cashier can continue with next customer
      this.clearCurrentCart();

      this.$swal && this.$swal({
        title: 'Sale Held',
        text: 'The current sale has been placed on hold. You can resume it from Held Sales.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    },
    openHeldSalesDialog() {
      this.loadHeldSales();
      this.heldSalesDialog = true;
    },
    resumeHeldSale(sale) {
      if (!sale) return;

      if (sale.meta && sale.meta.store_id) {
        this.selectedStoreId = sale.meta.store_id;
      }
      this.selectedItems = JSON.parse(JSON.stringify(sale.items || []));
      this.totals = JSON.parse(JSON.stringify(sale.totals || {subtotal: 0, discount: 0, tax: 0, totalPayable: 0}));

      this.heldSales = (this.heldSales || []).filter(s => s.id !== sale.id);
      this.saveHeldSales();

      this.heldSalesDialog = false;
      this.updateTotals();

      this.$swal && this.$swal({
        title: 'Sale Resumed',
        text: 'Held sale has been restored to the cart.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    },
    removeHeldSale(sale) {
      if (!sale) return;
      this.heldSales = (this.heldSales || []).filter(s => s.id !== sale.id);
      this.saveHeldSales();
    },

  },
  async mounted() {
    await this.fetchShiftStatus();

    await this.fetchStaff();
    await this.fetchShiftHistory();
    await this.fetchOrganizationData();
    this.initializeDisplaySockets();
    if (this.posData) {
      this.station = JSON.parse(this.posData);
      if (this.station.customer_type) {
        this.customerTypes = JSON.parse(this.station.customer_type);
      }
    }
    if (this.$route.params.visitId) {
      this.visitId = this.$route.params.visitId
      this.groupPos.pos_data.customer_data.visit_id = this.$route.params.visitId;
    }
    await this.fetchStores();

    // Load held sales from storage
    this.loadHeldSales();

    // Add global keydown event listener for barcode scanning
    window.addEventListener('keydown', this.globalKeydownHandler);

    // Check for order_tracking_id in URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderTrackingId = urlParams.get('pesapal_order_tracking_id');

    // Restore selected items from localStorage if they exist
    const storedItems = localStorage.getItem('pesapal_selected_items');
    if (storedItems) {
      try {
        this.selectedItems = JSON.parse(storedItems);
        // Update totals after restoring items
        this.updateTotals();
      } catch (e) {
        console.error('Error parsing stored items:', e);
      }
    }

    const storedOrderTrackingId = localStorage.getItem('pesapal_order_tracking_id');
    if (storedOrderTrackingId) {
      this.checkOrderTrackingId(storedOrderTrackingId);
    }
    this.init();


  }

};
</script>
<style scoped>
/* Blur the page behind the dialog via overlay scrim */
::v-deep .v-overlay__scrim {
  backdrop-filter: blur(4px);
}

/* POS Card Styling */
.pos-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

label.theme--dark {
  color: black !important;
}

.pos-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.pos-card .v-card__title {
  font-size: 1.1rem;
  font-weight: 500;
  padding: 12px 16px;
}

.pos-card .v-card__text {
  padding: 16px;
}

/* Product Grid Card specific styling */
.product-grid-card {
  height: 100%;
}

.product-grid-card .v-card__text {
  padding: 12px;
  height: calc(100% - 48px);
  overflow-y: auto;
}

.infinite-loader-container {
  display: flex !important;
  justify-content: center !important;
  width: 100% !important;
  margin-top: 20px !important;
  position: relative !important;
  z-index: 1 !important;
}

@media screen {
  #print-area {
    display: none;
  }
}

@media print {
  body * {
    display: none !important;
  }

  #print-area {
    display: block !important;
  }
}

.product_box {
  cursor: pointer;
  transition: 0.2s;
  border-radius: 6px;
  height: 130px;
  display: flex;
  flex-direction: column;
}

.product_box:hover {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.product-tile {
  padding: 8px;
}

.product_box {
  cursor: pointer;
  height: 100%;
}

/* Product card styling */
.product-card {
  height: 100%;
  transition: all 0.2s ease;
  border-radius: 6px;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1) !important;
}

.product-image {
  height: 100px;
  background-color: #f5f5f5;
}

.product-details {
  background-color: white;
}

.product-name {
  font-size: 0.9rem;
  line-height: 1.2;
  margin-bottom: 4px;
}

.product-price {
  font-weight: 500;
  font-size: 0.95rem;
}

/* Summary cards styling */
.summary-card {
  transition: all 0.2s ease;
}

.summary-card:hover {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1) !important;
}

/* Table styling */
.pos-table {
  border-radius: 0;
}

.pos-table >>> th {
  font-weight: bold !important;
  text-align: center !important;
}


.pos-table >>> td {
  text-align: center !important;
  vertical-align: middle !important;
}

.quantity-field {
  max-width: 80px;
  margin: 0 auto;
}

.discount-field {
  max-width: 120px;
  margin: 0 auto;
}

.shift-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
}

.overlay-content {
  background: #fff;
  padding: 20px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.note-text {
  font-size: 0.8em;
}

.loyalty-banner {
  background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
  border: 1px solid #a5d6a7;
  border-radius: 8px;
  padding: 6px 10px;
}

.loyalty-banner .v-chip {
  margin-right: 6px;
}

</style>
