import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./ResultGroupRepository";

export default class ResultGroup extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    async save() {
        const data = this.getFieldsExcept(["form"]);

        const response = await this.form.submit("post", "/api/evaluation/investigationResults/result-analytics/groups", data);

        if (response) {
            flash(response);

            return response;
        }
    }
}
