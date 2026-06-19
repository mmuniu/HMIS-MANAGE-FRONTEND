import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./DialysisPatientRepository";

export default class DialysisPatient extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Save the details of a new dialysis session
     */
    save() {
        const data = this.getFields();

        this.form.submit("post", route("api.dialysis.patients.store"), data).then((response) => {
            
            this.resetFields(fields);
            flash(response);

        });
    }
    addFrequency(schedule) {
        const data = schedule;
        //here set the schedulee_id, days and hours from the schedule
        data.schedule_id = schedule.schedule_id;
        data.days = schedule.days_per_week;
        data.hours = schedule.hours_per_session;
       

        return this.form.submit("post", route("api.dialysis.patients.addFrequency"), data)
        .then((response) => {
            flash(response);
            return response; // Return response to the caller
        });
    }


    /*
     * Remove a patient from the dialysis list
     */
    destroy() {
        const data = this.getFields();

        this.form.submit("delete", route("api.dialysis.patients.destroy", this.patient_id), data).then((response) => {
            flash(response);
        });
    }
}
