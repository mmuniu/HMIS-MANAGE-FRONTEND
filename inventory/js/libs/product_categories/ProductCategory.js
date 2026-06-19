import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./ProductCategoryRepository";

export default class ProductCategory extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save the product
     */
    save() {
        const data = this.getFields();

        this.form.submit("post", "/api/inventory/product-categories", data).then((response) => {
            this.setFields(fields);

            flash(response);
        });
    }

    /*
     * Update a tax category in the database
     */
    update() {
        const data = this.getFields();

        this.form.submit("patch", `/api/inventory/product-categories/${this.id}`, data).then((response) => {
            flash(response);
        });
    }

    /*
     * Initialise the fields with a tax category
     */
    assemble(isProductCategory) {
        const productCategory = JSON.parse(isProductCategory);

        _.each(fields, (value, key) => {
            if (key === "parent_id") {
                this[key] = productCategory.parent.id;
            } else {
                this[key] = productCategory[key];
            }
        });
    }
}
