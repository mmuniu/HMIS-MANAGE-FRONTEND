import Base from '@app/libs/Base';
import Form from '@app/libs/Form';
import { fields } from './PurchaseOrderRepository';

export default class Store extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.record = null;
    }

    /*
     * Save the purchase order
     */
    async save() {
        const data = this.getFields();

        const response = await this.form.submit('post', route('api.inventory.purchase-orders-store'), data);

        if (response) {
            flash(response);

            return response;
        }
    }

    /*
    * update goods received
    * */
    updateGoodsReceived(item) {
       /* if (item.delivered > item.receiving) {
            flash({
                message: 'You can\'t receive more than ordered, place the extra items as bonus',
                alert: 'error',
            });

            item.delivered = item.receiving;
        }*/
        const index = this.details.indexOf(item);
        const order = this.details[index];

        const total = (order.delivered * order.pack_size * order.unit_cost);
        const discount = (order.discount / 100) * total;
        const tax = (order.tax / 100 ) * (total - discount);

        order.price = Math.round(((total - discount) + tax) * 100) / 100;
        order.receiving = (parseInt(order.delivered) + parseInt(order.bonus)) * parseInt(order.pack_size);
        // let total_quantity = parseInt(order.delivered) + parseInt(order.bonus);

        // order.unit_cost = order.total  / (order.pack_size * total_quantity);

        this.getGrandTotal();
    }

    /*
    * receive goods
    */
    async receive(orderData) {
        const response = await this.form.submit('post', route('api.inventory.purchase-orders-receive-store'), orderData);

        if (response) {
            return response;
        }
    }

    /*
    * let's prepare to receive the items
    * */
    async receiveGoods() {
        const data = {
            productsReceived: _.map(this.details, function(ord) {
                return {
                    product_id: ord.product.id,
                    ordered_quantity: ord.packs,
                    received_quantity: ord.delivered,
                    bonus: ord.bonus,
                    discount: ord.discount,
                    tax: ord.tax,
                    unit_cost: ord.unit_cost,
                    receiving_price: ord.price,
                    pack_size: ord.pack_size,
                    expiry_date: ord.expiry_date,
                };
            }),
            purchaseOrderId: this.purchase_order_id,
            store_id: this.store_id,
            comment: this.comment,
        };
        const response = await this.receive(data);

        if (response) {
            this.dialog = false;

            flash(response);

            return response;
        }
    }

    /*
    * calculate the grand total
    * */
    getGrandTotal() {
        let total = 0;

        _.map(this.details, function(product) {
            total = total + parseFloat(product.total);
        });

        return Math.round(total * 100) / 100;
    }

    /*
    * print purchase order or lpo
    * */
    printOrder(purchaseOrdeId) {
        window.open('/inventory/purchase-orders/' + purchaseOrdeId + '/print', '_blank');
    }

    /*
    * print requisition: this will get you lpo without prices
    * */
    printRequisition(purchaseOrdeId) {
        window.open('/inventory/purchase-orders/' + purchaseOrdeId + '/print?is_requisition=true', '_blank');
    }

    /*
    * print goods received note
    * */
    printGoodsReceived(purchaseOrdeId) {
        window.open('/inventory/goods-received-notes/' + purchaseOrdeId + '/print', '_blank');
    }

    /*
    * make necessary calculations
    */
    adjustCalculations(item) {
        const index = this.details.indexOf(item);
        this.details[index].quantity = this.details[index].packs * this.details[index].pack_size;
        this.details[index].total = this.details[index].packs * this.details[index].pack_cost;
        this.details[index].unit_cost =this.details[index].total / this.details[index].quantity;
    }

    /*
     * Remove an item from list
     */
    removeItem(product) {
        this.details.splice(this.details.indexOf(product), 1);
    }

    /*
    * approve lpo
    * */
    async approveLpo(purchaseOrderId, data) {
        const response = await this.form.submit('post', `/api/inventory/purchaseOrders/${purchaseOrderId}/approve`, data);

        if (response) {
            flash(response);

            return response;
        }
    }

    /*
    * approve lpo
    * */
    async rejectLpo(purchaseOrderId, data) {
        const response = await this.form.submit('post', `/api/inventory/purchaseOrders/${purchaseOrderId}/reject-lpo`, data);

        if (response) {
            flash(response);

            return response;
        }
    }

    assemble (order) {
        this.supplier_id = order.supplier.id;
        this.payment_term_id = order.payment_term_id;
        this.payment_mode_id = order.payment_mode_id;
        this.delivery_date = order.delivery_date;
        this.comment = order.comment;

        order.details.forEach((detail) => this.details.push({
            name: detail.product.name,
            pack_size: detail.pack_size,
            packs: detail.packs, // packages
            quantity: detail.quantity,
            pack_cost: (detail.pack_size * detail.unit_cost),
            unit_cost: detail.unit_cost,
            cost: detail.price,
            total: ((detail.pack_size * detail.unit_cost) * detail.packs),
            product_id: detail.product.id,
        }));
    }
}
