<template>
  <div>
    <form @submit.prevent="submitInvoice">
      <input type="hidden" v-model="form.source" />

      <div class="box box-info">
        <div class="box-body">
          <div class="row">
            <div class="col-md-6" id="bloodyMoves">
              <div>
                Patient Name: <strong>{{ patient.full_name }}</strong>
              </div>
              <hr />
              <h4>
                Select items for payment
                <span class="pull-right" id="total">Total: Ksh {{ totalAmount }}</span>
              </h4>
              <input type="hidden" name="invoice_total" :value="totalAmount" />
              <input type="hidden" name="visit_id" :value="lastUnpaidVisitId" />
              <InvestigationMode :investigations="investigations" :visits="visits" @change="calculateTotals" />
            </div>

            <div class="col-md-6" id="invoice-submit-btn">
              <div style="margin-top: 5em;"></div>
              <select v-model="form.patient_id">
                <option v-for="p in patients" :key="p.id" :value="p.id">
                  {{ p.full_name }}
                </option>
              </select>
              <button type="submit" class="btn btn-info btn-lg" style="width: 90%; padding: 15px 10px">
                <i class="fa fa-save"></i> Proceed Creating an Invoice for the selected items
                <i class="fa fa-chevron-right pull-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import InvestigationMode from './InvestigationMode.vue';

export default {
  components: { InvestigationMode },
  props: ['patient', 'investigations','visits'],
  data() {
    return {
      patients: [],
      form: {
        patient_id: null,
        source: this.$route.query.source || '',
      },
      totalAmount: 0,
      unpaidVisits: [],
    };
  },
  computed: {
    lastUnpaidVisitId() {
      return this.unpaidVisits.length ? this.unpaidVisits[this.unpaidVisits.length - 1].id : null;
    },
    totalAmount() {
      return this.selectedItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    },
    discountedAmount() {
      return this.totalAmount * (this.discountPercentage / 100);
    },
    totalToPay() {
      return this.totalAmount - this.discountedAmount;
    },
    totalPaid() {
      return (
          parseInt(this.payment.cash) +
          parseInt(this.payment.mpesa) +
          parseInt(this.payment.cheque) +
          parseInt(this.payment.card) +
          parseInt(this.payment.account)
      );
    },
    balanceOrChange() {
      return this.totalToPay - this.totalPaid;
    }
  },
  mounted() {
    // this.fetchPatients();
    // this.filterUnpaidVisits();
    this.calculateTotals();
  },
  methods: {
    fetchPatients() {
      fetch('/api/reception/all/patients')
          .then(res => res.json())
          .then(data => {
            this.patients = data.data;
          });
    },
    async removeBill(type, id, visitId) {
      try {
        const response = await axios.get('/api/finance/evaluation/bill/remove', {
          params: {
            type: type,
            id: id,
            visit: visitId
          }
        });

      } catch (error) {
        console.error('Error removing bill:', error);
        alert('Failed to remove item. Please try again.');
      }
    },

    calculateTotals() {
      let total = 0;
      this.$refs.investigationTable?.forEach(row => {
        if (row.checked) {
          total += parseInt(row.toPay || 0);
        }
      });
      this.totalAmount = total;
    },
    submitInvoice() {
      const formData = new FormData();
      formData.append('source', this.form.source);
      formData.append('patient_id', this.form.patient_id);
      formData.append('visit_id', this.lastUnpaidVisitId);
      formData.append('invoice_total', this.totalAmount);

      fetch(`/finance/cash/action/store/invoiced/store-invoice?patient_id=${this.patient.id}`, {
        method: 'POST',
        body: formData
      }).then(res => res.json()).then(response => {
        console.log(response);
      });
    },
  },
};
</script>

<style scoped>
#visits tbody tr.highlight {
  background-color: #B0BED9;
}
</style>
