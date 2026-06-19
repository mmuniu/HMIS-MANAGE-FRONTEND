import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./InternalOrderRepository";
import { _ } from "vue-underscore";

export default class InternalOrder extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Add a new product to the list of products
     */
    addToCart(item) {
        const itemExistsInCart = _.findWhere(this.items, { product_id: item.product_id });

        if (itemExistsInCart) {
            flash(this.meta.in_cart);
            return;
        }

        this.items.unshift({
            product_id: item.product_id,
            name: item.name,
            quantity: 1,
            store_product_id: item.id,
        });
    }

    /*
     * Remove an item from the cart and request
     */
    removeFromCart(product) {
        this.items.splice(this.items.indexOf(product), 1);
    }

    /*
    * cancel order
    * */
    cancelInternalOrder(order, storeId) {
        this.form.submit("post", `/api/inventory/store/${storeId}/internal-orders/cancel-order`, { order_id: order.id, cancel: true })
            .then((response) => {
                flash(response);
            });
    }

    /*
    * undo cancel order
    * */
    undoOrderCancel(order, storeId) {
        this.form.submit("post", `/api/inventory/store/${storeId}/internal-orders/cancel-order`, { order_id: order.id, cancel: false })
            .then((response) => {
                flash(response);
            });
    }

    /*
     * Stores an order that has been made to a store
     */
    async store(storeId) {
        const response = await this.form.submit("post", `/api/inventory/store/${storeId}/internal-orders`, this.getFields());

        this.setFields(fields);

        this.items = [];

        flash(response);
    }
}
