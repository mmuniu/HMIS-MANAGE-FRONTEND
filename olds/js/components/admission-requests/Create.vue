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

            <v-col cols="12" sm="6" md="4" v-for="(item, index) in extra" :key="index">
                <v-textarea :label="item.placeholder" v-model="admissionRequest.extra[item.name]" outline class="mr-3"
                            :error="errors.has('extra.item.name')" :hint="errors.get('extra.item.name')" persistent-hint @change="errors.clear('extra.item.name')"
                ></v-textarea>
            </v-col>

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
                { 'name': 'diagnosis', 'placeholder': 'Diagnosis' },
                { 'name': 'complain_history', 'placeholder': 'History of Present Complains' },
                { 'name': 'social_economic_history', 'placeholder': 'Family Social-Economic History' },
                { 'name': 'medical_surgical_history', 'placeholder': 'Past Medical & Surgical History' },
                { 'name': 'on_examination', 'placeholder': 'On Examination' },
                { 'name': 'rs', 'placeholder': 'RS' },
                { 'name': 'cns', 'placeholder': 'CNS' },
                { 'name': 'cvs', 'placeholder': 'CVS' },
                { 'name': 'pa', 'placeholder': 'PA' },
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
                    return window.open('/inpatient/admission-requests', '_self');
                }
            }
        },
    },

    mounted() {
        this.initialise();
    },
};
</script>

<style scoped lang="scss">

</style>
