import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./LabTestCategoryRepository";
import { _ } from "vue-underscore";

export default class LabTestCategory extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Store the data into persistence
     */
    save() {
        const data = this.getFields();

        this.form.submit("post", route("api.evaluation.lab-test-categories.store"), data)
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

        this.form.submit("patch", `/api/evaluation/lab-test-categories/${this.category_id}`, data).then((response) => {
            flash(response);
        });
    }

    /*
     * Assemble a category to match the form fields
     */
    assemble(isCategory) {
        const category = JSON.parse(isCategory);

        _.each(fields, (value, key) => {
            this[key] = category[key];
        });

        this.category_id = category.id;
    }
}
