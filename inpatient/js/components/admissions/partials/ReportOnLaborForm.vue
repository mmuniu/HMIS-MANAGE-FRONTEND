<template>
    <form
      @submit.prevent="submitForm"
      :data-url="formUrl"
      id="reportOnLabourForm"
      class="form"
      role="form"
    >
      <input type="hidden" v-model="form.patient_id" />
      <input type="hidden" v-model="form.admission_id" />
  
      <div class="row">
        <div class="col-md-12">
          <div class="form-group">
            <textarea
              v-model="form.summary_report"
              class="form-control"
              placeholder=""
              required
              id="summary_report"
            ></textarea>
          </div>
        </div>
      </div>
  
      <div class="row">
        <div class="col-md-4">
          <label class="form-label">Date of Labour</label>
          <div class="form-group">
            <input
              type="datetime-local"
              v-model="form.labour_date_began"
              class="form-control"
            />
          </div>
        </div>
  
        <div class="col-md-4">
          <h5><b>Membranes raptured</b></h5>
          <input
            type="datetime-local"
            v-model="form.labour_date_membranes_raptured"
            class="form-control"
          />
        </div>
  
        <div class="col-md-4">
          <h5><b>Full Dilated</b></h5>
          <input
            type="datetime-local"
            v-model="form.labour_date_full_dilated"
            class="form-control"
          />
        </div>
      </div>
  
      <div class="row">
        <div class="col-md-4">
          <h5><b>Baby Born Date</b></h5>
          <input
            type="datetime-local"
            v-model="form.labour_date_baby_born"
            class="form-control"
          />
        </div>
  
        <div class="col-md-4">
          <h5><b>Placenta Expelled Date</b></h5>
          <input
            type="datetime-local"
            v-model="form.labour_date_placenta_expelled"
            class="form-control"
          />
        </div>
  
        <div class="col-md-4">
          <h5><b>Amount of Loss</b></h5>
          <input
            type="text"
            v-model="form.amount_of_loss"
            class="form-control"
            placeholder="Amount of Loss"
            id="amount_of_loss"
          />
        </div>
      </div>
  
      <div class="row">
        <div class="col-md-4">
          <h5><b>Drugs Ordered Date</b></h5>
          <input
            type="datetime-local"
            v-model="form.drugs_ordered_date"
            class="form-control"
          />
        </div>
  
        <div class="col-md-4">
          <h5><b>Drugs Ordered</b></h5>
          <input
            type="text"
            v-model="form.drugs_ordered"
            class="form-control"
            placeholder="Drugs Ordered"
          />
        </div>
  
        <div class="col-md-4">
          <h5><b>Drugs Ordered Dose</b></h5>
          <input
            type="text"
            v-model="form.drugs_ordered_dose"
            class="form-control"
            placeholder="Drugs Ordered Dose"
          />
        </div>
      </div>
  
      <div class="row">
        <div class="col-md-4">
          <h5><b>Drugs Ordered Given</b></h5>
          <input
            type="text"
            v-model="form.drugs_ordered_given"
            class="form-control"
            placeholder="Drugs Ordered Given"
          />
        </div>
  
        <div class="col-md-4">
          <h5><b>Drugs Ordered Remarks</b></h5>
          <input
            type="text"
            v-model="form.drugs_ordered_remarks"
            class="form-control"
            placeholder="Drugs Ordered Remarks"
          />
        </div>
      </div>
  
      <div class="row">
        <div class="col-md-4">
          <h5><b>Perineum</b></h5>
          <input
            type="text"
            v-model="form.perineum"
            class="form-control"
            placeholder="Perineum"
          />
        </div>
  
        <div class="col-md-4">
          <h5><b>Sutures</b></h5>
          <input
            type="text"
            v-model="form.sutures"
            class="form-control"
            placeholder="Sutures"
          />
        </div>
  
        <div class="col-md-4">
          <h5><b>By Whom</b></h5>



         <input
            type="text"
            v-model="form.by_whom"
            class="form-control"
            placeholder="By Whom"
            
          />
        </div>
      </div>
  
      <h5><b>(Duration of labour)</b></h5>
      <div class="row">
        <div class="col-md-3">
          <h5><b>Labour Duration - 1st Stage</b></h5>
          <input
            type="datetime-local"
            v-model="form.labour_duration_time_1_stage"
            class="form-control"
          />
        </div>
  
        <div class="col-md-3">
          <h5><b>Labour Duration - 2nd Stage</b></h5>
          <input
            type="datetime-local"
            v-model="form.labour_duration_time_2_stage"
            class="form-control"
          />
        </div>
  
        <div class="col-md-3">
          <h5><b>Labour Duration - 3rd Stage</b></h5>
          <input
            type="datetime-local"
            v-model="form.labour_duration_time_3_stage"
            class="form-control"
          />
        </div>
      </div>
      <h5><b>(Type of delivery)</b></h5>

<div class="row">
  <div class="col-md-4">
    <h5><b>Type of Delivery</b></h5>
    <div class="form-group">
      <select v-model="form.delivery_type" id="delivery_type" class="form-control" >
        <option value="">Select Type</option>
        <option value="normal">Normal</option>
        <option value="caesarean">Caesarean</option>
      </select>
    </div>
  </div>

  <div class="col-md-4" v-if="form.delivery_type === 'caesarean'">
    <h5><b>Caesarean Type</b></h5>
    <div class="form-check">
      <input type="radio" id="elective" value="elective" v-model="form.caesarean_type" class="form-check-input" />
      <label class="form-check-label" for="elective">Elective</label>
    </div>
    <div class="form-check">
      <input type="radio" id="emergency" value="emergency" v-model="form.caesarean_type" class="form-check-input" />
      <label class="form-check-label" for="emergency">Emergency</label>
    </div>
  </div>
</div>

<div class="row">
  <div class="col-md-4">
    <h5><b>Delivered By</b></h5>
    <div class="form-group">
      <select v-model="form.delivered_by" id="delivered_by" class="form-control" >
        <option value="">Select Person</option>
        <option value="doctor">Doctor</option>
        <option value="midwife">Midwife</option>
        <option value="pupil">Pupil</option>
      </select>
    </div>
  </div>

  <div class="col-md-8">
    <h5><b>Delivered By (Notes / Name)</b></h5>
    <div class="form-group">
      <input
        type="text"
        v-model="form.delivered_by_notes"
        id="delivered_by_notes"
        class="form-control"
        placeholder="Enter name, remarks, or additional notes"
      />
    </div>
  </div>
</div>

<div class="row">
  <div class="col-md-8">
    <h5><b>Delivery Details (Check all that apply)</b></h5>

      <div class="form-check form-check-inline" v-for="(label, key) in deliveryOptions" :key="key">
        <input
          type="checkbox"
          :id="key"
          :value="key"
          v-model="form.delivery_details"
          class="form-check-input"
        />
        <label class="form-check-label" :for="key">
          {{ label }}
        </label>
      </div>

  </div>
</div>

<h5><b>(After delivery)</b></h5>

<div class="mt-4">
  <h5><b>After Delivery - Condition of Mother</b></h5>
  <div class="row">
    <div class="col-md-6">
      <div class="form-group">
        <label for="condition_of_mother">Condition of Mother</label>
        <input
          type="textarea"
          id="condition_of_mother"
          v-model="form.condition_of_mother"
          class="form-control"
          placeholder="e.g. Stable, Weak"
        />
      </div>
    </div>

    <div class="col-md-4">
      <div class="form-group">
        <label for="temperature">Temperature (°C)</label>
        <input
          type="number"
          step="0.1"
          id="temperature"
          v-model.number="form.temperature"
          class="form-control"
        />
      </div>
    </div>

    <div class="col-md-4">
      <div class="form-group">
        <label for="fundus">Fundus</label>
        <input
          type="text"
          id="fundus"
          v-model="form.fundus"
          class="form-control"
        />
      </div>
    </div>

    <div class="col-md-4">
      <div class="form-group">
        <label for="pulse">Pulse (bpm)</label>
        <input
          type="number"
          id="pulse"
          v-model.number="form.pulse"
          class="form-control"
        />
      </div>
    </div>

    <div class="col-md-4">
      <div class="form-group">
        <label for="loss_pv">Loss PV (ml)</label>
        <input
          type="number"
          id="loss_pv"
          v-model.number="form.loss_pv"
          class="form-control"
        />
      </div>
    </div>

    <div class="col-md-4">
      <div class="form-group">
        <label for="pph">PPH (ml)</label>
        <input
          type="number"
          id="pph"
          v-model.number="form.pph"
          class="form-control"
        />
      </div>
    </div>

    <div class="col-md-4">
      <div class="form-group">
        <label for="respiration">Respiration (breaths/min)</label>
        <input
          type="number"
          id="respiration"
          v-model.number="form.respiration"
          class="form-control"
        />
      </div>
    </div>

    <div class="col-md-4">
      <div class="form-group">
        <label for="placenta_weight_loss">Placenta Weight Loss (g)</label>
        <input
          type="number"
          id="placenta_weight_loss"
          v-model.number="form.placenta_weight_loss"
          class="form-control"
        />
      </div>
    </div>

    <div class="col-md-4">
      <div class="form-group">
        <label for="bp_systolic">BP Systolic (mmHg)</label>
        <input
          type="number"
          id="bp_systolic"
          v-model.number="form.bp_systolic"
          class="form-control"
        />
      </div>
    </div>

    <div class="col-md-4">
      <div class="form-group">
        <label for="bp_diastolic">BP Diastolic (mmHg)</label>
        <input
          type="number"
          id="bp_diastolic"
          v-model.number="form.bp_diastolic"
          class="form-control"
        />
      </div>
    </div>
  </div>
</div>

<div class="mt-4">
  <h5><b>Condition of Baby(ies)</b></h5>

  <div v-for="(baby, index) in form.babies" :key="index" class="border rounded p-3 mb-3">
    <h6><b>Baby {{ index + 1 }}</b></h6>

    <div class="row">
      <!-- Sex -->
      <div class="col-md-3">
        <div class="form-group">
          <label>Sex</label>
          <select v-model="baby.sex" class="form-control">
            <option disabled value="">Select</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
      </div>

      <!-- Status -->
      <div class="col-md-3">
        <div class="form-group">
          <label>Status</label>
          <select v-model="baby.status" class="form-control">
            <option disabled value="">Select</option>
            <option>Alive</option>
            <option>Still birth</option>
          </select>
        </div>
      </div>

      <!-- Preterm -->
      <div class="col-md-3">
        <div class="form-group">
          <label>Preterm</label>
          <select v-model="baby.preterm" class="form-control">
            <option disabled value="">Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
      </div>

      <!-- Neonatal Jaundice -->
      <div class="col-md-3">
        <div class="form-group">
          <label>Neo-natal jaundice</label>
          <select v-model="baby.jaundice" class="form-control">
            <option disabled value="">Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
      </div>

      <!-- HIE -->
      <div class="col-md-3">
        <div class="form-group">
          <label>HIE</label>
          <input v-model="baby.hie" type="text" aria-label="baby-abnormalities" class="form-control" placeholder="Details if any" />
        </div>
      </div>

      <!-- Weight -->
      <div class="col-md-3">
        <div class="form-group">
          <label>Weight (kg)</label>
          <input v-model.number="baby.weight" aria-label="baby-abnormalities" type="number" class="form-control" step="0.01" />
        </div>
      </div>

      <!-- Sick -->
      <div class="col-md-3">
        <div class="form-group">
          <label>Sick?</label>
          <select v-model="baby.sick" class="form-control">
            <option disabled value="">Select</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>
      </div>

      <!-- Cot / Incubator -->
      <div class="col-md-3">
        <div class="form-group">
          <label>Care</label>
          <select v-model="baby.care" class="form-control">
            <option disabled value="">Select</option>
            <option>Cot</option>
            <option>Incubator</option>
          </select>
        </div>
      </div>

      <!-- Abnormalities -->
      <div class="col-md-12">
        <div class="form-group">
          <label>Abnormalities</label>
          <input v-model="baby.abnormalities" aria-label="baby-abnormalities" type="text" class="form-control" placeholder="Details if any" />
        </div>
      </div>
    </div>
      <!-- Remove Button -->
  <div class="text-right">
    <button type="button" class="btn btn-danger" @click="removeBaby(index)">
      Remove Baby
    </button>
  </div>
  </div>

  <!-- Add Baby Button -->
  <div class="text-right">
    <button type="button" class="btn btn-primary" @click="addBaby">
      Add Baby
    </button>
  </div>
</div>


  
      <button type="submit" class="btn btn-primary mt-3">Submit</button>
    </form>
  </template>
  
  <script>
  import { mapActions, mapGetters } from "vuex";

  export default {
    props: {
      patientId: Number,
      admissionId: Number,
      visitId: Number,
    },
    data() {
      const now = new Date().toISOString().slice(0, 16);
      return {
        formUrl: `/inpatient/evaluations/${this.visitId}/report-on-labour`,
        form: {
          patient_id: this.patientId,
          admission_id: this.admissionId,
          summary_report: '',
          labour_date_began: now,
          labour_date_membranes_raptured: now,
            delivery_details: [],
          labour_date_full_dilated: now,
          labour_date_baby_born: now,
          labour_date_placenta_expelled: now,
          amount_of_loss: '',
          drugs_ordered_date: now,
          drugs_ordered: '',
          drugs_ordered_dose: '',
          drugs_ordered_given: '',
          drugs_ordered_remarks: '',
          perineum: '',
          sutures: '',
          by_whom: '',
          labour_duration_time_1_stage: now,
          labour_duration_time_2_stage: now,
          labour_duration_time_3_stage: now,
          condition_of_mother: '',
          temperature: null,
          fundus: '',
          pulse: null,
          loss_pv: null,
          pph: null,
          respiration: null,
          placenta_weight_loss: null,
          bp_systolic: null,
          bp_diastolic: null,
          babies: [
            {
              sex: '',
              status: '',
              preterm: '',
              jaundice: '',
              hie: '',
              weight: null,
              sick: '',
              care: '',
              abnormalities: '',
            },
         ],
        },
        deliveryOptions: {
        vacuum_delivery: 'Vacuum delivery',
        breech_delivery: 'Breech delivery',
        epidural: 'Epidural',
        pre_eclampsia: 'Pre-eclampsia',
        aph: 'APH',
        vbac: 'VBAC',
        lamaz_classes: 'Attended Lamaz classes',
        }
      };
    },
    computed: {
        ...mapGetters({
            all_doctors: "getUsers",
        }),

    },
    methods: {
      submitForm() {
        axios
          .post(this.formUrl, this.form)
          .then((response) => {
            alert('Form submitted successfully!');
          })
          .catch((error) => {
            console.error(error);
            alert('An error occurred while submitting the form.');
          });
      },
     
      removeBaby(index) {
  this.form.babies.splice(index, 1);
},


      async fetchReportOnLabour(){
        axios.get(`/inpatient/evaluations/${this.visitId}/report-on-labour/${this.admissionId}`)
        .then(response => {
          const data = response.data.report;
          Object.assign(this.form, data);
  
          if (Array.isArray(data.babies)) {
              this.form.babies = [...data.babies];
            } else {
              this.form.babies = [];
            }

            if (Array.isArray(data.delivery_details)) {
              this.form.delivery_details = [...data.delivery_details];
            } else {
              this.form.delivery_details = [];
            }

        })
        .catch(error => {
          console.error('Failed to fetch labour report:', error);
          alert('Unable to load labour report.');
        });
       
      },
      
      addBaby() {
        this.form.babies.push({
          sex: '',
          status: '',
          preterm: '',
          jaundice: '',
          hie: '',
          weight: null,
          sick: '',
          care: '',
          abnormalities: '',
        });
      }
    },

    mounted(){
      this.fetchReportOnLabour();
    }
  };
  </script>
  