import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { _ } from "vue-underscore";
import { fields } from "./QueueRepository";

export default class Queue extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    async recordOperatingStore(stores) {
        const data = {
            selected_stores: stores,
        };

        const response = await this.form.submit("post", "/api/evaluation/save-operating-stores", data);

        flash(response);

        return response;
    }
}
