/**
 * Created by PhpStorm.
 * User: jjoek
 * Date: 2019-10-24
 * Time: 11:56
 */

import Base from "@app/libs/Base";
import Form from "@app/libs/Form";

import { fields } from "./RegionsRepository";

export default class Regions extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /**
     * save a new rebate
     */
    async save() {
        const data = this.getFields();

        const response = await this.form.submit("post", route("api.settings.regions.store").relative(), data);

        if (response) {
            this.setFields(fields);

            flash(response);

            return response;
        }
    }
}
