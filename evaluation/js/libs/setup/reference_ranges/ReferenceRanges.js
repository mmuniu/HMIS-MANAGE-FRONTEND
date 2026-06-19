import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./ReferenceRangesRepository.js";
import { _ } from "vue-underscore";

export default class ReferenceRanges extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Store the data into persistence
     */
    save() {
        const data = this.getFields();

        this.form.submit("post", route("api.evaluation.reference-ranges.store"), data)
            .then((response) => {
                flash(response);
                this.resetFields(fields);
            });
    }

    destroy(range) {
        this.form.submit("delete", route("api.evaluation.reference-ranges.destroy", range))
            .then((response) => {
                flash(response);
            });
    }

    /*
     * Update the lab test category
     */
    update(reference_range_id) {
        const data = this.getFields();

        this.form.submit("patch", route("api.evaluation.reference-ranges.update", reference_range_id), data)
            .then((response) => {
                flash(response);
                this.resetFields(fields);
            });
    }

    editReferenceRange(range) {
        this.procedure_id = range.procedure.id,
        this.gender = range.gender,
        this.age_group_id = range.age_group.id,
        this.type = range.type,
        this.flag = range.flag,
        this.lower = range.lower,
        this.upper = range.upper,
        this.text_reference = range.text_reference,
        this.lg_value = range.lg_value,
        this.lg_type = range.lg_type,
        this.parent_procedure_id = range.parent_procedure.id,
        this.title_id = range.title ? range.title.id : null;
        this.is_normal_range = !!range.is_normal_range;
    }
}
