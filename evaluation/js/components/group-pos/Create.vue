<template>
  <div>

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
              :label="'Select all (' + selectedPosItems.length + ')'"
              hide-details
              dense
              @change="toggleInvoiceSelectAll"
          ></v-checkbox>
        </v-card-title>
        <v-card-text>
          <v-list dense two-line v-if="selectedPosItems.length">
            <v-list-item v-for="(item, idx) in selectedPosItems" :key="item.__invoiceKey || item.id || idx">
              <v-list-item-action>
                <v-checkbox
                    v-model="invoiceSelectedIds"
                    :value="item.__invoiceKey || computeInvoiceItemKey(item, item.__invoiceSource || 'item', idx)"
                    dense
                    hide-details
                />
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ idx + 1 }}. {{ item.product || item.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  Qty: {{ item.quantity }} • Price: {{ formatCurrency(item.selling_price) }} • Subtotal:
                  {{ formatCurrency((item.selling_price || 0) * (item.quantity || 0)) }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          <div v-else class="text-center grey--text">No items in cart</div>

          <v-divider class="my-3"></v-divider>

          <div class="d-flex justify-space-between">
            <div><strong>Total for selected items:</strong> {{ formatCurrency(invoiceSelectedTotal) }}</div>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="createInvoiceDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="invoiceLoading" @click="createInvoice" :disabled="selectedPosItems.length === 0">
            Create Invoice
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!--/ End of Create Invoice Dialog -->

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

    <v-card flat>
      <collabmed-loading v-if="!initialized"></collabmed-loading>
      <v-card-text v-else>
        <!-- customer setup and selection -->
        <div v-if="!internal">
          <div>
            <v-radio-group v-model="groupPos.pos_data.customer_data.type" row>
              <v-radio
                  v-for="(customerType, index) in groupPos.customer_types"
                  :key="index"
                  v-if="customerTypes.includes(customerType.value)"
                  :label="customerType.name"
                  :value="customerType.value"
              ></v-radio>
            </v-radio-group>
          </div>

          <v-row v-if="groupPos.pos_data.customer_data.type === 'staff' && customerTypes.includes('staff')">
            <v-col class="px-1" md="5" cols="3">
              <users-search
                  @results="staffSelected"
                  label="Search for user"
                  :search-input.sync="search"
                  outline
                  leaveSelected
              ></users-search>
            </v-col>
          </v-row>

          <v-row v-if="groupPos.pos_data.customer_data.type === 'corporate'">
            <v-col class="px-1" md="5" cols="3">
              <v-autocomplete :items="insuranceCompanies"
                              item-text="name"
                              item-value="id"
                              v-model="groupPos.pos_data.customer_data.corporate_id"
                              label="Search for insurance/corporate client"
                              outlined>
              </v-autocomplete>
            </v-col>
          </v-row>
          <div>
            <v-row v-if="groupPos.pos_data.customer_data.type === 'existing_patient' && customerTypes.includes('existing_patient')">
              <v-col class="px-1" md="5" cols="3">
                <patient-search @patientSelected="patientSelected"></patient-search>
              </v-col>
            </v-row>

            <div v-if="groupPos.pos_data.customer_data.type !== 'new_patient' && groupPos.pos_data.customer_data.patient">
              <v-row v-if="groupPos.pos_data.customer_data.patient.schemes.length > 0">
                <v-col md="5">
                  <v-switch
                      v-model="groupPos.pos_data.customer_data.use_insurance"
                      @change="groupPos.changePaymentMode()"
                      label="Change payment mode to insurance"
                  ></v-switch>
                </v-col>
                <v-col v-if="groupPos.pos_data.customer_data.use_insurance" md="5">
                  <v-select
                      v-model="groupPos.pos_data.customer_data.scheme"
                      :items="groupPos.pos_data.customer_data.patient.schemes"
                      outline
                      return-object
                      label="Select scheme"
                      item-text="scheme_name"
                      item-value="id"
                  ></v-select>
                </v-col>
              </v-row>
            </div>
          </div>

          <v-row v-if="groupPos.pos_data.customer_data.type === 'new_patient' && customerTypes.includes('new_patient')">
            <v-col md="4">
              <v-text-field class="mx-1" label="First name" outline v-model="groupPos.pos_data.customer_data.patient_data.first_name"></v-text-field>
            </v-col>
            <v-col md="4">
              <v-text-field class="mx-1" label="Middle name" outline v-model="groupPos.pos_data.customer_data.patient_data.middle_name"></v-text-field>
            </v-col>
            <v-col md="4">
              <v-text-field class="mx-1" label="Last name" outline v-model="groupPos.pos_data.customer_data.patient_data.last_name"></v-text-field>
            </v-col>
            <v-col md="4">
              <v-text-field class="mx-1" label="Age" outline v-model="groupPos.pos_data.customer_data.patient_data.age"></v-text-field>
            </v-col>
            <v-col md="4">
              <v-select class="mx-1" outline label="Age in" v-model="groupPos.pos_data.customer_data.patient_data.age_in" :items="configurations.age_in" item-text="item_name" item-value="item_name"></v-select>
            </v-col>
            <v-col md="4">
              <v-select class="mx-1" label="Gender" v-model="groupPos.pos_data.customer_data.patient_data.gender" :items="['Male', 'Female']" outlined></v-select>
            </v-col>
            <v-col md="4">
              <v-text-field class="mx-1" label="Mobile" outline v-model="groupPos.pos_data.customer_data.patient_data.mobile"></v-text-field>
            </v-col>
            <v-col md="4">
              <v-switch v-model="groupPos.pos_data.customer_data.has_insurance" label="Does customer have Insurance"></v-switch>
            </v-col>
            <v-col md="4" v-if="groupPos.pos_data.customer_data.has_insurance">
              <v-autocomplete
                  v-model="groupPos.pos_data.customer_data.insurance_company"
                  :items="insuranceCompanies"
                  item-text="name"
                  item-value="id"
                  label="Select Insurance Provider"
                  outlined
                  clearable
              ></v-autocomplete>
            </v-col>
          </v-row>

          <v-row v-if="groupPos.pos_data.customer_data.type === 'identied_walkin' && customerTypes.includes('identied_walkin')">
            <v-col class="px-1" md="3">
              <v-text-field class="px-1" label="Customer name/idenfifier" outline v-model="groupPos.pos_data.customer_data.customer_identifier"></v-text-field>
            </v-col>
            <v-col class="px-1" md="3">
              <v-text-field class="px-1" label="Mobile" outline v-model="groupPos.pos_data.customer_data.mobile"></v-text-field>
            </v-col>
            <v-col class="px-1" md="3">
              <v-text-field class="px-1" label="Email" outline v-model="groupPos.pos_data.customer_data.email"></v-text-field>
            </v-col>
          </v-row>
        </div>

        <v-divider/>


        <!-- service pos -->
        <!-- service pos -->
        <div v-if="station.pos_type === 'Services only' || station.pos_type === 'Both'">
          <v-row v-for="(service, index) in groupPos.pos_data.services" :key="service.id">
            <v-col class="mx-1" md="3" >
              <!-- {{  station.service_types }} -->
              <pos-procedure-search active_only
                                    :categories="JSON.parse(station.service_types)"
                                    label="Search for service"
                                    v-if="!service.name"
                                    @results="selected => groupPos.procedureSelected(index, selected)"
              >
              </pos-procedure-search>
              <h5 v-else>{{ service.name }}</h5>
              <!-- <h5 v-else>{{ service.price }}</h5> -->
              <!-- <v-switch
                      v-model="service.on_credit"
                      v-if="service.name"
                      label="Check if item/service on credit"
              ></v-switch>-->
            </v-col>
            <v-col class="mx-1" md="1" >
              <v-text-field label="Units" :disabled="!service.name"
                            outline value="1" v-model="service.units"
                            @input="groupPos.updateTotalCost()">
              </v-text-field>
            </v-col>
            <v-col class="mx-1" md="1" >
              <v-text-field label="Initial Price"
                            disabled
                            v-model="service.initial_price"
                            outline>
              </v-text-field>
            </v-col>
            <v-col class="mx-1" md="2" >
              <v-text-field label="Selling Price"
                            :disabled="!service.name"
                            :readonly="service.price"
                            outline v-model="service.price"
                            @input="groupPos.updateTotalCost()">
              </v-text-field>
            </v-col>
            <v-col class="mx-1" md="1" >
              <v-text-field label="Total Price"
                            disabled
                            outline
                            :value="service.price * service.units">
              </v-text-field>
            </v-col>
            <v-col class="mx-1" md="2" >
              <v-text-field label="Comments/Notes"
                            :disabled="!service.name"
                            outline
                            v-model="service.comments">
              </v-text-field>
            </v-col>
            <v-col class="mx-1" md="1" >
              <v-btn  icon small color="error"
                      @click="groupPos.removeSelection(index, 'service')"
                      :disabled="groupPos.pos_data.services.length <= 1">
                <v-icon>delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <div>
            <v-btn color="primary"
                   small
                   @click="groupPos.addNewRow('service')">
              <v-icon>add</v-icon>
              Add new
            </v-btn>
          </div>
        </div>
        <!-- pharmaceuticals pos -->
        <div  v-if="station && station.is_pharmacy && (station.pos_type === 'Products only' || station.pos_type === 'Both')">
          <v-row  v-for="(item, index) in groupPos.pos_data.drugs" :key="item.id">
             <!-- @results="selected => groupPos.drugSelected(index, selected)" -->
            <v-col class="mx-1" md="2" >

             <!-- @results="selected => selectedBatch(index, selected)" -->
              <store-product-search
                  :store-id="station.store_id"
                  :is-pharmacy="station.is_pharmacy"
                  v-if="!item.name"

                  @results="selected => groupPos.drugSelected(index, selected)"

              ></store-product-search>
              <h5 v-else>{{ item.name }}</h5>
              <!-- <v-switch
                     v-model="service.on_credit"
                     v-if="service.name"
                     label="Check if item/service on credit"
             ></v-switch>-->
            </v-col>
            <v-col class="mx-1" md="1" v-if="checkIfIsDrug(item)">
              <v-select v-model="item.route"
                        :disabled="!item.name"
                        label="Route/Unit"
                        outline
                        :items="configurations.prescription_whereto"
                        item-text="item_name"
                        item-value="id"
              ></v-select>
            </v-col>
            <v-col class="mx-1" md="1"  v-if="checkIfIsDrug(item)">
              <v-text-field
                  v-model="item.dosage"
                  @input="groupPos.updatePharmacyCartState(item)"
                  :disabled="!item.name"
                  label="Dosage"
                  outline></v-text-field>
            </v-col>
            <v-col class="mx-1" md="1"  v-if="checkIfIsDrug(item)">
              <v-text-field
                  v-model="item.unit_of_measurement"
                  :disabled="!item.unit_of_measurement"
                  label="UoM"
                  outline></v-text-field>
            </v-col>
            <v-col class="mx-1" md="1" v-if="checkIfIsDrug(item)">
              <v-select v-model="item.frequency"
                        label="Frequency"
                        outline
                        :disabled="!item.name"
                        :items="configurations.prescription_method"
                        item-text="item_name"
                        return-object
                        @input="groupPos.updatePharmacyCartState(item)"
              ></v-select>
            </v-col>
            <v-col class="mx-1" md="1" v-if="checkIfIsDrug(item)">
              <v-text-field label="Duration"
                            :disabled="!item.name"
                            outline v-model="item.duration"
                            @input="groupPos.updatePharmacyCartState(item)"
              ></v-text-field>
            </v-col>
            <v-col class="mx-1" :class="{ md2: groupPos.pos_data.customer_data.use_insurance, md1: !groupPos.pos_data.customer_data.use_insurance }" v-if="checkIfIsDrug(item)">
              <v-select
                  v-model="item.measure"
                  label="Measure"
                  outline
                  :disabled="!item.name"
                  :items="configurations.prescription_duration"
                  item-text="item_name"
                  return-object
                  @change="groupPos.updatePharmacyCartState(item)"
              ></v-select>
            </v-col>
            <v-col class="mx-1" :class="{ md2: groupPos.pos_data.customer_data.use_insurance, md1: !groupPos.pos_data.customer_data.use_insurance }" >
              <v-text-field label="Quantity"
                            v-model="item.quantity"
                            :max="item.orderable_quantity"
                            @input="groupPos.updatePharmacyCartCost(item)"
                            outline :value="item.quantity"
                            :disabled="!item.name"
              ></v-text-field>
            </v-col>
            <v-col class="mx-1" md="1" v-if="!groupPos.pos_data.customer_data.use_insurance">
              <v-text-field
                  label="Selling price"
                  :disabled="!item.name || !msetting('inventory.enable_lower_limit')"
                  outline
                  v-model="item.selling_price"
                  @input="groupPos.updatePharmacyCartCost(item)"
                  @blur="checkSellingPriceLimit(item)"></v-text-field>
            </v-col>
            <v-col class="mx-1" md="1" v-if="!groupPos.pos_data.customer_data.use_insurance" >
              <v-text-field label="Amount"
                            outline
                            v-model="item.amount"
                            @input="groupPos.updateTotalCost()"
                            disabled
              ></v-text-field>
            </v-col>
            <v-col class="mx-1" md="1" >
              <span v-if="!groupPos.pos_data.customer_data.use_insurance">{{ item.total }} </span>
              <v-btn icon small color="error"
                     @click="groupPos.removeSelection(index, 'drug')"
                     :disabled="groupPos.pos_data.drugs.length <= 1">
                <v-icon>delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <div>
            <v-btn color="primary"
                   small
                   @click="groupPos.addNewRow('drug')">
              <v-icon>add</v-icon>
              Add new
            </v-btn>
          </div>
        </div>
        <!-- non pharmaceuticals pos -->
        <div v-if="station && !station.is_pharmacy && (station.pos_type === 'Products only' || station.pos_type === 'Both')">
          <v-row  v-for="(item, index) in groupPos.pos_data.items" :key="item.id">
            <v-col class="mx-1" md="3" >
              <store-product-search  :store-id="station.store_id"
                                     v-if="!item.name"
                                     @results="addProduct"
              >
              </store-product-search>
              <h5 v-else>{{ item.name }}</h5>
              <!-- <v-switch
                     v-model="service.on_credit"
                     v-if="service.name"
                     label="Check if item/service on credit"
             ></v-switch>-->
            </v-col>
            <v-col class="mx-1" md="1" >
              <v-text-field label="Quantity" :disabled="!item.name" outline value="1" v-model="item.quantity"  @input="groupPos.updateItemCost(item)"></v-text-field>
            </v-col>
            <v-col class="mx-1" md="2" >
              <v-text-field label="Selling price" disabled v-model="item.selling_price" outline></v-text-field>
            </v-col>
            <v-col class="mx-1" md="2" >
              <v-text-field label="Amount" :disabled="!item.name" outline v-model="item.amount"  @input="groupPos.updateTotalCost('item', item, index)"></v-text-field>
            </v-col>
            <v-col class="mx-1" md="1" >
              <v-text-field label="Total" disabled outline :value="item.total"></v-text-field>
            </v-col>
            <v-col class="mx-1" md="1" >
              <v-btn text icon small color="error" @click="groupPos.removeSelection(index, 'item')" :disabled="groupPos.pos_data.items.length <= 1">
                <v-icon>delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <div>
            <v-btn color="primary"
                   small
                   @click="groupPos.addNewRow('item')">
              <v-icon>add</v-icon>
              Add new
            </v-btn>
          </div>
        </div>
        <v-row>
          <v-col class="text-right pr-8" cols="12">
            <span class="subheading text-right font-weight-black">Total Cost: {{ groupPos.pos_data.total_cost }}</span>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <!--            <v-btn color="success" class="mr-2" v-if="!groupPos.loading" @click.once="groupPos.saveSale(station.slug, true, internal)">Save</v-btn>-->
            <v-btn color="primary" v-if="!groupPos.loading" :disabled="hasSellingPriceBelowLimit || hasInvalidLineItems" @click="openPaymentModal">Pay</v-btn>
            <v-btn
                color="success"
                v-if="['corporate', 'staff'].includes(groupPos.pos_data.customer_data.type)"
                @click="openCreateInvoiceDialog"
            >
              Issue invoice
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card flat v-if="initialized && !internal" class="mt-3">
      <v-card-text>
        <v-tabs class="tabs grey lighten-4 mx-1" centered grow height="60px" v-model="activeTab">
          <v-tab
              v-for="(action, index) in actions"
              :key="index"
              v-if="internal && action.internal"
              class="item text-center grey lighten-4 mx-1"
              ripple
              :to="usher(action)"
              active-class="active"
              exact
          >
            {{ action.name }}
          </v-tab>
        </v-tabs>
        <div class="mt-4">
          <router-view :station="station"></router-view>
        </div>
      </v-card-text>
    </v-card>

    <v-card v-if="initialized && !internal" class="mt-4">
      <!-- <v-card-text>
        <finance-cash-payments-listing :user_id="userId" ></finance-cash-payments-listing>
      </v-card-text> -->
    </v-card>

    <v-card v-if="internal && initialized">
      <v-card-text>
        <SalesListingDetails :visit_id="visitId" :station="station"></SalesListingDetails>
      </v-card-text>
    </v-card>
    <!-- Reusable Payment Modal Component -->
    <PaymentModal
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
        :manualGiftCardCode="manualGiftCardCode"
        :manualVoucherCode="manualVoucherCode"
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

    <!-- Waiting for Payment Modal -->
    <v-dialog v-model="paymentCheckDialog" max-width="480px" persistent>
      <v-card>
        <v-card-title class="headline">Waiting for Payment</v-card-title>
        <v-card-text>
          <v-alert v-if="areOtherPaymentsDisabled" type="info" dense outlined class="mb-2">
            Total payable has been met by Cash. Other payment modes are disabled.
          </v-alert>
          <v-expansion-panels v-model="waitingPanelsInternal" class="mt-4" multiple>
            <v-expansion-panel v-for="(mode) in paymentModes" :key="mode.name" v-if="shouldRenderPanel(mode)" :disabled="mode.name !== 'cash' && areOtherPaymentsDisabled">
              <v-expansion-panel-header>
                <h5>{{ mode.label }}</h5>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <!-- Cash Form -->
                <div v-if="mode.name === 'cash'">
                  <v-row>
                    <v-col>
                      <v-text-field label="Amount Received" v-model="custom_payment.cash.amount" type="number" @input="handleInput"/>
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
                    </v-col>
                  </v-row>
                  <v-btn color="primary" @click="requestPayment('mpesa')" :disabled="loading">
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
                                â€¢ {{ formatCurrency(item.amount) }}
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
                                    :max="giftCardAccount.balance"
                                    v-model="custom_payment.gift_card.amount"
                                    type="number"
                                    placeholder="Enter gift card amount"

                      ></v-text-field>
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
                      <!-- <a href="#" @click="showVoucherInput">can't scan code</a> -->
                    </v-col>
                  </v-row>
                  <v-row>
                  <!-- <v-row v-if="showVoucherInput"> -->
                    <v-col offset-md="1" md="6" class="mx-4">
                      <v-text-field
                          v-model="manualVoucherCode"
                          label="Enter Voucher Code"
                          type="text"
                          outlined
                          dense
                      ></v-text-field>
                    </v-col>
                    <v-col md="3" class="d-flex align-center">
                      <v-btn color="primary" @click="fetchVoucher(manualVoucherCode)"
                             :disabled="!manualVoucherCode || voucher_loading">
                        Fetch Voucher
                      </v-btn>
                    </v-col>
                  </v-row>

                  <v-row class="mt-4" v-if="voucherAccount && voucherAccount.balance">
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
                      <v-btn color="primary" @click="requestPayment('voucher')"
                             :disabled="voucher_loading || voucherAccount.balance > 0 && voucherAccount.balance < custom_payment.voucher.amount || custom_payment.voucher.amount == 0 || voucherAccount.times_used >= 1">
                        <v-progress-circular
                            indeterminate
                            v-if="voucher_loading"
                            :size="10"
                            :width="2"
                            color="primary"
                        ></v-progress-circular>
                        Request Payment
                      </v-btn>
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

    <!-- Waiting for Payment Modal -->
    <v-dialog v-model="paymentCheckDialog" max-width="480px" persistent>
      <v-card>
        <v-card-title class="headline">Waiting for Payment</v-card-title>
        <v-card-text>
          <div class="d-flex align-center">
            <v-progress-circular indeterminate color="primary" class="mr-3"></v-progress-circular>
            <div>
              We have initiated the payment request. Please complete the payment on your phone/terminal.
              This will update automatically once confirmed.
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="red" @click="paymentCheckDialog = false; stopUpdatingBalance();">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Current Shift Summary and History -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title class="primary white--text d-flex align-center">
            <v-icon color="white" class="mr-2">mdi-account-clock</v-icon>
            <span>Current Shift</span>
            <v-spacer></v-spacer>
            <v-btn small color="error" @click="showCloseShiftDialog" :disabled="!shiftOpen">Close Shift</v-btn>
          </v-card-title>
          <v-card-text>
            <v-simple-table>
              <tbody>
              <tr>
                <td><strong>Cashier</strong></td>
                <td>{{ currentShiftCard.cashier_name || 'N/A' }}</td>
              </tr>
              <tr>
                <td><strong>Opened at</strong></td>
                <td>{{ formatDateTime(currentShiftCard.opened_at) }}</td>
              </tr>
              <tr>
                <td><strong>Opening balance</strong></td>
                <td>{{ formatCurrency(currentShiftCard.opening_balance) }}<span v-if="currentShiftCard.confirmed_by" class="ml-2">(by {{ currentShiftCard.confirmed_by }})</span></td>
              </tr>
              <tr>
                <td><strong>Total sales (Cash+Mpesa+Card)</strong></td>
                <td>{{ formatCurrency(currentShiftCard.total_sales) }}</td>
              </tr>
              <tr>
                <td><strong>Cash at hand</strong></td>
                <td>{{ formatCurrency(currentShiftCard.cash_at_hand) }}</td>
              </tr>
              <tr>
                <td><strong>Total Pickups</strong></td>
                <td>{{ formatCurrency(currentShiftCard.total_pickups) }}</td>
              </tr>
              <tr>
                <td><strong>Cash sales</strong></td>
                <td>{{ formatCurrency(currentShiftCard.cash_sales) }}</td>
              </tr>
              <tr>
                <td><strong>Mpesa sales</strong></td>
                <td>{{ formatCurrency(currentShiftCard.mpesa_sales) }}</td>
              </tr>
              <tr>
                <td><strong>Card sales</strong></td>
                <td>{{ formatCurrency(currentShiftCard.card_sales) }}</td>
              </tr>
              <tr>
                <td><strong>Cashier closing balance</strong></td>
                <td>{{ formatCurrency(currentShiftCard.cashier_closing_balance) }}</td>
              </tr>
              <tr>
                <td><strong>System closing balance</strong></td>
                <td>{{ formatCurrency(currentShiftCard.system_closing_balance) }}</td>
              </tr>
              </tbody>
            </v-simple-table>
            <div class="mt-3">
              <v-btn color="warning" block @click="openPickupDialog" :disabled="!shiftOpen">Cash Pick Up</v-btn>
              <v-btn color="error" class="mt-2" block @click="showCloseShiftDialog" :disabled="!shiftOpen">Close Shift</v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
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
                :footer-props="{ 'items-per-page-options': [5,10,15,25,50], 'show-current-page': true, 'show-first-last-page': true }"
                class="elevation-1"
            >
              <template v-slot:item.amount="{ item }">
                <div class="text-right">{{ formatCurrency(item.amount) }}</div>
              </template>
              <template v-slot:item.actions="{ item }">
                <v-btn small color="success" class="mr-2" @click="reprintShift(item)">Reprint</v-btn>
              </template>
              <template v-slot:loading>
                <v-progress-linear color="primary" indeterminate height="4"></v-progress-linear>
              </template>
              <template v-slot:no-data>
                <div class="text-center py-4">
                  <v-icon size="48" color="grey lighten-1">mdi-clock-outline</v-icon>
                  <div class="subtitle-1 grey--text">No shift history found</div>
                  <v-btn color="primary" small class="mt-2" @click="fetchShiftHistory" :loading="shiftHistoryLoading">
                    <v-icon left>mdi-refresh</v-icon>
                    Refresh
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add this code after the existing modal components -->
<!-- Batch Selection Modal -->
  <!-- v-if="showBatchModal" -->
  <v-dialog v-model="showBatchModal" max-width="600px" persistent>
    <v-card>
      <v-card-title class="headline">Select Batch</v-card-title>

      <v-card-text>
        <div v-if="!availableBatches || availableBatches.length === 0" class="grey--text">
          No batches available for this product.
        </div>


        <v-list two-line dense v-if="availableBatches && availableBatches.length">
          <v-list-item
            v-for="(batch, idx) in availableBatches"
            :key="batch || idx"
            @click="selectedBatchItem = batch"
            :class="{ 'primary--text': selectedBatchItem === batch }"
            ripple
          >
            <v-list-item-content>
              <v-list-item-title>
                {{ batch.batch }} <span v-if="batch.quantity"> — {{ batch.quantity }} available</span>
              </v-list-item-title>
              <v-list-item-subtitle>Expiry: {{ batch.expiry_date || 'N/A' }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon v-if="selectedBatchItem === batch" color="primary">mdi-check-circle</v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list>

        <v-divider class="my-2"></v-divider>

        <div v-if="selectedBatchItem" class="mt-2">
          <strong>Selected:</strong>
          <div>{{ selectedBatchItem.batch }} — Exp: {{ selectedBatchItem.expiry_date }}</div>
          <div v-if="selectedBatchItem.quantity">Qty available: {{ selectedBatchItem.quantity }}</div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="onCancelBatchModal">Cancel</v-btn>
        <v-btn color="primary" :disabled="!selectedBatchItem" @click="confirmBatchSelection">Confirm</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </div>


</template>

<script>
import { mapActions, mapGetters } from "vuex";
import GroupPos from "@evaluation/libs/groupPos/GroupPos";
import SettingsOptions from "@settings/libs/SettingsOptions";
import PatientSearch from "@reception/components/patients/PatientSearch";
import StoreProductSearch from "@inventory/components/StoreProductsSearch";
import ProcedureSearch from "@evaluation/components/procedures/ProcedureSearch";
import SalesListing from "@inventory/components/pos/partials/SalesListing";
import SalesListingDetails from "@inventory/components/pos/partials/SalesListingDetails";
import Payment from "@finance/libs/payments/Payment";
import PaymentModal from "./PaymentModal.vue";

export default {
  props: ["posData", "internal", "patientId", "visit_id","userId"],
  components: {
    PatientSearch,
    ProcedureSearch,
    StoreProductSearch,
    SalesListing,
    SalesListingDetails,
    PaymentModal
  },
  data: () => ({
    search: "",
    station: null,
    visitId: null,
    customerTypes: null,
    groupPos: new GroupPos(),
    options: new SettingsOptions(),
    activeTab: "sales-listing",
    stores: [],
    insuranceCompanies: [],
    actions: [
      { name: "Sales Listing", url: "sales-listing", internal: false, permission: "inventory.receive-pos-payments" },
      { name: "Sales details", url: "sales-listing-details", internal: true, permission: "inventory.receive-pos-payments" }
    ],
    payment: new Payment(),
    showPaymentModal: false,
    recentMpesaLoading: false,
    recentMpesaError: null,
    recentMpesa: [],
    availableBatches: [],
    selectedPaymentPanel: 0,
    loading: false,
    cash_loading: false,
    mpesa_loading: false,
    pesapal_loading: false,
    paymentProcessing: false,
    gift_card_loading: false,
    voucher_loading: false,
    createInvoiceDialog: false,
    // Notice messages when amounts are auto-adjusted to remaining payable
    clampNotice: { mpesa: '', pesapal: '' },
    selectedItems: [],
    paymentModes: [
      {name: 'cash', label: 'Cash', active: true},
      {name: 'mpesa', label: 'M-PESA', active: true},
      {name: 'pesapal', label: 'Pesapal', active: true},
      {name: 'card', label: 'Card', active: true},
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
    nextIndex: 0,
    pesapal_order_mobile_number: null,
    pesapal_data: null,
    barcode: '',
    scannedBarcode: '',
    showBatchModal: false,
    selectedBatchIndex: null,
    selectedBatchItem: null,
    currentDrugSelected: null,
    availableBatches: [],

    barcodeTimer: null,
    barcodeBuffer: '',
    selectedPosItems:[],
    custom_payment: {
      cash: { amount: 0, received_amount: 0, change_amount: 0 },
      mpesa: {
        code: '',
        mobile_number: '',
        amount: 0,
        amount_to_pay: 0,
      },
      pesapal: {
        email: '',
        mobile_number: null,
        amount: 0,
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
    // Payment check state (for mpesa/pesapal)
    paymentCheckDialog: false,
    waitingPanelsInternal: [0],
    intervalId: null,
    paymentResultHandled: false,
    // Live search state
    productSearchTerm: '',
    searchLoading: false,
    selectedAutocomplete: [],
    autocompleteItems: [],
    selectedStoreId: null,
    searchDebounceTimer: null,
    totals: {
      subtotal: 0,
      discount: 0,
      tax: 0,
      totalPayable: 0,
    },
    invoiceSelectAll: false,
    invoiceSelectedIds: [],
    // Shift management state
    shiftOpen: false,
    shiftDialog: false,
    closeShiftDialog: false,
    shiftLoading: false,
    staffLoading: false,
    staff: [],
    shift: { opening_balance: 0, confirmed_by_id: null },
    closeShift: { system_closing_balance: 0, cashier_closing_balance: 0, closing_variance: 0, close_confirmed_by_id: null },

    // Cash pickup state
    pickupDialog: false,
    pickup: { totalcash: 0, cashier_id: null, picked_by_id: null },

    // Current shift summary card state
    currentShiftCard: {
      cashier_name: '',
      opened_at: null,
      opening_balance: 0,
      confirmed_by: '',
      confirmed_by_id: null,
      cash_sales: 0,
      mpesa_sales: 0,
      card_sales: 0,
      total_sales: 0,
      total_pickups: 0,
      cash_at_hand: 0,
      cashier_closing_balance: 0,
      system_closing_balance: 0,
      shift_id: null
    },

    // Shift history state
    shiftHistory: [],
    shiftHistoryLoading: false,
    shiftHistoryHeaders: [
      { text: 'Time', value: 'time' },
      { text: 'Type', value: 'type' },
      { text: 'Amount', value: 'amount', align: 'right' },
      { text: 'Confirmed By', value: 'confirmed_by' },
      { text: 'Actions', value: 'actions', sortable: false, align: 'center' },
    ],
    shiftHistoryPage: 1,
    shiftHistoryItemsPerPage: 10,
    shiftHistoryTotalItems: 0,
    shiftHistorySearch: '',

    // Organization data for headers in printouts
    organization: {
      name: '',
      logo: '',
      receipt_logo:'',
      address: '',
      phone: '',
      email: ''
    },
    invoiceLoading: false,
    // Drug selection modal state
    drugSelectionModal: false,
    selectedDrug: null,
    selectedDrugIndex: null,
    // Batch selection modal state
    batchSelectionModal: false,
    selectedBatchDrug: null,
    selectedBatchIndex: null,
  }),
  computed: {
    invoiceSelectedTotal() {
      if (!Array.isArray(this.selectedPosItems) || !Array.isArray(this.invoiceSelectedIds)) {
        return 0;
      }

      return this.selectedPosItems.reduce((total, item, idx) => {
        const key = item?.__invoiceKey || this.computeInvoiceItemKey(item, item?.__invoiceSource || 'item', idx);
        if (!key || !this.invoiceSelectedIds.includes(key)) {
          return total;
        }
        const quantity = Number(item.quantity ?? item.units ?? 1);
        const price = Number(item.selling_price ?? item.price ?? item.amount ?? 0);
        return total + (quantity * price);
      }, 0);
    },
    configurations() {
      return window.configurations || {};
    },
    initialized() {
      return this.options.configurations != null && this.station;
    },
    hasSellingPriceBelowLimit() {
      return this.groupPos.pos_data.drugs.some(item => item.name && Number(item.selling_price) < Number(item.lower_limit_price));
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
          Object.keys(amounts).forEach(k => { others += amounts[k] || 0; });
          remainingBeforeCash = Math.max(0, payable - others);
        }
      } catch (e) { remainingBeforeCash = Math.max(0, payable); }

      const cashInput = Number(this.custom_payment?.cash?.amount || this.custom_payment?.cash?.received_amount || 0);
      const cashApplicable = Math.min(Math.max(0, cashInput), remainingBeforeCash);
      return (remainingBeforeCash - cashApplicable) <= 0;
    },
    hasInvalidLineItems() {
      // Check for 0 quantity or 0 amount line items in drugs
      const invalidDrugs = this.groupPos.pos_data.drugs.some(item =>
          item.name && (Number(item.quantity || 0) <= 0 || Number(item.amount || 0) <= 0)
      );

      // Check for 0 quantity or 0 amount line items in items
      const invalidItems = this.groupPos.pos_data.items.some(item =>
          item.name && (Number(item.quantity || 0) <= 0 || Number(item.amount || 0) <= 0)
      );

      return invalidDrugs || invalidItems;
    }
  },
  watch: {
    internal(val) {
      this.posData.internal = val;
    },
    posData(val) {
      if (val) {
        this.station = JSON.parse(val);
        if (this.station.customer_type) {
          this.customerTypes = JSON.parse(this.station.customer_type);
        }
        // Update selected store for live search
        if (this.station && this.station.store_id) {
          this.selectedStoreId = this.station.store_id;
        }

      }
    },
    patientId(val) {
      if (val) {
        this.groupPos.pos_data.customer_data.type = "existing_patient";
        this.groupPos.pos_data.customer_data.patient_id = val.id;
      }
    },
    // Live search: debounce input
    productSearchTerm(val) {
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }
      if (!val || String(val).trim().length < 2) {
        this.autocompleteItems = [];
        return;
      }
      this.searchDebounceTimer = setTimeout(() => {
        this.fetchAutocomplete(String(val).trim());
      }, 400);
    },
    selectedItems: {
      handler() {
        this.updateTotals();
      },
      deep: true
    },
    paymentCheckDialog(val) {
      if (val) {
        this.waitingPanelsInternal = [0];
      }
    },
  },
  methods: {
    async fetchStaff() {
      this.staffLoading = true;
      try {
        const resp = await window.axios.get('/api/users/all/users');
        const list = (resp && resp.data && (resp.data.data || resp.data)) || [];
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
    toggleInvoiceSelectAll(val) {
      if (val) {
        this.invoiceSelectedIds = (this.selectedPosItems || []).map((it, idx) => it?.__invoiceKey || this.computeInvoiceItemKey(it, it?.__invoiceSource || 'item', idx));
      } else {
        this.invoiceSelectedIds = [];
      }
    },

    async fetchAvailableBatches(productId) {
      if (!productId) return [];
      try {
        const resp = await window.axios.post('/api/inventory/product/batches', { product: productId });
        const payload = resp && resp.data ? (resp.data.data || resp.data) : [];

        this.availableBatches = Array.isArray(payload) ? payload : [];
        return this.availableBatches;
      } catch (e) {
        console.error('Failed to fetch product batches', e);
        this.availableBatches = [];
        return [];
      }
    },
    addProduct(item) {
      // Calculate the final price for validation
      const finalPrice = (item.discount_price && item.discount_price > 0) ? item.discount_price : (item.selling_price || item.cash_price || 0);

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
        // this.updateSubtotal(existingItem);
      } else {

        // Not using uniqueId here, but keeping for consistency
        // const uniqueId = Date.now() + Math.random(); // Ensures uniqueness

        // Make sure we have a valid index for the item
      // Make sure we have a valid index for the item: use first empty row if available
        let index = this.groupPos.pos_data.items.findIndex(it => !it.name);
        if (index === -1) {
          this.groupPos.addNewRow('item');
          index = this.groupPos.pos_data.items.length - 1;
        }
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

      }
    },
    computeInvoiceItemKey(item, source = 'item', index = 0) {
      if (!item) return `${source}:${index}`;
      const candidates = [
        item.id,
        item.store_product_id,
        item.product_id,
        item.inventory_id,
        item.drug_id
      ];
      const usable = candidates.find(val => val !== undefined && val !== null && val !== '');
      if (usable !== undefined) {
        return `${source}:${usable}`;
      }
      return `${source}:${index}`;
    },
     buildInvoiceSelectionList() {
      const list = [];
      const pushItem = (entry, source, index) => {
        if (!entry) return;
        // Normalize common fields for both drugs and items
        const productName = entry.product || entry.name || entry.item_name || entry.product_name;
        if (!productName) return;

        const sellingPrice = Number(entry.selling_price ?? entry.price ?? entry.cash_price ?? entry.amount ?? entry.total ?? 0);
        const quantity = Number(entry.quantity ?? entry.units ?? entry.units_sold ?? 1);

        const normalized = {
          // stable ids for invoice mapping
          id: entry.id ?? null,
          product_id: entry.product_id ?? entry.drug_id ?? entry.item_id ?? entry.inventory_id ?? null,
          store_product_id: entry.store_product_id ?? entry.store_id ?? null,

          // unified display fields used by the dialog
          product: productName,
          name: productName,
          selling_price: sellingPrice,
          price: sellingPrice,
          quantity: quantity,
          amount: Number((sellingPrice * quantity).toFixed(2)),

          // copies of original raw entry for any downstream logic
          __raw: entry,
          __invoiceSource: source,
          __invoiceIndex: index
        };

        // compute and attach key for checkbox and selection
        normalized.__invoiceKey = this.computeInvoiceItemKey(normalized, source, index);

        list.push(normalized);
      };

      const posData = this.groupPos?.pos_data || {};
      // items (non-pharmacy products)
      (Array.isArray(posData.items) ? posData.items : []).forEach((entry, idx) => pushItem(entry, 'item', idx));
      // drugs (pharmacy) — normalize similarly
      (Array.isArray(posData.drugs) ? posData.drugs : []).forEach((entry, idx) => pushItem(entry, 'drug', idx));

      return list;
    },
    openCreateInvoiceDialog() {
      const customerData = (this.groupPos && this.groupPos.pos_data && this.groupPos.pos_data.customer_data) ? this.groupPos.pos_data.customer_data : {};
      const customerType = customerData.type;
      const isCorporateCustomer = customerType === 'corporate';
      const isStaffCustomer = customerType === 'staff';

      if (!isCorporateCustomer && !isStaffCustomer) {
        this.$swal && this.$swal({
          title: 'Unsupported Customer',
          text: 'Invoices are available only for corporate clients or employees.',
          icon: 'warning'
        });
        return;
      }

      if (isStaffCustomer && !customerData.staff_id) {
        this.$swal && this.$swal({ title: 'No Staff Selected', text: 'Select an employee before creating an invoice.', icon: 'warning' });
        return;
      }

      if (isCorporateCustomer && !customerData.corporate_id) {
        this.$swal && this.$swal({ title: 'No Corporate Selected', text: 'Select a corporate client before creating an invoice.', icon: 'warning' });
        return;
      }

      if(this.station.is_pharmacy){
              this.selectedPosItems = this.groupPos.pos_data.drugs;
      } else {
        this.selectedPosItems = this.groupPos.pos_data.items || this.groupPos.pos_data.services;
      }

      if (!Array.isArray(this.selectedPosItems) || this.selectedPosItems.length === 0) {
        this.$swal && this.$swal({ title: 'Empty Cart', text: 'Add items to cart before creating an invoice.', icon: 'warning' });
        return;
      }
      this.invoiceSelectedIds = this.selectedPosItems.map(it => it.__invoiceKey);
      this.invoiceSelectAll = true;
      this.createInvoiceDialog = true;
    },
    async createInvoice() {
      const customerData = (this.groupPos && this.groupPos.pos_data && this.groupPos.pos_data.customer_data) ? this.groupPos.pos_data.customer_data : {};
      const customerType = customerData.type;
      const isCorporateCustomer = customerType === 'corporate';
      const isStaffCustomer = customerType === 'staff';

      if (!isCorporateCustomer && !isStaffCustomer) {
        this.$swal && this.$swal({
          title: 'Unsupported Customer',
          text: 'Invoices are available only for corporate clients or employees.',
          icon: 'warning'
        });
        return;
      }

      if (isStaffCustomer && !customerData.staff_id) {
        this.$swal && this.$swal({ title: 'No Staff Selected', text: 'Select an employee before creating an invoice.', icon: 'warning' });
        return;
      }

      if (isCorporateCustomer && !customerData.corporate_id) {
        this.$swal && this.$swal({ title: 'No Corporate Selected', text: 'Select a corporate client before creating an invoice.', icon: 'warning' });
        return;
      }

      // derive items to invoice from user selection
      const chosen = (Array.isArray(this.selectedPosItems) ? this.selectedPosItems : []).filter((it, idx) => {
        const key = it?.__invoiceKey || this.computeInvoiceItemKey(it, it?.__invoiceSource || 'item', idx);
        return key && this.invoiceSelectedIds.includes(key);
      });
      if (!chosen.length) {
        this.$swal && this.$swal({ title: 'No items selected', text: 'Select at least one item to invoice.', icon: 'warning' });
        return;
      }

      try {
            this.invoiceLoading = true;

            // Calculate total from selected items
            const invoiceTotal = chosen.reduce((sum, item) => {
              const quantity = Number(item.quantity || 1);
              const price = Number(item.selling_price || item.price || 0);
              return sum + (quantity * price);
            }, 0);

            // Build payload
            let payload = {};
            if (this.station.is_pharmacy) {
              // const saleResult = await this.groupPos.saveSale(this.station.slug, true, this.internal);
              payload = {
                items: chosen.map(it => ({
                  id:it.id,
                  product_id: it.store_product_id ?? it.product_id ?? null,
                  name: it.product ?? it.name,
                  quantity: Number(it.quantity ?? it.units ?? 1),
                  price: Number(it.selling_price ?? it.price ?? it.amount ?? 0)
                })),
                invoice_total: invoiceTotal,
                totals: {
                  ...this.totals,
                  subtotal: invoiceTotal,
                  totalPayable: invoiceTotal
                }
              };
            } else {
              payload = {
                items: chosen.map(it => ({
                  id:it.id,
                  product_id: it.store_product_id ?? it.product_id ?? null,
                  name: it.product ?? it.name,
                  quantity: Number(it.quantity ?? it.units ?? 1),
                  price: Number(it.selling_price ?? it.price ?? it.amount ?? 0)
                })),
                invoice_total: invoiceTotal,
                totals: {
                  ...this.totals,
                  subtotal: invoiceTotal,
                  totalPayable: invoiceTotal
                }
              };
            }

            // Add customer info if applicable
            if (isCorporateCustomer) payload.corporate_id = customerData.corporate_id;
            if (isStaffCustomer) payload.staff_id = customerData.staff_id;

            // Send request
            const resp = await axios.post('/finance/cash/invoiced/action/store-invoice', payload);
            const data = resp?.data || {};

            // Check for exact success
            if (data.data === "Action successfully completed") {
              this.invoiceCreatedResponse = data;
              this.createInvoiceDialog = false;

              this.$swal?.({
                title: 'Invoice Created',
                text: 'Invoice created successfully',
                icon: 'success'
              });

              const printUrl = data.url || data.redirect_url || (data.data && data.data.url);
              if (printUrl) window.open(printUrl, '_blank');

              // Clear cart/UI
              this.selectedPosItems = [];
              this.invoiceSelectedIds = [];
              this.invoiceSelectAll = false;

              if (this.groupPos?.clearItems) {
                this.groupPos.clearItems();
              } else if (this.groupPos?.pos_data) {
                this.groupPos.pos_data.items = [];
                if (Array.isArray(this.groupPos.pos_data.drugs)) this.groupPos.pos_data.drugs = [];
              }

              // Clear selector controls
              if (Array.isArray(this.selectedAutocomplete)) this.selectedAutocomplete = [];
              this.productSearchTerm = '';
              this.barcode = '';
              this.scannedBarcode = '';
              this.barcodeBuffer = '';

              // Clear customer type & linked selections
              if (this.groupPos?.pos_data?.customer_data) {
                const customerDataObj = this.groupPos.pos_data.customer_data;
                customerDataObj.type = null;
                if ('corporate_id' in customerDataObj) customerDataObj.corporate_id = null;
                if ('staff_id' in customerDataObj) customerDataObj.staff_id = null;
              }

            } else {
              // Response did not match expected success
              const msg = data.message || 'Invoice not created successfully';
              this.$swal?.({ title: 'Error', text: msg, icon: 'error' });
            }

          } catch (e) {
            console.error('Create invoice failed', e);
            const msg = e?.response?.data?.message || e?.response?.data?.error || e.message || 'Failed to create invoice';
            this.$swal?.({ title: 'Error', text: msg, icon: 'error' });
          } finally {
            this.invoiceLoading = false;
            this.invoiceSelectedIds = [];
            this.invoiceSelectAll = false;
          }

    },
    toggleVoucherInput(){

      this.showVoucherInput = !this.showVoucherInput;
    },
    processLoyaltyRedemption(){

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
      } catch (e) { /* no-op */ }
    },
    async fetchBranchData() {
      try {
        const resp = await window.axios.get('/api/system/sessions');
        if (resp && resp.data) {
          const clinic = String(resp.data.clinic || '').replace(/[^0-9]/g, '');
          let storeId = null;
          if (clinic === '4') {
            storeId = 406;
          } else if (clinic === '1') {
            storeId = 401;
          }

          if (storeId) {
            this.selectedStoreId = storeId;
            if (this.station) {
              this.$set(this.station, 'store_id', storeId);
            }
          }
        }
      } catch (e) {
      }
    },
    usher(action) {
      return `/evaluation/grouped-pos/${this.station.slug}/process/${action.url}`;
    },
    staffSelected(user) {
      this.groupPos.pos_data.customer_data.staff_id = user.id;
      this.groupPos.pos_data.customer_data.mobile = user.mobile;
    },
    formatDateTime(dt) {
      try {
        if (!dt) return '';
        const d = new Date(dt);
        if (isNaN(d.getTime())) return String(dt);
        return d.toLocaleString();
      } catch (e) { return String(dt||''); }
    },
    reloadSalesDetails() {
      try {
        if (this.$refs && this.$refs.salesListing && typeof this.$refs.salesListing.init === 'function') {
          this.$refs.salesListing.init();
        }
      } catch (e) { console.warn('Failed to reload SalesListingDetails', e); }
    },
    // Helper to format currency values
    formatCurrency(value) {
      const num = Number(value || 0);
      return `KES ${num.toFixed(2)}`;
    },

    // Shift Management Methods
    async checkShiftStatus() {
      try {
        const resp = await this.$http.get('/api/reception/shift/status');
        const data = (resp && resp.data) ? resp.data : {};
        this.shiftOpen = !!data.is_open_today;
        // Force open-shift modal if shift is not open (block until opened)
        this.shiftDialog = !this.shiftOpen;
        // Store full payload to shift for current card consumption
        this.shift = data || {};
        // Preload closing info
        this.closeShift.system_closing_balance = Number(data.system_closing_balance || data.current_balance || 0);
        this.closeShift.cashier_closing_balance = Number(data.cashier_closing_balance || 0);
        this.closeShift.closing_variance = Number(this.closeShift.cashier_closing_balance - this.closeShift.system_closing_balance);
      } catch (error) {
        console.error('Error checking shift status:', error);
        this.showError('Failed to check shift status');
      }
    },

    computeClosingVariance() {
      this.closeShift.closing_variance =
          parseFloat(this.closeShift.cashier_closing_balance || 0) -
          parseFloat(this.closeShift.system_closing_balance || 0);
    },

    getStaffNameById(id) {
      try { return (this.staff || []).find(u => Number(u.id) === Number(id))?.full_name || ''; } catch (e) { return ''; }
    },

    printShiftOpeningHTML(shift) {
      try {
        const s = shift || {};
        const w = window.open('', 'shift-opening', 'width=500,height=800');
        if (!w) return;
        const currentDate = new Date().toLocaleString();
        const openedAt = this.formatDateTime(s.opened_at || new Date());
        const cashierName = s.cashier_name || this.getStaffNameById(s.user_id) || '';
        const confirmerName = s.confirmed_by || this.getStaffNameById(s.confirmed_by_id) || '';
        const content = `<!DOCTYPE html><html><head><title>Shift Opening</title>
<style>@page{size:auto;margin:5mm}body{font-family:Arial,sans-serif;padding:10px;font-size:12px}.header{text-align:center;margin-bottom:10px}.logo{max-width:150px;max-height:80px;margin-bottom:5px}.title{font-size:16px;font-weight:bold;margin:5px 0}.subtitle{font-size:12px;margin:3px 0}.divider{border-top:1px dashed #000;margin:10px 0}.row{display:flex;justify-content:space-between;margin-bottom:4px}.label{font-weight:bold}.section{margin:10px 0}.section-title{font-weight:bold;margin-bottom:5px;border-bottom:1px solid #eee;padding-bottom:3px}.signature-section{display:flex;justify-content:space-between;margin-top:40px}.signature{width:45%;text-align:center}.signature-line{border-top:1px solid #000;margin:5px auto;width:100%}.footer{margin-top:20px;font-size:10px;text-align:center}</style>
</head><body onload="window.print()">
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
    <div class="row"><span>Opening Balance:</span><span>${this.formatCurrency(s.opening_balance || 0)}</span></div>
  </div>
  <div class="divider"></div>
  <div class="section">
    <div class="section-title">SALES SUMMARY</div>
    <div class="row"><span>Total Cash Sales:</span><span>${this.formatCurrency(s.total_cash_sales || 0)}</span></div>
    <div class="row"><span>Total M-Pesa Sales:</span><span>${this.formatCurrency(s.total_mpesa_sales || 0)}</span></div>
    <div class="row"><span>Total Card Sales:</span><span>${this.formatCurrency(s.total_card_sales || 0)}</span></div>
    <div class="row"><span>Total Cheque Sales:</span><span>${this.formatCurrency(s.total_cheque_sales || 0)}</span></div>
    <div class="row"><span>Total Cash Pickups:</span><span>${this.formatCurrency(s.total_pickups || 0)}</span></div>
  </div>
  <div class="signature-section">
    <div class="signature"><div class="signature-line"></div><div>Cashier:</div><div>${cashierName}</div><div>${openedAt}</div></div>
    <div class="signature"><div class="signature-line"></div><div>Confirmed By:</div><div>${confirmerName}</div><div>${openedAt}</div></div>
  </div>
  <div class="footer"><div>${this.organization.name || ''} - ${new Date().getFullYear()}</div></div>
</body></html>`;
        w.document.open(); w.document.write(content); w.document.close(); w.focus();
      } catch (e) { console.error('Error printing shift opening:', e); }
    },

    printShiftClosing(snapshot) {
      try {
        const s = snapshot || {};
        const w = window.open('', 'shift-closing', 'width=500,height=800');
        if (!w) return;
        const now = new Date().toLocaleString();
        const cashierName = s.cashier_name || this.getStaffNameById(s.user_id) || '';
        const confirmerName = s.close_confirmed_by || this.getStaffNameById(s.close_confirmed_by_id) || '';
        const content = `<!DOCTYPE html><html><head><title>Shift Closing</title>
<style>@page{size:auto;margin:5mm}body{font-family:Arial,sans-serif;padding:10px;font-size:12px}.header{text-align:center;margin-bottom:10px}.logo{max-width:150px;max-height:80px;margin-bottom:5px}.title{font-size:16px;font-weight:bold;margin:5px 0}.subtitle{font-size:12px;margin:3px 0}.divider{border-top:1px dashed #000;margin:10px 0}.row{display:flex;justify-content:space-between;margin-bottom:4px}.label{font-weight:bold}.section{margin:10px 0}.section-title{font-weight:bold;margin-bottom:5px;border-bottom:1px solid #eee;padding-bottom:3px}.signature-section{display:flex;justify-content:space-between;margin-top:40px}.signature{width:45%;text-align:center}.signature-line{border-top:1px solid #000;margin:5px auto;width:100%}.footer{margin-top:20px;font-size:10px;text-align:center}</style>
</head><body onload="window.print()">
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
  <div class="row"><span class="label">Date/Time:</span><span>${now}</span></div>
  <div class="row"><span class="label">Cashier:</span><span>${cashierName}</span></div>
  ${confirmerName ? `<div class="row"><span class="label">Confirmed By:</span><span>${confirmerName}</span></div>` : ''}
  <div class="divider"></div>
  <div class="section">
    <div class="section-title">BALANCES</div>
    <div class="row"><span>Opening Balance:</span><span>${this.formatCurrency(s.opening_balance || 0)}</span></div>
    <div class="row"><span>System Closing Balance:</span><span>${this.formatCurrency(s.system_closing_balance || 0)}</span></div>
    <div class="row"><span>Cashier Closing Balance:</span><span>${this.formatCurrency(s.cashier_closing_balance || 0)}</span></div>
    <div class="row"><span>Difference:</span><span>${this.formatCurrency((Number(s.cashier_closing_balance||0) - Number(s.system_closing_balance||0)))}</span></div>
  </div>
  <div class="section">
    <div class="section-title">SALES SUMMARY</div>
    <div class="row"><span>Total Sales (All):</span><span>${this.formatCurrency(Number((s.total_cash_sales||0)+(s.total_mpesa_sales||0)+(s.total_card_sales||0)+(s.total_cheque_sales||0)))}</span></div>
    <div class="row"><span>Cash Sales:</span><span>${this.formatCurrency(s.total_cash_sales || 0)}</span></div>
    <div class="row"><span>M-Pesa Sales:</span><span>${this.formatCurrency(s.total_mpesa_sales || 0)}</span></div>
    <div class="row"><span>Card Sales:</span><span>${this.formatCurrency(s.total_card_sales || 0)}</span></div>
    <div class="row"><span>Cheque Sales:</span><span>${this.formatCurrency(s.total_cheque_sales || 0)}</span></div>
    <div class="row"><span>Total Pickups:</span><span>${this.formatCurrency(s.total_pickups || s.pickups_total || 0)}</span></div>
  </div>
  <div class="signature-section">
    <div class="signature"><div class="signature-line"></div><div>Cashier:</div><div>${cashierName}</div></div>
    <div class="signature"><div class="signature-line"></div><div>Confirmed By:</div><div>${confirmerName}</div></div>
  </div>
  <div class="footer"><div>${this.organization.name || ''} - ${new Date().getFullYear()}</div></div>
</body></html>`;
        w.document.open(); w.document.write(content); w.document.close(); w.focus();
      } catch (e) { console.error('Error printing shift closing:', e); }
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
        const content = `<!DOCTYPE html><html><head><title>Current Shift</title>
<style>@page{size:auto;margin:5mm}body{font-family:Arial,sans-serif;padding:10px;font-size:12px}.header{text-align:center;margin-bottom:10px}.logo{max-width:150px;max-height:80px;margin-bottom:5px}.title{font-size:16px;font-weight:bold;margin:5px 0}.subtitle{font-size:12px;margin:3px 0}.divider{border-top:1px dashed #000;margin:10px 0}.row{display:flex;justify-content:space-between;margin-bottom:4px}.label{font-weight:bold}.section{margin:10px 0}.section-title{font-weight:bold;margin-bottom:5px;border-bottom:1px solid #eee;padding-bottom:3px}.signature-section{display:flex;justify-content:space-between;margin-top:40px}.signature{width:45%;text-align:center}.signature-line{border-top:1px solid #000;margin:5px auto;width:100%}.footer{margin-top:20px;font-size:10px;text-align:center}</style>
</head><body onload="window.print()">
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
  <div class="footer"><div>${this.organization.name || ''} - ${new Date().getFullYear()}</div></div>
</body></html>`;
        w.document.open(); w.document.write(content); w.document.close(); w.focus();
      } catch (e) { /* no-op */ }
    },

    async printShiftReport(shiftId, type) {
      try {
        if (!shiftId) return;
        const lower = (type || '').toString().toLowerCase();
        // Try to fetch shift details to build HTML
        let shiftData = null;
        try {
          const resp = await this.$http.get(`/api/reception/shift/${shiftId}`);
          shiftData = (resp && resp.data && (resp.data.data || resp.data)) || null;
        } catch (e) { /* fallback to opening URL */ }

        if (shiftData) {
          if (lower.includes('close')) {
            const snapshot = {
              system_closing_balance: Number(shiftData.system_closing_balance || shiftData.current_balance || 0),
              cashier_closing_balance: Number(shiftData.cashier_closing_balance || 0),
              total_cash_sales: Number(shiftData.total_cash || 0),
              total_mpesa_sales: Number(shiftData.total_mpesa || 0),
              total_card_sales: Number(shiftData.total_card || 0),
              total_cheque_sales: Number(shiftData.total_cheque || 0),
              total_pickups: Number(shiftData.pickups_total || 0),
              opening_balance: Number(shiftData.opening_balance || 0),
              close_confirmed_by: shiftData.confirmer_name || shiftData.close_confirmed_by || '',
              close_confirmed_by_id: shiftData.close_confirmed_by_id || null,
              cashier_name: shiftData.cashier_name || '',
              user_id: shiftData.user_id || null,
            };
            this.printShiftClosing(snapshot);
          } else {
            // Opening
            this.printShiftOpeningHTML({
              opened_at: shiftData.opened_at,
              opening_balance: Number(shiftData.opening_balance || 0),
              total_cash_sales: Number(shiftData.total_cash || 0),
              total_mpesa_sales: Number(shiftData.total_mpesa || 0),
              total_card_sales: Number(shiftData.total_card || 0),
              total_cheque_sales: Number(shiftData.total_cheque || 0),
              total_pickups: Number(shiftData.pickups_total || 0),
              cashier_name: shiftData.cashier_name || '',
              confirmed_by: shiftData.confirmed_by || shiftData.confirmer_name || '',
              confirmed_by_id: shiftData.confirmed_by_id || null
            });
          }
        } else {
          // Fallback to server print URL
          window.open(`/reception/shift/${shiftId}/print`, '_blank');
        }
      } catch (error) {
        console.error(`Error printing ${type || ''} shift report:`, error);
        this.showError(`Failed to print ${type || ''} shift report`);
      }
    },

    // Reprint from history ensuring correct report type
    async reprintShift(item) {
      try {
        if (!item || !item.shift_id) return;
        const type = (item.type || '').toString().toLowerCase();
        if (type.includes('closed')) {
          // Fetch full shift data then print closing HTML
          const resp = await this.$http.get(`/api/reception/shift/${item.shift_id}`);
          const shiftData = (resp && resp.data && (resp.data.data || resp.data)) || {};
          const snapshot = {
            system_closing_balance: Number(shiftData.system_closing_balance || shiftData.current_balance || 0),
            cashier_closing_balance: Number(shiftData.cashier_closing_balance || 0),
            total_cash_sales: Number(shiftData.total_cash || 0),
            total_mpesa_sales: Number(shiftData.total_mpesa || 0),
            total_card_sales: Number(shiftData.total_card || 0),
            total_cheque_sales: Number(shiftData.total_cheque || 0),
            total_pickups: Number(shiftData.pickups_total || 0),
            opening_balance: Number(shiftData.opening_balance || 0),
            close_confirmed_by: shiftData.confirmer_name || shiftData.close_confirmed_by || '',
            close_confirmed_by_id: shiftData.close_confirmed_by_id || null,
            cashier_name: shiftData.cashier_name || '',
            user_id: shiftData.user_id || null,
          };
          this.printShiftClosing(snapshot);
        } else if (type.includes('opened')) {
          this.printShiftReport(item.shift_id, 'opening');
        } else {
          // Default fallback: try to detect by fetching and checking closed_at
          try {
            const resp2 = await this.$http.get(`/api/reception/shift/${item.shift_id}`);
            const data2 = (resp2 && resp2.data && (resp2.data.data || resp2.data)) || {};
            if (data2 && data2.closed_at) {
              const snap2 = {
                system_closing_balance: Number(data2.system_closing_balance || data2.current_balance || 0),
                cashier_closing_balance: Number(data2.cashier_closing_balance || 0),
                total_cash_sales: Number(data2.total_cash || 0),
                total_mpesa_sales: Number(data2.total_mpesa || 0),
                total_card_sales: Number(data2.total_card || 0),
                total_cheque_sales: Number(data2.total_cheque || 0),
                total_pickups: Number(data2.pickups_total || 0),
                opening_balance: Number(data2.opening_balance || 0),
                close_confirmed_by: data2.confirmer_name || data2.close_confirmed_by || '',
                close_confirmed_by_id: data2.close_confirmed_by_id || null,
                cashier_name: data2.cashier_name || '',
                user_id: data2.user_id || null,
              };
              this.printShiftClosing(snap2);
            } else {
              this.printShiftReport(item.shift_id, 'opening');
            }
          } catch (e2) {
            this.printShiftReport(item.shift_id, 'opening');
          }
        }
      } catch (e) {
        console.error('Failed to reprint shift', e);
        this.showError('Failed to reprint shift');
      }
    },

    async openAndPrintShift() {
      if (this.shift.confirmed_by_id == null || this.shift.confirmed_by_id === '') {
        return this.showError('Please select who is confirming this shift opening');
      }
      try {
        this.shiftLoading = true;
        const response = await this.$http.post('/api/reception/shift/open', this.shift);
        this.shiftOpen = true;
        this.shiftDialog = false;
        this.showSuccess('Shift opened successfully');
        await this.checkShiftStatus();
        const sid = (response && response.data) ? (response.data.shift_id || response.data.id || (response.data.data && response.data.data.id)) : null;
        if (sid) {
          this.printShiftReport(sid, 'opening');
        }
      } catch (error) {
        console.error('Error opening shift:', error);
        this.showError('Failed to open shift');
      } finally {
        this.shiftLoading = false;
      }
    },

    async closeAndPrintShift() {
      if (this.closeShift.cashier_closing_balance == null || this.closeShift.cashier_closing_balance === '') {
        return this.showError('Please enter closing cash balance');
      }
      if (this.closeShift.close_confirmed_by_id == null || this.closeShift.close_confirmed_by_id === '') {
        return this.showError('Please select who is confirming this shift closing');
      }
      try {
        this.shiftLoading = true;
        const response = await this.$http.post('/api/reception/shift/close', this.closeShift);
        this.shiftOpen = false;
        this.closeShiftDialog = false;
        // Force re-opening requirement: show Open Shift modal immediately after closing
        this.shiftDialog = true;
        this.showSuccess('Shift closed successfully');
        await this.checkShiftStatus();
        const sid = (response && response.data) ? (response.data.shift_id || response.data.id || (response.data.data && response.data.data.id)) : null;
        if (sid) {
          this.printShiftReport(sid, 'closing');
        }
      } catch (error) {
        console.error('Error closing shift:', error);
        this.showError('Failed to close shift');
      } finally {
        this.shiftLoading = false;
      }
    },

    showOpenShiftDialog() {
      this.shift = { opening_balance: 0, confirmed_by_id: null };
      this.shiftDialog = true;
    },

    showCloseShiftDialog() {
      this.closeShift = {
        system_closing_balance: this.shift.current_balance || 0,
        cashier_closing_balance: this.shift.current_balance || 0,
        closing_variance: 0,
        close_confirmed_by_id: null,
      };
      this.closeShiftDialog = true;
    },

    // Cash pickup helpers
    openPickupDialog() {
      if (!this.pickup.cashier_id) {
        this.pickup.cashier_id = this.userId ? Number(this.userId) : null;
      }
      this.pickupDialog = true;
    },
    async submitPickup() {
      try {
        const amt = Number(this.pickup.totalcash || 0);
        if (isNaN(amt) || amt <= 0) {
          return this.showError('Enter a valid amount');
        }
        if (!this.pickup.cashier_id || !this.pickup.picked_by_id) {
          return this.showError('Select cashier and personnel picking up');
        }
        this.shiftLoading = true;
        const payload = {
          totalcash: amt,
          cashier_id: this.pickup.cashier_id,
          picked_by_id: this.pickup.picked_by_id,
        };
        const resp = await this.$http.post('/api/reception/shift/pickup', payload);
        if (resp && resp.data) {
          this.pickupDialog = false;
          this.showSuccess('Cash pickup recorded');
          await this.checkShiftStatus();
          this.refreshCurrentShiftCard();
          await this.fetchShiftHistory();
          this.pickup = { totalcash: 0, cashier_id: this.userId ? Number(this.userId) : null, picked_by_id: null };
          return true;
        }
      } catch (e) {
        const msg = (e && e.response && (e.response.data && (e.response.data.message || e.response.data.error))) || e.message || 'Failed to record cash pickup';
        this.showError(msg);
        return false;
      } finally {
        this.shiftLoading = false;
      }
    },
    async pickupAndPrint() {
      const details = {
        amount: Number(this.pickup.totalcash || 0),
        cashier_id: this.pickup.cashier_id,
        picked_by_id: this.pickup.picked_by_id,
      };
      try {
        const ok = await this.submitPickup();
        if (ok) {
          this.printPickupReceipt(details);
        }
      } catch (e) { /* no-op */ }
    },
    printPickupReceipt(details) {
      try {
        const d = details || {};
        const w = window.open('', 'pickup', 'width=400,height=600');
        if (!w) return;
        const now = new Date();
        const staffName = (id) => {
          try { return (this.staff || []).find(u => Number(u.id) === Number(id))?.full_name || ''; } catch (e) { return ''; }
        };
        const cashierName = staffName(d.cashier_id);
        const pickedByName = staffName(d.picked_by_id);
        const html = `<!DOCTYPE html><html><head><title>Cash Pickup Receipt</title>
<style>body{font-family:Arial,sans-serif;padding:15px;font-size:12px;line-height:1.4}.header{text-align:center;margin-bottom:15px;border-bottom:1px solid #eee;padding-bottom:10px}.title{font-size:16px;font-weight:bold;margin:8px 0 5px}.subtitle{font-size:12px;margin:2px 0;color:#555}.divider{border-top:1px dashed #000;margin:12px 0}.row{display:flex;justify-content:space-between;margin-bottom:6px}.label{font-weight:bold}.company-logo{max-width:150px;max-height:80px;margin:0 auto 10px}</style>
</head><body onload="window.print()"><div class="header">${this.organization.receipt_logo ? `<img src="${this.organization.receipt_logo}" class="company-logo" alt="Company Logo">` : ''}<div class="title">CASH PICKUP RECEIPT</div><div class="subtitle">${this.organization.name || 'ORGANIZATION'}</div><div class="subtitle">${this.station?.name || 'POS TERMINAL'}</div><div class="subtitle">${this.station?.location || ''}</div>${this.organization.address ? `<div class=\"subtitle\">${this.organization.address}</div>` : ''}${this.organization.phone ? `<div class=\"subtitle\">Tel: ${this.organization.phone}</div>` : ''}</div><div class="divider"></div>
<div class="row"><span class="label">Date/Time:</span><span>${now.toLocaleString()}</span></div>
<div class="row"><span class="label">Amount:</span><span><b>${this.formatCurrency(Number(d.amount || 0))}</b></span></div>
<div class="row"><span class="label">Cashier:</span><span>${cashierName}</span></div>
<div class="row"><span class="label">Picked By:</span><span>${pickedByName}</span></div>
</body></html>`;
        w.document.write(html);
        w.document.close();
        w.focus();
      } catch (e) { /* no-op */ }
    },

    showSuccess(message) {
      if (this.$toast && this.$toast.success) {
        this.$toast.success(message);
      } else if (this.$swal) {
        this.$swal({ title: 'Success', text: message, icon: 'success' });
      }
    },
    showError(message) {
      if (this.$toast && this.$toast.error) {
        this.$toast.error(message);
      } else if (this.$swal) {
        this.$swal({ title: 'Error', text: message, icon: 'error' });
      }
    },
    logoutUser() {
      try {
        window.location = '/logout';
      } catch (e) { /* no-op */ }
    },
    // Build Current Shift summary card from latest shift info
    refreshCurrentShiftCard() {
      try {
        const data = this.shift || {};
        this.currentShiftCard.cashier_name = data.cashier_name || '';
        this.currentShiftCard.opened_at = data.opened_at || null;
        this.currentShiftCard.opening_balance = Number(data.opening_balance || 0);
        this.currentShiftCard.confirmed_by = data.confirmed_by || '';
        this.currentShiftCard.confirmed_by_id = data.confirmed_by_id || null;
        this.currentShiftCard.cash_sales = Number(data.cash_sales || 0);
        this.currentShiftCard.mpesa_sales = Number(data.mpesa_sales || 0);
        this.currentShiftCard.card_sales = Number(data.card_sales || 0);
        const totalSales = Number(this.currentShiftCard.cash_sales + this.currentShiftCard.mpesa_sales + this.currentShiftCard.card_sales);
        this.currentShiftCard.total_sales = totalSales;
        this.currentShiftCard.total_pickups = Number(data.pickups_total || data.total_pickups || 0);
        this.currentShiftCard.cash_at_hand = Number(this.currentShiftCard.opening_balance + this.currentShiftCard.cash_sales - this.currentShiftCard.total_pickups);
        this.currentShiftCard.cashier_closing_balance = Number(this.closeShift?.cashier_closing_balance || data.cashier_closing_balance || 0);
        this.currentShiftCard.system_closing_balance = Number(this.closeShift?.system_closing_balance || data.current_balance || data.system_closing_balance || 0);
        this.currentShiftCard.shift_id = data.shift_id || data.id || null;
        // ensure reactivity
        this.currentShiftCard = { ...this.currentShiftCard };
      } catch (e) { /* no-op */ }
    },

    // Load shift/pickup history
    async fetchShiftHistory() {
      this.shiftHistoryLoading = true;
      try {
        const response = await this.$http.get('/api/reception/shift/history', {
          params: {
            page: this.shiftHistoryPage,
            per_page: this.shiftHistoryItemsPerPage,
            search: this.shiftHistorySearch,
            with_pickups: 1
          }
        });

        const items = [];
        const data = (response && response.data && response.data.data) ? response.data.data : [];
        data.forEach(shift => {
          // Shift opened
          items.push({
            time: this.formatDateTime(shift.opened_at),
            type: 'Shift Opened',
            amount: Number(shift.opening_balance || 0),
            confirmed_by: shift.confirmed_by || '',
            shift_id: shift.id,
            raw: shift
          });

          // Pickups
          if (Array.isArray(shift.pickups)) {
            shift.pickups.forEach(pick => {
              items.push({
                time: this.formatDateTime(pick.pickup_time || pick.created_at),
                type: 'Cash Pickup',
                amount: Number(pick.amount || 0),
                confirmed_by: pick.confirmed_by || pick.staff_name || '',
                shift_id: shift.id,
                raw: pick
              });
            });
          }

          // Shift closed
          if (shift.closed_at) {
            items.push({
              time: this.formatDateTime(shift.closed_at),
              type: 'Shift Closed',
              amount: Number(shift.cashier_closing_balance || 0),
              confirmed_by: shift.close_confirmed_by || '',
              shift_id: shift.id,
              raw: shift
            });
          }
        });

        // Sort by time desc if possible
        items.sort((a, b) => {
          const ta = new Date(a.time || 0).getTime();
          const tb = new Date(b.time || 0).getTime();
          return tb - ta;
        });

        this.shiftHistory = items;
        this.shiftHistoryTotalItems = response?.data?.total || items.length;
      } catch (error) {
        console.error('Error fetching shift history:', error);
        this.shiftHistory = [];
      } finally {
        this.shiftHistoryLoading = false;
      }
    },

    handleShiftHistoryPageChange(page) {
      this.shiftHistoryPage = page;
      this.fetchShiftHistory();
    },
    handleShiftHistoryItemsPerPageChange(itemsPerPage) {
      this.shiftHistoryItemsPerPage = itemsPerPage;
      this.shiftHistoryPage = 1;
      this.fetchShiftHistory();
    },
    
    async fetchAutocomplete(term) {
      if (!this.selectedStoreId) return;
      this.searchLoading = true;
      try {
        const params = {
          search: term,
          store_id: this.selectedStoreId,
          no_pagination: true
        };
        const resp = await axios.get('/api/inventory/storeProducts', { params });
        const list = (resp && resp.data && resp.data.data) ? resp.data.data : (resp && resp.data) ? resp.data : [];
        this.autocompleteItems = Array.isArray(list) ? list.map(p => ({
          ...p,
          name: p.name,
          price: p.price || p.cash_price || 0,
          quantity: p.quantity,
          disabled: !!p.disabled
        })) : [];
      } catch (e) {
        console.warn('Search error', e);
        this.autocompleteItems = [];
      } finally {
        this.searchLoading = false;
      }
    },
    async saveSelectedItemsToPos() {
      // Store customer_data before clearing items
      const customerData = { ...this.groupPos.pos_data.customer_data };

      //console.log(customerData)
      // Clear existing items in groupPos
      this.groupPos.pos_data.items = [];
      //console.log(this.selectedItems)

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
          photo_url: item.photo_url
        };


        this.products.push(product);

        // Call groupPos.itemSelected with the current index and product
        this.groupPos.customPosItemSelected(index, product);
      });

      // Ensure customer_data is preserved
      this.groupPos.pos_data.customer_data = customerData;

      // Log customer data to verify it's set correctly
      //console.log("Customer data before save:", this.groupPos.pos_data.customer_data);
    },
    onAutocompleteChange(val) {
      const items = Array.isArray(val) ? val : this.selectedAutocomplete;
      if (!items || items.length === 0) return;
      items.forEach(item => this.addProductToCartFromAutocomplete(item));
      // Clear selection after adding
      this.selectedAutocomplete = [];
      this.productSearchTerm = '';
    },
    addProductToCartFromAutocomplete(item) {
      if (!item) return;
      if (this.station && this.station.is_pharmacy) {
        // Find an index to place the drug
        let index = this.groupPos.pos_data.drugs.length - 1;
        if (index < 0 || this.groupPos.pos_data.drugs[index].name) {
          this.groupPos.addNewRow('drug');
          index = this.groupPos.pos_data.drugs.length - 1;
        }
        this.groupPos.drugSelected(index, item);
      } else {
        // Non-pharmacy items
        let index = this.groupPos.pos_data.items.length - 1;
        if (index < 0 || this.groupPos.pos_data.items[index].name) {
          this.groupPos.addNewRow('item');
          index = this.groupPos.pos_data.items.length - 1;
        }
        this.groupPos.itemSelected(index, item);
      }
    },
    patientSelected(patient) {
      this.groupPos.pos_data.customer_data.patient_id = patient.id;
    },
    checkIfIsDrug(item) {
      if (item.product_type) {
        return ["drugs", "drug"].includes(item.product_type.toLowerCase());
      } else {
        return true;
      }
    },
    checkSellingPriceLimit(item) {

      if (Number(item.selling_price) < Number(item.lower_limit_price)) {
        const message = `The selling price set is lower than the limit of ${item.lower_limit_price} for this product.`;
        if (this.$toast && this.$toast.warning) {
          this.$toast.warning(message);
        } else {
          this.$swal({ title: 'Warning', text: message, icon: 'warning' });
        }
      }
    },
    init() {
      this.setupDefaultCustomerType();
      this.getInsuranceCompanies();
    },
    setupDefaultCustomerType() {
      if (this.station && this.customerTypes) {
        this.groupPos.pos_data.customer_data.type = this.customerTypes[0];
      } else {
        this.groupPos.pos_data.customer_data.type = "walkin";
      }
    },
    async getInsuranceCompanies() {
      try {
        const response = await fetch("/api/settings/get/insurances");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.insuranceCompanies = data;
      } catch (error) {
        console.error("Error fetching insurance companies:", error);
      }
    },
    openPaymentModal() {
      // Update totals first to ensure correct totalPayable is calculated
      this.updateTotals();

      // Reset all payment amounts to 0 - users must explicitly enter amounts
      // This ensures users only submit payment methods they consciously choose
      this.custom_payment.cash.amount = 0;
      this.custom_payment.cash.received_amount = 0;
      this.custom_payment.cash.change_amount = 0;

      this.custom_payment.mpesa.amount = 0;
      this.custom_payment.pesapal.amount = 0;
      this.custom_payment.gift_card.amount = 0;
      this.custom_payment.card.amount = 0;
      this.custom_payment.cheque.amount = 0;
      this.custom_payment.voucher.amount = 0;
      this.custom_payment.loyalty.amount = 0;
      this.custom_payment.loyalty.points = 0;
      this.custom_payment.loyalty.value = 0;

      // Fetch loyalty information if a customer is selected
      if (this.groupPos?.pos_data?.customer_data?.patient_id) {
        this.fetchLoyaltyInfo(this.groupPos.pos_data.customer_data.patient_id);
      }

      this.showPaymentModal = true;
      this.selectedPaymentPanel = 0;
    },
    calculateChange() {
      const total = Number(this.custom_payment.cash.amount || 0);
      const received = Number(this.custom_payment.cash.received_amount || 0);
      this.custom_payment.cash.change_amount = received > total ? (received - total).toFixed(2) : 0;
    },
    updateTotals() {
      // Use the same calculation logic as groupPos.updateTotalCost() for consistency
      let totalCost = 0;

      // Calculate from services
      if (this.groupPos && this.groupPos.pos_data && this.groupPos.pos_data.services) {
        this.groupPos.pos_data.services.forEach(val => {
          if (val.price && val.units) {
            totalCost += (parseFloat(val.price) * parseFloat(val.units));
          }
        });
      }

      // Calculate from drugs
      if (this.groupPos && this.groupPos.pos_data && this.groupPos.pos_data.drugs) {
        this.groupPos.pos_data.drugs.forEach(val => {
          if (val.selling_price && val.quantity) {
            totalCost += (parseFloat(val.selling_price) * parseFloat(val.quantity));
          }
        });
      }

      // Calculate from items
      if (this.groupPos && this.groupPos.pos_data && this.groupPos.pos_data.items) {
        this.groupPos.pos_data.items.forEach(val => {
          if (val.amount) {
            totalCost += parseFloat(val.amount);
          }
        });
      }

      const discount = parseFloat(this.totals.discount) || 0;
      const tax = parseFloat(this.totals.tax) || 0;

      const discounted = totalCost - discount;
      const totalPayable = discounted + tax;

      this.totals.subtotal = totalCost;
      this.totals.totalPayable = totalPayable;
    },
    async requestPayment(type) {
      try {
        this.loading = true;
        if (type === 'cash') {
          this.cash_loading = true;
          this.groupPos.pos_data.payment_details = {
            payment_method: 'cash',
            amount: Number(this.custom_payment.cash.amount || 0),
            received_amount: Number(this.custom_payment.cash.received_amount || 0),
            change_amount: Number(this.custom_payment.cash.change_amount || 0)
          };
        } else if (type === 'mpesa') {
          this.mpesa_loading = true;
          const amount = Number(this.custom_payment.mpesa.amount || this.groupPos?.pos_data?.total_cost || 0);
          const payload = {
            mobile_number: this.custom_payment.mpesa.mobile_number,
            amount: amount,
            type: 'mpesa',
            patient_id: this.groupPos?.pos_data?.customer_data?.patient_id || null
          };
          try {
            const response = await this.payment.requestCustomClientPayment(payload);
            this.mpesa_loading = false;
            // If initiation returns a transaction_id, start polling to confirm payment
            if (response && response.transaction_id) {
              if (this.$swal) {
                this.$swal({ title: 'Payment Initiated', text: 'Mpesa prompt sent. Waiting for customer to complete payment...', icon: 'info' });
              }
              this.initiatePaymentChecks('mpesa', response.transaction_id);
              this.loading = false;
              return;
            } else if (response && response.status === 'pending') {
              if (this.$swal) {
                this.$swal({ title: 'Processing on Terminal', text: 'Transaction sent to terminal. Please complete the payment on the terminal. We will update once it finishes.', icon: 'info' });
              }
              this.loading = false;
              return;
            } else if (response && response.status === 'success') {
              // Some backends may still return success without transaction_id; fallback to polling if possible
              if (response.transaction_id) {
                this.initiatePaymentChecks('mpesa', response.transaction_id);
                this.loading = false;
                return;
              }
              // As a safe fallback, do not mark as paid immediately. Inform user to wait for confirmation.
              if (this.$swal) {
                this.$swal({ title: 'Payment Initiated', text: 'Mpesa payment initiated. Please wait for confirmation.', icon: 'info' });
              }
              this.loading = false;
              return;
            } else if (response && response.alert === 'error') {
              if (this.$swal) {
                const msg = (response && response.description && Array.isArray(response.description) && response.description.length > 0)
                    ? response.description.join('\n')
                    : (response.message || 'Failed to initiate Mpesa payment.');
                this.$swal({ title: 'Error', text: msg, icon: 'error' });
              }
              this.loading = false;
              return;
            } else {
              if (this.$swal) {
                this.$swal({ title: 'Error', text: (response && response.message) ? response.message : 'Failed to initiate Mpesa payment.', icon: 'error' });
              }
              this.loading = false;
              return;
            }
          } catch (e) {
            console.error('Mpesa initiate error', e);
            if (this.$swal) {
              this.$swal({ title: 'Error', text: 'Failed to initiate Mpesa payment.', icon: 'error' });
            }
            this.mpesa_loading = false;
            this.loading = false;
            return;
          }
        }else if (type === 'mpesa_manual') {
          try {
            // Validate amount is not less than payable
            const payable = Number(this.totals.totalPayable || 0);
            const enteredAmount = Number(this.custom_payment.mpesa.amount || 0);
            if (enteredAmount < payable) {
              this.$swal && this.$swal({ title: 'Invalid Amount', text: 'M-Pesa amount cannot be less than the total payable.', icon: 'warning' });
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
              this.groupPos.pos_data.payment_details = {
                payment_method: 'mpesa',
                amount: amount,
                code: code
              };
              const saleResult = await this.groupPos.saveSale(this.station.slug, true, this.internal);
              if (saleResult && saleResult.sale_id) {
                await this.processSaleAndPrintReload(saleResult.sale_id);
              }
              this.$swal({ title: 'Payment Recorded', text: 'Manual M-Pesa entry saved successfully.', icon: 'success' });
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
              this.$swal({ title: 'Error', text: msg, icon: 'error' });
              this.loading = false;
              return;
            }
          } catch (e) {
            console.error('Manual Mpesa error', e);
            this.$swal({ title: 'Error', text: 'Failed to save manual M-Pesa entry.', icon: 'error' });
            this.loading = false;
            return;
          }
        } else if (type === 'pesapal') {
          // Use the generic client payment request flow for Pesapal (same as CustomCreate.vue)
          this.pesapal_loading = true;

          // Save selected items to localStorage before initiating pesapal payment (same as CustomCreate.vue)
          localStorage.setItem('pesapal_selected_items', JSON.stringify(this.selectedItems));

          const amount = Number(
              (this.custom_payment.pesapal.amount || this.groupPos?.pos_data?.total_cost || 0)
          ).toFixed(1);

          const payload = {
            mobile_number: this.pesapal_order_mobile_number || this.custom_payment.pesapal.mobile_number,
            amount: amount,
            type: 'pesapal',
            patient_id: this.groupPos?.pos_data?.customer_data?.patient_id || null
          };
          // Keep for reconciliation polling (mirror CustomCreate.vue)
          this.pesapal_order_mobile_number = this.custom_payment.pesapal.mobile_number;
          try {
            const response = await this.payment.requestCustomClientPayment(payload);
            if (response && response.status === 'success') {
              this.pesapal_loading = false;
              // Store the transaction ID and code for later processing (same as CustomCreate.vue)
              if (response.raw && response.raw.txntoken) {
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
              // return;
            } else if (response && response.status === 'pending') {
              // Long-lived initiate: tell the user to complete payment on terminal (same as CustomCreate.vue)
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
              // Keep the payment modal open so user can retry or switch if needed (same as CustomCreate.vue)
              this.showPaymentModal = true;
              return;
            } else {
              this.pesapal_loading = false;
              if (this.$swal) {
                this.$swal({ title: 'Error', text: (response && response.message) ? response.message : 'Failed to initiate Pesapal payment.', icon: 'error' });
              }
              this.loading = false;
              return;
            }
          } catch (e) {
            console.error('Pesapal initiate error', e);
            if (this.$swal) {
              this.$swal({ title: 'Error', text: 'Failed to initiate Pesapal payment.', icon: 'error' });
            }
            this.pesapal_loading = false;
            this.loading = false;
            return;
          }
        } else {
          return;
        }
        this.groupPos.pos_data.payment_details = {
          payment_method: 'pesapal',
          amount: this.custom_payment?.pesapal?.amount || this.totals.totalPayable
        };
        // Save sale with payment details; backend will link payments to items (including pharmacy)
        const saleResult = await this.groupPos.saveSale(this.station.slug, true, this.internal);
        if (saleResult && saleResult.sale_id) {
          await this.processSaleAndPrintReload(saleResult.sale_id);
        }

        // Feedback
        if (this.$swal) {
          this.$swal({ title: 'Payment Successful', text: 'Payment has been processed successfully.', icon: 'success' });
        }

        // Reset UI
        this.showPaymentModal = false;
        if (this.groupPos && typeof this.groupPos.clearItems === 'function') {
          this.groupPos.clearItems();
        } else if (this.groupPos && this.groupPos.pos_data) {
          this.groupPos.pos_data.items = [];
        }
        this.reloadSalesDetails();
      } catch (e) {
        console.error('Payment error', e);
        if (this.$swal) {
          this.$swal({ title: 'Error', text: 'Failed to process payment.', icon: 'error' });
        }
      } finally {
        this.loading = false;
        this.cash_loading = false;
        this.mpesa_loading = false;
        this.pesapal_loading = false;
      }
    },
    async processSaleAndPrintReload(saleId) {
      if (!saleId) return;
      try {
        const res = await this.groupPos.processPosSale(saleId, this.internal);
        const printUrl = res && res.data && res.data.url;
        if (printUrl) {
          this.nativeAutoPrintFromUrl(printUrl);
        }
      } catch (e) {
        console.warn('Failed to process POS sale', e);
      } finally {
        this.reloadSalesDetails();
      }
    },
    nativeAutoPrintFromUrl(url) {
      return new Promise((resolve, reject) => {
        if (!url) return reject(new Error('Missing print URL'));

        try {
          // Open the print URL in a new window/tab to show Chrome's default print modal
          const printWindow = window.open(url, '_blank');

          if (printWindow) {
            // Focus the new window
            printWindow.focus();
            resolve();
          } else {
            reject(new Error('Failed to open print window - popup blocked?'));
          }
        } catch (err) {
          reject(err);
        }
      });
    },


    // Begin: Mpesa payment status check helpers
    initiatePaymentChecks(type, transaction_id) {
      // Reset guard and interval
      this.paymentResultHandled = false;
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      // Show waiting dialog and hide the payment modal
      this.paymentCheckDialog = true;
      this.loading = false;
      this.mpesa_loading = false;
      this.pesapal_loading = false;
      this.showPaymentModal = false;

      // Safety timeout to auto-close the waiting dialog if nothing comes back within 60s
      const timeoutId = setTimeout(() => {
        if (this.paymentCheckDialog) {
          this.paymentCheckDialog = false;
          this.stopUpdatingBalance();
          try { localStorage.removeItem('pesapal_order_tracking_id'); } catch (e) {}
          // Give user a chance to retry
          this.showPaymentModal = true;
          if (this.$swal) {
            this.$swal({ title: 'Payment Timeout', text: 'Payment check timed out. Please try again.', icon: 'warning' });
          }
        }
      }, 60000);

      // Start polling after a short delay
      setTimeout(() => {
        this.intervalId = setInterval(async () => {
          if (!this.paymentCheckDialog) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            clearTimeout(timeoutId);
            return;
          }
          // Choose number per CustomCreate.vue logic
          let number = null;
          if (this.payment && this.payment.mpesa !== null && this.custom_payment && this.custom_payment.mpesa && this.custom_payment.mpesa.mobile_number) {
            // Use the entered Mpesa mobile number when present
            number = this.custom_payment.mpesa.mobile_number;
          } else if (this.pesapal_order_mobile_number !== null) {
            // Fallback to stored Pesapal order mobile number
            number = this.pesapal_order_mobile_number;
          } else {
            // Last fallback to mpesa mobile number field
            number = this.custom_payment && this.custom_payment.mpesa ? this.custom_payment.mpesa.mobile_number : null;
          }
          await this.fetchPayment(type, transaction_id, number);
        }, 3000);
      }, 3000);
    },
    stopUpdatingBalance() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
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

          // Update the transaction code in the manual entry field based on payment type
          if (type === 'mpesa') {
            this.custom_payment.mpesa.code = response_data.ref_no;
            // Also set transaction_id based on the same code
            this.custom_payment.mpesa.transaction_id = response_data.ref_no;
            if (this.payment && this.payment.mpesa) {
              this.payment.mpesa.code = response_data.ref_no;
            }
          } else if (type === 'pesapal') {
            this.custom_payment.pesapal.code = response_data.ref_no;
            this.custom_payment.pesapal.transaction_id = response_data.ref_no;
          }

          this.paymentCheckDialog = false;

          // Process the payment and trigger automatic printing
          try {
            // Ensure POS items are persisted before finalizing sale (mirror CustomCreate.vue)
            // await this.saveSelectedItemsToPos();

            // Set payment details for the sale
            if (type === 'mpesa') {
              this.groupPos.pos_data.payment_details = {
                payment_method: 'mpesa',
                amount: response_data.paid_amount,
                code: response_data.ref_no
              };
            } else if (type === 'pesapal') {
              this.groupPos.pos_data.payment_details = {
                payment_method: 'pesapal',
                amount: response_data.paid_amount,
                code: response_data.ref_no
              };
            }

            // Save sale and trigger printing
            const saleResult = await this.groupPos.saveSale(this.station.slug, true, this.internal);
            if (saleResult && saleResult.sale_id) {
              await this.processSaleAndPrintReload(saleResult.sale_id);
            }

            // Show success message
            this.$swal({
              title: 'Successful payment',
              text: `Payment of KSH: ${response_data.paid_amount} made successfully via ${type.toUpperCase()}`,
              icon: 'success',
              confirmButtonText: 'OK'
            });

            // Clear cart and reset UI
            this.showPaymentModal = false;
            if (this.groupPos && typeof this.groupPos.clearItems === 'function') {
              this.groupPos.clearItems();
            } else if (this.groupPos && this.groupPos.pos_data) {
              this.groupPos.pos_data.items = [];
            }
            this.reloadSalesDetails();

          } catch (e) {
            console.error('Error processing payment:', e);
            this.$swal({
              title: 'Payment Error',
              text: 'Payment was successful but failed to process sale. Please contact support.',
              icon: 'error'
            });
          }

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
    // End: Mpesa payment status check helpers
    async fetchRecentMpesaPayments() {
      try {
        this.recentMpesaError = null;
        this.recentMpesaLoading = true;
        // Build params using total payable precedence for matching
        const params = {
          expected_total: Number(this.totals?.totalPayable || 0),
          since_minutes: 1245,
          limit: 2000,
          tolerance: 0
        };
        const resp = await axios.get('/api/finance/mpesa/recent-payments', { params });
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
      } catch (e) { /* no-op */ }
    },

    // Enhanced payment validation methods (matching CustomCreate.vue)
    calculateTotalPaidAmount() {
      let total = 0;
      total += parseFloat(this.custom_payment.cash?.amount || 0);

      // Only include M-Pesa amount if code is provided
      const mpesaCode = (this.custom_payment.mpesa?.code || '').trim();
      if (mpesaCode) {
        total += parseFloat(this.custom_payment.mpesa?.amount || 0);
      }

      // Only include Pesapal amount if code is provided
      const pesapalCode = (this.custom_payment.pesapal?.code || '').trim();
      if (pesapalCode) {
        total += parseFloat(this.custom_payment.pesapal?.amount || 0);
      }

      total += parseFloat(this.custom_payment.card?.amount || 0);
      total += parseFloat(this.custom_payment.cheque?.amount || 0);
      total += parseFloat(this.custom_payment.voucher?.amount || 0);
      total += parseFloat(this.custom_payment.gift_card?.amount || 0);
      total += parseFloat((this.custom_payment.loyalty && (this.custom_payment.loyalty.value || this.custom_payment.loyalty.amount)) || 0);
      return total;
    },

    // Remaining payable specifically for a mode, taking into account other modes
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

    // Clamp an amount field for a given mode to the remaining for that mode
    clampPaymentAmount(mode) {
      try {
        const max = this.remainingFor(mode);
        if (!this.custom_payment[mode]) return;
        let val = parseFloat(this.custom_payment[mode].amount || 0);
        if (isNaN(val) || val < 0) val = 0;
        if (val > max) {
          this.custom_payment[mode].amount = max;
          if (this.clampNotice && (mode === 'mpesa' || mode === 'pesapal')) {
            this.clampNotice[mode] = `Amount adjusted to remaining payable (${this.formatCurrency(max)})`;
          }
        } else {
          if (this.clampNotice && (mode === 'mpesa' || mode === 'pesapal')) {
            this.clampNotice[mode] = '';
          }
        }
      } catch (e) { /* no-op */ }
    },

    // Calculate cash change and set applied cash based on remaining before cash
    calculateCashChange() {
      const received = parseFloat(this.custom_payment?.cash?.received_amount) || 0;
      const payable = parseFloat(this.totals?.totalPayable) || 0;
      if (payable <= 0) {
        if (this.custom_payment?.cash) {
          this.custom_payment.cash.change_amount = 0;
          this.custom_payment.cash.amount = 0;
        }
        return;
      }
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
          Object.keys(amounts).forEach(k => { others += amounts[k] || 0; });
          remainingBeforeCash = Math.max(0, payable - others);
        }
      } catch (e) { remainingBeforeCash = Math.max(0, payable); }

      if (this.custom_payment?.cash) {
        this.custom_payment.cash.change_amount = Math.max(0, received - remainingBeforeCash).toFixed(2);
        const cashApplicable = Math.min(Math.max(0, received), remainingBeforeCash);
        this.custom_payment.cash.amount = cashApplicable;
      }
      // Optionally clamp for consistency
      if (typeof this.clampPaymentAmount === 'function') {
        this.clampPaymentAmount('cash');
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

      // Validation: must match total payable exactly (no under/over-pay)
      if (totalPaid < totalPayable || totalPaid > totalPayable || totalPaid <= 0) {
        return false;
      }

      // M-Pesa validation: if amount is set, code must be provided
      const mpesaAmount = parseFloat(this.custom_payment.mpesa.amount || 0);
      if (mpesaAmount > 0) {
        const mpesaCode = (this.custom_payment.mpesa.code || '').trim();
        if (!mpesaCode) {
          return false; // M-Pesa amount present but no code
        }
      }

      // Pesapal validation: if amount is set, code must be provided
      const pesapalAmount = parseFloat(this.custom_payment.pesapal.amount || 0);
      if (pesapalAmount > 0) {
        const pesapalCode = (this.custom_payment.pesapal.code || '').trim();
        if (!pesapalCode) {
          return false; // Pesapal amount present but no code
        }
      }

      // Voucher validation: if amount is set, code must be provided
      const voucherAmount = parseFloat(this.custom_payment.voucher.amount || 0);
      if (voucherAmount > 0) {
        const voucherCode = (this.custom_payment.voucher.code || '').trim();
        if (!voucherCode) {
          return false; // Voucher amount present but no code
        }
      }

      // Gift card validation: if amount is set, code must be provided
      const giftCardAmount = parseFloat(this.custom_payment.gift_card.amount || 0);
      if (giftCardAmount > 0) {
        const giftCardCode = (this.custom_payment.gift_card.code || '').trim();
        if (!giftCardCode) {
          return false; // Gift card amount present but no code
        }
      }

      // All validations passed
      return true;
    },

    getPaymentValidationError() {
      const totalPayable = parseFloat(this.totals.totalPayable || 0);
      const totalPaid = this.calculateTotalPaidAmount();

      if (totalPaid <= 0) {
        return 'Enter a valid payment amount.';
      }
      if (totalPaid < totalPayable) {
        return 'Payment amount must be equal to the total payable.';
      }
      if (totalPaid > totalPayable) {
        return 'Payment amount exceeds total payable. Adjust Mpesa/Pesapal or other modes to match the total.';
      }

      // Check for missing codes
      const mpesaAmount = parseFloat(this.custom_payment.mpesa.amount || 0);
      if (mpesaAmount > 0 && !(this.custom_payment.mpesa.code || '').trim()) {
        return 'M-Pesa code is required when M-Pesa amount is specified';
      }

      const pesapalAmount = parseFloat(this.custom_payment.pesapal.amount || 0);
      if (pesapalAmount > 0 && !(this.custom_payment.pesapal.code || '').trim()) {
        return 'Pesapal transaction code is required when Pesapal amount is specified';
      }

      const voucherAmount = parseFloat(this.custom_payment.voucher.amount || 0);
      if (voucherAmount > 0 && !(this.custom_payment.voucher.code || '').trim()) {
        return 'Voucher code is required when voucher amount is specified';
      }

      const giftCardAmount = parseFloat(this.custom_payment.gift_card.amount || 0);
      if (giftCardAmount > 0 && !(this.custom_payment.gift_card.code || '').trim()) {
        return 'Gift card code is required when gift card amount is specified';
      }

      return 'Invalid payment configuration';
    },


    async processMultiplePayments() {
      if (!this.canProcessPayment()) {
        this.$swal({title: 'Invalid Payment', text: 'Payment amount must be equal to or greater than total payable', icon: 'error'});
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
          cash_amount: parseFloat(this.custom_payment.cash.amount || 0),
          mpesa_amount: parseFloat(this.custom_payment.mpesa.amount || 0),
          pesapal_amount: parseFloat(this.custom_payment.pesapal.amount || 0),
          card_amount: parseFloat(this.custom_payment.card.amount || 0),
          cheque_amount: parseFloat(this.custom_payment.cheque.amount || 0),
          voucher_amount: parseFloat(this.custom_payment.voucher.amount || 0),
          giftcard_amount: parseFloat(this.custom_payment.gift_card.amount || 0),
          loyalty_amount: parseFloat(this.custom_payment.loyalty.amount || 0),
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

        const saleResult = await this.groupPos.saveSale(this.station.slug, true, this.internal);

        if (saleResult && saleResult.sale_id) {
          this.$swal({title: 'Payment Successful', text: 'Payment processed successfully!', icon: 'success'});
          this.showPaymentModal = false;
          this.manualVoucherCode = null;
          this.manualGiftCardCode = null;

          this.showGiftCardInput = false;
          this.showVoucherInput = false;
          this.giftCardAccount = null;


          await this.processSaleAndPrintReload(saleResult.sale_id, saleResult.payment_id);

        } else {
          throw new Error('Failed to process payment');
        }
      } catch (error) {

        this.$swal({ title: 'Error', text: error, icon: 'error' });

      } finally {
        this.paymentProcessing = false;
      }
    },

    resetPaymentForm() {
      this.custom_payment = {
        cash: { amount: 0, received_amount: 0, change_amount: 0 },
        mpesa: { code: '', mobile_number: '', amount: 0, amount_to_pay: 0 },
        pesapal: { email: '', mobile_number: null, amount: 0, transaction_id: null, code: '' },
        card: { type: '', number: '', name: '', valid_thru: '', amount: 0 },
        cheque: { name: '', bank: '', date: '', branch: '', amount: 0, number: '' },
        voucher: { code: '', amount: 0 },
        giftcard: { code: '', amount: 0 },
        gift_card: { code: '', amount: 0 },
        loyalty: { points: 0, amount: 0, available: 0, rate: 0, value: 0 }
      };
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 2
      }).format(amount || 0);
    },

    // Multiple payment mode methods
    shouldRenderPanel(mode) {
      return mode.active;
    },

    handleInput() {
      // Handle input changes for payment forms
      this.$forceUpdate();
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

      // Use points_redeem_amount from settings config instead of API call
      if (this.options.configurations && this.options.configurations.points_redeem_amount) {
        this.custom_payment.loyalty.rate = Number(this.options.configurations.points_redeem_amount) || 0;
      } else {
        // Fallback to API call if settings not loaded yet
        try {
          const rateResp = await window.axios.get('/api/finance/points/rate');
          const rate = rateResp?.data?.data?.rate || 0;
          this.custom_payment.loyalty.rate = Number(rate) || 0;
        } catch (e) {
          console.warn('Failed to fetch loyalty rate', e);
          this.custom_payment.loyalty.rate = 0;
        }
      }

      // Recompute value after fetching
      this.updateLoyaltyValue();
    },

    updateLoyaltyValue() {
      const pts = Math.max(0, Math.floor(Number(this.custom_payment.loyalty.points || 0)));
      const rate = Number(this.custom_payment.loyalty.rate || 0);
      const available = Number(this.custom_payment.loyalty.available || 0);
      let usePts = pts;
      if (usePts > available) usePts = available;

      if (rate > 0) {
        const maxByAmount = Math.floor(this.totals.totalPayable / rate);
        if (usePts > maxByAmount) usePts = maxByAmount;
      }
      this.custom_payment.loyalty.points = usePts;
      this.custom_payment.loyalty.value = Number((usePts * rate).toFixed(2));
      this.custom_payment.loyalty.amount = this.custom_payment.loyalty.value;
    },

    // Gift Card and Voucher Methods
    async fetchGiftCardDetails(code) {
      try {
        const resp = await window.axios.post('/api/finance/get/gift/card/', {code});
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
        const resp = await window.axios.post('/api/finance/get/voucher/', {code});
        const data = resp && resp.data ? resp.data : null;

        if (data) {
          this.voucherAccount = data;
          const voucherAmountValue = this.voucherAccount.amount || this.voucherAccount.balance || 0;
          this.custom_payment.voucher.code = data.code;
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
        this.voucherAccount = null;
        this.voucherAmountValue = 0;
        this.$swal({
          title: 'Error',
          text: 'Failed to fetch voucher details. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    },

    // Barcode and Input Handling Methods
    handleBarcodeScan() {
      const value = (this.barcode || '').trim();
      if (value === '') {
        return;
      }
      this.scannedBarcode = value;

      const giftCardModeIndex = this.paymentModes.findIndex(mode => mode.name === 'giftcard');
      const voucherModeIndex = this.paymentModes.findIndex(mode => mode.name === 'voucher');

      // If in gift card or voucher panels, respect those flows
      if (giftCardModeIndex !== -1 && this.selectedPaymentPanel === giftCardModeIndex) {
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
      return (/^[0-9\-]+$/.test(cleaned) && cleaned.replace(/\D/g, '').length >= 6);
    },

    globalKeydownHandler(event) {
      // Handle barcode scanning
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return; // Don't interfere with normal typing
      }

      // Clear buffer if too much time has passed
      if (this.barcodeTimer) {
        clearTimeout(this.barcodeTimer);
      }

      // Add character to buffer
      if (event.key.length === 1) {
        this.barcodeBuffer += event.key;
        this.barcodeTimer = setTimeout(() => {
          this.barcodeBuffer = '';
        }, 100);
      }

      // Process on Enter
      if (event.key === 'Enter') {
        if (this.barcodeBuffer.length > 0) {
          this.barcode = this.barcodeBuffer;
          this.handleBarcodeScan();
          this.barcodeBuffer = '';
        }
      }
    },

    // Product fetching methods (placeholders - these would need to be implemented based on your API)
    async fetchProductByBarcode(barcode) {
      // Implementation depends on your product API
      // console.log('Fetching product by barcode:', barcode);
    },

    async searchProductsByName(name) {
      // Implementation depends on your product search API
      // console.log('Searching products by name:', name);
    },

    // Toggle methods for gift card and voucher inputs
    toggleGiftCardInput() {
      this.showGiftCardInput = !this.showGiftCardInput;
    },

    selectedBatch(index, selected) {
      // Open batch modal first
      this.showBatchModal = true;
      this.selectedBatchIndex = index;


      // Populate available batches (fetch from API or from selected item)
      this.currentDrugSelected = selected;
      this.fetchAvailableBatches(selected.product_id)
        .then(batches => { this.availableBatches = batches || []; })
        .catch(() => { this.availableBatches = []; });


      // The actual drug selection will happen after modal confirmation
      // You'll need a separate method to handle modal confirmation
    },

    onBatchSelectionChange() {
      // Handle any real-time updates when selection changes
    },

    confirmBatchSelection() {
      if (this.selectedBatchIndex !== null && this.selectedBatchItem) {
        // Pass the selected batch to drugSelected
        this.groupPos.drugSelected(this.selectedBatchIndex, {
          ...this.currentDrugSelected,
          selected_batch: this.selectedBatchItem
        });


        // Close modal and reset
        this.showBatchModal = false;
        this.resetBatchSelection();
      }
    },

    onCancelBatchModal() {
      this.showBatchModal = false;
      this.resetBatchSelection();
    },

    resetBatchSelection() {
      this.selectedBatchIndex = null;
      this.selectedBatchItem = null;
      this.currentDrugSelected = null;
      this.availableBatches = [];
    }

  },
  async mounted() {
    this.options.config(["age_in", "prescription_whereto", "prescription_method", "prescription_duration", "points_redeem_amount"]);

    // Add global keydown event listener for barcode scanning
    document.addEventListener('keydown', this.globalKeydownHandler);

    if (this.posData) {
      this.station = JSON.parse(this.posData);
      if (this.station.customer_type) {
        this.customerTypes = JSON.parse(this.station.customer_type);
      }
      if (this.station && this.station.store_id) {
        this.selectedStoreId = this.station.store_id;
      }
    }
    if (this.$route.params.visitId) {
      this.visitId = this.$route.params.visitId;
      this.groupPos.pos_data.customer_data.visit_id = this.$route.params.visitId;
    }

    await this.getInsuranceCompanies();
    // Load staff for Confirmed by selectors
    try { await this.fetchStaff(); } catch (e) { /* no-op */ }
    // Load organization details for print headers
    try { await this.fetchOrganizationData(); } catch (e) { /* no-op */ }
    // Initialize shift status
    try { await this.checkShiftStatus(); } catch (e) { /* no-op */ }
    try { this.refreshCurrentShiftCard(); } catch (e) { /* no-op */ }
    try { await this.fetchShiftHistory(); } catch (e) { /* no-op */ }

    this.init();

    if( MSettings.msetting('core.enable_commercial_settings_core')){
      try { await this.fetchBranchData(); } catch (e) { /* no-op */ }
    }

  },
  beforeDestroy() {
    // Clean up event listener
    document.removeEventListener('keydown', this.globalKeydownHandler);
  }
};
</script>
