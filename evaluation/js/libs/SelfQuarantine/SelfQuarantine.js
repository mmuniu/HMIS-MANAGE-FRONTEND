import Base from "@app/libs/Base";
import Form from "@app/libs/Form";
import { fields } from "./SelfQuarantineRepository";
import { _ } from "vue-underscore";

export default class SelfQuarantine extends Base {
    constructor() {
        super(fields);

        this.form = new Form(fields);
    }

    async save(type = null,key = null, approvee = null) {

        let data = {
            patient_id: this.patient_id,
            starting_on: this.starting_on,
            place: this.place,
            days: this.days,
        }

        if(approvee) {
            data[approvee] = this[approvee]
        }

        if(type) {
            data = {
                patient_id: this.patient_id,
                type: type,
                key: key,
            }
        }

        if(!this.patient_id) {
            flash({
                message: 'The patient is not set yet',
                alert: 'error'
            })
        } else {
            const response = await this.form.submit("post", route("api.evaluation.self-quarantine.store"), data);

            if (response) {
                flash(response);

                return response;
            }
        }
    }

    async approve(item) {
        const response = await this.form.submit("post", route("api.evaluation.self-quarantine.approve", item.id));

        if (response) {
            flash(response);

            return response;
        }
    }

    updateTotalScore () {
        let self = this;

        self.assessment.total_score = 0;

        Object.entries(self.assessment).forEach(val => {
            if(val[0] !== 'total_score' && val[0] !== 'lab_confirmations') {
                self.assessment.total_score += val[1].total_score;
            }
        })
    }

    assemble(val) {
        this.patient_id = val.patient_id;
        this.place = val.place;
        this.starting_on = val.start_date;
        this.days = val.days;
        this.as_health_worker = val.as_health_worker ? val.as_health_worker : this.as_health_worker;
        this.as_public_health_dir = val.as_public_health_dir ? val.as_public_health_dir : this.as_public_health_dir;
        this.assessment.accessibility = val.accessibility ?  val.accessibility : this.assessment.accessibility;
        this.assessment.infrastructure = val.infrastructure ? val.infrastructure : this.assessment.infrastructure;
        this.assessment.accommodation = val.accommodation ? val.accommodation : this.assessment.accommodation;
        this.assessment.resources = val.resources ? val.resources : this.assessment.resources;
        this.assessment.primary_care = val.primary_care ? val.primary_care : this.assessment.primary_care;
        this.assessment.lab_confirmations = val.lab_confirmations ? val.lab_confirmations : this.assessment.lab_confirmations;
        this.approvals = val.approvals ? val.approvals : this.assessment.approvals;



        setTimeout(this.updateTotalScore(), 1000);
    }


    /**
     * discharge patient from home based care
     */
    async dischargePatient (selfQuarantine_id, discharge_info) {

        if(!discharge_info.discharge_reason) {
            flash({
                message: 'Please provide a reason for discharge',
                alert: 'warning',
            })

            return null;
        }
        let response = await this.form.submit('post',
            route('api.evaluation.self-quarantine.discharge', selfQuarantine_id ), discharge_info
        );

        if(response) {
            flash(response);

            return response;
        }

    }
}
