import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./EvaluatorRepository";

export default class Evaluator extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.content = null;
    }

    /*
     * Save user into the database
     */
    save(visitId, item) {
        const data = this.getFields(item);

        this.form.submit("post", `/api/dialysis/evaluate/${visitId}/${item}`, data).then((response) => {
            this.setFields(fields);

            flash({
                "message": `${item} details saved`,
                "alert": "green",
            });
        });
    }

    /*
     * Fetch the data/content to be presented on a page
     */
    fetch(visitId, item) {
        this.form.submit("get", `/api/dialysis/evaluate/${visitId}/${item}`).then((response) => {
            this.content = response;

            this.form.submitted = false;
        });
    }
}
