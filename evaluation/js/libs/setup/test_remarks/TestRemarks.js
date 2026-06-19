import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./TestRemarksRepository.js";
import { _ } from "vue-underscore";

export default class TestRemarks extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Store the data into persistence
     */
    save() {
        const data = this.getFields();

        this.form.submit("post", route("api.evaluation.test-remarks.store"), data)
            .then((response) => {
                flash(response);
                // this.resetFields(fields);
            });
    }

    destroy(remark_id) {
        this.form.submit("delete", route("api.evaluation.test-remarks.destroy", remark_id))
            .then((response) => {
                flash(response);
            });
    }

    /*
     * Update the lab test category
     */
    updateRemark(remark_id) {
        const data = this.getFields();

        this.form.submit("patch", route("api.evaluation.test-remarks.update", remark_id), data)
            .then((response) => {
                flash(response);
                this.resetFields(fields);
            });
    }

    editRemark(remark) {
        this.procedure_id = remark.procedure.id;
        this.gender = remark.gender;
        this.age_group_id = remark.age_group.id;
        this.title = remark.title;
        this.remark = remark.remark;
    }
}
