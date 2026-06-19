/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-04-25
 * Time: 05:49
 */
import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./PendingProcedureRepository";

export default class PendingProcedure extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.saved = false;

        this.procedures = null;
    }

    get(page = 1) {
        this.form.submit("get", route("api.inpatient.pending-procedures.index").relative() + `?page=${page}`).then((response) => {
            this.procedures = response;
        });
    }

    save() {
        const data = this.getFields("approval");
        this.saved = false;

        this.form.submit("post", route("api.inpatient.pending-procedures.store").relative(), data).then((response) => {
            this.saved = true;

            flash(response);
        });
    }

    reset() {
        this.is_approved = false;
        this.status_id = null;
        this.investigation_id = null;
        this.approval_price = null;
        this.approval_amount = null;
        this.reason = null;
    }
};

