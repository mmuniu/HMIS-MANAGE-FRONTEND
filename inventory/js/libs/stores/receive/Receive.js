import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./ReceiveRepository";

export default class Receive extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save the product
     */
    async store(storeId, orderId) {
        const raw_data = _.filter(this.getFields(["details"]), function(value) {
            return value.received <= 0;
        });

        const data = _.map(raw_data, (field) => {
            return {
                order_detail_id: field.order_detail_id,
                received: field.receiving,
                rejected: field.rejected,
                previous_quantity: field.previous_quantity,
                new_quantity: field.previous_quantity + field.received,
                reason: field.reason,
                received_by: field.received_by,
                product_id: field.product.id,
            };
        });

        console.log(data);

        const response = this.form.submit("post", `/api/inventory/store/${storeId}/order/${orderId}/receive`, data)
            .then((response) => {
                window.history.go(-1);
                window.reload();
            });

        return response;
    }
}
