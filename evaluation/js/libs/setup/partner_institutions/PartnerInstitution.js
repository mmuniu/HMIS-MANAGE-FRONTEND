import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./PartnerInstitutionRepository";
import { _ } from "vue-underscore";

export default class PartnerInstitution extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    /*
     * Store the data into persistence
     */
    save() {
        const data = this.getFields();

        this.form.submit("post", route("api.settings.partner-institutions.store").relative(), data)
            .then((response) => {
                flash(response);
                this.resetFields(fields);
            });
    }

    /*
     * Update the lab test category
     */
    update(id) {
        const data = this.getFields();

        this.form.submit("patch", `/api/settings/partner-institutions/${id}`, data).then((response) => {
            flash(response);
        });
    }

    /*
    * add staff to institution
    * */
    addStaff(id) {
        const data = this.getFields();

        console.log(data);

        return this.form.submit("post", `/api/settings/partner-institutions/${id}/staff`, data.staff).then((response) => {
            flash(response);
        });
    }

    /*
    * update staff data
    * */
    updateSatff(id) {
        const data = this.getFields();

        return this.form.submit("post", `/api/settings/partner-institutions/${id}/staff/update`, data.staff).then((response) => {
            flash(response);
        });
    }

    /*
     * Assemble a category to match the form fields
     */
    assemble(partner) {
        _.each(fields, (value, key) => {
            this[key] = partner[key];
        });
    }

    assembleMember(staff, institution_id) {
        if (staff) {
            this.staff.email = staff.email;
            this.staff.full_name = staff.full_name;
            this.staff.mobile = staff.mobile;
            this.staff.salutation = staff.salutation;
            this.staff.institution_id = institution_id;
            this.staff.position = staff.position;
            this.staff.postal_address = staff.postal_address;
            this.staff.id = staff.id;
        } else {
            this.staff.email = null;
            this.staff.full_name = null;
            this.staff.mobile = null;
            this.staff.salutation = null;
            this.staff.institution_id = null;
            this.staff.position = null;
            this.staff.postal_address = null;
        }
    }
}
