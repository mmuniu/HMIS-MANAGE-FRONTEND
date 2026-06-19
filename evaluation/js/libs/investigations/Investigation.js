import Base from "@app/libs/Base";
import Form from "@app/libs/Form";

const fields = {};

export default class Vital extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.investigations = null;
    }

    /*
     * Get all the investigations given a type
     */
    fetch(type) {
        this.form.submit("get", `/api/evaluation/investigations/${type}`).then((response) => {
            this.investigations = response;
        });
    }

    /*
    * update an investigations info
    * */
    async updateProcedureInfo(id, data) {
        const response = await this.form.submit("post", `/api/evaluation/investigations/${id}/update`, data);

        if (response) {
            flash(response);

            return response;
        }
    }
}
