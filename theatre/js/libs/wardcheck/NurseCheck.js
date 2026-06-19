import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./NurseRepository";
import _ from "lodash";


export default class NurseCheck extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    save() {
        const data = this.getFieldsExcept(["form"]);
        console.log(data)

        this.form.submit("post", route("api.theatre.nurse.check.store", [this.visit_id, "nurse", this.requested_facility_id]).relative(), data).then((response) => {
          alert(response);
          flash(response);

          setTimeout(() => {
            window.location.href = '/theatre/schedule';
        }, 2000);
        });
    }

    /**
     * check for existing booking
     * @param visitId
     */
    findForVisit(visitId) {
        this.form.submit("get", route("api.theatre.bookings.show-for-visit", visitId).relative()).then((response) => {
            if (response.data) {
                const fillup = {};

                _.each(fields, (item, key) => {
                    fillup[key] = response.data[key];
                });

                this.setFields(fillup);
            }
        });
    }

    /**
     * save a booking requirement
     */
    saveRequirement(bookingId, data) {
        this.form.submit("post", route("api.theatre.theatreRequirements.store", bookingId).relative(), data).then((response) => {
            flash(response);
        });
    }

    /**
     * remove a requirement
     */
    removeRequirement(type, id) {
        this.form.submit("delete", route("api.theatre.theatreRequirements.destroy", [type, id]).relative()).then((response) => {
            flash(response);
        });
    }
}
