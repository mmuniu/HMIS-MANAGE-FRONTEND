<template>
  <div class="panel panel-info" style="padding:0 20px">
    <div class="panel-heading">
      <h5>Standard Consent Form for Cataract/Multifocal Lens Surgery</h5>
    </div>
    <div class="panel-body" style="height: 400px; overflow-y:auto; padding-top: 10px;padding-left:10px;padding-right:10px">
      <form @submit.prevent="submitForm">
        <input type="hidden" name="form_type" :value="formType" />
        <input type="hidden" name="title" :value="title" />

        <!-- Patient Information -->
        <div class="form-group">
          <label class="col-md-3 control-label">Patient No.</label>
          <div class="col-md-3"><input class="form-control" v-model="form.patient_number" type="text" /></div>
          <label class="col-md-3 control-label">Date</label>
          <div class="col-md-3"><input class="form-control" v-model="form.consent_date" type="date" /></div>
        </div>

        <div class="form-group">
          <label class="col-md-3 control-label">Name</label>
          <div class="col-md-9"><input class="form-control" v-model="form.patient_name_consent" type="text" /></div>
        </div>

        <div class="form-group">
          <label class="col-md-3 control-label">Address</label>
          <div class="col-md-9"><input class="form-control" v-model="form.patient_address" type="text" /></div>
        </div>

        <div class="form-group">
          <label class="col-md-3 control-label">Date of Birth</label>
          <div class="col-md-3"><input class="form-control" v-model="form.patient_dob" type="date" /></div>
          <label class="col-md-3 control-label">Sex</label>
          <div class="col-md-3">
            <select class="form-control" v-model="form.patient_sex">
              <option value=""></option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="col-md-3 control-label">Doctor</label>
          <div class="col-md-9"><input class="form-control" v-model="form.doctor_name" type="text" /></div>
        </div>

        <!-- Patient Consent Checkboxes -->
        <div class="form-group">
          <div class="col-md-12">
            <p><strong>Patient: Please tick each box after reading and understanding the statement that follows the box.</strong></p>
            <div class="checkbox"><label><input type="checkbox" v-model="form.consent_understood_risks" /> I have discussed with the surgeon and understood 1) the risks and benefits of cataract/multifocal lens surgery 2) My individual eye condition and expected visual outcome 3) Other options including non surgical ones.</label></div>
            <div class="checkbox"><label><input type="checkbox" v-model="form.consent_read_leaflet" /> I have read and fully understood the patient information leaflet...</label></div>
            <div class="checkbox"><label><input type="checkbox" v-model="form.consent_financial_responsibility" /> The financial responsibility...</label></div>
            <div class="checkbox"><label><input type="checkbox" v-model="form.consent_cost_prediction" /> The clinical staff will attempt to predict costs...</label></div>
            <div class="checkbox"><label><input type="checkbox" v-model="form.consent_no_guarantee" /> I understand there is no guarantee of perfect outcome.</label></div>
          </div>
        </div>

        <!-- Doctor's Section -->
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="col-md-4 control-label">Surgeon's name</label>
              <div class="col-md-8"><input class="form-control" v-model="form.surgeon_name_consent" type="text" /></div>
            </div>
            <div class="form-group">
              <label class="col-md-4 control-label">Surgeon's signature</label>
              <div class="col-md-8"><input class="form-control" v-model="form.surgeon_signature_consent" type="text" /></div>
            </div>
            <div class="form-group">
              <label class="col-md-4 control-label">Date</label>
              <div class="col-md-8"><input class="form-control" v-model="form.surgeon_date_consent" type="date" /></div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="col-md-4 control-label">Anesthetist's name</label>
              <div class="col-md-8"><input class="form-control" v-model="form.anesthetist_name_consent" type="text" /></div>
            </div>
            <div class="form-group">
              <label class="col-md-4 control-label">Anesthetist's signature</label>
              <div class="col-md-8"><input class="form-control" v-model="form.anesthetist_signature_consent" type="text" /></div>
            </div>
            <div class="form-group">
              <label class="col-md-4 control-label">Date</label>
              <div class="col-md-8"><input class="form-control" v-model="form.anesthetist_date_consent" type="date" /></div>
            </div>
          </div>
        </div>

        <!-- Patient Declaration Section -->
        <div class="form-group">
          <label class="col-md-3 control-label">1. Patient's name</label>
          <div class="col-md-9"><input class="form-control" v-model="form.patient_declaration_name" type="text" /></div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label">Patient's signature</label>
          <div class="col-md-9"><input class="form-control" v-model="form.patient_declaration_signature" type="text" /></div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label">2. Witness's name</label>
          <div class="col-md-9"><input class="form-control" v-model="form.witness_name_consent" type="text" /></div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label">Relation to patient</label>
          <div class="col-md-9"><input class="form-control" v-model="form.witness_relation_consent" type="text" placeholder="e.g., Spouse, Child, Friend" /></div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label">Signature</label>
          <div class="col-md-9"><input class="form-control" v-model="form.witness_signature_consent" type="text" /></div>
        </div>

        <!-- Nurse's Section -->
        <div class="form-group">
          <div class="col-md-12">
            <h5 class="text-bold">Nurse's Section</h5>
            <p><em>This section is to be filled and signed by the nurse:</em></p>
            <p><strong>Premedication given:</strong></p>
            <label class="checkbox-inline"><input type="checkbox" v-model="form.premed_refuferi" /> Refuferi 400mg (1 tab)</label>
            <label class="checkbox-inline"><input type="checkbox" v-model="form.premed_paracetamol" /> Paracetamol 1000mg (2 tabs)</label>
            <label class="checkbox-inline"><input type="checkbox" v-model="form.premed_valium" /> Valium 5mg (1 tab)</label>
            <label class="checkbox-inline"><input type="checkbox" v-model="form.premed_xylocaine" /> Xylocaine gel 2% (1 tube)</label>
            <label class="checkbox-inline"><input type="checkbox" v-model="form.premed_tetracaine" /> Tetracaine drops</label>
            <label class="checkbox-inline"><input type="checkbox" v-model="form.premed_mydriacyl" /> Mydriacyl drops</label>
            <label class="checkbox-inline"><input type="checkbox" v-model="form.premed_exocin" /> Exocin drops</label>
            <label class="checkbox-inline"><input type="checkbox" v-model="form.premed_acular" /> Acular drops</label>
          </div>
        </div>

        <div class="form-group">
          <label class="col-md-3 control-label">Blood Pressure</label>
          <div class="col-md-9"><input class="form-control" v-model="form.nurse_blood_pressure_consent" type="text" /></div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label">Blood Sugar</label>
          <div class="col-md-9"><input class="form-control" v-model="form.nurse_blood_sugar_consent" type="text" /></div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label">Nurse's name</label>
          <div class="col-md-9"><input class="form-control" v-model="form.nurse_name_consent" type="text" /></div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label">Nurse's signature</label>
          <div class="col-md-9"><input class="form-control" v-model="form.nurse_signature_consent" type="text" /></div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label">Date</label>
          <div class="col-md-9"><input class="form-control" v-model="form.nurse_date_consent" type="date" /></div>
        </div>

        <div class="form-group">
          <div class="col-md-12 text-right">
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              <span v-if="!submitting">Save Consent</span>
              <span v-else>Saving...</span>
            </button>
            <a v-if="downloadUrl" :href="downloadUrl" target="_blank" class="btn btn-default" style="margin-left: 10px">Download</a>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "StandardConsentForm",
  props: {
    postUrl: { type: String, required: true },
    csrfToken: { type: String, required: true },
    defaults: { type: Object, default: () => ({}) },
    downloadUrl: { type: String, default: "" }
  },
  data() {
    return {
      formType: 'multifocal_foldable_sics_consent_type_form',
      title: 'Standard Consent Form for Cataract/Multifocal Lens Surgery',
      form: {
        patient_number: this.defaults.patient_number || '',
        consent_date: this.defaults.consent_date || new Date().toISOString().substr(0,10),
        patient_name_consent: this.defaults.patient_name_consent || '',
        patient_address: this.defaults.patient_address || '',
        patient_dob: this.defaults.patient_dob || '',
        patient_sex: this.defaults.patient_sex || '',
        doctor_name: this.defaults.doctor_name || '',

        consent_understood_risks: !!this.defaults.consent_understood_risks,
        consent_read_leaflet: !!this.defaults.consent_read_leaflet,
        consent_financial_responsibility: !!this.defaults.consent_financial_responsibility,
        consent_cost_prediction: !!this.defaults.consent_cost_prediction,
        consent_no_guarantee: !!this.defaults.consent_no_guarantee,

        surgeon_name_consent: this.defaults.surgeon_name_consent || '',
        surgeon_signature_consent: this.defaults.surgeon_signature_consent || '',
        surgeon_date_consent: this.defaults.surgeon_date_consent || new Date().toISOString().substr(0,10),
        anesthetist_name_consent: this.defaults.anesthetist_name_consent || '',
        anesthetist_signature_consent: this.defaults.anesthetist_signature_consent || '',
        anesthetist_date_consent: this.defaults.anesthetist_date_consent || new Date().toISOString().substr(0,10),

        patient_declaration_name: this.defaults.patient_declaration_name || '',
        patient_declaration_signature: this.defaults.patient_declaration_signature || '',
        witness_name_consent: this.defaults.witness_name_consent || '',
        witness_relation_consent: this.defaults.witness_relation_consent || '',
        witness_signature_consent: this.defaults.witness_signature_consent || '',

        premed_refuferi: !!this.defaults.premed_refuferi,
        premed_paracetamol: !!this.defaults.premed_paracetamol,
        premed_valium: !!this.defaults.premed_valium,
        premed_xylocaine: !!this.defaults.premed_xylocaine,
        premed_tetracaine: !!this.defaults.premed_tetracaine,
        premed_mydriacyl: !!this.defaults.premed_mydriacyl,
        premed_exocin: !!this.defaults.premed_exocin,
        premed_acular: !!this.defaults.premed_acular,

        nurse_blood_pressure_consent: this.defaults.nurse_blood_pressure_consent || '',
        nurse_blood_sugar_consent: this.defaults.nurse_blood_sugar_consent || '',
        nurse_name_consent: this.defaults.nurse_name_consent || '',
        nurse_signature_consent: this.defaults.nurse_signature_consent || '',
        nurse_date_consent: this.defaults.nurse_date_consent || new Date().toISOString().substr(0,10),
      },
      submitting: false
    };
  },
  methods: {
    async submitForm() {
      this.submitting = true;
      try {
        const formData = new FormData();
        formData.append('form_type', this.formType);
        formData.append('title', this.title);
        Object.keys(this.form).forEach(k => {
          let v = this.form[k];
          if (typeof v === 'boolean') {
            if (v) formData.append(k, '1');
          } else if (v !== null && v !== undefined) {
            formData.append(k, v);
          }
        });

        const res = await window.axios.post(this.postUrl, formData, {
          headers: { 'X-CSRF-TOKEN': this.csrfToken }
        });

        this.$emit('saved', res && res.data ? res.data : null);
        window.events && window.events.$emit('FLASH', { type: 'success', message: 'Consent saved' });
      } catch (e) {
        console.error(e);
        window.events && window.events.$emit('FLASH', { type: 'error', message: 'Failed to save consent' });
      } finally {
        this.submitting = false;
      }
    }
  }
}
</script>

<style scoped>
.checkbox { display:block; margin-bottom: 6px; }
.form-group { margin-bottom: 10px; }
</style>
