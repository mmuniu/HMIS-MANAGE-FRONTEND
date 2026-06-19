<template>
  <div>
    <h3><b>Summary of Labour</b></h3><br>
    <!-- 1st Stage -->
    <div class="row">
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">(1st Stage) Induction of Labor</label>
          <div class="d-flex">
            <div class="form-check mr-3"><input type="checkbox" class="form-check-input" id="induction_yes"
                                                v-model="summary.inductionOfLabor" true-value="1" false-value="0"
                                                @change="handleCheckboxChange(summary, 'inductionOfLabor')">
              <label class="form-check-label" for="induction_yes">Yes</label>
            </div>
            <div class="form-check"><input type="checkbox" class="form-check-input" id="induction_no"
                                           v-model="summary.inductionOfLabor" true-value="0" false-value="1"
                                           @change="handleCheckboxChange(summary, 'inductionOfLabor')">
              <label class="form-check-label" for="induction_no">No</label>
            </div>
          </div>
        </div>

        <label class="form-label">Duration</label>
        <div class="form-group">
          <input type="number" class="form-control" placeholder="Duration of Labour in hours"
                 v-model="summary.labourDuration"
                 id="labour_duration" @change="summary.save()">
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">No. of VEs</label>
          <input type="number" class="form-control" placeholder="Number of VEs" v-model="summary.vesNumber" id="ves_number" @change="summary.save()">
        </div>
      </div>
    </div>

    <!-- 2nd Stage -->
    <div class="row">
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">(2nd Stage) Mode of Delivery</label>
          <div class="d-flex">
            <input type="text" class="form-control" placeholder="Mode of delivery" v-model="summary.deliveryMode" id="delivery_mode" @change="summary.save()">
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">Duration</label>
          <input type="number" class="form-control" placeholder="Duration in minutes" v-model="summary.deliveryDuration" id="delivery_duration" @change="summary.save()">
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">Syntomatine/Ergometine</label>
          <select v-model="summary.inductionMedication" class="form-control" @change="summary.save()">
            <option value="" disabled selected>Please Select</option>
            <option value="Syntomatine">Syntomatine</option>
            <option value="Ergometine">Ergometine</option>
            <option value="None">None</option>
          </select>
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label" for="ivim_select">IV/IM</label>
          <select class="form-control" id="ivim_select" v-model="summary.selection" @change="summary.save(summary.selection)" >
            <option value="" disabled selected>Please select</option>
            <option value="iv">IV</option>
            <option value="im">IM</option>
            <option value="both">Both</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 3rd Stage -->
    <div class="row">
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">(3rd Stage) baby Alive/SB MF//APgal Min</label>
          <div class="d-flex">
            <input type="number" class="form-control" placeholder="Mode of delivery" v-model="summary.babyAliveApgarMin" id="baby_alive_apgal_min" @change="summary.save()">
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="form-group">
          <label class="form-label">5 min</label>
          <input type="number" class="form-control" placeholder="Mode of delivery" v-model="summary.babyAliveApgar5min" id="baby_alive_apgal_5min" @change="summary.save()">
        </div>
      </div>
      <div class="col-md-2">
        <div class="form-group">
          <label class="form-label">10 min</label>
          <input type="number" class="form-control" placeholder="Mode of delivery" v-model="summary.babyAliveApgar10min" id="baby_alive_apgal_10min" @change="summary.save()">
        </div>
      </div>
      <div class="col-md-2">
        <div class="form-group">
          <label class="form-label">Resuscitation</label>
          <div class="d-flex">
            <select class="form-control" v-model="summary.resuscitation" @change="summary.save(summary.resuscitation)">
              <option value="" disabled selected>Please select</option>
              <option value="1">YES</option>
              <option value="0">NO</option>
            </select>
          </div>
        </div>
      </div>
      <div class="col-md-2">
        <div class="form-group">
          <label class="form-label">Duration(Mins)</label>
          <input type="number" class="form-control" placeholder="Duration in mins" v-model="summary.resuscitationDuration" id="duration_min" @change="summary.save()">
        </div>
      </div>
    </div>
    <!-- Placenta, WL, Membrane, Cord -->
    <div class="row">
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">Placenta</label>
          <div class="d-flex">

            <select class="form-control" v-model="summary.placenta" @change="summary.save(summary.placenta)">
              <option value="" disabled selected>Please Select</option>
              <option value="1">Complete</option>
              <option value="0">Incomplete</option>
            </select>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">WL (gm)</label>
          <input type="text" class="form-control" placeholder="WL (gm)" v-model="summary.wl" id="wl_gm" @change="summary.save()">
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">Membrane</label>
          <select class="form-control" v-model="summary.membrane" @change="summary.save(summary.membrane)">
            <option value="" disabled selected>Please Select</option>
            <option value="1">Complete</option>
            <option value="0">Incomplete</option>
          </select>
        </div>
      </div>

    </div>

    <!-- Blood Loss, Perineal Tear/Episiotomy, Mother BP, Pulse, Temp, Resp -->
    <div class="row">
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">Blood Loss(ml)</label>
          <input type="text" class="form-control" placeholder="Blood Loss(ml)" v-model="summary.bloodLoss" id="blood_loss" @change="summary.save()">
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">Perineal status</label>
          <select class="form-control" v-model="summary.perineal_status" @change="summary.save()">
            <option value="" disabled selected>Please Select</option>
            <option value="perineal_tear">Perineal Tear</option>
            <option value="perineal_intact">Perineal Intact</option>
            <option value="episiotomy">Episiotomy</option>
          </select>
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-group">
          <div class="d-flex">
            <div class="form-group">
              <label class="form-label">Cord</label>
              <select class="form-control" v-model="summary.cord" @change="summary.save(summary.membrane)">
                <option value="" disabled selected>Please Select</option>
                <option value="1">Normal</option>
                <option value="0">Abnormal</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">Mother BP(diastolic)</label>
          <input type="number" class="form-control" placeholder="Blood pressure(Diastolic)" v-model="summary.motherBpDiastolic" id="mother_bp_diastolic" @change="summary.save()">
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">Mother BP(systolic)</label>
          <input type="number" class="form-control" placeholder="Blood pressure(Systolic)" v-model="summary.motherBpSystolic" id="mother_bp_systolic" @change="summary.save()">
        </div>
      </div>
      <div class="col-md-2">
        <div class="form-group">
          <label class="form-label">Mother Pulse</label>
          <input type="text" class="form-control" placeholder="Pulse" v-model="summary.motherPulse" id="mother_pulse" @change="summary.save()">
        </div>
      </div>
      <div class="col-md-2">
        <div class="form-group">
          <label class="form-label">Mother Temp</label>
          <input type="text" class="form-control" placeholder="Temp in *c" v-model="summary.motherTemp" id="mother_temp" @change="summary.save()">
        </div>
      </div>
      <div class="col-md-2">
        <div class="form-group">
          <label class="form-label">Resp</label>
          <input type="text" class="form-control" placeholder="Resp" v-model="summary.motherResp" id="mother_resp" @change="summary.save()">
        </div>
      </div>
    </div>
    <!-- Baby weight, length, head circumference, drugs given -->
    <div class="row">
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">Baby weight(gms)</label>
          <input type="text" class="form-control" placeholder="Baby weight(gms)" v-model="summary.babyWeight" id="baby_weight" @change="summary.save()">
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">Baby length(cm)</label>
          <input type="text" class="form-control" placeholder="Baby length(cm)" v-model="summary.babyLength" id="baby_length" @change="summary.save()">
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">Head(cm)</label>
          <input type="text" class="form-control" placeholder="Head(cm)" v-model="summary.babyHead" id="baby_head" @change="summary.save()">
        </div>
      </div>
    </div>

    <!-- Delivered by, Date and Time of Delivery -->
    <div class="row">
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">Delivered by</label>
          <input type="text" class="form-control" placeholder="Delivered by" v-model="summary.deliveredBy" id="delivered_by" @change="summary.save()">
        </div>
      </div>
      <div class="col-md-3">
        <div class="form-group">
          <label class="form-label">Date and Time of Delivery</label>
          <input type="datetime-local" class="form-control" v-model="summary.deliveryDateTime" id="date_and_time_of_delivery" @change="summary.save()">
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Summary from '@inpatient/libs/admissions/Summary';
import StoreProduct from '@inventory/libs/products/StoreProduct';


export default {
  props: {
    visit_id: Number,
    patient_id: Number,
    admission_id: Number,
  },

  data() {
    return {
      saveLoader: false,
      summary: new Summary(),
      product: new StoreProduct(),

    };
  },

  computed: {
    errors() {
      return this.prescription.form.errors;
    },
    term() {
      return this.product.search.term;
    },
  },
  watch: {
    selectedProduct(value) {
      if (value) {
        if (typeof value === 'string') {
          this.prescription.drug = value;
        } else {
          this.prescription.drug = value.id;
        }
      }
    },
  },
  methods: {
    handleCheckboxChange(obj, propertyName) {
      this.summary[propertyName] = !this.summary[propertyName];

      // obj[propertyName] = !obj[propertyName]; // Toggle the boolean value
      obj.save(); // Save the summary changes
    },
    selectedDrug() {
      this.errors.clear('drug');
    },

  },
  mounted() {
    // Set the prop values to the summary object
    this.summary.visit_id = this.visit_id;
    this.summary.patient_id = this.patient_id;
    this.summary.admission_id = this.admission_id;
  },
};
</script>
