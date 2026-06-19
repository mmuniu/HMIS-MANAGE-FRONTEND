import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './ServiceChargeRepository';

export default class ServiceCharge extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save a new charge to the database
     */
    save() {
        const data = this.getFieldsExcept(['form']);

        this.form.submit('post', '/api/finance/service-charges', data).then((response) => {
            flash(response);

            this.setFields(fields);
        });
    }

    /*
     * Update a charge in the database
     */
    update() {
        const data = this.getFieldsExcept(['form']);

        this.form.submit('patch', `/api/finance/service-charges/${this.charge_id}`, data).then((response) => {
            flash(response);
        });
    }

    /*
     * Initialise the form fields with details from a patient object
     * useful on patient edit
     */
    populate(charge) {
        charge = JSON.parse(charge);

        this.charge_id = charge.id;

        _.each(charge, (value, key) => {
            this[key] = charge[key];
        });
    }
}
