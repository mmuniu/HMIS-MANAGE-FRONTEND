/**
 * Created by PhpStorm.
 * User: jjoek
 * Date: 2019-10-24
 * Time: 11:56
 */

import Base from "@app/libs/Base";
import Form from "@app/libs/Form";

import { fields } from "./DepartmentsRepository";

export default class Departments extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /**
     * save a new rebate
     */
    save() {
        const data = this.getFields();

        return this.form.submit("post", route("api.settings.departments.store").relative(), data).then((response) => {
            flash(response);
            this.setFields(fields);
        });
    }

    /**
     * save a new rebate
     */
    update() {
        const data = this.getFields();

        return this.form.submit("post", route("api.settings.departments.update", this.id).relative(), data).then((response) => {
            flash(response);

            this.setFields(fields);
            this.id = null;
        });
    }

    assemble(department) {
        this.id = department.id;
        this.name = department.name;
        this.phone = department.phone;
        this.email = department.email;
        this.credit_limit = department.credit_limit.replace(/,/g, "");
    }
}
