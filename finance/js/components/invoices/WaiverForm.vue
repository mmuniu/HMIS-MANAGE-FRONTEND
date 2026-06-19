<template>
    <div class="panel panel-info">
      <div class="panel-heading bg-info">
        <div class="panel-title">
          <h4>Add a waiver on the invoice</h4>
        </div>
      </div>
      <div class="panel-body">
        <form @submit.prevent="submitWaiver" class="form-horizontal">
  
          <!-- User Field -->
          <div class="form-group">
            <label for="user" class="form-label col-sm-4">User:</label>
            <div class="col-sm-8">
              <input 
                type="text" 
                id="user" 
                :value="username" 
                class="form-control" 
                readonly
              />
            </div>
          </div>
  
          <!-- Amount Field -->
          <div class="form-group">
            <label for="amount" class="form-label col-sm-4">Amount:</label>
            <div class="col-sm-8">
              <input 
                type="number" 
                id="amount" 
                v-model.number="amount" 
                class="form-control" 
                :placeholder="balance"
                step="0.01"
                required
                @input="validateAmount"
              />
            </div>
          </div>
  
          <!-- Remarks Field -->
          <div class="form-group">
            <label for="remarks" class="form-label col-sm-4">Remarks:</label>
            <div class="col-sm-8">
              <textarea 
                id="remarks" 
                v-model="remarks" 
                class="form-control" 
                placeholder="Remarks" 
                rows="2"
              ></textarea>
            </div>
          </div>
  
          <!-- Submit Button -->
          <div class="form-group">
            <div class="col-sm-8 col-sm-offset-4">
              <button 
                v-if="balance > 0" 
                type="submit" 
                class="btn btn-primary btn-flat"
              >
                <i class="fa fa-save"></i> Save
              </button>
              <button 
                v-else 
                type="button" 
                class="btn btn-success"
              >
                <i class="fa fa-check"></i> Invoice Payment Complete
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
      import { mapActions, mapGetters } from 'vuex';
      import Invoice from '@finance/libs/invoices/Invoice';

  export default {
    name: 'WaiverForm',

    props: {
      balance: {
        type: Number,
        default: 0
      },
      username: {
        type: String,
        default: ""
      },
      invoiceId:{
        default:null
      }
    },
    data: () => ({
        invObj: new Invoice(),
        amount: null, // Waiver amount entered by user
        remarks: "" // Remarks entered by user
        }),
    methods: {
      validateAmount() {
        if (this.amount > this.balance) {
          alert(`Waiver amount cannot be greater than ${this.balance} Kshs`);
          this.amount = "";
        }
      },
      async submitWaiver() {
        if (this.amount > this.balance) {
          alert(`Waiver amount cannot be greater than ${this.balance} Kshs`);
          return;
        }
  
        // Perform the actual submission (replace with your API call or form action)
        const formData = {
          user: this.username,
          amount: this.amount,
          remarks: this.remarks,
          invoice_id:this.invoiceId
        };
        const response = await this.invObj.saveWaiver(formData);
 
        if(response) {
        }
        
      }
    }
  };
  </script>

  