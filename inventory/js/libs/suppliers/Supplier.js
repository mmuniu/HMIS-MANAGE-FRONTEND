import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./SupplierRepository";
import _ from "lodash";

export default class Supplier extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * save a new supplier to the provided backed
     */
    async store() {
        const data = this.getFields();

        const response = await this.form.submit("post", "/api/inventory/suppliers", data);

        this.setFields(fields);

        flash(response);
    }

    /*
     * save a new supplier to the provided backed
     */
    async show(supplierId) {
        const response = await this.form.submit("get", `/api/inventory/suppliers/${supplierId}`);

        _.each(fields, (value, key) => {
            this[key] = response[key];
        });
    }
}
