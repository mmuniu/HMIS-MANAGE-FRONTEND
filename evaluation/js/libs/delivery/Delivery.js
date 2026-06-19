import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./DeliveryRepository";

export default class Delivery extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /**
     * save details
     */
    save() {
        const data = this.getFieldsExcept(["form"]);

        this.form.submit("post", "/api/evaluation/investigationResults/queue-for-delivery", data).then((response) => {
            flash(response);

            window.location.reload();
        });
    }

    /*
    * save signature
    * */
    saveSignature(data) {
        this.form.submit("post", "/api/evaluation/result-deliveries/sign-delivery", data).then((response) => {
            flash(response);

            window.location.reload();
        });
    }

    /*
    * remove from queue
    * */
    removeFromQueue(result) {
        this.form.submit("post", "/api/evaluation/result-deliveries/detach-result-from-queue/" + result.id).then((response) => {
            flash(response);
        });
    }
}
