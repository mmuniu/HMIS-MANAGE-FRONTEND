<template>
    <div>

        <v-card>

            <v-card-title class="grey--text">
                <h5 v-if="bills.patient">{{ bills.patient.full_name }},   <b class="mx-3">({{ bills.patient.patient_no }})</b></h5> <br/>
               Raise invoice to patient / patient insurance schemes for selected items
            </v-card-title>


            <v-card-text class="mr-4">
                <v-btn color="primary"
                       v-for="invoice in patientInvoices"
                       :key="invoice.id"
                       outlined
                       class="mx-3"
                       small
                       @click="viewInvoice(invoice.id)"
                >
                    <span v-if="invoice.for_cash" class="purple--text">To patient </span>
                    <span v-else class="purple--text">
                        <span v-if="invoice.company">{{ invoice.company.name}}</span>
                    </span>
                    #{{ invoice.invoice_no }}
                </v-btn>
            </v-card-text>


            <collabmed-loading v-if="!bills.data"></collabmed-loading>
            <!-- {{  }} -->
            <v-row  v-else>

            <v-col cols="12" md="6">
                    <v-card flat v-if="uninvoicedItems" class="ml-4">
                      <v-toolbar flat>
                        <v-toolbar-title>Uninvoiced Items</v-toolbar-title>
                    </v-toolbar>
                    <v-data-table
                    v-model="splitBill.selected"
                    :items="filteredItems"
                    show-select
                    hide-default-footer
                    disable-pagination
                    :headers="headers"
                    :selectable="isItemSelectable"
                    height="600"
                    item-key="item_id"
                    class="elevation-1"
                  >
                  </v-data-table>
                    </v-card>

                    <v-alert type="info" :value="true" outline v-else class="ml-4">
                        There are no pending bills
                    </v-alert>

                </v-col>
                <v-col cols="12" md="6">
                  <v-card flat v-if="invoicedItems" class="ml-4">
                    <!-- {{  invoicedItems }} -->
                    <v-toolbar flat>
                      <v-toolbar-title> Invoiced Items</v-toolbar-title>
                  </v-toolbar>

                      <v-data-table
                              v-model="splitBill.selected"
                              :items="invoicedItems"
                              hide-default-footer
                              disable-pagination
                              :headers="invoice_headers"
                              height="600"
                              item-key="item_id"
                              class="elevation-1"

                      >
                      </v-data-table>
                  </v-card>

                  <v-alert type="info" :value="true" outline v-else class="ml-4">
                      There are no items paid for
                  </v-alert>

              </v-col>
                <v-col class="px-2">

                    <v-card-title class="pb-3">
                        <span style="font-weight: bold; font-size: 15px">
                                Total: {{ parseFloat(splitBill.total_amount) }}
                        </span>

                        <v-spacer></v-spacer>

                        <span style="font-weight: bold; font-size: 15px">
                                Balance: {{ parseFloat(this.splitBill.total_amount) -  parseFloat(this.splitBill.invoices_amount) }}
                        </span>
                    </v-card-title>

                    <v-card flat class="mr-2">

                        <!-- payment options -->
                        <v-expansion-panels>
                            <v-expansion-panel>

                                <v-expansion-panel-header>
                                    <h5 class="text-capitalize"> INVOICE PATIENT </h5>
                                </v-expansion-panel-header>

                                <v-expansion-panel-content>
                                    <v-card flat>

                                        <!-- cash payment -->
                                        <div class="mx-2">
                                          <v-row>
                                            <v-autocomplete
                                              v-model="splitBill.selectedPatient"
                                              :items="all_patients"
                                              item-text="name"
                                              item-value="id"
                                              label="Select Patient(Defaults To Current Patient)"
                                              outlined
                                              clearable
                                          ></v-autocomplete>
                                          </v-row>
                                            <v-row >
                                                <v-col md="6" offset-md="1" class="mx-4">
                                                    <v-text-field label="Amount" outline type="number"
                                                                  @input="handleInput"
                                                                  v-model="splitBill.payment_options.invoice_patient">
                                                    </v-text-field>
                                                </v-col>
                                            </v-row>
                                        </div>
                                    </v-card>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>

                        <v-expansion-panels v-if="bills.patient.schemes.length > 0">
                            <v-expansion-panel
                                    v-for="scheme in bills.patient.schemes"
                                    :key="scheme.id"
                            >
                                <v-expansion-panel-header>
                                    <h5 class="text-capitalize" v-if="scheme"> {{ scheme.scheme_name }} </h5>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                    <div class="mx-2" v-if="scheme">
                                        <v-row >
                                            <v-col md="6" offset-md="1" class="mx-4">
                                                <v-text-field label="Amount"
                                                              v-model="splitBill.payment_options.schemes[scheme.scheme_id]"
                                                              @input="handleInput"
                                                              outline type="number" >
                                                </v-text-field>
                                            </v-col>
                                        </v-row>
                                    </div>
                                </v-expansion-panel-content>
                            </v-expansion-panel>
                        </v-expansion-panels>

                        <v-row>
                            <v-col cols="6" class="py-3">
                                <collabmed-date-time-picker outlined
                                                            @input="selectInvoiceDate"
                                                            hide-details
                                                            dateOnly
                                                            :datetime="splitBill.invoice_date" label="Invoice date">
                                </collabmed-date-time-picker>
                            </v-col>
                        </v-row>

                        <!--
                        :disabled="splitBill.total_amount < 1 ||
                                    parseFloat(splitBill.invoices_amount) != parseFloat(splitBill.total_amount) || splitBill.loading"
                        -->
                        <v-btn
                        color="primary"
                        small
                        class="my-6"
                        :disabled="loading || checkAbilityToSave(splitBill.total_amount)"
                        @click="processInvoices(1)"
                    >
                        Bill items
                    </v-btn>

                    </v-card>
                </v-col>
            </v-row>
        </v-card>
    </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import SplitBill from '@finance/libs/SplitBill';

export default {
    props: [
        'visit_id', 'invoices', 'patient_id',
    ],

    data: () => ({
        panel: 0,
        splitBill: new SplitBill(),
        headers: [
            { text: 'Name', value: 'name', sortable: false },
            { text: 'Type', value: 'type', sortable: false },
            { text: 'Qty', value: 'quantity', sortable: false },
            { text: 'Price', value: 'amount', sortable: false },
        ],
        invoice_headers: [
            { text: 'Name', value: 'name', sortable: false },
            { text: 'Type', value: 'type', sortable: false },
            { text: 'Qty', value: 'quantity', sortable: false },
            { text: 'Price', value: 'amount', sortable: false },
            { text: 'Invoice No.', value: 'invoice_no', sortable: false },
        ],
        items: [], // All items
        all_patients:[],
      uninvoicedItems: [], // Items to display in the data table
      invoicedItems: [], // Items to display in the data table
      // balance : parseFloat(this.splitBill.total_amount) -  parseFloat(this.splitBill.invoices_amount),
      loading:false,

        // balance : parseFloat(this.splitBill.total_amount) -  parseFloat(this.splitBill.invoices_amount)
    }),

    computed: {
        ...mapGetters({
            bills: 'getPatientVisitBills',
        }),

        filteredItems() {
          if (!this.bills || !Array.isArray(this.bills.data)) {
            return [];
          }
          return this.bills.data.filter(
            (billItem) =>
              !this.invoicedItems.some(
                (invoicedItem) => invoicedItem.item_id === billItem.item_id
              )
          );
        },



        selectedData() {

            return this.splitBill.selected;
        },


        patientInvoices() {
            return JSON.parse(this.invoices);
        },
    },

    watch: {
        selectedData() {

            this.splitBill.totalCostOfSelectedItems(this.splitBill.selected);
        },

        bills(val) {
            const self = this;

            _.each(val.patient.schemes, (scheme) => {
                self.splitBill.payment_options.schemes[scheme.scheme_id] = 0;
            });

               // Ensure bills is defined and has a patient object before proceeding
            if (val && val.patient && Array.isArray(val.patient.schemes)) {
                _.each(val.patient.schemes, (scheme) => {
                self.splitBill.payment_options.schemes[scheme.scheme_id] = 0;
                });
            }

            // Safeguard: Check if bills.data exists and is an array before filtering
            if (val && Array.isArray(val.data)) {
                self.uninvoicedItems = self.computeUninvoicedItems(val.data);
            } else {
                console.error("bills.data is not an array:", val.data);
            }
                },
    },

    methods: {
        ...mapActions({
            fetchBills: 'setPatientVisitBills',
        }),

        handleInput() {
      this.splitBill.calculateInvoicesTotal();
      this.checkAbilityToSave(this.payment); // Check if the save button should be enabled

    },
     // Disable selection for items with quantity of 0
     isItemSelectable(item) {
      return  item.amount > 0;
    },

        checkAbilityToSave(payment) {

              // const total =   this.payment.calculateTotal();
              const balance = parseFloat(this.splitBill.total_amount) -  parseFloat(this.splitBill.invoices_amount)

              //  + this.splitBill.payment_options.schemes[this.scheme.scheme_id];

              if(parseFloat(this.splitBill.total_amount) == 0) {
              return true;
              }
              else if (balance > 0 || balance < 0){
              return true;

              }
              else
              {
              if(balance == 0) {
              return false;
              }
              }

    },


        computeUninvoicedItems(billsData) {
          return billsData;
            // if (!Array.isArray(billsData)) {
            //     console.error("billsData is not an array:", billsData);
            //     return [];
            // }

            // return billsData.filter(
            //     (billItem) =>
            //     !this.invoicedItems.some(
            //         (invoicedItem) => invoicedItem.item_id === billItem.item_id
            //     )
            // );
        },





        processInvoices(is_interim) {
    const data = this.splitBill.getFields();

    // Set loading to true to disable the button
    this.loading = true;

    this.splitBill.form.submit('post', route('api.finance.split-bill', this.splitBill.visit_id) + '?is_interim=' + is_interim, data)
        .then((response) => {
            flash(response);

            this.filteredItems = this.filteredItems.filter(item => !this.filteredItems.includes(item));

            this.invoicedItems = [
                ...this.invoicedItems,
                ...this.splitBill.selected.filter(item => !this.invoicedItems.includes(item)),
            ];

            const balance = parseFloat(this.splitBill.total_amount) - parseFloat(this.splitBill.invoices_amount);

            this.splitBill.invoices_amount = 0;
            this.splitBill.total_amount = 0;

            // Disable selection after successful response
            this.splitBill.selected = [];

            // Reset loading to false to re-enable the button
            this.loading = false;

            // Optional: reload the page
            window.location.reload();
        })
        .catch(() => {
            // Ensure loading is set to false if there is an error
            this.loading = false;
        });
},


        selectInvoiceDate (date) {
            this.splitBill.invoice_date = date;
        },

        viewInvoice(invoice_id) {
            window.open(`/finance/invoice/view/${invoice_id}/show`, '_blank');
        },
    },

    mounted() {
        this.fetchBills({
            params: {
                visit_id: this.visit_id,
                split_bill: true
            },
        });

        this.checkAbilityToSave()


        const bills_new = this.fetchBills({
            params: {
                visit_id: this.visit_id,
                split_bill: true
            },
        });





        // Ensure bills.data is defined and an array before processing it in mounted
    if (this.bills && Array.isArray(this.bills.data)) {
      this.uninvoicedItems = this.computeUninvoicedItems(this.bills.data);
      console.log('uninvoicedItems')
      console.log(this.uninvoicedItems)
    }

        // if (this.bills && this.bills.data) {
      // If `bills.data` is available at the time of mounting, compute uninvoiced items
      // this.uninvoicedItems = this.computeUninvoicedItems(this.bills.data);

    // }


        // computeUninvoicedItems
        // this.uninvoicedItems = this.bills.data.filter(
        //                                       (billItem) =>
        //                                         !this.invoicedItems.some(
        //                                           (invoicedItem) => invoicedItem.item_id === billItem.item_id
        //                                         )
        //                                     );

                  fetch('/api/reception/all/patients', {
                            method: 'GET',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                          })
                                            .then(response => {
                    if (!response.ok) {
                      throw new Error('Network response was not ok');
                    }
                    return response.json(); // Parse the JSON response
                  })

                          .then(data => {
                            // Handle the response data
                            this.all_patients = data;

                          })
                          .catch(error => {
                            // Handle errors
                            console.error('There was a problem with the fetch operation:', error);
                          });




        // fetch('/api/finance/split-bill/uninvoiced/items', {
        //             method: 'POST',
        //             headers: {
        //               'Content-Type': 'application/json',
        //               // You can add additional headers if needed
        //             },
        //             body: JSON.stringify({
        //               visit_id: this.visit_id
        //               // Add any data you want to send in the body of the request
        //             }),
        //           })
        //           .then(response => {
        //             if (!response.ok) {
        //               throw new Error('Network response was not ok');
        //             }
        //             return response.json(); // Parse the JSON response
        //           })
        //           .then(data => {
        //             // Handle the response data

        //             this.uninvoicedItems = data[0];

        //           })
        //           .catch(error => {
        //             // Handle errors
        //             console.error('There was a problem with the fetch operation:', error);
        //           });

             fetch('/api/finance/split-bill/invoiced/items', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      // You can add additional headers if needed
                    },
                    body: JSON.stringify({
                      visit_id: this.visit_id
                      // Add any data you want to send in the body of the request
                    }),
                  })
                  .then(response => {
                    if (!response.ok) {
                      throw new Error('Network response was not ok');
                    }
                    return response.json(); // Parse the JSON response
                  })
                  .then(data => {
                    // Handle the response data

                    this.invoicedItems = data[0];

                  })
                  .catch(error => {
                    // Handle errors
                    console.error('There was a problem with the fetch operation:', error);
                  });

        this.splitBill.visit_id = this.visit_id;
        this.items = [...this.invoicedItems];
        this.invoicedItems = [this.invoicedItems];


    },
};
</script>
