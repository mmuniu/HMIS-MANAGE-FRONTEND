import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./MachineRepository";
import { _ } from "vue-underscore";

export default class Machine extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.machine_id = null;
    }

    /*
     * Save a plant into the database
     */
    save() {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("post", "/api/dialysis/machines", data).then((response) => {
            this.setFields(fields);

            flash(response);
        });
    }

    /*
     * Update a plant in the database
     */
    update() {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("patch", `/api/dialysis/machines/${this.machine_id}`, data).then((response) => {
            flash(response);
        });
    }

    /*
     * Find a plant from the database
     */
    assemble(isMachine) {
        const machine = JSON.parse(isMachine);

        this.machine_id = machine.id;

        _.each(fields, (value, key) => {
            this[key] = machine[key];
        });
    }
}
