import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./GoodsReceivedNotesRepository";

export default class Store extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.record = null;
    }

    addServiceCharge() {
        this.services.push({
            name: "",
            amount: "",
            index: this.services.length + 1,
        });
    }

    getTotalCost() {
        let total = 0;
        _.map(this.selected, function(product) {
            total += parseFloat(product.receiving_price);
        });

        _.map(this.services, function(service) {
            if (service.amount > 0) {
                total += parseFloat(service.amount);
            }
        });

        this.invoice.amount = Math.round(total * 100) / 100;

        return Math.round(total * 100) / 100;
    }

    validateAmount() {
        if (this.invoice.amount > this.getTotalCost()) {
            flash({
                message: "Invoice amount greater than the total amount " + this.getTotalCost(),
                alert: "error",
            });
            this.invoice.amount = this.getTotalCost();
            return false;
        } else if (this.invoice.amount < this.getTotalCost()) {
            flash({
                message: "Invoice amount less than the total amount " + this.getTotalCost(),
                alert: "error",
            });
            this.invoice.amount = this.getTotalCost();
            return false;
        } else {
            return true;
        }
    }

    attachInvoice(note) {
        if (this.validateAmount() && this.invoice.amount > 0 && this.invoice.number) {
            const formData = new FormData();
            formData.append("invoice_attachment", this.invoice.file);
            formData.append("number", this.invoice.number);
            formData.append("amount", this.invoice.amount);
            formData.append("balance", this.invoice.amount);
            formData.append("invoice_date", this.invoice.invoice_date);
            formData.append("due_date", this.invoice.due_date);
            formData.append("comments", this.invoice.comments);
            formData.append("services", JSON.stringify(this.services));
            formData.append("selected_products", JSON.stringify(this.selected));

            this.form.submit("post", route("api.inventory.goods-received-note.attach-invoice", note),
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            ).then((response) => {
                flash(response);

                window.location.reload();
            });
        } else {
            if (this.invoice.amount <= 0 ) {
                flash({
                    message: "The invoice amount cannot be zero",
                    alert: "error",
                });
            } else if (!this.invoice.number) {
                flash({
                    message: "Please indicate the number",
                    alert: "error",
                });
            }
        }
    }
}
