import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./ApprovalRepository";

export default class Approval extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /**
     * save details
     */
    save() {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("post", route("api.evaluation.approvals.store").relative(), data).then((response) => {
            flash(response);
        }).catch((error) => {
            if (error.hasOwnProperty("exception")) {
                flash({ alert: "error", message: error.exception });
            } else {
                flash(error);
            }
        });
    }
}
