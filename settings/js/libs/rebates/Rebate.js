/**
 * Created by PhpStorm.
 * User: lexxyungcarter
 * Date: 2019-04-15
 * Time: 23:11
 */

import Base from "@app/libs/Base";
import Form from "@app/libs/Form";

import { fields } from "./RebateRepository";

export default class Rebate extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.saved = false;

        this.rebates = null;
    }

    /**
     * get all rebates
     */
    get() {
        this.form.submit("get", route("api.settings.rebates.index")).then((response) => {
            this.rebates = response;
        });
    }

    /**
     * save a new rebate
     */
    save() {
        const data = this.getFieldsExcept(["saved", "rebates", "form"]);
        this.saved = false;

        this.form.submit("post", route("api.settings.rebates.store").relative(), data).then((response) => {
            this.saved = true;

            flash(response);
        });
    }

    /**
     * save a new rebate
     */
    update(id) {
        const data = this.getFieldsExcept(["saved", "rebates", "form"]);
        this.saved = false;

        this.form.submit("put", route("api.settings.rebates.update", id).relative(), data).then((response) => {
            this.saved = true;

            flash(response);
        });
    }
}
