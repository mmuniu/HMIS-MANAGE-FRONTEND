/**
 * Created by: jjoek
 * On:  07 Nov, 2020
 */
import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from './SystemsReviewRepository';

export default class SystemsReview extends Base
{
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.visit_id = null;
    }

    /*
    * save data
    * */
    async saveData(type) {

        const data = this.onlyGet([type]);

        const response =  await this.form.submit('post', route('api.evaluation.systems_review.store', this.visit_id), data);

        if(response) {
            flash(response);

            return response;
        }
    }

    assemble(val) {
        _.each(val, (value, key) => {
            if(value !== null) {
                this[key] = val[key];
            }
        });
    }

}
