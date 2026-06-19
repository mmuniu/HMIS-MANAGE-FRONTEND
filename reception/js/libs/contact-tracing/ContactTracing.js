import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './ContactTracingRepository';
import {_} from "vue-underscore";

export default class Visit extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
    * save
    * */
    async save() {

        if(this.trackees.length < 1 || !this.trackees) {

            const response = {
                message: "Trackees and the comment / other details are required",
                alert: 'error'
            }

            flash(response);

            return response;
        }

        const data = {
            patient_id: this.patient_id,
            comments: this.comments,
            trackees: this.trackees
        };

        const response = await this.form.submit('post', '/api/reception/contact-tracing', data);

        if (response) {
            return response;
        }
    }

    /*
    * save
    * */
    async saveDetails() {
        const response = await this.form.submit('post', '/api/reception/contact-tracing/save_details', this.details);

        if (response) {
            flash(response);

           this.resetDetails();

            return response;
        }
    }

    /*
    * save
    * */
    async updateTraceStatus() {

        const response = await this.form.submit('post', '/api/reception/contact-tracing/update_status', this.contact_trace_update);

        if (response) {
            flash(response);

            this.contact_trace_update = {
                has_travelled: false,
                arrival_date: null,
                call_status: null,
                tracking_status: null,
                comments: null,
                contact_id: null,
            }

            return response;
        }
    }

    /*
    * prepare for edit
    * */
    assemble (contact) {
        _.each(this.details, (value, key) => {
            if(contact.hasOwnProperty(key)) {
                this.details[key] = contact[key];
            }
        });

        _.each(this.details.profile, (value, key) => {
            if(contact.hasOwnProperty(key)) {
                this.details.profile[key] = contact[key];
            }
        })

        this.details.detail_id = contact.id
    }


    /*
    * quick reset : TODO: create a function to do this in the base
    * */
    resetDetails () {
        this.details.id = null;

        this.details = {
            profile: {
                first_name: null,
                middle_name: null,
                last_name: null,
                mobile: null,
                id_no: null,
                dob: null,
                age: null,
                age_in: null,
                sex: null,
                town: null,
                email: null,
                secondary_email: null,
                resident_county: null,
                nationality: null,
                resident_sub_county: null,
                resident_village: null,
            },
            contact_id: null,
            call_status: null,
            symptom_details: [],
            has_symptoms: false,
            is_health_care_worker: false,
            head_of_household: null,
            type_of_contact: null
        };
    }
}
