import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import _ from "lodash";


export default class Schedule extends Base {
    constructor() {
        super(fields);
        this.form = new Form(fields);
    }

    index() {
        this.form.submit("get", route("api.theatre.schedules/index").relative()).then((response) => {
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
     * check for existing booking
     * @param visitId
     */
    findForVisit(visitId) {
    
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
