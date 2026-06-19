import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './SummaryRepository';


export default class Admission extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.saved = false;

        this.generatedIpNuber = false;
    }


    async save() {
        const data = this.getFieldsExcept(['form', 'result']);
        this.saved = false;

        const url = `/inpatient/evaluations/${data.visit_id}/partograph`;

        const response = await this.form.submit('post', `${url}`, data);
        if (response.data === true) {
            flash({
                message: 'Data recorded successfully',
                alert: 'success'
            });
        }
    }
}

