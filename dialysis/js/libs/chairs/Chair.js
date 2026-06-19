import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./ChairRepository";
import { _ } from "vue-underscore";

export default class Machine extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.chair_id = null;
    }

    /*
     * Save a plant into the database
     */
    save() {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("post", "/api/dialysis/chairs", data).then((response) => {
            this.setFields(fields);

            flash(response);
        });
    }

    /*
     * Update a plant in the database
     */
    update() {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("patch", `/api/dialysis/chairs/${this.chair_id}`, data).then((response) => {
            flash(response);
        });
    }

    /*
     * Find a plant from the database
     */
    assemble(isChair) {
        const chair = JSON.parse(isChair);

        this.chair_id = chair.id;

        _.each(fields, (value, key) => {
            this[key] = chair[key];
        });
    }
}
