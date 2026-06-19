import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./MapMachineCodesRepository";
import { _ } from "vue-underscore";

export default class MapMachineCodes extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Store the data into persistence
     */
    save() {
        const data = this.getFields();

        return this.form.submit("post", route("api.evaluation.map-machine-codes-to-system-procedures.store", this.machine_id), data)
            .then((response) => {
                flash(response);
                this.resetFields(fields);
            });
    }

    /*
    * remove procedure mapping
    * */
    removeProcedureMapping(mapping) {
        return this.form.submit("post", route("api.evaluation.map-machine-codes-to-system-procedures.remove"), mapping)
            .then((response) => {
                flash(response);
                this.resetFields(fields);
            });
    }
}
