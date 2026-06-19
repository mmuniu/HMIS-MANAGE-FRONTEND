import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./ApprovalLevelsRepository";

export default class ApprovalLevels extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.record = null;
    }

    saveLevel() {
        const data = this.getFields();

        this.form.submit("post", route("api.inventory.approval-levels.store"), data).then((response) => {
            flash(response);
        });
    }

    removeLevel(levelId) {
        this.form.submit("delete", route("api.inventory.approval-levels.destroy", levelId)).then((response) => {
            flash(response);
        });
    }
}
