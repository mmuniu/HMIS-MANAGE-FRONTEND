import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./TaxCategoryRepository";

export default class TaxCategory extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save the product
     */
    save() {
        const data = this.getFields();

        this.form.submit("post", "/api/inventory/tax-categories", data).then((response) => {
            this.setFields(fields);

            flash(response);
        });
    }

    /*
     * Update a tax category in the database
     */
    update() {
        const data = this.getFields();

        this.form.submit("patch", `/api/inventory/tax-categories/${this.tax_category_id}`, data).then((response) => {
            flash(response);
        });
    }

    /*
     * Initialise the fields with a tax category
     */
    assemble(isTaxCategory) {
        const taxCategory = JSON.parse(isTaxCategory);

        _.each(fields, (value, key) => {
            this[key] = taxCategory[key];
        });

        this.tax_category_id = taxCategory.id;
    }
}
