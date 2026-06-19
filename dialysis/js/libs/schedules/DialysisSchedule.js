import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./DialysisScheduleRepository";

export default class DialysisSchedule extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);

        this.selectedSchedule = null;
    }

    /*
     * Select a specific schedule from the database
     */
    find(scheduleId) {
        this.form.submit("get", `/api/dialysis/schedules/${scheduleId}`).then((response) => {
            this.selectedSchedule = response;
        });
    }

    /*
     * Book an appointment and save it into the database
     */
    save() {
        const data = this.getFieldsExcept(["days", "ward", "selectedSchedule"]);

        this.form.submit("post", "/api/dialysis/schedules", data).then((response) => {
            this.setFields(fields);

            flash(response);
        });
    }
}
