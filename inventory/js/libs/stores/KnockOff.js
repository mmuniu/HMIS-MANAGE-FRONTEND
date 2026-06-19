import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./KnockOffRepository";
import { _ } from "vue-underscore";

export default class KnockOff extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Add a new product to the list of products
     */
    addItem(product) {
        const exists = _.findWhere(this.items, {
            product_id: product.id,
        });

        if (exists) {
            flash(this.meta.in_cart);
            return;
        }

        this.items.unshift({
            product_id: product.id,
            quantity: 1,
            reason: null,
            name: product.name,
        });
    }

    /*
     * Remove an item from the cart and request
     */
    removeItem(product) {
        this.items.splice(this.items.indexOf(product), 1);
    }

    /*
     * Send items to knock off to backend
     */
    execute(storeId) {
        const url = `/api/inventory/store/${storeId}/knock-off`;

        this.form.submit("post", url, this.getFields())
            .then( (response) => {
                this.items = [];
                flash(response);
            })
            .catch( (error) => {

            });
    }
}
