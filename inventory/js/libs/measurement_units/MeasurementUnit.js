import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./MeasurementUnitRepository";

export default class MeasurementUnit extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save the measurement unit
     */
    save() {
        const data = this.getFields();

        this.form.submit("post", "/api/inventory/measurement-units", data).then((response) => {
            this.setFields(fields);

            flash(response);
        });
    }

    /*
     * Update a measurement unit in the database
     */
    update() {
        const data = this.getFields();

        this.form.submit("patch", `/api/inventory/measurement-units/${this.id}`, data).then((response) => {
            flash(response);
        });
    }

    /*
     * Initialise the fields with a tax category
     */
    assemble(isMeasurementUnit) {
        const measurementUnit = JSON.parse(isMeasurementUnit);

        _.each(fields, (value, key) => {
            this[key] = measurementUnit[key];
        });
    }
}
