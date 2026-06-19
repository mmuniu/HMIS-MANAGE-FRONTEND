import Base from '@app/libs/Base';
import Form from '@app/libs/Form';

import { fields } from './CustomerRepository';
import { _ } from 'vue-underscore';

export default class Customer extends Base {
    constructor() {
        super(fields);

        this.table = 'reception_customers';

        this.form = new Form(fields);

        this.customer = null;

        this.populated = false;
    }

    /*
     * Save a new customer to the database
     */
    async save() {
        const data = this.getFieldsExcept(['form', 'table', 'customer', 'populated']);

        _.each(data.schemes, (item) => {
            if (item.company_id.id) {
                item.company_id = item.company_id.id;
            }
        });

        const response = await this.form.submit('post', '/api/reception/customers', data);

        if (response) {
            this.customer_id = response.customer_id;

            flash(response);

            return response;
        }
    }

    /*
     * Update a customer in the database
     */
    async update() {
        const data = this.getFieldsExcept(['form']);

        _.each(data.schemes, (item) => {
            if (item.company_id.id) {
                item.company_id = item.company_id.id;
            }
        });

        const response = await this.form.submit('patch', `/api/reception/customers/${this.customer_id}`, data);

        if (response) {
            if (response.errors) {
                this.form.errors = response.errors;
            }

            flash(response);

            return response;
        }
    }

    async fetchCustomerWalletAccount(customerId) {
        try {
            const existing_customer_account = await this.form.submit('get', route('api.reception.customers.fetch_existing_wallet_record', customerId));

            if (existing_customer_account.message === 'Wallet exists') {
                return await this.form.submit('get', route('api.reception.customers.show_wallet_acc', customerId));
            } else {
                // No wallet exists, return null
                return 'Not set';
            }
        } catch (error) {
            console.error('Error fetching customer wallet balance:', error);
            throw error; // Propagate the error if needed
        }
    }

    async fetchCustomerWalletBalance(customerId) {
        try {
            const existing_customer_account = await this.form.submit('get', route('api.reception.customers.fetch_existing_wallet_record', customerId));
            if (existing_customer_account.message === 'Wallet exists') {
                return await this.form.submit('get', route('api.reception.customers.show_wallet_balance', customerId));
            } else {
                return 0;
            }
        } catch (error) {
            console.error('Error fetching customer wallet balance:', error);
            throw error; // Propagate the error if needed
        }
    }

    /**
     * get the info for a specific customer
     * @param id
     */
    find(id) {
        this.form.submit('get', route('api.reception.customers.show', id)).then((response) => {
            this.customer = response.customer;
        });
    }

    /*
     * Initialise the form fields with details from a customer object
     * useful on customer edit
     */
    populate(profile) {
        const customer = profile;

        // Save the customer ID
        this.customer_id = customer.id;
        this.hasInsurance = customer.schemes.length > 0;

        // Initialise customer profile fields
        _.each(this.profile, (value, key) => {
            fields.profile[key] = customer[key];
        });

        this.profile.resident_county = customer.county;
        this.profile.resident_sub_county = customer.sub_county;
        this.profile.resident_village = customer.village;
        this.profile.eligibleForPoints = customer.eligible_for_points;
        this.profile.kra_pin_number = customer.kra_pin_number;

        this.allergies = customer.meta ? customer.meta.allergies : null;

        fields.profile.dob = customer.date_of_birth != 'Not available' ? new Date(customer.date_of_birth).toISOString().substr(0, 10) : null;
        fields.profile.sex = customer.sex ? customer.sex.toLowerCase() : null;

        // Initialise customer next of kin fields
        _.each(customer.nok, (item) => {
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
        this.dependants = customer.dependants;

        // initialise customer schemes
        _.each(customer.schemes, (item) => {
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
    * upload image
    * */
    async uploadImage(customer_id = null) {
        const formData = new FormData();

        formData.append('image', this.profile.image);

        const response = this.form.submit('post', route('api.reception.customers.upload-image', customer_id).relative(),
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
