import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./PlantRepository";
import { _ } from "vue-underscore";

export default class Plant extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.plant_id = null;
    }

    /*
     * Save a plant into the database
     */
    save() {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("post", "/api/dialysis/plants", data).then((response) => {
            this.setFields(fields);

            flash(response);
        });
    }

    /*
     * Update a plant in the database
     */
    update() {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("patch", `/api/dialysis/plants/${this.plant_id}`, data).then((response) => {
            flash(response);
        });
    }

    /*
     * Find a plant from the database
     */
    assemble(isPlant) {
        const plant = JSON.parse(isPlant);

        this.plant_id = plant.id;

        _.each(fields, (value, key) => {
            this[key] = plant[key];
        });
    }
}
