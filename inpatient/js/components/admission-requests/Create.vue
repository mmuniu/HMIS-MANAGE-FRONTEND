<!--
* Created by PhpStorm.
* User: Lexx YungCarter
* Date: 2018-12-06
* Time: 14:24
* Project: platform
-->

<template>

    <div>
        <v-row >
            <v-col cols="12" sm="6" md="6">
                <v-select v-model="admissionRequest.admission_type_id" label="Admission Type" outline class="mr-3"
                          :items="admissionTypes" item-text="name" item-value="id"
                          :error="errors.has('admission_type_id')" :hint="errors.get('admission_type_id')" persistent-hint @change="errors.clear('admission_type_id')"
                ></v-select>
            </v-col>
            <v-col cols="12" sm="6" md="6">
                <v-select v-model="admissionRequest.requested_facility_id" label="Choose Facility to direct the request" outline class="mr-3"
                          :items="facilities" item-text="name" item-value="id"
                          :error="errors.has('requested_facility_id')" :hint="errors.get('requested_facility_id')" persistent-hint @change="errors.clear('requested_facility_id')"
                ></v-select>
            </v-col>

            <v-col cols="12" sm="6" md="4">
                <v-textarea label="Reason" v-model="admissionRequest.reason" outline class="mr-3"
                            :error="errors.has('reason')" :hint="errors.get('reason')" persistent-hint @change="errors.clear('reason')"
                ></v-textarea>
            </v-col>

            <v-col cols="12" sm="6" md="4">
                <v-textarea label="Diagnosis" v-model="admissionRequest.diagnosis" outline class="mr-3"
                            :error="errors.has('diagnosis')" :hint="errors.get('diagnosis')" persistent-hint @change="errors.clear('reason')"
                ></v-textarea>
            </v-col>



            <v-col cols="12" sm="6" md="4">
                <v-textarea label="Past Medical & Surgical History" v-model="admissionRequest.medical_surgical_history" outline class="mr-3"
                            :error="errors.has('medical_surgical_history')" :hint="errors.get('medical_surgical_history')" persistent-hint @change="errors.clear('medical_surgical_history')"
                ></v-textarea>
            </v-col>

            <v-col cols="12" sm="6" md="4">
                <v-textarea label="Family Social-Economic History" v-model="admissionRequest.social_economic_history" outline class="mr-3"
                            :error="errors.has('social_economic_history')" :hint="errors.get('social_economic_history')" persistent-hint @change="errors.clear('social_economic_history')"
                ></v-textarea>
            </v-col>

            <v-col cols="12" sm="6" md="4">
                <v-textarea label="History of Present Complains" v-model="admissionRequest.complain_history" outline class="mr-3"
                            :error="errors.has('complain_history')" :hint="errors.get('complain_history')" persistent-hint @change="errors.clear('complain_history')"
                ></v-textarea>
            </v-col>


            <v-col cols="12" sm="6" md="4">
              <v-textarea label="On Examination" v-model="admissionRequest.on_examination" outline class="mr-3"
                          :error="errors.has('on_examination')" :hint="errors.get('on_examination')" persistent-hint @change="errors.clear('on_examination')"
              ></v-textarea>
          </v-col>


            <v-col cols="12" sm="6" md="4">
              <v-textarea label="RS" v-model="admissionRequest.rs" outline class="mr-3"
                          :error="errors.has('rs')" :hint="errors.get('rs')" persistent-hint @change="errors.clear('rs')"
              ></v-textarea>
          </v-col>


            <v-col cols="12" sm="6" md="4">
              <v-textarea label="CNS" v-model="admissionRequest.cns" outline class="mr-3"
                          :error="errors.has('cns')" :hint="errors.get('cns')" persistent-hint @change="errors.clear('cns')"
              ></v-textarea>
          </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-textarea label="CVS" v-model="admissionRequest.cvs" outline class="mr-3"
                          :error="errors.has('cvs')" :hint="errors.get('cvs')" persistent-hint @change="errors.clear('cvs')"
              ></v-textarea>
          </v-col>

            <v-col cols="12" sm="6" md="4">
              <v-textarea label="PA" v-model="admissionRequest.cns" outline class="mr-3"
                          :error="errors.has('pa')" :hint="errors.get('pa')" persistent-hint @change="errors.clear('pa')"
              ></v-textarea>
          </v-col>




            <!-- <v-col cols="12" sm="6" md="4" v-for="(item, index) in extra" :key="index">

                <v-textarea :label="item.placeholder" v-model="item.name" outline class="mr-3"
                            :error="errors.has('extra.item.name')" :hint="errors.get('extra.item.name')" persistent-hint @change="errors.clear('extra.item.name')"
                ></v-textarea>
            </v-col> -->

        </v-row>

        <v-row>
            <v-btn type="submit" class="blue lighten-1" color="blue" @click.prevent="save" block large
                   :dark="!saveLoader" :loading="saveLoader" :disabled="saveLoader"
            >
                {{ admissionRequest.visit_id ? 'Update Admission Request' : buttonText }}
            </v-btn>
        </v-row>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import AdmissionRequest from '@inpatient/libs/admission-requests/AdmissionRequest';

export default {
    props: {
        visitId: {
            required: true,
        },

        patientId: {
            required: true,
        },

        buttonText: {
            type: String,
            default: 'Request Admission',
        },
    },

    data() {
        return {
            admissionRequest: new AdmissionRequest,
            saveLoader: false,

            extra: [
                { 'name': 'admissionRequest.diagnosis', 'placeholder': 'Diagnosis' },
                { 'name': 'admissionRequest.complain_history', 'placeholder': 'History of Present Complains' },
                { 'name': 'admissionRequest.social_economic_history', 'placeholder': 'Family Social-Economic History' },
                { 'name': 'admissionRequest.medical_surgical_history', 'placeholder': 'Past Medical & Surgical History' },
                { 'name': 'admissionRequest.on_examination', 'placeholder': 'On Examination' },
                { 'name': 'admissionRequest.rs', 'placeholder': 'RS' },
                { 'name': 'admissionRequest.cns', 'placeholder': 'CNS' },
                { 'name': 'admissionRequest.cvs', 'placeholder': 'CVS' },
                { 'name': 'admissionRequest.pa', 'placeholder': 'PA' },
            ],
        };
    },

    computed: {
        ...mapGetters([
            'getAdmissionTypes', 'getFacilities',
        ]),

        admissionTypes() {
            return _.map(this.getAdmissionTypes.data, (item) => {
                return {
                    name: item.name + ' (' + item.deposit + ')',
                    id: item.id,
                };
            });
        },

        facilities() {
            return this.getFacilities.facilities;
        },

        errors() {
            return this.admissionRequest.form.errors;
        },

        submitted() {
            return this.admissionRequest.form.submitted;
        },

        contaminated() {
            return this.admissionRequest.form.errorDetected;
        },
    },

    watch: {
        contaminated(value) {
            if (value) {
                this.saveLoader = false;
                this.admissionRequest.form.errorDetected = false;
            }
        },

        submitted() {
            this.admissionRequest.form.submitted = false;
            this.saveLoader = false;

            if (this.admissionRequest.visit_id) {
                // an admission request exists
                this.$emit('saved');
            }
        },
    },

    methods: {
        ...mapActions([
            'setAdmissionTypes', 'setFacilities',
        ]),

        initialise() {
            this.setAdmissionTypes();
            this.setFacilities();
            this.admissionRequest.findForVisit(this.visitId);
        },

        async save() {
            this.saveLoader = true;

            this.admissionRequest.patient_id = this.patientId;
            this.admissionRequest.visit_id = this.visitId;
            const response = await this.admissionRequest.save();

            if (response) {
                if (response.alert == 'success') {
                    // return window.open('/inpatient/admission-requests', '_self');
                }
            }
        },
    },

    async mounted() {
        this.initialise();
        const response = await fetch(`/api/evaluation/admission/pre_entered/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: this.visitId })
      });

      const data = await response.json();

      this.admissionRequest.diagnosis = data.diagnosis;
      this.admissionRequest.complain_history = data.history_of_present_complains;
      this.admissionRequest.medical_surgical_history = data.chronic_illnesses;
      this.admissionRequest.on_examination = data.on_examination;

    },
};
</script>

<style scoped lang="scss">

</style>
