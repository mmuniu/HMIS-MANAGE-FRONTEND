import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./InvoiceRepository";

export default class Invoice extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Generates a report showing all balances by the suppliers
     */
    async generate() {
        const response = await this.form.submit("post", route("api.inventory.invoices.generate"), {});
    }
}
