import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./RequisitionRepository";

export default class Requisition extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.isRequisition = null;
    }

    /*
     * Save a new requisition request to the database
     */
    async save() {
        const data = this.getFields();

        const response = await this.form.submit("post", "/api/inventory/requisitions", data);

        if (response) {
            this.resetFields(fields);

            flash(response);

            return response;
        }
    }

    /*
     * Fetch a single requisition from the database
     */
    find(requisitionId) {
        this.form.submit("get", `/api/inventory/requisitions/${requisitionId}`).then((response) => {
            this.isRequisition = response;

            this.isRequisition.details.forEach((detail) => {
                this.details[detail.id] = {
                    quantity_approved: detail.quantity_approved ? detail.quantity_approved : detail.quantity_requested,
                };
            });
        });
    }

    /*
     * Approve a requisition
     */
    async approve(requisitionId, data) {
        const response = await this.form.submit("patch", `/api/inventory/requisitions/${this.isRequisition.id}/approve`, data);

        if (response) {
            flash(response);

            return response;
        }
    }

    async rejectRequisition(reason) {
        const data = {
            comment: reason, // for approval recording,
            rejected: true,
        };

        const response = await this.form.submit("post", `/api/inventory/requisitions/${this.isRequisition.id}/reject`, data);

        if (response) {
            flash(response);

            return response;
        }
    }

    /*
    * generate a purchase order
    * */
    async generatePurchaseOrder(data) {
        const response = await this.form.submit("post", `/api/inventory/requisitions/${data.requisition_id}/raise-lpo`, data);

        if (response) {
            flash(response);

            return response;
        }
    }
}
