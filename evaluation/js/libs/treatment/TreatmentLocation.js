import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./TreatmentLocationRepository";

export default class TreatmentLocation extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.type = null;
    }

    /*
     * Sets a prescription type as fetched from persistence - fetched by name
     */
    find(name) {
        this.form.submit("get", `/api/evaluation/treatment-locations/${name}`).then((response) => {
            this.type = response;
        });
    }
}
