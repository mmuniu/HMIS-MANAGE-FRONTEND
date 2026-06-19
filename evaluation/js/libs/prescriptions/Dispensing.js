import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./DispensingRepository";

export default class Dispensing extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.dispensedPrescriptions = null;
    }

    /*
     * Dispense drugs
     */
    save(data) {
        this.form.submit("post", "/evaluation/patients/evaluate/pharmacy/dispense", data).then((response) => {
            flash({ message: "dispensed", alert: "success" });

            return window.location.reload(true);
        });
    }

    dispensed(visitId) {
        this.form.submit("get", `/api/evaluation/dispensed/visit/${visitId}`).then((response) => {
            this.dispensedPrescriptions = response.data;
        });
    }
}
