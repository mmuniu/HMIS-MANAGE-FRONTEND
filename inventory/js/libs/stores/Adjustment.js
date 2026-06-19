import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./AdjustmentRepository";

export default class Adjustment extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save the product
     */
    save() {
        this.form.submit("post", "/api/inventory/adjust-stock", this.getFields())
            .then( (response) => {
                this.setFields(fields);

                flash(response);
            });
    }
}
