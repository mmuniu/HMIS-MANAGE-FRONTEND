<template>
  <v-dialog v-model="creditDialog" width="800" persistent>

    <template v-slot:activator="{ on }">
              <v-btn color="orange" small dark v-on="on" @click="openCreditModal()">
        <v-icon>add</v-icon> {{ label }}
      </v-btn>
    </template>

    <v-card >

      <v-card-title class="text-h5 purple white--text" primary-title>

        {{ invoice ? 'Credit note' : 'Credit note' }}

        <v-spacer></v-spacer>

        <v-btn icon dark @click.native="close" absolute right>
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-container >

          <div >
            <v-row>
              <v-col class="px-2" cols="12" sm="4">
                <label>Invoice Amount:</label>
                <span>{{ invoiceAmount }}</span>
              </v-col>
            </v-row>
            <v-row>
              <v-card-text>
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th></th> <!-- Checkbox column -->
                      <th>Item Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in parsedInvoiceItems" :key="index">
                      <td>
                        <v-checkbox v-model="selectedItems" :value="item"  @change="updateCreditAmount"/>
                      </td>
                      <td>{{ item.item_name }}</td>
                      <td>
                        <input type="number" v-model="item.inputQuantity" aria-label="quantity" :max="item.quantity" :min="1" style="background-color: whitesmoke;border-style: double;" @blur="validateQuantity(item)">
                        <br><!-- Error message if quantity exceeds the available units -->
                        <span v-if="item.exceedsMaxQuantity" style="color: red; font-size: 12px;">
                          Maximum quantity allowed is {{ item.units }} total from invoice.
                        </span>
                    </td>
                        
                      <td>{{ formatCurrency(item.price) }}</td>
                      <td>
                        <span v-if="item.item_type === 'rebate'">-{{ formatCurrency(item.amount) }}</span>
                        <span v-else>{{ formatCurrency(item.amount) }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </v-card-text>
            </v-row>
            <v-row>
              <v-col class="px-2" cols="12" sm="4">
                <v-text-field
                    v-model="exempt.credit_amount"
                    outline
                    label="Amount to credit"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row >
              <v-col class="px2" cols="12" style="display: flex;
                    justify-content: center;">
                <v-btn small color="primary" @click="addCreditNote()" :disabled="loading">
                  <v-icon>add</v-icon>
                  Issue credit note
                </v-btn>
              </v-col>
            </v-row>
        
            <v-row v-if="existingCreditNotes.length > 0">
              <v-card-text>
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Credit Note Number</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in existingCreditNotes" :key="index">
                      <td>{{ item.credit_note_number ? item.credit_note_number : "N/A" }}</td>
                      <td>{{ formatCurrency(item.amount) }}</td>
                      <td>{{ item.credit_note_status ?item.credit_note_status :"Not set"}}</td>
                      <td>
                      <v-text-field
                      v-model="item.credit_note_reason"
                      outline
                      label="Reason"
                     ></v-text-field>
                      </td>
                      <td>
                        <v-btn  small color="green" @click.prevent="approveNote(item)" :disabled="approve_loading || item.credit_note_status == 'approve'">
                          Approve
                        </v-btn>    
                        <v-btn  small color="red" @click.prevent="rejectCreditNote(item)"  :disabled="reject_loading">
                          <v-icon>close</v-icon>
                          Reject
                        </v-btn>                      
                      </td>
                    </tr>
                  </tbody>
                </table>
              </v-card-text>
            </v-row>
           
          </div>


          <!-- <v-row  style="display: flex;
              justify-content: center;">
            <v-col class="px2" cols="6" style="display: flex;
            justify-content: center;">
              <v-btn  small color="orange" @click.prevent="approveNote()">
                Approve
              </v-btn>
            </v-col>
              <v-col class="px2" cols="6"  style="display: flex;
                  justify-content: center;">
                <v-btn  small color="red" @click.prevent="rejectCreditNote()">
                  <v-icon>close</v-icon>
                  Reject
                </v-btn>
              </v-col>
          </v-row> -->
        </v-container>

        <br/>

      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { _ } from 'vue-underscore';
import { mapActions, mapGetters } from 'vuex';
import Exempt from '@inpatient/libs/chargesheet/Exempt';

export default {
  name: 'ExemptInvoice',

  props: {
    visitId: {
      required: true,
    },
    invoice: {
      type: String,
      default: null,
    },
    invoiceObject:{
      type:String
    },
    invoiceItem: {
      type: String,
    },
    invoiceAmount: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: 'Credit note',
    },
  },
  data: () => ({
    creditDialog: false,
    exempt: new Exempt,
    loading: false,
    approve_loading:false,
    reject_loading:false,
    selectedItems: [],
    existingCreditNotes:[],
    headers: [
      { text: '', value: 'checkbox', sortable: false },
      { text: 'Item Name', value: 'item_name' },
      { text: 'Item Type', value: 'item_type' },
      { text: 'Status', value: 'status' },
      { text: 'Price', value: 'price', align: 'end' },
      { text: 'Units', value: 'units', align: 'end' },
      { text: 'Amount', value: 'amount', align: 'end' },
    ],
  }),

  computed: {
    parsedInvoiceItems() {
      const items = JSON.parse(this.invoiceItem);
      items.forEach(item => {
        item.exceedsMaxQuantity = false; 
        item.inputQuantity = item.inputQuantity || 1; // Default inputQuantity to 1 if not set
        item.amount = item.inputQuantity * item.price; 
      });
      return items;    
    }
  },
  watch: {
  'item.inputQuantity'(newValue, oldValue) {
      if (newValue > item.quantity) {
          this.item.inputQuantity = item.quantity;
      } else if (newValue < 1) {
          this.item.inputQuantity = 1;
      }
      }
  },
  methods: {


    close() {
      this.creditDialog = false;
    },

    async addCreditNote() {
      this.loading = true;

      try {
      const response = await this.exempt.creditNote(this.invoice, this.visitId, this.exempt.credit_amount, this.selectedItems);

      if (response && response.alert === "success") {
            this.close();
            this.selectedItems = []; // Unselect the items
            this.exempt.credit_amount = '';
          }
    } catch (error) {
      console.error("An error occurred while issuing credit note:", error);
    } finally {
      // Set loading to false when the process is complete
      this.loading = false;
    }
     
   },
   async approveNote(item) {
    this.approve_loading = true;

      try {
        const response = await this.exempt.changeStatusCreditNote(this.invoice, this.visitId,item.credit_note_reason, 'approve');

        if (response && response.alert === "success") {
          this.close(); 
        
          this.selectedItems = []; 
          this.exempt.credit_amount = ''; 
          this.approve_loading = false;

        } else {
          console.error('Failed to approve note:', response);
          this.approve_loading = false;

        }
      } catch (error) {
        this.approve_loading = false;

        console.error('An error occurred while approving the note:', error);
      }
      this.approve_loading = false;

    },

     openCreditModal() {
      this.creditDialog = true;
      this.fetchExistingCreditNotes();
  
      },
   async rejectCreditNote(item) {
    this.reject_loading = true;
      const response = await this.exempt.changeStatusCreditNote(this.invoice, this.visitId,item.credit_note_reason,'reject');

      if (response && response.alert === "success") {
        this.close(); 
        this.reject_loading = false;

        this.selectedItems = [];
        this.exempt.credit_amount = ''; 

      }
   },

   updateCreditAmount() {
  let totalAmount = 0;

  // Iterate through selectedItems and calculate the total credit amount
  this.selectedItems.forEach(item => {
      // Use inputQuantity if it's valid, otherwise default to 1
      const quantity = (item.inputQuantity && item.inputQuantity > 0) ? item.inputQuantity : 1;

      // Update the item's amount based on the price and quantity
      item.amount = item.price * quantity;

      // Add to the total amount
      totalAmount += item.amount;
  });

  // Update the credit_amount field with the total amount
  this.exempt.credit_amount = totalAmount;
},
    
async fetchExistingCreditNotes() {
  try {

      // Fetch existing credit notes
      const response = await this.exempt.fetchExistingCreditNotes(this.invoice, this.visitId);
      this.existingCreditNotes = response.data; // Assign the fetched data to existingCreditNotes

    
      // Initialize a credited quantity object
      const creditedQuantities = {};

     
      // Iterate over existing credit notes
      this.existingCreditNotes.forEach(note => {
          // console.log('Processing credit note:', note);



          // Iterate over the credit note items
          note.credit_note_items.forEach(noteItem => {
              const itemId = noteItem.item_id; // Ensure this matches with your items
              const quantity = noteItem.quantity || 0; // Default to 0 if quantity is not found
              // Check if the item_id is already in the creditedQuantities object
              if (creditedQuantities[itemId]) {
                  // If it exists, increment the quantity
                  creditedQuantities[itemId] += quantity;
              } else {
                  // If it doesn't exist, set it to the current quantity
                  creditedQuantities[itemId] = quantity;
              }
          });
      });

      // Map the total credited quantities back to the parsedInvoiceItems
      this.parsedInvoiceItems.forEach(item => {
          // Make sure we're using the correct id for matching
          item.creditedQuantity = creditedQuantities[item.item_id] || 0; // Default to 0 if item_id not found in creditedQuantities
          
      });

  } catch (error) {
      console.error('Error fetching existing credit notes:', error);
  }
},


    formatCurrency(value) {
        if (!value) return '0.00';
        return parseFloat(value).toFixed(2);
     },
     validateQuantity(item) {
   
      const totalAvailableUnits = item.units; 
      const alreadyCreditedUnits = item.creditedQuantity || 0; 
      const maxQuantity = totalAvailableUnits - alreadyCreditedUnits; 

      if (item.inputQuantity > maxQuantity) {
          // Only adjust if inputQuantity exceeds maxQuantity
          item.inputQuantity = maxQuantity;
          item.exceedsMaxQuantity = true;

          if (item.errorTimeout) {
              clearTimeout(item.errorTimeout);
          }
          item.errorTimeout = setTimeout(() => {
              item.exceedsMaxQuantity = false;
          }, 3000);
      } else if (item.inputQuantity < 1) {
          item.inputQuantity = 1;
          item.exceedsMaxQuantity = false;
      } else {
          item.exceedsMaxQuantity = false;
      }

      item.amount = item.price * item.inputQuantity;
      this.updateCreditAmount();
  },


  updateCreditAmount() {
  let totalAmount = 0;

  this.selectedItems.forEach(item => {
      const quantity = item.inputQuantity ;
      const itemTotal = item.price * quantity; 

      totalAmount += itemTotal; 
  });

  // Set the total credit amount
  this.exempt.credit_amount = totalAmount.toFixed(2); 
},
    toggleItem(item) {
    const index = this.selectedItems.indexOf(item.id);
    if (index === -1) {
      this.selectedItems.push(item.id);
    } else {
      this.selectedItems.splice(index, 1);
    }
  },
  processSelectedItems() {  
    // Logic to handle the selected items
  },
  },

  mounted() {
    // console.log(this.invoiceObject)
    this.fetchExistingCreditNotes()
  },
};
</script>

<style scoped>
.table {
width: 100%;
border-collapse: collapse;
}

.table th,
.table td {
padding: 10px;
text-align: left;
}

.table-sm th,
.table-sm td {
padding: 5px;
}

.table th {
background-color: #f4f4f4;
}
</style>
