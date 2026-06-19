import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./WardTypeRepository";
import { _ } from "vue-underscore";

export default class WardType extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.ward_type_id = null;
    }

    /*
     * Save a ward into the database
     */
    save() {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("post", "/api/dialysis/ward-types", data).then((response) => {
            this.setFields(fields);

            flash(response);
        });
    }

    /*
     * Update a ward in the database
     */
    update() {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("patch", `/api/dialysis/ward-types/${this.ward_type_id}`, data).then((response) => {
            flash(response);
        });
    }

    /*
    * Find a plant from the database
    */
    assemble(isWardType) {
        const wardType = JSON.parse(isWardType);

        this.ward_type_id = wardType.id;

        _.each(fields, (value, key) => {
            this[key] = wardType[key];
        });
    }
}
