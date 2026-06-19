<template>
  <v-card flat>
    <collabmed-floating-loader v-if="!initialised"></collabmed-floating-loader>
    <!--        <collabmed-loading v-if="!initialised"></collabmed-loading>-->

    <div v-else>
      <collabmed-floating-loader v-if="loading"></collabmed-floating-loader>

      <v-container fluid>
        <v-row >
          <v-col md="5">
            <v-switch
                v-model="pos.pharmacy.new_patient"
                @change="checkIfWalkin()"
                label="Check here if a new patient i.e. walkin"
            ></v-switch>
          </v-col>
          <v-col class="mx-1" md="5" v-if="!pos.pharmacy.new_patient">
            <patient-search @patientSelected="patientSelected"></patient-search>
          </v-col>
          <v-col v-else md="5">
            <v-text-field class="mx-1" label="New patient" outline v-model="pos.pharmacy.patient"></v-text-field>
          </v-col>
        </v-row>

        <div v-if="!pos.pharmacy.new_patient && pos.pharmacy.patient">
          <v-row  v-if="pos.pharmacy.patient.schemes.length > 0">
            <v-col md="5">
              <v-switch
                  v-model="pos.pharmacy.use_insurance"
                  @change="pos.changePaymentMode()"
                  label="Change payment mode to insurance"
              ></v-switch>
            </v-col>
            <v-col v-if="pos.pharmacy.use_insurance" md="5">
              <v-select v-model="pos.pharmacy.scheme"
                        :items="pos.pharmacy.patient.schemes"
                        outline
                        return-object
                        label="Select scheme"
                        item-text="scheme_name"
                        item-value="id"
              ></v-select>
            </v-col>
          </v-row>
        </div>

        <v-divider></v-divider>


        <!-- <v-layout row wrap>
             <v-flex md2 mx-1><p class="font-weight-bold">Drug</p></v-flex>
             <v-flex mx-1 md1><p class="font-weight-bold">Route/Unit</p></v-flex>
             <v-flex mx-1 md1><p class="font-weight-bold">Dosage</p></v-flex>
             <v-flex mx-1 md1><p class="font-weight-bold">Frequency</p></v-flex>
             <v-flex mx-1 md1><p class="font-weight-bold">Duration</p></v-flex>
             <v-flex mx-1 :class="{ md2: pos.pharmacy.use_insurance, md1: !pos.pharmacy.use_insurance }"><p class="font-weight-bold">Measure</p></v-flex>
             <v-flex mx-1 :class="{ md2: pos.pharmacy.use_insurance, md1: !pos.pharmacy.use_insurance }"><p class="font-weight-bold">Quantity</p></v-flex>
             <v-flex md1 mx-1 v-if="!pos.pharmacy.use_insurance"><p class="font-weight-bold">Selling price</p></v-flex>
             <v-flex md1 mx-1 v-if="!pos.pharmacy.use_insurance"><p class="font-weight-bold">Amount</p></v-flex>
             <v-flex md1 mx-1 v-if="!pos.pharmacy.use_insurance"><p class="font-weight-bold">Total</p></v-flex>
         </v-layout>-->

        <v-row  v-for="(item, index) in pos.pharmacy.selected_drugs" :key="item.id">
          <v-col class="mx-1" md="2" >
            <store-product-search
                :store-id="station.store_id"
                v-if="!item.name"
                @results="selected => openDrugModal(index, selected)"
            ></store-product-search>
            <h5 v-else>{{ item.name }}</h5>
          </v-col>

          <v-col class="mx-1" md="1" v-if="checkItemType(item)">
            <v-select v-model="item.route"
                      :disabled="!item.name"
                      label="Route/Unit"
                      outline
                      :items="configurations.prescription_whereto"
                      item-text="item_name"
                      item-value="id"
            ></v-select>
          </v-col>

          <v-col class="mx-1" md="1"  v-if="checkItemType(item)">
            <v-text-field
                v-model="item.dosage"
                @input="pos.updatePharmacyCartState(item)"
                :disabled="!item.name"
                label="Dosage"
                outline></v-text-field>
          </v-col>

          <v-col class="mx-1" md="1" v-if="checkItemType(item)">
            <v-select v-model="item.frequency"
                      label="Frequency"
                      outline
                      :disabled="!item.name"
                      :items="configurations.prescription_method"
                      item-text="item_name"
                      return-object
                      @input="pos.updatePharmacyCartState(item)"
            ></v-select>
          </v-col>

          <v-col class="mx-1" md="1" v-if="checkItemType(item)">
            <v-text-field label="Duration"
                          :disabled="!item.name"
                          outline v-model="item.duration"
                          @input="pos.updatePharmacyCartState(item)"
            ></v-text-field>
          </v-col>

          <v-col class="mx-1" :class="{ md2: pos.pharmacy.use_insurance, md1: !pos.pharmacy.use_insurance }" v-if="checkItemType(item)">
            <v-select
                v-model="item.measure"
                label="Measure"
                outline
                :disabled="!item.name"
                :items="configurations.prescription_duration"
                item-text="item_name"
                return-object
                @change="pos.updatePharmacyCartState(item)"
            ></v-select>
          </v-col>

          <v-col class="mx-1"  >
            <v-text-field label="Unit of measurement"
                          v-model="item.unit_of_measurement"
                          outline
                          :disabled="!item.name"
            ></v-text-field>
          </v-col>

          <v-col class="mx-1" :class="{ md2: pos.pharmacy.use_insurance, md1: !pos.pharmacy.use_insurance }" >
            <v-text-field label="Quantity"
                          v-model="item.quantity"
                          @input="handleQuantityChange(item)"
                          outline
                          :disabled="!item.name"
            ></v-text-field>
          </v-col>

          <v-col class="mx-1" md="1" v-if="!pos.pharmacy.use_insurance">
            <v-text-field
                label="Selling price"
                disabled
                outline
                :value="item.selling_price"></v-text-field>
          </v-col>  
          <v-col class="mx-1" md="1" v-if="!pos.pharmacy.use_insurance" >
            <v-text-field label="Amount"
                          outline
                          v-model="item.amount"
                          @input="pos.updatePharmacyCartCost(item)"
                          disabled
            ></v-text-field>
          </v-col>
          <v-col class="mx-1" md="1" >
            <span v-if="!pos.pharmacy.use_insurance" >{{ item.total }} </span>
            <v-btn flat icon small color="error"
                   @click="removeSelection(index)"
                   :disabled="pos.pharmacy.selected_drugs.length <= 1">
              <v-icon>delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <v-row >
          <v-col cols="9">
            <v-btn color="primary"
                   @click="AddNewRow()">
              <v-icon>add</v-icon>
              Add new
            </v-btn>
            <v-btn color="success"
                   v-if="!loading"
                   @click="saveData()">
              Save
            </v-btn>
            <v-btn color="teal"
                   v-if="can('inventory.receive-pos-payments') && !loading"
                   @click="saveData(1)">
              Save and receive payment
            </v-btn>
            <v-progress-circular
                :width="3"
                v-else
                class="ml-4"
                color="black"
                indeterminate
            ></v-progress-circular>
          </v-col>
          <v-col v-if="!pos.pharmacy.use_insurance">
            <span class="subheading font-weight-black">Total Cost:  {{ pos.total_cost }}</span>
          </v-col>
        </v-row>
      </v-container>

      <!-- Drug Selection Modal -->
      <v-dialog v-model="showDrugModal" max-width="500px">
        <v-card>
          <v-card-title>Confirm Drug Selection</v-card-title>
          <v-card-text>
            Are you sure you want to select this drug?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="showDrugModal = false">Cancel</v-btn>
            <v-btn color="blue darken-1" text @click="confirmDrugSelection">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-card>
</template>
<script>
import PatientSearch from "@reception/components/patients/PatientSearch.vue";
import StoreProductSearch from "@inventory/components/StoreProductsSearch";
import Pos from "@inventory/libs/pos/Pos";
import SettingsOptions from "@settings/libs/SettingsOptions";
import { mapActions } from "vuex";
import moment from "moment";

export default {
  props: ["station"],

  components: {
    PatientSearch, StoreProductSearch,
  },

  data: () => ({
    pos: new Pos(),
    loading: false,
    options: new SettingsOptions(),
    start_date: moment().startOf("day").format("YYYY-MM-DD HH:mm:ss"),
    end_date: moment().format("YYYY-MM-DD HH:mm:ss"),
    saveAndProcessPayment: false,
    showDrugModal: false,
    pendingDrugSelection: null,
  }),

  computed: {
    initialised() {
      return !!this.configurations;
    },

    configurations() {
      return this.options.configurations;
    },
  },

  methods: {
    ...mapActions([
      "setInventoryPosSales",
    ]),

    handleQuantityChange(item) {
      consolle.log("qty")
      // Check divisibility first
      this.checkDivisibility(item);

      // Update the cart cost
      this.pos.updatePharmacyCartCost(item);
    },
    checkDivisibility(item) {
      const dispensableAmount = item.dispensable_amount;
      const quantity = parseInt(item.quantity, 10);

      // Check if the quantity is divisible by dispensableAmount
      if (isNaN(quantity) || quantity % dispensableAmount !== 0) {
        console.log("quantity")
        // Flash a message to the user
        flash({
          message: `The quantity must be divisible by ${dispensableAmount}. Please adjust it.`,
          alert: "error",
        });

        // Clear the input field
        item.quantity = null;
      }
    },
    async saveData(processPayment) {
      this.loading = true;

      if (processPayment) {
        const response = await this.pos.saveData(1);

        if (!response) {
          return this.loading = false;
        }

        if (response) {
          await this.initialise();

          this.loading = false;
        };
      } else {
        const response = await this.pos.saveData();

        if (response) {
          await this.initialise();

          this.loading = false;
        } else {
          this.loading = false;
        }
      }
    },

    async initialise() {
      return await this.setInventoryPosSales({
        params: {
          station_id: this.station.id,
        },
      });
    },

    drugSelected(index, selected) {
      const selling_price = selected.cash_price;

      if (!this.pos.inCart(selected) ) {

        this.pos.pharmacy.selected_drugs[index].id = selected.id;
        this.pos.pharmacy.selected_drugs[index].name = selected.name;
        this.pos.pharmacy.selected_drugs[index].quantity = 1;
        this.pos.pharmacy.selected_drugs[index].orderable_quantity = selected.quantity;
        this.pos.pharmacy.selected_drugs[index].duration = 1;
        this.pos.pharmacy.selected_drugs[index].unit_of_measurement = selected.unit_of_measurement;
        this.pos.pharmacy.selected_drugs[index].selling_price = selling_price;
        this.pos.pharmacy.selected_drugs[index].route = null;
        this.pos.pharmacy.selected_drugs[index].amount = selling_price;
        this.pos.pharmacy.selected_drugs[index].total = selling_price;
        this.pos.pharmacy.selected_drugs[index].product_id = selected["product_id"];
        this.pos.pharmacy.selected_drugs[index].product_type = selected.type;
        this.pos.updateTotalCost();
      } else {
        flash({
          message: "Product already exists in cart",
          alert: "error",
        });
      }
    },

    checkItemType(item) {
      if (item.product_type) {
        return ["drugs", "drug", "chronic", "general", "otc", "controlled"].includes(item.product_type.toLowerCase());
      } else {
        return true;
      }
    },

    patientSelected(patient) {
      this.pos.pharmacy.patient = patient;
    },

    checkIfWalkin() {
      this.pos.pharmacy.patient = null;
      if (this.pos.pharmacy.new_patient) {
        this.pos.pharmacy.patient = "walkin";
      }
    },

    AddNewRow() {
      this.pos.pharmacy.selected_drugs.push({
        id: null,
        name: null,
        route: null,
        frequency: 1,
        duration: null,
        measure: null,
        quantity: null,
        selling_price: null,
        amount: null,
        total: null,
        product_id: null,
        product_type: null,
      });
    },

    removeSelection(index) {
      this.pos.pharmacy.selected_drugs.splice(index, 1);
      this.pos.updateTotalCost();
    },

    openDrugModal(index, selected) {
    alert("open modal");
      this.pendingDrugSelection = { index, selected };
      this.showDrugModal = true;
    },

    confirmDrugSelection() {
      if (this.pendingDrugSelection) {
        const { index, selected } = this.pendingDrugSelection;
        this.drugSelected(index, selected);
        this.pendingDrugSelection = null;
      }
      this.showDrugModal = false;
    },
  },

  mounted() {
    this.pos.is_pharmacy = true;
    this.pos.station_id = this.station.id;
    this.options.config([
      "prescription_whereto", "prescription_method", "prescription_duration",
    ]);
  },
};
</script>

