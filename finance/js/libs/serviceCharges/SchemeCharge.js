import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './SchemeChargeRepository';

export default class SchemeCharge extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save a new charge to the database
     */
    save() {
        const data = this.getFieldsExcept(['form']);

        this.form.submit('post', '/api/finance/scheme-charges', data).then((response) => {
            flash(response);

            this.setFields(fields);
        });
    }
}
