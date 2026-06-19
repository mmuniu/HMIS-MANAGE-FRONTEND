import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./LabTestAdditiveRepository";
import { _ } from "vue-underscore";

export default class LabTestAdditive extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Store the data into persistence
     */
    save() {
        const data = this.getFields();

        this.form.submit("post", route("api.evaluation.lab-test-additives.store"), data)
            .then((response) => {
                flash(response);
                this.resetFields(fields);
            });
    }

    /*
     * Update the lab test category
     */
    update() {
        const data = this.getFields();

        this.form.submit("patch", `/api/evaluation/lab-test-additives/${this.additive_id}`, data).then((response) => {
            flash(response);
        });
    }

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
