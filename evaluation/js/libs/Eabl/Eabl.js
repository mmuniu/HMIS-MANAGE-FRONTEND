import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from './EablRepository';

export default class Eabl extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    async save (data) {
        const response = await this.form.submit('post', `/api/evaluation/self-assessment/${data.visit_id}`, data)

        if(response) {
            flash(response);

            return response;
        }
    }
}
