import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./WardRepository";
import { _ } from "vue-underscore";

export default class Ward extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.ward_id = null;
    }

    /*
     * Save a ward into the database
     */
    save() {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("post", "/api/dialysis/wards", data).then((response) => {
            this.setFields(fields);

            flash(response);
        });
    }

    /*
     * Update a ward in the database
     */
    update() {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("patch", `/api/dialysis/wards/${this.ward_id}`, data).then((response) => {
            flash(response);
        });
    }

    /*
    * Find a plant from the database
    */
    assemble(isWard) {
        const ward = JSON.parse(isWard);

        this.ward_id = ward.id;

        _.each(fields, (value, key) => {
            this[key] = ward[key];
        });
    }
}
