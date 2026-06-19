import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./AdministerDrugsRepository.js";
import { _ } from "vue-underscore";

export default class Store extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.record = null;
    }

    /*
     * Save the record
     */
    save() {
        const data = {
            prescriptions: _.pick(this.prescriptions, function(drug) {
                if (drug.administered && drug.selected) {
                    return drug;
                }
            }),
        };

        this.form.submit("post", route("api.inpatient.administer-drugs"), data).then((response) => {
            flash(response);
        });

        window.location.reload();
    }

    checkValidity(item) {
        const index = this.prescriptions.indexOf(item);

        if (this.prescriptions[index].administered > this.prescriptions[index].max) {
            this.prescriptions[index].administered = this.prescriptions[index].max;
        }
    }
}
