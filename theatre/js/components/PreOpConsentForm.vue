<template>
  <div class="panel panel-info">
    <div class="panel-heading">
      <h5>Pre-Operation Consent Form</h5>
    </div>
    <div class="panel-body" style="max-height: 420px; overflow-y: auto; padding-top: 10px;padding-left:20px;padding-right:20px">
      <form @submit.prevent="submitForm" class="form-horizontal" autocomplete="off">
        <input type="hidden" name="form_type" value="pre_op_consent" />
        <input type="hidden" name="title" value="Pre-Operation Consent Form" />

        <div class="form-group">
          <div class="col-md-12">
            <p class="text-bold">Type of operation:</p>
            <p>
              I confirm that I have explained the above operation and such appropriate action as are available, and the type of anesthetic proposed (general, regional, sedation) if any, to the patient in terms which, in my judgment are suitable to the understanding of the patient / or to one of the guardians of the patients
            </p>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="col-md-4 control-label">Surgeon's name</label>
              <div class="col-md-8">
                <select v-model="form.surgeon_name_consent" @change="onSurgeonChange" class="form-control">
                  <option value="" disabled>Select surgeon...</option>
                  <option v-for="(label, val) in surgeonOptions" :key="val" :value="val">{{ label }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="col-md-4 control-label">Surgeon's signature</label>
              <div class="col-md-8">
                <img :src="surgeonSignaturePreview" height="60" width="100" alt="signature" />
                <input type="hidden" name="surgeon_signature_consent" :value="form.surgeon_signature_consent" />
              </div>
            </div>
            <div class="form-group">
              <label class="col-md-4 control-label">Date</label>
              <div class="col-md-8">
                <input type="date" class="form-control" v-model="form.surgeon_date_consent" />
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="col-md-4 control-label">Anesthetist's name</label>
              <div class="col-md-8">
                <select v-model="form.anesthetist_name_consent" @change="onAnesthetistChange" class="form-control">
                  <option value="" disabled>Select anesthetist...</option>
                  <option v-for="(label, val) in anesthetistOptions" :key="val" :value="val">{{ label }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="col-md-4 control-label">Anesthetist's signature</label>
              <div class="col-md-8">
                <img :src="anesthetistSignaturePreview" height="60" width="100" alt="signature" />
                <input type="hidden" name="anesthetist_signature_consent" :value="form.anesthetist_signature_consent" />
              </div>
            </div>
            <div class="form-group">
              <label class="col-md-4 control-label">Date</label>
              <div class="col-md-8">
                <input type="date" class="form-control" v-model="form.anesthetist_date_consent" />
              </div>
            </div>
          </div>
        </div>

        <h4 class="text-bold">DECLARATION</h4>
        <div class="form-group">
          <div class="col-md-12">
            <p><em>This section is to be signed by the patient and his / her witness.</em></p>
            <p>I am the patient and have considered all the information provided to me and I agree to the above mentioned treatment and the option that I have indicated.</p>
          </div>
        </div>

        <div class="form-group">
          <label class="col-md-3 control-label">1. Patient's name</label>
          <div class="col-md-9">
            <select v-model="form.patient_name_consent" class="form-control">
              <option value="" disabled>Select patient...</option>
              <option v-for="(label, val) in patientOptions" :key="val" :value="val">{{ label }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label">Patient's signature</label>
          <div class="col-md-9">
            <input type="text" class="form-control" v-model="form.patient_signature_consent" />
          </div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label">2. Witness's name</label>
          <div class="col-md-9">
            <input type="text" class="form-control" v-model="form.witness_name_consent" />
          </div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label">Relation to patient</label>
          <div class="col-md-9">
            <input type="text" class="form-control" placeholder="e.g., Spouse, Child, Friend" v-model="form.witness_relation_consent" />
          </div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label">Signature</label>
          <div class="col-md-9">
            <input type="text" class="form-control" v-model="form.witness_signature_consent" />
          </div>
        </div>

        <h4 class="text-bold">Nurse's Section</h4>
        <div class="form-group">
          <div class="col-md-12">
            <p><em>This section is to be filled and signed by the nurse: Pre-medication given:</em></p>
          </div>
        </div>

        <div class="row" style="padding: 0 15px;">
          <div class="col-md-6">
            <div class="form-group" v-for="item in premedLeft" :key="item.key">
              <label class="checkbox-inline">
                <input type="checkbox" :name="item.key" :value="1" v-model="form[item.key]" /> {{ item.label }}
              </label>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group" v-for="item in premedRight" :key="item.key">
              <label class="checkbox-inline">
                <input type="checkbox" :name="item.key" :value="1" v-model="form[item.key]" /> {{ item.label }}
              </label>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label class="col-md-4 control-label">Blood pressure</label>
              <div class="col-md-8"><input type="text" class="form-control" placeholder="e.g. 120/80" v-model="form.nurse_blood_pressure_consent" /></div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label class="col-md-4 control-label">Blood sugar</label>
              <div class="col-md-8"><input type="text" class="form-control" placeholder="e.g. 5.6 mmol/L" v-model="form.nurse_blood_sugar_consent" /></div>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="col-md-3 control-label">Name of nurse</label>
          <div class="col-md-9"><input type="text" class="form-control" v-model="form.nurse_name_consent" /></div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label">Signature</label>
          <div class="col-md-9"><input type="text" class="form-control" v-model="form.nurse_signature_consent" /></div>
        </div>
        <div class="form-group">
          <label class="col-md-3 control-label">Date</label>
          <div class="col-md-9"><input type="date" class="form-control" v-model="form.nurse_date_consent" /></div>
        </div>

        <div class="col-xs-12" style="padding:0 !important; margin-top: 15px;">
          <button type="submit" class="btn btn-primary col-md-4" :disabled="submitting">
            {{ submitting ? 'Saving...' : 'Save Consent Form' }}
          </button>
          <a v-if="consentExists && downloadUrl" :href="downloadUrl" target="_blank" class="btn btn-success col-md-4" style="margin-left: 10px;">Download Consent Form</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "PreOpConsentForm",
  props: {
    postUrl: { type: String, required: true },
    csrfToken: { type: String, required: true },
    surgeonOptions: { type: Object, default: () => ({}) },
    surgeonSignatures: {
      type: Object,
      default: () => ({})
    },
    anesthetistSignatures: {
      type: Object,
      default: () => ({})
    },
    anesthetistOptions: { type: Object, default: () => ({}) },
    patientOptions: { type: Object, default: () => ({}) },
    consentExists: { type: Boolean, default: false },
    downloadUrl: { type: String, default: "" }
  },
  data() {
    return {
      submitting: false,
      surgeonSignaturePreview: "",
      anesthetistSignaturePreview: "",
      form: {
        surgeon_name_consent: "",
        surgeon_signature_consent: "",
        surgeon_date_consent: this.today(),
        anesthetist_name_consent: "",
        anesthetist_signature_consent: "",
        anesthetist_date_consent: this.today(),
        patient_name_consent: "",
        patient_signature_consent: "",
        witness_name_consent: "",
        witness_relation_consent: "",
        witness_signature_consent: "",
        nurse_blood_pressure_consent: "",
        nurse_blood_sugar_consent: "",
        nurse_name_consent: "",
        nurse_signature_consent: "",
        nurse_date_consent: this.today(),
      }
    };
  },
  computed: {
    premedLeft() {
      return [
        { key: 'premed_brufen', label: 'Brufen 400mg' },
        { key: 'premed_paracetamol', label: 'Paracetamol 1000mg' },
        { key: 'premed_antiemetic', label: 'Antiemetic' },
        { key: 'premed_antacid', label: 'Antacid' },
        { key: 'premed_ranitidine', label: 'Ranitidine' },
        { key: 'premed_xylocaine', label: 'Xylocaine gel 2%' },
      ];
    },
    premedRight() {
      return [
        { key: 'premed_tetracaine', label: 'Tetracaine drops' },
        { key: 'premed_mydriacyl', label: 'Mydriacyl drops' },
        { key: 'premed_exocin', label: 'Exocin drops' },
        { key: 'premed_acular', label: 'Acular drops' },
      ];
    }
  },
  methods: {
    today() {
      const d = new Date();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${d.getFullYear()}-${m}-${day}`;
    },
    onSurgeonChange() {
      const id = this.form.surgeon_name_consent;
      const sig = this.surgeonSignatures[id] || "";
      this.surgeonSignaturePreview = sig;
      this.form.surgeon_signature_consent = sig;
    },
    onAnesthetistChange() {
      const id = this.form.anesthetist_name_consent;
      const sig = this.anesthetistSignatures[id] || "";
      this.anesthetistSignaturePreview = sig;
      this.form.anesthetist_signature_consent = sig;
    },
    async submitForm() {
      try {
        this.submitting = true;
        const formData = new FormData();
        formData.append('form_type', 'pre_op_consent');
        formData.append('title', 'Pre-Operation Consent Form');
        Object.keys(this.form).forEach(k => {
          const v = this.form[k];
          if (v !== null && v !== undefined) formData.append(k, v);
        });
        await window.axios.post(this.postUrl, formData, {
          headers: { 'X-CSRF-TOKEN': this.csrfToken }
        });
        window.events && window.events.$emit('flash', {message: 'Consent form saved', type: 'success'});
      } catch (e) {
        console.error(e);
        window.events && window.events.$emit('flash', {message: 'Failed to save consent form', type: 'error'});
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style scoped>
</style>
