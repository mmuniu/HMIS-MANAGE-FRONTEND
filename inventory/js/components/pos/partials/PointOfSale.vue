<template>
  <v-container>
    <v-form ref="form">
      <!-- Invoice and Date -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
              v-model="invoiceLayout"
              label="Invoice Layout"
              :items="invoiceLayouts"
              item-text="name"
              item-value="id"
              dense outlined clearable
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                  v-model="transactionDate"
                  label="Transaction Date"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-bind="attrs"
                  v-on="on"
                  dense outlined
              />
            </template>
            <v-date-picker v-model="transactionDate" @input="menu = false" />
          </v-menu>
        </v-col>
      </v-row>

      <!-- Commission Agent and Customer -->
      <v-row>
        <v-col cols="12" md="6">
          <v-select
              v-model="commissionAgent"
              :items="commissionAgents"
              label="Commission Agent"
              item-text="name"
              item-value="id"
              dense outlined clearable
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
              v-model="selectedCustomer"
              :items="customers"
              label="Customer"
              item-text="name"
              item-value="id"
              dense outlined
              :return-object="true"
          />
        </v-col>
      </v-row>

      <!-- Customer Balance Display -->
      <v-row v-if="selectedCustomer">
        <v-col cols="12">
          <v-alert type="info" outlined>
            Customer Balance: <strong>{{ selectedCustomer.balance | currency }}</strong>
          </v-alert>
        </v-col>
      </v-row>

      <!-- Payment Status and Discount -->
      <v-row>
        <v-col cols="12" md="6">
          <v-select
              v-model="paymentStatus"
              :items="paymentStatuses"
              label="Payment Status"
              dense outlined
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-text-field
              v-model.number="discount"
              label="Discount"
              type="number"
              min="0"
              dense outlined
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-select
              v-model="discountType"
              :items="['fixed', 'percentage']"
              label="Discount Type"
              dense outlined
          />
        </v-col>
      </v-row>

      <!-- Tax and Shipping -->
      <v-row>
        <v-col cols="6" md="6">
          <v-select
              v-model="taxId"
              :items="taxRates"
              label="Select Tax"
              item-text="name"
              item-value="id"
              dense outlined
          />
        </v-col>
        <v-col cols="6" md="6">
          <v-text-field
              v-model="shippingDetails"
              label="Shipping Details"
              dense outlined
          />
        </v-col>
      </v-row>

      <!-- Sales Notes and Staff Note -->
      <v-row>
        <v-col cols="12" md="6">
          <v-textarea
              v-model="salesNote"
              label="Sell Note"
              rows="2"
              auto-grow
              outlined
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-textarea
              v-model="staffNote"
              label="Staff Note"
              rows="2"
              auto-grow
              outlined
          />
        </v-col>
      </v-row>

      <!-- Buttons -->
      <v-row>
        <v-col cols="12" class="text-right">
          <v-btn color="primary" @click="submit">Submit</v-btn>
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
export default {
  name: "PosForm",
  data() {
    return {
      invoiceLayout: null,
      invoiceLayouts: [{ id: 1, name: "Default" }, { id: 2, name: "Compact" }],
      transactionDate: new Date().toISOString().substr(0, 10),
      menu: false,

      commissionAgent: null,
      commissionAgents: [{ id: 1, name: "John Doe" }, { id: 2, name: "Jane Smith" }],

      selectedCustomer: null,
      customers: [
        { id: 1, name: "Customer A", balance: 500 },
        { id: 2, name: "Customer B", balance: 1200 },
      ],

      paymentStatus: "due",
      paymentStatuses: ["paid", "due", "partial"],

      discount: 0,
      discountType: "fixed",

      taxId: null,
      taxRates: [{ id: 1, name: "5%" }, { id: 2, name: "18%" }],

      shippingDetails: "",
      salesNote: "",
      staffNote: "",
    };
  },
  filters: {
    currency(value) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value);
    },
  },
  methods: {
    submit() {
      const payload = {
        invoiceLayout: this.invoiceLayout,
        transactionDate: this.transactionDate,
        commissionAgent: this.commissionAgent,
        customerId: this.selectedCustomer?.id,
        paymentStatus: this.paymentStatus,
        discount: this.discount,
        discountType: this.discountType,
        taxId: this.taxId,
        shippingDetails: this.shippingDetails,
        salesNote: this.salesNote,
        staffNote: this.staffNote,
      };
      console.log("Submitting POS Form:", payload);
      // Send to API here
    },
  },
};
</script>

<style scoped>
.v-alert {
  font-size: 1.1rem;
}
</style>
