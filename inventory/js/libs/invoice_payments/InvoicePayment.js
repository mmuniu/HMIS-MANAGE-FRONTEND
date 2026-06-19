import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./InvoicePaymentRepository";

export default class InvoicePayment extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
    *
    * */
    totalAmount() {
        let total = 0;
        _.map(this.settlements, function(product) {
            total += parseFloat(product.amount);
        });

        return total;
    }

    /*
     * Store new records of invoice payments
     * In essence, pay for invoice settlements
     */
    async store() {
        const data = this.getFields(["settlements"]).map((item) => {
            return {
                "invoice_id": item.invoice_id,
                "amount": item.amount,
                "user_id": item.user_id,
            };
        });

        const response = await this.form.submit("post", route("api.inventory.invoice-payments.store"), data);

        flash(response);

        this.setFields(fields);
    }

    settleGroupedBill(statement, supplier_id, user_id) {
        this.form.submit("post", route("api.inventory.invoice-payments.settle-grouped-bill"), {
            statement: statement,
            supplier_id: supplier_id,
            user_id: user_id,
        })
            .then((response) => {
                flash(response);
            });
    }
}
