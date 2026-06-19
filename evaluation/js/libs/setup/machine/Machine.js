import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./MachineRepository";
import { _ } from "vue-underscore";

export default class LabTestUnit extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Store the data into persistence
     */
    save() {
        const data = this.getFields();

        return this.form.submit("post", route("api.evaluation.machine.store"), data)
            .then((response) => {
                flash(response);
                this.resetFields(fields);
            });
    }

    /*
     * Store the data into persistence
     */
    update() {
        const data = this.getFields();

        this.form.submit("post", route("api.evaluation.machine.update", this.id), data)
            .then((response) => {
                flash(response);
                this.resetFields(fields);

                window.location.href = "/evaluation/setup/machines";
            });
    }

    /*
    * re-assemble data for update
    * */
    assemble(machine) {
        this.machine_identifier = machine.machine_identifier;
        this.display_name = machine.display_name;
        this.id = machine.id;
        this.provider = machine.provider;
        this.provider_email = machine.provider_email;
        this.provider_mobile = machine.provider_mobile;
    }
}
