import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./LabTestUnitRepository";
import { _ } from "vue-underscore";

export default class LabTestUnit extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Store the data into persistence
     */
    save() {
        const data = this.getFields();

        this.form.submit("post", route("api.evaluation.lab-test-units.store"), data)
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

        this.form.submit("patch", `/api/evaluation/lab-test-units/${this.unit_id}`, data).then((response) => {
            flash(response);
        });
    }

    /*
     * Assemble a category to match the form fields
     */
    assemble(unit) {
        unit = JSON.parse(unit);

        _.each(fields, (value, key) => {
            this[key] = unit[key];
        });
    }
}
