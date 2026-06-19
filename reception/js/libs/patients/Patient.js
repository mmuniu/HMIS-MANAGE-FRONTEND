import Base from '@app/libs/Base';
import Form from '@app/libs/Form';

import { fields } from './PatientRepository';
import { _ } from 'vue-underscore';

export default class Patient extends Base {
    constructor() {
        super(fields);

        this.table = 'reception_patients';

        this.form = new Form(fields);

        this.patient = null;

        this.populated = false;
    }

    /*
     * Save a new patient to the database
     */
    async save() {
        const data = this.getFieldsExcept(['form', 'table', 'patient', 'populated']);

        _.each(data.schemes, (item) => {
            if (item.company_id.id) {
                item.company_id = item.company_id.id;
            }
        });

        const response = await this.form.submit('post', '/api/reception/patients', data);

        if (response) {
            this.patient_id = response.patient_id;

            flash(response);

            return response;
        }
    }


    async saveunkownpatient() {
        const data = this.getFieldsExcept(['form', 'table', 'patient', 'populated']);

        _.each(data.schemes, (item) => {
            if (item.company_id.id) {
                item.company_id = item.company_id.id;
            }
        });

        const response = await this.form.submit('post', '/api/reception/patients/unknown/patient', data);


        // console.log(response);

        if (response) {
            this.patient_id = response.patient_id;

            flash(response);

            return response;
        }
    }

    /*
     * Update a patient in the database
     */
    async update() {
        const data = this.getFieldsExcept(['form']);

        _.each(data.schemes, (item) => {
            if (item.company_id.id) {
                item.company_id = item.company_id.id;
            }
        });

        const response = await this.form.submit('patch', `/api/reception/patients/${this.patient_id}`, data);

        if (response) {
            if (response.errors) {
                this.form.errors = response.errors;
            }

            flash(response);

            return response;
        }
    }


    async fetchPatientWalletAccount(patientId) {
        try {
            const existing_patient_account = await this.form.submit('get', route('api.reception.patients.fetch_existing_wallet_record', patientId));


            if (existing_patient_account.message === 'Wallet exists') {
                return await this.form.submit('get', route('api.reception.patients.show_wallet_acc', patientId));
            } else {
                // No wallet exists, return null
                return 'Not set';
            }
        } catch (error) {
            console.error('Error fetching patient wallet balance:', error);
            throw error; // Propagate the error if needed
        }
    }

    async fetchPatientWalletBalance(patientId) {
        try {
            const existing_patient_account = await this.form.submit('get', route('api.reception.patients.fetch_existing_wallet_record', patientId));
            if (existing_patient_account.message === 'Wallet exists') {
                return await this.form.submit('get', route('api.reception.patients.show_wallet_balance', patientId));
            } else {
                return 0;
            }
        } catch (error) {
            console.error('Error fetching patient wallet balance:', error);
            throw error; // Propagate the error if needed
        }
    }
    /**
     * get the info for a specific patient
     * @param id
     */
    find(id) {
        this.form.submit('get', route('api.reception.patients.show', id)).then((response) => {
            this.patient = response.patient;
        });
    }

    /*
     * Initialise the form fields with details from a patient object
     * useful on patient edit
     */
    populate(profile) {
        const patient = profile;

        // Save the patient ID
        this.patient_id = patient.id;
        this.hasInsurance = patient.schemes.length > 0;

        // Initialise patient profile fields
        _.each(this.profile, (value, key) => {
            fields.profile[key] = patient[key];
        });

        this.profile.resident_county = patient.county;
        this.profile.resident_sub_county = patient.sub_county;
        this.profile.resident_village = patient.village;
        this.profile.kra_pin_number = patient.kra_pin_number;

        this.allergies = patient.meta ? patient.meta.allergies : null;

        fields.profile.dob = patient.date_of_birth != 'Not available' ? new Date(patient.date_of_birth).toISOString().substr(0, 10) : null;
        fields.profile.sex = patient.sex ? patient.sex.toLowerCase() : null;

        // Initialise patient next of kin fields
        _.each(patient.nok, (item) => {
            fields.noks.push({
                id: item.id,
                first_name: item.first_name,
                middle_name: item.middle_name,
                last_name: item.last_name,
                mobile: item.mobile,
                email: item.email,
                relationship_id: item.relationship_id,
            });
        });

        // dependants
        this.dependants = patient.dependants;

        // initialise patient schemes
        _.each(patient.schemes, (item) => {
            fields.schemes.push({
                id: item.id,
                scheme_id: item.scheme_id,
                scheme_name: item.scheme_name,
                company_id: item.company_id,
                menu: false,
                policy_number: item.policy_number,
                principal: item.principal,
                dob: item.dob === 'Not available' ? null : item.dob,
                relationship_id: item.relationship_id,
            });
        });

        this.populated = true;
    }

    /*
     * Returns the clean empty template for insurance details
     */
    schemeTemplate() {
        return {
            scheme_id: null,
            company_id: null,
            menu: false,
            policy_number: null,
            principal: null,
            dob: null,
            relationship_id: null,
        };
    }

    /*
     * Returns the clean empty template for nok details
     */
    nokTemplate() {
        return {
            first_name: null,
            middle_name: null,
            last_name: null,
            mobile: null,
            relationship_id: null,
        };
    }

    /*
    * save a random note
    * */
    async saveRandomNote(patient_id, data) {
        const response = await this.form.submit('post', `/api/reception/patients/${patient_id}/random-note/store`, data);


        if (response) {
            flash(response);

            return response;
        }
    }

    /*
    * save a random note
    * */
    async clearNote(patient_id, note_id) {
        const response = await this.form.submit('post', `/api/reception/patients/${patient_id}/random-note/${note_id}/clear`);

        if (response) {
            flash(response);

            return response;
        }
    }

    /*
    * upload image
    * */
    async uploadImage(patient_id = null) {
        const formData = new FormData();

        formData.append('image', this.profile.image);

        const response = this.form.submit('post', route('api.reception.patients.upload-image', patient_id).relative(),
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then((res) => {
            flash(res);

            window.location.reload();
        });
    }
}
