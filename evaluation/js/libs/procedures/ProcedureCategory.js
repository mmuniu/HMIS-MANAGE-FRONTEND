import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./ProcedureCategoryRepository";

export default class ProcedureCategory extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /**
     * save a new procedure category
     */
    store() {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("post", route("api.evaluation.procedures.categories.store").relative(), data).then((response) => {
            flash(response);
        });
    }

    /**
     * update a new procedure category
     */
    update() {
        const id = this.info.id;
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("put", route("api.evaluation.procedures.categories.update", id).relative(), data).then((response) => {
            flash(response);
        });
    }
}
