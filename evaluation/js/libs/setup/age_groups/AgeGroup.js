import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './AgeGroupRepository';
import { _ } from 'vue-underscore';

export default class AgeGroup extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Store the data into persistence
     */
    save() {
        const data = this.getFields();

        this.form.submit('post', route('api.evaluation.age-groups.store'), data)
            .then((response) => {
                flash(response);
                this.resetFields(fields);
            });
    }


    update(data) {
        this.loader = true;
        axios.patch(`/api/evaluation/age-groups/${data.id}`, data)
            .then((response) => {
                flash(response);
                this.resetFields(fields);
            });
    }

    /*
     * Update the lab test category
     */


    /*
     * Assemble a category to match the form fields
     */
    assemble(additive) {
        additive = JSON.parse(additive);

        _.each(fields, (value, key) => {
            this[key] = additive[key];
        });
    }
}
