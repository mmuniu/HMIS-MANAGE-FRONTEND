import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './DirectOrderRepository';
import { _ } from 'vue-underscore';

export default class DirectOrder extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.record = null;

        this.saved = false;

        this.batch = null;
    }

    /*
     * Save the product
     */
    async save() {
        this.saved = false;

        const response = await this.form.submit('post', `/api/inventory/store/${this.store_id}/direct-order`, this.getFields());

        this.saved = true;

        this.batch = response.data;

        this.setFields(fields);

        flash({ alert: 'success', message: 'Success' });

        window.location.href = '/inventory/goods-received-notes/' + this.batch.id;
    }

    /*
     * Add a new product to the list of products
     */
    addToCart(product) {
        /* if(_.findWhere(this.products, { product_id: product.id })) {
            flash({
                alert: "info",
                message: "Item already exists in list"
            });
            return;
        }*/
        this.products.unshift({
            product_id: product.id,
            product: product.id,
            name: product.name,
            package_size: 1,
            quantity: 1,
            bonus: 0,
            expiry_date: null,
            cost: 1,
            unit_cost: 1,
            discount: 0,
            tax: 0,
            total: 1,
        });
    }

    /*
     * Remove an item from the cart and request
     */
    removeFromCart(product) {
        this.products.splice(this.products.indexOf(product), 1);
    }

    /*
     * Calculate the total of an entry
     */
    calculateTotal(item) {
        const index = this.products.indexOf(item);

        if (this.products[index].package_size && this.products[index].quantity && this.products[index].cost) {
            const total = (this.products[index].quantity * this.products[index].cost);
            const discount = (this.products[index].discount / 100) * total;
            const tax = (this.products[index].tax / 100 ) * (total - discount);
            this.products[index].total = total - discount + tax;
            const total_quantity = parseInt(this.products[index].quantity) + parseInt(this.products[index].bonus);

            this.products[index].unit_cost = this.products[index].total / (this.products[index].package_size * total_quantity);

            this.calculateCartTotal();
        }
    }

    /*
     * Calculate the cart total
     */
    calculateCartTotal() {
        this.amount = _.pluck(this.products, 'total').reduce((next, current) => {
            return next + current;
        });
    }
}
