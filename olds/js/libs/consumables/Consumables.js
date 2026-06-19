import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./ConsumablesRepository.js";
import { _ } from "vue-underscore";

export default class Store extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save the record
     */
    save() {
        const data = this.getFields();

        return this.form.submit("post", route("api.evaluation.consumable-store"), data).then((response) => {
            this.setFields(fields, ['store_id']);

            flash(response);
        });
    }

    /*
     * Save the record
     */
    async update(id, providedData = null) {
        const data = providedData ? providedData : this.getFields();

        const response = await this.form.submit("patch", route("api.evaluation.consumable-update", id), data);

        flash(response);

        return response;
    }

    /*
     * Save the record
     */
    cancelConsumable(data) {
        return this.form.submit("patch", route("api.evaluation.consumable-cancel", data.id), data).then((response) => {
            flash(response);
        });
    }

    /*
    * get payment mode
    * */
    async getPaymentMode(visitId) {
        const response = await this.form.submit("get", `/api/reception/visit/${visitId}`);

        if (response) {
            console.log(response);
        }
    }
}
